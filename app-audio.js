(function(){
  'use strict';

  if(window.StregAudio && window.StregAudio.version) return;

  var SOUND_PATHS = {
    purchase:'SoundsForStreg/purchasing.mp3',
    navigation:'SoundsForStreg/Navigation sound.mp3',
    coin:'SoundsForStreg/Coin collect.mp3',
    levelUp:'SoundsForStreg/level up.mp3',
    challengeReward:'SoundsForStreg/collecting reward from challenges.mp3',
    startup:'SoundsForStreg/Startup App.mp3',
    ui:'SoundsForStreg/switch tab.mp3'
  };

  /* The uploaded files currently have a double .mp3 extension. The second
     path is kept as an automatic fallback in case they are renamed later. */
  var AMBIENT_PATHS = {
    nature:[
      'SoundsForStreg/nature-ambient.mp3.mp3',
      'SoundsForStreg/nature-ambient.mp3'
    ],
    fireplace:[
      'SoundsForStreg/fireplace.mp3.mp3',
      'SoundsForStreg/fireplace.mp3'
    ]
  };

  var VOLUME_DEFAULTS = {
    masterVolume:1,
    musicVolume:0.65,
    ambientVolume:0.65,
    effectsVolume:0.9
  };

  var AudioContextClass = window.AudioContext || window.webkitAudioContext;
  var context = null;
  var master = null;
  var buffers = Object.create(null);
  var loading = Object.create(null);
  var htmlFallbacks = Object.create(null);
  var activeSources = Object.create(null);
  var saveTimer = null;
  var synthLockUntil = 0;
  var startupPlayed = false;
  var startupQueued = true;
  var firstGestureHandled = false;
  var lastSpecificAt = 0;
  var lastPurchaseAt = 0;
  var coinSequenceUntil = 0;
  var coinSerial = 0;
  var volumeInputs = Object.create(null);
  var volumeRows = [];

  var ambience = {
    unlocked:false,
    duckUntil:0,
    nature:null,
    fireplace:null,
    targetNature:0,
    targetFireplace:0,
    sourceIndex:{nature:0,fireplace:0},
    errorShown:Object.create(null)
  };

  function clamp(value,min,max){
    value = Number(value);
    if(!Number.isFinite(value)) return min;
    return Math.max(min,Math.min(max,value));
  }

  function getState(){
    try{
      if(typeof S !== 'undefined' && S) return S;
    }catch(error){}
    return null;
  }

  function getLanguage(){
    try{
      if(window.I18n && typeof window.I18n.getLanguage === 'function'){
        return window.I18n.getLanguage() === 'en' ? 'en' : 'da';
      }
    }catch(error){}
    return document.documentElement.lang === 'en' ? 'en' : 'da';
  }

  function ensureVolumeSettings(){
    var state = getState();
    if(!state) return VOLUME_DEFAULTS;
    if(!state.settings) state.settings = {};
    Object.keys(VOLUME_DEFAULTS).forEach(function(key){
      if(!Number.isFinite(Number(state.settings[key]))){
        state.settings[key] = VOLUME_DEFAULTS[key];
      }
      state.settings[key] = clamp(state.settings[key],0,1);
    });
    return state.settings;
  }

  function getVolume(key){
    var settings = ensureVolumeSettings();
    return clamp(settings[key],0,1);
  }

  function getVolumes(){
    return {
      master:getVolume('masterVolume'),
      music:getVolume('musicVolume'),
      ambience:getVolume('ambientVolume'),
      effects:getVolume('effectsVolume')
    };
  }

  function persistNow(){
    clearTimeout(saveTimer);
    saveTimer = null;
    var state = getState();
    try{
      if(typeof save === 'function'){
        save();
        return;
      }
    }catch(error){}
    try{
      if(state) localStorage.setItem('streg_v3',JSON.stringify(state));
    }catch(error){}
  }

  function persistSoon(){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persistNow,180);
  }

  function enabled(){
    var state = getState();
    if(state && state.settings && state.settings.sound === false) return false;
    if(state && state.sound === false) return false;
    if(document.documentElement.dataset.sound === 'off') return false;
    return true;
  }

  function todayDone(){
    try{
      if(typeof dailyDone === 'function') return !!dailyDone();
    }catch(error){}

    var state = getState();
    if(!state) return false;
    var now = new Date();
    var today = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2,'0') + '-' +
      String(now.getDate()).padStart(2,'0');
    return state.lastDay === today;
  }

  function homeVisible(){
    var home = document.getElementById('tab-home');
    if(!home) return false;
    if(home.classList.contains('active') || home.classList.contains('visible')) return true;
    if(home.getAttribute('aria-hidden') === 'false') return true;
    try{
      var style = getComputedStyle(home);
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0;
    }catch(error){
      return false;
    }
  }

  function applyMasterVolume(){
    if(!master || !context) return;
    var value = enabled() ? getVolume('masterVolume') : 0;
    try{
      master.gain.setTargetAtTime(value,context.currentTime,0.025);
    }catch(error){
      master.gain.value = value;
    }
  }

  function boot(){
    if(!AudioContextClass) return null;
    if(!context){
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = enabled() ? getVolume('masterVolume') : 0;
      master.connect(context.destination);
    }
    if(context.state === 'suspended'){
      try{ context.resume(); }catch(error){}
    }
    applyMasterVolume();
    return context;
  }

  function soundUrl(name){
    return new URL(SOUND_PATHS[name],document.baseURI).href;
  }

  function ambientUrl(name,index){
    return new URL(AMBIENT_PATHS[name][index || 0],document.baseURI).href;
  }

  function load(name){
    if(buffers[name]) return Promise.resolve(buffers[name]);
    if(loading[name]) return loading[name];
    if(!AudioContextClass) return Promise.resolve(null);

    var ctx = boot();
    if(!ctx) return Promise.resolve(null);

    loading[name] = fetch(soundUrl(name),{cache:'force-cache'})
      .then(function(response){
        if(!response.ok) throw new Error('Audio ' + response.status + ': ' + name);
        return response.arrayBuffer();
      })
      .then(function(bytes){ return ctx.decodeAudioData(bytes.slice(0)); })
      .then(function(buffer){
        buffers[name] = buffer;
        delete loading[name];
        return buffer;
      })
      .catch(function(error){
        delete loading[name];
        console.warn('STREG audio could not load',name,error);
        return null;
      });

    return loading[name];
  }

  function fallbackPlay(name,options){
    options = options || {};
    try{
      var audio = new Audio(soundUrl(name));
      var volumes = getVolumes();
      audio.preload = 'auto';
      audio.volume = clamp((options.volume == null ? 1 : options.volume) * volumes.effects * volumes.master,0,1);
      audio.playbackRate = options.rate || 1;
      audio.loop = !!options.loop;
      htmlFallbacks[name] = audio;
      var promise = audio.play();
      if(promise && promise.catch) promise.catch(function(){});
      return {
        stop:function(){
          try{ audio.pause(); audio.currentTime = 0; }catch(error){}
        }
      };
    }catch(error){
      return null;
    }
  }

  function stop(name){
    var list = activeSources[name] || [];
    list.slice().forEach(function(source){
      try{ source.stop(); }catch(error){}
    });
    activeSources[name] = [];
    if(htmlFallbacks[name]){
      try{ htmlFallbacks[name].pause(); htmlFallbacks[name].currentTime = 0; }catch(error){}
      delete htmlFallbacks[name];
    }
  }

  function play(name,options){
    options = options || {};
    if(!enabled() && !options.force) return Promise.resolve(null);

    var ctx = boot();
    if(!ctx) return Promise.resolve(fallbackPlay(name,options));

    return load(name).then(function(buffer){
      if(!buffer) return fallbackPlay(name,options);
      if(options.restart) stop(name);

      var source = ctx.createBufferSource();
      var gain = ctx.createGain();
      source.buffer = buffer;
      source.playbackRate.value = options.rate || 1;
      source.loop = !!options.loop;
      gain.gain.value = clamp((options.volume == null ? 1 : options.volume) * getVolume('effectsVolume'),0,1);
      source.connect(gain);
      gain.connect(master);

      if(!activeSources[name]) activeSources[name] = [];
      activeSources[name].push(source);
      source.onended = function(){
        var list = activeSources[name];
        if(!list) return;
        var index = list.indexOf(source);
        if(index !== -1) list.splice(index,1);
      };
      source.start(0,options.offset || 0);
      return source;
    });
  }

  function setAmbientSource(name,index){
    var audio = ambience[name];
    if(!audio) return;
    ambience.sourceIndex[name] = index;
    audio.src = ambientUrl(name,index);
    try{ audio.load(); }catch(error){}
  }

  function makeAmbient(name){
    if(ambience[name]) return ambience[name];

    var audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.playsInline = true;
    audio.volume = 0;
    ambience[name] = audio;
    setAmbientSource(name,0);

    audio.addEventListener('error',function(){
      var nextIndex = ambience.sourceIndex[name] + 1;
      if(nextIndex < AMBIENT_PATHS[name].length){
        setAmbientSource(name,nextIndex);
        if(ambience.unlocked) safelyPlayAmbient(audio);
        return;
      }
      if(ambience.errorShown[name]) return;
      ambience.errorShown[name] = true;
      console.warn('STREG ambience could not load',AMBIENT_PATHS[name]);
    });

    return audio;
  }

  function safelyPlayAmbient(audio){
    if(!audio || !audio.paused) return;
    try{
      var promise = audio.play();
      if(promise && promise.catch) promise.catch(function(){});
    }catch(error){}
  }

  function duckAmbience(ms){
    ambience.duckUntil = Math.max(ambience.duckUntil,Date.now() + (ms || 700));
    updateAmbienceTargets();
  }

  function updateAmbienceTargets(){
    var canPlay = ambience.unlocked && enabled() && !document.hidden;
    if(!canPlay){
      ambience.targetNature = 0;
      ambience.targetFireplace = 0;
      return;
    }

    var volumes = getVolumes();
    var fireActive = homeVisible() && todayDone();
    var duck = Date.now() < ambience.duckUntil ? 0.35 : 1;

    /* The files themselves are already quiet, so the sliders now control a
       useful audible range instead of being limited to the old 3–6%. */
    ambience.targetNature = clamp(volumes.master * volumes.music * (fireActive ? 0.58 : 0.9) * duck,0,1);
    ambience.targetFireplace = clamp(volumes.master * volumes.ambience * (fireActive ? 1 : 0) * duck,0,1);

    if(ambience.targetNature > 0) safelyPlayAmbient(makeAmbient('nature'));
    if(ambience.targetFireplace > 0) safelyPlayAmbient(makeAmbient('fireplace'));
  }

  function fadeAmbientStep(name,target){
    var audio = ambience[name];
    if(!audio){
      if(target > 0) audio = makeAmbient(name);
      else return;
    }

    var current = Number(audio.volume) || 0;
    var next = current + (target - current) * 0.15;
    if(Math.abs(target - next) < 0.001) next = target;
    audio.volume = clamp(next,0,1);

    if(target > 0){
      safelyPlayAmbient(audio);
    }else if(audio.volume < 0.0015 && !audio.paused){
      try{ audio.pause(); }catch(error){}
    }
  }

  function syncMutedRows(){
    var muted = !enabled();
    volumeRows.forEach(function(row){ row.classList.toggle('is-sound-muted',muted); });
  }

  function ambienceTick(){
    applyMasterVolume();
    updateAmbienceTargets();
    fadeAmbientStep('nature',ambience.targetNature);
    fadeAmbientStep('fireplace',ambience.targetFireplace);
    syncMutedRows();
  }

  function unlockAmbience(){
    ambience.unlocked = true;
    makeAmbient('nature');
    makeAmbient('fireplace');
    updateAmbienceTargets();
    ambienceTick();
  }

  function lockSynth(ms){
    synthLockUntil = Math.max(synthLockUntil,Date.now() + (ms || 220));
  }

  function synthLocked(){ return Date.now() < synthLockUntil; }

  function playSpecific(name,options,lockMs){
    lastSpecificAt = Date.now();
    lockSynth(lockMs || 260);
    duckAmbience((lockMs || 260) + 350);
    return play(name,options);
  }

  function playCoin(rate,volume){
    coinSerial += 1;
    var naturalStep = (coinSerial % 6) * 0.025;
    var jitter = (Math.random() - 0.5) * 0.022;
    return play('coin',{
      rate:rate || (0.94 + naturalStep + jitter),
      volume:volume == null ? 0.72 : volume
    });
  }

  function scheduleCoinFlight(opts){
    if(!opts || opts.icon !== 'coin') return;
    var count = Math.max(1,Number(opts.count) || 5);
    var baseDelay = Number(opts.delay) || 0;
    var now = Date.now();
    var finalAt = baseDelay + (count - 1) * 55 + 820 + (count - 1) * 18;
    coinSequenceUntil = Math.max(coinSequenceUntil,now + finalAt + 180);

    for(var i=0;i<count;i++){
      (function(index){
        var arriveAt = baseDelay + index * 55 + 820 + index * 18;
        setTimeout(function(){
          playCoin(0.93 + index * 0.035 + (Math.random() - 0.5) * 0.018,0.58 + index * 0.025);
        },arriveAt);
      })(i);
    }
  }

  function wrapRewardFlight(){
    try{
      if(typeof RewardFlight === 'undefined' || !RewardFlight || typeof RewardFlight.fly !== 'function') return;
      if(RewardFlight.fly.__stregFileAudio) return;
      var original = RewardFlight.fly;
      var wrapped = function(opts){
        scheduleCoinFlight(opts);
        return original.apply(this,arguments);
      };
      wrapped.__stregFileAudio = true;
      RewardFlight.fly = wrapped;
    }catch(error){}
  }

  function wrapSfx(){
    try{
      if(typeof SFX === 'undefined' || !SFX || SFX.__stregFileAudio) return;
      Object.keys(SFX).forEach(function(key){
        if(key === 'unlock' || typeof SFX[key] !== 'function') return;
        var original = SFX[key];
        SFX[key] = function(){
          if(synthLocked()) return;
          return original.apply(SFX,arguments);
        };
      });

      SFX.coin = function(){
        if(Date.now() <= coinSequenceUntil) return;
        playCoin();
      };
      SFX.coins = function(n){
        var count = Math.max(1,Number(n) || 3);
        for(var i=0;i<count;i++){
          (function(index){
            setTimeout(function(){ playCoin(0.94 + index * 0.04,0.65); },index * 70);
          })(i);
        }
      };
      SFX.levelup = function(){
        playSpecific('levelUp',{restart:true,volume:0.92},900);
      };
      SFX.whoosh = function(){};
      SFX.__stregFileAudio = true;
    }catch(error){}
  }

  function playPurchase(){
    if(Date.now() - lastPurchaseAt < 500) return;
    lastPurchaseAt = Date.now();
    playSpecific('purchase',{restart:true,volume:0.92},3900);
  }

  function wrapPurchaseFunction(name){
    var original = window[name];
    if(typeof original !== 'function' || original.__stregFileAudio) return;
    var wrapped = function(){
      playPurchase();
      return original.apply(this,arguments);
    };
    wrapped.__stregFileAudio = true;
    window[name] = wrapped;
  }

  function watchPurchaseCutscene(){
    var overlay = document.querySelector('.purchase-cutscene');
    if(!overlay) return;
    var wasActive = overlay.classList.contains('active');
    new MutationObserver(function(){
      var active = overlay.classList.contains('active') && overlay.getAttribute('aria-hidden') !== 'true';
      if(active && !wasActive) playPurchase();
      if(!active && wasActive) stop('purchase');
      wasActive = active;
    }).observe(overlay,{attributes:true,attributeFilter:['class','aria-hidden']});
  }

  function isDisabled(element){
    return !element || element.disabled || element.getAttribute('aria-disabled') === 'true';
  }

  function isChallengeClaim(element){
    return !!element.closest('.reward-claim-btn.ready,.event-daily-action.claim,.event-reward-btn.claim,[data-action="claim-reward"],[data-claim-reward]');
  }

  function isPurchaseAction(element){
    return !!element.closest('.shop-btn.buy,#shopBuyFreeze,.fragment-exclusive-card .shop-btn.buy,[data-buy],[data-purchase]');
  }

  function isOwnSoundAction(element){
    return !!element.closest(
      '#setSound,#captureBtn,.btn-test-photo,#testPhotoBtn,.capture-actions,' +
      '.purchase-cutscene,.challenge-reward-cutscene,.event-claim-cutscene,' +
      '.chest-cutscene,.sm-overlay,.photo-success-cutscene,' +
      '[data-streak-test],[data-sound-specific]'
    );
  }

  function classifyNavigation(element){
    if(element.closest('.tabbtn[data-tab]')) return 'tab';
    if(element.closest('.see-all,[data-goto],#featuredChallengeCard,.featured-challenge,.streak-journey-link')) return 'navigation';
    return '';
  }

  function handleUiClick(event){
    var target = event.target && event.target.closest
      ? event.target.closest('button,[role="button"],a[href],.featured-challenge,#featuredChallengeCard')
      : null;
    if(!target || isDisabled(target)) return;

    unlockAmbience();

    if(!firstGestureHandled){
      firstGestureHandled = true;
      unlockAndMaybeStartup(true);
      lockSynth(500);
      return;
    }

    boot();

    if(isChallengeClaim(target)){
      playSpecific('challengeReward',{restart:true,volume:0.9},1050);
      return;
    }

    if(isPurchaseAction(target)){
      lockSynth(700);
      return;
    }

    var navigationKind = classifyNavigation(target);
    if(navigationKind === 'tab'){
      playSpecific('ui',{volume:0.72},420);
      setTimeout(updateAmbienceTargets,180);
      return;
    }
    if(navigationKind === 'navigation'){
      playSpecific('navigation',{volume:0.78},500);
      setTimeout(updateAmbienceTargets,180);
      return;
    }

    if(isOwnSoundAction(target)) return;
    if(Date.now() - lastSpecificAt < 90) return;

    playSpecific('ui',{volume:0.58,rate:0.98 + Math.random() * 0.035},210);
  }

  function tryStartup(){
    if(startupPlayed || !enabled()) return Promise.resolve(false);
    startupQueued = false;
    duckAmbience(1900);
    return play('startup',{restart:true,volume:0.88}).then(function(source){
      if(source){
        startupPlayed = true;
        return true;
      }
      startupQueued = true;
      return false;
    });
  }

  function unlockAndMaybeStartup(fromGesture){
    boot();
    unlockAmbience();
    if(startupPlayed) return;
    if(fromGesture || startupQueued) tryStartup();
  }

  function preload(){
    Object.keys(SOUND_PATHS).forEach(function(name){ load(name); });
  }

  function setVolume(key,value,saveChange){
    if(!Object.prototype.hasOwnProperty.call(VOLUME_DEFAULTS,key)) return;
    var state = getState();
    if(state){
      if(!state.settings) state.settings = {};
      state.settings[key] = clamp(value,0,1);
    }
    applyMasterVolume();
    updateAmbienceTargets();
    syncVolumeControls();
    if(saveChange !== false) persistSoon();
  }

  function injectVolumeStyles(){
    if(document.getElementById('stregAudioVolumeStyles')) return;
    var style = document.createElement('style');
    style.id = 'stregAudioVolumeStyles';
    style.textContent = [
      '.streg-audio-volume-row{display:block!important;padding:12px 14px 13px!important;transition:opacity .2s ease;}',
      '.streg-audio-volume-row.is-sound-muted{opacity:.55;}',
      '.streg-audio-volume-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;}',
      '.streg-audio-volume-copy{display:flex;min-width:0;flex-direction:column;gap:2px;}',
      '.streg-audio-volume-title{font-size:13.5px;font-weight:700;}',
      '.streg-audio-volume-sub{color:var(--ink-soft);font-size:10.5px;font-weight:400;line-height:1.35;}',
      '.streg-audio-volume-value{min-width:40px;color:var(--ink);font-size:12px;font-variant-numeric:tabular-nums;font-weight:800;text-align:right;}',
      '.streg-audio-volume-range{display:block;width:100%;height:22px;margin:0;accent-color:var(--amber);cursor:pointer;}',
      '.streg-audio-volume-range:focus-visible{outline:2px solid var(--amber);outline-offset:3px;border-radius:999px;}'
    ].join('');
    document.head.appendChild(style);
  }

  var SETTINGS_COPY = {
    da:{
      masterVolume:['Hovedlydstyrke','Styrer al lyd i appen'],
      musicVolume:['Musik','Naturmusikken i baggrunden'],
      ambientVolume:['Atmosfære','Pejs og miljølyde på forsiden'],
      effectsVolume:['Lydeffekter','Knapper, mønter, rewards og cutscenes']
    },
    en:{
      masterVolume:['Master volume','Controls every sound in the app'],
      musicVolume:['Music','Nature music in the background'],
      ambientVolume:['Atmosphere','Fireplace and environmental audio on Home'],
      effectsVolume:['Sound effects','Buttons, coins, rewards, and cutscenes']
    }
  };

  function createVolumeRow(key){
    var row = document.createElement('div');
    row.className = 'set-row streg-audio-volume-row';
    row.dataset.audioVolumeRow = key;

    var head = document.createElement('div');
    head.className = 'streg-audio-volume-head';

    var copy = document.createElement('div');
    copy.className = 'streg-audio-volume-copy';

    var title = document.createElement('span');
    title.className = 'streg-audio-volume-title';
    title.dataset.audioVolumeTitle = key;

    var sub = document.createElement('span');
    sub.className = 'streg-audio-volume-sub';
    sub.dataset.audioVolumeSub = key;

    var value = document.createElement('span');
    value.className = 'streg-audio-volume-value';
    value.dataset.audioVolumeValue = key;

    var input = document.createElement('input');
    input.className = 'streg-audio-volume-range';
    input.type = 'range';
    input.min = '0';
    input.max = '100';
    input.step = '1';
    input.dataset.audioVolumeInput = key;

    copy.appendChild(title);
    copy.appendChild(sub);
    head.appendChild(copy);
    head.appendChild(value);
    row.appendChild(head);
    row.appendChild(input);

    input.addEventListener('input',function(){
      setVolume(key,Number(input.value) / 100,true);
    });
    input.addEventListener('change',function(){
      persistNow();
      if(key === 'effectsVolume' && enabled() && Number(input.value) > 0){
        playSpecific('ui',{volume:0.7},220);
      }
    });

    volumeInputs[key] = input;
    volumeRows.push(row);
    return row;
  }

  function updateVolumeLanguage(){
    var language = getLanguage();
    var dictionary = SETTINGS_COPY[language];
    Object.keys(VOLUME_DEFAULTS).forEach(function(key){
      var title = document.querySelector('[data-audio-volume-title="' + key + '"]');
      var sub = document.querySelector('[data-audio-volume-sub="' + key + '"]');
      var input = volumeInputs[key];
      if(title) title.textContent = dictionary[key][0];
      if(sub) sub.textContent = dictionary[key][1];
      if(input) input.setAttribute('aria-label',dictionary[key][0]);
    });
  }

  function syncVolumeControls(){
    Object.keys(VOLUME_DEFAULTS).forEach(function(key){
      var input = volumeInputs[key];
      var value = Math.round(getVolume(key) * 100);
      if(input && document.activeElement !== input) input.value = String(value);
      var valueLabel = document.querySelector('[data-audio-volume-value="' + key + '"]');
      if(valueLabel) valueLabel.textContent = value + '%';
    });
    syncMutedRows();
  }

  function installSettingsControls(){
    if(document.querySelector('[data-audio-volume-row]')){
      syncVolumeControls();
      updateVolumeLanguage();
      return true;
    }

    var soundToggle = document.getElementById('setSound');
    if(!soundToggle) return false;
    var anchor = soundToggle.closest('.set-row');
    if(!anchor || !anchor.parentNode) return false;

    injectVolumeStyles();
    ['masterVolume','musicVolume','ambientVolume','effectsVolume'].forEach(function(key){
      var row = createVolumeRow(key);
      anchor.parentNode.insertBefore(row,anchor.nextSibling);
      anchor = row;
    });

    updateVolumeLanguage();
    syncVolumeControls();
    return true;
  }

  function install(){
    ensureVolumeSettings();
    installSettingsControls();
    wrapSfx();
    wrapRewardFlight();
    wrapPurchaseFunction('purchaseCutscene');
    wrapPurchaseFunction('blackHolePreviewCutscene');
    watchPurchaseCutscene();

    document.addEventListener('click',handleUiClick,true);
    document.addEventListener('pointerdown',function(){
      boot();
      unlockAmbience();
    },{capture:true,passive:true});
    document.addEventListener('keydown',function(event){
      if(event.key === 'Enter' || event.key === ' '){
        unlockAmbience();
        if(!firstGestureHandled){
          firstGestureHandled = true;
          unlockAndMaybeStartup(true);
        }else boot();
      }
    },true);

    document.addEventListener('visibilitychange',function(){
      updateAmbienceTargets();
      ambienceTick();
    });
    window.addEventListener('streg:startup-complete',function(){
      installSettingsControls();
      updateAmbienceTargets();
      ambienceTick();
    });
    window.addEventListener('streg:languagechange',function(){
      updateVolumeLanguage();
      updateAmbienceTargets();
    });

    preload();
    setInterval(ambienceTick,90);
    setInterval(function(){
      installSettingsControls();
      syncVolumeControls();
    },1000);

    setTimeout(function(){
      wrapSfx();
      wrapRewardFlight();
      wrapPurchaseFunction('purchaseCutscene');
      wrapPurchaseFunction('blackHolePreviewCutscene');
      installSettingsControls();
      updateAmbienceTargets();
    },900);
  }

  window.StregAudio = {
    version:'2.0.0',
    play:play,
    stop:stop,
    coin:playCoin,
    enabled:enabled,
    preload:preload,
    setVolume:setVolume,
    getVolumes:getVolumes,
    updateAmbience:updateAmbienceTargets,
    unlock:function(){ unlockAndMaybeStartup(true); }
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
})();
