(function(){
  'use strict';

  var SPACE_PATH = 'SoundsForStreg/space-song.mp3';
  var MAP_PATH = 'SoundsForStreg/map-switch.mp3';
  var spaceAudio = null;
  var mapAudio = null;
  var originalMusicVolume = null;
  var midnightWasActive = false;
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
      music:originalMusicVolume != null ? originalMusicVolume : (Number.isFinite(Number(settings.musicVolume)) ? Number(settings.musicVolume) : .65),
      effects:Number.isFinite(Number(settings.effectsVolume)) ? Number(settings.effectsVolume) : .9
    };
  }

  function isSpaceTheme(){
    var style = String(document.documentElement.dataset.style || '').toLowerCase();
    return style === 'event_midnight' || /nebula|galaxy|cosmic|space/.test(style);
  }

  function ensureSpace(){
    if(spaceAudio) return spaceAudio;
    spaceAudio = new Audio(new URL(SPACE_PATH,document.baseURI).href);
    spaceAudio.loop = true;
    spaceAudio.preload = 'auto';
    spaceAudio.playsInline = true;
    spaceAudio.volume = 0;
    return spaceAudio;
  }

  function ensureMap(){
    if(mapAudio) return mapAudio;
    mapAudio = new Audio(new URL(MAP_PATH,document.baseURI).href);
    mapAudio.preload = 'auto';
    mapAudio.playsInline = true;
    return mapAudio;
  }

  function playSafe(audio){
    if(!audio || !audio.paused) return;
    try{
      var p = audio.play();
      if(p && p.catch) p.catch(function(){});
    }catch(error){}
  }

  function setNativeMusicVolume(value){
    var app = state();
    if(!app) return;
    if(!app.settings) app.settings = {};
    app.settings.musicVolume = clamp(value,0,1);
    try{
      if(window.StregAudio && typeof window.StregAudio.setVolume === 'function'){
        window.StregAudio.setVolume('musicVolume',app.settings.musicVolume,false);
      }
    }catch(error){}
  }

  function enterSpaceTheme(){
    var app = state();
    if(app && app.settings && originalMusicVolume == null){
      var current = Number(app.settings.musicVolume);
      originalMusicVolume = Number.isFinite(current) ? current : .65;
    }
    /* app-audio owns the bird/nature track. Temporarily set only its music
       channel to zero without saving, then use the remembered level for space. */
    setNativeMusicVolume(0);
    midnightWasActive = true;
  }

  function leaveSpaceTheme(){
    if(!midnightWasActive) return;
    if(originalMusicVolume != null) setNativeMusicVolume(originalMusicVolume);
    midnightWasActive = false;
    originalMusicVolume = null;
    if(spaceAudio){
      spaceAudio.volume = 0;
      try{ spaceAudio.pause(); }catch(error){}
    }
  }

  function syncSpace(){
    var active = isSpaceTheme();
    if(active && !midnightWasActive) enterSpaceTheme();
    if(!active && midnightWasActive) leaveSpaceTheme();
    if(!active) return;

    var app = state();
    var settings = app && app.settings || {};
    var master = Number.isFinite(Number(settings.masterVolume)) ? Number(settings.masterVolume) : 1;
    var music = originalMusicVolume == null ? .65 : originalMusicVolume;
    var target = soundEnabled() && !document.hidden ? clamp(master * music * .82,0,1) : 0;
    var audio = ensureSpace();
    audio.volume += (target - audio.volume) * .18;
    if(Math.abs(target - audio.volume) < .002) audio.volume = target;
    if(target > 0.002) playSafe(audio);
    else if(audio.volume < .002){ try{ audio.pause(); }catch(error){} }
  }

  function playMapSwitch(){
    if(!soundEnabled()) return;
    var now = Date.now();
    if(now - lastMapSoundAt < 180) return;
    lastMapSoundAt = now;

    /* Stop the generic tab click so the map gets its own unique sound. */
    setTimeout(function(){
      try{ if(window.StregAudio && window.StregAudio.stop) window.StregAudio.stop('ui'); }catch(error){}
    },0);

    var v = volumes();
    var audio = ensureMap();
    audio.volume = clamp(v.master * v.effects * .92,0,1);
    try{ audio.currentTime = 0; }catch(error){}
    playSafe(audio);
  }

  function mapClick(event){
    var target = event.target && event.target.closest ? event.target.closest('.tabbtn[data-tab="tab-map"]') : null;
    if(target) playMapSwitch();
  }

  function wrapSwitchTab(){
    try{
      var original = window.switchTab;
      if(typeof original !== 'function' || original.__stregThemeAudio) return;
      var wrapped = function(id){
        if(id === 'tab-map') playMapSwitch();
        return original.apply(this,arguments);
      };
      wrapped.__stregThemeAudio = true;
      window.switchTab = wrapped;
    }catch(error){}
  }

  function install(){
    document.addEventListener('click',mapClick,true);
    document.addEventListener('pointerdown',function(){ if(isSpaceTheme()) playSafe(ensureSpace()); },{capture:true,passive:true});
    document.addEventListener('visibilitychange',syncSpace);
    wrapSwitchTab();
    setInterval(function(){ wrapSwitchTab(); syncSpace(); },120);
    syncSpace();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
