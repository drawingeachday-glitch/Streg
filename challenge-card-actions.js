(function(){
  'use strict';

  var pendingRewardSource = null;
  var celebrationWrapped = false;
  var originalCelebrationPlay = null;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function isEnglish(){
    try{ return window.I18n && window.I18n.getLanguage && window.I18n.getLanguage() === 'en'; }catch(error){}
    return document.documentElement.lang === 'en';
  }

  function rectCopy(rect){
    return rect ? {left:rect.left,top:rect.top,width:rect.width,height:rect.height} : null;
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

  function rewardNumbers(card){
    var xp = 0;
    var coins = 0;
    var reward = card && card.querySelector('.ch-reward,.prog-reward');
    var text = reward ? reward.textContent || '' : '';
    var xpMatch = text.match(/\+\s*(\d+)\s*XP/i);
    if(xpMatch) xp = Number(xpMatch[1]) || 0;
    var coinMatch = text.match(/XP[^\d+]*\+\s*(\d+)/i);
    if(coinMatch) coins = Number(coinMatch[1]) || 0;
    return {xp:xp,coins:coins};
  }

  function rememberSource(card){
    if(!card) return;
    var reward = rewardNumbers(card);
    pendingRewardSource = {
      rect:rectCopy(card.getBoundingClientRect()),
      xp:reward.xp,
      coins:reward.coins,
      at:Date.now(),
      type:card.classList.contains('ch-card') ? 'daily' : 'claim'
    };

    try{
      if(window.StregXpBar && window.StregXpBar.setSourceRect){
        window.StregXpBar.setSourceRect(pendingRewardSource.rect);
      }
    }catch(error){}
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
    rememberSource(card);
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
      '#tab-challenges .prog-card.streg-card-actionable.ready,#tab-challenges .event-daily-card.streg-card-actionable.ready{border-color:color-mix(in srgb,var(--moss) 34%,var(--line))!important;}',
      '.streg-claim-ghost{position:fixed;z-index:1000005;pointer-events:none;border-radius:20px;border:1px solid rgba(103,171,118,.5);background:linear-gradient(145deg,rgba(255,255,255,.97),rgba(230,246,232,.95));box-shadow:0 16px 42px -22px rgba(28,74,42,.58),0 0 0 1px rgba(255,255,255,.75) inset;overflow:hidden;transform-origin:center;}',
      '[data-theme="dark"] .streg-claim-ghost{background:linear-gradient(145deg,rgba(26,36,41,.98),rgba(29,54,39,.96));}',
      '.streg-claim-ghost::before{content:"";position:absolute;inset:-35%;background:linear-gradient(110deg,transparent 34%,rgba(255,255,255,.72) 49%,transparent 64%);transform:translateX(-80%) rotate(8deg);animation:stregClaimSweep .62s ease-out forwards;}',
      '.streg-claim-check{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;color:#fff;background:linear-gradient(145deg,#5D9668,#3E7550);box-shadow:0 0 0 7px rgba(83,145,99,.12),0 7px 20px rgba(42,102,61,.28);font:1000 20px/1 sans-serif;transform:translate(-50%,-50%) scale(.3);opacity:0;animation:stregClaimCheck .48s .08s cubic-bezier(.2,1.35,.3,1) forwards;}',
      '.streg-reward-coin{position:fixed;z-index:1000007;left:0;top:0;width:17px;height:17px;border-radius:50%;border:1px solid #B77917;background:radial-gradient(circle at 35% 28%,#FFF2A8 0 15%,#FFD85F 24%,#E9A92C 66%,#BC7416 100%);box-shadow:0 0 8px rgba(239,177,48,.42),0 3px 8px rgba(79,52,9,.22);pointer-events:none;will-change:transform,opacity;}',
      '.streg-reward-coin::after{content:"$";position:absolute;inset:0;display:grid;place-items:center;color:#8B5D10;font:1000 9px/1 sans-serif;}',
      '@keyframes stregClaimSweep{to{transform:translateX(145%) rotate(8deg)}}',
      '@keyframes stregClaimCheck{0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(-18deg)}65%{opacity:1;transform:translate(-50%,-50%) scale(1.14) rotate(2deg)}100%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0)}}',
      '@media(prefers-reduced-motion:reduce){.streg-claim-ghost::before,.streg-claim-check{animation:none!important}.streg-claim-check{opacity:1!important;transform:translate(-50%,-50%)!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  function animateGhost(rect){
    if(!rect || reduceMotion) return;
    var ghost = document.createElement('div');
    ghost.className = 'streg-claim-ghost';
    ghost.style.left = rect.left + 'px';
    ghost.style.top = rect.top + 'px';
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    ghost.innerHTML = '<span class="streg-claim-check">✓</span>';
    document.body.appendChild(ghost);
    ghost.animate([
      {transform:'scale(1)',opacity:.98},
      {transform:'scale(1.018)',opacity:1,offset:.35},
      {transform:'scale(.995)',opacity:1,offset:.72},
      {transform:'scale(.985)',opacity:0}
    ],{duration:760,easing:'cubic-bezier(.18,.82,.22,1)',fill:'forwards'}).finished.catch(function(){}).then(function(){ ghost.remove(); });
  }

  function flyCoins(rect,amount){
    if(!rect || !amount || reduceMotion) return;
    var targetEl = document.getElementById('homeStatCoinsWrap') || document.getElementById('topCoinsWrap');
    if(!targetEl) return;
    var target = targetEl.getBoundingClientRect();
    var tx = target.left + target.width*.5;
    var ty = target.top + target.height*.5;
    var count = Math.max(5,Math.min(10,Math.round(amount/10)+4));

    for(var i=0;i<count;i+=1){
      (function(index){
        var coin = document.createElement('span');
        coin.className = 'streg-reward-coin';
        document.body.appendChild(coin);
        var sx = rect.left + rect.width*(.2 + Math.random()*.6) - 8;
        var sy = rect.top + rect.height*(.45 + Math.random()*.28) - 8;
        var popX = (Math.random()-.5)*(60 + rect.width*.18);
        var popY = -(24 + Math.random()*46);
        var midX = sx + (tx-sx)*.55 + (Math.random()-.5)*60;
        var midY = sy + (ty-sy)*.48 - 18 - Math.random()*30;
        var delay = 45 + index*48 + Math.random()*30;
        coin.animate([
          {transform:'translate3d('+sx+'px,'+sy+'px,0) scale(.2) rotate(0deg)',opacity:0},
          {transform:'translate3d('+(sx+popX)+'px,'+(sy+popY)+'px,0) scale(1.08) rotate('+(120+Math.random()*140)+'deg)',opacity:1,offset:.22},
          {transform:'translate3d('+midX+'px,'+midY+'px,0) scale(.88) rotate('+(260+Math.random()*120)+'deg)',opacity:1,offset:.68},
          {transform:'translate3d('+(tx-8)+'px,'+(ty-8)+'px,0) scale(.18) rotate(520deg)',opacity:0}
        ],{duration:650+Math.random()*180,delay:delay,easing:'cubic-bezier(.18,.76,.18,1)',fill:'forwards'}).finished.catch(function(){}).then(function(){ coin.remove(); });
      })(i);
    }
  }

  function compactCelebration(data){
    var source = pendingRewardSource;
    pendingRewardSource = null;

    if(!source || Date.now() - source.at > 20000){
      if(originalCelebrationPlay) return originalCelebrationPlay.call(window.ChallengeCelebration,data);
      return;
    }

    var rect = source.rect;
    var xp = Number(data && data.xp) || source.xp || 0;
    var coins = Number(data && data.coins) || source.coins || 0;

    animateGhost(rect);
    flyCoins(rect,coins);
    try{
      if(window.StregXpBar && window.StregXpBar.setSourceRect) window.StregXpBar.setSourceRect(rect);
    }catch(error){}

    try{
      if(typeof SFX !== 'undefined' && SFX){
        if(typeof SFX.success === 'function') SFX.success();
        setTimeout(function(){ if(coins && typeof SFX.coins === 'function') SFX.coins(Math.min(4,coins)); },180);
      }
    }catch(error){}
  }

  function wrapCelebration(){
    if(celebrationWrapped) return;
    var celebration = window.ChallengeCelebration;
    if(!celebration || typeof celebration.play !== 'function') return;

    originalCelebrationPlay = celebration.play;
    celebration.play = function(data){
      if(pendingRewardSource) return compactCelebration(data || {});
      return originalCelebrationPlay.apply(this,arguments);
    };
    celebrationWrapped = true;
  }

  document.addEventListener('click',function(event){
    var card = cardFrom(event.target);
    if(!card) return;

    if(clickedInteractiveChild(event.target,card)){
      var childAction = actionFor(card);
      if(childAction && (event.target === childAction || childAction.contains(event.target))) rememberSource(card);
      return;
    }

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
      wrapCelebration();
    });
  }

  function install(){
    installStyles();
    decorate();
    wrapCelebration();

    var tab = document.getElementById('tab-challenges');
    if(tab && !observer){
      observer = new MutationObserver(queueDecorate);
      observer.observe(tab,{childList:true,subtree:true,attributes:true,attributeFilter:['class','disabled']});
    }
  }

  window.refreshChallengeCardActions = decorate;
  window.addEventListener('streg:startup-complete',function(){ queueDecorate(); wrapCelebration(); });
  window.addEventListener('streg:languagechange',queueDecorate);

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
  setTimeout(install,700);
  setTimeout(wrapCelebration,1200);
})();
