(function(){
  'use strict';

  if(window.__stregPerformanceRuntimeInstalled) return;
  window.__stregPerformanceRuntimeInstalled = true;

  var nativeSetInterval = window.setInterval.bind(window);
  var pausedAnimations = [];

  function callbackText(callback){
    try{ return Function.prototype.toString.call(callback); }catch(error){ return ''; }
  }

  function intervalPolicy(callback,delay){
    if(typeof callback !== 'function') return null;
    var name = callback.name || '';
    var source = callbackText(callback);
    var ms = Number(delay) || 0;

    /* Home challenge state already refreshes immediately through renderAll().
       Its old 1.8s fallback rebuilt cards, forced layout, and woke observers
       even when absolutely nothing had changed. */
    if(name === 'renderHub' && ms >= 1700 && ms <= 2000){
      return {delay:12000,pauseWhenHidden:true,label:'home-challenges'};
    }

    /* XP and level detection are lightweight maintenance checks. A tiny
       reduction in polling frequency is visually imperceptible, while avoiding
       10+ checks per second forever on every open page. */
    if(name === 'checkXp' && ms >= 100 && ms <= 140){
      return {delay:180,pauseWhenHidden:true,label:'xp-watch'};
    }
    if(ms >= 150 && ms <= 220 && source.indexOf('bindFill') !== -1 && source.indexOf('checkLevel') !== -1){
      return {delay:260,pauseWhenHidden:true,label:'level-watch'};
    }

    /* Audio fading does not need an 11 Hz maintenance loop, and settings
       controls do not need a full DOM sync every second once installed. */
    if(name === 'ambienceTick' && ms >= 70 && ms <= 110){
      return {delay:130,pauseWhenHidden:true,label:'ambience'};
    }
    if(ms >= 900 && ms <= 1100 && source.indexOf('installSettingsControls') !== -1 && source.indexOf('syncVolumeControls') !== -1){
      return {delay:4000,pauseWhenHidden:true,label:'audio-settings'};
    }

    return null;
  }

  window.setInterval = function(callback,delay){
    var args = Array.prototype.slice.call(arguments,2);
    var policy = intervalPolicy(callback,delay);
    if(!policy) return nativeSetInterval.apply(window,[callback,delay].concat(args));

    var wrapped = function(){
      if(policy.pauseWhenHidden && document.hidden) return;
      return callback.apply(this,arguments);
    };
    try{ Object.defineProperty(wrapped,'name',{value:callback.name || 'stregMaintenance',configurable:true}); }catch(error){}
    return nativeSetInterval.apply(window,[wrapped,policy.delay].concat(args));
  };

  function installStyles(){
    if(document.getElementById('stregPerformanceRuntimeStyles')) return;
    var style = document.createElement('style');
    style.id = 'stregPerformanceRuntimeStyles';
    style.textContent = [
      'html.streg-page-hidden *,html.streg-page-hidden *::before,html.streg-page-hidden *::after{animation-play-state:paused!important;}'
    ].join('');
    document.head.appendChild(style);
  }

  function pausePageAnimations(){
    document.documentElement.classList.add('streg-page-hidden');
    pausedAnimations = [];
    try{
      document.getAnimations().forEach(function(animation){
        if(animation.playState !== 'running') return;
        try{
          animation.pause();
          pausedAnimations.push(animation);
        }catch(error){}
      });
    }catch(error){}
  }

  function resumePageAnimations(){
    document.documentElement.classList.remove('streg-page-hidden');
    var list = pausedAnimations.slice();
    pausedAnimations.length = 0;
    list.forEach(function(animation){
      try{
        if(animation.playState === 'paused') animation.play();
      }catch(error){}
    });
  }

  function syncVisibility(){
    if(document.hidden) pausePageAnimations();
    else resumePageAnimations();
  }

  installStyles();
  document.addEventListener('visibilitychange',syncVisibility,{passive:true});
  window.addEventListener('pagehide',pausePageAnimations,{passive:true});
  window.addEventListener('pageshow',function(){ if(!document.hidden) resumePageAnimations(); },{passive:true});

  if(document.hidden) pausePageAnimations();

  window.StregPerformance = {
    version:'1.0.0',
    syncVisibility:syncVisibility
  };
})();
