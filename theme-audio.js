(function(){
  'use strict';

  if(window.__stregThemeAudioInstalled) return;
  window.__stregThemeAudioInstalled = true;

  var SPACE_PATH = 'SoundsForStreg/space song.mp3?v=3ae25513';
  var MAP_PATH = 'SoundsForStreg/map switch.mp3?v=b918b00c';
  var MUSIC_BACKUP_KEY = 'streg_space_music_backup_v2';
  var LEGACY_REPAIR_KEY = 'streg_theme_audio_volume_repair_v2';
  var DEFAULT_MUSIC_VOLUME = 0.65;

  var spaceAudio = null;
  var mapAudio = null;
  var spaceMode = false;
  var desiredMusicVolume = null;
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

  function getVolumes(){
    try{
      if(window.StregAudio && typeof window.StregAudio.getVolumes === 'function'){
        return window.StregAudio.getVolumes();
      }
    }catch(error){}

    var app = state();
    var settings = app && app.settings || {};
    return {
      master:Number.isFinite(Number(settings.masterVolume)) ? Number(settings.masterVolume) : 1,
      music:Number.isFinite(Number(settings.musicVolume)) ? Number(settings.musicVolume) : DEFAULT_MUSIC_VOLUME,
      effects:Number.isFinite(Number(settings.effectsVolume)) ? Number(settings.effectsVolume) : 0.9
    };
  }

  function currentMusicVolume(){
    var app = state();
    var value = app && app.settings ? Number(app.settings.musicVolume) : NaN;
    return Number.isFinite(value) ? clamp(value,0,1) : DEFAULT_MUSIC_VOLUME;
  }

  function setMusicVolume(value){
    value = clamp(value,0,1);
    var app = state();
    if(app){
      if(!app.settings) app.settings = {};
      app.settings.musicVolume = value;
    }
    try{
      if(window.StregAudio && typeof window.StregAudio.setVolume === 'function'){
        window.StregAudio.setVolume('musicVolume',value,false);
      }
    }catch(error){}
    try{
      if(window.StregAudio && typeof window.StregAudio.updateAmbience === 'function'){
        window.StregAudio.updateAmbience();
      }
    }catch(error){}
  }

  function persistState(){
    try{
      if(typeof save === 'function'){
        save();
        return;
      }
    }catch(error){}
    try{
      var app = state();
      if(app) localStorage.setItem('streg_v3',JSON.stringify(app));
    }catch(error){}
  }

  function readBackup(){
    try{
      var raw = localStorage.getItem(MUSIC_BACKUP_KEY);
      if(raw == null || raw === '') return null;
      var value = Number(raw);
      return Number.isFinite(value) ? clamp(value,0,1) : null;
    }catch(error){
      return null;
    }
  }

  function writeBackup(value){
    try{ localStorage.setItem(MUSIC_BACKUP_KEY,String(clamp(value,0,1))); }catch(error){}
  }

  function clearBackup(){
    try{ localStorage.removeItem(MUSIC_BACKUP_KEY); }catch(error){}
  }

  function repairLegacyMutedMusic(){
    var alreadyRepaired = false;
    try{ alreadyRepaired = localStorage.getItem(LEGACY_REPAIR_KEY) === '1'; }catch(error){}
    if(alreadyRepaired) return;

    var app = state();
    if(!app){ return; }
    if(!app.settings) app.settings = {};

    var current = Number(app.settings.musicVolume);
    var hasCurrent = Number.isFinite(current);

    /* The first version of the space-theme code muted the bird track by writing
       musicVolume=0 into S. If the app saved or reloaded while that theme was
       active, the in-memory backup disappeared and 0 became permanent. Repair
       that one legacy state once; future deliberate 0% choices are left alone. */
    if(hasCurrent && current === 0){
      if(isSpaceTheme()){
        if(readBackup() == null) writeBackup(DEFAULT_MUSIC_VOLUME);
        desiredMusicVolume = readBackup();
      }else{
        setMusicVolume(DEFAULT_MUSIC_VOLUME);
        persistState();
      }
    }

    try{ localStorage.setItem(LEGACY_REPAIR_KEY,'1'); }catch(error){}
  }

  function ensureSpace(){
    if(spaceAudio) return spaceAudio;
    spaceAudio = new Audio(new URL(SPACE_PATH,document.baseURI).href);
    spaceAudio.loop = true;
    spaceAudio.preload = 'auto';
    spaceAudio.playsInline = true;
    spaceAudio.volume = 0;
    spaceAudio.addEventListener('error',function(){
      console.warn('STREG could not load space audio',spaceAudio.currentSrc || spaceAudio.src);
    });
    return spaceAudio;
  }

  function ensureMap(){
    if(mapAudio) return mapAudio;
    mapAudio = new Audio(new URL(MAP_PATH,document.baseURI).href);
    mapAudio.preload = 'auto';
    mapAudio.playsInline = true;
    mapAudio.addEventListener('error',function(){
      console.warn('STREG could not load map audio',mapAudio.currentSrc || mapAudio.src);
    });
    return mapAudio;
  }

  function playSpace(){
    if(!spaceMode || !soundEnabled() || document.hidden) return;
    var audio = ensureSpace();
    var promise;
    try{ promise = audio.play(); }catch(error){ return; }
    if(promise && promise.catch){
      promise.catch(function(error){
        if(error && error.name !== 'NotAllowedError'){
          console.warn('STREG space audio could not play',error);
        }
      });
    }
  }

  function stopSpace(){
    if(!spaceAudio) return;
    try{ spaceAudio.pause(); }catch(error){}
    try{ spaceAudio.volume = 0; }catch(error){}
  }

  function enterSpaceTheme(){
    if(spaceMode) return;

    var backup = readBackup();
    if(backup == null){
      backup = currentMusicVolume();
      writeBackup(backup);
    }
    desiredMusicVolume = backup;

    /* Only the normal nature channel is muted through its existing music
       volume. The desired value is kept separately and survives reloads, so it
       can always be restored when the user leaves the space theme. */
    setMusicVolume(0);
    spaceMode = true;
  }

  function leaveSpaceTheme(){
    var backup = readBackup();

    if(backup != null){
      setMusicVolume(backup);
      desiredMusicVolume = backup;
      clearBackup();
      persistState();
    }

    spaceMode = false;
    desiredMusicVolume = null;
    stopSpace();
  }

  function syncSpace(){
    var active = isSpaceTheme();

    if(active && !spaceMode) enterSpaceTheme();
    if(!active && (spaceMode || readBackup() != null)){
      leaveSpaceTheme();
      return;
    }
    if(!active) return;

    /* If the user changes the Music slider while the space theme is active,
       remember the new desired level, then keep nature muted at 0. */
    var liveMusic = currentMusicVolume();
    if(liveMusic > 0){
      desiredMusicVolume = liveMusic;
      writeBackup(liveMusic);
      setMusicVolume(0);
    }

    if(desiredMusicVolume == null){
      desiredMusicVolume = readBackup();
      if(desiredMusicVolume == null) desiredMusicVolume = DEFAULT_MUSIC_VOLUME;
    }

    var v = getVolumes();
    var target = soundEnabled() && !document.hidden
      ? clamp(v.master * desiredMusicVolume * 0.9,0,1)
      : 0;
    var audio = ensureSpace();
    var current = Number(audio.volume) || 0;
    var next = current + (target - current) * 0.2;
    if(Math.abs(target - next) < 0.002) next = target;
    audio.volume = clamp(next,0,1);

    if(target > 0.002){
      playSpace();
    }else if(audio.volume < 0.002){
      try{ audio.pause(); }catch(error){}
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

    var v = getVolumes();
    var audio = ensureMap();
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
  }

  function mapButtonFromEvent(event){
    return event.target && event.target.closest
      ? event.target.closest('.tabbtn[data-tab="tab-map"]')
      : null;
  }

  function handlePointerDown(event){
    if(mapButtonFromEvent(event)) playMapSwitch();
    if(isSpaceTheme()) playSpace();
  }

  function handleClick(event){
    if(mapButtonFromEvent(event)){
      if(Date.now() - lastMapSoundAt > 170) playMapSwitch();
      setTimeout(stopGenericMapClick,0);
      setTimeout(stopGenericMapClick,80);
    }

    /* This listener runs in the bubble phase, after the app's theme controls in
       normal operation. Recheck immediately and once more after render patches. */
    syncSpace();
    setTimeout(syncSpace,0);
    setTimeout(syncSpace,120);
  }

  function handleKeyDown(event){
    if(event.key !== 'Enter' && event.key !== ' ') return;
    if(mapButtonFromEvent(event)) playMapSwitch();
    if(isSpaceTheme()) playSpace();
  }

  function install(){
    repairLegacyMutedMusic();

    document.addEventListener('pointerdown',handlePointerDown,{capture:true,passive:true});
    document.addEventListener('click',handleClick,false);
    document.addEventListener('keydown',handleKeyDown,true);
    document.addEventListener('visibilitychange',syncSpace);

    try{
      new MutationObserver(syncSpace).observe(document.documentElement,{
        attributes:true,
        attributeFilter:['data-style','data-sound']
      });
    }catch(error){}

    setInterval(syncSpace,150);
    syncSpace();
  }

  window.StregThemeAudio = {
    sync:syncSpace,
    playMap:playMapSwitch
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
})();
