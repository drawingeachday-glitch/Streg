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
      '#homeChallengeHub{display:grid;gap:10px;padding:10px;border:1px solid var(--line);border-radius:24px;background:var(--card);box-shadow:var(--shadow-s);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease;}',
      '#homeChallengeHub:hover{transform:translateY(-1px);box-shadow:var(--shadow-m);}',
      '#homeChallengeHub:focus-visible{outline:3px solid color-mix(in srgb,var(--amber) 55%,transparent);outline-offset:4px;}',
      '#homeChallengeHub #featuredChallengeCard{margin:0!important;border:0!important;box-shadow:none!important;border-radius:17px!important;background:var(--paper-2)!important;}',
      '.home-extra-challenge{display:grid;grid-template-columns:52px minmax(0,1fr) 22px;align-items:center;gap:12px;min-height:92px;padding:13px 14px;border:0;border-radius:17px;color:var(--ink);background:var(--paper-2);}',
      '.home-extra-challenge+.home-extra-challenge{border-top:1px solid var(--line);}',
      '.home-extra-challenge-icon{display:grid;place-items:center;width:50px;height:50px;border-radius:50%;color:var(--amber-2);background:linear-gradient(145deg,var(--amber-soft),var(--card));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--amber) 22%,transparent);}',
      '.home-extra-challenge-icon svg{width:25px;height:25px;}',
      '.home-extra-challenge-main{min-width:0;}',
      '.home-extra-challenge-title{overflow:hidden;color:var(--ink);font-size:14px;font-weight:850;line-height:1.22;text-overflow:ellipsis;white-space:nowrap;}',
      '.home-extra-challenge-reward{margin-top:3px;color:var(--ink-soft);font-size:10.5px;font-weight:650;}',
      '.home-extra-challenge-progress{height:5px;margin-top:9px;overflow:hidden;border-radius:999px;background:var(--line);}',
      '.home-extra-challenge-progress>i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--amber),var(--amber-2));transition:width .35s ease;}',
      '.home-extra-challenge-count{margin-top:4px;color:var(--ink-soft);font-size:9px;font-weight:700;text-align:right;}',
      '.home-extra-challenge-arrow{color:var(--ink-soft);}',
      '.home-extra-challenge-arrow svg{width:18px;height:18px;}',
      '#homeChallengeHub .is-done .home-extra-challenge-icon{color:var(--moss-dark);background:var(--moss-soft);}',
      '#homeChallengeHub .is-done .home-extra-challenge-progress>i{background:var(--moss);}',
      '#streakCommandHero.streak-photo-pending .streak-route-node.is-current .streak-route-dot{filter:grayscale(1) saturate(0)!important;color:#c7ccd0!important;background:#343b40!important;border-color:#5f686f!important;box-shadow:none!important;}',
      '#streakCommandHero.streak-photo-pending .streak-route-node.is-current .streak-route-day{color:#7d858b!important;opacity:.72!important;}',
      '#streakCommandHero.streak-photo-pending .streak-route-node.is-current{filter:grayscale(1) saturate(0)!important;}',
      '@media(max-width:520px){#homeChallengeHub{padding:8px;border-radius:21px}.home-extra-challenge{grid-template-columns:46px minmax(0,1fr) 19px;min-height:84px;padding:11px 12px}.home-extra-challenge-icon{width:44px;height:44px}.home-extra-challenge-icon svg{width:22px;height:22px}.home-extra-challenge-title{font-size:13px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function openChallenges(){
    try{
      if(typeof switchTab === 'function'){
        switchTab('tab-challenges');
      }else{
        var tab = document.querySelector('.tabbtn[data-tab="tab-challenges"]');
        if(tab) tab.click();
      }
    }catch(error){}

    setTimeout(function(){
      var daily = document.querySelector('#tab-challenges [data-subtab="daily"],#tab-challenges [data-pane="daily"],#tab-challenges .subtab:first-child');
      if(daily && typeof daily.click === 'function') daily.click();
    },100);
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

  function challengeTitle(challenge,index){
    if(!challenge) return language() === 'en' ? 'Daily challenge ' + (index + 1) : 'Daglig challenge ' + (index + 1);
    return challenge.title || challenge.name || challenge.text || challenge.label || challenge.description ||
      (language() === 'en' ? 'Daily challenge ' + (index + 1) : 'Daglig challenge ' + (index + 1));
  }

  function numberFrom(challenge,names,fallback){
    for(var i=0;i<names.length;i++){
      var value = Number(challenge && challenge[names[i]]);
      if(Number.isFinite(value)) return value;
    }
    return fallback;
  }

  function iconFor(title,done){
    if(done){
      return '<svg viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    if(/foto|photo|billede|camera/i.test(title)){
      return '<svg viewBox="0 0 24 24" fill="none"><path d="M4 8.5A2 2 0 0 1 6 6.5h2l1-2h6l1 2h2a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5Z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="13" r="3.2" stroke="currentColor" stroke-width="1.6"/></svg>';
    }
    if(/streak|streg|dag|day/i.test(title)){
      return '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.8c-.6 3.5-3.8 4.9-3.8 8.5 0 1.8 1.4 3.2 3.1 3.2 1.8 0 3.1-1.4 3.1-3.1 0-.9-.4-1.8-1.1-2.6 2.5 1 4.1 3.2 4.1 5.9 0 3.6-2.8 6.4-6.4 6.4s-6.4-2.8-6.4-6.4c0-4.6 3.1-6.8 4.6-10.3.7.4 1.7 1.6 2.8 3.2Z" fill="currentColor" opacity=".9"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3c1.2 3.1 3.7 5.3 7 6-3.3.8-5.8 3-7 6-1.2-3-3.7-5.2-7-6 3.3-.7 5.8-2.9 7-6Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M18 15.5c.6 1.5 1.7 2.6 3 3-1.3.4-2.4 1.5-3 3-.6-1.5-1.7-2.6-3-3 1.3-.4 2.4-1.5 3-3Z" fill="currentColor"/></svg>';
  }

  function makeExtraCard(challenge,index){
    var done = !!(challenge && (challenge.done || challenge.completed || challenge.claimed));
    var title = challengeTitle(challenge,index);
    var target = Math.max(1,numberFrom(challenge,['target','goal','required','max'],1));
    var current = done ? target : Math.max(0,numberFrom(challenge,['progress','current','count','value'],0));
    var percentage = Math.max(0,Math.min(100,current / target * 100));
    var xp = Math.max(0,numberFrom(challenge,['xp','rewardXp','xpReward'],0));
    var coins = Math.max(0,numberFrom(challenge,['coins','rewardCoins','coinReward'],0));
    var reward = [];
    if(xp) reward.push('+' + xp + ' XP');
    if(coins) reward.push('+' + coins + ' ' + (language() === 'en' ? 'coins' : 'mønter'));
    if(!reward.length) reward.push(language() === 'en' ? 'Daily reward' : 'Daglig belønning');

    var card = document.createElement('div');
    card.className = 'home-extra-challenge' + (done ? ' is-done' : '');
    card.dataset.challengeIndex = String(index);
    card.innerHTML =
      '<span class="home-extra-challenge-icon">' + iconFor(title,done) + '</span>' +
      '<span class="home-extra-challenge-main">' +
        '<span class="home-extra-challenge-title"></span>' +
        '<span class="home-extra-challenge-reward"></span>' +
        '<span class="home-extra-challenge-progress"><i style="width:' + percentage.toFixed(1) + '%"></i></span>' +
        '<span class="home-extra-challenge-count">' + current + ' / ' + target + '</span>' +
      '</span>' +
      '<span class="home-extra-challenge-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
    card.querySelector('.home-extra-challenge-title').textContent = title;
    card.querySelector('.home-extra-challenge-reward').textContent = reward.join(' · ');
    return card;
  }

  function renderHub(){
    installStyles();
    hideRecentPhotos();

    var featured = document.getElementById('featuredChallengeCard');
    if(!featured || !featured.parentNode) return;

    var hub = document.getElementById('homeChallengeHub');
    if(!hub){
      hub = document.createElement('div');
      hub.id = 'homeChallengeHub';
      hub.tabIndex = 0;
      hub.setAttribute('role','link');
      hub.setAttribute('aria-label',language() === 'en' ? 'Open all challenges' : 'Åbn alle challenges');
      featured.parentNode.insertBefore(hub,featured);
      hub.appendChild(featured);
      hub.addEventListener('click',openChallenges);
      hub.addEventListener('keydown',function(event){
        if(event.key === 'Enter' || event.key === ' '){
          event.preventDefault();
          openChallenges();
        }
      });
    }

    Array.prototype.forEach.call(hub.querySelectorAll('.home-extra-challenge'),function(card){ card.remove(); });

    var appState = getState();
    var items = appState && appState.challenges && Array.isArray(appState.challenges.items)
      ? appState.challenges.items
      : [];

    var extras = items.slice(1,3);
    while(extras.length < 2) extras.push(null);
    extras.forEach(function(challenge,index){ hub.appendChild(makeExtraCard(challenge,index + 1)); });

    hub.setAttribute('aria-label',language() === 'en' ? 'Open all challenges' : 'Åbn alle challenges');
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
