(function(){
  'use strict';

  var ICONS = {
    daily:'<svg viewBox="0 0 24 24" fill="none"><path d="M7 3v3M17 3v3M4.5 9h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="m8.3 14 2.1 2.1 4.4-4.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    weekly:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1 0 2.3-5.7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M4 5v5h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    monthly:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 3.2 15 9l6 .9-4.4 4.2 1 5.9-5.6-3-5.6 3 1-5.9L3 9.9 9 9l3-5.8Z" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/></svg>',
    event:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.8c.9 4.2 3.4 6.7 7.6 7.6-4.2.9-6.7 3.4-7.6 7.6-.9-4.2-3.4-6.7-7.6-7.6 4.2-.9 6.7-3.4 7.6-7.6Z" fill="currentColor"/><circle cx="18.5" cy="5.5" r="1.2" fill="currentColor"/><circle cx="5.5" cy="18.5" r=".9" fill="currentColor" opacity=".65"/></svg>'
  };

  function isEnglish(){
    try{ return window.I18n && window.I18n.getLanguage && window.I18n.getLanguage() === 'en'; }catch(error){}
    return document.documentElement.lang === 'en';
  }

  function text(da,en){ return isEnglish() ? en : da; }

  function parseProgress(value){
    var match = String(value || '').match(/(\d+)\s*\/\s*(\d+)/);
    return match ? {done:Number(match[1]),total:Number(match[2])} : {done:0,total:0};
  }

  function getProgress(type){
    var ids = {
      daily:'dailyProgressText',
      weekly:'weeklyProgressText',
      monthly:'monthlyProgressText'
    };
    if(type === 'event'){
      var status = document.getElementById('eventDailyHeroStatus');
      var raw = status ? status.textContent : '';
      var done = Number((raw.match(/\d+/) || [0])[0]);
      return {done:done,total:3};
    }
    var element = document.getElementById(ids[type]);
    return parseProgress(element && element.textContent);
  }

  function installStyles(){
    if(document.getElementById('challengePageRedesignStyles')) return;
    var style = document.createElement('style');
    style.id = 'challengePageRedesignStyles';
    style.textContent = [
      '#tab-challenges{position:relative;isolation:isolate;padding-bottom:40px;}',
      '#tab-challenges::before{content:"";position:absolute;z-index:-1;inset:-24px -22px auto;height:370px;pointer-events:none;background:radial-gradient(circle at 18% 8%,color-mix(in srgb,var(--amber) 16%,transparent),transparent 42%),radial-gradient(circle at 84% 4%,color-mix(in srgb,var(--sky) 15%,transparent),transparent 38%);mask-image:linear-gradient(#000,transparent);}',
      '#tab-challenges>.brandrow.challenge-hub-head{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:18px;margin:8px 0 18px;padding:20px 21px;border:1px solid var(--line);border-radius:26px;background:linear-gradient(145deg,color-mix(in srgb,var(--card) 96%,var(--amber-soft)),var(--card));box-shadow:var(--shadow-s);overflow:hidden;}',
      '.challenge-hub-title-wrap{min-width:0;}',
      '.challenge-hub-kicker{display:flex;align-items:center;gap:7px;margin-bottom:6px;color:var(--amber-2);font-size:9px;font-weight:950;letter-spacing:.15em;text-transform:uppercase;}',
      '.challenge-hub-kicker::before{content:"";width:18px;height:2px;border-radius:99px;background:currentColor;}',
      '#tab-challenges .challenge-hub-head h2{margin:0!important;font-family:var(--font-display);font-size:clamp(28px,5vw,39px)!important;font-weight:850;line-height:1;letter-spacing:-.035em;}',
      '.challenge-hub-sub{max-width:470px;margin:8px 0 0;color:var(--ink-soft);font-size:11.5px;font-weight:600;line-height:1.45;}',
      '#tab-challenges .challenge-hub-head #rerollBtn{align-self:center;min-height:42px;padding:0 14px;border:1px solid color-mix(in srgb,var(--amber) 30%,var(--line));border-radius:14px;background:var(--amber-soft);box-shadow:none;font-size:11px;font-weight:850;}',
      '.challenge-overview{display:grid;grid-template-columns:1.25fr repeat(3,minmax(0,.75fr));gap:9px;margin:0 0 14px;}',
      '.challenge-overview-card{position:relative;min-height:83px;padding:13px 14px;border:1px solid var(--line);border-radius:19px;background:var(--card);box-shadow:0 8px 20px -16px rgba(22,36,43,.45);overflow:hidden;}',
      '.challenge-overview-card.primary{display:flex;align-items:center;gap:13px;background:linear-gradient(135deg,color-mix(in srgb,var(--amber-soft) 72%,var(--card)),var(--card));}',
      '.challenge-overview-ring{--p:0;display:grid;place-items:center;flex:0 0 auto;width:52px;height:52px;border-radius:50%;background:conic-gradient(var(--amber) calc(var(--p)*1%),var(--line) 0);}',
      '.challenge-overview-ring::before{content:"";grid-area:1/1;width:39px;height:39px;border-radius:50%;background:var(--card);}',
      '.challenge-overview-ring strong{grid-area:1/1;z-index:1;font-size:12px;font-weight:950;}',
      '.challenge-overview-copy span,.challenge-overview-card>span{display:block;color:var(--ink-soft);font-size:8.5px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;}',
      '.challenge-overview-copy strong{display:block;margin-top:3px;font-size:14px;font-weight:900;line-height:1.12;}',
      '.challenge-overview-card:not(.primary) strong{display:block;margin-top:8px;font-family:var(--font-display);font-size:23px;font-weight:850;line-height:1;}',
      '.challenge-overview-card:not(.primary) small{display:block;margin-top:5px;color:var(--ink-soft);font-size:9px;font-weight:650;}',
      '#challengeSubtabs.ch-subtabs{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:0 0 14px!important;padding:7px!important;border:1px solid var(--line);border-radius:22px;background:color-mix(in srgb,var(--paper-2) 82%,var(--card));box-shadow:inset 0 1px rgba(255,255,255,.3);overflow:visible!important;}',
      '#challengeSubtabs .ch-subtab{position:relative;display:grid!important;grid-template-columns:34px minmax(0,1fr);grid-template-rows:auto auto;align-items:center;gap:1px 8px;min-height:60px;padding:9px 10px!important;border:1px solid transparent!important;border-radius:16px!important;color:var(--ink-soft)!important;background:transparent!important;text-align:left!important;box-shadow:none!important;overflow:hidden;}',
      '#challengeSubtabs .ch-subtab::after{content:"";position:absolute;inset:auto 10px 5px;height:2px;border-radius:99px;background:transparent;transform:scaleX(.35);transition:.2s ease;}',
      '#challengeSubtabs .ch-subtab.on{color:var(--ink)!important;border-color:var(--line)!important;background:var(--card)!important;box-shadow:0 7px 18px -14px rgba(22,36,43,.8)!important;}',
      '#challengeSubtabs .ch-subtab.on::after{background:var(--challenge-accent,var(--amber));transform:scaleX(1);}',
      '.challenge-tab-icon{grid-row:1/3;display:grid;place-items:center;width:34px;height:34px;border-radius:11px;color:var(--challenge-accent,var(--amber));background:color-mix(in srgb,var(--challenge-accent,var(--amber)) 12%,var(--card));}',
      '.challenge-tab-icon svg{width:18px;height:18px;}',
      '.challenge-tab-label{overflow:hidden;color:inherit;font-size:11.5px;font-weight:900;text-overflow:ellipsis;white-space:nowrap;}',
      '.challenge-tab-meta{color:var(--ink-soft);font-size:8px;font-weight:700;white-space:nowrap;}',
      '.challenge-tab-count{position:absolute;right:7px;top:6px;display:grid;place-items:center;min-width:18px;height:18px;padding:0 4px;border-radius:999px;color:var(--challenge-accent,var(--amber));background:color-mix(in srgb,var(--challenge-accent,var(--amber)) 12%,var(--card));font-size:7.5px;font-weight:950;}',
      '#challengeSubtabs [data-ch-pane="pane-ch-daily"]{--challenge-accent:var(--amber);}',
      '#challengeSubtabs [data-ch-pane="pane-ch-weekly"]{--challenge-accent:var(--moss);}',
      '#challengeSubtabs [data-ch-pane="pane-ch-monthly"]{--challenge-accent:var(--sky);}',
      '#challengeSubtabs [data-ch-pane="pane-ch-event"]{--challenge-accent:#7A63D8;}',
      '#tab-challenges .ch-pane{position:relative;padding:15px;border:1px solid var(--line);border-radius:23px;background:var(--card);box-shadow:var(--shadow-s);}',
      '#tab-challenges #pane-ch-event{padding:0;border:0;background:transparent;box-shadow:none;}',
      '#tab-challenges .challenge-pane-meta{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 12px;padding:0 2px;color:var(--ink-soft);font-size:9px;font-weight:800;letter-spacing:.03em;}',
      '#tab-challenges .challenge-pane-meta strong{padding:5px 8px;border-radius:999px;color:var(--ink);background:var(--paper-2);font-size:8.5px;}',
      '#challengeList,#weeklyList,#monthlyList{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px!important;}',
      '#challengeList>* ,#weeklyList>* ,#monthlyList>*{position:relative;margin:0!important;border:1px solid var(--line)!important;border-radius:18px!important;background:linear-gradient(145deg,var(--card),color-mix(in srgb,var(--paper-2) 62%,var(--card)))!important;box-shadow:0 10px 24px -20px rgba(22,36,43,.65)!important;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;overflow:hidden;}',
      '#challengeList>*:hover,#weeklyList>*:hover,#monthlyList>*:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--amber) 26%,var(--line))!important;box-shadow:0 16px 26px -20px rgba(22,36,43,.75)!important;}',
      '#challengeList>*::before,#weeklyList>*::before,#monthlyList>*::before{content:attr(data-challenge-number);position:absolute;right:10px;top:9px;display:grid;place-items:center;width:22px;height:22px;border-radius:8px;color:var(--ink-soft);background:var(--paper-2);font-size:8px;font-weight:950;opacity:.75;}',
      '#challengeList>* button,#weeklyList>* button,#monthlyList>* button{border-radius:12px!important;}',
      '#tab-challenges .stagger>*{animation:challengeCardEnter .42s var(--glide) both;animation-delay:calc(var(--challenge-index,0)*55ms);}',
      '@keyframes challengeCardEnter{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}',
      '@media(max-width:760px){.challenge-overview{grid-template-columns:1fr 1fr}.challenge-overview-card.primary{grid-column:1/-1}#challengeList,#weeklyList,#monthlyList{grid-template-columns:1fr}#challengeSubtabs.ch-subtabs{grid-template-columns:1fr 1fr}}',
      '@media(max-width:480px){#tab-challenges>.brandrow.challenge-hub-head{grid-template-columns:1fr;padding:17px 16px;border-radius:22px}.challenge-hub-sub{font-size:10.5px}#tab-challenges .challenge-hub-head #rerollBtn{justify-self:start;min-height:38px}.challenge-overview{gap:7px}.challenge-overview-card{min-height:74px;padding:11px 12px}#challengeSubtabs.ch-subtabs{gap:6px;padding:6px!important;border-radius:19px}#challengeSubtabs .ch-subtab{grid-template-columns:30px minmax(0,1fr);min-height:55px;padding:8px!important;border-radius:14px!important}.challenge-tab-icon{width:30px;height:30px;border-radius:10px}.challenge-tab-label{font-size:10.5px}.challenge-tab-meta{font-size:7.5px}#tab-challenges .ch-pane{padding:11px;border-radius:19px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function enhanceHeader(){
    var tab = document.getElementById('tab-challenges');
    if(!tab) return;
    var head = tab.querySelector(':scope > .brandrow');
    if(!head || head.classList.contains('challenge-hub-head')) return;

    head.classList.add('challenge-hub-head');
    var title = head.querySelector('h2');
    var wrap = document.createElement('div');
    wrap.className = 'challenge-hub-title-wrap';
    wrap.innerHTML = '<div class="challenge-hub-kicker">' + text('Din challenge-hub','Your challenge hub') + '</div>';
    if(title){
      title.parentNode.insertBefore(wrap,title);
      wrap.appendChild(title);
    }
    var sub = document.createElement('p');
    sub.className = 'challenge-hub-sub';
    sub.textContent = text('Vælg et tempo, byg fremdrift og saml rewards uden at miste overblikket.','Choose a pace, build momentum, and collect rewards without losing track.');
    wrap.appendChild(sub);
  }

  function createOverview(){
    var subtabs = document.getElementById('challengeSubtabs');
    if(!subtabs || document.getElementById('challengeOverview')) return;
    var overview = document.createElement('section');
    overview.id = 'challengeOverview';
    overview.className = 'challenge-overview';
    subtabs.parentNode.insertBefore(overview,subtabs);
  }

  function updateOverview(){
    var overview = document.getElementById('challengeOverview');
    if(!overview) return;
    var daily = getProgress('daily');
    var weekly = getProgress('weekly');
    var monthly = getProgress('monthly');
    var totalDone = daily.done + weekly.done + monthly.done;
    var total = daily.total + weekly.total + monthly.total;
    var percent = total ? Math.round(totalDone / total * 100) : 0;
    overview.innerHTML =
      '<div class="challenge-overview-card primary">' +
        '<div class="challenge-overview-ring" style="--p:' + percent + '"><strong>' + percent + '%</strong></div>' +
        '<div class="challenge-overview-copy"><span>' + text('Samlet fremdrift','Overall progress') + '</span><strong>' + text('Hold rytmen i gang','Keep your rhythm going') + '</strong></div>' +
      '</div>' +
      statCard(text('I dag','Today'),daily.done,daily.total,text('nulstilles dagligt','resets daily')) +
      statCard(text('Denne uge','This week'),weekly.done,weekly.total,text('ny runde mandag','new round Monday')) +
      statCard(text('Denne måned','This month'),monthly.done,monthly.total,text('lang challenge','long challenge'));
  }

  function statCard(label,done,total,sub){
    return '<div class="challenge-overview-card"><span>' + label + '</span><strong>' + done + '/' + (total || 0) + '</strong><small>' + sub + '</small></div>';
  }

  function tabInfo(pane){
    var map = {
      'pane-ch-daily':{type:'daily',label:text('Daglige','Daily'),meta:text('Hurtige mål','Quick goals')},
      'pane-ch-weekly':{type:'weekly',label:text('Ugentlige','Weekly'),meta:text('Byg rytme','Build rhythm')},
      'pane-ch-monthly':{type:'monthly',label:text('Månedlige','Monthly'),meta:text('Store mål','Big goals')},
      'pane-ch-event':{type:'event',label:'Event',meta:text('Sæson-XP','Season XP')}
    };
    return map[pane];
  }

  function enhanceTabs(){
    var buttons = document.querySelectorAll('#challengeSubtabs .ch-subtab');
    buttons.forEach(function(button){
      var pane = button.dataset.chPane;
      var info = tabInfo(pane);
      if(!info) return;
      var progress = getProgress(info.type);
      button.innerHTML =
        '<span class="challenge-tab-icon" aria-hidden="true">' + ICONS[info.type] + '</span>' +
        '<span class="challenge-tab-label">' + info.label + '</span>' +
        '<span class="challenge-tab-meta">' + info.meta + '</span>' +
        '<span class="challenge-tab-count">' + progress.done + '/' + (progress.total || '–') + '</span>';
      button.setAttribute('aria-label',info.label + ' · ' + progress.done + ' / ' + (progress.total || 0));
    });
  }

  function numberCards(){
    ['challengeList','weeklyList','monthlyList'].forEach(function(id){
      var list = document.getElementById(id);
      if(!list) return;
      Array.prototype.forEach.call(list.children,function(card,index){
        card.dataset.challengeNumber = String(index + 1).padStart(2,'0');
        card.style.setProperty('--challenge-index',index);
      });
    });
  }

  function refresh(){
    installStyles();
    enhanceHeader();
    createOverview();
    updateOverview();
    enhanceTabs();
    numberCards();
  }

  var observer = null;
  function install(){
    refresh();
    var tab = document.getElementById('tab-challenges');
    if(tab && !observer){
      var queued = false;
      observer = new MutationObserver(function(){
        if(queued) return;
        queued = true;
        requestAnimationFrame(function(){ queued = false; refresh(); });
      });
      observer.observe(tab,{childList:true,subtree:true,characterData:true});
    }
  }

  window.refreshChallengeRedesign = refresh;
  window.addEventListener('streg:languagechange',refresh);
  window.addEventListener('streg:startup-complete',refresh);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  setTimeout(install,700);
})();
