(function(){
  'use strict';

  var STORAGE_KEY = 'streg_cinematic_tutorial_seen';
  var root, spotlight, panel, chapterLayer, currentTarget = null;
  var currentIndex = -1, active = false, renderToken = 0, lastChapter = '';
  var originTab = 'tab-home', originScroll = 0, resizeRaf = 0, touchX = null, touchY = null;

  var STEPS = [
    {
      chapter:{da:'START',en:'START'}, title:{da:'HELE STREG. ÉN FILMISK TUR.',en:'ALL OF STREG. ONE CINEMATIC TOUR.'},
      body:{da:'På få minutter lærer du streaks, billeder, hex-kortet, pengepunge, challenges, events, shoppen, Connections, Journey, achievements, badges og alle dine indstillinger.',en:'In a few minutes you will learn streaks, photos, the hex map, coin bags, challenges, events, the shop, Connections, Journey, achievements, badges and every important setting.'},
      icon:'sparkle',center:true,accent:'#a855f7',accent2:'#22d3ee'
    },
    {
      chapter:{da:'DIN STREAK',en:'YOUR STREAK'}, title:{da:'Din streak er motoren',en:'Your streak is the engine'},
      body:{da:'Hvert gyldigt dagsfoto gør tallet én større. Her ser du din nuværende streak, næste milepæl og ruten mod dit næste store øjeblik.',en:'Every valid daily photo increases the number by one. Here you see your current streak, the next milestone and the route to your next big moment.'},
      icon:'flame',tab:'tab-home',selector:'#streakCommandHero',accent:'#a855f7',accent2:'#fb923c'
    },
    {
      chapter:{da:'DIN STREAK',en:'YOUR STREAK'}, title:{da:'Dagens foto låser dagen op',en:'Today’s photo unlocks the day'},
      body:{da:'Tryk “Tag billede”, giv kamera og placering adgang, og stå i en ny hexagon. Efter fotoet får du streak-cutscenen, XP og dagens fremskridt.',en:'Tap “Take photo”, allow camera and location, and stand in a new hexagon. After the photo you get the streak cutscene, XP and today’s progress.'},
      icon:'camera',tab:'tab-home',selector:'#captureCard',accent:'#f97316',accent2:'#facc15'
    },
    {
      chapter:{da:'DIN STREAK',en:'YOUR STREAK'}, title:{da:'Syv faner — og du kan swipe',en:'Seven tabs — and you can swipe'},
      body:{da:'Bundmenuen tager dig gennem hele STREG. På telefonen kan du også glide vandret mellem fanerne. Den orange kameraknap bringer dig altid tilbage til dagens foto.',en:'The bottom bar takes you through all of STREG. On a phone you can also swipe horizontally between tabs. The orange camera button always returns you to today’s photo.'},
      icon:'arrowRight',tab:'tab-home',selector:'.tabbar',accent:'#22c55e',accent2:'#38bdf8'
    },
    {
      chapter:{da:'DIN VERDEN',en:'YOUR WORLD'}, title:{da:'Verden er bygget af hexagoner',en:'The world is made of hexagons'},
      body:{da:'Kortet følger dig. Hexagonen du står i er tydeligst, mens ringene omkring den toner ud. En ny dags streak kræver bare, at du tager billedet i en ny hexagon.',en:'The map follows you. Your current hexagon is clearest while the surrounding rings fade away. A new daily streak only requires a photo in a new hexagon.'},
      icon:'map',tab:'tab-map',selector:'#tab-map .hex-map-shell',accent:'#06b6d4',accent2:'#60a5fa'
    },
    {
      chapter:{da:'DIN VERDEN',en:'YOUR WORLD'}, title:{da:'Pengepunge og hotspots flytter sig',en:'Coin bags and hotspots move'},
      body:{da:'Pengepunge giver coins, og hotspots gør kortet værd at udforske. “Reroll bags” placerer alle kortets fund på ny, når du vil teste eller have en frisk rute.',en:'Coin bags grant coins, and hotspots make the map worth exploring. “Reroll bags” places all map finds again when you want to test or get a fresh route.'},
      icon:'coin',tab:'tab-map',selector:'#rerollBagsBtn',accent:'#eab308',accent2:'#fb923c'
    },
    {
      chapter:{da:'DIN VERDEN',en:'YOUR WORLD'}, title:{da:'Vælg en hex — fang øjeblikket',en:'Choose a hex — capture the moment'},
      body:{da:'Kortets infokort fortæller, hvor du står, om området allerede er fotograferet, og hvornår du må tage dagens billede. Din placering opdateres, mens du bevæger dig.',en:'The map card tells you where you are, whether the area has already been photographed, and when today’s photo is available. Your position updates as you move.'},
      icon:'target',tab:'tab-map',selector:'#hexCurrentCard',accent:'#3b82f6',accent2:'#22d3ee'
    },
    {
      chapter:{da:'MISSIONER',en:'MISSIONS'}, title:{da:'Challenges findes i flere tempi',en:'Challenges run at several speeds'},
      body:{da:'Skift mellem daglige, ugentlige, månedlige og event-opgaver. De nulstilles forskelligt, så der er både hurtige mål og noget stort at bygge imod.',en:'Switch between daily, weekly, monthly and event challenges. They reset at different times, so you always have both quick goals and something larger to build toward.'},
      icon:'target',tab:'tab-challenges',selector:'#tab-challenges .ch-subtabs',prepare:'daily',accent:'#8b5cf6',accent2:'#22d3ee'
    },
    {
      chapter:{da:'MISSIONER',en:'MISSIONS'}, title:{da:'Daglige challenges betaler med fremskridt',en:'Daily challenges pay in progress'},
      body:{da:'Hvert kort viser kravet, din live-fremgang og belønningen. Når en opgave lyser op, kan den hentes — og event-XP kan fortsætte direkte ind i månedens event.',en:'Each card shows the requirement, your live progress and the reward. When a task lights up, it can be claimed — and event XP can continue directly into the monthly event.'},
      icon:'check',tab:'tab-challenges',selector:'#challengeList',prepare:'daily',accent:'#7c3aed',accent2:'#34d399'
    },
    {
      chapter:{da:'MISSIONER',en:'MISSIONS'}, title:{da:'Events er deres egne verdener',en:'Events are worlds of their own'},
      body:{da:'Event-barren samler XP fra event-challenges og åbner eksklusive milepæle. Følg næste reward, hent færdige opgaver og nå finalen før eventet slutter.',en:'The event bar collects XP from event challenges and unlocks exclusive milestones. Track the next reward, claim completed tasks and reach the finale before the event ends.'},
      icon:'bolt',tab:'tab-challenges',selector:'#eventHero',prepare:'event',accent:'#6366f1',accent2:'#22d3ee'
    },
    {
      chapter:{da:'BELØNNINGER',en:'REWARDS'}, title:{da:'Shoppen samler alt, du kan eje',en:'The shop holds everything you can own'},
      body:{da:'Her bruger du coins og fragments på udtryk til appen og profilen. Shop-fanerne holder items, temaer, fonts og særlige belønninger adskilt.',en:'Spend coins and fragments here on styles for the app and your profile. Shop tabs keep items, themes, fonts and special rewards organised.'},
      icon:'coin',tab:'tab-shop',selector:'#shopSubtabs',prepare:'shopItems',accent:'#f59e0b',accent2:'#f472b6'
    },
    {
      chapter:{da:'BELØNNINGER',en:'REWARDS'}, title:{da:'Preview før du vælger din stil',en:'Preview before choosing your style'},
      body:{da:'Themes og fonts kan previewes, før du køber eller equipper dem. Temaet kan ændre hele følelsen i STREG — ikke bare én enkelt farve.',en:'Themes and fonts can be previewed before you buy or equip them. A theme can change the entire feel of STREG — not just a single colour.'},
      icon:'palette',tab:'tab-shop',selector:'#pane-themes',prepare:'shopThemes',accent:'#ec4899',accent2:'#a78bfa'
    },
    {
      chapter:{da:'FÆLLESSKAB',en:'COMMUNITY'}, title:{da:'Connections gør streaken social',en:'Connections makes the streak social'},
      body:{da:'Find venner, se deres streaks og sammenlign fremskridt. Din profil, badge og udstyrede stil er det visitkort, andre møder her.',en:'Find friends, see their streaks and compare progress. Your profile, badge and equipped style are the calling card others meet here.'},
      icon:'globe',tab:'tab-friends',selector:'#tab-friends .brandrow',accent:'#14b8a6',accent2:'#60a5fa'
    },
    {
      chapter:{da:'DIN REJSE',en:'YOUR JOURNEY'}, title:{da:'Journey er din levende hukommelse',en:'Journey is your living memory'},
      body:{da:'Rejsen viser dagene som en historie i stedet for en kedelig statistik. Gå tilbage gennem aktive dage, milepæle og de perioder, hvor streaken voksede.',en:'Journey shows your days as a story instead of a dull statistic. Travel back through active days, milestones and the periods where your streak grew.'},
      icon:'calMonth',tab:'tab-journey',selector:'#journeyVoyage',accent:'#8b5cf6',accent2:'#38bdf8'
    },
    {
      chapter:{da:'DIN REJSE',en:'YOUR JOURNEY'}, title:{da:'50 achievements. Fem rarities.',en:'50 achievements. Five rarities.'},
      body:{da:'Common, Rare, Epic, Legendary og Secret har hver deres visuelle identitet og ikon. Nogle kommer naturligt; de hemmelige kræver, at du opdager dem.',en:'Common, Rare, Epic, Legendary and Secret each have their own visual identity and icon. Some arrive naturally; secret ones must be discovered.'},
      icon:'gem',tab:'tab-journey',selector:'.journey-achievements-panel',accent:'#a855f7',accent2:'#facc15'
    },
    {
      chapter:{da:'DIN REJSE',en:'YOUR JOURNEY'}, title:{da:'Galleriet gemmer øjeblikkene',en:'The gallery keeps the moments'},
      body:{da:'Alle dine STREG-billeder samles her med dato og rejsekontekst. Det er din visuelle dagbog — bygget ét nyt sted ad gangen.',en:'All your STREG photos gather here with date and journey context. It is your visual diary — built one new place at a time.'},
      icon:'camera',tab:'tab-journey',selector:'.journey-gallery-panel',accent:'#06b6d4',accent2:'#f472b6'
    },
    {
      chapter:{da:'DIG',en:'YOU'}, title:{da:'Profilen er dit visitkort',en:'Your profile is your calling card'},
      body:{da:'Navn, avatar, streak, coins, fragments, shields og badge mødes her. Badges sidder ved siden af dit navn og viser den præstation, du vil være kendt for.',en:'Name, avatar, streak, coins, fragments, shields and badge meet here. Badges sit beside your name and show the achievement you want to be known for.'},
      icon:'sparkle',tab:'tab-profile',selector:'#tab-profile .p-head',prepare:'profilePhotos',accent:'#10b981',accent2:'#facc15'
    },
    {
      chapter:{da:'KONTROL',en:'CONTROL'}, title:{da:'Gør hele STREG til din',en:'Make all of STREG yours'},
      body:{da:'I Settings kan du skifte theme, font, dark mode og andre visuelle valg. Theme-preview lader dig prøve udtrykket uden at låse dig fast.',en:'In Settings you can change theme, font, dark mode and other visual choices. Theme preview lets you try the look without committing to it.'},
      icon:'palette',tab:'tab-profile',selector:'#themeGrid',prepare:'profileSettings',accent:'#f43f5e',accent2:'#a78bfa'
    },
    {
      chapter:{da:'KONTROL',en:'CONTROL'}, title:{da:'Sprog, lyd og haptics følger dig',en:'Language, sound and haptics follow you'},
      body:{da:'Skift mellem dansk og engelsk — hele appen skifter. Du kan også tænde eller slukke lyde og de små fysiske haptics, som gør tryk, rewards og kamera levende.',en:'Switch between Danish and English — the whole app changes. You can also enable or disable sounds and the physical haptics that make taps, rewards and the camera feel alive.'},
      icon:'gear',tab:'tab-profile',selector:'#setLanguage',prepare:'profileSettings',accent:'#0ea5e9',accent2:'#34d399'
    },
    {
      chapter:{da:'KONTROL',en:'CONTROL'}, title:{da:'Din konto, dine data — og turen igen',en:'Your account, your data — and the tour again'},
      body:{da:'Her kan du styre konto og lokale data. Knappen, vi viser nu, starter denne fulde tutorial igen når som helst, så du altid kan teste alle cutscenes fra begyndelsen.',en:'Manage your account and local data here. The button highlighted now starts this full tutorial again whenever you want to test every cutscene from the beginning.'},
      icon:'tools',tab:'tab-profile',selector:'#tourBtn',prepare:'profileSettings',accent:'#8b5cf6',accent2:'#22d3ee'
    },
    {
      chapter:{da:'DU ER KLAR',en:'YOU ARE READY'}, title:{da:'GÅ UD. FIND EN NY HEX. BYG DIN STREAK.',en:'GO OUT. FIND A NEW HEX. BUILD YOUR STREAK.'},
      body:{da:'Du kender nu hele loopet: udforsk, tag dagens billede, fuldfør missions, saml rewards og se din rejse vokse. Resten af historien er din.',en:'You now know the full loop: explore, take today’s photo, complete missions, collect rewards and watch your journey grow. The rest of the story is yours.'},
      icon:'confetti',center:true,accent:'#f97316',accent2:'#facc15'
    }
  ];

  function lang(){
    try{
      if(typeof I18n !== 'undefined' && I18n && typeof I18n.getLanguage === 'function') return I18n.getLanguage() === 'en' ? 'en' : 'da';
      if(typeof S !== 'undefined' && S.settings && S.settings.language === 'en') return 'en';
    }catch(e){}
    return 'da';
  }
  function tr(value){ return value && (value[lang()] || value.da || value.en) || ''; }
  function prefersReduced(){
    try{ return !!reduceMotion; }catch(e){}
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function delay(ms){ return new Promise(function(resolve){ setTimeout(resolve, prefersReduced() ? Math.min(ms,80) : ms); }); }
  function haptic(kind){
    try{
      var h = window.STREG_HAPTICS;
      if(h && typeof h[kind] === 'function') h[kind]();
      else if(typeof vibrate === 'function') vibrate(kind === 'firm' ? 24 : 10);
    }catch(e){}
  }
  function sound(kind){
    try{ if(typeof SFX !== 'undefined' && SFX && typeof SFX[kind] === 'function') SFX[kind](); }catch(e){}
  }
  function iconMarkup(name){
    try{ if(typeof icon === 'function') return icon(name || 'sparkle',28); }catch(e){}
    return '<span aria-hidden="true">✦</span>';
  }
  function currentTab(){
    try{ if(typeof visibleTab !== 'undefined' && visibleTab) return visibleTab; }catch(e){}
    var activeTab = document.querySelector('.tab-content.active');
    return activeTab ? activeTab.id : 'tab-home';
  }
  function updateLauncher(){
    var button = document.getElementById('tourBtn');
    if(button) button.textContent = lang() === 'en' ? 'Play the full tutorial' : 'Afspil den store tutorial';
  }

  function build(){
    if(document.getElementById('stregCinematicTutorial')){
      root = document.getElementById('stregCinematicTutorial');
      return;
    }
    root = document.createElement('div');
    root.id = 'stregCinematicTutorial';
    root.hidden = true;
    root.setAttribute('data-i18n-skip','');
    root.setAttribute('aria-hidden','true');
    root.innerHTML =
      '<div class="streg-tutorial-guard" aria-hidden="true"></div>' +
      '<div class="streg-tutorial-spotlight" aria-hidden="true">' +
        '<span class="streg-tutorial-scan"></span>' +
        '<span class="streg-tutorial-corner c1"></span><span class="streg-tutorial-corner c2"></span>' +
        '<span class="streg-tutorial-corner c3"></span><span class="streg-tutorial-corner c4"></span>' +
      '</div>' +
      '<section class="streg-tutorial-panel" role="dialog" aria-modal="true" aria-labelledby="stregTutorialTitle" aria-describedby="stregTutorialBody">' +
        '<div class="streg-tutorial-top">' +
          '<div class="streg-tutorial-icon" aria-hidden="true"></div>' +
          '<div class="streg-tutorial-meta"><div class="streg-tutorial-kicker"></div><div class="streg-tutorial-count"></div></div>' +
          '<button class="streg-tutorial-skip" type="button"></button>' +
        '</div>' +
        '<h2 class="streg-tutorial-title" id="stregTutorialTitle"></h2>' +
        '<p class="streg-tutorial-body" id="stregTutorialBody"></p>' +
        '<div class="streg-tutorial-progress" aria-hidden="true"><i></i></div>' +
        '<div class="streg-tutorial-actions">' +
          '<button class="streg-tutorial-btn streg-tutorial-back" type="button"></button>' +
          '<button class="streg-tutorial-btn streg-tutorial-next" type="button"></button>' +
        '</div>' +
        '<div class="streg-tutorial-swipe-hint"></div>' +
      '</section>' +
      '<div class="streg-tutorial-chapter" aria-hidden="true">' +
        '<div class="streg-tutorial-particles"></div>' +
        '<div class="streg-tutorial-chapter-card">' +
          '<div class="streg-tutorial-chapter-icon"></div>' +
          '<div class="streg-tutorial-chapter-label"></div>' +
          '<div class="streg-tutorial-chapter-title"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    spotlight = root.querySelector('.streg-tutorial-spotlight');
    panel = root.querySelector('.streg-tutorial-panel');
    chapterLayer = root.querySelector('.streg-tutorial-chapter');

    var particles = root.querySelector('.streg-tutorial-particles');
    for(var i=0;i<22;i++){
      var dot = document.createElement('i');
      dot.className = 'streg-tutorial-particle';
      dot.style.setProperty('--x', ((i*47)%97) + '%');
      dot.style.setProperty('--y', ((i*71+13)%94) + '%');
      dot.style.setProperty('--duration', (2.8+(i%6)*.55) + 's');
      dot.style.setProperty('--delay', (-i*.31) + 's');
      particles.appendChild(dot);
    }

    root.querySelector('.streg-tutorial-next').addEventListener('click',next);
    root.querySelector('.streg-tutorial-back').addEventListener('click',previous);
    root.querySelector('.streg-tutorial-skip').addEventListener('click',function(){ close(false); });
    root.querySelector('.streg-tutorial-guard').addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); });
    panel.addEventListener('touchstart',function(e){
      if(!e.touches || !e.touches[0]) return;
      touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
    },{passive:true});
    panel.addEventListener('touchend',function(e){
      if(touchX === null || !e.changedTouches || !e.changedTouches[0]) return;
      var dx = e.changedTouches[0].clientX-touchX;
      var dy = e.changedTouches[0].clientY-touchY;
      touchX = touchY = null;
      if(Math.abs(dx)>62 && Math.abs(dx)>Math.abs(dy)*1.25){ dx<0 ? next() : previous(); }
    },{passive:true});
    updateLauncher();
  }

  function animatedText(node,text){
    node.textContent = '';
    String(text || '').split(/\s+/).forEach(function(word,index,all){
      var span = document.createElement('span');
      span.className = 'streg-tutorial-word';
      span.style.setProperty('--word-index',index);
      span.textContent = word;
      node.appendChild(span);
      if(index<all.length-1) node.appendChild(document.createTextNode(' '));
    });
  }

  function prepare(name){
    if(!name) return;
    var button;
    try{
      if(name === 'daily' && typeof window.activateChallengePane === 'function') window.activateChallengePane('pane-ch-daily');
      if(name === 'event' && typeof window.activateChallengePane === 'function') window.activateChallengePane('pane-ch-event');
      if(name === 'daily' && typeof window.activateChallengePane !== 'function'){
        button = document.querySelector('.ch-subtab[data-ch-pane="pane-ch-daily"]'); if(button) button.click();
      }
      if(name === 'event' && typeof window.activateChallengePane !== 'function'){
        button = document.querySelector('.ch-subtab[data-ch-pane="pane-ch-event"]'); if(button) button.click();
      }
      if(name === 'shopItems'){
        button = document.querySelector('.shop-subtab[data-shop-pane="pane-items"]'); if(button) button.click();
      }
      if(name === 'shopThemes'){
        button = document.querySelector('.shop-subtab[data-shop-pane="pane-themes"]'); if(button) button.click();
      }
      if(name === 'profilePhotos'){
        button = document.querySelector('#tab-profile .subtab[data-pane="pane-photos"]'); if(button) button.click();
      }
      if(name === 'profileSettings'){
        button = document.querySelector('#tab-profile .subtab[data-pane="pane-settings"]'); if(button) button.click();
      }
    }catch(e){}
  }

  async function activateContext(step,token){
    if(step.tab && currentTab() !== step.tab){
      try{ if(typeof switchTab === 'function') switchTab(step.tab); }catch(e){}
      await delay(360);
    }
    if(token !== renderToken) return;
    prepare(step.prepare);
    if(step.prepare) await delay(230);
  }

  async function chapterCutscene(step,token){
    if(!chapterLayer || !active) return;
    var label = lang()==='en' ? 'CHAPTER' : 'KAPITEL';
    chapterLayer.querySelector('.streg-tutorial-chapter-label').textContent = label;
    chapterLayer.querySelector('.streg-tutorial-chapter-title').textContent = tr(step.chapter);
    chapterLayer.querySelector('.streg-tutorial-chapter-icon').innerHTML = iconMarkup(step.icon);
    chapterLayer.classList.add('is-visible');
    haptic('firm'); sound('whoosh');
    await delay(560);
    if(token !== renderToken) return;
    chapterLayer.classList.remove('is-visible');
    await delay(210);
  }

  function findTarget(step){
    var target = step.selector ? document.querySelector(step.selector) : null;
    if(!target && step.tab) target = document.getElementById(step.tab);
    if(!target) target = document.querySelector('.tabbar');
    return target;
  }

  async function revealTarget(target,token){
    if(!target) return;
    try{ target.scrollIntoView({behavior:prefersReduced()?'auto':'smooth',block:'center',inline:'nearest'}); }catch(e){}
    await delay(330);
    if(token !== renderToken) return;
    var mobilePanelHeight = panel ? panel.getBoundingClientRect().height : 0;
    var r = target.getBoundingClientRect();
    if(window.innerWidth<=640 && r.bottom > window.innerHeight-mobilePanelHeight-22 && !target.closest('.tabbar')){
      var scroller = document.querySelector('.content');
      if(scroller) scroller.scrollTop += r.bottom-(window.innerHeight-mobilePanelHeight-35);
      await delay(170);
    }
  }

  function clearTarget(){
    if(currentTarget){
      currentTarget.classList.remove('streg-tutorial-target');
      currentTarget = null;
    }
  }

  function setSpotlight(target){
    clearTarget();
    if(!target) return;
    currentTarget = target;
    target.classList.add('streg-tutorial-target');
    var r = target.getBoundingClientRect();
    var pad = window.innerWidth<=640 ? 7 : 10;
    var left = Math.max(6,r.left-pad);
    var top = Math.max(6,r.top-pad);
    var right = Math.min(window.innerWidth-6,r.right+pad);
    var bottom = Math.min(window.innerHeight-6,r.bottom+pad);
    spotlight.style.left = left+'px';
    spotlight.style.top = top+'px';
    spotlight.style.width = Math.max(24,right-left)+'px';
    spotlight.style.height = Math.max(24,bottom-top)+'px';
    var radius = parseFloat(getComputedStyle(target).borderRadius) || 18;
    spotlight.style.borderRadius = Math.min(34,Math.max(14,radius+6))+'px';
  }

  function placePanel(target){
    if(!panel || window.innerWidth<=640 || !target) return;
    var r = target.getBoundingClientRect();
    var p = panel.getBoundingClientRect();
    var gap = 22, left, top;
    if(r.right+gap+p.width <= window.innerWidth-14){
      left = r.right+gap; top = r.top+(r.height-p.height)/2;
    }else if(r.left-gap-p.width >= 14){
      left = r.left-gap-p.width; top = r.top+(r.height-p.height)/2;
    }else if(r.bottom+gap+p.height <= window.innerHeight-14){
      left = r.left+(r.width-p.width)/2; top = r.bottom+gap;
    }else{
      left = r.left+(r.width-p.width)/2; top = r.top-gap-p.height;
    }
    left = Math.max(14,Math.min(window.innerWidth-p.width-14,left));
    top = Math.max(14,Math.min(window.innerHeight-p.height-14,top));
    panel.style.left = left+'px';
    panel.style.top = top+'px';
  }

  function renderCopy(step,index){
    root.style.setProperty('--t-accent',step.accent || '#a855f7');
    root.style.setProperty('--t-accent-2',step.accent2 || '#22d3ee');
    root.classList.toggle('streg-tutorial-center',!!step.center);
    root.querySelector('.streg-tutorial-icon').innerHTML = iconMarkup(step.icon);
    root.querySelector('.streg-tutorial-kicker').textContent = tr(step.chapter);
    root.querySelector('.streg-tutorial-count').textContent = String(index+1).padStart(2,'0')+' / '+String(STEPS.length).padStart(2,'0');
    animatedText(root.querySelector('.streg-tutorial-title'),tr(step.title));
    animatedText(root.querySelector('.streg-tutorial-body'),tr(step.body));
    root.querySelector('.streg-tutorial-progress i').style.width = ((index+1)/STEPS.length*100)+'%';
    root.querySelector('.streg-tutorial-skip').textContent = lang()==='en' ? 'Skip' : 'Spring over';
    root.querySelector('.streg-tutorial-back').textContent = lang()==='en' ? 'Back' : 'Tilbage';
    root.querySelector('.streg-tutorial-back').disabled = index===0;
    root.querySelector('.streg-tutorial-next').textContent =
      index===STEPS.length-1 ? (lang()==='en'?'Enter STREG':'Start STREG') : (lang()==='en'?'Next  →':'Næste  →');
    root.querySelector('.streg-tutorial-swipe-hint').textContent =
      lang()==='en' ? 'Swipe left or right to navigate' : 'Swipe til venstre eller højre';
  }

  async function show(index,direction){
    if(!active || index<0 || index>=STEPS.length) return;
    var token = ++renderToken;
    var previousChapter = lastChapter;
    var step = STEPS[index];
    currentIndex = index;
    renderCopy(step,index);
    if(step.center){
      clearTarget();
      lastChapter = tr(step.chapter);
      haptic(index===0?'light':'reward');
      sound(index===0?'magic':'success');
      try{ root.querySelector('.streg-tutorial-next').focus({preventScroll:true}); }catch(e){}
      return;
    }

    var chapterName = tr(step.chapter);
    var chapterChanged = previousChapter && previousChapter !== chapterName;
    lastChapter = chapterName;
    if(chapterChanged) await chapterCutscene(step,token);
    if(token !== renderToken || !active) return;

    await activateContext(step,token);
    if(token !== renderToken || !active) return;
    var target = findTarget(step);
    await revealTarget(target,token);
    if(token !== renderToken || !active) return;
    setSpotlight(target);
    placePanel(target);
    haptic(direction<0?'selection':'light');
    sound(direction<0?'tap':'pop');
    try{ root.querySelector('.streg-tutorial-next').focus({preventScroll:true}); }catch(e){}
  }

  function next(){
    if(!active) return;
    if(currentIndex>=STEPS.length-1){ close(true); return; }
    show(currentIndex+1,1);
  }
  function previous(){
    if(!active || currentIndex<=0) return;
    show(currentIndex-1,-1);
  }

  function restoreOrigin(){
    try{
      if(originTab && currentTab()!==originTab && typeof switchTab==='function') switchTab(originTab);
      setTimeout(function(){
        var scroller=document.querySelector('.content');
        if(scroller) scroller.scrollTop=originScroll;
      },prefersReduced()?0:320);
    }catch(e){}
  }

  function close(completed){
    if(!active) return;
    ++renderToken;
    active = false;
    clearTarget();
    chapterLayer && chapterLayer.classList.remove('is-visible');
    root.hidden = true;
    root.setAttribute('aria-hidden','true');
    root.classList.remove('streg-tutorial-center');
    document.body.classList.remove('streg-tutorial-open');
    if(completed){
      try{ localStorage.setItem(STORAGE_KEY,'1'); }catch(e){}
      haptic('reward'); sound('magic');
      try{
        if(typeof confetti==='function') confetti(90);
        if(currentTab()!=='tab-home' && typeof switchTab==='function') switchTab('tab-home');
        if(typeof toast==='function') toast(lang()==='en'?'Tutorial complete — your journey begins now ✦':'Tutorial fuldført — din rejse begynder nu ✦',3200);
      }catch(e){}
    }else{
      haptic('selection'); sound('tap'); restoreOrigin();
    }
  }

  function start(){
    build();
    if(active){ show(0,1); return; }
    originTab = currentTab();
    var scroller = document.querySelector('.content');
    originScroll = scroller ? scroller.scrollTop : 0;
    currentIndex = -1; lastChapter = '';
    active = true;
    root.hidden = false;
    root.setAttribute('aria-hidden','false');
    document.body.classList.add('streg-tutorial-open');
    haptic('firm'); sound('magic');
    show(0,1);
  }

  function reposition(){
    if(!active || currentIndex<0 || STEPS[currentIndex].center) return;
    setSpotlight(findTarget(STEPS[currentIndex]));
    placePanel(currentTarget);
  }
  function requestReposition(){
    if(resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(function(){ resizeRaf=0; reposition(); });
  }

  function install(){
    build();
    updateLauncher();
    window.STREG_TUTORIAL = {
      start:start,restart:start,next:next,previous:previous,
      close:function(){ close(false); },
      isOpen:function(){ return active; },
      steps:STEPS.length
    };
    window.addEventListener('resize',requestReposition,{passive:true});
    window.addEventListener('orientationchange',requestReposition,{passive:true});
    var content = document.querySelector('.content');
    if(content) content.addEventListener('scroll',requestReposition,{passive:true});
    window.addEventListener('streg:languagechange',function(){
      updateLauncher();
      if(active && currentIndex>=0) show(currentIndex,0);
    });
    document.addEventListener('keydown',function(e){
      if(!active) return;
      if(e.key==='Escape'){ e.preventDefault(); close(false); }
      if(e.key==='ArrowRight'){ e.preventDefault(); next(); }
      if(e.key==='ArrowLeft'){ e.preventDefault(); previous(); }
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
