(function(){
  'use strict';

  if(window.__stregDailyRuntimeInstalled) return;
  window.__stregDailyRuntimeInstalled = true;

  function hasScriptPath(path){
    var target;
    try{ target = new URL(path,document.baseURI).pathname; }catch(error){ return false; }
    return Array.prototype.some.call(document.scripts,function(script){
      if(!script.src) return false;
      try{ return new URL(script.src,document.baseURI).pathname === target; }catch(error){ return false; }
    });
  }

  function loadRuntimeFeature(path,id,version){
    if(document.getElementById(id) || hasScriptPath(path)) return;
    var script = document.createElement('script');
    script.id = id;
    script.src = new URL(path,document.baseURI).href + '?v=' + encodeURIComponent(version);
    /* Dynamically inserted scripts are async by default. Explicit async=false
       preserves this dependency order; `defer` does not order dynamic scripts. */
    script.async = false;
    script.dataset.runtimeFeature = 'true';
    document.head.appendChild(script);
  }

  function loadFeatureStack(){
    loadRuntimeFeature('runtime-safety.js','stregRuntimeSafetyRuntime','20260807-3');
    loadRuntimeFeature('home-challenges.js','stregHomeChallengesRuntime','20260807-1');
    loadRuntimeFeature('challenge-page-redesign.js','stregChallengePageRedesignRuntime','20260807-6');
    loadRuntimeFeature('daily-challenge-single-target.js','stregDailySingleTargetRuntime','20260807-2');
    loadRuntimeFeature('event-tab-redesign.js','stregEventTabRedesignRuntime','20260805-1');
    loadRuntimeFeature('challenge-event-polish.js','stregChallengeEventPolishRuntime','20260807-1');
    loadRuntimeFeature('challenge-card-actions.js','stregChallengeCardActionsRuntime','20260807-6');
    loadRuntimeFeature('xp-liquid-bar.js','stregXpLiquidBarRuntime','20260807-2');
    loadRuntimeFeature('level-up-xp-explosion.js','stregLevelUpXpExplosionRuntime','20260807-2');
    loadRuntimeFeature('uploaded-ui-sounds.js','stregUploadedUiSoundsRuntime','20260807-2');
    loadRuntimeFeature('inventory.js','stregInventoryRuntime','20260805-1');
    loadRuntimeFeature('theme-audio.js','stregThemeAudioRuntime','20260807-4');
  }

  /* Waiting until the parser has finished means we can see scripts injected by
     the previous service worker and avoid loading a second copy during the
     one-page v11 -> v12 upgrade transition. */
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',loadFeatureStack,{once:true});
  }else{
    loadFeatureStack();
  }

  function state(){
    try{ return typeof S !== 'undefined' && S ? S : null; }catch(error){ return null; }
  }

  function dayKey(value){
    var date = value instanceof Date ? value : new Date(value);
    if(Number.isNaN(date.getTime())) return '';
    return date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2,'0') + '-' +
      String(date.getDate()).padStart(2,'0');
  }

  function todayKey(){ return dayKey(new Date()); }

  function yesterdayKey(){
    var date = new Date();
    date.setDate(date.getDate() - 1);
    return dayKey(date);
  }

  function photoDay(photo){
    if(!photo) return '';
    return dayKey(photo.ts || photo.takenAt || photo.taken_at || photo.date || photo.createdAt || photo.created_at);
  }

  function devMode(){
    var host = String(location.hostname || '').toLowerCase();
    if(host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
    try{
      var params = new URLSearchParams(location.search);
      if(params.get('dev') === '1') return true;
    }catch(error){}
    try{ return localStorage.getItem('streg_dev_mode') === '1'; }catch(error){ return false; }
  }

  function saveAndRefresh(){
    try{ if(typeof save === 'function') save(); }catch(error){}
    try{ if(typeof renderAll === 'function') renderAll(); }catch(error){}
    try{ if(typeof refreshCaptureCard === 'function') refreshCaptureCard(); }catch(error){}
    try{ if(window.renderStreakRoute) window.renderStreakRoute(); }catch(error){}
    try{ if(window.renderMiniCaptureMap) window.renderMiniCaptureMap(); }catch(error){}
    try{ if(window.StregAudio && window.StregAudio.updateAmbience) window.StregAudio.updateAmbience(); }catch(error){}

    var card = document.getElementById('captureCard');
    if(card) card.classList.remove('captured','locked','rejected');
    var icon = document.getElementById('capIcon');
    if(icon) icon.classList.remove('big');
    var title = document.getElementById('capTitle');
    if(title) title.textContent = 'Klar til dagens billede?';
  }

  function recomputeStreaks(appState){
    var days = Object.create(null);
    (appState.photos || []).forEach(function(photo){
      var key = photoDay(photo);
      if(key) days[key] = true;
    });

    var cursor = new Date();
    cursor.setDate(cursor.getDate() - 1);
    var current = 0;
    while(days[dayKey(cursor)]){
      current += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    appState.streak = current;

    var sorted = Object.keys(days).sort();
    var best = 0;
    var run = 0;
    var previous = null;
    sorted.forEach(function(key){
      var date = new Date(key + 'T12:00:00');
      if(previous){
        var diff = Math.round((date - previous) / 86400000);
        run = diff === 1 ? run + 1 : 1;
      }else{
        run = 1;
      }
      if(run > best) best = run;
      previous = date;
    });
    appState.best = Math.max(best,appState.streak);
  }

  function resetToday(){
    var appState = state();
    if(!appState || !devMode()) return;

    var today = todayKey();
    var before = Array.isArray(appState.photos) ? appState.photos.length : 0;
    var removedIds = Object.create(null);

    appState.photos = (appState.photos || []).filter(function(photo){
      if(photoDay(photo) !== today) return true;
      if(photo && photo.id != null) removedIds[String(photo.id)] = true;
      return false;
    });

    if(appState.hexMap && appState.hexMap.photos && typeof appState.hexMap.photos === 'object'){
      Object.keys(appState.hexMap.photos).forEach(function(hexId){
        var entry = appState.hexMap.photos[hexId];
        var shouldRemove = entry && (
          photoDay(entry) === today ||
          (entry.photoId != null && removedIds[String(entry.photoId)])
        );
        if(shouldRemove) delete appState.hexMap.photos[hexId];
      });
    }

    appState.lastDay = yesterdayKey();
    recomputeStreaks(appState);
    saveAndRefresh();

    try{
      if(typeof SFX !== 'undefined' && SFX && typeof SFX.chime === 'function') SFX.chime();
    }catch(error){}

    var removed = before - appState.photos.length;
    try{
      if(typeof toast === 'function'){
        toast(removed > 0 ? 'Dagens billede er nulstillet' : 'Dagens fotostatus er nulstillet');
      }
    }catch(error){}
  }

  function install(){
    if(!devMode()){
      var existing = document.getElementById('resetDailyPhotoFull');
      if(existing) existing.remove();
      return;
    }
    if(document.getElementById('resetDailyPhotoFull')) return;

    var pane = document.getElementById('pane-settings');
    if(!pane) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.id = 'resetDailyPhotoFull';
    button.className = 'btn-outline danger';
    button.style.marginTop = '12px';
    button.innerHTML = '<svg class="icn" width="14" height="14" viewBox="0 0 24 24" fill="none" style="vertical-align:-3px"><path d="M4 12a8 8 0 1 0 2.3-5.7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M4 5v5h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg> Nulstil dagens billede';
    button.setAttribute('aria-label','Nulstil dagens billede fuldstændigt');

    var note = document.createElement('div');
    note.id = 'resetDailyPhotoFullNote';
    note.className = 'set-sub';
    note.style.margin = '6px 2px 0';
    note.textContent = 'Fjerner dagens foto, frigiver hexagonen og gør appen klar til et nyt dagsfoto.';

    button.addEventListener('click',function(){
      var english = document.documentElement.lang === 'en';
      var message = english
        ? 'Reset today’s photo completely? Today’s photo and claimed hex will be removed.'
        : 'Nulstil dagens billede helt? Dagens foto og den claimed hexagon bliver fjernet.';
      if(window.confirm(message)) resetToday();
    });

    var developerHeading = Array.prototype.find.call(pane.querySelectorAll('.eyebrow'),function(el){
      return /Udvikler|Developer/i.test(el.textContent || '');
    });
    if(developerHeading){
      pane.insertBefore(note,developerHeading);
      pane.insertBefore(button,note);
    }else{
      pane.appendChild(button);
      pane.appendChild(note);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
  window.addEventListener('streg:startup-complete',install);
  setTimeout(install,850);
})();
