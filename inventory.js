(function(){
  'use strict';

  var VIEW = 'collection';
  var CATEGORY = 'all';
  var installed = false;

  function english(){
    try{ return window.I18n && window.I18n.getLanguage && window.I18n.getLanguage() === 'en'; }catch(error){}
    return document.documentElement.lang === 'en';
  }

  function t(da,en){ return english() ? en : da; }

  function state(){
    try{ return typeof S !== 'undefined' && S ? S : null; }catch(error){ return null; }
  }

  function esc(value){
    return String(value == null ? '' : value)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function catalog(name){
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

  function eventKey(id){
    id = String(id || '').toLowerCase();
    if(/midnight|nattegloed|nordlys|moonring|lunar/.test(id)) return 'midnight';
    if(/plant|gartner|chlorophyll|vinering|botanic/.test(id)) return 'plant';
    if(/solar|solvaer|sunbeam|coronaring|helios/.test(id)) return 'solar';
    return '';
  }

  function eventName(key){
    return ({midnight:'Midnight Bloom',plant:'Plant Bloom',solar:'Solar Flare'})[key] || 'STREG Event';
  }

  function normalize(kind,key,raw){
    raw = raw || {};
    var id = String(raw.id == null ? '' : raw.id);
    return {
      kind:kind,
      key:key,
      id:id,
      name:String(raw.name || raw.label || id),
      cls:String(raw.cls || ''),
      sw:String(raw.sw || ''),
      eventOnly:!!raw.eventOnly,
      fragmentOnly:!!raw.fragmentOnly,
      eventKey:raw.eventOnly ? eventKey(id) : '',
      raw:raw
    };
  }

  function allItems(){
    var list = [];
    catalog('titles').forEach(function(item){ list.push(normalize('title','titles',item)); });
    catalog('colors').forEach(function(item){ list.push(normalize('color','colors',item)); });
    catalog('frames').forEach(function(item){ list.push(normalize('frame','frames',item)); });
    catalog('themes').forEach(function(item){ list.push(normalize('theme','themes',item)); });
    catalog('fonts').forEach(function(item){ list.push(normalize('font','fonts',item)); });
    catalog('badges').forEach(function(item){ list.push(normalize('badge','badges',item)); });
    return list;
  }

  function ownedArray(key){
    var s = state();
    return s && s.shop && Array.isArray(s.shop[key]) ? s.shop[key] : [];
  }

  function owned(item){
    var s = state();
    if(!s) return false;
    if(item.kind === 'badge') return !!(s.badges && Array.isArray(s.badges.unlocked) && s.badges.unlocked.indexOf(item.id) !== -1);
    return ownedArray(item.key).indexOf(item.id) !== -1;
  }

  function equipped(item){
    var s = state();
    if(!s) return false;
    if(item.kind === 'title') return !!(s.shop && s.shop.equippedTitle === item.id);
    if(item.kind === 'color') return !!(s.shop && s.shop.equippedColor === item.id);
    if(item.kind === 'frame') return !!(s.shop && s.shop.equippedFrame === item.id);
    if(item.kind === 'theme') return !!(s.settings && s.settings.style === item.id);
    if(item.kind === 'font') return !!(s.settings && s.settings.font === item.id);
    if(item.kind === 'badge') return !!(s.badges && s.badges.equipped === item.id);
    return false;
  }

  function ownedItems(){ return allItems().filter(owned); }

  function eventItems(key){
    return allItems().filter(function(item){ return item.eventOnly && (!key || item.eventKey === key); });
  }

  function label(kind){
    return ({
      title:t('Titel','Title'),
      color:t('Navnefarve','Name colour'),
      frame:t('Profilring','Profile ring'),
      theme:t('Tema','Theme'),
      font:t('Skrifttype','Font'),
      badge:'Badge'
    })[kind] || kind;
  }

  function source(item){
    if(item.eventOnly) return eventName(item.eventKey);
    if(item.fragmentOnly) return 'Black Hole';
    if(item.kind === 'badge') return t('Bedrift','Achievement');
    if(item.id === 'baloo') return t('Start-item','Starter item');
    return t('Butik','Shop');
  }

  function icon(kind){
    var paths = {
      all:'<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>',
      collection:'<path d="m12 3 7 4v10l-7 4-7-4V7l7-4Z"/><path d="m5 7 7 4 7-4M12 11v10"/>',
      loadout:'<circle cx="8" cy="12" r="3.2"/><circle cx="16" cy="12" r="3.2"/><path d="M11.2 12h1.6M4.8 11.4 3 10m16.2 1.4L21 10"/>',
      events:'<rect x="4.5" y="6" width="15" height="14" rx="3"/><path d="M8 3v5M16 3v5M4.5 10h15"/>',
      title:'<rect x="4" y="6" width="16" height="12" rx="2"/><path d="M8 10h8M8 14h5"/>',
      color:'<path d="M12 3.8a8.2 8.2 0 1 0 0 16.4c1.1 0 1.8-.6 1.8-1.5 0-.5-.2-.9-.2-1.3 0-.8.7-1.3 1.5-1.3h1.8c2 0 3.5-1.5 3.5-3.6 0-4.8-3.8-8.7-8.4-8.7Z"/>',
      frame:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5" opacity=".55"/>',
      profile:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-4.2 3-6.3 7-6.3s6.3 2.1 7 6.3"/>',
      theme:'<path d="M12 3 19 8.5 16.3 18 12 21l-4.3-3L5 8.5 12 3Z"/><path d="m8 9 4-2 4 2-1.5 5L12 17l-2.5-3L8 9Z" opacity=".55"/>',
      font:'<path d="M6 18 10.5 6h3L18 18M8 13.5h8"/>',
      badge:'<path d="m12 3 2.4 4.8 5.3.8-3.8 3.7.9 5.2-4.8-2.5-4.8 2.5.9-5.2-3.8-3.7 5.3-.8L12 3Z"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      String(paths[kind] || paths.badge).replace(/\/>/g,' stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/>') +
      '</svg>';
  }

  function checkIcon(){
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6.5 12.5 3.4 3.4 7.8-8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function preview(item,large){
    var cls = 'vault-preview' + (large ? ' large' : '');
    if(item.kind === 'title') return '<div class="' + cls + ' title sw-' + esc(item.sw) + '"><b>' + esc(item.name) + '</b></div>';
    if(item.kind === 'color') return '<div class="' + cls + ' color"><b class="' + esc(item.cls) + '">' + esc(item.name) + '</b></div>';
    if(item.kind === 'frame') return '<div class="' + cls + ' frame"><span class="vault-mini-avatar avatar ' + esc(item.cls) + '">S</span></div>';
    if(item.kind === 'font') return '<div class="' + cls + ' font ' + esc(item.cls) + '"><b>Aa</b><small>' + esc(item.name) + '</small></div>';
    if(item.kind === 'theme') return '<div class="' + cls + ' theme sw-' + esc(item.sw) + '"><span>' + esc(item.name) + '</span></div>';
    var symbol = item.raw && item.raw.symbol ? item.raw.symbol : '✦';
    var badgeLabel = item.raw && item.raw.label ? item.raw.label : 'BADGE';
    return '<div class="' + cls + ' badge"><b>' + esc(symbol) + '</b><span>' + esc(badgeLabel) + '</span></div>';
  }

  function activeEvent(){
    var s = state();
    var key = s && s.settings && s.settings.activeEvent ? s.settings.activeEvent : 'midnight';
    var data = s && s.events && s.events[key] ? s.events[key] : (s && s.event ? s.event : {});
    return {key:key,xp:Number(data && data.xp || 0),claimed:Array.isArray(data && data.claimedRewards) ? data.claimedRewards : []};
  }

  function equippedItem(kind){
    return ownedItems().filter(function(item){ return item.kind === kind && equipped(item); })[0] || null;
  }

  function summaryMarkup(){
    var s = state() || {};
    var count = ownedItems().length;
    var total = allItems().length;
    return '<div class="vault-summary" aria-label="' + esc(t('Samlingsstatus','Collection status')) + '">' +
      '<span class="vault-summary-stat">' + icon('collection') + '<span><b>' + count + '</b> ' + t('af','of') + ' ' + total + ' items</span></span>' +
      '<span class="vault-summary-stat">' + icon('theme') + '<span><b>' + Number(s.fragments || 0) + '</b> fragments</span></span>' +
    '</div>';
  }

  function viewButton(id,da,en,kind){
    return '<button type="button" class="vault-view-btn' + (VIEW === id ? ' on' : '') + '" data-vault-view="' + id + '">' + icon(kind) + '<span>' + t(da,en) + '</span></button>';
  }

  function viewNavMarkup(){
    return '<nav class="vault-view-nav" aria-label="Inventory">' +
      viewButton('collection','Items','Items','collection') +
      viewButton('loadout','Look','Look','loadout') +
      viewButton('events','Events','Events','events') +
    '</nav>';
  }

  function categoryButton(id,da,en,kind){
    return '<button type="button" class="vault-filter' + (CATEGORY === id ? ' on' : '') + '" data-vault-category="' + id + '">' + icon(kind) + '<span>' + t(da,en) + '</span></button>';
  }

  function filtersMarkup(){
    return '<div class="vault-filters" aria-label="' + esc(t('Filtrer items','Filter items')) + '">' +
      categoryButton('all','Alle','All','all') +
      categoryButton('profile','Profil','Profile','profile') +
      categoryButton('themes','Temaer','Themes','color') +
      categoryButton('fonts','Fonts','Fonts','font') +
      categoryButton('badges','Badges','Badges','badge') +
    '</div>';
  }

  function collectionItems(){
    var list = ownedItems();
    if(CATEGORY === 'profile') return list.filter(function(item){ return ['title','color','frame'].indexOf(item.kind) !== -1; });
    if(CATEGORY === 'themes') return list.filter(function(item){ return item.kind === 'theme'; });
    if(CATEGORY === 'fonts') return list.filter(function(item){ return item.kind === 'font'; });
    if(CATEGORY === 'badges') return list.filter(function(item){ return item.kind === 'badge'; });
    return list;
  }

  function card(item,lockedAllowed,onChoose){
    var has = owned(item);
    var inUse = has && equipped(item);
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'vault-item' + (has ? ' owned' : ' locked') + (inUse ? ' equipped' : '') + (item.eventOnly ? ' event-item' : '');
    button.disabled = !has && !lockedAllowed;
    button.dataset.vaultItem = item.kind + ':' + item.id;
    button.setAttribute('aria-label',item.name + ', ' + (inUse ? t('i brug','equipped') : has ? t('ejet','owned') : t('låst','locked')));
    button.innerHTML =
      '<span class="vault-item-head"><span class="vault-kind-icon">' + icon(item.kind) + '</span>' +
        (item.eventOnly ? '<span class="vault-event-tag">EVENT</span>' : '') +
        (inUse ? '<span class="vault-equipped-dot">' + checkIcon() + '</span>' : '') +
      '</span>' +
      preview(item,false) +
      '<span class="vault-item-copy"><strong>' + esc(item.name) + '</strong><small>' + esc(label(item.kind)) + ' · ' + esc(source(item)) + '</small></span>' +
      '<span class="vault-item-status ' + (inUse ? 'on' : '') + '">' +
        (inUse ? checkIcon() + '<span>' + t('I brug','Equipped') + '</span>' : has ? '<span>' + t('Se item','View item') + '</span>' : '<span>' + t('Låst','Locked') + '</span>') +
      '</span>' +
      (!has ? '<span class="vault-lock-icon">' + icon('theme') + '</span>' : '');
    button.addEventListener('click',function(){ if(onChoose) onChoose(item); else openSheet(item); });
    return button;
  }

  function grid(items,lockedAllowed,onChoose){
    var host = document.createElement('div');
    host.className = 'vault-grid';
    items.forEach(function(item,index){
      var node = card(item,lockedAllowed,onChoose);
      node.style.setProperty('--vault-index',index);
      host.appendChild(node);
    });
    return host;
  }

  function sectionHead(titleText,count){
    return '<div class="vault-section-head"><h3>' + esc(titleText) + '</h3>' + (count != null ? '<span>' + count + '</span>' : '') + '</div>';
  }

  function emptyMarkup(da,en){
    return '<div class="vault-empty">' + icon('collection') + '<b>' + t(da,en) + '</b><span>' + t('Find flere i butikken eller gennem events.','Find more in the Shop or through Events.') + '</span></div>';
  }

  function collectionView(host){
    var items = collectionItems();
    var wrap = document.createElement('section');
    wrap.className = 'vault-view-panel';
    wrap.innerHTML = filtersMarkup() + summaryMarkup();
    if(items.length) wrap.appendChild(grid(items,false));
    else wrap.innerHTML += emptyMarkup('Ingen items i denne kategori','No items in this category');
    host.appendChild(wrap);
    bindFilters(wrap);
  }

  function profileMarkup(){
    var s = state() || {};
    var frame = equippedItem('frame');
    var color = equippedItem('color');
    var title = equippedItem('title');
    var badge = equippedItem('badge');
    var name = s.username || t('Din profil','Your profile');
    var symbol = badge && badge.raw ? badge.raw.symbol : '✦';
    return '<div class="vault-look-profile">' +
      '<span class="vault-look-avatar avatar ' + esc(frame ? frame.cls : '') + '">' + (s.profileImage ? '<img src="' + esc(s.profileImage) + '" alt="">' : '<b>S</b>') + '</span>' +
      '<span class="vault-look-copy"><strong class="' + esc(color ? color.cls : '') + '">' + esc(name) + '</strong><small><i>' + esc(symbol) + '</i>' + esc(title ? title.name : t('Eventyrer','Explorer')) + '</small></span>' +
    '</div>';
  }

  function slot(kind,name){
    var item = equippedItem(kind);
    return '<button type="button" class="vault-slot' + (item ? ' filled' : '') + '" data-vault-slot="' + kind + '">' +
      '<span class="vault-slot-icon">' + icon(kind) + '</span><span class="vault-slot-copy"><small>' + esc(name) + '</small><strong>' + esc(item ? item.name : t('Ikke valgt','Not selected')) + '</strong></span>' +
      '<span class="vault-chevron"><svg viewBox="0 0 24 24" fill="none"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
    '</button>';
  }

  function loadoutView(host){
    var wrap = document.createElement('section');
    wrap.className = 'vault-view-panel';
    wrap.innerHTML = '<div class="vault-look-hero">' + profileMarkup() + '<span>' + t('Dit aktive look','Your active look') + '</span></div>' +
      sectionHead(t('Tilpas dit look','Customize your look'),null) +
      '<div class="vault-slots">' +
        slot('frame',t('Profilring','Profile ring')) + slot('color',t('Navnefarve','Name colour')) +
        slot('title',t('Titel','Title')) + slot('badge','Badge') +
        slot('theme',t('Tema','Theme')) + slot('font',t('Skrifttype','Font')) +
      '</div>';
    host.appendChild(wrap);
    wrap.querySelectorAll('[data-vault-slot]').forEach(function(button){
      button.addEventListener('click',function(){
        var kind = button.dataset.vaultSlot;
        openPicker(kind,ownedItems().filter(function(item){ return item.kind === kind; }));
      });
    });
  }

  function eventSet(key){
    var active = activeEvent();
    var items = eventItems(key);
    var count = items.filter(owned).length;
    var symbol = key === 'plant' ? '❋' : key === 'solar' ? '☀' : '✦';
    return '<button type="button" class="vault-event-set ' + key + (key === active.key ? ' active' : '') + '" data-event-set="' + key + '">' +
      '<span class="vault-event-orb">' + symbol + '</span><span class="vault-event-copy"><strong>' + eventName(key) + '</strong><small>' + count + ' / ' + items.length + ' items</small></span>' +
      '<span class="vault-event-progress"><i style="width:' + (items.length ? Math.round(count/items.length*100) : 0) + '%"></i></span>' +
    '</button>';
  }

  function eventsView(host){
    var active = activeEvent();
    var wrap = document.createElement('section');
    wrap.className = 'vault-view-panel';
    wrap.innerHTML = '<div class="vault-event-hero"><span><small>' + t('AKTIVT EVENT','ACTIVE EVENT') + '</small><strong>' + eventName(active.key) + '</strong><em>' + active.xp + ' Event-XP · ' + active.claimed.length + ' rewards</em></span><button id="vaultOpenEvent" type="button">' + t('Åbn','Open') + '</button></div>' +
      '<div class="vault-event-sets">' + eventSet('midnight') + eventSet('plant') + eventSet('solar') + '</div><div id="vaultEventCollection"></div>';
    host.appendChild(wrap);
    wrap.querySelector('#vaultOpenEvent').addEventListener('click',openEvent);
    wrap.querySelectorAll('[data-event-set]').forEach(function(button){ button.addEventListener('click',function(){ renderEventCollection(button.dataset.eventSet); }); });
    renderEventCollection(active.key);
  }

  function renderEventCollection(key){
    var host = document.getElementById('vaultEventCollection');
    if(!host) return;
    var items = eventItems(key);
    var collected = items.filter(owned).length;
    host.innerHTML = sectionHead(eventName(key),collected + '/' + items.length);
    host.appendChild(grid(items,true));
  }

  function openEvent(){
    closeSheet();
    try{
      if(typeof switchTab === 'function') switchTab('tab-challenges');
      else{
        var nav = document.querySelector('.tabbtn[data-tab="tab-challenges"]');
        if(nav) nav.click();
      }
    }catch(error){}
    setTimeout(function(){ var button = document.querySelector('#challengeSubtabs [data-ch-pane="pane-ch-event"]'); if(button) button.click(); },120);
  }

  function applyItem(item){
    var s = state();
    if(!s || !owned(item)) return;
    s.shop = s.shop || {};
    s.settings = s.settings || {};
    if(item.kind === 'title') s.shop.equippedTitle = equipped(item) ? null : item.id;
    else if(item.kind === 'color') s.shop.equippedColor = equipped(item) ? null : item.id;
    else if(item.kind === 'frame') s.shop.equippedFrame = equipped(item) ? null : item.id;
    else if(item.kind === 'theme') s.settings.style = item.id;
    else if(item.kind === 'font') s.settings.font = equipped(item) ? 'baloo' : item.id;
    else if(item.kind === 'badge'){
      s.badges = s.badges || {unlocked:['starter'],equipped:'starter'};
      s.badges.equipped = item.id;
    }
    try{ if(typeof save === 'function') save(); }catch(error){}
    try{ if(typeof Settings !== 'undefined' && Settings.applyTheme) Settings.applyTheme(); }catch(error){}
    try{ if(typeof Settings !== 'undefined' && Settings.refresh) Settings.refresh(); }catch(error){}
    try{ if(typeof renderAll === 'function') renderAll(); }catch(error){}
    try{ if(typeof Shop !== 'undefined' && Shop.render) Shop.render(); }catch(error){}
    try{ if(typeof SFX !== 'undefined' && SFX.pop) SFX.pop(); }catch(error){}
    try{ if(typeof vibrate === 'function') vibrate(16); }catch(error){}
    render();
    openSheet(item);
    try{ if(typeof toast === 'function') toast(equipped(item) ? item.name + ' ' + t('er nu i brug','is now equipped') : item.name + ' ' + t('er fjernet','was removed')); }catch(error){}
  }

  function ensureSheet(){
    var sheet = document.getElementById('vaultItemSheet');
    if(sheet) return sheet;
    sheet = document.createElement('div');
    sheet.id = 'vaultItemSheet';
    sheet.className = 'vault-sheet';
    sheet.hidden = true;
    sheet.setAttribute('aria-hidden','true');
    sheet.innerHTML = '<button class="vault-sheet-backdrop" type="button" aria-label="Close"></button><section class="vault-sheet-panel" role="dialog" aria-modal="true"><div class="vault-sheet-handle"></div><button class="vault-sheet-close" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button><div id="vaultSheetContent"></div></section>';
    document.body.appendChild(sheet);
    sheet.querySelector('.vault-sheet-backdrop').addEventListener('click',closeSheet);
    sheet.querySelector('.vault-sheet-close').addEventListener('click',closeSheet);
    return sheet;
  }

  function showSheet(){
    var sheet = ensureSheet();
    sheet.hidden = false;
    sheet.setAttribute('aria-hidden','false');
    document.body.classList.add('vault-sheet-open');
    requestAnimationFrame(function(){ sheet.classList.add('open'); });
    return sheet;
  }

  function openSheet(item){
    var sheet = ensureSheet();
    var has = owned(item);
    var inUse = has && equipped(item);
    var content = sheet.querySelector('#vaultSheetContent');
    content.innerHTML = '<div class="vault-sheet-preview">' + preview(item,true) + '</div>' +
      '<div class="vault-sheet-meta"><span>' + esc(label(item.kind)) + (item.eventOnly ? ' · EVENT' : '') + '</span><h3>' + esc(item.name) + '</h3><p>' + esc(source(item)) + '</p></div>' +
      '<button class="vault-sheet-action' + (inUse ? ' equipped' : '') + '" type="button">' +
        (has ? (inUse ? checkIcon() + '<span>' + t('I brug · fjern','Equipped · unequip') + '</span>' : '<span>' + t('Brug dette item','Equip this item') + '</span>') : '<span>' + t('Gå til eventet','Go to Event') + '</span>') +
      '</button>';
    content.querySelector('.vault-sheet-action').addEventListener('click',function(){ if(has) applyItem(item); else openEvent(); });
    showSheet();
  }

  function closeSheet(){
    var sheet = document.getElementById('vaultItemSheet');
    if(!sheet || sheet.hidden) return;
    sheet.classList.remove('open');
    document.body.classList.remove('vault-sheet-open');
    setTimeout(function(){ sheet.hidden = true; sheet.setAttribute('aria-hidden','true'); },240);
  }

  function openPicker(kind,items){
    var sheet = ensureSheet();
    var content = sheet.querySelector('#vaultSheetContent');
    content.innerHTML = '<div class="vault-picker-head"><h3>' + esc(label(kind)) + '</h3><p>' + t('Vælg det item du vil bruge','Choose the item you want to equip') + '</p></div><div class="vault-picker-grid" id="vaultPickerGrid"></div>';
    var picker = content.querySelector('#vaultPickerGrid');
    if(!items.length) picker.innerHTML = emptyMarkup('Du ejer ingen endnu','You do not own any yet');
    else items.forEach(function(item){ picker.appendChild(card(item,false,function(choice){ applyItem(choice); setTimeout(function(){ openPicker(kind,ownedItems().filter(function(candidate){ return candidate.kind === kind; })); },30); })); });
    showSheet();
  }

  function bindFilters(root){
    root.querySelectorAll('[data-vault-category]').forEach(function(button){
      button.addEventListener('click',function(){ CATEGORY = button.dataset.vaultCategory; render(); });
    });
  }

  function render(){
    var pane = document.getElementById('pane-inventory');
    if(!pane) return;
    pane.innerHTML = '<div class="vault-shell">' + viewNavMarkup() + '<div id="vaultViewContent"></div></div>';
    pane.querySelectorAll('[data-vault-view]').forEach(function(button){ button.addEventListener('click',function(){ VIEW = button.dataset.vaultView; render(); }); });
    var content = pane.querySelector('#vaultViewContent');
    if(VIEW === 'loadout') loadoutView(content);
    else if(VIEW === 'events') eventsView(content);
    else collectionView(content);
  }

  function activatePane(id){
    var shop = document.getElementById('tab-shop');
    if(!shop) return;
    shop.querySelectorAll('.shop-subtab').forEach(function(button){ button.classList.toggle('on',button.dataset.shopPane === id); });
    shop.querySelectorAll('.shop-pane').forEach(function(pane){ pane.classList.toggle('on',pane.id === id); });
    if(id === 'pane-inventory') render();
  }

  function installTab(){
    var subtabs = document.getElementById('shopSubtabs');
    if(!subtabs) return false;
    subtabs.classList.add('vault-tabs-enabled');
    var button = document.getElementById('inventoryShopTab');
    if(!button){
      button = document.createElement('button');
      button.type = 'button';
      button.id = 'inventoryShopTab';
      button.className = 'shop-subtab inventory-shop-tab';
      button.dataset.shopPane = 'pane-inventory';
      button.innerHTML = icon('collection') + '<span>Inventory</span>';
      subtabs.insertBefore(button,subtabs.firstElementChild);
    }
    var pane = document.getElementById('pane-inventory');
    if(!pane){
      pane = document.createElement('div');
      pane.id = 'pane-inventory';
      pane.className = 'shop-pane shop-pane-scroll';
      subtabs.parentNode.insertBefore(pane,subtabs.nextSibling);
    }
    if(!subtabs.dataset.vaultBound){
      subtabs.dataset.vaultBound = '1';
      subtabs.addEventListener('click',function(event){ var target = event.target.closest('[data-shop-pane]'); if(target) setTimeout(function(){ activatePane(target.dataset.shopPane); },0); });
    }
    return true;
  }

  function styles(){
    var old = document.getElementById('inventoryStyles');
    if(old) old.remove();
    var style = document.createElement('style');
    style.id = 'inventoryStyles';
    style.textContent = `
      :root{--vault-violet:#6d45dc;--vault-violet-soft:#f1ecff;--vault-ink:#18242c;--vault-muted:#7a8791;--vault-line:#e4e7ea;--vault-green:#4d8254;--vault-green-soft:#f0f6ee;}
      body.vault-sheet-open{overflow:hidden!important}
      #shopSubtabs.vault-tabs-enabled{display:flex!important;gap:0!important;overflow-x:auto!important;scrollbar-width:none!important;border-bottom:1px solid var(--vault-line)!important}
      #shopSubtabs.vault-tabs-enabled::-webkit-scrollbar{display:none!important}
      #shopSubtabs.vault-tabs-enabled .shop-subtab{position:relative;flex:0 0 112px!important;width:112px!important;min-width:112px!important;border-radius:0!important;border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important}
      #shopSubtabs.vault-tabs-enabled .shop-subtab:focus-visible{outline:0!important;background:var(--vault-violet-soft)!important}
      #shopSubtabs.vault-tabs-enabled .shop-subtab::after{content:"";position:absolute;left:14px;right:14px;bottom:0;height:2px;border-radius:2px;background:transparent}
      #shopSubtabs.vault-tabs-enabled .shop-subtab.on{color:var(--vault-violet)!important}
      #shopSubtabs.vault-tabs-enabled .shop-subtab.on::after{background:var(--vault-violet)}
      #shopSubtabs .inventory-shop-tab svg{width:15px;height:15px}
      #pane-inventory{padding:18px 18px 42px!important;color:var(--vault-ink)!important;background:#fff!important}
      .vault-shell{width:min(980px,100%);margin:0 auto}
      .vault-view-nav{display:grid;grid-template-columns:repeat(3,1fr);margin-bottom:14px;border:1px solid var(--vault-line);border-radius:22px;background:#fff;overflow:hidden;box-shadow:0 9px 24px -25px rgba(24,36,44,.48)}
      .vault-view-btn{position:relative;display:flex;align-items:center;justify-content:center;gap:8px;min-height:58px;padding:0 14px;border:0;color:var(--vault-muted);background:transparent;font:800 11px/1 var(--font-ui);cursor:pointer;transition:color .18s ease,background .18s ease}
      .vault-view-btn::after{content:"";position:absolute;left:18px;right:18px;bottom:0;height:2px;border-radius:2px;background:transparent;transform:scaleX(.45);transition:transform .2s ease,background .2s ease}
      .vault-view-btn svg{width:19px;height:19px}
      .vault-view-btn.on{color:var(--vault-violet);background:linear-gradient(180deg,#fff,rgba(109,69,220,.025))}
      .vault-view-btn.on::after{background:var(--vault-violet);transform:scaleX(1)}
      .vault-view-panel{animation:vaultPanelIn .28s cubic-bezier(.2,.75,.25,1) both}
      .vault-filters{display:grid;grid-template-columns:repeat(5,1fr);gap:2px;margin-bottom:17px;padding:5px;border:1px solid var(--vault-line);border-radius:20px;background:#fff}
      .vault-filter{display:flex;align-items:center;justify-content:center;gap:6px;min-width:0;min-height:48px;padding:0 7px;border:0;border-radius:15px;color:var(--vault-muted);background:transparent;font:750 9px/1 var(--font-ui);cursor:pointer;transition:background .17s ease,color .17s ease,transform .17s ease}
      .vault-filter:active{transform:scale(.97)}
      .vault-filter svg{width:17px;height:17px;flex:0 0 auto}
      .vault-filter.on{color:var(--vault-violet);background:var(--vault-violet-soft)}
      .vault-summary{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:0 5px 17px;color:var(--vault-muted);font-size:10px;font-weight:700}
      .vault-summary-stat{display:flex;align-items:center;gap:7px;white-space:nowrap}
      .vault-summary-stat svg{width:17px;height:17px}
      .vault-summary-stat b{color:var(--vault-ink);font-weight:900}
      .vault-section-head{display:flex;align-items:center;justify-content:space-between;margin:0 2px 10px}
      .vault-section-head h3{margin:0;color:var(--vault-ink);font-family:var(--font-display);font-size:18px;font-weight:900;letter-spacing:-.02em}
      .vault-section-head>span{display:grid;place-items:center;min-width:27px;height:27px;padding:0 8px;border:1px solid var(--vault-line);border-radius:99px;color:var(--vault-muted);font-size:8px;font-weight:900}
      .vault-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(178px,1fr));gap:12px}
      .vault-item{position:relative;display:grid;grid-template-rows:auto minmax(142px,1fr) auto auto;min-width:0;padding:12px;border:1px solid var(--vault-line);border-radius:23px;color:var(--vault-ink);background:#fff;text-align:left;cursor:pointer;overflow:hidden;box-shadow:0 20px 42px -38px rgba(24,36,44,.48);animation:vaultItemIn .38s cubic-bezier(.2,.75,.25,1) both;animation-delay:calc(var(--vault-index)*42ms);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
      .vault-item:hover{transform:translateY(-2px);border-color:#d5c9f8;box-shadow:0 24px 44px -34px rgba(67,45,123,.36)}
      .vault-item:active{transform:scale(.985)}
      .vault-item.equipped{border-color:#cadcca}
      .vault-item.locked{filter:saturate(.65)}
      .vault-item:disabled{cursor:not-allowed;opacity:.58}
      .vault-item-head{display:flex;align-items:center;min-height:29px;margin-bottom:9px}
      .vault-kind-icon{display:grid;place-items:center;width:29px;height:29px;border-radius:10px;color:var(--vault-violet);background:var(--vault-violet-soft)}
      .vault-kind-icon svg{width:15px;height:15px}
      .vault-event-tag{margin-left:auto;color:var(--vault-violet);font-size:6px;font-weight:950;letter-spacing:.1em}
      .vault-equipped-dot{display:grid;place-items:center;margin-left:auto;width:29px;height:29px;border-radius:50%;color:#fff;background:var(--vault-green);box-shadow:0 7px 16px -10px rgba(47,101,55,.9);animation:vaultCheckIn .38s cubic-bezier(.2,1.45,.45,1) both}
      .vault-equipped-dot svg{width:16px;height:16px}
      .vault-preview{position:relative;display:grid;place-items:center;min-height:142px;border:1px solid #e6e8ea;border-radius:20px;background:linear-gradient(145deg,#fbfbfb,#f1f2f2);box-shadow:inset 0 1px 0 #fff,0 15px 30px -27px rgba(18,28,34,.46);overflow:hidden}
      .vault-preview.large{height:236px;border-radius:25px}
      .vault-preview.title{padding:14px;color:#fff;text-align:center}
      .vault-preview.title b{font-size:15px;font-weight:950}.vault-preview.large.title b{font-size:28px}
      .vault-preview.color b{font-size:18px;font-weight:950}.vault-preview.large.color b{font-size:32px}
      .vault-preview.frame{background:radial-gradient(circle,#fff,#f2f3f3)}
      .vault-mini-avatar{display:grid!important;place-items:center!important;width:78px!important;height:78px!important;border-radius:50%!important;color:var(--vault-violet)!important;background:#fff!important;font-size:20px!important;font-weight:950!important}
      .vault-preview.large .vault-mini-avatar{width:126px!important;height:126px!important;font-size:31px!important}
      .vault-preview.font{align-content:center;gap:5px}.vault-preview.font b{font-size:54px;line-height:1}.vault-preview.font small{color:var(--vault-muted);font-size:7px;font-weight:800}.vault-preview.large.font b{font-size:82px}
      .vault-preview.theme{align-content:end;justify-items:start;padding:14px;color:#fff}.vault-preview.theme::after{content:"";position:absolute;inset:42% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.45))}.vault-preview.theme span{position:relative;z-index:1;font-size:10px;font-weight:950}.vault-preview.large.theme span{font-size:18px}
      .vault-preview.badge{align-content:center;gap:7px;color:var(--vault-violet);background:radial-gradient(circle at 50% 40%,rgba(109,69,220,.12),transparent 45%),linear-gradient(145deg,#fbfbfb,#f1f2f2)}
      .vault-preview.badge b{font-size:39px;line-height:1}.vault-preview.badge span{font-size:7px;font-weight:950;letter-spacing:.1em}.vault-preview.large.badge b{font-size:67px}
      .vault-item-copy{display:block;min-width:0;padding:13px 3px 10px}.vault-item-copy strong{display:block;overflow:hidden;font-size:15px;font-weight:950;text-overflow:ellipsis;white-space:nowrap}.vault-item-copy small{display:block;margin-top:4px;overflow:hidden;color:var(--vault-muted);font-size:8px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}
      .vault-item-status{display:flex;align-items:center;justify-content:center;gap:6px;min-height:35px;border-radius:13px;color:var(--vault-muted);background:#f5f6f6;font-size:9px;font-weight:850}.vault-item-status svg{width:14px;height:14px}.vault-item-status.on{color:var(--vault-green);background:var(--vault-green-soft)}
      .vault-lock-icon{position:absolute;right:12px;top:12px;display:grid;place-items:center;width:29px;height:29px;border-radius:50%;color:#fff;background:#7f8990}.vault-lock-icon svg{width:14px;height:14px}
      .vault-look-hero{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:18px;padding:17px;border:1px solid var(--vault-line);border-radius:23px;background:#fff}.vault-look-hero>span{color:var(--vault-muted);font-size:8px;font-weight:850;text-transform:uppercase;letter-spacing:.08em}
      .vault-look-profile{display:flex;align-items:center;gap:12px;min-width:0}.vault-look-avatar{display:grid;place-items:center;width:62px;height:62px;flex:0 0 62px;border-radius:50%;background:var(--vault-violet-soft);color:var(--vault-violet);overflow:hidden}.vault-look-avatar img{width:100%;height:100%;object-fit:cover}.vault-look-copy{min-width:0}.vault-look-copy strong{display:block;overflow:hidden;font-size:17px;font-weight:950;text-overflow:ellipsis;white-space:nowrap}.vault-look-copy small{display:flex;align-items:center;gap:5px;margin-top:5px;color:var(--vault-muted);font-size:9px;font-weight:750}.vault-look-copy i{display:grid;place-items:center;width:18px;height:18px;border-radius:6px;color:var(--vault-violet);background:var(--vault-violet-soft);font-style:normal}
      .vault-slots{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.vault-slot{display:grid;grid-template-columns:40px minmax(0,1fr) 18px;align-items:center;gap:10px;min-height:76px;padding:11px;border:1px solid var(--vault-line);border-radius:18px;color:var(--vault-ink);background:#fff;text-align:left;cursor:pointer;transition:transform .17s ease,border-color .17s ease}.vault-slot:active{transform:scale(.985)}.vault-slot.filled{border-color:#ddd4f5}.vault-slot-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:13px;color:var(--vault-violet);background:var(--vault-violet-soft)}.vault-slot-icon svg{width:19px;height:19px}.vault-slot-copy{min-width:0}.vault-slot-copy small{display:block;color:var(--vault-muted);font-size:7px;font-weight:800}.vault-slot-copy strong{display:block;overflow:hidden;margin-top:4px;font-size:11px;font-weight:950;text-overflow:ellipsis;white-space:nowrap}.vault-chevron svg{width:17px;height:17px;color:var(--vault-muted)}
      .vault-event-hero{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:12px;padding:18px;border-radius:23px;color:#fff;background:linear-gradient(135deg,#2f2069,#6845c4 65%,#366f88);box-shadow:0 22px 40px -32px rgba(55,34,112,.8)}.vault-event-hero span{display:block}.vault-event-hero small{display:block;color:#dcd4ff;font-size:7px;font-weight:950;letter-spacing:.1em}.vault-event-hero strong{display:block;margin-top:5px;font-size:18px;font-weight:950}.vault-event-hero em{display:block;margin-top:5px;color:rgba(255,255,255,.68);font-size:8px;font-style:normal;font-weight:700}.vault-event-hero button{min-height:38px;padding:0 14px;border:0;border-radius:13px;color:#5c3bb5;background:#fff;font:900 9px/1 var(--font-ui);cursor:pointer}
      .vault-event-sets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:18px}.vault-event-set{position:relative;display:grid;grid-template-columns:34px minmax(0,1fr);align-items:center;gap:8px;min-height:72px;padding:10px;border:1px solid var(--vault-line);border-radius:17px;color:var(--vault-ink);background:#fff;text-align:left;cursor:pointer;overflow:hidden}.vault-event-set.active{border-color:#d3c6f5}.vault-event-orb{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;color:#fff;background:linear-gradient(145deg,#6d45dc,#53abc2)}.vault-event-set.plant .vault-event-orb{background:linear-gradient(145deg,#4a9e58,#a2ce58)}.vault-event-set.solar .vault-event-orb{background:linear-gradient(145deg,#ef7f32,#e9bf48)}.vault-event-copy{min-width:0}.vault-event-copy strong{display:block;overflow:hidden;font-size:9px;font-weight:950;text-overflow:ellipsis;white-space:nowrap}.vault-event-copy small{display:block;margin-top:4px;color:var(--vault-muted);font-size:6.5px;font-weight:750}.vault-event-progress{position:absolute;left:10px;right:10px;bottom:7px;height:3px;border-radius:9px;background:#eef0f1;overflow:hidden}.vault-event-progress i{display:block;height:100%;background:var(--vault-violet)}
      .vault-empty{display:grid;place-items:center;gap:7px;min-height:180px;padding:28px;border:1px dashed #d7dbde;border-radius:22px;color:var(--vault-muted);text-align:center}.vault-empty>svg{width:25px;height:25px;color:var(--vault-violet)}.vault-empty b{color:var(--vault-ink);font-size:13px}.vault-empty span{max-width:280px;font-size:9px;line-height:1.45}
      .vault-sheet{position:fixed;z-index:99999;inset:0;display:grid;align-items:end;pointer-events:none}.vault-sheet[hidden]{display:none!important}.vault-sheet-backdrop{position:absolute;inset:0;border:0;background:rgba(17,22,26,.48);opacity:0;backdrop-filter:blur(4px);transition:opacity .24s ease}.vault-sheet-panel{position:relative;width:min(560px,100%);max-height:88dvh;margin:0 auto;padding:11px 17px calc(20px + env(safe-area-inset-bottom));border:1px solid var(--vault-line);border-radius:29px 29px 0 0;background:#fff;box-shadow:0 -30px 70px rgba(0,0,0,.2);overflow-y:auto;transform:translateY(105%);transition:transform .3s cubic-bezier(.2,.75,.25,1)}.vault-sheet.open{pointer-events:auto}.vault-sheet.open .vault-sheet-backdrop{opacity:1}.vault-sheet.open .vault-sheet-panel{transform:none}.vault-sheet-handle{width:42px;height:4px;margin:0 auto 13px;border-radius:9px;background:#d9dde0}.vault-sheet-close{position:absolute;z-index:2;right:17px;top:17px;display:grid;place-items:center;width:36px;height:36px;border:1px solid var(--vault-line);border-radius:50%;color:var(--vault-muted);background:#fff;cursor:pointer}.vault-sheet-close svg{width:18px;height:18px;fill:none}.vault-sheet-close path{stroke:currentColor;stroke-width:1.7;stroke-linecap:round}.vault-sheet-preview{padding:8px;border-radius:28px;background:#f6f7f7}.vault-sheet-meta{padding:16px 3px 14px;text-align:center}.vault-sheet-meta>span{color:var(--vault-violet);font-size:7px;font-weight:950;letter-spacing:.09em;text-transform:uppercase}.vault-sheet-meta h3{margin:6px 0 0;font-family:var(--font-display);font-size:24px;font-weight:950;letter-spacing:-.03em}.vault-sheet-meta p{margin:5px 0 0;color:var(--vault-muted);font-size:9px;font-weight:700}.vault-sheet-action{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;min-height:51px;border:0;border-radius:16px;color:#fff;background:var(--vault-violet);font:900 11px/1 var(--font-ui);cursor:pointer}.vault-sheet-action svg{width:16px;height:16px}.vault-sheet-action.equipped{color:var(--vault-green);background:var(--vault-green-soft)}.vault-picker-head{padding:3px 3px 14px;text-align:center}.vault-picker-head h3{margin:0;font-size:21px;font-weight:950}.vault-picker-head p{margin:5px 0 0;color:var(--vault-muted);font-size:9px}.vault-picker-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
      @keyframes vaultPanelIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
      @keyframes vaultItemIn{from{opacity:0;transform:translateY(9px) scale(.985)}to{opacity:1;transform:none}}
      @keyframes vaultCheckIn{from{opacity:0;transform:scale(.55) rotate(-12deg)}to{opacity:1;transform:none}}
      @media(max-width:620px){#pane-inventory{padding:13px 18px 34px!important}.vault-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.vault-item{grid-template-rows:auto 132px auto auto;padding:10px;border-radius:20px}.vault-preview{min-height:132px;border-radius:17px}.vault-view-btn{min-height:53px}.vault-filter{min-height:44px}.vault-slots{grid-template-columns:1fr}.vault-event-sets{grid-template-columns:1fr}.vault-event-set{min-height:65px}.vault-sheet-preview .vault-preview.large{height:210px}}
      @media(max-width:390px){#pane-inventory{padding-left:14px!important;padding-right:14px!important}.vault-filter{gap:4px;padding:0 4px;font-size:8px}.vault-filter svg{width:15px;height:15px}.vault-item{grid-template-rows:auto 116px auto auto}.vault-preview{min-height:116px}.vault-item-copy strong{font-size:13px}.vault-summary{font-size:9px}.vault-look-hero>span{display:none}}
      @media(prefers-reduced-motion:reduce){.vault-view-panel,.vault-item,.vault-equipped-dot{animation:none!important}.vault-item,.vault-filter,.vault-slot,.vault-sheet-panel,.vault-sheet-backdrop{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function install(){
    styles();
    if(!installTab()) return;
    if(!installed){
      installed = true;
      if(typeof window.renderAll === 'function' && !window.renderAll.__vaultWrapped){
        var original = window.renderAll;
        var wrapped = function(){
          var result = original.apply(this,arguments);
          setTimeout(function(){ var pane = document.getElementById('pane-inventory'); if(pane && pane.classList.contains('on')) render(); },0);
          return result;
        };
        wrapped.__vaultWrapped = true;
        window.renderAll = wrapped;
      }
      document.addEventListener('keydown',function(event){ if(event.key === 'Escape') closeSheet(); });
    }
    render();
  }

  window.renderInventory = render;
  window.openInventory = function(){ try{ if(typeof switchTab === 'function') switchTab('tab-shop'); }catch(error){} setTimeout(function(){ activatePane('pane-inventory'); },80); };
  window.addEventListener('streg:startup-complete',install);
  window.addEventListener('streg:languagechange',render);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) install(); });
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true}); else install();
  setTimeout(install,650);
})();
