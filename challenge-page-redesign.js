(function(){
  'use strict';

  function isEnglish(){
    try{ return window.I18n && window.I18n.getLanguage && window.I18n.getLanguage() === 'en'; }catch(error){}
    return document.documentElement.lang === 'en';
  }

  function text(da,en){ return isEnglish() ? en : da; }

  function setText(node,value){
    if(node && node.textContent !== value) node.textContent = value;
  }

  function installStyles(){
    var old = document.getElementById('challengePageRedesignStyles');
    if(old) old.remove();

    var style = document.createElement('style');
    style.id = 'challengePageRedesignStyles';
    style.textContent = [
      '#tab-challenges{position:relative;isolation:isolate;padding:4px 0 44px!important;}',
      '#tab-challenges::before{content:"";position:absolute;z-index:-1;left:50%;top:-66px;width:min(720px,110vw);height:230px;pointer-events:none;background:radial-gradient(ellipse at top,color-mix(in srgb,var(--amber-soft) 34%,transparent),transparent 68%);transform:translateX(-50%);}',

      /* Header */
      '#tab-challenges>.brandrow.challenge-hub-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:16px!important;min-height:58px!important;margin:0 0 12px!important;padding:0 2px!important;border:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important;}',
      '.challenge-hub-title-wrap{display:flex;align-items:center;min-width:0;}',
      '#tab-challenges .challenge-hub-head h2{margin:0!important;color:var(--ink)!important;font-family:var(--font-display)!important;font-size:clamp(29px,5.5vw,38px)!important;font-weight:900!important;line-height:1!important;letter-spacing:-.04em!important;text-align:left!important;}',
      '#tab-challenges .challenge-hub-head #rerollBtn{position:static!important;display:grid!important;place-items:center!important;width:42px!important;height:42px!important;min-width:42px!important;min-height:42px!important;padding:0!important;border:1px solid color-mix(in srgb,var(--line) 88%,transparent)!important;border-radius:15px!important;color:var(--ink-soft)!important;background:color-mix(in srgb,var(--card) 96%,transparent)!important;box-shadow:0 7px 20px -17px rgba(22,36,43,.65)!important;font-size:0!important;transform:none!important;transition:transform .16s ease,border-color .16s ease,background .16s ease!important;}',
      '#tab-challenges .challenge-hub-head #rerollBtn:hover{border-color:color-mix(in srgb,var(--amber) 32%,var(--line))!important;background:color-mix(in srgb,var(--card) 91%,var(--amber-soft))!important;}',
      '#tab-challenges .challenge-hub-head #rerollBtn:active{transform:scale(.94)!important;}',
      '#tab-challenges .challenge-hub-head #rerollBtn svg{width:18px!important;height:18px!important;margin:0!important;}',

      /* One quiet segmented control instead of another dashboard */
      '#challengeSubtabs.ch-subtabs{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:3px!important;margin:0 0 15px!important;padding:4px!important;border:1px solid color-mix(in srgb,var(--line) 72%,transparent)!important;border-radius:18px!important;background:color-mix(in srgb,var(--paper-2) 76%,var(--card))!important;box-shadow:inset 0 1px rgba(255,255,255,.42)!important;overflow:visible!important;}',
      '#challengeSubtabs .ch-subtab{display:flex!important;align-items:center!important;justify-content:center!important;min-width:0!important;min-height:42px!important;padding:0 7px!important;border:0!important;border-radius:14px!important;color:var(--ink-soft)!important;background:transparent!important;box-shadow:none!important;font-family:var(--font-ui)!important;font-size:12px!important;font-weight:780!important;line-height:1!important;text-align:center!important;white-space:nowrap!important;transition:color .17s ease,background .17s ease,box-shadow .17s ease,transform .17s ease!important;}',
      '#challengeSubtabs .ch-subtab.on{color:var(--ink)!important;background:var(--card)!important;box-shadow:0 5px 14px -11px rgba(22,36,43,.72),inset 0 0 0 1px color-mix(in srgb,var(--line) 60%,transparent)!important;transform:none!important;}',
      '#challengeSubtabs .ch-subtab[data-ch-pane="pane-ch-event"].on{color:color-mix(in srgb,#8067db 78%,var(--ink))!important;}',
      '#challengeSubtabs .event-tab-spark,#challengeSubtabs .challenge-tab-icon,#challengeSubtabs .challenge-tab-meta,#challengeSubtabs .challenge-tab-count{display:none!important;}',
      '#challengeSubtabs .challenge-tab-label{display:block!important;overflow:hidden!important;color:inherit!important;font-size:inherit!important;font-weight:inherit!important;text-overflow:ellipsis!important;white-space:nowrap!important;}',

      /* Remove redundant summaries / duplicate event promo */
      '#challengeOverview,.challenge-overview,.challenge-pane-meta,.challenge-focus-kicker,#challengeEventPreview{display:none!important;}',
      '#tab-challenges .ch-pane{position:relative!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;}',
      '#challengeList,#weeklyList,#monthlyList{display:grid!important;grid-template-columns:1fr!important;gap:9px!important;}',

      /* Daily cards */
      '#tab-challenges .ch-card{position:relative!important;display:flex!important;align-items:center!important;gap:11px!important;min-height:82px!important;margin:0!important;padding:10px 11px!important;border:1px solid color-mix(in srgb,var(--line) 78%,transparent)!important;border-radius:20px!important;background:var(--card)!important;box-shadow:0 8px 22px -20px rgba(22,36,43,.68)!important;overflow:hidden!important;transition:transform .17s ease,border-color .17s ease,box-shadow .17s ease!important;}',
      '#tab-challenges .ch-card::before,#tab-challenges .ch-card::after{content:none!important;display:none!important;}',
      '#tab-challenges .ch-card:hover{transform:translateY(-1px)!important;border-color:color-mix(in srgb,var(--amber) 25%,var(--line))!important;box-shadow:0 12px 28px -21px rgba(22,36,43,.72)!important;}',
      '#tab-challenges .ch-card:active{transform:scale(.993)!important;}',
      '#tab-challenges .ch-card.done{border-color:color-mix(in srgb,var(--moss) 22%,var(--line))!important;background:color-mix(in srgb,var(--card) 91%,var(--moss-soft))!important;opacity:.82!important;}',
      '#tab-challenges .ch-icon,#tab-challenges .ch-icon img{width:54px!important;height:54px!important;min-width:54px!important;min-height:54px!important;border-radius:17px!important;}',
      '#tab-challenges .ch-icon{display:grid!important;place-items:center!important;flex:0 0 54px!important;background:color-mix(in srgb,var(--paper-2) 75%,var(--card))!important;overflow:hidden!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--line) 54%,transparent)!important;}',
      '#tab-challenges .ch-icon img{display:block!important;object-fit:cover!important;filter:none!important;}',
      '#tab-challenges .ch-card.done .ch-icon{transform:none!important;filter:none!important;}',
      '#tab-challenges .ch-body{display:grid!important;align-content:center!important;gap:4px!important;flex:1!important;min-width:0!important;align-self:stretch!important;padding:4px 0!important;text-align:left!important;}',
      '#tab-challenges .ch-title{display:-webkit-box!important;overflow:hidden!important;margin:0!important;color:var(--ink)!important;font-family:var(--font-ui)!important;font-size:14px!important;font-weight:790!important;line-height:1.2!important;letter-spacing:-.012em!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:2!important;}',
      '#tab-challenges .ch-reward{display:flex!important;align-items:center!important;gap:3px!important;margin:0!important;color:var(--ink-soft)!important;font-size:10px!important;font-weight:650!important;line-height:1!important;white-space:nowrap!important;}',
      '#tab-challenges .ch-reward svg{width:10px!important;height:10px!important;}',
      '#tab-challenges .ch-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;flex:0 0 auto!important;min-width:60px!important;height:38px!important;min-height:38px!important;padding:0 11px!important;border:0!important;border-radius:13px!important;box-shadow:none!important;font-family:var(--font-ui)!important;font-size:11px!important;font-weight:800!important;line-height:1!important;white-space:nowrap!important;}',
      '#tab-challenges .ch-btn.start{color:#16242B!important;background:var(--amber)!important;}',
      '#tab-challenges .ch-btn.done{min-width:38px!important;width:38px!important;padding:0!important;color:#fff!important;background:var(--moss)!important;font-size:0!important;}',
      '#tab-challenges .ch-btn.done svg{width:14px!important;height:14px!important;margin:0!important;}',

      /* Weekly / monthly: keep only information that changes a decision */
      '#tab-challenges .prog-card{position:relative!important;display:grid!important;gap:9px!important;margin:0!important;padding:13px 14px!important;border:1px solid color-mix(in srgb,var(--line) 78%,transparent)!important;border-radius:20px!important;background:var(--card)!important;box-shadow:0 8px 22px -20px rgba(22,36,43,.68)!important;overflow:hidden!important;transition:transform .17s ease,border-color .17s ease,box-shadow .17s ease!important;}',
      '#tab-challenges .prog-card::before,#tab-challenges .prog-card::after{content:none!important;display:none!important;}',
      '#tab-challenges .prog-card:hover{transform:translateY(-1px)!important;border-color:color-mix(in srgb,var(--moss) 24%,var(--line))!important;box-shadow:0 12px 28px -21px rgba(22,36,43,.72)!important;}',
      '#tab-challenges .prog-card.done{border-color:color-mix(in srgb,var(--moss) 22%,var(--line))!important;background:color-mix(in srgb,var(--card) 91%,var(--moss-soft))!important;opacity:.84!important;}',
      '#tab-challenges .prog-top{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:10px!important;margin:0!important;}',
      '#tab-challenges .prog-title{display:grid!important;grid-template-columns:42px minmax(0,1fr)!important;align-items:center!important;gap:10px!important;min-width:0!important;margin:0!important;color:var(--ink)!important;font-family:var(--font-ui)!important;font-size:13.5px!important;font-weight:790!important;line-height:1.2!important;}',
      '#tab-challenges .prog-title>span{display:-webkit-box!important;overflow:hidden!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:2!important;}',
      '#tab-challenges .prog-title-icon{width:42px!important;height:42px!important;border-radius:14px!important;object-fit:cover!important;background:color-mix(in srgb,var(--paper-2) 75%,var(--card))!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--line) 54%,transparent)!important;}',
      '#tab-challenges .prog-reward{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:25px!important;padding:0 8px!important;border:1px solid color-mix(in srgb,var(--line) 72%,transparent)!important;border-radius:999px!important;color:var(--ink-soft)!important;background:color-mix(in srgb,var(--paper-2) 74%,var(--card))!important;font-size:9.5px!important;font-weight:720!important;line-height:1!important;white-space:nowrap!important;}',
      '#tab-challenges .prog-track{height:7px!important;margin:0 0 0 52px!important;border-radius:999px!important;background:color-mix(in srgb,var(--paper-2) 82%,var(--line))!important;overflow:hidden!important;}',
      '#tab-challenges .prog-fill{height:100%!important;border-radius:inherit!important;background:linear-gradient(90deg,var(--moss),color-mix(in srgb,var(--sky) 72%,var(--moss)))!important;box-shadow:none!important;}',
      '#tab-challenges .prog-bottom{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin:0 0 0 52px!important;min-height:30px!important;}',
      '#tab-challenges .prog-count{margin:0!important;color:var(--ink-soft)!important;font-size:10px!important;font-weight:680!important;line-height:1!important;text-align:left!important;}',
      '#tab-challenges .reward-claim-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;min-width:68px!important;height:30px!important;min-height:30px!important;padding:0 10px!important;border:0!important;border-radius:10px!important;box-shadow:none!important;font-size:10px!important;font-weight:800!important;line-height:1!important;}',
      '#tab-challenges .reward-claim-btn.waiting{display:none!important;}',
      '#tab-challenges .reward-claim-btn.ready{color:#fff!important;background:var(--moss)!important;}',
      '#tab-challenges .reward-claim-btn.claimed{min-width:30px!important;width:30px!important;padding:0!important;color:#fff!important;background:var(--moss)!important;font-size:0!important;opacity:.84!important;}',
      '#tab-challenges .reward-claim-btn.claimed svg{width:12px!important;height:12px!important;margin:0!important;}',

      /* Animation should feel polished, not busy */
      '#tab-challenges .stagger>*{animation:challengeCardEnter .32s var(--glide) both;animation-delay:calc(var(--challenge-index,0)*34ms);}',
      '@keyframes challengeCardEnter{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',

      '@media(max-width:520px){',
        '#tab-challenges>.brandrow.challenge-hub-head{min-height:52px!important;margin-bottom:10px!important;}',
        '#tab-challenges .challenge-hub-head h2{font-size:30px!important;}',
        '#tab-challenges .challenge-hub-head #rerollBtn{width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important;border-radius:14px!important;}',
        '#challengeSubtabs.ch-subtabs{margin-bottom:12px!important;}',
        '#challengeSubtabs .ch-subtab{min-height:40px!important;padding:0 5px!important;font-size:11.5px!important;}',
        '#challengeList,#weeklyList,#monthlyList{gap:8px!important;}',
        '#tab-challenges .ch-card{min-height:76px!important;gap:9px!important;padding:9px!important;border-radius:18px!important;}',
        '#tab-challenges .ch-icon,#tab-challenges .ch-icon img{width:50px!important;height:50px!important;min-width:50px!important;min-height:50px!important;border-radius:15px!important;}',
        '#tab-challenges .ch-icon{flex-basis:50px!important;}',
        '#tab-challenges .ch-title{font-size:13.25px!important;}',
        '#tab-challenges .ch-reward{font-size:9.5px!important;}',
        '#tab-challenges .ch-btn{min-width:54px!important;height:36px!important;min-height:36px!important;padding:0 9px!important;font-size:10.5px!important;border-radius:12px!important;}',
        '#tab-challenges .ch-btn.done{min-width:36px!important;width:36px!important;}',
        '#tab-challenges .prog-card{padding:12px!important;border-radius:18px!important;}',
        '#tab-challenges .prog-title{grid-template-columns:38px minmax(0,1fr)!important;gap:9px!important;font-size:12.75px!important;}',
        '#tab-challenges .prog-title-icon{width:38px!important;height:38px!important;border-radius:13px!important;}',
        '#tab-challenges .prog-reward{min-height:23px!important;padding:0 7px!important;font-size:8.75px!important;}',
        '#tab-challenges .prog-track,#tab-challenges .prog-bottom{margin-left:47px!important;}',
      '}',
      '@media(max-width:365px){',
        '#challengeSubtabs .ch-subtab{font-size:10.5px!important;}',
        '#tab-challenges .ch-card{gap:8px!important;padding:8px!important;}',
        '#tab-challenges .ch-icon,#tab-challenges .ch-icon img{width:46px!important;height:46px!important;min-width:46px!important;min-height:46px!important;border-radius:14px!important;}',
        '#tab-challenges .ch-icon{flex-basis:46px!important;}',
        '#tab-challenges .ch-title{font-size:12.5px!important;}',
        '#tab-challenges .ch-reward{font-size:9px!important;}',
        '#tab-challenges .ch-btn{min-width:49px!important;padding:0 8px!important;}',
        '#tab-challenges .prog-reward{display:none!important;}',
        '#tab-challenges .prog-top{grid-template-columns:1fr!important;}',
      '}',
      '@media(prefers-reduced-motion:reduce){#tab-challenges .stagger>*{animation:none!important}#tab-challenges .ch-card,#tab-challenges .prog-card,#tab-challenges .challenge-hub-head #rerollBtn{transition:none!important}}'
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
    setText(title,'Challenges');

    var button = document.getElementById('rerollBtn');
    if(button){
      button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h3M11 17h9" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><circle cx="16" cy="7" r="2" stroke="currentColor" stroke-width="1.75"/><circle cx="9" cy="17" r="2" stroke="currentColor" stroke-width="1.75"/></svg>';
      button.setAttribute('aria-label',text('Nye daglige challenges','Reroll daily challenges'));
      button.title = text('Nye daglige challenges','Reroll daily challenges');
    }
  }

  function removeNoise(){
    var overview = document.getElementById('challengeOverview');
    if(overview) overview.remove();

    var preview = document.getElementById('challengeEventPreview');
    if(preview) preview.remove();

    document.querySelectorAll('#challengeList .challenge-focus-kicker').forEach(function(node){ node.remove(); });
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
      if(button.textContent.trim() !== label || !button.querySelector('.challenge-tab-label')){
        button.innerHTML = '<span class="challenge-tab-label">' + label + '</span>';
      }
      button.setAttribute('aria-label',label);
    });
  }

  function markCards(){
    ['challengeList','weeklyList','monthlyList'].forEach(function(id){
      var list = document.getElementById(id);
      if(!list) return;
      Array.prototype.forEach.call(list.children,function(card,index){
        card.style.setProperty('--challenge-index',index);
      });
    });
  }

  function simplifyDailyButtons(){
    document.querySelectorAll('#challengeList .ch-btn').forEach(function(button){
      if(button.classList.contains('done')){
        button.setAttribute('aria-label',text('Klaret','Done'));
        return;
      }
      var svg = button.querySelector('svg');
      button.innerHTML = (svg ? svg.outerHTML + ' ' : '') + text('Tag','Photo');
      button.setAttribute('aria-label',text('Tag challenge-billede','Take challenge photo'));
    });
  }

  function simplifyProgressButtons(){
    document.querySelectorAll('#weeklyList .reward-claim-btn,#monthlyList .reward-claim-btn').forEach(function(button){
      if(button.classList.contains('ready')){
        var svg = button.querySelector('svg');
        button.innerHTML = (svg ? svg.outerHTML + ' ' : '') + text('Hent','Claim');
      }else if(button.classList.contains('claimed')){
        button.setAttribute('aria-label',text('Hentet','Claimed'));
      }
    });
  }

  function forceVisibleEnglish(){
    if(!isEnglish()) return;
    var tab = document.getElementById('tab-challenges');
    if(!tab) return;

    var replacements = {
      'Daglige':'Daily',
      'Ugentlige':'Weekly',
      'Månedlige':'Monthly',
      'Klaret':'Done',
      'Klar!':'Ready',
      'Hent':'Claim',
      'Hentet':'Claimed',
      'Ikke klar':'Not ready'
    };

    var walker = document.createTreeWalker(tab,NodeFilter.SHOW_TEXT);
    var node;
    while((node = walker.nextNode())){
      var clean = String(node.data || '').trim();
      if(!Object.prototype.hasOwnProperty.call(replacements,clean)) continue;
      var leading = String(node.data).match(/^\s*/)[0];
      var trailing = String(node.data).match(/\s*$/)[0];
      node.data = leading + replacements[clean] + trailing;
    }
  }

  function refresh(){
    installStyles();
    enhanceHeader();
    removeNoise();
    enhanceTabs();
    markCards();
    simplifyDailyButtons();
    simplifyProgressButtons();
    forceVisibleEnglish();
  }

  var observer = null;
  var queued = false;
  function queueRefresh(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(function(){
      queued = false;
      refresh();
    });
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
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) queueRefresh(); });

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  setTimeout(install,650);
})();
