(function(){
  'use strict';

  window.__stregStartupV2 = true;

  var overlay = document.getElementById('startupLoader');
  if(!overlay){
    document.body.classList.remove('app-preloading');
    window.dispatchEvent(new CustomEvent('streg:startup-complete'));
    return;
  }

  var status = document.getElementById('startupStatus');
  var percent = document.getElementById('startupPercent');
  var kicker = overlay.querySelector('.startup-kicker');
  var detail = overlay.querySelector('.startup-manifesto');
  var phaseIndex = overlay.querySelector('.startup-phase-index');
  var track = overlay.querySelector('.startup-track');
  var progressCells = Array.prototype.slice.call(overlay.querySelectorAll('.startup-progress-cell'));
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var previewPhase = '';
  try{ previewPhase = new URLSearchParams(location.search).get('startupPreview') || ''; }catch(error){}
  var beganAt = performance.now();
  var minimumLoad = reduceMotion ? 680 : 9600;
  var readyHold = reduceMotion ? 220 : 1450;
  var revealTime = reduceMotion ? 300 : 1750;
  var finished = false;
  var timers = [];
  var copyTimer = 0;
  var activePhase = 'spark';

  function savedLanguage(){
    try{
      var raw = JSON.parse(localStorage.getItem('streg_v3') || 'null');
      return raw && raw.settings && raw.settings.language === 'en' ? 'en' : 'da';
    }catch(error){
      return 'da';
    }
  }

  var copy = savedLanguage() === 'en' ? {
    aria:'STREG is loading',
    progressAria:'Loading the app',
    sparkStatus:'IGNITING THE SPARK',
    sparkDetail:'Every world begins with one tiny spark.',
    sparkPhase:'ACT I · THE SPARK',
    assemblyStatus:'BUILDING THE HEX WORLD',
    assemblyDetail:'Place by place, the map grows around you.',
    assemblyPhase:'ACT II · THE ASSEMBLY',
    routeStatus:'DRAWING YOUR ROUTE',
    routeDetail:'Your places connect into one living streak.',
    routePhase:'ACT III · THE PULSE',
    surgeStatus:'SYNCING YOUR STREAK',
    surgeDetail:'Energy, memories and progress lock together.',
    surgePhase:'ACT IV · THE SURGE',
    readyStatus:'YOUR WORLD IS READY',
    readyDetail:'Your next streak begins now.',
    readyPhase:'READY · ENTER STREG',
    portalStatus:'OPENING THE WORLD'
  } : {
    aria:'STREG indlæser',
    progressAria:'Indlæser appen',
    sparkStatus:'TÆNDER GNISTEN',
    sparkDetail:'Hver verden starter med én lille gnist.',
    sparkPhase:'AKT I · GNISTEN',
    assemblyStatus:'BYGGER HEX-VERDENEN',
    assemblyDetail:'Sted for sted vokser kortet omkring dig.',
    assemblyPhase:'AKT II · SAMLINGEN',
    routeStatus:'TEGNER DIN RUTE',
    routeDetail:'Dine steder forbindes til én levende streg.',
    routePhase:'AKT III · PULSEN',
    surgeStatus:'SYNKRONISERER DIN STREAK',
    surgeDetail:'Energi, minder og fremskridt låses sammen.',
    surgePhase:'AKT IV · ENERGIEN',
    readyStatus:'DIN VERDEN ER KLAR',
    readyDetail:'Din næste streg begynder nu.',
    readyPhase:'KLAR · TRÆD IND I STREG',
    portalStatus:'ÅBNER VERDENEN'
  };

  overlay.setAttribute('aria-label',copy.aria);
  if(track) track.setAttribute('aria-label',copy.progressAria);

  function later(fn,delay){
    var id = setTimeout(fn,delay);
    timers.push(id);
    return id;
  }

  function updateDetail(text){
    if(!detail || detail.textContent === text) return;
    clearTimeout(copyTimer);
    detail.classList.add('is-changing');
    copyTimer = setTimeout(function(){
      detail.textContent = text;
      detail.classList.remove('is-changing');
    },130);
  }

  function setPhase(name,label){
    activePhase = name;
    overlay.dataset.phase = name;
    if(phaseIndex && label) phaseIndex.textContent = label;
  }

  function progress(value,label,description){
    if(finished) return;
    var safe = Math.max(0,Math.min(100,Math.round(value)));
    overlay.style.setProperty('--startup-progress',safe + '%');
    if(percent) percent.textContent = safe + '%';
    if(status && label) status.textContent = label;
    if(kicker && label) kicker.textContent = label;
    if(description) updateDetail(description);
    if(track) track.setAttribute('aria-valuenow',String(safe));

    var filled = Math.ceil((safe / 100) * progressCells.length);
    progressCells.forEach(function(cell,index){
      cell.classList.toggle('is-filled',index < filled);
      cell.classList.toggle('is-current',safe < 100 && index === Math.max(0,filled - 1));
    });
  }

  /* A bounded canvas field gives the sequence depth without hundreds of DOM nodes. */
  var canvas = overlay.querySelector('.startup-canvas');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d',{alpha:true}) : null;
  var particles = [];
  var rafId = 0;
  var lastFrame = performance.now();
  var canvasWidth = 0;
  var canvasHeight = 0;

  function resetParticle(p,outer){
    var edge = Math.max(canvasWidth,canvasHeight);
    p.angle = Math.random() * Math.PI * 2;
    p.radius = outer ? edge * (.16 + Math.random() * .48) : 24 + Math.random() * edge * .46;
    p.speed = (.00009 + Math.random() * .00025) * (Math.random() < .5 ? -1 : 1);
    p.size = .45 + Math.random() * 1.8;
    p.alpha = .14 + Math.random() * .62;
    p.tint = Math.random();
    p.twinkle = Math.random() * Math.PI * 2;
  }

  function resizeCanvas(){
    if(!ctx || !canvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1,1.75);
    canvasWidth = Math.max(1,window.innerWidth);
    canvasHeight = Math.max(1,window.innerHeight);
    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if(!particles.length){
      var amount = canvasWidth < 500 ? 64 : 86;
      for(var i=0;i<amount;i++){
        var particle = {};
        resetParticle(particle,true);
        particles.push(particle);
      }
    }
  }

  function phasePower(){
    if(activePhase === 'assembly') return .8;
    if(activePhase === 'route') return 1.35;
    if(activePhase === 'surge') return 2.4;
    if(activePhase === 'ready') return 3.4;
    if(activePhase === 'reveal') return 7;
    return .42;
  }

  function drawParticles(now){
    if(!ctx || finished) return;
    var delta = Math.min(40,Math.max(8,now - lastFrame));
    lastFrame = now;
    var cx = canvasWidth * .5;
    var cy = canvasHeight * .43;
    var power = phasePower();
    var limit = Math.max(canvasWidth,canvasHeight) * .72;

    ctx.clearRect(0,0,canvasWidth,canvasHeight);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    particles.forEach(function(p){
      var previousAngle = p.angle;
      var previousRadius = p.radius;
      p.angle += p.speed * delta * power;
      p.twinkle += delta * .0032;
      if(activePhase === 'reveal') p.radius += delta * .34;
      else if(activePhase === 'surge' || activePhase === 'ready') p.radius += delta * .012;
      else p.radius -= delta * .0025;
      if(p.radius > limit || p.radius < 16) resetParticle(p,activePhase === 'reveal' ? false : true);

      var x = cx + Math.cos(p.angle) * p.radius;
      var y = cy + Math.sin(p.angle) * p.radius * .72;
      var px = cx + Math.cos(previousAngle) * previousRadius;
      var py = cy + Math.sin(previousAngle) * previousRadius * .72;
      var twinkle = .62 + Math.sin(p.twinkle) * .38;
      var alpha = p.alpha * twinkle * Math.min(1,power * .72);
      var color = p.tint < .22 ? '255,151,83' : (p.tint < .48 ? '74,224,255' : '164,101,255');

      ctx.strokeStyle = 'rgba(' + color + ',' + (alpha * .42) + ')';
      ctx.lineWidth = Math.max(.35,p.size * .42);
      ctx.beginPath();
      ctx.moveTo(px,py);
      ctx.lineTo(x,y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(' + color + ',' + alpha + ')';
      ctx.beginPath();
      ctx.arc(x,y,p.size * (activePhase === 'reveal' ? 1.45 : 1),0,Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
    rafId = requestAnimationFrame(drawParticles);
  }

  if(ctx && !reduceMotion){
    resizeCanvas();
    window.addEventListener('resize',resizeCanvas,{passive:true});
    rafId = requestAnimationFrame(drawParticles);
  }

  function cleanup(){
    timers.forEach(clearTimeout);
    clearTimeout(copyTimer);
    if(rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('resize',resizeCanvas);
    overlay.remove();
    document.body.classList.remove('app-preloading','startup-revealing');
    window.dispatchEvent(new CustomEvent('streg:startup-complete'));
  }

  function reveal(){
    if(finished) return;
    setPhase('reveal',copy.readyPhase);
    document.body.classList.add('startup-revealing');
    overlay.classList.remove('is-ready');
    overlay.classList.add('is-revealing');
    later(function(){
      finished = true;
      cleanup();
    },revealTime);
  }

  function ready(){
    if(finished || overlay.classList.contains('is-ready') || overlay.classList.contains('is-revealing')) return;
    setPhase('ready',copy.readyPhase);
    progress(100,copy.readyStatus,copy.readyDetail);
    overlay.classList.remove('is-loading');
    overlay.classList.add('is-ready');
    later(reveal,readyHold);
  }

  if(previewPhase){
    var previews = {
      spark:{phase:'spark',value:7,status:copy.sparkStatus,detail:copy.sparkDetail,label:copy.sparkPhase},
      assembly:{phase:'assembly',value:27,status:copy.assemblyStatus,detail:copy.assemblyDetail,label:copy.assemblyPhase},
      route:{phase:'route',value:55,status:copy.routeStatus,detail:copy.routeDetail,label:copy.routePhase},
      surge:{phase:'surge',value:83,status:copy.surgeStatus,detail:copy.surgeDetail,label:copy.surgePhase},
      ready:{phase:'ready',value:100,status:copy.readyStatus,detail:copy.readyDetail,label:copy.readyPhase}
    };
    var preview = previews[previewPhase] || previews.route;
    setPhase(preview.phase,preview.label);
    progress(preview.value,preview.status,preview.detail);
    if(preview.phase === 'ready') overlay.classList.add('is-ready');
  }else{
    setPhase('spark',copy.sparkPhase);
    progress(2,copy.sparkStatus,copy.sparkDetail);
    later(function(){ progress(7,copy.sparkStatus,copy.sparkDetail); },700);
    later(function(){ setPhase('assembly',copy.assemblyPhase); progress(15,copy.assemblyStatus,copy.assemblyDetail); },1400);
    later(function(){ progress(27,copy.assemblyStatus,copy.assemblyDetail); },2450);
    later(function(){ setPhase('route',copy.routePhase); progress(40,copy.routeStatus,copy.routeDetail); },3550);
    later(function(){ progress(55,copy.routeStatus,copy.routeDetail); },4700);
    later(function(){ setPhase('surge',copy.surgePhase); progress(70,copy.surgeStatus,copy.surgeDetail); },5900);
    later(function(){ progress(83,copy.surgeStatus,copy.surgeDetail); },7100);
    later(function(){ progress(93,copy.surgeStatus,copy.surgeDetail); },8200);
    later(function(){ progress(98,copy.portalStatus,copy.readyDetail); },9100);

    var pageReady = new Promise(function(resolve){
      if(document.readyState === 'complete') resolve();
      else window.addEventListener('load',resolve,{once:true});
    });
    var fontsReady = document.fonts && document.fonts.ready
      ? document.fonts.ready.catch(function(){})
      : Promise.resolve();

    Promise.race([
      Promise.all([pageReady,fontsReady]),
      new Promise(function(resolve){ later(resolve,10500); })
    ]).then(function(){
      later(ready,Math.max(0,minimumLoad - (performance.now() - beganAt)));
    }).catch(function(){
      later(ready,Math.max(0,minimumLoad - (performance.now() - beganAt)));
    });

    later(function(){ if(!finished) ready(); },11800);
  }
})();
