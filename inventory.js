(function(){
  'use strict';

  var VIEW = 'collection';
  var CATEGORY = 'all';
  var installed = false;
  var selectedItem = null;

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

  function ownedItems(){
    return allItems().filter(owned);
  }

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
      title:'<path d="M5 6.5h14v11H5z" stroke="currentColor" stroke-width="1.5"/><path d="M8 10h8M8 13.5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
      color:'<path d="M12 3.8a8.2 8.2 0 1 0 0 16.4c1.1 0 1.8-.6 1.8-1.5 0-.5-.2-.9-.2-1.3 0-.8.7-1.3 1.5-1.3h1.8c2 0 3.5-1.5 3.5-3.6 0-4.8-3.8-8.7-8.4-8.7Z" stroke="currentColor" stroke-width="1.5"/><circle cx="8.2" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="7.4" r="1" fill="currentColor"/><circle cx="15.7" cy="9" r="1" fill="currentColor"/>',
      frame:'<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.2" opacity=".55"/>',
      theme:'<path d="m12 3 7 5.5-2.7 9L12 21l-4.3-3.5-2.7-9L12 3Z" stroke="currentColor" stroke-width="1.5"/><path d="m8 9 4-2 4 2-1.5 5L12 17l-2.5-3L8 9Z" stroke="currentColor" stroke-width="1.2"/>',
      font:'<path d="M6 18 10.5 6h3L18 18M8 13.5h8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
      badge:'<path d="m12 3 2.4 4.8 5.3.8-3.8 3.7.9 5.2-4.8-2.5-4.8 2.5.9-5.2-3.8-3.7 5.3-.8L12 3Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' + (paths[kind] || paths.badge) + '</svg>';
  }

  function preview(item,large){
    var cls = 'vault-preview' + (large ? ' large' : '');
    if(item.kind === 'title') return '<div class="' + cls + ' title sw-' + item.sw + '"><b>' + esc(item.name) + '</b></div>';
    if(item.kind === 'color') return '<div class="' + cls + ' color"><b class="' + item.cls + '">' + esc(item.name) + '</b></div>';
    if(item.kind === 'frame') return '<div class="' + cls + ' frame"><span class="vault-mini-avatar avatar ' + item.cls + '">S</span></div>';
    if(item.kind === 'font') return '<div class="' + cls + ' font ' + item.cls + '"><b>Aa</b><small>' + esc(item.name) + '</small></div>';
    if(item.kind === 'theme') return '<div class="' + cls + ' theme sw-' + item.sw + '"><span>' + esc(item.name) + '</span></div>';
    var symbol = item.raw && item.raw.symbol ? item.raw.symbol : '✦';
    var badgeLabel = item.raw && item.raw.label ? item.raw.label : 'BADGE';
    return '<div class="' + cls + ' badge"><b>' + esc(symbol) + '</b><span>' + esc(badgeLabel) + '</span></div>';
  }

  function activeEvent(){
    var s = state();
    var key = s && s.settings && s.settings.activeEvent ? s.settings.activeEvent : 'midnight';
    var data = s && s.events && s.events[key] ? s.events[key] : (s && s.event ? s.event : {});
    return {
      key:key,
      xp:Number(data && data.xp || 0),
      claimed:Array.isArray(data && data.claimedRewards) ? data.claimedRewards : []
    };
  }

  function equippedItem(kind){
    var list = ownedItems().filter(function(item){ return item.kind === kind && equipped(item); });
    return list[0] || null;
  }

  function profileMarkup(){
    var s = state() || {};
    var frame = equippedItem('frame');
    var color = equippedItem('color');
    var title = equippedItem('title');
    var badge = equippedItem('badge');
    var name = s.username || t('Din profil','Your profile');
    var avatarClass = frame ? frame.cls : '';
    var nameClass = color ? color.cls : '';
    var titleText = title ? title.name : t('Eventyrer','Explorer');
    var badgeSymbol = badge && badge.raw ? badge.raw.symbol : '✦';
    return '<div class="vault-profile-stage">' +
      '<div class="vault-avatar avatar ' + avatarClass + '">' +
        (s.profileImage ? '<img src="' + esc(s.profileImage) + '" alt="">' : '<span>S</span>') +
      '</div>' +
      '<div class="vault-profile-copy">' +
        '<span class="vault-profile-kicker">' + t('AKTIVT LOADOUT','ACTIVE LOADOUT') + '</span>' +
        '<strong class="' + nameClass + '">' + esc(name) + '</strong>' +
        '<small><i>' + esc(badgeSymbol) + '</i> ' + esc(titleText) + '</small>' +
      '</div>' +
    '</div>';
  }

  function heroMarkup(){
    var ownedList = ownedItems();
    var total = allItems().length;
    var percent = total ? Math.round(ownedList.length / total * 100) : 0;
    var s = state() || {};
    return '<section class="vault-hero">' +
      '<div class="vault-hero-main">' + profileMarkup() + '</div>' +
      '<div class="vault-collection-score" style="--vault-progress:' + percent + '%">' +
        '<div class="vault-progress-ring"><span><strong>' + percent + '%</strong><small>' + t('samlet','collected') + '</small></span></div>' +
        '<div class="vault-balance-row">' +
          '<span><b>' + ownedList.length + '</b> / ' + total + ' items</span>' +
          '<span><b>' + Number(s.fragments || 0) + '</b> fragments</span>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function viewButton(id,da,en){
    return '<button type="button" class="vault-view-btn' + (VIEW === id ? ' on' : '') + '" data-vault-view="' + id + '">' + t(da,en) + '</button>';
  }

  function viewNavMarkup(){
    return '<nav class="vault-view-nav" aria-label="Inventory">' +
      viewButton('collection','Samling','Collection') +
      viewButton('loadout','Loadout','Loadout') +
      viewButton('events','Event Vault','Event Vault') +
    '</nav>';
  }

  function categoryButton(id,da,en,kind){
    return '<button type="button" class="vault-filter' + (CATEGORY === id ? ' on' : '') + '" data-vault-category="' + id + '">' +
      (kind ? icon(kind) : '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/></svg>') +
      '<span>' + t(da,en) + '</span>' +
    '</button>';
  }

  function filtersMarkup(){
    return '<div class="vault-filters">' +
      categoryButton('all','Alle','All','') +
      categoryButton('profile','Profil','Profile','frame') +
      categoryButton('themes','Temaer','Themes','theme') +
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

  function card(item,lockedAllowed){
    var has = owned(item);
    var inUse = has && equipped(item);
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'vault-item' + (has ? ' owned' : ' locked') + (inUse ? ' equipped' : '') + (item.eventOnly ? ' event-item' : '');
    button.dataset.vaultItem = item.kind + ':' + item.id;
    button.disabled = !has && !lockedAllowed;
    button.setAttribute('aria-label',item.name + ', ' + (inUse ? t('i brug','equipped') : has ? t('ejet','owned') : t('låst','locked')));
    button.innerHTML =
      '<span class="vault-item-top">' +
        '<span class="vault-kind-icon">' + icon(item.kind) + '</span>' +
        (item.eventOnly ? '<span class="vault-event-tag">EVENT</span>' : '') +
        (inUse ? '<span class="vault-equipped-dot">✓</span>' : '') +
      '</span>' +
      preview(item,false) +
      '<span class="vault-item-copy"><strong>' + esc(item.name) + '</strong><small>' + esc(label(item.kind)) + ' · ' + esc(source(item)) + '</small></span>' +
      (!has ? '<span class="vault-lock-overlay"><svg viewBox="0 0 24 24" fill="none"><rect x="6" y="10" width="12" height="9" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" stroke-width="1.6"/></svg></span>' : '');
    button.addEventListener('click',function(){ openSheet(item); });
    return button;
  }

  function gridMarkup(items,lockedAllowed){
    var host = document.createElement('div');
    host.className = 'vault-grid';
    items.forEach(function(item,index){
      var node = card(item,lockedAllowed);
      node.style.setProperty('--vault-index',index);
      host.appendChild(node);
    });
    return host;
  }

  function sectionHead(titleText,subText,count){
    return '<div class="vault-section-head"><div><span>' + esc(subText) + '</span><h3>' + esc(titleText) + '</h3></div>' +
      (count != null ? '<strong>' + count + '</strong>' : '') + '</div>';
  }

  function collectionView(pane){
    var items = collectionItems();
    var wrap = document.createElement('section');
    wrap.className = 'vault-view-panel';
    wrap.innerHTML = filtersMarkup() + sectionHead(t('Dine items','Your items'),t('TRYK FOR AT SE OG BRUGE','TAP TO VIEW AND EQUIP'),items.length);
    if(items.length) wrap.appendChild(gridMarkup(items,false));
    else wrap.innerHTML += '<div class="vault-empty"><b>' + t('Ingen items i denne kategori endnu','No items in this category yet') + '</b><span>' + t('Køb dem i butikken eller lås dem op gennem events.','Buy them in the Shop or unlock them through Events.') + '</span></div>';
    pane.appendChild(wrap);
  }

  function slot(kind,name,description){
    var item = equippedItem(kind);
    return '<button type="button" class="vault-slot' + (item ? ' filled' : '') + '" data-vault-slot="' + kind + '">' +
      '<span class="vault-slot-icon">' + icon(kind) + '</span>' +
      '<span class="vault-slot-copy"><small>' + esc(name) + '</small><strong>' + esc(item ? item.name : t('Ikke valgt','None equipped')) + '</strong><span>' + esc(description) + '</span></span>' +
      '<span class="vault-slot-arrow">›</span>' +
    '</button>';
  }

  function loadoutView(pane){
    var wrap = document.createElement('section');
    wrap.className = 'vault-view-panel';
    wrap.innerHTML = sectionHead(t('Dit aktive look','Your active look'),t('LOADOUT','LOADOUT'),null) +
      '<div class="vault-loadout-preview">' + profileMarkup() + '<span>' + t('Alt ændres med det samme på din profil.','Every change updates your profile instantly.') + '</span></div>' +
      '<div class="vault-slots">' +
        slot('frame',t('Profilring','Profile ring'),t('Rundt om dit billede','Around your picture')) +
        slot('color',t('Navnefarve','Name colour'),t('Farven på dit navn','Colour of your name')) +
        slot('title',t('Titel','Title'),t('Vises under dit navn','Shown below your name')) +
        slot('badge','Badge',t('Vises ved dit navn','Shown beside your name')) +
        slot('theme',t('Tema','Theme'),t('Hele appens udseende','The whole app look')) +
        slot('font',t('Skrifttype','Font'),t('Appens tekststil','The app text style')) +
      '</div>';
    pane.appendChild(wrap);
    wrap.querySelectorAll('[data-vault-slot]').forEach(function(button){
      button.addEventListener('click',function(){
        var kind = button.dataset.vaultSlot;
        var candidates = ownedItems().filter(function(item){ return item.kind === kind; });
        openPicker(kind,candidates);
      });
    });
  }

  function eventHero(key){
    var active = activeEvent();
    var items = eventItems(key);
    var count = items.filter(owned).length;
    var activeClass = key === active.key ? ' active' : '';
    return '<button type="button" class="vault-event-set ' + key + activeClass + '" data-event-set="' + key + '">' +
      '<span class="vault-event-set-orb">' + (key === 'plant' ? '❋' : key === 'solar' ? '☀' : '✦') + '</span>' +
      '<span class="vault-event-set-copy"><small>' + (key === active.key ? t('AKTIVT EVENT','ACTIVE EVENT') : t('EVENT-SAMLING','EVENT COLLECTION')) + '</small><strong>' + eventName(key) + '</strong><span>' + count + ' / ' + items.length + ' ' + t('items samlet','items collected') + '</span></span>' +
      '<span class="vault-event-set-progress"><i style="width:' + (items.length ? Math.round(count/items.length*100) : 0) + '%"></i></span>' +
    '</button>';
  }

  function eventsView(pane){
    var active = activeEvent();
    var wrap = document.createElement('section');
    wrap.className = 'vault-view-panel';
    wrap.innerHTML = sectionHead(t('Event Vault','Event Vault'),t('BEGRÆNSEDE SAMLINGER','LIMITED COLLECTIONS'),null) +
      '<div class="vault-active-event-card">' +
        '<div><span>' + t('DIN EVENT-STATUS','YOUR EVENT STATUS') + '</span><strong>' + eventName(active.key) + '</strong><small>' + active.xp + ' Event-XP · ' + active.claimed.length + ' ' + t('rewards hentet','rewards claimed') + '</small></div>' +
        '<button type="button" id="vaultOpenEvent">' + t('Åbn event','Open event') + ' <b>→</b></button>' +
      '</div>' +
      '<div class="vault-event-sets">' + eventHero('midnight') + eventHero('plant') + eventHero('solar') + '</div>' +
      '<div id="vaultEventCollection"></div>';
    pane.appendChild(wrap);
    var open = wrap.querySelector('#vaultOpenEvent');
    if(open) open.addEventListener('click',openEvent);
    wrap.querySelectorAll('[data-event-set]').forEach(function(button){
      button.addEventListener('click',function(){ renderEventCollection(button.dataset.eventSet); });
    });
    renderEventCollection(active.key);
  }

  function renderEventCollection(key){
    var host = document.getElementById('vaultEventCollection');
    if(!host) return;
    var items = eventItems(key);
    var collected = items.filter(owned).length;
    host.innerHTML = sectionHead(eventName(key),t('KOMPLET EVENT-SÆTTET','COMPLETE THE EVENT SET'),collected + '/' + items.length);
    host.appendChild(gridMarkup(items,true));
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
    setTimeout(function(){
      var button = document.querySelector('#challengeSubtabs [data-ch-pane="pane-ch-event"]');
      if(button) button.click();
    },120);
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
    sheet.innerHTML = '<button class="vault-sheet-backdrop" type="button" aria-label="Close"></button><section class="vault-sheet-panel" role="dialog" aria-modal="true"><div class="vault-sheet-handle"></div><button class="vault-sheet-close" type="button" aria-label="Close">×</button><div id="vaultSheetContent"></div></section>';
    document.body.appendChild(sheet);
    sheet.querySelector('.vault-sheet-backdrop').addEventListener('click',closeSheet);
    sheet.querySelector('.vault-sheet-close').addEventListener('click',closeSheet);
    return sheet;
  }

  function openSheet(item){
    selectedItem = item;
    var sheet = ensureSheet();
    var has = owned(item);
    var inUse = has && equipped(item);
    var content = sheet.querySelector('#vaultSheetContent');
    content.innerHTML =
      '<div class="vault-sheet-preview' + (item.eventOnly ? ' event' : '') + '">' + preview(item,true) + '</div>' +
      '<div class="vault-sheet-meta">' +
        '<span class="vault-sheet-kind">' + esc(label(item.kind)) + (item.eventOnly ? ' · EVENT' : '') + '</span>' +
        '<h3>' + esc(item.name) + '</h3>' +
        '<p>' + (has
          ? t('Dette item er en del af din samling. Du kan bruge det med det samme.','This item is part of your collection. You can equip it immediately.')
          : t('Dette limited item låses op gennem ' + eventName(item.eventKey) + '.','This limited item is unlocked through ' + eventName(item.eventKey) + '.')) + '</p>' +
        '<div class="vault-sheet-facts"><span><small>' + t('KILDE','SOURCE') + '</small><b>' + esc(source(item)) + '</b></span><span><small>' + t('STATUS','STATUS') + '</small><b>' + (inUse ? t('I brug','Equipped') : has ? t('Ejet','Owned') : t('Låst','Locked')) + '</b></span></div>' +
      '</div>' +
      '<button class="vault-sheet-action' + (inUse ? ' equipped' : '') + '" type="button">' +
        (has ? (inUse ? t('Fjern fra loadout','Unequip') : t('Brug dette item','Equip this item')) : t('Gå til eventet','Go to Event')) +
      '</button>';
    content.querySelector('.vault-sheet-action').addEventListener('click',function(){
      if(has) applyItem(item); else openEvent();
    });
    sheet.hidden = false;
    sheet.setAttribute('aria-hidden','false');
    document.body.classList.add('vault-sheet-open');
    requestAnimationFrame(function(){ sheet.classList.add('open'); });
  }

  function closeSheet(){
    var sheet = document.getElementById('vaultItemSheet');
    if(!sheet || sheet.hidden) return;
    sheet.classList.remove('open');
    document.body.classList.remove('vault-sheet-open');
    setTimeout(function(){ sheet.hidden = true; sheet.setAttribute('aria-hidden','true'); },220);
  }

  function openPicker(kind,items){
    var sheet = ensureSheet();
    var content = sheet.querySelector('#vaultSheetContent');
    content.innerHTML = '<div class="vault-picker-head"><span>' + t('VÆLG ITEM','CHOOSE ITEM') + '</span><h3>' + esc(label(kind)) + '</h3></div><div class="vault-picker-grid" id="vaultPickerGrid"></div>';
    var grid = content.querySelector('#vaultPickerGrid');
    if(!items.length){
      grid.innerHTML = '<div class="vault-empty"><b>' + t('Du ejer ingen endnu','You do not own any yet') + '</b><span>' + t('Find dem i butikken eller gennem events.','Find them in the Shop or through Events.') + '</span></div>';
    }else{
      items.forEach(function(item){
        var node = card(item,false);
        node.addEventListener('click',function(event){
          event.stopImmediatePropagation();
          applyItem(item);
          setTimeout(function(){ openPicker(kind,ownedItems().filter(function(candidate){ return candidate.kind === kind; })); },20);
        },true);
        grid.appendChild(node);
      });
    }
    sheet.hidden = false;
    sheet.setAttribute('aria-hidden','false');
    document.body.classList.add('vault-sheet-open');
    requestAnimationFrame(function(){ sheet.classList.add('open'); });
  }

  function render(){
    var pane = document.getElementById('pane-inventory');
    if(!pane) return;
    pane.innerHTML = heroMarkup() + viewNavMarkup() + '<div id="vaultViewContent"></div>';
    pane.querySelectorAll('[data-vault-view]').forEach(function(button){
      button.addEventListener('click',function(){ VIEW = button.dataset.vaultView; render(); });
    });
    pane.querySelectorAll('[data-vault-category]').forEach(function(button){
      button.addEventListener('click',function(){ CATEGORY = button.dataset.vaultCategory; render(); });
    });
    var content = document.getElementById('vaultViewContent');
    if(VIEW === 'loadout') loadoutView(content);
    else if(VIEW === 'events') eventsView(content);
    else collectionView(content);
    content.querySelectorAll('[data-vault-category]').forEach(function(button){
      button.addEventListener('click',function(){ CATEGORY = button.dataset.vaultCategory; render(); });
    });
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
      button.innerHTML = '<svg class="icn" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 8.5h14l-1 11H6l-1-11Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8.5 8.5V6.8A3.5 3.5 0 0 1 12 3.3a3.5 3.5 0 0 1 3.5 3.5v1.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M9 13h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span>Inventory</span>';
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
      subtabs.addEventListener('click',function(event){
        var target = event.target.closest('[data-shop-pane]');
        if(target) setTimeout(function(){ activatePane(target.dataset.shopPane); },0);
      });
    }
    return true;
  }

  function styles(){
    var old = document.getElementById('inventoryStyles');
    if(old) old.remove();
    var style = document.createElement('style');
    style.id = 'inventoryStyles';
    style.textContent = [
      'body.vault-sheet-open{overflow:hidden!important;}',
      '#shopSubtabs.vault-tabs-enabled{display:flex!important;gap:7px!important;overflow-x:auto!important;scrollbar-width:none!important;}',
      '#shopSubtabs.vault-tabs-enabled::-webkit-scrollbar{display:none!important;}',
      '#shopSubtabs.vault-tabs-enabled .shop-subtab{flex:0 0 96px!important;}',
      '#shopSubtabs .inventory-shop-tab.on{color:#6848b8!important;background:color-mix(in srgb,#8059d6 11%,var(--card))!important;}',
      '#pane-inventory{padding-bottom:34px!important;}',
      '.vault-hero{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(180px,.65fr);gap:12px;margin-bottom:12px;}',
      '.vault-hero-main,.vault-collection-score{position:relative;min-height:174px;border:1px solid color-mix(in srgb,#8059d6 18%,var(--line));border-radius:27px;background:radial-gradient(circle at 92% 12%,rgba(128,89,214,.16),transparent 33%),linear-gradient(145deg,var(--card),color-mix(in srgb,#8059d6 5%,var(--card)));box-shadow:0 18px 43px -35px rgba(50,31,100,.72);overflow:hidden;}',
      '.vault-hero-main{display:grid;align-items:center;padding:20px;}',
      '.vault-hero-main::after{content:"";position:absolute;right:-56px;top:-74px;width:190px;height:190px;border:1px solid rgba(128,89,214,.12);border-radius:50%;box-shadow:0 0 0 30px rgba(128,89,214,.035),0 0 0 62px rgba(128,89,214,.02);}',
      '.vault-profile-stage{position:relative;z-index:1;display:flex;align-items:center;gap:16px;min-width:0;}',
      '.vault-avatar{display:grid!important;place-items:center!important;width:86px!important;height:86px!important;flex:0 0 86px!important;border-radius:50%!important;color:#7250c4!important;background:linear-gradient(145deg,#f4efff,#fff)!important;box-shadow:0 16px 30px -20px rgba(64,41,123,.58)!important;font-family:var(--font-display)!important;font-size:28px!important;font-weight:900!important;overflow:hidden!important;}',
      '.vault-avatar img{width:100%;height:100%;object-fit:cover;}',
      '.vault-profile-copy{display:block;min-width:0;}',
      '.vault-profile-kicker{display:block;margin-bottom:8px;color:#7654c6;font-size:8px;font-weight:950;letter-spacing:.14em;}',
      '.vault-profile-copy>strong{display:block;overflow:hidden;color:var(--ink);font-family:var(--font-display);font-size:23px;font-weight:900;line-height:1.05;text-overflow:ellipsis;white-space:nowrap;}',
      '.vault-profile-copy>small{display:flex;align-items:center;gap:5px;margin-top:7px;color:var(--ink-soft);font-size:10px;font-weight:750;}',
      '.vault-profile-copy>small i{display:grid;place-items:center;width:21px;height:21px;border-radius:7px;color:#7552c5;background:rgba(128,89,214,.1);font-style:normal;}',
      '.vault-collection-score{display:grid;place-items:center;padding:15px;}',
      '.vault-progress-ring{display:grid;place-items:center;width:104px;height:104px;border-radius:50%;background:conic-gradient(#8059d6 var(--vault-progress),color-mix(in srgb,#8059d6 9%,var(--line)) 0);box-shadow:0 15px 28px -22px rgba(72,45,143,.72);}',
      '.vault-progress-ring::before{content:"";position:absolute;width:78px;height:78px;border-radius:50%;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);}',
      '.vault-progress-ring span{position:relative;z-index:1;display:grid;place-items:center;}',
      '.vault-progress-ring strong{color:var(--ink);font-size:20px;font-weight:950;line-height:1;}',
      '.vault-progress-ring small{margin-top:4px;color:var(--ink-soft);font-size:7px;font-weight:850;}',
      '.vault-balance-row{display:flex;gap:11px;margin-top:10px;color:var(--ink-soft);font-size:8px;font-weight:750;}',
      '.vault-balance-row b{color:var(--ink);font-weight:950;}',
      '.vault-view-nav{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:12px;padding:5px;border:1px solid var(--line);border-radius:20px;background:var(--paper-2);}',
      '.vault-view-btn{min-height:45px;padding:0 10px;border:0;border-radius:15px;color:var(--ink-soft);background:transparent;font:850 10px/1 var(--font-ui);cursor:pointer;}',
      '.vault-view-btn.on{color:#694abb;background:var(--card);box-shadow:0 9px 20px -17px rgba(22,36,43,.75);}',
      '.vault-view-panel{animation:vaultPanelIn .32s var(--glide) both;}',
      '.vault-filters{display:flex;gap:7px;margin-bottom:15px;overflow-x:auto;scrollbar-width:none;}',
      '.vault-filters::-webkit-scrollbar{display:none;}',
      '.vault-filter{display:flex;align-items:center;gap:6px;flex:0 0 auto;min-height:38px;padding:0 12px;border:1px solid var(--line);border-radius:999px;color:var(--ink-soft);background:var(--card);font:800 9px/1 var(--font-ui);cursor:pointer;}',
      '.vault-filter svg{width:15px;height:15px;}',
      '.vault-filter.on{color:#6748b7;border-color:rgba(128,89,214,.25);background:rgba(128,89,214,.09);}',
      '.vault-section-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin:0 2px 11px;}',
      '.vault-section-head span{display:block;margin-bottom:4px;color:#7654c6;font-size:7px;font-weight:950;letter-spacing:.13em;}',
      '.vault-section-head h3{margin:0;color:var(--ink);font-family:var(--font-display);font-size:20px;font-weight:900;letter-spacing:-.025em;}',
      '.vault-section-head>strong{display:grid;place-items:center;min-width:34px;height:27px;padding:0 9px;border:1px solid var(--line);border-radius:999px;color:var(--ink-soft);background:var(--card);font-size:9px;font-weight:900;}',
      '.vault-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-bottom:18px;}',
      '.vault-item{position:relative;display:grid;grid-template-rows:auto 96px auto;min-width:0;padding:10px;border:1px solid var(--line);border-radius:20px;color:var(--ink);background:linear-gradient(145deg,var(--card),color-mix(in srgb,var(--paper-2) 58%,var(--card)));box-shadow:0 12px 27px -25px rgba(22,36,43,.72);text-align:left;cursor:pointer;overflow:hidden;animation:vaultItemIn .38s var(--glide) both;animation-delay:calc(var(--vault-index)*34ms);transition:transform .17s ease,border-color .17s ease,box-shadow .17s ease;}',
      '.vault-item:hover{transform:translateY(-2px);border-color:rgba(128,89,214,.24);box-shadow:0 18px 32px -25px rgba(50,31,100,.55);}',
      '.vault-item.event-item{border-color:rgba(128,89,214,.21);background:linear-gradient(145deg,color-mix(in srgb,#8059d6 7%,var(--card)),color-mix(in srgb,#4cb9d1 4%,var(--card)));}',
      '.vault-item.equipped{border-color:color-mix(in srgb,var(--moss) 36%,var(--line));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--moss) 10%,transparent),0 14px 27px -24px rgba(47,105,56,.55);}',
      '.vault-item.locked{filter:saturate(.58);}',
      '.vault-item:disabled{cursor:not-allowed;opacity:.62;}',
      '.vault-item-top{display:flex;align-items:center;gap:5px;min-height:23px;margin-bottom:7px;}',
      '.vault-kind-icon{display:grid;place-items:center;width:23px;height:23px;border-radius:8px;color:#7351c0;background:rgba(128,89,214,.09);}',
      '.vault-kind-icon svg{width:13px;height:13px;}',
      '.vault-event-tag{margin-left:auto;padding:4px 6px;border-radius:999px;color:#6748b7;background:rgba(128,89,214,.11);font-size:6px;font-weight:950;letter-spacing:.08em;}',
      '.vault-equipped-dot{display:grid;place-items:center;margin-left:auto;width:22px;height:22px;border-radius:50%;color:#fff;background:var(--moss);font-size:10px;font-weight:950;}',
      '.vault-preview{position:relative;display:grid;place-items:center;height:96px;border:1px solid color-mix(in srgb,var(--line) 72%,transparent);border-radius:15px;background:var(--paper-2);overflow:hidden;}',
      '.vault-preview.large{height:190px;border-radius:24px;}',
      '.vault-preview.title{padding:10px;color:#fff;text-align:center;}',
      '.vault-preview.title b{font-size:12px;font-weight:950;}',
      '.vault-preview.large.title b{font-size:24px;}',
      '.vault-preview.color b{font-size:15px;font-weight:950;}',
      '.vault-preview.large.color b{font-size:29px;}',
      '.vault-preview.frame{background:radial-gradient(circle,var(--card),var(--paper-2));}',
      '.vault-mini-avatar{display:grid!important;place-items:center!important;width:54px!important;height:54px!important;border-radius:50%!important;color:#7250c4!important;background:var(--card)!important;font-size:14px!important;font-weight:950!important;}',
      '.vault-preview.large .vault-mini-avatar{width:104px!important;height:104px!important;font-size:25px!important;}',
      '.vault-preview.font{align-content:center;gap:2px;}',
      '.vault-preview.font b{font-size:35px;line-height:1;}',
      '.vault-preview.font small{color:var(--ink-soft);font-size:7px;font-weight:800;}',
      '.vault-preview.large.font b{font-size:68px;}',
      '.vault-preview.theme{align-content:end;justify-items:start;padding:11px;color:#fff;}',
      '.vault-preview.theme::after{content:"";position:absolute;inset:35% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.43));}',
      '.vault-preview.theme span{position:relative;z-index:1;font-size:9px;font-weight:950;}',
      '.vault-preview.large.theme span{font-size:18px;}',
      '.vault-preview.badge{align-content:center;gap:4px;color:#7250c4;background:radial-gradient(circle at 50% 38%,rgba(128,89,214,.18),transparent 45%),var(--paper-2);}',
      '.vault-preview.badge b{font-size:25px;line-height:1;}',
      '.vault-preview.badge span{font-size:6px;font-weight:950;letter-spacing:.1em;}',
      '.vault-preview.large.badge b{font-size:54px;}',
      '.vault-item-copy{display:block;min-width:0;padding:9px 2px 2px;}',
      '.vault-item-copy strong{display:block;overflow:hidden;color:var(--ink);font-size:11px;font-weight:900;text-overflow:ellipsis;white-space:nowrap;}',
      '.vault-item-copy small{display:block;margin-top:3px;overflow:hidden;color:var(--ink-soft);font-size:7px;font-weight:700;text-overflow:ellipsis;white-space:nowrap;}',
      '.vault-lock-overlay{position:absolute;right:9px;top:38px;display:grid;place-items:center;width:29px;height:29px;border:1px solid rgba(255,255,255,.45);border-radius:10px;color:#fff;background:rgba(24,22,31,.62);backdrop-filter:blur(8px);}',
      '.vault-lock-overlay svg{width:15px;height:15px;}',
      '.vault-loadout-preview{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:11px;padding:16px;border:1px solid rgba(128,89,214,.18);border-radius:23px;background:linear-gradient(145deg,color-mix(in srgb,#8059d6 7%,var(--card)),var(--card));}',
      '.vault-loadout-preview>span{max-width:180px;color:var(--ink-soft);font-size:9px;font-weight:650;line-height:1.45;text-align:right;}',
      '.vault-slots{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;}',
      '.vault-slot{display:grid;grid-template-columns:42px minmax(0,1fr) 20px;align-items:center;gap:10px;min-height:88px;padding:12px;border:1px solid var(--line);border-radius:20px;color:var(--ink);background:var(--card);box-shadow:0 12px 26px -25px rgba(22,36,43,.68);text-align:left;cursor:pointer;}',
      '.vault-slot.filled{border-color:rgba(128,89,214,.2);background:linear-gradient(145deg,color-mix(in srgb,#8059d6 5%,var(--card)),var(--card));}',
      '.vault-slot-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;color:#7452c2;background:rgba(128,89,214,.1);}',
      '.vault-slot-icon svg{width:21px;height:21px;}',
      '.vault-slot-copy{display:block;min-width:0;}',
      '.vault-slot-copy small{display:block;color:#7654c6;font-size:6.5px;font-weight:950;letter-spacing:.09em;text-transform:uppercase;}',
      '.vault-slot-copy strong{display:block;overflow:hidden;margin-top:4px;color:var(--ink);font-size:11px;font-weight:900;text-overflow:ellipsis;white-space:nowrap;}',
      '.vault-slot-copy span{display:block;overflow:hidden;margin-top:3px;color:var(--ink-soft);font-size:7px;font-weight:650;text-overflow:ellipsis;white-space:nowrap;}',
      '.vault-slot-arrow{color:var(--ink-soft);font-size:22px;}',
      '.vault-active-event-card{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:10px;padding:17px;border:1px solid rgba(134,99,231,.28);border-radius:23px;color:#fff;background:radial-gradient(circle at 83% 12%,rgba(96,229,255,.22),transparent 30%),linear-gradient(135deg,#28166c,#6541bb 57%,#184f79);box-shadow:0 18px 37px -28px rgba(70,39,155,.92);}',
      '.vault-active-event-card>div span{display:block;margin-bottom:5px;color:#d5cdfd;font-size:7px;font-weight:950;letter-spacing:.13em;}',
      '.vault-active-event-card>div strong{display:block;font-family:var(--font-display);font-size:21px;font-weight:900;}',
      '.vault-active-event-card>div small{display:block;margin-top:5px;color:rgba(255,255,255,.65);font-size:8px;font-weight:700;}',
      '.vault-active-event-card>button{flex:0 0 auto;min-height:39px;padding:0 13px;border:0;border-radius:13px;color:#6545b9;background:#fff;font-size:9px;font-weight:900;cursor:pointer;}',
      '.vault-event-sets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:16px;}',
      '.vault-event-set{position:relative;display:grid;grid-template-columns:38px minmax(0,1fr);align-items:center;gap:9px;min-height:91px;padding:11px;border:1px solid var(--line);border-radius:19px;color:var(--ink);background:var(--card);text-align:left;cursor:pointer;overflow:hidden;}',
      '.vault-event-set.active{border-color:rgba(128,89,214,.31);box-shadow:inset 0 0 0 1px rgba(128,89,214,.08);}',
      '.vault-event-set-orb{display:grid;place-items:center;width:38px;height:38px;border-radius:13px;color:#fff;background:linear-gradient(145deg,#7653cc,#48bcd5);font-size:16px;}',
      '.vault-event-set.plant .vault-event-set-orb{background:linear-gradient(145deg,#43a958,#a9d957);}',
      '.vault-event-set.solar .vault-event-set-orb{background:linear-gradient(145deg,#f57621,#f4c647);}',
      '.vault-event-set-copy{display:block;min-width:0;}',
      '.vault-event-set-copy small{display:block;color:#7654c6;font-size:5.8px;font-weight:950;letter-spacing:.08em;}',
      '.vault-event-set-copy strong{display:block;overflow:hidden;margin-top:3px;font-size:10px;font-weight:900;text-overflow:ellipsis;white-space:nowrap;}',
      '.vault-event-set-copy span{display:block;margin-top:3px;color:var(--ink-soft);font-size:6.5px;font-weight:700;}',
      '.vault-event-set-progress{position:absolute;left:11px;right:11px;bottom:8px;height:3px;border-radius:999px;background:var(--line);overflow:hidden;}',
      '.vault-event-set-progress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#7653cc,#48bcd5);}',
      '.vault-empty{display:grid;place-items:center;gap:5px;min-height:150px;padding:25px;border:1px dashed var(--line-2);border-radius:22px;color:var(--ink-soft);text-align:center;}',
      '.vault-empty b{color:var(--ink);font-size:13px;}',
      '.vault-empty span{max-width:300px;font-size:9px;line-height:1.45;}',
      '.vault-sheet{position:fixed;z-index:99999;inset:0;display:grid;align-items:end;pointer-events:none;}',
      '.vault-sheet[hidden]{display:none!important;}',
      '.vault-sheet-backdrop{position:absolute;inset:0;border:0;background:rgba(13,15,20,.58);opacity:0;backdrop-filter:blur(5px);transition:opacity .22s ease;}',
      '.vault-sheet-panel{position:relative;width:min(620px,100%);max-height:88dvh;margin:0 auto;padding:12px 18px calc(20px + env(safe-area-inset-bottom));border:1px solid var(--line);border-radius:30px 30px 0 0;background:var(--card);box-shadow:0 -25px 70px rgba(0,0,0,.25);overflow-y:auto;transform:translateY(105%);transition:transform .28s var(--glide);}',
      '.vault-sheet.open{pointer-events:auto;}',
      '.vault-sheet.open .vault-sheet-backdrop{opacity:1;}',
      '.vault-sheet.open .vault-sheet-panel{transform:none;}',
      '.vault-sheet-handle{width:42px;height:4px;margin:0 auto 13px;border-radius:999px;background:var(--line-2);}',
      '.vault-sheet-close{position:absolute;z-index:3;right:17px;top:17px;display:grid;place-items:center;width:34px;height:34px;border:1px solid var(--line);border-radius:50%;color:var(--ink-soft);background:var(--card);font-size:22px;cursor:pointer;}',
      '.vault-sheet-preview{padding:8px;border-radius:27px;background:var(--paper-2);}',
      '.vault-sheet-preview.event{background:linear-gradient(145deg,rgba(128,89,214,.11),rgba(72,188,213,.07));}',
      '.vault-sheet-meta{padding:17px 3px 13px;}',
      '.vault-sheet-kind{display:block;color:#7654c6;font-size:8px;font-weight:950;letter-spacing:.13em;}',
      '.vault-sheet-meta h3{margin:6px 0 0;color:var(--ink);font-family:var(--font-display);font-size:27px;font-weight:900;letter-spacing:-.035em;}',
      '.vault-sheet-meta p{margin:8px 0 0;color:var(--ink-soft);font-size:10px;font-weight:620;line-height:1.5;}',
      '.vault-sheet-facts{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:14px;}',
      '.vault-sheet-facts span{display:block;padding:11px;border:1px solid var(--line);border-radius:15px;background:var(--paper-2);}',
      '.vault-sheet-facts small{display:block;color:var(--ink-soft);font-size:6px;font-weight:950;letter-spacing:.11em;}',
      '.vault-sheet-facts b{display:block;margin-top:5px;color:var(--ink);font-size:10px;font-weight:900;}',
      '.vault-sheet-action{width:100%;min-height:49px;border:0;border-radius:16px;color:#fff;background:linear-gradient(135deg,#7653cc,#8059d6 58%,#4baec7);box-shadow:0 13px 27px -18px rgba(87,53,175,.78);font:900 11px/1 var(--font-ui);cursor:pointer;}',
      '.vault-sheet-action.equipped{color:var(--moss-dark);background:var(--moss-soft);box-shadow:none;}',
      '.vault-picker-head{padding:4px 2px 12px;}',
      '.vault-picker-head span{color:#7654c6;font-size:8px;font-weight:950;letter-spacing:.13em;}',
      '.vault-picker-head h3{margin:5px 0 0;color:var(--ink);font-family:var(--font-display);font-size:24px;font-weight:900;}',
      '.vault-picker-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;}',
      '@keyframes vaultPanelIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}',
      '@keyframes vaultItemIn{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}',
      '@media(max-width:760px){.vault-hero{grid-template-columns:1fr 150px}.vault-hero-main,.vault-collection-score{min-height:154px}.vault-avatar{width:74px!important;height:74px!important;flex-basis:74px!important}.vault-profile-copy>strong{font-size:20px}.vault-progress-ring{width:88px;height:88px}.vault-progress-ring::before{width:66px;height:66px}.vault-progress-ring strong{font-size:17px}.vault-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.vault-event-sets{grid-template-columns:1fr}.vault-event-set{min-height:78px}.vault-loadout-preview{display:block}.vault-loadout-preview>span{display:block;max-width:none;margin-top:12px;text-align:left}}',
      '@media(max-width:490px){.vault-hero{grid-template-columns:1fr}.vault-hero-main{min-height:138px;padding:17px}.vault-collection-score{display:flex;align-items:center;justify-content:center;gap:18px;min-height:108px}.vault-progress-ring{width:80px;height:80px;flex:0 0 80px}.vault-progress-ring::before{width:60px;height:60px}.vault-balance-row{display:grid;margin:0}.vault-view-btn{font-size:9px}.vault-grid{gap:8px}.vault-item{grid-template-rows:auto 101px auto;padding:9px}.vault-preview{height:101px}.vault-slots{grid-template-columns:1fr}.vault-active-event-card{display:grid}.vault-active-event-card>button{width:100%}.vault-picker-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.vault-sheet-panel{padding-left:14px;padding-right:14px;border-radius:25px 25px 0 0}.vault-preview.large{height:176px}}'
    ].join('');
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
          setTimeout(function(){
            var pane = document.getElementById('pane-inventory');
            if(pane && pane.classList.contains('on')) render();
          },0);
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
  window.openInventory = function(){
    try{ if(typeof switchTab === 'function') switchTab('tab-shop'); }catch(error){}
    setTimeout(function(){ activatePane('pane-inventory'); },80);
  };
  window.addEventListener('streg:startup-complete',install);
  window.addEventListener('streg:languagechange',render);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) install(); });
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  setTimeout(install,650);
})();
