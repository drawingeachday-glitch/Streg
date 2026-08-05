(function(){
  'use strict';

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
    var ids = {daily:'dailyProgressText',weekly:'weeklyProgressText',monthly:'monthlyProgressText'};
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
    var existing = document.getElementById('challengePageRedesignStyles');
    if(existing) existing.remove();

    var style = document.createElement('style');
    style.id = 'challengePageRedesignStyles';
    style.textContent = [
      '#tab-challenges{position:relative;isolation:isolate;padding:10px 0 48px!important;}',
      '#tab-challenges::before{content:"";position:absolute;z-index:-2;inset:-40px -24px auto;height:310px;pointer-events:none;background:radial-gradient(circle at 50% 0,color-mix(in srgb,var(--amber-soft) 42%,transparent),transparent 58%);mask-image:linear-gradient(#000,transparent);}',
      '#tab-challenges>.brandrow.challenge-hub-head{position:relative;display:flex!important;align-items:center;justify-content:center;min-height:74px;margin:0 0 16px!important;padding:8px 58px!important;border:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important;}',
      '.challenge-hub-title-wrap{display:flex;align-items:center;justify-content:center;min-width:0;}',
      '.challenge-hub-kicker,.challenge-hub-sub{display:none!important;}',
      '#tab-challenges .challenge-hub-head h2{margin:0!important;color:var(--ink)!important;font-family:var(--font-display)!important;font-size:clamp(31px,6vw,43px)!important;font-weight:900!important;line-height:1!important;letter-spacing:-.045em!important;text-align:center!important;}',
      '#tab-challenges .challenge-hub-head #rerollBtn{position:absolute!important;right:4px;top:50%;display:grid!important;place-items:center!important;width:46px!important;height:46px!important;min-height:46px!important;padding:0!important;border:1px solid color-mix(in srgb,var(--line) 76%,transparent)!important;border-radius:50%!important;color:var(--ink-soft)!important;background:color-mix(in srgb,var(--card) 94%,transparent)!important;box-shadow:0 9px 24px -14px rgba(22,36,43,.55)!important;font-size:0!important;transform:translateY(-50%)!important;}',
      '#tab-challenges .challenge-hub-head #rerollBtn svg{width:20px!important;height:20px!important;margin:0!important;}',
      '#challengeSubtabs.ch-subtabs{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px!important;margin:0 0 18px!important;padding:6px!important;border:1px solid color-mix(in srgb,var(--line) 76%,transparent)!important;border-radius:24px!important;background:color-mix(in srgb,var(--paper-2) 78%,var(--card))!important;box-shadow:inset 0 1px rgba(255,255,255,.48),0 8px 24px -22px rgba(22,36,43,.45)!important;overflow:visible!important;}',
      '#challengeSubtabs .ch-subtab{display:flex!important;align-items:center!important;justify-content:center!important;min-height:54px!important;padding:0 9px!important;border:0!important;border-radius:18px!important;color:var(--ink-soft)!important;background:transparent!important;box-shadow:none!important;font-size:14px!important;font-weight:800!important;text-align:center!important;transition:background .2s ease,color .2s ease,box-shadow .2s ease,transform .2s ease!important;}',
      '#challengeSubtabs .ch-subtab.on{color:var(--amber-2)!important;background:var(--card)!important;box-shadow:0 8px 22px -15px rgba(22,36,43,.55),inset 0 1px rgba(255,255,255,.7)!important;transform:translateY(-1px)!important;}',
      '#challengeSubtabs .challenge-tab-icon,#challengeSubtabs .challenge-tab-meta,#challengeSubtabs .challenge-tab-count{display:none!important;}',
      '#challengeSubtabs .challenge-tab-label{overflow:visible!important;color:inherit!important;font-size:inherit!important;font-weight:inherit!important;text-overflow:clip!important;white-space:nowrap!important;}',
      '.challenge-overview{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px!important;margin:0 0 20px!important;padding:10px!important;border:1px solid color-mix(in srgb,var(--line) 78%,transparent)!important;border-radius:22px!important;background:var(--card)!important;box-shadow:0 12px 34px -26px rgba(22,36,43,.58)!important;}',
      '.challenge-overview-card{display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;min-width:0!important;min-height:56px!important;padding:8px 10px!important;border:0!important;border-radius:16px!important;background:color-mix(in srgb,var(--paper-2) 72%,var(--card))!important;box-shadow:none!important;text-align:left!important;}',
      '.challenge-overview-card.primary{display:none!important;}',
      '.challenge-overview-card>span{display:none!important;}',
      '.challenge-overview-card::before{content:"";flex:0 0 auto;width:22px;height:22px;border-radius:50%;background:var(--overview-color,var(--amber));box-shadow:inset 0 0 0 7px color-mix(in srgb,var(--overview-color,var(--amber)) 18%,var(--card));}',
      '.challenge-overview-card:nth-child(3){--overview-color:#735ED7;}',
      '.challenge-overview-card:nth-child(4){--overview-color:#E5A300;}',
      '.challenge-overview-card strong{display:block!important;margin:0!important;color:var(--overview-color,var(--amber-2))!important;font-family:var(--font-body)!important;font-size:18px!important;font-weight:950!important;line-height:1!important;}',
      '.challenge-overview-card small{display:block!important;overflow:hidden!important;max-width:86px!important;margin:2px 0 0!important;color:var(--ink-soft)!important;font-size:9.5px!important;font-weight:700!important;line-height:1.15!important;text-overflow:ellipsis!important;white-space:nowrap!important;}',
      '#tab-challenges .ch-pane{position:relative!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;}',
      '#tab-challenges .challenge-pane-meta{display:none!important;}',
      '#challengeList,#weeklyList,#monthlyList{display:grid!important;grid-template-columns:1fr!important;gap:12px!important;}',
      '#challengeList>* ,#weeklyList>* ,#monthlyList>*{position:relative!important;min-height:104px!important;margin:0!important;padding:16px 62px 16px 90px!important;border:1px solid color-mix(in srgb,var(--line) 78%,transparent)!important;border-radius:24px!important;background:var(--card)!important;box-shadow:0 14px 34px -27px rgba(22,36,43,.72)!important;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease!important;overflow:hidden!important;}',
      '#challengeList>*:hover,#weeklyList>*:hover,#monthlyList>*:hover{transform:translateY(-2px)!important;border-color:color-mix(in srgb,var(--amber) 24%,var(--line))!important;box-shadow:0 20px 38px -26px rgba(22,36,43,.72)!important;}',
      '#challengeList>*::before,#weeklyList>*::before,#monthlyList>*::before{content:""!important;position:absolute!important;left:20px!important;top:50%!important;width:52px!important;height:52px!important;border-radius:50%!important;background:linear-gradient(145deg,color-mix(in srgb,var(--amber-soft) 82%,var(--card)),var(--card))!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--amber) 16%,transparent)!important;transform:translateY(-50%)!important;}',
      '#challengeList>*::after,#weeklyList>*::after,#monthlyList>*::after{content:"›"!important;position:absolute!important;right:22px!important;top:50%!important;color:var(--ink-soft)!important;font-size:34px!important;font-weight:300!important;line-height:1!important;transform:translateY(-54%)!important;}',
      '#challengeList>* button,#weeklyList>* button,#monthlyList>* button{border-radius:14px!important;}',
      '#challengeList>*:first-child{min-height:220px!important;padding:70px 76px 24px 162px!important;border-color:color-mix(in srgb,var(--amber) 28%,var(--line))!important;background:linear-gradient(105deg,color-mix(in srgb,var(--card) 94%,var(--amber-soft)) 0%,color-mix(in srgb,var(--amber-soft) 72%,var(--card)) 56%,color-mix(in srgb,var(--amber) 28%,var(--card)) 100%)!important;box-shadow:0 22px 50px -33px rgba(198,105,31,.55)!important;}',
      '#challengeList>*:first-child::before{left:29px!important;width:112px!important;height:112px!important;background:radial-gradient(circle at 45% 40%,#fff 0 14%,transparent 15%),radial-gradient(circle at center,color-mix(in srgb,var(--amber-soft) 70%,#fff) 0 48%,color-mix(in srgb,var(--amber) 24%,transparent) 49% 51%,transparent 52%),var(--card)!important;box-shadow:0 13px 28px -20px rgba(198,105,31,.52),inset 0 0 0 1px color-mix(in srgb,var(--amber) 20%,transparent)!important;}',
      '#challengeList>*:first-child::after{right:24px!important;width:58px!important;height:58px!important;display:grid!important;place-items:center!important;border-radius:50%!important;color:var(--amber-2)!important;background:var(--card)!important;box-shadow:0 12px 26px -16px rgba(22,36,43,.65)!important;font-size:37px!important;}',
      '.challenge-focus-kicker{position:absolute;left:162px;top:34px;color:var(--amber-2);font-size:10px;font-weight:950;letter-spacing:.13em;text-transform:uppercase;}',
      '.challenge-event-preview{position:relative;display:grid;align-content:center;min-height:188px;margin-top:24px;padding:30px 88px 28px 32px;border:1px solid rgba(154,125,255,.34);border-radius:28px;color:#fff;background:radial-gradient(circle at 72% 20%,rgba(255,255,255,.22) 0 1px,transparent 2px),radial-gradient(circle at 86% 38%,rgba(255,255,255,.18) 0 1px,transparent 2px),radial-gradient(circle at 42% 26%,rgba(255,255,255,.15) 0 1px,transparent 2px),linear-gradient(135deg,#30227D 0%,#5940B8 42%,#7546B9 67%,#183C75 100%);background-size:90px 90px,130px 130px,110px 110px,auto;box-shadow:0 22px 48px -30px rgba(60,36,145,.85);overflow:hidden;cursor:pointer;}',
      '.challenge-event-preview::before{content:"";position:absolute;inset:auto -10% -34% 31%;height:72%;border-radius:50% 50% 0 0;background:linear-gradient(155deg,transparent 0 28%,rgba(21,31,70,.74) 29% 57%,rgba(10,21,49,.95) 58%);transform:rotate(-4deg);}',
      '.challenge-event-preview::after{content:"›";position:absolute;right:25px;top:50%;display:grid;place-items:center;width:58px;height:58px;border-radius:50%;color:#6A4ED1;background:rgba(255,255,255,.94);box-shadow:0 13px 28px -18px rgba(0,0,0,.72);font-size:38px;line-height:1;transform:translateY(-50%);}',
      '.challenge-event-label{position:relative;z-index:2;margin-bottom:12px;color:#CFC4FF;font-size:10px;font-weight:950;letter-spacing:.16em;text-transform:uppercase;}',
      '.challenge-event-badge{display:inline-flex;width:max-content;margin-bottom:10px;padding:5px 10px;border:1px solid rgba(255,255,255,.16);border-radius:999px;color:#E8E1FF;background:rgba(255,255,255,.1);font-size:8px;font-weight:950;letter-spacing:.1em;text-transform:uppercase;}',
      '.challenge-event-title{position:relative;z-index:2;margin:0;color:#fff;font-family:var(--font-display);font-size:27px;font-weight:900;line-height:1.05;letter-spacing:-.025em;}',
      '.challenge-event-sub{position:relative;z-index:2;margin-top:8px;color:rgba(255,255,255,.76);font-size:11px;font-weight:650;}',
      '.challenge-event-reward{position:relative;z-index:2;display:inline-flex;width:max-content;margin-top:16px;padding:7px 11px;border:1px solid rgba(255,255,255,.16);border-radius:999px;color:#fff;background:rgba(255,255,255,.09);font-size:10px;font-weight:850;}',
      '#tab-challenges .stagger>*{animation:challengeCardEnter .42s var(--glide) both;animation-delay:calc(var(--challenge-index,0)*55ms);}',
      '@keyframes challengeCardEnter{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}',
      '@media(max-width:620px){#tab-challenges{padding-top:2px!important}#tab-challenges>.brandrow.challenge-hub-head{min-height:64px;margin-bottom:12px!important}#tab-challenges .challenge-hub-head h2{font-size:33px!important}#tab-challenges .challenge-hub-head #rerollBtn{width:42px!important;height:42px!important;min-height:42px!important}#challengeSubtabs .ch-subtab{min-height:48px!important;font-size:12px!important}.challenge-overview{padding:8px!important}.challenge-overview-card{min-height:50px!important;padding:7px 6px!important}.challenge-overview-card strong{font-size:16px!important}.challenge-overview-card small{max-width:64px!important;font-size:8px!important}#challengeList>* ,#weeklyList>* ,#monthlyList>*{min-height:92px!important;padding:14px 52px 14px 75px!important;border-radius:21px!important}#challengeList>*::before,#weeklyList>*::before,#monthlyList>*::before{left:16px!important;width:44px!important;height:44px!important}#challengeList>*::after,#weeklyList>*::after,#monthlyList>*::after{right:17px!important;font-size:30px!important}#challengeList>*:first-child{min-height:202px!important;padding:68px 65px 22px 128px!important}#challengeList>*:first-child::before{left:21px!important;width:90px!important;height:90px!important}.challenge-focus-kicker{left:128px!important;top:31px!important}.challenge-event-preview{min-height:172px;padding:26px 72px 25px 24px;border-radius:24px}.challenge-event-title{font-size:24px}.challenge-event-preview::after{right:18px;width:52px;height:52px;font-size:34px}}',
      '@media(max-width:390px){#challengeSubtabs.ch-subtabs{gap:2px!important;padding:5px!important}#challengeSubtabs .ch-subtab{padding:0 5px!important;font-size:11px!important}.challenge-overview{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:5px!important}.challenge-overview-card::before{width:16px;height:16px}.challenge-overview-card strong{font-size:14px!important}.challenge-overview-card small{display:none!important}#challengeList>*:first-child{padding-left:112px!important}#challengeList>*:first-child::before{left:15px!important;width:82px!important;height:82px!important}.challenge-focus-kicker{left:112px!important}.challenge-event-preview{padding-left:20px}.challenge-event-title{font-size:22px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function enhanceHeader(){
    var tab = document.getElementById('tab-challenges');
    if(!tab) return;
    var head = tab.querySelector(':scope > .brandrow');
    if(!head) return;

    head.classList.add('challenge-hub-head');
    var title = head.querySelector('h2');
    var wrap = head.querySelector('.challenge-hub-title-wrap');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.className = 'challenge-hub-title-wrap';
      if(title){
        title.parentNode.insertBefore(wrap,title);
        wrap.appendChild(title);
      }
    }
    if(title) title.textContent = 'Challenges';

    var button = document.getElementById('rerollBtn');
    if(button){
      button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h3M11 17h9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="16" cy="7" r="2" stroke="currentColor" stroke-width="1.7"/><circle cx="9" cy="17" r="2" stroke="currentColor" stroke-width="1.7"/></svg>';
      button.setAttribute('aria-label',text('Nye challenges','New challenges'));
      button.title = text('Nye challenges','New challenges');
    }
  }

  function createOverview(){
    var subtabs = document.getElementById('challengeSubtabs');
    if(!subtabs) return null;
    var overview = document.getElementById('challengeOverview');
    if(!overview){
      overview = document.createElement('section');
      overview.id = 'challengeOverview';
      overview.className = 'challenge-overview';
      subtabs.parentNode.insertBefore(overview,subtabs.nextSibling);
    }
    return overview;
  }

  function updateOverview(){
    var overview = createOverview();
    if(!overview) return;
    var daily = getProgress('daily');
    var event = getProgress('event');
    var availableDaily = Math.max(0,(daily.total || 0) - daily.done);
    var availableEvent = Math.max(0,(event.total || 0) - event.done);
    var xp = availableDaily * 35 + availableEvent * 100;
    overview.innerHTML =
      '<div class="challenge-overview-card primary"></div>' +
      '<div class="challenge-overview-card"><div><strong>' + availableDaily + '</strong><small>' + text('Daglige','Daily') + '</small></div></div>' +
      '<div class="challenge-overview-card"><div><strong>' + availableEvent + '</strong><small>Event</small></div></div>' +
      '<div class="challenge-overview-card"><div><strong>' + xp + '</strong><small>' + text('XP klar','XP available') + '</small></div></div>';
  }

  function enhanceTabs(){
    var map = {
      'pane-ch-daily':text('Daglige','Daily'),
      'pane-ch-weekly':text('Ugentlige','Weekly'),
      'pane-ch-monthly':text('Månedlige','Monthly'),
      'pane-ch-event':'Event'
    };
    document.querySelectorAll('#challengeSubtabs .ch-subtab').forEach(function(button){
      var label = map[button.dataset.chPane];
      if(!label) return;
      button.innerHTML = '<span class="challenge-tab-label">' + label + '</span>';
      button.setAttribute('aria-label',label);
    });
  }

  function markCards(){
    ['challengeList','weeklyList','monthlyList'].forEach(function(id){
      var list = document.getElementById(id);
      if(!list) return;
      Array.prototype.forEach.call(list.children,function(card,index){
        card.style.setProperty('--challenge-index',index);
        if(id === 'challengeList' && index === 0 && !card.querySelector('.challenge-focus-kicker')){
          var kicker = document.createElement('span');
          kicker.className = 'challenge-focus-kicker';
          kicker.textContent = text('Dagens fokus','Today’s focus');
          card.appendChild(kicker);
        }
      });
    });
  }

  function eventPreview(){
    var dailyPane = document.getElementById('pane-ch-daily');
    if(!dailyPane) return;
    var preview = document.getElementById('challengeEventPreview');
    if(!preview){
      preview = document.createElement('section');
      preview.id = 'challengeEventPreview';
      preview.className = 'challenge-event-preview';
      preview.tabIndex = 0;
      preview.setAttribute('role','link');
      dailyPane.appendChild(preview);
      var open = function(){
        var button = document.querySelector('#challengeSubtabs [data-ch-pane="pane-ch-event"]');
        if(button) button.click();
      };
      preview.addEventListener('click',open);
      preview.addEventListener('keydown',function(event){
        if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); open(); }
      });
    }

    var title = document.getElementById('eventHeroTitle');
    var xpText = document.getElementById('eventNextRewardText');
    preview.innerHTML =
      '<div class="challenge-event-label">✦ ' + text('Event-challenge','Event challenge') + '</div>' +
      '<span class="challenge-event-badge">Event</span>' +
      '<h3 class="challenge-event-title">' + (title && title.textContent ? title.textContent : text('Fang magien','Capture the magic')) + '</h3>' +
      '<div class="challenge-event-sub">' + text('Klar en event-mission og saml sæson-XP.','Complete an event mission and collect Season XP.') + '</div>' +
      '<div class="challenge-event-reward">' + (xpText && xpText.textContent ? xpText.textContent : '+100 Event-XP') + '</div>';
  }

  function refresh(){
    installStyles();
    enhanceHeader();
    enhanceTabs();
    updateOverview();
    markCards();
    eventPreview();
  }

  var observer;
  var queued = false;
  function queueRefresh(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(function(){ queued = false; refresh(); });
  }

  function install(){
    refresh();
    var tab = document.getElementById('tab-challenges');
    if(tab && !observer){
      observer = new MutationObserver(queueRefresh);
      observer.observe(tab,{childList:true,subtree:true,characterData:true});
    }
  }

  window.refreshChallengeRedesign = refresh;
  window.addEventListener('streg:languagechange',queueRefresh);
  window.addEventListener('streg:startup-complete',queueRefresh);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  setTimeout(install,700);
})();
