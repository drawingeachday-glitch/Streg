(function(){
  'use strict';

  var milestoneNames = {
    7:{da:'Første Flamme',en:'First Flame'},
    14:{da:'Stabil Glød',en:'Steady Glow'},
    30:{da:'Måneglød',en:'Moon Glow'},
    50:{da:'Flare Sprint',en:'Flare Sprint'},
    100:{da:'Century Core',en:'Century Core'},
    150:{da:'Gilded Orbit',en:'Gilded Orbit'},
    200:{da:'Mythic Signal',en:'Mythic Signal'},
    250:{da:'Nebula Drive',en:'Nebula Drive'},
    300:{da:'Celestial Crown',en:'Celestial Crown'},
    365:{da:'Eternal Year',en:'Eternal Year'}
  };

  var copy = {
    da:{
      best:'bedste',
      shields:'skjolde',
      checkpointName:'Checkpoint',
      day:'dag',
      reward:'BELØNNING',
      journey:'Se din rejse',
      route:function(start,end){ return 'Streak-rute fra dag ' + start + ' til dag ' + end; },
      node:function(day,state){ return 'Dag ' + day + ', ' + state; },
      completed:'klaret',
      current:'nuværende streak',
      next:'næste dag',
      future:'ikke klaret endnu'
    },
    en:{
      best:'best',
      shields:'shields',
      checkpointName:'Checkpoint',
      day:'day',
      reward:'REWARD',
      journey:'See your journey',
      route:function(start,end){ return 'Streak route from day ' + start + ' to day ' + end; },
      node:function(day,state){ return 'Day ' + day + ', ' + state; },
      completed:'complete',
      current:'current streak',
      next:'next day',
      future:'not complete yet'
    }
  };

  function getLanguage(){
    if(window.I18n && typeof window.I18n.getLanguage === 'function'){
      return window.I18n.getLanguage() === 'en' ? 'en' : 'da';
    }
    return document.documentElement.lang === 'en' ? 'en' : 'da';
  }

  function getState(){
    try{
      if(typeof S !== 'undefined' && S) return S;
    }catch(error){}
    return {};
  }

  function getTarget(streak){
    var milestoneDays = Object.keys(milestoneNames).map(Number).sort(function(a,b){ return a-b; });
    var nextMilestone = null;
    for(var i=0;i<milestoneDays.length;i++){
      if(milestoneDays[i] > streak){
        nextMilestone = milestoneDays[i];
        break;
      }
    }

    var nextWeek = Math.ceil((streak + 1) / 7) * 7;
    if(nextWeek < 7) nextWeek = 7;
    var target = nextMilestone ? Math.min(nextMilestone,nextWeek) : nextWeek;
    return {
      day:target,
      milestone:milestoneNames[target] || null
    };
  }

  function setText(id,value){
    var element = document.getElementById(id);
    if(element) element.textContent = value;
  }

  function updateHeroCopy(){
    var hero = document.getElementById('streakCommandHero');
    if(!hero) return;

    var title = hero.querySelector('.hero-lr-title');
    if(title){
      title.textContent = 'Daily Streak';
      title.setAttribute('data-i18n-skip','');
    }

    var subtitle = hero.querySelector('.hero-lr-sub');
    if(subtitle){
      subtitle.textContent = '';
      subtitle.hidden = true;
      subtitle.setAttribute('aria-hidden','true');
    }

    var description = document.getElementById('streakSub');
    if(description){
      description.textContent = '';
      description.hidden = true;
      description.setAttribute('aria-hidden','true');
    }
  }

  function installRewardStyles(){
    if(document.getElementById('streakRouteRewardStyles')) return;

    var style = document.createElement('style');
    style.id = 'streakRouteRewardStyles';
    style.textContent = [
      '#streakRouteKicker,#streakRouteRemaining,.streak-today-status{display:none!important;}',
      '.streak-command-hero{grid-template-columns:132px minmax(175px,.72fr) minmax(292px,1.28fr)!important;}',
      '.streak-command-hero .hero-flame-outline{width:128px!important;height:142px!important;margin-left:-10px!important;}',
      '.streak-command-hero .hero-flame-num{font-size:46px!important;padding-top:18px!important;}',
      '.streak-command-hero .hero-lr-title{font-size:34px!important;line-height:1.04!important;letter-spacing:-.025em;}',
      '.streak-route-head{justify-content:flex-start!important;}',
      '.streak-route-footer{justify-content:center!important;margin-top:10px;}',
      '.streak-journey-link{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;width:150px!important;min-height:32px!important;padding:6px 12px!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:999px!important;color:var(--streak-route-text)!important;background:linear-gradient(145deg,rgba(255,255,255,.13),rgba(255,255,255,.055))!important;box-shadow:inset 0 1px rgba(255,255,255,.1),0 7px 15px rgba(0,0,0,.14)!important;font-size:11px!important;font-weight:950!important;letter-spacing:.01em;opacity:1!important;backdrop-filter:blur(10px);}',
      '.streak-journey-link:hover{transform:translateY(-1px)!important;box-shadow:inset 0 1px rgba(255,255,255,.14),0 9px 18px rgba(0,0,0,.2),0 0 12px color-mix(in srgb,var(--streak-flame-main) 16%,transparent)!important;}',
      '.streak-journey-link svg{width:12px!important;height:12px!important;}',
      '.streak-journey-link span{display:inline!important;}',
      '.streak-route-node.is-milestone-reward{padding-bottom:13px;}',
      '.streak-route-reward-badge{position:absolute;z-index:4;top:-7px;left:calc(50% + 4px);display:grid;place-items:center;width:17px;height:17px;border:1px solid rgba(255,255,255,.55);border-radius:50%;color:#24130a;background:linear-gradient(145deg,#fff0a7,#f6b73f 52%,#e47a20);box-shadow:0 0 0 2px rgba(255,255,255,.08),0 0 15px rgba(255,184,63,.52),0 4px 10px rgba(0,0,0,.3);animation:streakRewardPulse 2.2s ease-in-out infinite;}',
      '.streak-route-reward-badge svg{width:10px;height:10px;stroke-width:2.2;}',
      '.streak-route-reward-label{display:block;margin-top:-2px;color:#ffd978;font-size:6.5px;font-weight:950;letter-spacing:.11em;line-height:1;text-transform:uppercase;text-shadow:0 0 8px rgba(255,190,72,.35);}',
      '.capture-slider>.capture-panel:first-child{position:relative!important;padding:0!important;overflow:visible!important;}',
      '#capIcon:has(#miniRealMapCard){width:min(100%,980px)!important;height:430px!important;max-width:none!important;margin:0 auto!important;border:0!important;border-radius:28px!important;overflow:hidden!important;box-shadow:0 28px 68px rgba(11,18,24,.3)!important;}',
      '#capIcon:has(#miniRealMapCard) .mini-real-map-card{border-radius:inherit!important;}',
      '#capIcon:has(#miniRealMapCard) .mini-real-map-shade{background:linear-gradient(to top,rgba(7,10,15,.88) 0%,rgba(7,10,15,.34) 36%,transparent 68%)!important;}',
      '#capIcon:has(#miniRealMapCard)~#capTitle,#capIcon:has(#miniRealMapCard)~#capHint{display:none!important;}',
      '#capIcon:has(#miniRealMapCard) .mini-real-map-open{display:none!important;}',
      '#capIcon:has(#miniRealMapCard) .mini-real-map-bottom{top:14px!important;right:auto!important;bottom:auto!important;left:14px!important;width:auto!important;padding:7px 11px!important;border-radius:999px!important;background:rgba(6,10,15,.58)!important;box-shadow:0 8px 22px rgba(0,0,0,.22)!important;backdrop-filter:blur(12px);}',
      '#capIcon:has(#miniRealMapCard) .mini-real-map-copy{color:#fff!important;text-shadow:0 1px 6px rgba(0,0,0,.75)!important;}',
      '#capIcon:has(#miniRealMapCard)~.capture-actions{position:absolute!important;z-index:12!important;left:50%!important;bottom:24px!important;display:flex!important;justify-content:center!important;gap:12px!important;width:max-content!important;max-width:calc(100% - 32px)!important;margin:0!important;transform:translateX(-50%)!important;}',
      '#capIcon:has(#miniRealMapCard)~.capture-actions .btn{min-width:138px!important;padding:14px 25px!important;border-radius:14px!important;box-shadow:0 13px 30px rgba(0,0,0,.32)!important;}',
      '#capIcon:has(#miniRealMapCard)~.capture-actions .btn-test-photo{background:rgba(255,255,255,.92)!important;backdrop-filter:blur(12px);}',
      '@keyframes streakRewardPulse{0%,100%{transform:translateY(0) scale(1);filter:brightness(1)}50%{transform:translateY(-1px) scale(1.08);filter:brightness(1.12)}}',
      '@media(max-width:720px){.streak-command-hero{grid-template-columns:112px minmax(0,1fr)!important}.streak-command-hero .hero-flame-outline{width:112px!important;height:126px!important;margin-left:-6px!important}.streak-command-hero .hero-flame-num{font-size:40px!important;padding-top:16px!important}.streak-command-hero .hero-lr-title{font-size:29px!important}.streak-journey-link{width:150px!important;font-size:11px!important;min-height:32px!important}.streak-route-reward-badge{top:-6px;width:15px;height:15px}.streak-route-reward-badge svg{width:9px;height:9px}.streak-route-reward-label{font-size:6px}#capIcon:has(#miniRealMapCard){height:360px!important;border-radius:24px!important}#capIcon:has(#miniRealMapCard)~.capture-actions{bottom:20px!important}#capIcon:has(#miniRealMapCard)~.capture-actions .btn{min-width:124px!important;padding:13px 20px!important}}',
      '@media(max-width:430px){.streak-command-hero{grid-template-columns:96px minmax(0,1fr)!important}.streak-command-hero .hero-flame-outline{width:104px!important;height:118px!important;margin-left:-7px!important}.streak-command-hero .hero-flame-num{font-size:38px!important;padding-top:15px!important}.streak-command-hero .hero-lr-title{font-size:26px!important}.streak-route-footer{margin-top:9px!important}.streak-journey-link{width:145px!important;min-height:30px!important;padding:5px 10px!important;font-size:10.5px!important}.streak-journey-link svg{width:12px!important;height:12px!important}#capIcon:has(#miniRealMapCard){height:310px!important;border-radius:22px!important}#capIcon:has(#miniRealMapCard) .mini-real-map-bottom{top:11px!important;left:11px!important}#capIcon:has(#miniRealMapCard)~.capture-actions{bottom:16px!important;gap:9px!important;max-width:calc(100% - 22px)!important}#capIcon:has(#miniRealMapCard)~.capture-actions .btn{min-width:112px!important;padding:12px 16px!important;font-size:13px!important;border-radius:13px!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  function simplifyRouteChrome(){
    var kicker = document.getElementById('streakRouteKicker');
    var remaining = document.getElementById('streakRouteRemaining');
    var status = document.querySelector('.streak-today-status');

    if(kicker){
      kicker.hidden = true;
      kicker.setAttribute('aria-hidden','true');
    }
    if(remaining){
      remaining.hidden = true;
      remaining.setAttribute('aria-hidden','true');
    }
    if(status){
      status.hidden = true;
      status.setAttribute('aria-hidden','true');
    }
  }

  function createRewardBadge(label){
    var badge = document.createElement('span');
    badge.className = 'streak-route-reward-badge';
    badge.setAttribute('aria-hidden','true');
    badge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 7v15"/><path d="M12 7H7.5A2.5 2.5 0 1 1 10 4.5L12 7Zm0 0h4.5A2.5 2.5 0 1 0 14 4.5L12 7Z"/></svg>';

    var text = document.createElement('span');
    text.className = 'streak-route-reward-label';
    text.textContent = label;

    return {badge:badge,text:text};
  }

  function renderRoute(){
    installRewardStyles();
    updateHeroCopy();
    simplifyRouteChrome();

    var hero = document.getElementById('streakCommandHero');
    var nodes = document.getElementById('streakRouteNodes');
    var fill = document.getElementById('streakRouteFill');
    if(!hero || !nodes || !fill) return;

    var state = getState();
    var language = getLanguage();
    var t = copy[language];
    var streak = Math.max(0,Number(state.streak) || 0);
    var best = Math.max(streak,Number(state.best) || 0);
    var shields = Math.max(0,Number(state.freezes) || 0);
    var target = getTarget(streak);
    var start = Math.max(1,target.day - 6);
    var targetName = target.milestone ? target.milestone[language] : t.checkpointName;
    var progress = target.day === start ? 100 : Math.max(0,Math.min(100,((streak - start) / (target.day - start)) * 100));

    setText('streakHeroBest',String(best));
    setText('streakHeroBestLabel',t.best);
    setText('streakHeroShields',String(shields));
    setText('streakHeroShieldsLabel',t.shields);
    setText('streakRouteTarget',targetName + ' · ' + t.day + ' ' + target.day);
    setText('streakJourneyLabel',t.journey);

    fill.style.width = progress.toFixed(2) + '%';

    var route = document.getElementById('streakRoute');
    if(route) route.setAttribute('aria-label',t.route(start,target.day));

    var fragment = document.createDocumentFragment();
    for(var day=start;day<=target.day;day++){
      var item = document.createElement('span');
      var stateLabel = t.future;
      item.className = 'streak-route-node';
      item.style.setProperty('--node-i',String(day - start));

      if(day <= streak){
        item.classList.add('is-complete');
        stateLabel = t.completed;
      }
      if(day === streak && streak > 0){
        item.classList.add('is-current');
        stateLabel = t.current;
      }
      if(day === streak + 1){
        item.classList.add('is-next');
        stateLabel = t.next;
      }
      if(day === target.day) item.classList.add('is-target');

      item.setAttribute('aria-label',t.node(day,stateLabel));

      var dot = document.createElement('span');
      dot.className = 'streak-route-dot';
      dot.textContent = String(day);

      var label = document.createElement('span');
      label.className = 'streak-route-day';
      label.textContent = t.day.charAt(0).toUpperCase() + t.day.slice(1) + ' ' + day;

      item.appendChild(dot);
      item.appendChild(label);

      if(day === target.day && target.milestone){
        var reward = createRewardBadge(t.reward);
        item.classList.add('is-milestone-reward');
        item.appendChild(reward.badge);
        item.appendChild(reward.text);
        item.setAttribute('aria-label',t.node(day,stateLabel) + ', ' + t.reward.toLowerCase());
      }

      fragment.appendChild(item);
    }

    nodes.replaceChildren(fragment);
  }

  function openJourney(){
    try{
      if(typeof switchTab === 'function'){
        switchTab('tab-journey');
        return;
      }
    }catch(error){}
    var button = document.querySelector('.tabbtn[data-tab="tab-journey"]');
    if(button) button.click();
  }

  function install(){
    var reminder = document.querySelector('.next-photo-sub');
    if(reminder) reminder.remove();

    installRewardStyles();
    updateHeroCopy();
    simplifyRouteChrome();

    var link = document.getElementById('streakJourneyLink');
    if(link && !link.dataset.streakRouteBound){
      link.dataset.streakRouteBound = 'true';
      link.addEventListener('click',openJourney);
    }

    if(typeof window.renderAll === 'function' && !window.renderAll.__streakRouteWrapped){
      var originalRenderAll = window.renderAll;
      var wrappedRenderAll = function(){
        var result = originalRenderAll.apply(this,arguments);
        renderRoute();
        return result;
      };
      wrappedRenderAll.__streakRouteWrapped = true;
      window.renderAll = wrappedRenderAll;
    }

    renderRoute();
  }

  window.renderStreakRoute = renderRoute;
  window.addEventListener('streg:languagechange',renderRoute);
  window.addEventListener('streg:startup-complete',renderRoute);
  document.addEventListener('visibilitychange',function(){
    if(!document.hidden) renderRoute();
  });

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
  requestAnimationFrame(renderRoute);
})();