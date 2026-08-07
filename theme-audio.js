(function(){
  'use strict';

  if(window.__stregThemeAudioInstalled) return;
  window.__stregThemeAudioInstalled = true;

  var SPACE_PATH = 'SoundsForStreg/space-song.mp3?v=20260807-3';
  var MAP_PATH = 'SoundsForStreg/map-switch.mp3?v=20260807-3';

  var NativeAudio = window.Audio;
  var trackedAudio = [];
  var spaceAudio = null;
  var mapAudio = null;
  var spacePrimed = false;
  var lastMapSoundAt = 0;

  function clamp(value,min,max){
    value = Number(value);
    if(!Number.isFinite(value)) return min;
    return Math.max(min,Math.min(max,value));
  }

  function state(){
    try{ return typeof S !== 'undefined' && S ? S : null; }catch(error){ return null; }
  }

  function soundEnabled(){
    var app = state();
    if(app && app.settings && app.settings.sound === false) return false;
    if(app && app.sound === false) return false;
    return document.documentElement.dataset.sound !== 'off';
  }

  function volumes(){
    try{
      if(window.StregAudio && typeof window.StregAudio.getVolumes === 'function'){
        return window.StregAudio.getVolumes();
      }
    }catch(error){}

    var app = state();
    var settings = app && app.settings || {};
    return {
      master:Number.isFinite(Number(settings.masterVolume)) ? Number(settings.masterVolume) : 1,
      music:Number.isFinite(Number(settings.musicVolume)) ? Number(settings.musicVolume) : .65,
      effects:Number.isFinite(Number(settings.effectsVolume)) ? Number(settings.effectsVolume) : .9
    };
  }

  function currentStyle(){
    var domStyle = String(document.documentElement.dataset.style || '').toLowerCase();
    var app = state();
    var savedStyle = String(app && app.settings && app.settings.style || '').toLowerCase();
    return domStyle || savedStyle;
  }

  function isSpaceTheme(){
    var style = currentStyle();
    return style === 'event_midnight' ||
      /midnight|nebula|galaxy|moonlight|lunar|cosmic|space/.test(style);
  }

  /* Track Audio objects created after this script loads. app-audio creates the
     bird/nature element on the first user interaction, so we can mute only that
     exact media element while the space theme is active without touching or
     saving the user's music-volume setting. */
  function installAudioTracking(){
    if(!NativeAudio || window.Audio.__stregThemeAudioTracker) return;

    function TrackedAudio(src){
      var audio = arguments.length ? new NativeAudio(src) : new NativeAudio();
      trackedAudio.push(audio);
      return audio;
    }

    try{ TrackedAudio.prototype = NativeAudio.prototype; }catch(error){}
    try{ Object.setPrototypeOf(TrackedAudio,NativeAudio); }catch(error){}
    TrackedAudio.__stregThemeAudioTracker = true;
    TrackedAudio.__nativeAudio = NativeAudio;
    window.Audio = TrackedAudio;
  }

  function natureAudios(){
    return trackedAudio.filter(function(audio){
      try{
        var src = String(audio.currentSrc || audio.src || '').toLowerCase();
        return src.indexOf('nature-ambient') !== -1;
      }catch(error){
        return false;
      }
    });
  }

  function syncNatureMute(active){
    natureAudios().forEach(function(audio){
      try{ audio.muted = !!active; }catch(error){}
    });
  }

  function ensureSpace(){
    if(spaceAudio) return spaceAudio;
    spaceAudio = new NativeAudio(new URL(SPACE_PATH,document.baseURI).href);
    spaceAudio.loop = true;
    spaceAudio.preload = 'auto';
    spaceAudio.playsInline = true;
    spaceAudio.volume = 0;
    return spaceAudio;
  }

  function ensureMap(){
    if(mapAudio) return mapAudio;
    mapAudio = new NativeAudio(new URL(MAP_PATH,document.baseURI).href);
    mapAudio.preload = 'auto';
    mapAudio.playsInline = true;
    return mapAudio;
  }

  function primeSpaceFromGesture(){
    if(spacePrimed || !NativeAudio) return;
    var audio = ensureSpace();
    audio.volume = 0;

    try{
      var promise = audio.play();
      if(promise && promise.then){
        promise.then(function(){
          spacePrimed = true;
          syncSpace();
        }).catch(function(){});
      }else{
        spacePrimed = true;
      }
    }catch(error){}
  }

  function syncSpace(){
    var active = isSpaceTheme();
    syncNatureMute(active);

    var audio = ensureSpace();
    var v = volumes();
    var target = active && soundEnabled() && !document.hidden
      ? clamp(v.master * v.music * .9,0,1)
      : 0;

    var current = Number(audio.volume) || 0;
    var next = current + (target - current) * .22;
    if(Math.abs(target - next) < .002) next = target;
    audio.volume = clamp(next,0,1);

    if(target > .002 && audio.paused && spacePrimed){
      try{
        var promise = audio.play();
        if(promise && promise.catch) promise.catch(function(){});
      }catch(error){}
    }
  }

  function stopGenericMapClick(){
    try{
      if(window.StregAudio && typeof window.StregAudio.stop === 'function'){
        window.StregAudio.stop('ui');
      }
    }catch(error){}
  }

  function playMapSwitch(){
    if(!soundEnabled()) return;

    var now = Date.now();
    if(now - lastMapSoundAt < 170) return;
    lastMapSoundAt = now;

    var audio = ensureMap();
    var v = volumes();
    audio.volume = clamp(v.master * v.effects,0,1);

    try{ audio.pause(); }catch(error){}
    try{ audio.currentTime = 0; }catch(error){}

    try{
      var promise = audio.play();
      if(promise && promise.catch){
        promise.catch(function(error){
          console.warn('STREG map audio could not play',error);
        });
      }
    }catch(error){
      console.warn('STREG map audio could not play',error);
    }

    setTimeout(stopGenericMapClick,0);
    setTimeout(stopGenericMapClick,70);
  }

  function mapButtonFromEvent(event){
    return event.target && event.target.closest
      ? event.target.closest('.tabbtn[data-tab="tab-map"]')
      : null;
  }

  function handlePointerDown(event){
    primeSpaceFromGesture();
    if(mapButtonFromEvent(event)) playMapSwitch();
  }

  function handleClick(event){
    if(mapButtonFromEvent(event)){
      /* Pointer users already played it on pointerdown. This keeps keyboard
         activation working too without double-playing the sound. */
      if(Date.now() - lastMapSoundAt > 170) playMapSwitch();
      setTimeout(stopGenericMapClick,0);
    }

    /* Theme equip handlers run during this click. The space track has already
       been primed by pointerdown, so after the style changes we only need to
       raise its volume; no autoplay permission is needed here. */
    setTimeout(syncSpace,0);
    setTimeout(syncSpace,80);
  }

  function handleKeyDown(event){
    if(event.key !== 'Enter' && event.key !== ' ') return;
    primeSpaceFromGesture();
    if(mapButtonFromEvent(event)) playMapSwitch();
  }

  function install(){
    installAudioTracking();

    document.addEventListener('pointerdown',handlePointerDown,{capture:true,passive:true});
    document.addEventListener('click',handleClick,true);
    document.addEventListener('keydown',handleKeyDown,true);
    document.addEventListener('visibilitychange',syncSpace);

    try{
      new MutationObserver(syncSpace).observe(document.documentElement,{
        attributes:true,
        attributeFilter:['data-style','data-sound']
      });
    }catch(error){}

    setInterval(syncSpace,120);
    syncSpace();
  }

  window.StregThemeAudio = {
    sync:syncSpace,
    playMap:playMapSwitch,
    prime:primeSpaceFromGesture
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
})();
