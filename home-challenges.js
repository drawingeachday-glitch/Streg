(function(){
  'use strict';

  function getState(){
    try{ return typeof S !== 'undefined' && S ? S : null; }catch(error){ return null; }
  }

  function language(){
    try{
      if(window.I18n && typeof window.I18n.getLanguage === 'function'){
        return window.I18n.getLanguage() === 'en' ? 'en' : 'da';
      }
    }catch(error){}
    return document.documentElement.lang === 'en' ? 'en' : 'da';
  }

  function installStyles(){
    if(document.getElementById('homeChallengeHubStyles')) return;
    var style = document.createElement('style');
    style.id = 'homeChallengeHubStyles';
    style.textContent = [
      '#homeChallengeHub{display:grid;gap:10px;padding:10px;border:1px solid var(--line);border-radius:24px;background:var(--card);box-shadow:var(--shadow-s);transition:transform .18s ease,box-shadow .18s ease;}',
      '#homeChallengeHub:hover{transform:translateY(-1px);box-shadow:var(--shadow-m);}',
      '#homeChallengeHub #featuredChallengeCard{margin:0!important;border:0!important;box-shadow:none!important;border-radius:17px!important;background:var(--paper-2)!important;cursor:pointer!important;}',
      '.home-extra-challenge{display:grid;grid-template-columns:52px minmax(0,1fr) 22px;align-items:center;gap:12px;min-height:92px;padding:13px 14px;border:0;border-radius:17px;color:var(--ink);background:var(--paper-2);cursor:pointer;transition:transform .15s ease,filter .15s ease;}',
      '.home-extra-challenge:hover{transform:translateY(-1px);filter:brightness(1.015);}',
      '.home-extra-challenge:focus-visible{outline:3px solid color-mix(in srgb,var(--amber) 55%,transparent);outline-offset:2px;}',
      '.home-extra-challenge+.home-extra-challenge{border-top:1px solid var(--line);}',
      '.home-extra-challenge-icon{display:grid;place-items:center;width:50px;height:50px;border-radius:50%;color:var(--amber-2);background:linear-gradient(145deg,var(--amber-soft),var(--card));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--amber) 22%,transparent);}',
      '.home-extra-challenge-icon svg{width:25px;height:25px;}',
      '.home-extra-challenge-main{min-width:0;}',
      '.home-extra-challenge-title-line{display:flex;align-items:center;gap:7px;min-width:0;}',
      '.home-extra-challenge-title{overflow:hidden;color:var(--ink);font-size:14px;font-weight:850;line-height:1.22;text-overflow:ellipsis;white-space:nowrap;}',
      '.home-event-badge{flex:0 0 auto;padding:3px 6px;border:1px solid rgba(117,94,214,.24);border-radius:999px;color:#6552c7;background:rgba(117,94,214,.11);font-size:8px;font-weight:950;letter-spacing:.08em;line-height:1;text-transform:uppercase;}',
      '.home-extra-challenge-reward{display:block;margin-top:3px;color:var(--ink-soft);font-size:10.5px;font-weight:650;}',
      '.home-extra-challenge-progress{display:block;height:5px;margin-top:9px;overflow:hidden;border-radius:999px;background:var(--line);}',
      '.home-extra-challenge-progress>i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--amber),var(--amber-2));transition:width .35s ease;}',
      '.home-extra-challenge-count{display:block;margin-top:4px;color:var(--ink-soft);font-size:9px;font-weight:700;text-align:right;}',
      '.home-extra-challenge-arrow{color:var(--ink-soft);}',
      '.home-extra-challenge-arrow svg{width:18px;height:18px;}',
      '.home-extra-challenge.is-event{border:1px solid rgba(117,94,214,.18);background:linear-gradient(135deg,rgba(117,94,214,.075),rgba(58,183,210,.055)),var(--paper-2);}',
      '.home-extra-challenge.is-event .home-extra-challenge-icon{color:#6856d2;background:linear-gradient(145deg,rgba(135,111,238,.2),rgba(88,200,222,.12)),var(--card);box-shadow:inset 0 0 0 1px rgba(117,94,214,.2),0 0 18px rgba(117,94,214,.08);}',
      '.home-extra-challenge.is-event .home-extra-challenge-progress>i{background:linear-gradient(90deg,#735ed7,#35b8d0);}',
      '#homeChallengeHub .is-done .home-extra-challenge-icon{color:var(--moss-dark);background:var(--moss-soft);}',
      '#homeChallengeHub .is-done .home-extra-challenge-progress>i{background:var(--moss);}',
      '#streakJourneyLink,.streak-journey-link,#streakCommandHero .streak-route-footer{display:none!important;}',
      '#streakCommandHero .streak-route-panel{padding:11px 15px 7px!important;}',
      '#streakCommandHero .streak-route{margin:10px 1px 1px!important;}',
      '#streakCommandHero.streak-command-hero{padding-bottom:12px!important;}',
      '#streakCommandHero.streak-photo-pending .streak-route-node.is-current .streak-route-dot{filter:grayscale(1) saturate(0)!important;color:#c7ccd0!important;background:#343b40!important;border-color:#5f686f!important;box-shadow:none!important;}',
      '#streakCommandHero.streak-photo-pending .streak-route-node.is-current .streak-route-day{color:#7d858b!important;opacity:.72!important;}',
      '#streakCommandHero.streak-photo-pending .streak-route-node.is-current{filter:grayscale(1) saturate(0)!important;}',
      '@media(max-width:720px){#streakCommandHero .streak-route-panel{margin-top:0!important;padding:10px 13px 6px!important;}#streakCommandHero .streak-route{margin:9px 0 0!important;}#streakCommandHero.streak-command-hero{padding-bottom:10px!important;}}',
      '@media(max-width:520px){#homeChallengeHub{padding:8px;border-radius:21px}.home-extra-challenge{grid-template-columns:46px minmax(0,1fr) 19px;min-height:84px;padding:11px 12px}.home-extra-challenge-icon{width:44px;height:44px}.home-extra-challenge-icon svg{width:22px;height:22px}.home-extra-challenge-title{font-size:13px}}',
      '@media(max-width:430px){#streakCommandHero .streak-route-panel{padding:9px 11px 5px!important;}#streakCommandHero .streak-route{margin:8px 0 0!important;}#streakCommandHero.streak-command-hero{padding-bottom:8px!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function compactMilestone(){
    var link = document.getElementById('streakJourneyLink') || document.querySelector('.streak-journey-link');
    if(link) link.remove();

    var footer = document.querySelector('#streakCommandHero .streak-route-footer');
    if(footer){
      footer.hidden = true;
      footer.setAttribute('aria-hidden','true');
      footer.style.display = 'none';
    }
  }

  function switchToChallenges(){
    try{
      if(typeof switchTab === 'function'){
        switchTab('tab-challenges');
        return;
      }
    }catch(error){}
    var tab = document.querySelector('.tabbtn[data-tab="tab-challenges"]');
    if(tab) tab.click();
  }

  function openChallengePane(paneId){
    switchToChallenges();
    setTimeout(function(){
      var button = document.querySelector('#challengeSubtabs [data-ch-pane="' + paneId + '"]');
      if(button && typeof button.click === 'function') button.click();
    },120);
  }

  function openNormalChallenges(event){
    if(event) event.stopPropagation();
    openChallengePane('pane-ch-daily');
  }

  function openEventChallenges(event){
    if(event) event.stopPropagation();
    openChallengePane('pane-ch-event');
  }

  function hideRecentPhotos(){
    var home = document.getElementById('tab-home');
    if(!home) return;

    Array.prototype.forEach.call(home.querySelectorAll('.section-head,.eyebrow,h2,h3'),function(element){
      var text = (element.textContent || '').trim().toLowerCase();
      if(text !== 'seneste billeder' && text !== 'recent photos') return;

      var head = element.classList.contains('section-head') ? element : element.closest('.section-head');
      var target = head || element;
      var section = target.closest('[data-home-section],.home-section');
      if(section){
        section.hidden = true;
        section.style.display = 'none';
        return;
      }
      target.hidden = true;
      target.style.display = 'none';
      if(target.nextElementSibling){
        target.nextElementSibling.hidden = true;
        target.nextElementSibling.style.display = 'none';
      }
    });
  }

  function challengeTitle(challenge,index,isEvent){
    if(!challenge){
      if(isEvent) return language() === 'en' ? 'Event challenge' : 'Event-challenge';
      return language() === 'en' ? 'Daily challenge ' + (index + 1) : 'Daglig challenge ' + (index + 1);
    }
    return challenge.title || challenge.name || challenge.text || challenge.label || challenge.description ||
      (isEvent
        ? (language() === 'en' ? 'Event challenge' : 'Event-challenge')
        : (language() === 'en' ? 'Daily challenge ' + (index + 1) : 'Daglig challenge ' + (index + 1)));
  }

  function numberFrom(challenge,names,fallback){
    for(var i=0;i<names.length;i++){
      var value = Number(challenge && challenge[names[i]]);
      if(Number.isFinite(value)) return value;
    }
    return fallback;
  }

  function iconFor(title,done,isEvent){
    if(done){
      return '<svg viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    if(isEvent){
      return '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.8c.9 4.2 3.4 6.7 7.6 7.6-4.2.9-6.7 3.4-7.6 7.6-.9-4.2-3.4-6.7-7.6-7.6 4.2-.9 6.7-3.4 7.6-7.6Z" fill="currentColor" opacity=".92"/><circle cx="18.3" cy="5.7" r="1.3" fill="currentColor"/><circle cx="5.5" cy="18.5" r="1" fill="currentColor" opacity=".65"/></svg>';
    }
    if(/foto|photo|billede|camera/i.test(title)){
      return '<svg viewBox="0 0 24 24" fill="none"><path d="M4 8.5A2 2 0 0 1 6 6.5h2l1-2h6l1 2h2a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5Z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="13" r="3.2" stroke="currentColor" stroke-width="1.6"/></svg>';
    }
    if(/streak|streg|dag|day/i.test(title)){
      return '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.8c-.6 3.5-3.8 4.9-3.8 8.5 0 1.8 1.4 3.2 3.1 3.2 1.8 0 3.1-1.4 3.1-3.1 0-.9-.4-1.8-1.1-2.6 2.5 1 4.1 3.2 4.1 5.9 0 3.6-2.8 6.4-6.4 6.4s-6.4-2.8-6.4-6.4c0-4.6 3.1-6.8 4.6-10.3.7.4 1.7 1.6 2.8 3.2Z" fill="currentColor" opacity=".9"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3c1.2 3.1 3.7 5.3 7 6-3.3.8-5.8 3-7 6-1.2-3-3.7-5.2-7-6 3.3-.7 5.8-2.9 7-6Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M18 15.5c.6 1.5 1.7 2.6 3 3-1.3.4-2.4 1.5-3 3-.6-1.5-1.7-2.6-3-3 1.3-.4 2.4-1.5 3-3Z" fill="currentColor"/></svg>';
  }

  function makeExtraCard(challenge,index,isEvent){
    var done = !!(challenge && (challenge.done || challenge.completed || challenge.claimed));
    var title = challengeTitle(challenge,index,isEvent);
    var target = Math.max(1,numberFrom(challenge,['target','goal','required','max'],1));
    var current = done ? target : Math.max(0,numberFrom(challenge,['progress','current','count','value'],0));
    var percentage = Math.max(0,Math.min(100,current / target * 100));
    var xp = Math.max(0,numberFrom(challenge,isEvent ? ['xp','eventXp','rewardXp','xpReward'] : ['xp','rewardXp','xpReward'],0));
    var coins = Math.max(0,numberFrom(challenge,['coins','rewardCoins','coinReward'],0));
    var reward = [];
    if(xp) reward.push('+' + xp + (isEvent ? ' Event-XP' : ' XP'));
    if(coins) reward.push('+' + coins + ' ' + (language() === 'en' ? 'coins' : 'mønter'));
    if(!reward.length) reward.push(isEvent
      ? (language() === 'en' ? 'Event-XP reward' : 'Event-XP-belønning')
      : (language() === 'en' ? 'Daily reward' : 'Daglig belønning'));

    var card = document.createElement('div');
    card.className = 'home-extra-challenge' + (isEvent ? ' is-event' : '') + (done ? ' is-done' : '');
    card.dataset.challengeIndex = String(index);
    card.dataset.challengeType = isEvent ? 'event' : 'normal';
    card.tabIndex = 0;
    card.setAttribute('role','link');
    card.setAttribute('aria-label',(isEvent
      ? (language() === 'en' ? 'Open event challenge: ' : 'Åbn event-challenge: ')
      : (language() === 'en' ? 'Open challenge: ' : 'Åbn challenge: ')) + title);
    card.innerHTML =
      '<span class="home-extra-challenge-icon">' + iconFor(title,done,isEvent) + '</span>' +
      '<span class="home-extra-challenge-main">' +
        '<span class="home-extra-challenge-title-line">' +
          '<span class="home-extra-challenge-title"></span>' +
          (isEvent ? '<span class="home-event-badge">Event</span>' : '') +
        '</span>' +
        '<span class="home-extra-challenge-reward"></span>' +
        '<span class="home-extra-challenge-progress"><i style="width:' + percentage.toFixed(1) + '%"></i></span>' +
        '<span class="home-extra-challenge-count">' + current + ' / ' + target + '</span>' +
      '</span>' +
      '<span class="home-extra-challenge-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
    card.querySelector('.home-extra-challenge-title').textContent = title;
    card.querySelector('.home-extra-challenge-reward').textContent = reward.join(' · ');

    var opener = isEvent ? openEventChallenges : openNormalChallenges;
    card.addEventListener('click',opener);
    card.addEventListener('keydown',function(event){
      if(event.key === 'Enter' || event.key === ' '){
        event.preventDefault();
        opener(event);
      }
    });
    return card;
  }

  function activeEventChallenge(appState){
    if(!appState) return null;
    if(appState.event && Array.isArray(appState.event.daily) && appState.event.daily.length){
      return appState.event.daily.find(function(item){ return item && !item.claimed && !item.done; }) || appState.event.daily[0];
    }

    var eventKeys = appState.events && typeof appState.events === 'object' ? Object.keys(appState.events) : [];
    for(var i=0;i<eventKeys.length;i++){
      var eventState = appState.events[eventKeys[i]];
      if(eventState && Array.isArray(eventState.daily) && eventState.daily.length){
        return eventState.daily.find(function(item){ return item && !item.claimed && !item.done; }) || eventState.daily[0];
      }
    }
    return null;
  }

  function bindFeaturedCard(featured){
    if(!featured || featured.dataset.homeNormalChallengeBound) return;
    featured.dataset.homeNormalChallengeBound = 'true';
    featured.setAttribute('role','link');
    featured.tabIndex = 0;
    featured.addEventListener('click',openNormalChallenges);
    featured.addEventListener('keydown',function(event){
      if(event.key === 'Enter' || event.key === ' '){
        event.preventDefault();
        openNormalChallenges(event);
      }
    });
  }

  function renderHub(){
    installStyles();
    compactMilestone();
    hideRecentPhotos();

    var featured = document.getElementById('featuredChallengeCard');
    if(!featured || !featured.parentNode) return;

    var hub = document.getElementById('homeChallengeHub');
    if(!hub){
      hub = document.createElement('div');
      hub.id = 'homeChallengeHub';
      featured.parentNode.insertBefore(hub,featured);
      hub.appendChild(featured);
    }
    bindFeaturedCard(featured);

    Array.prototype.forEach.call(hub.querySelectorAll('.home-extra-challenge'),function(card){ card.remove(); });

    var appState = getState();
    var items = appState && appState.challenges && Array.isArray(appState.challenges.items)
      ? appState.challenges.items
      : [];

    hub.appendChild(makeExtraCard(items[1] || null,1,false));
    hub.appendChild(makeExtraCard(activeEventChallenge(appState),0,true));
  }

  function install(){
    renderHub();

    if(typeof window.renderAll === 'function' && !window.renderAll.__homeChallengeHubWrapped){
      var original = window.renderAll;
      var wrapped = function(){
        var result = original.apply(this,arguments);
        setTimeout(renderHub,0);
        return result;
      };
      wrapped.__homeChallengeHubWrapped = true;
      window.renderAll = wrapped;
    }
  }

  window.renderHomeChallengeHub = renderHub;
  window.addEventListener('streg:languagechange',renderHub);
  window.addEventListener('streg:startup-complete',renderHub);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) renderHub(); });

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  setTimeout(install,600);
  setInterval(renderHub,1800);
})();
