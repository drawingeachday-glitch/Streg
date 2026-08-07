(function(){
  'use strict';

  function isEnglish(){
    try{ return window.I18n && window.I18n.getLanguage && window.I18n.getLanguage() === 'en'; }catch(error){}
    return document.documentElement.lang === 'en';
  }

  function actionFor(card){
    if(!card) return null;

    if(card.classList.contains('ch-card')){
      if(card.classList.contains('done')) return null;
      return card.querySelector('.ch-btn.start:not(:disabled)');
    }

    if(card.classList.contains('prog-card')){
      return card.querySelector('.reward-claim-btn.ready:not(:disabled)');
    }

    if(card.classList.contains('event-daily-card')){
      return card.querySelector('.event-daily-action.ready:not(:disabled)');
    }

    return null;
  }

  function labelFor(card){
    if(card.classList.contains('ch-card')){
      return isEnglish() ? 'Open camera for this challenge' : 'Åbn kamera til denne challenge';
    }
    return isEnglish() ? 'Claim this reward' : 'Hent denne belønning';
  }

  function decorateCard(card){
    var action = actionFor(card);
    var wasManaged = card.dataset.stregCardAction === 'true';

    if(action){
      card.dataset.stregCardAction = 'true';
      card.classList.add('streg-card-actionable');
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
      card.setAttribute('aria-label',labelFor(card));
      return;
    }

    if(wasManaged){
      delete card.dataset.stregCardAction;
      card.classList.remove('streg-card-actionable');
      card.removeAttribute('role');
      card.removeAttribute('tabindex');
      card.removeAttribute('aria-label');
    }
  }

  function decorate(){
    document.querySelectorAll(
      '#challengeList .ch-card,#weeklyList .prog-card,#monthlyList .prog-card,#eventDailyList .event-daily-card'
    ).forEach(decorateCard);
  }

  function cardFrom(target){
    if(!target || !target.closest) return null;
    return target.closest(
      '#challengeList .ch-card,#weeklyList .prog-card,#monthlyList .prog-card,#eventDailyList .event-daily-card'
    );
  }

  function clickedInteractiveChild(target,card){
    if(!target || !target.closest) return false;
    var interactive = target.closest('button,a,input,select,textarea,[role="button"]');
    return !!(interactive && interactive !== card);
  }

  function runCardAction(card){
    var action = actionFor(card);
    if(!action) return false;
    action.click();
    return true;
  }

  function installStyles(){
    if(document.getElementById('challengeCardActionStyles')) return;
    var style = document.createElement('style');
    style.id = 'challengeCardActionStyles';
    style.textContent = [
      '#tab-challenges .streg-card-actionable{cursor:pointer!important;-webkit-tap-highlight-color:transparent;}',
      '#tab-challenges .streg-card-actionable:focus-visible{outline:2px solid color-mix(in srgb,var(--amber) 72%,#fff)!important;outline-offset:3px!important;}',
      '#tab-challenges .prog-card.streg-card-actionable:focus-visible,#tab-challenges .event-daily-card.streg-card-actionable:focus-visible{outline-color:color-mix(in srgb,var(--moss) 72%,#fff)!important;}',
      '#tab-challenges .streg-card-actionable:active{transform:scale(.988)!important;}',
      '#tab-challenges .prog-card.streg-card-actionable.ready,#tab-challenges .event-daily-card.streg-card-actionable.ready{border-color:color-mix(in srgb,var(--moss) 34%,var(--line))!important;}'
    ].join('');
    document.head.appendChild(style);
  }

  document.addEventListener('click',function(event){
    var card = cardFrom(event.target);
    if(!card || clickedInteractiveChild(event.target,card)) return;
    runCardAction(card);
  });

  document.addEventListener('keydown',function(event){
    if(event.key !== 'Enter' && event.key !== ' ') return;
    var card = cardFrom(event.target);
    if(!card || event.target !== card) return;
    if(runCardAction(card)) event.preventDefault();
  });

  var observer = null;
  var queued = false;
  function queueDecorate(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(function(){
      queued = false;
      decorate();
    });
  }

  function install(){
    installStyles();
    decorate();

    var tab = document.getElementById('tab-challenges');
    if(tab && !observer){
      observer = new MutationObserver(queueDecorate);
      observer.observe(tab,{childList:true,subtree:true,attributes:true,attributeFilter:['class','disabled']});
    }
  }

  window.refreshChallengeCardActions = decorate;
  window.addEventListener('streg:startup-complete',queueDecorate);
  window.addEventListener('streg:languagechange',queueDecorate);

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
  setTimeout(install,700);
})();
