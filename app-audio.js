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

  var AudioContextClass = window.AudioContext || window.webkitAudioContext;
  var context = null;
  var master = null;
  var buffers = Object.create(null);
  var loading = Object.create(null);
  var htmlFallbacks = Object.create(null);
  var activeSources = Object.create(null);
  var synthLockUntil = 0;
  var startupPlayed = false;
  var startupQueued = false;
  var firstGestureHandled = false;
  var lastSpecificAt = 0;
  var lastPurchaseAt = 0;
  var coinSequenceUntil = 0;
  var coinSerial = 0;

  function getState(){
    try{
      if(typeof S !== 'undefined' && S) return S;
    }catch(error){}
    return null;
  }

  function enabled(){
    var state = getState();
    if(state && state.settings && state.settings.sound === false) return false;
    if(state && state.sound === false) return false;
    if(document.documentElement.dataset.sound === 'off') return false;
    return true;
  }

  function boot(){
    if(!AudioContextClass) return null;
    if(!context){
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = 0.88;
      master.connect(context.destination);
    }
    if(context.state === 'suspended'){
      try{ context.resume(); }catch(error){}
    }
    return context;
  }

  function soundUrl(name){
    return new URL(SOUND_PATHS[name],document.baseURI).href;
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
      audio.preload = 'auto';
      audio.volume = options.volume == null ? 1 : options.volume;
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
      gain.gain.value = options.volume == null ? 1 : options.volume;
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

  function lockSynth(ms){
    synthLockUntil = Math.max(synthLockUntil,Date.now() + (ms || 220));
  }

  function synthLocked(){ return Date.now() < synthLockUntil; }

  function playSpecific(name,options,lockMs){
    lastSpecificAt = Date.now();
    lockSynth(lockMs || 260);
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
      '#captureBtn,.btn-test-photo,#testPhotoBtn,.capture-actions,' +
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

    if(!firstGestureHandled){
      firstGestureHandled = true;
      unlockAndMaybeStartup(true);
      if(startupPlayed){
        lockSynth(350);
        return;
      }
    }else{
      boot();
    }

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
      return;
    }
    if(navigationKind === 'navigation'){
      playSpecific('navigation',{volume:0.78},500);
      return;
    }

    if(isOwnSoundAction(target)) return;
    if(Date.now() - lastSpecificAt < 90) return;

    playSpecific('ui',{volume:0.58,rate:0.98 + Math.random() * 0.035},210);
  }

  function tryStartup(){
    if(startupPlayed || !enabled()) return Promise.resolve(false);
    startupQueued = true;
    return play('startup',{restart:true,volume:0.88}).then(function(source){
      if(source){
        startupPlayed = true;
        startupQueued = false;
        try{ sessionStorage.setItem('streg-startup-audio-played','1'); }catch(error){}
        return true;
      }
      return false;
    });
  }

  function unlockAndMaybeStartup(fromGesture){
    boot();
    if(startupPlayed) return;
    if(fromGesture || startupQueued) tryStartup();
  }

  function preload(){
    Object.keys(SOUND_PATHS).forEach(function(name){ load(name); });
  }

  function install(){
    wrapSfx();
    wrapRewardFlight();
    wrapPurchaseFunction('purchaseCutscene');
    wrapPurchaseFunction('blackHolePreviewCutscene');
    watchPurchaseCutscene();

    document.addEventListener('click',handleUiClick,true);
    document.addEventListener('pointerdown',function(){ boot(); },{capture:true,passive:true});
    document.addEventListener('keydown',function(event){
      if(event.key === 'Enter' || event.key === ' '){
        if(!firstGestureHandled){
          firstGestureHandled = true;
          unlockAndMaybeStartup(true);
        }else boot();
      }
    },true);

    preload();
    setTimeout(function(){
      startupQueued = true;
      tryStartup();
    },120);

    setTimeout(function(){
      wrapSfx();
      wrapRewardFlight();
      wrapPurchaseFunction('purchaseCutscene');
      wrapPurchaseFunction('blackHolePreviewCutscene');
    },900);
  }

  window.StregAudio = {
    version:'1.0.0',
    play:play,
    stop:stop,
    coin:playCoin,
    enabled:enabled,
    preload:preload,
    unlock:function(){ unlockAndMaybeStartup(true); }
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
})();
