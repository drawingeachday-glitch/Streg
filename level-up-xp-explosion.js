(function(){
  'use strict';

  var lastLevel = null;
  var pendingLevels = [];
  var installedFill = null;
  var fallbackTimer = null;
  var suppressLegacyConfettiUntil = 0;
  var originalShowModal = null;
  var originalConfetti = null;
  var originalLevelupSound = null;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function state(){
    try{ return typeof S !== 'undefined' && S ? S : null; }catch(error){ return null; }
  }

  function info(xp){
    xp = Math.max(0,Number(xp) || 0);
    try{
      if(typeof levelFor === 'function') return levelFor(xp);
    }catch(error){}
    var lvl=1,need=100,total=0;
    while(xp >= total + need){ total += need; lvl += 1; need = Math.round(need*1.35); }
    return {lvl:lvl,into:xp-total,need:need};
  }

  function isLevelModal(title){
    return /^(niveau|level)\s+\d+/i.test(String(title || '').trim());
  }

  function copyFunctionState(from,to){
    try{
      Object.keys(from).forEach(function(key){ to[key] = from[key]; });
    }catch(error){}
  }

  function installLegacyGuards(){
    try{
      if(typeof showModal === 'function' && !showModal.__stregXpLevelGuard){
        originalShowModal = showModal;
        var guardedModal = function(iconName,title){
          if(isLevelModal(title)) return;
          return originalShowModal.apply(this,arguments);
        };
        copyFunctionState(originalShowModal,guardedModal);
        guardedModal.__stregXpLevelGuard = true;
        window.showModal = guardedModal;
      }
    }catch(error){}

    try{
      if(typeof confetti === 'function' && !confetti.__stregXpLevelGuard){
        originalConfetti = confetti;
        var guardedConfetti = function(count){
          var levelBurst = Date.now() < suppressLegacyConfettiUntil && (Number(count) === 80 || Number(count) === 40);
          if(levelBurst) return;
          return originalConfetti.apply(this,arguments);
        };
        guardedConfetti.__stregXpLevelGuard = true;
        window.confetti = guardedConfetti;
      }
    }catch(error){}

    try{
      if(typeof SFX !== 'undefined' && SFX && typeof SFX.levelup === 'function' && !SFX.levelup.__stregXpLevelGuard){
        originalLevelupSound = SFX.levelup;
        var guardedLevelup = function(){
          suppressLegacyConfettiUntil = Date.now() + 1500;
          return originalLevelupSound.apply(this,arguments);
        };
        guardedLevelup.__stregXpLevelGuard = true;
        SFX.levelup = guardedLevelup;
      }
    }catch(error){}
  }

  function installStyles(){
    if(document.getElementById('stregXpLevelExplosionStyles')) return;
    var style = document.createElement('style');
    style.id = 'stregXpLevelExplosionStyles';
    style.textContent = [
      '#homeStatLevelWrap.streg-level-boom{z-index:1000010!important;}',
      '#homeStatLevelWrap.streg-level-boom .streg-xp-meter{animation:stregLevelBarBoom .82s cubic-bezier(.16,.9,.2,1)!important;box-shadow:0 0 0 1px rgba(255,255,255,.28),0 0 24px rgba(159,85,255,.95),0 0 58px rgba(202,95,255,.7),0 8px 28px rgba(78,32,145,.34)!important;}',
      '#homeStatLevelWrap.streg-level-boom .streg-xp-liquid{filter:brightness(1.5) saturate(1.35)!important;box-shadow:0 0 20px rgba(255,255,255,.8),0 0 36px rgba(179,89,255,1),0 0 64px rgba(119,65,255,.72)!important;}',
      '.streg-level-ring{position:fixed;z-index:1000009;left:0;top:0;width:24px;height:24px;border:2px solid rgba(204,139,255,.9);border-radius:999px;box-shadow:0 0 14px rgba(177,89,255,.9),inset 0 0 12px rgba(255,255,255,.35);pointer-events:none;transform:translate(-50%,-50%) scale(.4);}',
      '.streg-level-particle{position:fixed;z-index:1000011;left:0;top:0;width:7px;height:12px;border-radius:3px;background:linear-gradient(180deg,#FFFFFF,#D798FF 34%,#8B55FF 100%);box-shadow:0 0 9px rgba(185,100,255,.95);pointer-events:none;transform-origin:center;}',
      '.streg-level-particle.dot{width:7px;height:7px;border-radius:50%;background:radial-gradient(circle,#fff 0 18%,#D88BFF 34%,#6B3BDA 100%);}',
      '.streg-level-label{position:fixed;z-index:1000012;left:0;top:0;display:flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid rgba(225,191,255,.62);border-radius:999px;background:linear-gradient(135deg,rgba(75,38,165,.97),rgba(166,79,244,.97));box-shadow:0 0 20px rgba(162,78,255,.72),0 9px 24px rgba(43,16,88,.28);color:#fff;font:950 9px/1 var(--font-ui,Inter,sans-serif);letter-spacing:.11em;text-transform:uppercase;text-shadow:0 1px 6px rgba(35,8,73,.65);pointer-events:none;white-space:nowrap;}',
      '.streg-level-label::before{content:"✦";color:#F5E1FF;font-size:10px;text-shadow:0 0 7px #fff;}',
      '@keyframes stregLevelBarBoom{0%{transform:scale(1)}16%{transform:scale(1.12) translateY(-1px)}35%{transform:scale(.96)}52%{transform:scale(1.08)}72%{transform:scale(.985)}100%{transform:scale(1)}}',
      '@media(prefers-reduced-motion:reduce){#homeStatLevelWrap.streg-level-boom .streg-xp-meter{animation:none!important}.streg-level-ring,.streg-level-particle{display:none!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  function removeNodeAfter(node,animation){
    if(!node) return;
    if(animation && animation.finished){
      animation.finished.catch(function(){}).then(function(){ node.remove(); });
    }else{
      setTimeout(function(){ node.remove(); },900);
    }
  }

  function explode(level){
    var host = document.getElementById('homeStatLevelWrap');
    var meter = document.getElementById('stregXpMeter');
    if(!host || !meter) return;

    var rect = meter.getBoundingClientRect();
    var cx = rect.left + rect.width*.5;
    var cy = rect.top + rect.height*.5;

    host.classList.remove('streg-level-boom');
    void host.offsetWidth;
    host.classList.add('streg-level-boom');
    setTimeout(function(){ host.classList.remove('streg-level-boom'); },900);

    var label = document.createElement('div');
    label.className = 'streg-level-label';
    label.textContent = 'LEVEL ' + level + '!';
    document.body.appendChild(label);
    var labelRect = label.getBoundingClientRect();
    label.style.left = Math.max(6,Math.min(window.innerWidth-labelRect.width-6,cx-labelRect.width*.5)) + 'px';
    label.style.top = Math.max(6,rect.top-labelRect.height-8) + 'px';

    if(reduceMotion){
      setTimeout(function(){ label.remove(); },900);
      return;
    }

    removeNodeAfter(label,label.animate([
      {transform:'translateY(7px) scale(.72)',opacity:0,filter:'blur(2px)'},
      {transform:'translateY(-4px) scale(1.08)',opacity:1,filter:'blur(0)',offset:.28},
      {transform:'translateY(-1px) scale(1)',opacity:1,filter:'blur(0)',offset:.66},
      {transform:'translateY(-10px) scale(.92)',opacity:0,filter:'blur(1px)'}
    ],{duration:1050,easing:'cubic-bezier(.16,.84,.2,1)',fill:'forwards'}));

    for(var ringIndex=0;ringIndex<3;ringIndex+=1){
      var ring = document.createElement('span');
      ring.className = 'streg-level-ring';
      ring.style.left = cx + 'px';
      ring.style.top = cy + 'px';
      document.body.appendChild(ring);
      removeNodeAfter(ring,ring.animate([
        {transform:'translate(-50%,-50%) scale(.35)',opacity:0},
        {transform:'translate(-50%,-50%) scale(.7)',opacity:.95,offset:.16},
        {transform:'translate(-50%,-50%) scale('+(4.3+ringIndex*.9)+')',opacity:0}
      ],{duration:640+ringIndex*130,delay:ringIndex*70,easing:'cubic-bezier(.12,.65,.18,1)',fill:'forwards'}));
    }

    for(var i=0;i<32;i+=1){
      var particle = document.createElement('span');
      particle.className = 'streg-level-particle' + (i%3===0 ? ' dot' : '');
      particle.style.left = (cx-3) + 'px';
      particle.style.top = (cy-4) + 'px';
      document.body.appendChild(particle);

      var angle = Math.PI*2*(i/32) + (Math.random()-.5)*.28;
      var distance = 30 + Math.random()*64;
      var dx = Math.cos(angle)*distance;
      var dy = Math.sin(angle)*distance;
      var lift = 7 + Math.random()*18;
      var rotate = (Math.random()-.5)*520;
      removeNodeAfter(particle,particle.animate([
        {transform:'translate3d(0,0,0) scale(.2) rotate(0deg)',opacity:0},
        {transform:'translate3d('+(dx*.25)+'px,'+(dy*.2-lift)+'px,0) scale(1.18) rotate('+(rotate*.25)+'deg)',opacity:1,offset:.2},
        {transform:'translate3d('+dx+'px,'+(dy-lift)+'px,0) scale(.1) rotate('+rotate+'deg)',opacity:0}
      ],{duration:520+Math.random()*420,delay:Math.random()*95,easing:'cubic-bezier(.13,.68,.18,1)',fill:'forwards'}));
    }

    try{
      if(typeof vibrate === 'function') vibrate([35,28,75]);
    }catch(error){}
  }

  function armLevels(oldLevel,newLevel){
    if(newLevel <= oldLevel) return;
    for(var level=oldLevel+1;level<=newLevel;level+=1) pendingLevels.push(level);
    clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(function(){
      if(pendingLevels.length){
        var next = pendingLevels.shift();
        explode(next);
      }
    },2600);
  }

  function checkLevel(){
    var app = state();
    if(!app) return;
    var currentLevel = info(app.xp).lvl;
    if(lastLevel === null){
      lastLevel = currentLevel;
      return;
    }
    if(currentLevel > lastLevel) armLevels(lastLevel,currentLevel);
    else if(currentLevel < lastLevel) pendingLevels.length = 0;
    lastLevel = currentLevel;
  }

  function onFillTransition(event){
    if(event.propertyName !== 'width' || !pendingLevels.length) return;
    var fill = event.currentTarget;
    if(parseFloat(fill.style.width || '0') < 99.5) return;
    clearTimeout(fallbackTimer);
    var next = pendingLevels.shift();
    explode(next);
    if(pendingLevels.length){
      fallbackTimer = setTimeout(function(){
        if(pendingLevels.length) explode(pendingLevels.shift());
      },1700);
    }
  }

  function bindFill(){
    var fill = document.getElementById('stregXpLiquid');
    if(!fill || fill === installedFill) return;
    if(installedFill) installedFill.removeEventListener('transitionend',onFillTransition);
    installedFill = fill;
    installedFill.addEventListener('transitionend',onFillTransition);
  }

  function install(){
    installStyles();
    installLegacyGuards();
    bindFill();
    checkLevel();
  }

  window.StregLevelUpExplosion = {
    explode:explode,
    refresh:install
  };

  window.addEventListener('streg:startup-complete',install);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  setTimeout(install,700);
  setInterval(function(){
    installLegacyGuards();
    bindFill();
    checkLevel();
  },120);
})();
