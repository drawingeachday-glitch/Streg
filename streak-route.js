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
      milestone:'NÆSTE MILEPÆL',
      checkpoint:'NÆSTE CHECKPOINT',
      checkpointName:'Checkpoint',
      day:'dag',
      daysLeft:function(value){ return value === 1 ? '1 dag igen' : value + ' dage igen'; },
      done:'Dagens foto er sikret',
      waiting:'Dagens foto venter',
      start:'Start din streak i dag',
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
      milestone:'NEXT MILESTONE',
      checkpoint:'NEXT CHECKPOINT',
      checkpointName:'Checkpoint',
      day:'day',
      daysLeft:function(value){ return value === 1 ? '1 day left' : value + ' days left'; },
      done:"Today's photo is secured",
      waiting:"Today's photo is waiting",
      start:'Start your streak today',
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

  function isTodayDone(state){
    try{
      if(typeof dailyDone === 'function') return !!dailyDone();
    }catch(error){}
    var now = new Date().toISOString().slice(0,10);
    return state.lastDay === now;
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

  function renderRoute(){
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
    var done = isTodayDone(state);
    var target = getTarget(streak);
    var start = Math.max(1,target.day - 6);
    var remaining = Math.max(0,target.day - streak);
    var targetName = target.milestone ? target.milestone[language] : t.checkpointName;
    var progress = target.day === start ? 100 : Math.max(0,Math.min(100,((streak - start) / (target.day - start)) * 100));

    setText('streakHeroBest',String(best));
    setText('streakHeroBestLabel',t.best);
    setText('streakHeroShields',String(shields));
    setText('streakHeroShieldsLabel',t.shields);
    setText('streakRouteKicker',target.milestone ? t.milestone : t.checkpoint);
    setText('streakRouteTarget',targetName + ' · ' + t.day + ' ' + target.day);
    setText('streakRouteRemaining',t.daysLeft(remaining));
    setText('streakTodayStatusText',streak === 0 && !done ? t.start : (done ? t.done : t.waiting));
    setText('streakJourneyLabel',t.journey);

    hero.classList.toggle('is-today-complete',done);
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