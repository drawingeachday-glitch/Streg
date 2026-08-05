(function(){
  'use strict';

  function loadRuntimeFeature(path,id,version){
    if(document.getElementById(id)) return;
    var script = document.createElement('script');
    script.id = id;
    script.src = new URL(path,document.baseURI).href + '?v=' + encodeURIComponent(version);
    script.defer = true;
    script.dataset.runtimeFeature = 'true';
    document.head.appendChild(script);
  }

  loadRuntimeFeature('home-challenges.js','stregHomeChallengesRuntime','20260805-4');
  loadRuntimeFeature('challenge-page-redesign.js','stregChallengePageRedesignRuntime','20260805-2');
  loadRuntimeFeature('daily-challenge-single-target.js','stregDailySingleTargetRuntime','20260805-1');
  loadRuntimeFeature('event-tab-redesign.js','stregEventTabRedesignRuntime','20260805-1');
  loadRuntimeFeature('inventory.js','stregInventoryRuntime','20260805-1');

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
    if(!appState) return;

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
  setTimeout(install,800);
  setInterval(install,1500);
})();
