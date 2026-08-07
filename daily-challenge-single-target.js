(function(){
  'use strict';

  if(window.__stregSingleTargetCleanupInstalled) return;
  window.__stregSingleTargetCleanupInstalled = true;

  function isSingleTargetCount(value){
    var text = String(value || '')
      .replace(/\u00a0/g,' ')
      .replace(/\s+/g,' ')
      .trim()
      .toLowerCase();

    return /^(0|1)\s*\/\s*1$/.test(text) ||
      /^(0|1)\s*(?:out of|of|ud af)\s*1$/.test(text);
  }

  function hideCountElement(element){
    if(!element || element.dataset.singleTargetCountHidden === 'true') return;
    element.dataset.singleTargetCountHidden = 'true';
    element.setAttribute('aria-hidden','true');
    element.style.setProperty('display','none','important');
  }

  function removeStandaloneCounts(root){
    if(!root) return;

    Array.prototype.forEach.call(root.querySelectorAll('*'),function(element){
      if(isSingleTargetCount(element.textContent) && element.children.length === 0){
        hideCountElement(element);
      }
    });

    var walker = document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    var nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function(node){
      if(!isSingleTargetCount(node.nodeValue)) return;
      var parent = node.parentElement;
      if(parent && parent.childNodes.length === 1){
        hideCountElement(parent);
      }else{
        node.nodeValue = '';
      }
    });
  }

  function cleanHomeDailyCards(){
    var hub = document.getElementById('homeChallengeHub');
    if(!hub) return;

    Array.prototype.forEach.call(
      hub.querySelectorAll('.home-extra-challenge:not(.is-event),.home-extra-challenge[data-challenge-type="normal"]'),
      function(card){
        var count = card.querySelector('.home-extra-challenge-count');
        if(count) hideCountElement(count);
        removeStandaloneCounts(card);
      }
    );

    var featured = document.getElementById('featuredChallengeCard');
    if(featured) removeStandaloneCounts(featured);
  }

  function cleanDailyChallengeTab(){
    var dailyList = document.getElementById('challengeList');
    if(!dailyList) return;
    Array.prototype.forEach.call(dailyList.children,function(card){
      removeStandaloneCounts(card);
    });
  }

  function clean(){
    cleanHomeDailyCards();
    cleanDailyChallengeTab();
  }

  var observers = [];
  var queued = false;
  function queueClean(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(function(){
      queued = false;
      clean();
    });
  }

  function observeRoot(root){
    if(!root || root.dataset.singleTargetObserved === 'true') return;
    root.dataset.singleTargetObserved = 'true';
    var observer = new MutationObserver(queueClean);
    observer.observe(root,{childList:true,subtree:true,characterData:true});
    observers.push(observer);
  }

  function install(){
    clean();
    observeRoot(document.getElementById('homeChallengeHub'));
    observeRoot(document.getElementById('featuredChallengeCard'));
    observeRoot(document.getElementById('challengeList'));
  }

  window.cleanSingleTargetChallengeCounts = clean;
  window.addEventListener('streg:startup-complete',install);
  window.addEventListener('streg:languagechange',queueClean);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) queueClean(); });

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
  setTimeout(install,650);
})();
