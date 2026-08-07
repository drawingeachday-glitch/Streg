(function(){
  'use strict';

  if(window.__stregPerformanceRuntimeInstalled) return;
  window.__stregPerformanceRuntimeInstalled = true;

  var nativeSetInterval = window.setInterval.bind(window);
  var pausedAnimations = [];
  var paneObservers = [];
  var TOP_LEVEL_PANES = [
    'tab-home','tab-map','tab-challenges','tab-shop','tab-profile','tab-journey','tab-friends'
  ];
  var NESTED_CHALLENGE_PANES = [
    'pane-ch-daily','pane-ch-weekly','pane-ch-monthly','pane-ch-event'
  ];

  function callbackText(callback){
    try{ return Function.prototype.toString.call(callback); }catch(error){ return ''; }
  }

  function intervalPolicy(callback,delay){
    if(typeof callback !== 'function') return null;
    var name = callback.name || '';
    var source = callbackText(callback);
    var ms = Number(delay) || 0;

    if(name === 'renderHub' && ms >= 1700 && ms <= 2000){
      return {delay:12000,pauseWhenHidden:true,label:'home-challenges'};
    }
    if(name === 'checkXp' && ms >= 100 && ms <= 140){
      return {delay:180,pauseWhenHidden:true,label:'xp-watch'};
    }
    if(ms >= 150 && ms <= 220 && source.indexOf('bindFill') !== -1 && source.indexOf('checkLevel') !== -1){
      return {delay:260,pauseWhenHidden:true,label:'level-watch'};
    }
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
      'html.streg-page-hidden *,html.streg-page-hidden *::before,html.streg-page-hidden *::after{animation-play-state:paused!important;}',
      '.streg-perf-paused *, .streg-perf-paused *::before, .streg-perf-paused *::after{animation-play-state:paused!important;}'
    ].join('');
    document.head.appendChild(style);
  }

  function paneIsVisible(element){
    if(!element || element.hidden || element.getAttribute('aria-hidden') === 'true') return false;
    try{
      var style = getComputedStyle(element);
      if(style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity || 1) === 0) return false;
    }catch(error){}
    return element.getClientRects().length > 0;
  }

  function syncPane(element){
    if(!element) return;
    element.classList.toggle('streg-perf-paused',!paneIsVisible(element));
  }

  function clearNestedPauseMarkers(){
    /* The parent Challenges tab already pauses every descendant while hidden.
       Pausing each inner Daily/Weekly/Monthly/Event pane separately is unsafe:
       the default Daily pane does not change class when the parent tab opens,
       so its entrance animation can remain frozen at opacity:0 forever. */
    NESTED_CHALLENGE_PANES.forEach(function(id){
      var pane = document.getElementById(id);
      if(pane) pane.classList.remove('streg-perf-paused');
    });
  }

  function observePane(element){
    if(!element || element.dataset.stregPerfObserved === 'true') return;
    element.dataset.stregPerfObserved = 'true';
    syncPane(element);
    var observer = new MutationObserver(function(){
      syncPane(element);
      if(element.id === 'tab-challenges') clearNestedPauseMarkers();
    });
    observer.observe(element,{attributes:true,attributeFilter:['class','style','hidden','aria-hidden']});
    paneObservers.push(observer);
  }

  function installPaneObservers(){
    clearNestedPauseMarkers();
    TOP_LEVEL_PANES.forEach(function(id){ observePane(document.getElementById(id)); });
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
    installPaneObservers();
    TOP_LEVEL_PANES.forEach(function(id){ syncPane(document.getElementById(id)); });
    clearNestedPauseMarkers();
  }

  function syncVisibility(){
    if(document.hidden) pausePageAnimations();
    else resumePageAnimations();
  }

  installStyles();
  document.addEventListener('visibilitychange',syncVisibility,{passive:true});
  window.addEventListener('pagehide',pausePageAnimations,{passive:true});
  window.addEventListener('pageshow',function(){ if(!document.hidden) resumePageAnimations(); },{passive:true});
  window.addEventListener('streg:startup-complete',installPaneObservers);

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',installPaneObservers,{once:true});
  }else{
    installPaneObservers();
  }
  setTimeout(installPaneObservers,850);

  if(document.hidden) pausePageAnimations();

  window.StregPerformance = {
    version:'1.2.0',
    syncVisibility:syncVisibility,
    syncPanes:installPaneObservers
  };
})();
