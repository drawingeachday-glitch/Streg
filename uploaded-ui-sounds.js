(function(){
  'use strict';

  if(window.StregUploadedSounds && window.StregUploadedSounds.version) return;

  var FILES = {
    levelUp:'SoundsForStreg/level up.mp3?v=bbbbf24f',
    xp:'SoundsForStreg/xp.mp3?v=847f950b',
    shop:'SoundsForStreg/shop sound.mp3?v=f7e407d1',
    journey:'SoundsForStreg/journey sound.mp3?v=c9a821f9',
    challenges:'SoundsForStreg/challenge sound.mp3?v=284ec013'
  };

  var SPECIAL_TABS = {
    'tab-shop':'shop',
    'tab-journey':'journey',
    'tab-challenges':'challenges'
  };

  var AudioContextClass = window.AudioContext || window.webkitAudioContext;
  var context = null;
  var buffers = Object.create(null);
  var loading = Object.create(null);
  var active = Object.create(null);
  var xpSerial = 0;
  var lastXpBundleAt = 0;
  var xpObserver = null;
  var boundLevelHost = null;
  var levelObserver = null;
  var lastLevelBoom = false;
  var lastLevelSoundAt = 0;

  function clamp(value,min,max){
    value = Number(value);
    if(!Number.isFinite(value)) return min;
    return Math.max(min,Math.min(max,value));
  }

  function state(){
    try{ return typeof S !== 'undefined' && S ? S : null; }catch(error){ return null; }
  }

  function enabled(){
    try{
      if(window.StregAudio && typeof window.StregAudio.enabled === 'function'){
        return !!window.StregAudio.enabled();
      }
    }catch(error){}
    var app = state();
    return !(app && app.settings && app.settings.sound === false);
  }

  function volumes(){
    try{
      if(window.StregAudio && typeof window.StregAudio.getVolumes === 'function'){
        return window.StregAudio.getVolumes();
      }
    }catch(error){}
    var app = state();
    var settings = app && app.settings ? app.settings : {};
    return {
      master:Number.isFinite(Number(settings.masterVolume)) ? clamp(settings.masterVolume,0,1) : 1,
      effects:Number.isFinite(Number(settings.effectsVolume)) ? clamp(settings.effectsVolume,0,1) : .9
    };
  }

  function boot(){
    if(!AudioContextClass) return null;
    if(!context) context = new AudioContextClass();
    if(context.state === 'suspended'){
      try{ context.resume(); }catch(error){}
    }
    return context;
  }

  function url(name){
    return new URL(FILES[name],document.baseURI).href;
  }

  function load(name){
    if(buffers[name]) return Promise.resolve(buffers[name]);
    if(loading[name]) return loading[name];
    var ctx = boot();
    if(!ctx) return Promise.resolve(null);

    loading[name] = fetch(url(name),{cache:'no-store'})
      .then(function(response){
        if(!response.ok) throw new Error('Uploaded sound ' + response.status + ': ' + name);
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
        console.warn('STREG uploaded sound could not load',name,error);
        return null;
      });
    return loading[name];
  }

  function stop(name){
    var list = active[name] || [];
    list.slice().forEach(function(source){
      try{ source.stop(); }catch(error){}
    });
    active[name] = [];
  }

  function play(name,options){
    options = options || {};
    if(!enabled()) return Promise.resolve(null);
    var ctx = boot();
    if(!ctx) return Promise.resolve(null);

    return load(name).then(function(buffer){
      if(!buffer) return null;
      if(options.restart) stop(name);

      var source = ctx.createBufferSource();
      var gain = ctx.createGain();
      var mix = volumes();
      source.buffer = buffer;
      source.playbackRate.value = clamp(options.rate == null ? 1 : options.rate,.55,1.7);
      gain.gain.value = clamp((options.volume == null ? 1 : options.volume) * (mix.master == null ? 1 : mix.master) * (mix.effects == null ? .9 : mix.effects),0,1);
      source.connect(gain);
      gain.connect(ctx.destination);

      if(!active[name]) active[name] = [];
      active[name].push(source);
      source.onended = function(){
        var list = active[name];
        if(!list) return;
        var index = list.indexOf(source);
        if(index !== -1) list.splice(index,1);
      };
      source.start(0);
      return source;
    });
  }

  function stopGenericTabSound(){
    try{
      if(window.StregAudio && typeof window.StregAudio.stop === 'function'){
        window.StregAudio.stop('ui');
      }
    }catch(error){}
  }

  function replaceGenericTabSound(name){
    Promise.resolve().then(function(){
      stopGenericTabSound();
      play(name,{restart:true,volume:.9});
    });
    setTimeout(stopGenericTabSound,55);
    setTimeout(stopGenericTabSound,150);
  }

  function onSpecialTab(event){
    var button = event.currentTarget;
    if(!button || button.classList.contains('active')) return;
    var name = SPECIAL_TABS[button.getAttribute('data-tab')];
    if(!name) return;
    replaceGenericTabSound(name);
  }

  function bindTabButtons(){
    Object.keys(SPECIAL_TABS).forEach(function(tabId){
      var button = document.querySelector('.tabbtn[data-tab="' + tabId + '"]');
      if(!button || button.dataset.uploadedSoundBound === 'true') return;
      button.dataset.uploadedSoundBound = 'true';
      button.addEventListener('click',onSpecialTab,true);
    });
  }

  function nextXpPitch(){
    var now = Date.now();
    if(now - lastXpBundleAt > 850) xpSerial = 0;
    lastXpBundleAt = now;
    var step = xpSerial % 7;
    xpSerial += 1;
    return .86 + step * .055 + (Math.random()-.5)*.016;
  }

  function playXpBundle(){
    var step = Math.max(0,Math.min(6,(xpSerial % 7)));
    play('xp',{
      rate:nextXpPitch(),
      volume:.43 + step*.025
    });
  }

  function scheduleXpBundle(node){
    if(!node || node.nodeType !== 1 || node.dataset.uploadedXpSound === 'true') return;
    node.dataset.uploadedXpSound = 'true';

    requestAnimationFrame(function(){
      var total = 620;
      try{
        var animations = node.getAnimations ? node.getAnimations() : [];
        animations.forEach(function(animation){
          if(!animation.effect || !animation.effect.getTiming) return;
          var timing = animation.effect.getTiming();
          var delay = Number(timing.delay) || 0;
          var duration = Number(timing.duration) || 0;
          total = Math.max(total,delay + duration);
        });
      }catch(error){}
      setTimeout(playXpBundle,Math.max(80,total-95));
    });
  }

  function inspectAddedNode(node){
    if(!node || node.nodeType !== 1) return;
    if(node.matches && node.matches('.streg-xp-bundle')) scheduleXpBundle(node);
    if(node.querySelectorAll){
      node.querySelectorAll('.streg-xp-bundle').forEach(scheduleXpBundle);
    }
  }

  function watchXpBundles(){
    if(xpObserver || !document.body) return;
    xpObserver = new MutationObserver(function(records){
      records.forEach(function(record){
        Array.prototype.forEach.call(record.addedNodes,inspectAddedNode);
      });
    });
    xpObserver.observe(document.body,{childList:true,subtree:true});
  }

  function silenceLegacyLevelTrigger(){
    try{
      if(typeof SFX === 'undefined' || !SFX || typeof SFX.levelup !== 'function') return false;
      if(SFX.levelup.__stregUploadedLevelSilence) return true;
      var silent = function(){};
      silent.__stregUploadedLevelSilence = true;
      SFX.levelup = silent;
      return true;
    }catch(error){ return false; }
  }

  function playLevelUp(){
    var now = Date.now();
    if(now - lastLevelSoundAt < 850) return;
    lastLevelSoundAt = now;
    play('levelUp',{restart:true,volume:.98});
  }

  function watchLevelExplosion(){
    var host = document.getElementById('homeStatLevelWrap');
    if(!host || host === boundLevelHost) return;
    if(levelObserver) levelObserver.disconnect();
    boundLevelHost = host;
    lastLevelBoom = host.classList.contains('streg-level-boom');
    levelObserver = new MutationObserver(function(){
      var booming = host.classList.contains('streg-level-boom');
      if(booming && !lastLevelBoom) playLevelUp();
      lastLevelBoom = booming;
    });
    levelObserver.observe(host,{attributes:true,attributeFilter:['class']});
  }

  function preload(){
    Object.keys(FILES).forEach(function(name){ load(name); });
  }

  function unlock(){ boot(); }

  function install(){
    bindTabButtons();
    watchXpBundles();
    silenceLegacyLevelTrigger();
    watchLevelExplosion();
  }

  function settleInstall(){
    install();
    /* app-audio has one delayed SFX setup pass of its own. Re-assert the
       intentional level-up silence a couple of times during startup only,
       rather than polling the whole app forever. */
    setTimeout(install,320);
    setTimeout(install,1050);
    setTimeout(install,1750);
  }

  window.StregUploadedSounds = {
    version:'1.2.0',
    play:play,
    stop:stop,
    xp:playXpBundle,
    levelUp:playLevelUp,
    shop:function(){ play('shop',{restart:true,volume:.9}); },
    journey:function(){ play('journey',{restart:true,volume:.9}); },
    challenges:function(){ play('challenges',{restart:true,volume:.9}); },
    unlock:unlock,
    preload:preload
  };

  document.addEventListener('pointerdown',unlock,{capture:true,passive:true});
  window.addEventListener('streg:startup-complete',settleInstall);

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',function(){ settleInstall(); preload(); },{once:true});
  }else{
    settleInstall();
    preload();
  }
})();
