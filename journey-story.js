(function(){
  'use strict';

  var root = document.getElementById('journeyVoyage');
  if(!root) return;

  var now = new Date();
  var journeyMonthCursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  var journeySelectedKey = null;

  function el(id){
    return document.getElementById(id);
  }

  function tr(da, en){
    return window.I18n && I18n.getLanguage() === 'en' ? en : da;
  }

  function locale(){
    return window.I18n ? I18n.locale() : 'da-DK';
  }

  function keyForDate(date){
    return date.toISOString().slice(0, 10);
  }

  function dateFromKey(key){
    return new Date(key + 'T12:00:00Z');
  }

  function capitalize(value){
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  }

  function sameUtcMonth(a, b){
    return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
  }

  function photoMap(){
    var map = Object.create(null);
    (S.photos || []).forEach(function(photo){
      var key = dayKeyOf(photo.ts);
      if(!map[key]) map[key] = [];
      map[key].push(photo);
    });
    Object.keys(map).forEach(function(key){
      map[key].sort(function(a, b){ return a.ts - b.ts; });
    });
    return map;
  }

  function monthKeys(map, year, month){
    return Object.keys(map).filter(function(key){
      var date = dateFromKey(key);
      return date.getUTCFullYear() === year && date.getUTCMonth() === month;
    }).sort();
  }

  function selectDefaultDay(map){
    var year = journeyMonthCursor.getUTCFullYear();
    var month = journeyMonthCursor.getUTCMonth();
    var today = dateFromKey(todayKey());
    if(year === today.getUTCFullYear() && month === today.getUTCMonth()){
      journeySelectedKey = todayKey();
      return;
    }
    var keys = monthKeys(map, year, month);
    if(keys.length){
      journeySelectedKey = keys[keys.length - 1];
      return;
    }
    var daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    journeySelectedKey = keyForDate(new Date(Date.UTC(year, month, daysInMonth)));
  }

  function selectedBelongsToCursor(){
    if(!journeySelectedKey) return false;
    var selected = dateFromKey(journeySelectedKey);
    return selected.getUTCFullYear() === journeyMonthCursor.getUTCFullYear() &&
      selected.getUTCMonth() === journeyMonthCursor.getUTCMonth();
  }

  function setStaticCopy(){
    el('journeyBrandKicker').textContent = tr('DIN HISTORIE', 'YOUR STORY');
    el('journeyKicker').textContent = tr('DIN HISTORIE', 'YOUR STORY');
    el('journeyStoryTitle').textContent = tr('Dagene du husker', 'The days you remember');
    el('journeyStorySubtitle').textContent = tr('Hver fotodag bliver et lys i din rejse.', 'Every photo day becomes a light in your journey.');
    el('journeyCurrentStreakLabel').textContent = tr('nuværende streak', 'current streak');
    el('journeyBestStreakLabel').textContent = tr('bedste streak', 'best streak');
    el('journeyPhotoCountLabel').textContent = tr('minder', 'memories');
    el('journeyPrevMonth').setAttribute('aria-label', tr('Forrige måned', 'Previous month'));
    el('journeyNextMonth').setAttribute('aria-label', tr('Næste måned', 'Next month'));
    el('journeyMonthGrid').setAttribute('aria-label', tr('Dine fotodage', 'Your photo days'));
    el('journeyLegendToday').textContent = tr('I dag', 'Today');
    el('journeyLegendPhoto').textContent = tr('Fotodag', 'Photo day');
    el('journeyLegendEmpty').textContent = tr('Rolig dag', 'Quiet day');
    el('journeyAchievementKicker').textContent = tr('MILEPÆLE', 'MILESTONES');
    el('journeyAchievementsTitle').textContent = tr('Bedrifter', 'Achievements');
    el('journeyGalleryKicker').textContent = tr('DINE ØJEBLIKKE', 'YOUR MOMENTS');
    el('journeyGalleryTitle').textContent = tr('Galleri', 'Gallery');
    el('journeyEmptyText').innerHTML = tr('Ingen billeder endnu.<br>Tag dit første, så bygger rejsen sig selv.', 'No photos yet.<br>Take your first one and the journey builds itself.');
  }

  function renderWeekdays(){
    var wrap = el('journeyWeekdays');
    wrap.innerHTML = '';
    for(var index = 0; index < 7; index++){
      var date = new Date(Date.UTC(2024, 0, 1 + index));
      var label = date.toLocaleDateString(locale(), { weekday:'narrow', timeZone:'UTC' });
      var item = document.createElement('span');
      item.textContent = label.toUpperCase();
      wrap.appendChild(item);
    }
  }

  function renderFocus(map){
    var key = journeySelectedKey || todayKey();
    var date = dateFromKey(key);
    var photos = map[key] || [];
    var photo = photos[0] || null;
    var preview = el('journeyFocusPreview');
    var open = el('journeyFocusOpen');
    var isToday = key === todayKey();
    var isFuture = key > todayKey();
    var fullDate = capitalize(date.toLocaleDateString(locale(), {
      weekday:'long',
      day:'numeric',
      month:'long',
      year:'numeric',
      timeZone:'UTC'
    }));

    el('journeyFocusKicker').textContent = fullDate.toUpperCase();
    preview.classList.toggle('has-memory', !!photo);
    preview.classList.toggle('is-today', isToday && !photo);
    preview.classList.toggle('is-future', isFuture && !photo);
    preview.style.backgroundImage = photo && photo.img
      ? 'url("' + String(photo.img).replace(/"/g, '%22') + '")'
      : '';

    if(photo){
      el('journeyFocusTitle').textContent = photos.length === 1
        ? tr('Et minde fanget', 'One memory captured')
        : tr(photos.length + ' minder fanget', photos.length + ' memories captured');
      var time = new Date(photo.ts).toLocaleTimeString(locale(), { hour:'2-digit', minute:'2-digit' });
      el('journeyFocusMeta').textContent = tr(
        'Første billede taget kl. ' + time,
        'First photo captured at ' + time
      );
      open.hidden = false;
      open.textContent = photos.length === 1 ? tr('Åbn billede', 'Open photo') : tr('Åbn første', 'Open first');
      open.onclick = function(){
        if(typeof SFX !== 'undefined' && SFX.pop) SFX.pop();
        Lightbox.open(photo.id);
      };
    }else{
      open.hidden = true;
      open.onclick = null;
      if(isFuture){
        el('journeyFocusTitle').textContent = tr('Dagen ligger foran dig', 'This day is ahead of you');
        el('journeyFocusMeta').textContent = tr('Et tomt kapitel, der endnu ikke er begyndt.', 'An empty chapter that has not begun yet.');
      }else if(isToday){
        el('journeyFocusTitle').textContent = tr('Dagen venter på dig', 'Today is waiting for you');
        el('journeyFocusMeta').textContent = tr('Tag dagens billede, så lyser dagen op.', 'Take today’s photo and this day will light up.');
      }else{
        el('journeyFocusTitle').textContent = tr('En rolig dag', 'A quiet day');
        el('journeyFocusMeta').textContent = tr('Ingen foto blev gemt denne dag.', 'No photo was saved on this day.');
      }
    }
  }

  function renderCalendar(map){
    var grid = el('journeyMonthGrid');
    var year = journeyMonthCursor.getUTCFullYear();
    var month = journeyMonthCursor.getUTCMonth();
    var first = new Date(Date.UTC(year, month, 1));
    var mondayOffset = (first.getUTCDay() + 6) % 7;
    var start = new Date(Date.UTC(year, month, 1 - mondayOffset));
    var keys = monthKeys(map, year, month);
    var photoTotal = keys.reduce(function(total, key){ return total + map[key].length; }, 0);
    var currentMonth = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));

    el('journeyMonthLabel').textContent = capitalize(first.toLocaleDateString(locale(), {
      month:'long',
      year:'numeric',
      timeZone:'UTC'
    }));
    el('journeyMonthSummary').textContent = tr(
      keys.length + (keys.length === 1 ? ' fotodag' : ' fotodage') + ' · ' + photoTotal + (photoTotal === 1 ? ' billede' : ' billeder'),
      keys.length + (keys.length === 1 ? ' photo day' : ' photo days') + ' · ' + photoTotal + (photoTotal === 1 ? ' photo' : ' photos')
    );

    var next = el('journeyNextMonth');
    next.disabled = journeyMonthCursor.getTime() >= currentMonth.getTime();

    grid.innerHTML = '';
    for(var index = 0; index < 42; index++){
      var date = new Date(start.getTime() + index * 86400000);
      var key = keyForDate(date);
      var photos = map[key] || [];
      var inMonth = date.getUTCMonth() === month;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'journey-day';
      button.setAttribute('role', 'gridcell');
      button.dataset.key = key;
      button.style.setProperty('--day-delay', Math.min(index * 14, 420) + 'ms');
      button.classList.toggle('outside', !inMonth);
      button.classList.toggle('has-memory', photos.length > 0);
      button.classList.toggle('today', key === todayKey());
      button.classList.toggle('selected', key === journeySelectedKey);
      button.classList.toggle('future', key > todayKey());

      var number = document.createElement('span');
      number.className = 'journey-day-number';
      number.textContent = String(date.getUTCDate());
      button.appendChild(number);

      if(photos.length){
        var memory = document.createElement('span');
        memory.className = 'journey-day-memory';
        memory.innerHTML = '<i></i>' + (photos.length > 1 ? '<b>' + photos.length + '</b>' : '');
        button.appendChild(memory);
      }

      var accessibleDate = date.toLocaleDateString(locale(), {
        weekday:'long',
        day:'numeric',
        month:'long',
        year:'numeric',
        timeZone:'UTC'
      });
      button.setAttribute('aria-label', accessibleDate + ' · ' + tr(
        photos.length + (photos.length === 1 ? ' billede' : ' billeder'),
        photos.length + (photos.length === 1 ? ' photo' : ' photos')
      ));
      button.setAttribute('aria-selected', key === journeySelectedKey ? 'true' : 'false');
      button.addEventListener('click', function(){
        var selectedDate = dateFromKey(this.dataset.key);
        journeySelectedKey = this.dataset.key;
        if(!sameUtcMonth(selectedDate, journeyMonthCursor)){
          journeyMonthCursor = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), 1));
        }
        if(typeof SFX !== 'undefined' && SFX.tap) SFX.tap();
        renderJourneyStory();
      });
      grid.appendChild(button);
    }
  }

  function updateCounts(map){
    var activeDays = Object.keys(map).length;
    var photoCount = (S.photos || []).length;
    var achievementCount = Array.isArray(S.achievements) ? S.achievements.length : 0;
    var achievementTotal = typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS.length : achievementCount;

    el('journeyActiveDays').textContent = String(activeDays);
    el('journeyPhotoDayLabel').textContent = tr(activeDays === 1 ? 'fotodag' : 'fotodage', activeDays === 1 ? 'photo day' : 'photo days');
    el('journeyCurrentStreak').textContent = String(Number(S.streak) || 0);
    el('journeyBestStreak').textContent = String(Number(S.best) || 0);
    el('journeyPhotoCount').textContent = String(photoCount);
    el('journeyPhotoCountLabel').textContent = tr(photoCount === 1 ? 'minde' : 'minder', photoCount === 1 ? 'memory' : 'memories');
    el('journeyAchievementCount').textContent = tr(
      achievementCount + ' af ' + achievementTotal + ' låst op',
      achievementCount + ' of ' + achievementTotal + ' unlocked'
    );
    el('journeyGalleryHint').textContent = tr(
      photoCount + (photoCount === 1 ? ' minde' : ' minder'),
      photoCount + (photoCount === 1 ? ' memory' : ' memories')
    );
  }

  function renderJourneyStory(){
    if(!el('journeyMonthGrid')) return;
    var map = photoMap();
    if(!selectedBelongsToCursor()) selectDefaultDay(map);
    setStaticCopy();
    updateCounts(map);
    renderWeekdays();
    renderCalendar(map);
    renderFocus(map);
  }

  function moveMonth(delta){
    journeyMonthCursor = new Date(Date.UTC(
      journeyMonthCursor.getUTCFullYear(),
      journeyMonthCursor.getUTCMonth() + delta,
      1
    ));
    journeySelectedKey = null;
    if(typeof SFX !== 'undefined' && SFX.tap) SFX.tap();
    renderJourneyStory();
  }

  el('journeyPrevMonth').addEventListener('click', function(){ moveMonth(-1); });
  el('journeyNextMonth').addEventListener('click', function(){
    if(!this.disabled) moveMonth(1);
  });

  window.addEventListener('streg:languagechange', renderJourneyStory);
  window.renderJourneyStory = renderJourneyStory;
  renderHeat = renderJourneyStory;
  window.renderHeat = renderJourneyStory;
  requestAnimationFrame(renderJourneyStory);
})();