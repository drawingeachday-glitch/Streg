(function(){
  'use strict';

  var lastXp = null;
  var queue = [];
  var running = false;
  var lastPointer = null;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function state(){
    try{ return typeof S !== 'undefined' && S ? S : null; }catch(error){ return null; }
  }

  function levelInfo(xp){
    xp = Math.max(0,Number(xp) || 0);
    try{
      if(typeof levelFor === 'function') return levelFor(xp);
    }catch(error){}

    var lvl = 1;
    var need = 100;
    var total = 0;
    while(xp >= total + need){
      total += need;
      lvl += 1;
      need = Math.round(need * 1.35);
    }
    return {lvl:lvl,into:xp-total,need:need,title:''};
  }

  function installStyles(){
    if(document.getElementById('stregLiquidXpStyles')) return;
    var style = document.createElement('style');
    style.id = 'stregLiquidXpStyles';
    style.textContent = [
      '#homeStatLevelWrap.streg-xp-host{position:relative!important;width:132px!important;min-width:132px!important;height:26px!important;min-height:26px!important;padding:0!important;gap:0!important;overflow:visible!important;}',
      '#homeStatLevelWrap.streg-xp-host>.icn,#homeStatLevelWrap.streg-xp-host>#homeStatLevel{position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;overflow:hidden!important;white-space:nowrap!important;}',
      '.streg-xp-meter{position:relative;display:block;width:132px;height:26px;border:1px solid rgba(132,94,246,.28);border-radius:999px;background:linear-gradient(180deg,rgba(35,25,55,.92),rgba(22,17,36,.94));box-shadow:inset 0 1px rgba(255,255,255,.08),inset 0 -7px 16px rgba(20,10,45,.25),0 5px 13px -9px rgba(87,52,180,.75);overflow:hidden;isolation:isolate;}',
      '[data-theme="light"] .streg-xp-meter{background:linear-gradient(180deg,#F2EDFF,#E8DFFF);border-color:rgba(117,78,224,.26);box-shadow:inset 0 1px rgba(255,255,255,.82),inset 0 -7px 15px rgba(92,48,188,.08),0 5px 13px -10px rgba(87,52,180,.55);}',
      '.streg-xp-liquid{position:absolute;z-index:1;left:2px;top:2px;bottom:2px;width:0;border-radius:999px;background:linear-gradient(90deg,#5130C7 0%,#7350E9 34%,#9A63FF 70%,#C478FF 100%);box-shadow:0 0 12px rgba(126,82,255,.52),0 0 22px rgba(187,100,255,.2),inset 0 1px rgba(255,255,255,.42);overflow:hidden;will-change:width;}',
      '.streg-xp-liquid::before{content:"";position:absolute;inset:-8px -22px;background:radial-gradient(circle at 11px 9px,rgba(255,255,255,.42) 0 2px,transparent 2.7px),radial-gradient(circle at 31px 18px,rgba(255,255,255,.22) 0 1.8px,transparent 2.5px),radial-gradient(circle at 49px 8px,rgba(255,255,255,.18) 0 1.4px,transparent 2.1px);background-size:56px 27px;opacity:.72;animation:stregXpLiquidDrift 2.4s linear infinite;}',
      '.streg-xp-liquid::after{content:"";position:absolute;left:0;right:0;top:1px;height:38%;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.48),rgba(255,255,255,.04));opacity:.62;}',
      '.streg-xp-meter-copy{position:absolute;z-index:3;inset:0;display:flex;align-items:center;justify-content:space-between;gap:7px;padding:0 9px;pointer-events:none;color:#fff;font-family:var(--font-ui,Inter,sans-serif);font-variant-numeric:tabular-nums;text-shadow:0 1px 5px rgba(25,8,58,.72);}',
      '[data-theme="light"] .streg-xp-meter-copy{color:#37245D;text-shadow:0 1px rgba(255,255,255,.72);mix-blend-mode:normal;}',
      '.streg-xp-level{font-size:8.5px;font-weight:950;letter-spacing:.055em;white-space:nowrap;}',
      '.streg-xp-count{font-size:8px;font-weight:850;letter-spacing:-.01em;white-space:nowrap;opacity:.9;}',
      '.streg-xp-meter::after{content:"";position:absolute;z-index:2;inset:1px;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);}',
      '#homeStatLevelWrap.streg-xp-impact .streg-xp-meter{animation:stregXpMeterImpact .68s cubic-bezier(.18,.86,.24,1);}',
      '#homeStatLevelWrap.streg-xp-impact .streg-xp-liquid{filter:brightness(1.18) saturate(1.2);box-shadow:0 0 18px rgba(128,83,255,.85),0 0 34px rgba(202,103,255,.42),inset 0 1px rgba(255,255,255,.55);}',
      '.streg-xp-flight{position:fixed;z-index:1000008;left:0;top:0;display:flex;align-items:center;gap:6px;padding:7px 10px;border:1px solid rgba(222,185,255,.42);border-radius:999px;color:#fff;background:linear-gradient(135deg,rgba(83,44,190,.96),rgba(178,85,255,.96));box-shadow:0 0 18px rgba(144,78,255,.62),0 8px 25px rgba(36,13,80,.32);font:900 10px/1 var(--font-ui,Inter,sans-serif);letter-spacing:.02em;pointer-events:none;will-change:transform,opacity,filter;}',
      '.streg-xp-flight::before{content:"✦";font-size:11px;color:#F2D9FF;text-shadow:0 0 8px #fff;}',
      '.streg-xp-spark{position:fixed;z-index:1000007;width:6px;height:6px;border-radius:50%;background:radial-gradient(circle,#fff 0 20%,#C57BFF 32%,#7248FF 72%);box-shadow:0 0 8px rgba(185,104,255,.9);pointer-events:none;}',
      '@keyframes stregXpLiquidDrift{from{transform:translateX(-28px) translateY(0)}50%{transform:translateX(0) translateY(-2px)}to{transform:translateX(28px) translateY(0)}}',
      '@keyframes stregXpMeterImpact{0%{transform:scale(1)}28%{transform:scale(1.06);box-shadow:0 0 0 4px rgba(142,88,255,.12),0 0 26px rgba(174,90,255,.42)}62%{transform:scale(.988)}100%{transform:scale(1)}}',
      '@media(max-width:390px){#homeStatLevelWrap.streg-xp-host{width:116px!important;min-width:116px!important}.streg-xp-meter{width:116px}.streg-xp-meter-copy{padding:0 8px}.streg-xp-level{font-size:8px}.streg-xp-count{font-size:7.5px}}',
      '@media(max-width:350px){#homeStatLevelWrap.streg-xp-host{width:105px!important;min-width:105px!important}.streg-xp-meter{width:105px}.streg-xp-count{font-size:7px}}',
      '@media(prefers-reduced-motion:reduce){.streg-xp-liquid::before{animation:none!important}#homeStatLevelWrap.streg-xp-impact .streg-xp-meter{animation:none!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  function refs(){
    var host = document.getElementById('homeStatLevelWrap');
    if(!host) return null;

    var meter = document.getElementById('stregXpMeter');
    if(!meter){
      host.classList.add('streg-xp-host');
      meter = document.createElement('span');
      meter.id = 'stregXpMeter';
      meter.className = 'streg-xp-meter';
      meter.innerHTML =
        '<span class="streg-xp-liquid" id="stregXpLiquid"></span>' +
        '<span class="streg-xp-meter-copy">' +
          '<span class="streg-xp-level" id="stregXpLevel">LV 1</span>' +
          '<span class="streg-xp-count" id="stregXpCount">0 / 100</span>' +
        '</span>';
      host.appendChild(meter);
    }

    return {
      host:host,
      meter:meter,
      fill:document.getElementById('stregXpLiquid'),
      level:document.getElementById('stregXpLevel'),
      count:document.getElementById('stregXpCount')
    };
  }

  function setAccessible(host,info){
    if(!host || !info) return;
    host.setAttribute('aria-label',info.into + ' of ' + info.need + ' XP toward level ' + (info.lvl + 1));
  }

  function paint(xp,transition){
    var ui = refs();
    if(!ui) return;
    var info = levelInfo(xp);
    var pct = info.need > 0 ? Math.max(0,Math.min(100,(info.into / info.need) * 100)) : 0;
    ui.fill.style.transition = transition || 'none';
    ui.fill.style.width = pct + '%';
    ui.level.textContent = 'LV ' + info.lvl;
    ui.count.textContent = Math.round(info.into) + ' / ' + info.need;
    setAccessible(ui.host,info);
  }

  function wait(ms){
    return new Promise(function(resolve){ setTimeout(resolve,ms); });
  }

  function tweenCount(from,to,duration,level){
    var ui = refs();
    if(!ui) return Promise.resolve();
    var start = performance.now();
    duration = Math.max(1,duration || 1);
    return new Promise(function(resolve){
      function frame(now){
        var p = Math.min(1,(now-start)/duration);
        var eased = 1 - Math.pow(1-p,3);
        var value = Math.round(from + (to-from)*eased);
        ui.level.textContent = 'LV ' + level;
        ui.count.textContent = value + ' / ' + levelInfoForLevel(level).need;
        if(p < 1) requestAnimationFrame(frame); else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  function levelInfoForLevel(level){
    var need = 100;
    var lvl = 1;
    while(lvl < level){
      need = Math.round(need * 1.35);
      lvl += 1;
    }
    return {lvl:level,need:need};
  }

  function animateFill(fromPct,toPct,duration){
    var ui = refs();
    if(!ui) return Promise.resolve();
    if(reduceMotion){
      ui.fill.style.transition = 'none';
      ui.fill.style.width = toPct + '%';
      return Promise.resolve();
    }

    ui.fill.style.transition = 'none';
    ui.fill.style.width = fromPct + '%';
    void ui.fill.offsetWidth;
    ui.fill.style.transition = 'width ' + duration + 'ms cubic-bezier(.18,.82,.2,1)';
    ui.fill.style.width = toPct + '%';
    return wait(duration + 30);
  }

  function sourcePoint(){
    if(lastPointer && Date.now() - lastPointer.time < 1800){
      return {x:lastPointer.x,y:lastPointer.y};
    }
    return {x:window.innerWidth * .5,y:window.innerHeight * .66};
  }

  function flyXp(amount){
    if(reduceMotion || !amount) return Promise.resolve();
    var ui = refs();
    if(!ui) return Promise.resolve();
    var target = ui.meter.getBoundingClientRect();
    var from = sourcePoint();
    var to = {x:target.left + target.width*.56,y:target.top + target.height*.5};
    var fly = document.createElement('div');
    fly.className = 'streg-xp-flight';
    fly.textContent = '+' + amount + ' XP';
    document.body.appendChild(fly);

    var dx = to.x - from.x;
    var dy = to.y - from.y;
    var curve = Math.max(-80,Math.min(80,dx*.12));
    var anim = fly.animate([
      {transform:'translate3d(' + from.x + 'px,' + from.y + 'px,0) scale(.68)',opacity:0,filter:'blur(1px)'},
      {transform:'translate3d(' + (from.x + dx*.22 + curve) + 'px,' + (from.y + dy*.28 - 44) + 'px,0) scale(1.04)',opacity:1,filter:'blur(0)',offset:.28},
      {transform:'translate3d(' + (from.x + dx*.72 - curve*.25) + 'px,' + (from.y + dy*.72 - 18) + 'px,0) scale(.82)',opacity:1,filter:'blur(0)',offset:.76},
      {transform:'translate3d(' + to.x + 'px,' + to.y + 'px,0) scale(.25)',opacity:0,filter:'blur(2px)'}
    ],{duration:690,easing:'cubic-bezier(.22,.76,.22,1)',fill:'forwards'});

    return anim.finished.catch(function(){}).then(function(){ fly.remove(); });
  }

  function burst(){
    var ui = refs();
    if(!ui) return;
    ui.host.classList.remove('streg-xp-impact');
    void ui.host.offsetWidth;
    ui.host.classList.add('streg-xp-impact');
    setTimeout(function(){ ui.host.classList.remove('streg-xp-impact'); },720);

    if(reduceMotion) return;
    var r = ui.meter.getBoundingClientRect();
    var cx = r.left + r.width*.58;
    var cy = r.top + r.height*.5;
    for(var i=0;i<10;i+=1){
      var spark = document.createElement('span');
      spark.className = 'streg-xp-spark';
      spark.style.left = (cx-3) + 'px';
      spark.style.top = (cy-3) + 'px';
      document.body.appendChild(spark);
      var angle = (Math.PI*2*i/10) + (Math.random()-.5)*.34;
      var distance = 18 + Math.random()*28;
      var x = Math.cos(angle)*distance;
      var y = Math.sin(angle)*distance;
      spark.animate([
        {transform:'translate3d(0,0,0) scale(.35)',opacity:0},
        {transform:'translate3d('+(x*.35)+'px,'+(y*.35)+'px,0) scale(1)',opacity:1,offset:.22},
        {transform:'translate3d('+x+'px,'+y+'px,0) scale(.15)',opacity:0}
      ],{duration:500+Math.random()*240,easing:'cubic-bezier(.12,.7,.2,1)',fill:'forwards'}).finished.catch(function(){}).then((function(node){ return function(){ node.remove(); }; })(spark));
    }
  }

  async function animateGain(fromXp,toXp){
    if(toXp <= fromXp){ paint(toXp); return; }
    await flyXp(Math.round(toXp-fromXp));
    burst();

    var cursor = fromXp;
    while(cursor < toXp){
      var info = levelInfo(cursor);
      var levelStart = cursor - info.into;
      var threshold = levelStart + info.need;
      var segmentEnd = Math.min(toXp,threshold);
      var fromInto = info.into;
      var endInto = fromInto + (segmentEnd-cursor);
      var fromPct = info.need ? (fromInto/info.need)*100 : 0;
      var toPct = info.need ? Math.min(100,(endInto/info.need)*100) : 100;
      var duration = reduceMotion ? 1 : Math.max(520,Math.min(980,500 + (segmentEnd-cursor)*3.2));

      var ui = refs();
      if(ui){
        ui.level.textContent = 'LV ' + info.lvl;
        ui.count.textContent = Math.round(fromInto) + ' / ' + info.need;
        setAccessible(ui.host,info);
      }

      await Promise.all([
        animateFill(fromPct,toPct,duration),
        tweenCount(fromInto,endInto,duration,info.lvl)
      ]);

      cursor = segmentEnd;

      if(segmentEnd === threshold){
        burst();
        await wait(reduceMotion ? 1 : 140);
        paint(segmentEnd);
        await wait(reduceMotion ? 1 : 90);
      }
    }

    paint(toXp,'none');
  }

  function enqueue(fromXp,toXp){
    queue.push({from:fromXp,to:toXp});
    runQueue();
  }

  async function runQueue(){
    if(running) return;
    running = true;
    while(queue.length){
      var job = queue.shift();
      try{ await animateGain(job.from,job.to); }catch(error){ paint(job.to); }
    }
    running = false;
  }

  function checkXp(){
    var app = state();
    if(!app) return;
    var current = Math.max(0,Number(app.xp) || 0);

    if(lastXp === null){
      lastXp = current;
      paint(current);
      return;
    }

    if(current > lastXp){
      enqueue(lastXp,current);
      lastXp = current;
    }else if(current < lastXp){
      queue.length = 0;
      lastXp = current;
      paint(current);
    }
  }

  function install(){
    installStyles();
    refs();
    checkXp();
  }

  document.addEventListener('pointerdown',function(event){
    if(typeof event.clientX !== 'number' || typeof event.clientY !== 'number') return;
    lastPointer = {x:event.clientX,y:event.clientY,time:Date.now()};
  },{capture:true,passive:true});

  window.StregXpBar = {
    refresh:function(){ var app=state(); if(app) paint(app.xp); },
    burst:burst
  };

  window.addEventListener('streg:startup-complete',install);
  window.addEventListener('streg:languagechange',install);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  setTimeout(install,650);
  setInterval(checkXp,120);
})();
