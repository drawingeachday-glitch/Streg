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
  loadRuntimeFeature('challenge-circle-fix.js','stregChallengeCircleFixRuntime','20260807-1');
  loadRuntimeFeature('theme-audio.js','stregThemeAudioRuntime','20260807-2');

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

    try{
      if(window.I18n && typeof window.I18n.apply === 'function') window.I18n.apply(document.body);
    }catch(error){}
  }

  function clearDailyPhoto(){
    var app = state();
    if(!app) return false;

    var today = todayKey();
    app.lastDay = yesterdayKey();

    if(app.challenges && app.challenges.day === today){
      app.challenges.day = null;
    }

    if(app.events && typeof app.events === 'object'){
      Object.keys(app.events).forEach(function(key){
        var event = app.events[key];
        if(event && event.day === today){
          event.day = null;
        }
      });
    }

    saveAndRefresh();
    return true;
  }

  function applyButton(button){
    if(!button) return;
    if(button.dataset.dailyResetBound === '1') return;
    button.dataset.dailyResetBound = '1';
    button.addEventListener('click',function(){
      if(!clearDailyPhoto()) return;
      try{ if(typeof SFX !== 'undefined' && SFX.pop) SFX.pop(); }catch(error){}
      try{ if(typeof vibrate === 'function') vibrate([20,24,46]); }catch(error){}
      try{ if(typeof toast === 'function') toast('Dagens billede er låst op igen'); }catch(error){}
    });
  }

  function install(){
    applyButton(document.getElementById('devUnlock'));

    var observer = new MutationObserver(function(){
      applyButton(document.getElementById('devUnlock'));
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }

  window.STREG_DAILY_PHOTO_RESET = {
    clear:clearDailyPhoto,
    dayKey:dayKey,
    todayKey:todayKey,
    photoDay:photoDay
  };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
