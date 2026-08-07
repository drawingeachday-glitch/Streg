(function(){
  'use strict';

  var SPACE_PATH = 'SoundsForStreg/space-song.mp3';
  var MAP_PATH = 'SoundsForStreg/map-switch.mp3';
  var spaceAudio = null;
  var mapAudio = null;
  var spaceWasActive = false;
  var lastMapSoundAt = 0;
  var spaceFileBroken = false;
  var mapFileBroken = false;

  var AudioContextClass = window.AudioContext || window.webkitAudioContext;
  var themeContext = null;
  var spaceSynth = null;

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

  function isSpaceTheme(){
    var style = String(document.documentElement.dataset.style || '').toLowerCase();
    return style === 'event_midnight' || style === 'fragment_void' || /nebula|galaxy|cosmic|space|void|blackhole/.test(style);
  }

  function ensureThemeContext(){
    if(!AudioContextClass) return null;
    if(!themeContext) themeContext = new AudioContextClass();
    if(themeContext.state === 'suspended'){
      try{ themeContext.resume(); }catch(error){}
    }
    return themeContext;
  }

  function ensureSpace(){
    if(spaceAudio) return spaceAudio;
    spaceAudio = new Audio(new URL(SPACE_PATH,document.baseURI).href);
    spaceAudio.loop = true;
    spaceAudio.preload = 'auto';
    spaceAudio.playsInline = true;
    spaceAudio.volume = 0;
    spaceAudio.addEventListener('error',function(){
      spaceFileBroken = true;
      startSpaceSynth();
    });
    return spaceAudio;
  }

  function ensureMap(){
    if(mapAudio) return mapAudio;
    mapAudio = new Audio(new URL(MAP_PATH,document.baseURI).href);
    mapAudio.preload = 'auto';
    mapAudio.playsInline = true;
    mapAudio.addEventListener('error',function(){ mapFileBroken = true; });
    return mapAudio;
  }

  function playMedia(audio,onFailure){
    if(!audio || !audio.paused) return;
    try{
      var p = audio.play();
      if(p && p.catch){
        p.catch(function(){
          if(typeof onFailure === 'function') onFailure();
        });
      }
    }catch(error){
      if(typeof onFailure === 'function') onFailure();
    }
  }

  function stopSpaceSynth(){
    if(!spaceSynth) return;
    try{
      spaceSynth.oscillators.forEach(function(osc){ osc.stop(); });
    }catch(error){}
    try{ spaceSynth.lfo.stop(); }catch(error){}
    try{ spaceSynth.gain.disconnect(); }catch(error){}
    spaceSynth = null;
  }

  function startSpaceSynth(){
    if(spaceSynth || !isSpaceTheme() || !soundEnabled() || document.hidden) return;
    var ctx = ensureThemeContext();
    if(!ctx || ctx.state === 'suspended') return;

    var v = volumes();
    var masterGain = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    var lfo = ctx.createOscillator();
    var lfoGain = ctx.createGain();
    var freqs = [55,82.41,110];
    var oscillators = [];

    masterGain.gain.value = clamp(v.master * v.music * .09,0,.16);
    filter.type = 'lowpass';
    filter.frequency.value = 680;
    filter.Q.value = .7;

    lfo.type = 'sine';
    lfo.frequency.value = .085;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    freqs.forEach(function(freq,index){
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = index === 1 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      osc.detune.value = index === 0 ? -5 : index === 2 ? 7 : 0;
      gain.gain.value = index === 1 ? .32 : .22;
      osc.connect(gain);
      gain.connect(filter);
      osc.start();
      oscillators.push(osc);
    });

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);
    lfo.start();
    spaceSynth = {gain:masterGain,filter:filter,lfo:lfo,oscillators:oscillators};
  }

  function updateSpaceSynthVolume(){
    if(!spaceSynth || !themeContext) return;
    var v = volumes();
    var target = soundEnabled() && isSpaceTheme() && !document.hidden
      ? clamp(v.master * v.music * .09,0,.16)
      : 0;
    try{ spaceSynth.gain.gain.setTargetAtTime(target,themeContext.currentTime,.08); }
    catch(error){ spaceSynth.gain.gain.value = target; }
    if(target <= .001) stopSpaceSynth();
  }

  function playMapSynth(){
    if(!soundEnabled()) return;
    var ctx = ensureThemeContext();
    if(!ctx || ctx.state === 'suspended') return;
    var v = volumes();
    var output = ctx.createGain();
    var oscA = ctx.createOscillator();
    var oscB = ctx.createOscillator();
    var now = ctx.currentTime;
    var level = clamp(v.master * v.effects * .19,0,.28);

    output.gain.setValueAtTime(.0001,now);
    output.gain.exponentialRampToValueAtTime(Math.max(.002,level),now + .018);
    output.gain.exponentialRampToValueAtTime(.0001,now + .28);

    oscA.type = 'sine';
    oscA.frequency.setValueAtTime(310,now);
    oscA.frequency.exponentialRampToValueAtTime(620,now + .18);
    oscB.type = 'triangle';
    oscB.frequency.setValueAtTime(155,now);
    oscB.frequency.exponentialRampToValueAtTime(260,now + .22);

    oscA.connect(output);
    oscB.connect(output);
    output.connect(ctx.destination);
    oscA.start(now);
    oscB.start(now);
    oscA.stop(now + .3);
    oscB.stop(now + .3);
  }

  function syncSpace(){
    var active = isSpaceTheme();
    if(!active && spaceWasActive){
      if(spaceAudio){
        spaceAudio.volume = 0;
        try{ spaceAudio.pause(); }catch(error){}
      }
      stopSpaceSynth();
    }
    spaceWasActive = active;
    if(!active) return;

    var v = volumes();
    var target = soundEnabled() && !document.hidden ? clamp(v.master * v.music * .82,0,1) : 0;

    if(spaceFileBroken){
      if(target > .002) startSpaceSynth();
      updateSpaceSynthVolume();
      return;
    }

    var audio = ensureSpace();
    audio.volume += (target - audio.volume) * .18;
    if(Math.abs(target - audio.volume) < .002) audio.volume = target;
    if(target > .002){
      playMedia(audio,function(){
        spaceFileBroken = true;
        try{ audio.pause(); }catch(error){}
        startSpaceSynth();
      });
    }else if(audio.volume < .002){
      try{ audio.pause(); }catch(error){}
    }
  }

  function playMapSwitch(){
    if(!soundEnabled()) return;
    var now = Date.now();
    if(now - lastMapSoundAt < 180) return;
    lastMapSoundAt = now;

    try{ if(window.StregAudio && window.StregAudio.stop) window.StregAudio.stop('ui'); }catch(error){}

    if(mapFileBroken){
      playMapSynth();
      return;
    }

    var v = volumes();
    var audio = ensureMap();
    audio.volume = clamp(v.master * v.effects * .92,0,1);
    try{ audio.currentTime = 0; }catch(error){}
    playMedia(audio,function(){
      mapFileBroken = true;
      playMapSynth();
    });
  }

  function mapPointer(event){
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

  function unlockThemeAudio(){
    ensureThemeContext();
    if(isSpaceTheme()){
      if(spaceFileBroken) startSpaceSynth();
      else playMedia(ensureSpace(),function(){
        spaceFileBroken = true;
        startSpaceSynth();
      });
    }
  }

  function install(){
    document.addEventListener('pointerdown',function(event){
      unlockThemeAudio();
      mapPointer(event);
    },{capture:true,passive:true});
    document.addEventListener('click',mapPointer,true);
    document.addEventListener('visibilitychange',syncSpace);
    wrapSwitchTab();
    setInterval(function(){
      wrapSwitchTab();
      syncSpace();
    },120);
    syncSpace();
  }

  window.StregThemeAudio = {
    sync:syncSpace,
    playMap:playMapSwitch,
    unlock:unlockThemeAudio,
    get spaceFileBroken(){ return spaceFileBroken; },
    get mapFileBroken(){ return mapFileBroken; }
  };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
