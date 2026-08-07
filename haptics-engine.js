(function(){
  'use strict';

  /* haptics-engine.js is one of the few enhancement files loaded directly by
     index.html. Use it as the tiny, reliable bootstrap for performance,
     audio + runtime patches so a first-ever visit does not depend on a service
     worker already controlling the page. */
  function bootstrapRuntime(){
    if(window.__stregRuntimeBootstrapRequested) return;
    window.__stregRuntimeBootstrapRequested = true;

    function addScript(path,id,version,done){
      var existing = document.getElementById(id);
      if(existing){
        if(done) setTimeout(done,0);
        return;
      }
      var script = document.createElement('script');
      script.id = id;
      script.src = new URL(path,document.baseURI).href + '?v=' + encodeURIComponent(version);
      script.async = false;
      script.dataset.runtimeBootstrap = 'true';
      if(done){
        var finish = function(){
          script.removeEventListener('load',finish);
          script.removeEventListener('error',finish);
          done();
        };
        script.addEventListener('load',finish);
        script.addEventListener('error',finish);
      }
      document.head.appendChild(script);
    }

    function loadFeatureRuntime(){
      if(window.__stregDailyRuntimeInstalled) return;
      addScript('daily-photo-reset.js','stregDailyPhotoRuntime','20260807-10');
    }

    function loadAudioRuntime(){
      if(window.StregAudio && window.StregAudio.version){
        loadFeatureRuntime();
      }else{
        addScript('app-audio.js','stregAppAudioRuntime','20260807-3',loadFeatureRuntime);
      }
    }

    if(window.__stregPerformanceRuntimeInstalled){
      loadAudioRuntime();
    }else{
      addScript('performance-runtime.js','stregPerformanceBootstrap','20260807-3',loadAudioRuntime);
    }
  }

  bootstrapRuntime();

  var PATTERNS = {
    light:9,
    selection:12,
    medium:20,
    firm:34,
    success:[18,24,42],
    reward:[22,22,46,28,72],
    warning:[26,34,26],
    error:[34,30,56],
    photo:[16,18,28,22,58]
  };

  var lastPulseAt = -Infinity;
  var lastToastText = '';
  var lastRangePulse = new WeakMap();
  var touchStart = null;

  function state(){
    try{
      if(typeof S !== 'undefined' && S) return S;
    }catch(error){}
    return null;
  }

  function enabled(){
    var current = state();
    return !current || !current.settings || current.settings.vibe !== false;
  }

  function isTouchDevice(){
    if(window.Capacitor || window.AndroidHaptics || (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptics)) return true;
    if(navigator.maxTouchPoints && navigator.maxTouchPoints > 0) return true;
    try{ return !!window.matchMedia && window.matchMedia('(pointer:coarse)').matches; }catch(error){ return false; }
  }

  function patternFor(input){
    if(Array.isArray(input)) return input.slice();
    if(typeof input === 'number') return Math.max(0,Math.round(input));
    return PATTERNS[input] || PATTERNS.light;
  }

  function magnitude(pattern){
    if(Array.isArray(pattern)){
      return pattern.reduce(function(max,value,index){
        return index % 2 === 0 ? Math.max(max,Number(value) || 0) : max;
      },0);
    }
    return Number(pattern) || 0;
  }

  function kindFor(input,pattern){
    if(typeof input === 'string') return input;
    var strength = magnitude(pattern);
    if(strength >= 55) return 'reward';
    if(strength >= 28) return 'firm';
    if(strength >= 15) return 'medium';
    return 'light';
  }

  function invoke(method,args){
    try{
      var result = method(args);
      if(result && typeof result.catch === 'function') result.catch(function(){});
      return true;
    }catch(error){
      return false;
    }
  }

  function capacitorPulse(kind,pattern){
    var plugins = window.Capacitor && window.Capacitor.Plugins;
    var haptics = plugins && plugins.Haptics;
    if(!haptics) return false;

    if((kind === 'success' || kind === 'reward') && typeof haptics.notification === 'function'){
      return invoke(haptics.notification.bind(haptics),{type:'SUCCESS'});
    }
    if((kind === 'warning' || kind === 'error') && typeof haptics.notification === 'function'){
      return invoke(haptics.notification.bind(haptics),{type:kind === 'error' ? 'ERROR' : 'WARNING'});
    }
    if(kind === 'selection' && typeof haptics.selectionChanged === 'function'){
      return invoke(haptics.selectionChanged.bind(haptics));
    }
    if(typeof haptics.impact === 'function'){
      var strength = magnitude(pattern);
      var style = strength >= 48 ? 'HEAVY' : strength >= 20 ? 'MEDIUM' : 'LIGHT';
      return invoke(haptics.impact.bind(haptics),{style:style});
    }
    return false;
  }

  function bridgePulse(kind,pattern){
    try{
      var handler = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptics;
      if(handler && typeof handler.postMessage === 'function'){
        handler.postMessage({kind:kind,pattern:pattern});
        return true;
      }
    }catch(error){}

    try{
      if(window.AndroidHaptics && typeof window.AndroidHaptics.perform === 'function'){
        window.AndroidHaptics.perform(kind,pattern);
        return true;
      }
    }catch(error){}

    return false;
  }

  function browserPulse(pattern){
    if(typeof navigator.vibrate !== 'function') return false;
    try{
      return navigator.vibrate(pattern);
    }catch(error){
      return false;
    }
  }

  function pulse(input,options){
    options = options || {};
    if(!enabled() || (!isTouchDevice() && !options.allowDesktop)) return false;

    var now = performance.now();
    var cooldown = typeof options.cooldown === 'number' ? options.cooldown : 55;
    if(!options.force && now - lastPulseAt < cooldown) return false;

    var pattern = patternFor(input);
    var kind = kindFor(input,pattern);
    lastPulseAt = now;

    if(capacitorPulse(kind,pattern)) return true;
    if(bridgePulse(kind,pattern)) return true;
    return browserPulse(pattern);
  }

  function recentPulse(milliseconds){
    return performance.now() - lastPulseAt < (milliseconds || 105);
  }

  function disabled(element){
    return !element || element.disabled || element.getAttribute('aria-disabled') === 'true' ||
      element.classList.contains('disabled') || element.closest('[inert]');
  }

  function classify(element){
    var explicit = element.getAttribute('data-haptic');
    if(explicit) return explicit === 'none' ? null : explicit;

    if(element.matches('#captureBtn,#testPhotoBtn,.camera-trigger,[data-action="capture"]')) return 'photo';

    if(element.matches('.danger,#resetBtn,#profileImageRemoveBtn,[data-danger],.delete-btn,.remove-btn')) return 'warning';

    if(element.matches('.claim-btn,.reward-claim,.weekly-claim,.monthly-claim,.event-claim,[data-claim],.ch-btn.ready')) return 'success';

    if(element.matches('.shop-btn,.buy-btn,[data-buy],#buyFreeze,.ch-btn.start,.btn-primary,#modalBtn,.purchase-cutscene-skip')) return 'firm';

    if(element.matches('.tabbtn,.shop-subtab,.ch-subtab,.toggle,.seg button,.event-choice,.theme-swatch,.ach,.streak-journey-link,.journey-month-nav')) return 'selection';

    if(element.closest('.leaflet-control,.map-controls') || element.matches('.map-control,.leaflet-control-zoom-in,.leaflet-control-zoom-out')) return 'light';

    if(element.matches('button,a,[role="button"],summary,.clickable,.shop-item,.friend-card,.home-event-card,.mini-map-card')) return 'light';

    return null;
  }

  function interactiveFrom(target){
    if(!target || !target.closest) return null;
    return target.closest('[data-haptic],button,a,[role="button"],summary,.clickable,.shop-item,.friend-card,.home-event-card,.mini-map-card,.ach,.tabbtn,.shop-subtab,.ch-subtab,.theme-swatch,.toggle,.map-control,.leaflet-control-zoom-in,.leaflet-control-zoom-out');
  }

  document.addEventListener('click',function(event){
    if(!isTouchDevice() || !enabled() || recentPulse(105)) return;
    var element = interactiveFrom(event.target);
    if(disabled(element)) return;
    var kind = classify(element);
    if(kind) pulse(kind);
  });

  document.addEventListener('change',function(event){
    if(!isTouchDevice() || !enabled() || recentPulse(85)) return;
    var input = event.target;
    if(!input || !input.matches || !input.matches('input,select,textarea')) return;
    if(input.matches('input[type="file"]')) return;
    pulse(input.matches('input[type="checkbox"],input[type="radio"],select') ? 'selection' : 'light');
  });

  document.addEventListener('input',function(event){
    var input = event.target;
    if(!isTouchDevice() || !enabled() || !input || !input.matches || !input.matches('input[type="range"]')) return;
    var now = performance.now();
    var previous = lastRangePulse.get(input) || 0;
    if(now - previous < 55) return;
    lastRangePulse.set(input,now);
    pulse('selection',{cooldown:35});
  },{passive:true});

  document.addEventListener('touchstart',function(event){
    if(event.touches.length !== 1) return;
    var target = event.target;
    if(target && target.closest && target.closest('input,textarea,select,.leaflet-container,[data-no-haptic-swipe]')){
      touchStart = null;
      return;
    }
    touchStart = {
      x:event.touches[0].clientX,
      y:event.touches[0].clientY,
      time:performance.now()
    };
  },{passive:true});

  document.addEventListener('touchend',function(event){
    if(!touchStart || !event.changedTouches.length){
      touchStart = null;
      return;
    }

    var point = event.changedTouches[0];
    var dx = point.clientX - touchStart.x;
    var dy = point.clientY - touchStart.y;
    var duration = performance.now() - touchStart.time;
    touchStart = null;

    if(duration <= 700 && Math.abs(dx) >= 52 && Math.abs(dx) > Math.abs(dy) * 1.3 && !recentPulse(95)){
      pulse('selection');
    }
  },{passive:true});

  function watchToast(){
    var toast = document.getElementById('toast');
    if(!toast || typeof MutationObserver === 'undefined') return;

    var observer = new MutationObserver(function(){
      if(!toast.classList.contains('show')) return;
      var text = (toast.textContent || '').trim();
      if(!text || text === lastToastText) return;
      lastToastText = text;

      var lower = text.toLowerCase();
      var isError = /ikke|ugyld|fejl|kunne ikke|mangler|blokeret|for tæt|låst:|not enough|invalid|error|failed|blocked|locked:/.test(lower);
      if(isError){
        setTimeout(function(){ pulse('warning',{force:true}); },24);
      }
    });

    observer.observe(toast,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
  }

  var previousVibrate = window.vibrate;
  var enhancedVibrate = function(pattern){
    var handled = pulse(pattern,{force:true,allowDesktop:true,cooldown:0});
    if(!handled && typeof previousVibrate === 'function'){
      try{ return previousVibrate(pattern); }catch(error){}
    }
    return handled;
  };
  enhancedVibrate.__stregEnhanced = true;
  window.vibrate = enhancedVibrate;
  try{ vibrate = enhancedVibrate; }catch(error){}

  window.STREG_HAPTICS = {
    pulse:pulse,
    light:function(){ return pulse('light'); },
    selection:function(){ return pulse('selection'); },
    medium:function(){ return pulse('medium'); },
    firm:function(){ return pulse('firm'); },
    success:function(){ return pulse('success'); },
    reward:function(){ return pulse('reward'); },
    warning:function(){ return pulse('warning'); },
    error:function(){ return pulse('error'); },
    photo:function(){ return pulse('photo'); },
    supported:function(){
      return !!(
        (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) ||
        (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptics) ||
        window.AndroidHaptics ||
        typeof navigator.vibrate === 'function'
      );
    }
  };

  window.addEventListener('streg:haptic',function(event){
    var detail = event.detail || {};
    pulse(detail.kind || detail.pattern || 'light',detail.options || {});
  });

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',watchToast,{once:true});
  }else{
    watchToast();
  }
})();
