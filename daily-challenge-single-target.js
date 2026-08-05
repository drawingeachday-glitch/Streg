(function(){
  'use strict';

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

    /* Normal Home challenges are always single-photo missions. The Event card
       keeps its counter because event challenges may use real progression. */
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
    /* Only Daily cards lose 0/1. Weekly, Monthly and Event retain their
       progress counters because those challenges can require several actions. */
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

  var observer;
  function install(){
    clean();
    if(observer) return;

    observer = new MutationObserver(function(){
      requestAnimationFrame(clean);
    });
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  }

  window.cleanSingleTargetChallengeCounts = clean;
  window.addEventListener('streg:startup-complete',clean);
  window.addEventListener('streg:languagechange',clean);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) clean(); });

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
  setTimeout(install,600);
})();
