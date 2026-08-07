(function(){
  'use strict';

  if(window.__stregInventoryCleanInstalled) return;
  window.__stregInventoryCleanInstalled = true;

  var paneObserver = null;
  var queued = false;

  function english(){
    try{ return window.I18n && window.I18n.getLanguage && window.I18n.getLanguage() === 'en'; }catch(error){}
    return document.documentElement.lang === 'en';
  }

  function text(da,en){ return english() ? en : da; }

  function installStyles(){
    var old = document.getElementById('inventoryCleanStyles');
    if(old) old.remove();

    var style = document.createElement('style');
    style.id = 'inventoryCleanStyles';
    style.textContent = [
      '#pane-inventory{padding-bottom:26px!important;}',

      /* Compact header: profile + two tiny numbers, no dashboard/ring. */
      '#pane-inventory .vault-hero{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:stretch!important;gap:9px!important;margin-bottom:10px!important;}',
      '#pane-inventory .vault-hero-main{min-height:104px!important;padding:14px 15px!important;border-radius:22px!important;}',
      '#pane-inventory .vault-hero-main::after{opacity:.55!important;transform:scale(.72)!important;transform-origin:100% 0!important;}',
      '#pane-inventory .vault-profile-stage{gap:12px!important;}',
      '#pane-inventory .vault-avatar{width:66px!important;height:66px!important;flex-basis:66px!important;font-size:22px!important;box-shadow:0 12px 24px -19px rgba(64,41,123,.55)!important;}',
      '#pane-inventory .vault-profile-kicker{display:none!important;}',
      '#pane-inventory .vault-profile-copy>strong{font-size:19px!important;}',
      '#pane-inventory .vault-profile-copy>small{margin-top:5px!important;font-size:9px!important;}',
      '#pane-inventory .vault-profile-copy>small i{width:18px!important;height:18px!important;border-radius:6px!important;}',
      '#pane-inventory .vault-collection-score{display:flex!important;align-items:center!important;justify-content:center!important;min-width:108px!important;min-height:104px!important;padding:10px!important;border-radius:22px!important;}',
      '#pane-inventory .vault-progress-ring{display:none!important;}',
      '#pane-inventory .vault-balance-row{display:grid!important;gap:7px!important;margin:0!important;}',
      '#pane-inventory .vault-balance-row span{display:grid!important;place-items:center!important;min-width:86px!important;min-height:35px!important;padding:5px 8px!important;border:1px solid var(--line)!important;border-radius:12px!important;background:color-mix(in srgb,var(--card) 88%,#8059d6 12%)!important;color:var(--ink-soft)!important;font-size:0!important;}',
      '#pane-inventory .vault-balance-row span b{font-size:13px!important;line-height:1!important;}',
      '#pane-inventory .vault-balance-row span::after{margin-top:3px!important;color:var(--ink-soft)!important;font-size:6.5px!important;font-weight:900!important;letter-spacing:.08em!important;text-transform:uppercase!important;}',
      '#pane-inventory .vault-balance-row span:first-child::after{content:"ITEMS";}',
      '#pane-inventory .vault-balance-row span:last-child::after{content:"FRAGMENTS";}',

      /* Three simple modes. */
      '#pane-inventory .vault-view-nav{gap:4px!important;margin-bottom:10px!important;padding:4px!important;border-radius:17px!important;}',
      '#pane-inventory .vault-view-btn{min-height:39px!important;border-radius:13px!important;font-size:9px!important;letter-spacing:.01em!important;}',

      /* Filters become icon-first instead of another row of words. */
      '#pane-inventory .vault-filters{gap:6px!important;margin:0 0 11px!important;}',
      '#pane-inventory .vault-filter{justify-content:center!important;width:38px!important;height:38px!important;min-height:38px!important;padding:0!important;border-radius:12px!important;}',
      '#pane-inventory .vault-filter svg{width:17px!important;height:17px!important;}',
      '#pane-inventory .vault-filter span{position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;}',
      '#pane-inventory .vault-filter:first-child{width:auto!important;min-width:48px!important;padding:0 10px!important;}',
      '#pane-inventory .vault-filter:first-child span{position:static!important;width:auto!important;height:auto!important;margin:0!important;overflow:visible!important;clip:auto!important;clip-path:none!important;font-size:8px!important;}',

      /* Only one useful heading line. */
      '#pane-inventory .vault-section-head{align-items:center!important;margin:0 2px 8px!important;}',
      '#pane-inventory .vault-section-head>div>span{display:none!important;}',
      '#pane-inventory .vault-section-head h3{font-size:16px!important;letter-spacing:-.015em!important;}',
      '#pane-inventory .vault-section-head>strong{min-width:28px!important;height:24px!important;padding:0 7px!important;font-size:8px!important;}',

      /* Visual locker tiles: preview + name, nothing else. */
      '#pane-inventory .vault-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:8px!important;margin-bottom:14px!important;}',
      '#pane-inventory .vault-item{grid-template-rows:auto 82px auto!important;min-height:0!important;padding:8px!important;border-radius:17px!important;box-shadow:0 10px 24px -24px rgba(22,36,43,.72)!important;}',
      '#pane-inventory .vault-item:hover{transform:translateY(-1px)!important;}',
      '#pane-inventory .vault-item-top{min-height:18px!important;}',
      '#pane-inventory .vault-kind-icon{width:22px!important;height:22px!important;border-radius:7px!important;}',
      '#pane-inventory .vault-kind-icon svg{width:12px!important;height:12px!important;}',
      '#pane-inventory .vault-event-tag{font-size:5.5px!important;padding:3px 5px!important;}',
      '#pane-inventory .vault-equipped-dot{width:19px!important;height:19px!important;font-size:9px!important;}',
      '#pane-inventory .vault-preview{min-height:74px!important;border-radius:13px!important;}',
      '#pane-inventory .vault-item-copy{padding-top:7px!important;text-align:center!important;}',
      '#pane-inventory .vault-item-copy strong{display:block!important;overflow:hidden!important;font-size:9px!important;font-weight:900!important;line-height:1.15!important;text-overflow:ellipsis!important;white-space:nowrap!important;}',
      '#pane-inventory .vault-item-copy small{display:none!important;}',
      '#pane-inventory .vault-lock-overlay{backdrop-filter:blur(1px)!important;}',

      /* Loadout becomes six clean tappable cards. */
      '#pane-inventory .vault-loadout-preview{margin-bottom:9px!important;padding:12px!important;border-radius:19px!important;}',
      '#pane-inventory .vault-loadout-preview>span{display:none!important;}',
      '#pane-inventory .vault-loadout-preview .vault-profile-stage{justify-content:flex-start!important;}',
      '#pane-inventory .vault-loadout-preview .vault-avatar{width:54px!important;height:54px!important;flex-basis:54px!important;font-size:18px!important;}',
      '#pane-inventory .vault-slots{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;}',
      '#pane-inventory .vault-slot{display:grid!important;grid-template-columns:36px minmax(0,1fr)!important;align-items:center!important;gap:9px!important;min-height:68px!important;padding:10px!important;border-radius:17px!important;text-align:left!important;}',
      '#pane-inventory .vault-slot-icon{width:36px!important;height:36px!important;border-radius:11px!important;}',
      '#pane-inventory .vault-slot-icon svg{width:17px!important;height:17px!important;}',
      '#pane-inventory .vault-slot-copy small{font-size:6.5px!important;letter-spacing:.07em!important;text-transform:uppercase!important;}',
      '#pane-inventory .vault-slot-copy strong{margin-top:3px!important;font-size:10px!important;line-height:1.1!important;}',
      '#pane-inventory .vault-slot-copy>span,#pane-inventory .vault-slot-arrow{display:none!important;}',

      /* Events stay useful but read like cards, not a report. */
      '#pane-inventory .vault-active-event-card{align-items:center!important;gap:10px!important;margin-bottom:9px!important;padding:12px 13px!important;border-radius:18px!important;}',
      '#pane-inventory .vault-active-event-card>div>span,#pane-inventory .vault-active-event-card>div>small{display:none!important;}',
      '#pane-inventory .vault-active-event-card>div>strong{font-size:13px!important;}',
      '#pane-inventory .vault-active-event-card>button{min-height:34px!important;padding:0 11px!important;border-radius:11px!important;font-size:8px!important;}',
      '#pane-inventory .vault-event-sets{gap:7px!important;margin-bottom:10px!important;}',
      '#pane-inventory .vault-event-set{min-height:78px!important;padding:10px!important;border-radius:17px!important;}',
      '#pane-inventory .vault-event-set-copy small{display:none!important;}',
      '#pane-inventory .vault-event-set-copy strong{font-size:11px!important;}',
      '#pane-inventory .vault-event-set-copy>span{margin-top:3px!important;font-size:7px!important;}',

      /* Bottom sheet: preview, name, one button. */
      '.vault-sheet-panel{border-radius:28px 28px 0 0!important;}',
      '.vault-sheet-preview{margin-bottom:10px!important;}',
      '.vault-sheet-meta{text-align:center!important;}',
      '.vault-sheet-kind{display:none!important;}',
      '.vault-sheet-meta h3{margin:4px 0 0!important;font-size:20px!important;}',
      '.vault-sheet-meta p,.vault-sheet-facts{display:none!important;}',
      '.vault-sheet-action{margin-top:14px!important;min-height:48px!important;border-radius:15px!important;font-size:10px!important;}',
      '.vault-picker-head>span{display:none!important;}',
      '.vault-picker-head h3{margin-bottom:10px!important;font-size:18px!important;text-align:center!important;}',
      '.vault-empty span{display:none!important;}',
      '.vault-empty{min-height:92px!important;padding:18px!important;}',

      '@media(max-width:620px){#pane-inventory .vault-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;}#pane-inventory .vault-hero{grid-template-columns:minmax(0,1fr) 96px!important;}#pane-inventory .vault-collection-score{min-width:96px!important;}}',
      '@media(max-width:400px){#pane-inventory .vault-grid{gap:6px!important;}#pane-inventory .vault-item{padding:7px!important;border-radius:15px!important;}#pane-inventory .vault-slots{gap:6px!important;}#pane-inventory .vault-slot{padding:9px!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function rewriteNav(pane){
    var buttons = pane.querySelectorAll('.vault-view-btn');
    if(buttons[0]) buttons[0].textContent = text('Items','Items');
    if(buttons[1]) buttons[1].textContent = text('Look','Look');
    if(buttons[2]) buttons[2].textContent = text('Events','Events');
  }

  function simplifyStats(pane){
    var balance = pane.querySelector('.vault-balance-row');
    if(!balance) return;
    var spans = balance.querySelectorAll(':scope > span');
    Array.prototype.forEach.call(spans,function(span){
      var bold = span.querySelector('b');
      if(!bold) return;
      if(span === spans[0]){
        var match = (span.textContent || '').match(/(\d+)\s*\/\s*(\d+)/);
        bold.textContent = match ? match[1] : bold.textContent;
      }
    });
  }

  function simplifyCollection(pane){
    var section = pane.querySelector('.vault-view-panel .vault-section-head h3');
    if(section) section.textContent = text('Items','Items');
  }

  function simplifyLoadout(pane){
    var section = pane.querySelector('.vault-view-panel .vault-section-head h3');
    if(section) section.textContent = text('Look','Look');
  }

  function simplifyEvents(pane){
    var section = pane.querySelector('.vault-view-panel .vault-section-head h3');
    if(section && /event/i.test(section.textContent || '')) section.textContent = text('Events','Events');

    pane.querySelectorAll('.vault-event-set-copy>span').forEach(function(node){
      var match = (node.textContent || '').match(/(\d+)\s*\/\s*(\d+)/);
      if(match) node.textContent = match[1] + '/' + match[2];
    });
  }

  function simplifySheet(){
    var sheet = document.getElementById('vaultItemSheet');
    if(!sheet || sheet.hidden) return;
    var button = sheet.querySelector('.vault-sheet-action');
    if(button){
      var value = (button.textContent || '').toLowerCase();
      if(/unequip|fjern/.test(value)) button.textContent = text('Fjern','Unequip');
      else if(/event/.test(value)) button.textContent = text('Event','Event');
      else button.textContent = text('Brug','Equip');
    }
  }

  function simplify(){
    var pane = document.getElementById('pane-inventory');
    if(!pane) return;
    rewriteNav(pane);
    simplifyStats(pane);
    simplifyCollection(pane);
    simplifyLoadout(pane);
    simplifyEvents(pane);
    simplifySheet();
  }

  function queueSimplify(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(function(){
      queued = false;
      simplify();
    });
  }

  function observe(){
    var pane = document.getElementById('pane-inventory');
    if(!pane || pane.dataset.inventoryCleanObserved === 'true') return;
    pane.dataset.inventoryCleanObserved = 'true';
    paneObserver = new MutationObserver(queueSimplify);
    paneObserver.observe(pane,{childList:true,subtree:true});
  }

  function install(){
    installStyles();
    observe();
    simplify();
  }

  window.StregInventoryClean = {refresh:install};
  window.addEventListener('streg:startup-complete',install);
  window.addEventListener('streg:languagechange',queueSimplify);
  document.addEventListener('click',function(event){
    if(event.target && event.target.closest && event.target.closest('#pane-inventory,#vaultItemSheet')){
      setTimeout(queueSimplify,0);
    }
  },{passive:true});

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  setTimeout(install,850);
})();
