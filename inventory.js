(function(){
  'use strict';

  var FILTER = 'all';
  var installed = false;

  function isEnglish(){
    try{ return window.I18n && window.I18n.getLanguage && window.I18n.getLanguage() === 'en'; }catch(error){}
    return document.documentElement.lang === 'en';
  }

  function text(da,en){ return isEnglish() ? en : da; }

  function appState(){
    try{ return typeof S !== 'undefined' && S ? S : null; }catch(error){ return null; }
  }

  function catalogValue(name){
    try{
      if(name === 'titles' && typeof TITLE_CATALOG !== 'undefined') return TITLE_CATALOG;
      if(name === 'colors' && typeof COLOR_CATALOG !== 'undefined') return COLOR_CATALOG;
      if(name === 'frames' && typeof FRAME_CATALOG !== 'undefined') return FRAME_CATALOG;
      if(name === 'themes' && typeof THEME_CATALOG !== 'undefined') return THEME_CATALOG;
      if(name === 'fonts' && typeof FONT_CATALOG !== 'undefined'){
        var fonts = FONT_CATALOG.slice();
        if(typeof FONT_CATALOG_EXCLUSIVE !== 'undefined') fonts = fonts.concat(FONT_CATALOG_EXCLUSIVE);
        return fonts;
      }
      if(name === 'badges' && typeof NAME_BADGES !== 'undefined') return NAME_BADGES;
    }catch(error){}
    return [];
  }

  function eventName(key){
    var names = {
      midnight:'Midnight Bloom',
      plant:'Plant Bloom',
      solar:'Solar Flare'
    };
    return names[key] || 'STREG Event';
  }

  function eventKeyForItem(id){
    id = String(id || '').toLowerCase();
    if(/midnight|nattegloed|nordlys|moonring|lunar/.test(id)) return 'midnight';
    if(/plant|gartner|chlorophyll|vinering|botanic/.test(id)) return 'plant';
    if(/solar|solvaer|sunbeam|coronaring|helios/.test(id)) return 'solar';
    return '';
  }

  function kindLabel(kind){
    var map = {
      title:text('Titel','Title'),
      color:text('Farve','Colour'),
      frame:text('Ring','Ring'),
      theme:text('Tema','Theme'),
      font:text('Skrifttype','Font'),
      badge:'Badge',
      freeze:text('Streg-fryser','Streak freeze')
    };
    return map[kind] || kind;
  }

  function ownedIds(key){
    var state = appState();
    if(!state || !state.shop || !Array.isArray(state.shop[key])) return [];
    return state.shop[key];
  }

  function isOwned(item){
    var state = appState();
    if(!state) return false;
    if(item.kind === 'badge'){
      return !!(state.badges && Array.isArray(state.badges.unlocked) && state.badges.unlocked.indexOf(item.id) !== -1);
    }
    if(item.kind === 'freeze') return Number(state.freezes || 0) > 0;
    return ownedIds(item.key).indexOf(item.id) !== -1;
  }

  function isEquipped(item){
    var state = appState();
    if(!state) return false;
    if(item.kind === 'title') return state.shop && state.shop.equippedTitle === item.id;
    if(item.kind === 'color') return state.shop && state.shop.equippedColor === item.id;
    if(item.kind === 'frame') return state.shop && state.shop.equippedFrame === item.id;
    if(item.kind === 'font') return state.settings && state.settings.font === item.id;
    if(item.kind === 'theme') return state.settings && state.settings.style === item.id;
    if(item.kind === 'badge') return state.badges && state.badges.equipped === item.id;
    return false;
  }

  function normalizeItem(kind,key,raw){
    var id = raw && raw.id != null ? String(raw.id) : '';
    var eventKey = raw && raw.eventOnly ? eventKeyForItem(id) : '';
    return {
      kind:kind,
      key:key,
      id:id,
      name:(raw && (raw.name || raw.label)) || id,
      cls:(raw && raw.cls) || '',
      sw:(raw && raw.sw) || '',
      eventOnly:!!(raw && raw.eventOnly),
      fragmentOnly:!!(raw && raw.fragmentOnly),
      eventKey:eventKey,
      raw:raw || {}
    };
  }

  function allCatalogItems(){
    var result = [];
    catalogValue('titles').forEach(function(item){ result.push(normalizeItem('title','titles',item)); });
    catalogValue('colors').forEach(function(item){ result.push(normalizeItem('color','colors',item)); });
    catalogValue('frames').forEach(function(item){ result.push(normalizeItem('frame','frames',item)); });
    catalogValue('themes').forEach(function(item){ result.push(normalizeItem('theme','themes',item)); });
    catalogValue('fonts').forEach(function(item){ result.push(normalizeItem('font','fonts',item)); });
    catalogValue('badges').forEach(function(item){ result.push(normalizeItem('badge','badges',item)); });
    return result;
  }

  function ownedInventoryItems(){
    var state = appState();
    if(!state) return [];
    var items = allCatalogItems().filter(isOwned);
    if(Number(state.freezes || 0) > 0){
      items.unshift({
        kind:'freeze',key:'freezes',id:'streak-freeze',
        name:text('Streg-frysere','Streak freezes'),
        count:Number(state.freezes || 0),eventOnly:false,fragmentOnly:false,raw:{}
      });
    }
    return items;
  }

  function eventCollection(){
    var state = appState();
    var active = state && state.settings ? state.settings.activeEvent : 'midnight';
    return allCatalogItems()
      .filter(function(item){ return item.eventOnly; })
      .sort(function(a,b){
        var aa = a.eventKey === active ? 0 : 1;
        var bb = b.eventKey === active ? 0 : 1;
        if(aa !== bb) return aa - bb;
        return a.name.localeCompare(b.name);
      });
  }

  function sourceLabel(item){
    if(item.eventOnly) return eventName(item.eventKey);
    if(item.fragmentOnly) return 'Black Hole';
    if(item.kind === 'badge') return text('Bedrift','Achievement');
    if(item.kind === 'freeze') return text('Forbrugsting','Consumable');
    if(item.id === 'baloo') return text('Fra start','Starter item');
    return text('Butik','Shop');
  }

  function preview(item){
    if(item.kind === 'title'){
      return '<div class="inventory-preview inventory-title-preview sw-' + item.sw + '">' + escapeHtml(item.name) + '</div>';
    }
    if(item.kind === 'color'){
      return '<div class="inventory-preview inventory-color-preview"><span class="' + item.cls + '">' + escapeHtml(item.name) + '</span></div>';
    }
    if(item.kind === 'frame'){
      return '<div class="inventory-preview inventory-frame-preview"><div class="inventory-avatar avatar ' + item.cls + '">DIG</div></div>';
    }
    if(item.kind === 'font'){
      return '<div class="inventory-preview inventory-font-preview ' + item.cls + '">Aa</div>';
    }
    if(item.kind === 'theme'){
      return '<div class="inventory-preview inventory-theme-preview sw-' + item.sw + '"><span>' + escapeHtml(item.name) + '</span></div>';
    }
    if(item.kind === 'badge'){
      var symbol = item.raw && item.raw.symbol ? item.raw.symbol : '✦';
      var label = item.raw && item.raw.label ? item.raw.label : 'BADGE';
      return '<div class="inventory-preview inventory-badge-preview"><strong>' + escapeHtml(symbol) + '</strong><span>' + escapeHtml(label) + '</span></div>';
    }
    return '<div class="inventory-preview inventory-freeze-preview">' +
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.2 5.8 5.6v5.1c0 4.4 2.8 7.8 6.2 9.1 3.4-1.3 6.2-4.7 6.2-9.1V5.6L12 3.2Z" fill="currentColor" opacity=".18"/><path d="M12 3.2 5.8 5.6v5.1c0 4.4 2.8 7.8 6.2 9.1 3.4-1.3 6.2-4.7 6.2-9.1V5.6L12 3.2Z" stroke="currentColor" stroke-width="1.5"/><path d="m9.2 12 1.9 1.9 4-4.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<strong>×' + Number(item.count || 0) + '</strong></div>';
  }

  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function canEquip(item){
    return item.kind !== 'freeze';
  }

  function openEvent(){
    try{
      if(typeof switchTab === 'function') switchTab('tab-challenges');
      else{
        var nav = document.querySelector('.tabbtn[data-tab="tab-challenges"]');
        if(nav) nav.click();
      }
    }catch(error){}
    setTimeout(function(){
      var button = document.querySelector('#challengeSubtabs [data-ch-pane="pane-ch-event"]');
      if(button) button.click();
    },120);
  }

  function refreshApp(){
    try{ if(typeof save === 'function') save(); }catch(error){}
    try{ if(typeof Settings !== 'undefined' && Settings.applyTheme) Settings.applyTheme(); }catch(error){}
    try{ if(typeof Settings !== 'undefined' && Settings.refresh) Settings.refresh(); }catch(error){}
    try{ if(typeof renderAll === 'function') renderAll(); }catch(error){}
    try{ if(typeof Shop !== 'undefined' && Shop.render) Shop.render(); }catch(error){}
    render();
  }

  function equipItem(item){
    var state = appState();
    if(!state) return;
    if(!isOwned(item)){
      if(item.eventOnly) openEvent();
      return;
    }

    state.shop = state.shop || {};
    state.settings = state.settings || {};

    if(item.kind === 'title') state.shop.equippedTitle = state.shop.equippedTitle === item.id ? null : item.id;
    else if(item.kind === 'color') state.shop.equippedColor = state.shop.equippedColor === item.id ? null : item.id;
    else if(item.kind === 'frame') state.shop.equippedFrame = state.shop.equippedFrame === item.id ? null : item.id;
    else if(item.kind === 'font') state.settings.font = state.settings.font === item.id ? 'baloo' : item.id;
    else if(item.kind === 'theme') state.settings.style = item.id;
    else if(item.kind === 'badge'){
      state.badges = state.badges || {unlocked:['starter'],equipped:'starter'};
      state.badges.equipped = item.id;
    }
    else return;

    try{ if(typeof SFX !== 'undefined' && SFX.pop) SFX.pop(); }catch(error){}
    try{ if(typeof vibrate === 'function') vibrate(16); }catch(error){}
    refreshApp();
    try{
      if(typeof toast === 'function') toast(isEquipped(item) ? item.name + ' ' + text('er nu i brug','is now equipped') : item.name + ' ' + text('er fjernet','was removed'));
    }catch(error){}
  }

  function itemCard(item){
    var owned = isOwned(item);
    var equipped = owned && isEquipped(item);
    var card = document.createElement('article');
    card.className = 'inventory-item' + (owned ? ' is-owned' : ' is-locked') + (equipped ? ' is-equipped' : '') + (item.eventOnly ? ' is-event' : '');
    card.dataset.inventoryKind = item.kind;
    card.dataset.inventoryId = item.id;

    var stateText = equipped
      ? text('I brug','Equipped')
      : owned
        ? text('Ejet','Owned')
        : text('Låst','Locked');

    var action = '';
    if(canEquip(item)){
      var actionText = equipped
        ? text('Fjern','Unequip')
        : owned
          ? text('Brug','Equip')
          : item.eventOnly
            ? text('Åbn event','Open event')
            : text('Låst','Locked');
      action = '<button class="inventory-item-action" type="button"' + (!owned && !item.eventOnly ? ' disabled' : '') + '>' + actionText + '</button>';
    }else{
      action = '<span class="inventory-item-quantity">' + Number(item.count || 0) + ' ' + text('på lager','stored') + '</span>';
    }

    card.innerHTML =
      '<div class="inventory-state-row">' +
        '<span class="inventory-state' + (equipped ? ' equipped' : owned ? ' owned' : ' locked') + '">' + stateText + '</span>' +
        (item.eventOnly ? '<span class="inventory-event-chip">EVENT</span>' : '') +
      '</div>' +
      preview(item) +
      '<div class="inventory-item-copy">' +
        '<strong>' + escapeHtml(item.name) + '</strong>' +
        '<span>' + escapeHtml(kindLabel(item.kind)) + ' · ' + escapeHtml(sourceLabel(item)) + '</span>' +
      '</div>' +
      action;

    var button = card.querySelector('.inventory-item-action');
    if(button) button.addEventListener('click',function(){ equipItem(item); });
    return card;
  }

  function currentEventState(){
    var state = appState();
    if(!state) return {key:'midnight',xp:0,claimed:[]};
    var key = state.settings && state.settings.activeEvent ? state.settings.activeEvent : 'midnight';
    var selected = state.events && state.events[key] ? state.events[key] : state.event || {};
    return {
      key:key,
      xp:Number(selected.xp || 0),
      claimed:Array.isArray(selected.claimedRewards) ? selected.claimedRewards : []
    };
  }

  function summaryMarkup(){
    var state = appState();
    if(!state) return '';
    var owned = ownedInventoryItems();
    var eventAll = eventCollection();
    var eventOwned = eventAll.filter(isOwned).length;
    return '<section class="inventory-summary">' +
      '<div class="inventory-summary-main">' +
        '<span class="inventory-kicker">' + text('DIN SAMLING','YOUR COLLECTION') + '</span>' +
        '<h3>' + text('Alt du ejer, samlet ét sted','Everything you own, in one place') + '</h3>' +
        '<p>' + text('Brug titler, ringe, farver, temaer og event-rewards direkte fra dit inventory.','Equip titles, rings, colours, themes, and Event rewards directly from your inventory.') + '</p>' +
      '</div>' +
      '<div class="inventory-summary-stats">' +
        '<div><strong>' + owned.length + '</strong><span>' + text('Items','Items') + '</span></div>' +
        '<div><strong>' + eventOwned + '/' + eventAll.length + '</strong><span>Event</span></div>' +
        '<div><strong>' + Number(state.freezes || 0) + '</strong><span>' + text('Frysere','Freezes') + '</span></div>' +
        '<div><strong>' + Number(state.fragments || 0) + '</strong><span>Fragments</span></div>' +
      '</div>' +
    '</section>';
  }

  function eventBannerMarkup(){
    var event = currentEventState();
    return '<button class="inventory-event-banner" id="inventoryEventBanner" type="button">' +
      '<span class="inventory-event-orb" aria-hidden="true">✦</span>' +
      '<span class="inventory-event-copy">' +
        '<small>' + text('AKTIV EVENT-SAMLING','ACTIVE EVENT COLLECTION') + '</small>' +
        '<strong>' + escapeHtml(eventName(event.key)) + '</strong>' +
        '<span>' + event.xp + ' Event-XP · ' + event.claimed.length + ' ' + text('rewards hentet','rewards claimed') + '</span>' +
      '</span>' +
      '<span class="inventory-event-arrow" aria-hidden="true">›</span>' +
    '</button>';
  }

  function filteredItems(){
    if(FILTER === 'event') return eventCollection();
    var items = ownedInventoryItems();
    if(FILTER === 'profile'){
      return items.filter(function(item){ return ['title','color','frame','badge'].indexOf(item.kind) !== -1; });
    }
    if(FILTER === 'looks'){
      return items.filter(function(item){ return ['theme','font'].indexOf(item.kind) !== -1; });
    }
    return items;
  }

  function render(){
    var pane = document.getElementById('pane-inventory');
    if(!pane) return;

    var items = filteredItems();
    pane.innerHTML =
      summaryMarkup() +
      eventBannerMarkup() +
      '<div class="inventory-toolbar" role="tablist" aria-label="' + text('Inventory-filtre','Inventory filters') + '">' +
        filterButton('all',text('Alle','All')) +
        filterButton('profile',text('Profil','Profile')) +
        filterButton('looks',text('Udseende','Looks')) +
        filterButton('event','Event') +
      '</div>' +
      '<div class="inventory-grid" id="inventoryGrid"></div>' +
      (!items.length ? '<div class="inventory-empty"><strong>' + text('Ingen items her endnu','No items here yet') + '</strong><span>' + text('Lås rewards op eller køb noget i butikken.','Unlock rewards or buy something in the Shop.') + '</span></div>' : '');

    pane.querySelectorAll('[data-inventory-filter]').forEach(function(button){
      button.addEventListener('click',function(){
        FILTER = button.dataset.inventoryFilter;
        render();
      });
    });

    var eventBanner = document.getElementById('inventoryEventBanner');
    if(eventBanner) eventBanner.addEventListener('click',openEvent);

    var grid = document.getElementById('inventoryGrid');
    if(grid){
      var fragment = document.createDocumentFragment();
      items.forEach(function(item,index){
        var card = itemCard(item);
        card.style.setProperty('--inventory-index',index);
        fragment.appendChild(card);
      });
      grid.appendChild(fragment);
    }
  }

  function filterButton(id,label){
    return '<button type="button" class="inventory-filter' + (FILTER === id ? ' on' : '') + '" data-inventory-filter="' + id + '" role="tab" aria-selected="' + (FILTER === id ? 'true' : 'false') + '">' + label + '</button>';
  }

  function installStyles(){
    if(document.getElementById('inventoryStyles')) return;
    var style = document.createElement('style');
    style.id = 'inventoryStyles';
    style.textContent = [
      '#shopSubtabs.inventory-enabled{grid-template-columns:repeat(6,minmax(82px,1fr))!important;overflow-x:auto!important;scrollbar-width:none!important;}',
      '#shopSubtabs.inventory-enabled::-webkit-scrollbar{display:none!important;}',
      '#shopSubtabs .inventory-shop-tab{--inventory-accent:#8059d6;}',
      '#shopSubtabs .inventory-shop-tab.on{color:#7250c4!important;background:color-mix(in srgb,#8059d6 12%,var(--card))!important;}',
      '#pane-inventory{padding-bottom:36px!important;}',
      '.inventory-summary{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:20px;margin-bottom:12px;padding:22px;border:1px solid color-mix(in srgb,#8059d6 17%,var(--line));border-radius:27px;background:radial-gradient(circle at 92% 8%,rgba(128,89,214,.15),transparent 34%),linear-gradient(145deg,var(--card),color-mix(in srgb,#8059d6 6%,var(--card)));box-shadow:0 18px 42px -34px rgba(50,31,100,.7);overflow:hidden;}',
      '.inventory-summary::after{content:"";position:absolute;right:-55px;top:-70px;width:180px;height:180px;border:1px solid rgba(128,89,214,.12);border-radius:50%;box-shadow:0 0 0 26px rgba(128,89,214,.035),0 0 0 55px rgba(128,89,214,.022);pointer-events:none;}',
      '.inventory-kicker{display:block;margin-bottom:7px;color:#7453c3;font-size:8px;font-weight:950;letter-spacing:.15em;}',
      '.inventory-summary h3{margin:0;color:var(--ink);font-family:var(--font-display);font-size:24px;font-weight:900;line-height:1.05;letter-spacing:-.03em;}',
      '.inventory-summary p{max-width:520px;margin:8px 0 0;color:var(--ink-soft);font-size:10.5px;font-weight:600;line-height:1.45;}',
      '.inventory-summary-stats{position:relative;z-index:1;display:grid;grid-template-columns:repeat(2,78px);gap:7px;}',
      '.inventory-summary-stats div{display:grid;place-items:center;min-height:62px;padding:8px;border:1px solid color-mix(in srgb,#8059d6 12%,var(--line));border-radius:17px;background:color-mix(in srgb,var(--card) 84%,transparent);box-shadow:inset 0 1px rgba(255,255,255,.45);}',
      '.inventory-summary-stats strong{color:var(--ink);font-size:17px;font-weight:950;line-height:1;}',
      '.inventory-summary-stats span{margin-top:5px;color:var(--ink-soft);font-size:7.5px;font-weight:850;}',
      '.inventory-event-banner{position:relative;display:grid;grid-template-columns:52px minmax(0,1fr) 36px;align-items:center;gap:13px;width:100%;margin:0 0 12px;padding:13px 14px;border:1px solid rgba(139,105,234,.28);border-radius:21px;color:#fff;background:radial-gradient(circle at 82% 20%,rgba(103,233,255,.22),transparent 26%),linear-gradient(135deg,#28176d,#6341b8 57%,#1b547d);box-shadow:0 18px 36px -28px rgba(74,42,157,.9);text-align:left;cursor:pointer;overflow:hidden;}',
      '.inventory-event-orb{display:grid;place-items:center;width:50px;height:50px;border:1px solid rgba(255,255,255,.24);border-radius:17px;background:linear-gradient(145deg,rgba(255,255,255,.26),rgba(255,255,255,.07));box-shadow:0 0 24px rgba(117,83,222,.5),inset 0 1px rgba(255,255,255,.28);font-size:22px;}',
      '.inventory-event-copy{display:block;min-width:0;}',
      '.inventory-event-copy small{display:block;margin-bottom:4px;color:#cfc7ff;font-size:7.5px;font-weight:950;letter-spacing:.14em;}',
      '.inventory-event-copy strong{display:block;overflow:hidden;color:#fff;font-family:var(--font-display);font-size:18px;font-weight:900;text-overflow:ellipsis;white-space:nowrap;}',
      '.inventory-event-copy span{display:block;margin-top:4px;color:rgba(255,255,255,.68);font-size:9px;font-weight:700;}',
      '.inventory-event-arrow{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;color:#694bc2;background:rgba(255,255,255,.94);font-size:25px;}',
      '.inventory-toolbar{display:flex;gap:6px;margin:0 0 12px;padding:5px;border:1px solid var(--line);border-radius:19px;background:var(--paper-2);overflow-x:auto;scrollbar-width:none;}',
      '.inventory-toolbar::-webkit-scrollbar{display:none;}',
      '.inventory-filter{flex:1 0 auto;min-height:39px;padding:0 14px;border:0;border-radius:14px;color:var(--ink-soft);background:transparent;font:800 10px/1 var(--font-ui);cursor:pointer;}',
      '.inventory-filter.on{color:#7250c4;background:var(--card);box-shadow:0 8px 18px -15px rgba(22,36,43,.7);}',
      '.inventory-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}',
      '.inventory-item{position:relative;display:grid;grid-template-rows:auto 104px auto auto;min-width:0;padding:12px;border:1px solid var(--line);border-radius:21px;background:linear-gradient(145deg,var(--card),color-mix(in srgb,var(--paper-2) 55%,var(--card)));box-shadow:0 12px 28px -25px rgba(22,36,43,.68);overflow:hidden;animation:inventoryItemIn .38s var(--glide) both;animation-delay:calc(var(--inventory-index)*36ms);}',
      '.inventory-item.is-event{border-color:rgba(128,89,214,.24);background:linear-gradient(145deg,color-mix(in srgb,#8059d6 8%,var(--card)),color-mix(in srgb,#49b8d0 5%,var(--card)));}',
      '.inventory-item.is-locked{filter:saturate(.55);}',
      '.inventory-item.is-equipped{border-color:color-mix(in srgb,var(--moss) 36%,var(--line));box-shadow:0 14px 30px -24px rgba(47,105,56,.5),inset 0 0 0 1px color-mix(in srgb,var(--moss) 12%,transparent);}',
      '.inventory-state-row{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:22px;margin-bottom:8px;}',
      '.inventory-state,.inventory-event-chip{display:inline-flex;align-items:center;min-height:20px;padding:0 7px;border-radius:999px;font-size:7px;font-weight:950;letter-spacing:.05em;}',
      '.inventory-state.owned{color:var(--moss-dark);background:var(--moss-soft);}',
      '.inventory-state.equipped{color:#fff;background:var(--moss);}',
      '.inventory-state.locked{color:var(--ink-soft);background:var(--line);}',
      '.inventory-event-chip{color:#664ac0;background:rgba(128,89,214,.12);}',
      '.inventory-preview{position:relative;display:grid;place-items:center;min-width:0;height:104px;border:1px solid color-mix(in srgb,var(--line) 70%,transparent);border-radius:16px;background:var(--paper-2);overflow:hidden;}',
      '.inventory-title-preview{padding:12px;color:#fff;font-size:14px;font-weight:900;text-align:center;}',
      '.inventory-color-preview span{font-size:17px;font-weight:950;}',
      '.inventory-frame-preview{background:radial-gradient(circle,var(--card),var(--paper-2));}',
      '.inventory-avatar{display:grid!important;place-items:center!important;width:58px!important;height:58px!important;border-radius:50%!important;color:var(--ink-soft)!important;background:var(--card)!important;font-size:9px!important;font-weight:950!important;}',
      '.inventory-font-preview{font-size:39px;font-weight:800;}',
      '.inventory-theme-preview{align-content:end;justify-items:start;padding:12px;color:#fff;}',
      '.inventory-theme-preview::before{content:"";position:absolute;inset:0;background:linear-gradient(transparent,rgba(0,0,0,.34));}',
      '.inventory-theme-preview span{position:relative;z-index:1;font-size:11px;font-weight:900;}',
      '.inventory-badge-preview{display:flex;flex-direction:column;gap:4px;color:#7654c6;background:radial-gradient(circle at 50% 38%,rgba(128,89,214,.18),transparent 45%),var(--paper-2);}',
      '.inventory-badge-preview strong{font-size:29px;line-height:1;}',
      '.inventory-badge-preview span{font-size:8px;font-weight:950;letter-spacing:.09em;}',
      '.inventory-freeze-preview{grid-template-columns:auto auto;gap:8px;color:#4e80bf;background:linear-gradient(145deg,#edf6ff,var(--card));}',
      '.inventory-freeze-preview svg{width:45px;height:45px;}',
      '.inventory-freeze-preview strong{font-size:23px;font-weight:950;}',
      '.inventory-item-copy{min-width:0;padding:11px 2px 9px;}',
      '.inventory-item-copy strong{display:block;overflow:hidden;color:var(--ink);font-size:13px;font-weight:900;text-overflow:ellipsis;white-space:nowrap;}',
      '.inventory-item-copy span{display:block;margin-top:4px;overflow:hidden;color:var(--ink-soft);font-size:8.5px;font-weight:700;text-overflow:ellipsis;white-space:nowrap;}',
      '.inventory-item-action{width:100%;min-height:38px;border:1px solid color-mix(in srgb,#8059d6 18%,var(--line));border-radius:13px;color:#6848b8;background:color-mix(in srgb,#8059d6 9%,var(--card));font:850 10px/1 var(--font-ui);cursor:pointer;}',
      '.inventory-item.is-equipped .inventory-item-action{color:var(--moss-dark);border-color:color-mix(in srgb,var(--moss) 23%,var(--line));background:var(--moss-soft);}',
      '.inventory-item-action:disabled{color:var(--ink-soft);background:var(--paper-2);cursor:not-allowed;opacity:.65;}',
      '.inventory-item-quantity{display:grid;place-items:center;min-height:38px;border-radius:13px;color:var(--ink-soft);background:var(--paper-2);font-size:9px;font-weight:850;}',
      '.inventory-empty{display:grid;gap:5px;place-items:center;margin-top:12px;padding:34px 18px;border:1px dashed var(--line-2);border-radius:21px;color:var(--ink-soft);text-align:center;}',
      '.inventory-empty strong{color:var(--ink);font-size:14px;}',
      '.inventory-empty span{font-size:10px;}',
      '@keyframes inventoryItemIn{from{opacity:0;transform:translateY(9px) scale(.985)}to{opacity:1;transform:none}}',
      '@media(max-width:760px){#shopSubtabs.inventory-enabled{display:flex!important;gap:7px!important;overflow-x:auto!important;}#shopSubtabs.inventory-enabled .shop-subtab{flex:0 0 96px!important}.inventory-summary{grid-template-columns:1fr;padding:18px}.inventory-summary-stats{grid-template-columns:repeat(4,minmax(0,1fr))}.inventory-summary-stats div{min-height:54px}.inventory-grid{grid-template-columns:1fr 1fr}}',
      '@media(max-width:470px){.inventory-summary{padding:16px;border-radius:23px}.inventory-summary h3{font-size:21px}.inventory-summary p{font-size:9.5px}.inventory-summary-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.inventory-event-banner{grid-template-columns:45px minmax(0,1fr) 31px;padding:11px}.inventory-event-orb{width:43px;height:43px;border-radius:14px}.inventory-event-copy strong{font-size:16px}.inventory-grid{grid-template-columns:1fr}.inventory-item{grid-template-rows:auto 112px auto auto}.inventory-preview{height:112px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function activatePane(id){
    var tab = document.getElementById('tab-shop');
    if(!tab) return;
    tab.querySelectorAll('.shop-subtab').forEach(function(button){
      button.classList.toggle('on',button.dataset.shopPane === id);
    });
    tab.querySelectorAll('.shop-pane').forEach(function(pane){
      pane.classList.toggle('on',pane.id === id);
    });
    if(id === 'pane-inventory') render();
  }

  function install(){
    installStyles();
    var shopTab = document.getElementById('tab-shop');
    var subtabs = document.getElementById('shopSubtabs');
    if(!shopTab || !subtabs) return;

    subtabs.classList.add('inventory-enabled');
    var button = document.getElementById('inventoryShopTab');
    if(!button){
      button = document.createElement('button');
      button.type = 'button';
      button.id = 'inventoryShopTab';
      button.className = 'shop-subtab inventory-shop-tab';
      button.dataset.shopPane = 'pane-inventory';
      button.innerHTML = '<svg class="icn" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 8.5h14l-1 11H6l-1-11Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8.5 8.5V6.8A3.5 3.5 0 0 1 12 3.3a3.5 3.5 0 0 1 3.5 3.5v1.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M9 13h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span>' + text('Inventory','Inventory') + '</span>';
      subtabs.insertBefore(button,subtabs.firstElementChild);
    }

    var pane = document.getElementById('pane-inventory');
    if(!pane){
      pane = document.createElement('div');
      pane.id = 'pane-inventory';
      pane.className = 'shop-pane shop-pane-scroll';
      subtabs.parentNode.insertBefore(pane,subtabs.nextSibling);
    }

    if(!subtabs.dataset.inventoryBound){
      subtabs.dataset.inventoryBound = '1';
      subtabs.addEventListener('click',function(event){
        var target = event.target.closest('[data-shop-pane]');
        if(!target) return;
        setTimeout(function(){ activatePane(target.dataset.shopPane); },0);
      });
    }

    if(!installed){
      installed = true;
      if(typeof window.renderAll === 'function' && !window.renderAll.__inventoryWrapped){
        var original = window.renderAll;
        var wrapped = function(){
          var result = original.apply(this,arguments);
          setTimeout(function(){
            if(document.getElementById('pane-inventory') && document.getElementById('pane-inventory').classList.contains('on')) render();
          },0);
          return result;
        };
        wrapped.__inventoryWrapped = true;
        window.renderAll = wrapped;
      }
    }

    render();
  }

  window.renderInventory = render;
  window.openInventory = function(){
    try{ if(typeof switchTab === 'function') switchTab('tab-shop'); }catch(error){}
    setTimeout(function(){ activatePane('pane-inventory'); },80);
  };
  window.addEventListener('streg:startup-complete',install);
  window.addEventListener('streg:languagechange',function(){
    var button = document.getElementById('inventoryShopTab');
    if(button){
      var label = button.querySelector('span');
      if(label) label.textContent = text('Inventory','Inventory');
    }
    render();
  });
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) install(); });

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  setTimeout(install,700);
  setInterval(function(){
    var pane = document.getElementById('pane-inventory');
    if(pane && pane.classList.contains('on')) render();
  },2200);
})();
