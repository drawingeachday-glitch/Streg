(function(){
  'use strict';

  function isEnglish(){
    try{ return window.I18n && window.I18n.getLanguage && window.I18n.getLanguage() === 'en'; }catch(error){}
    return document.documentElement.lang === 'en';
  }

  function text(da,en){ return isEnglish() ? en : da; }

  function installStyles(){
    if(document.getElementById('eventTabRedesignStyles')) return;
    var style = document.createElement('style');
    style.id = 'eventTabRedesignStyles';
    style.textContent = [
      '#pane-ch-event.event-v3{--event-v3-surface:color-mix(in srgb,var(--card) 96%,var(--event-primary) 4%);--event-v3-soft:color-mix(in srgb,var(--card) 88%,var(--event-primary) 12%);--event-v3-line:color-mix(in srgb,var(--event-primary) 18%,var(--line));padding:0 0 24px!important;background:transparent!important;}',
      '#pane-ch-event.event-v3 .event-aurora,#pane-ch-event.event-v3 .event-stars,#pane-ch-event.event-v3 .event-prism{display:none!important;}',
      '#pane-ch-event.event-v3 .event-hero{position:relative!important;min-height:0!important;margin:0 0 14px!important;padding:20px!important;border:1px solid rgba(255,255,255,.15)!important;border-radius:30px!important;color:#fff!important;background:radial-gradient(circle at 84% 10%,rgba(var(--event-accent-rgb),.25),transparent 24%),radial-gradient(circle at 12% 90%,rgba(var(--event-secondary-rgb),.22),transparent 31%),linear-gradient(145deg,rgb(var(--event-deep-rgb)) 0%,color-mix(in srgb,rgb(var(--event-deep-rgb)) 76%,var(--event-primary)) 53%,color-mix(in srgb,var(--event-primary) 60%,#101026) 100%)!important;box-shadow:0 28px 64px -36px rgba(var(--event-primary-rgb),.92),0 12px 30px rgba(8,4,22,.24)!important;overflow:hidden!important;isolation:isolate!important;}',
      '#pane-ch-event.event-v3 .event-hero::before{content:""!important;position:absolute!important;z-index:-1!important;inset:0!important;opacity:.55!important;pointer-events:none!important;background:radial-gradient(circle at 78% 18%,rgba(255,255,255,.5) 0 1px,transparent 1.6px),radial-gradient(circle at 88% 34%,rgba(255,255,255,.3) 0 1px,transparent 1.5px),radial-gradient(circle at 64% 43%,rgba(255,255,255,.24) 0 1px,transparent 1.4px),linear-gradient(115deg,transparent 0 46%,rgba(255,255,255,.045) 46.4% 46.8%,transparent 47.2% 100%)!important;background-size:83px 83px,121px 121px,96px 96px,auto!important;mask-image:none!important;}',
      '#pane-ch-event.event-v3 .event-hero::after{content:""!important;position:absolute!important;z-index:-1!important;right:-86px!important;top:-92px!important;width:260px!important;height:260px!important;border:1px solid rgba(var(--event-accent-rgb),.18)!important;border-radius:50%!important;background:repeating-conic-gradient(from 10deg,rgba(var(--event-accent-rgb),.10) 0 8deg,transparent 8deg 25deg)!important;opacity:.75!important;animation:eventV3Orbit 28s linear infinite!important;}',
      '#pane-ch-event.event-v3 .event-topline{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;margin:0 0 18px!important;}',
      '#pane-ch-event.event-v3 .event-live-lockup{display:inline-flex!important;align-items:center!important;gap:8px!important;min-width:0!important;padding:7px 10px!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:999px!important;background:rgba(255,255,255,.07)!important;backdrop-filter:blur(10px)!important;}',
      '#pane-ch-event.event-v3 .event-live-dot{width:7px!important;height:7px!important;flex:0 0 7px!important;background:var(--event-accent)!important;box-shadow:0 0 0 4px rgba(var(--event-accent-rgb),.1),0 0 16px rgba(var(--event-accent-rgb),.88)!important;}',
      '#pane-ch-event.event-v3 .event-label{color:rgba(255,255,255,.74)!important;font-size:8px!important;font-weight:950!important;letter-spacing:.14em!important;}',
      '#pane-ch-event.event-v3 .event-days{display:grid!important;justify-items:end!important;gap:3px!important;padding:0!important;border:0!important;background:transparent!important;}',
      '#pane-ch-event.event-v3 .event-days span{color:rgba(255,255,255,.45)!important;font-size:7px!important;font-weight:900!important;letter-spacing:.14em!important;}',
      '#pane-ch-event.event-v3 .event-days strong{color:#fff!important;font-size:11px!important;font-weight:950!important;}',
      '#pane-ch-event.event-v3 .event-hero-main{display:grid!important;grid-template-columns:minmax(0,1fr) 142px!important;align-items:center!important;gap:18px!important;min-height:142px!important;margin:0!important;}',
      '#pane-ch-event.event-v3 .event-season-code{display:inline-flex!important;align-items:center!important;gap:7px!important;margin:0 0 10px!important;color:var(--event-accent)!important;font-size:8px!important;font-weight:950!important;letter-spacing:.16em!important;}',
      '#pane-ch-event.event-v3 .event-hero-main h2{max-width:510px!important;margin:0!important;color:#fff!important;font-family:var(--font-display)!important;font-size:clamp(34px,8vw,52px)!important;font-weight:900!important;line-height:.92!important;letter-spacing:-.055em!important;text-wrap:balance!important;text-shadow:0 14px 40px rgba(0,0,0,.22)!important;}',
      '#pane-ch-event.event-v3 .event-intro{max-width:520px!important;margin:13px 0 0!important;color:rgba(255,255,255,.65)!important;font-size:11px!important;font-weight:650!important;line-height:1.5!important;}',
      '#pane-ch-event.event-v3 .event-celestial{position:relative!important;display:grid!important;place-items:center!important;width:136px!important;height:136px!important;justify-self:end!important;filter:drop-shadow(0 18px 28px rgba(0,0,0,.28))!important;}',
      '#pane-ch-event.event-v3 .event-orbit{position:absolute!important;inset:6px!important;border:1px solid rgba(var(--event-accent-rgb),.34)!important;border-radius:50%!important;animation:eventV3Orbit 14s linear infinite!important;}',
      '#pane-ch-event.event-v3 .event-orbit-two{inset:22px!important;border-style:dashed!important;border-color:rgba(255,255,255,.25)!important;animation-duration:8s!important;animation-direction:reverse!important;}',
      '#pane-ch-event.event-v3 .event-orbit-three{inset:16px 31px!important;border-color:rgba(var(--event-secondary-rgb),.31)!important;transform:rotate(61deg)!important;animation-duration:19s!important;}',
      '#pane-ch-event.event-v3 .event-celestial-core{position:relative!important;z-index:3!important;display:grid!important;place-items:center!important;width:64px!important;height:64px!important;border:1px solid rgba(255,255,255,.36)!important;border-radius:22px!important;color:#fff!important;background:radial-gradient(circle at 28% 22%,rgba(255,255,255,.62),transparent 22%),linear-gradient(145deg,var(--event-accent),var(--event-primary) 53%,var(--event-secondary))!important;box-shadow:0 0 0 9px rgba(var(--event-primary-rgb),.1),0 0 38px rgba(var(--event-accent-rgb),.44),inset 0 1px rgba(255,255,255,.42)!important;font-size:27px!important;transform:rotate(9deg)!important;animation:eventV3Float 3.4s ease-in-out infinite!important;}',
      '#pane-ch-event.event-v3 .event-celestial-pulse{position:absolute!important;inset:38px!important;border:1px solid rgba(255,255,255,.4)!important;border-radius:20px!important;animation:eventV3Pulse 2.5s ease-out infinite!important;}',
      '#pane-ch-event.event-v3 .event-v3-progress-card{position:relative!important;z-index:3!important;margin-top:20px!important;padding:15px 16px 11px!important;border:1px solid rgba(255,255,255,.13)!important;border-radius:22px!important;background:linear-gradient(145deg,rgba(255,255,255,.11),rgba(255,255,255,.045))!important;box-shadow:inset 0 1px rgba(255,255,255,.08)!important;backdrop-filter:blur(15px)!important;}',
      '#pane-ch-event.event-v3 .event-xp-dashboard{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:10px!important;margin:0!important;}',
      '#pane-ch-event.event-v3 .event-xp-primary{min-width:0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;}',
      '#pane-ch-event.event-v3 .event-xp-primary>span{color:rgba(255,255,255,.45)!important;font-size:7px!important;font-weight:950!important;letter-spacing:.15em!important;}',
      '#pane-ch-event.event-v3 .event-xp-primary>div{display:flex!important;align-items:baseline!important;gap:6px!important;margin-top:6px!important;}',
      '#pane-ch-event.event-v3 .event-xp-primary strong{color:#fff!important;font-size:25px!important;font-weight:950!important;letter-spacing:-.05em!important;}',
      '#pane-ch-event.event-v3 .event-xp-primary small{color:rgba(255,255,255,.48)!important;font-size:9px!important;font-weight:850!important;}',
      '#pane-ch-event.event-v3 .event-rank-card{min-width:82px!important;padding:8px 10px!important;border:1px solid rgba(255,255,255,.11)!important;border-radius:14px!important;background:rgba(3,2,13,.22)!important;text-align:right!important;backdrop-filter:none!important;}',
      '#pane-ch-event.event-v3 .event-rank-card span,#pane-ch-event.event-v3 .event-rank-card small{color:rgba(255,255,255,.43)!important;font-size:6px!important;font-weight:900!important;letter-spacing:.12em!important;}',
      '#pane-ch-event.event-v3 .event-rank-card strong{display:block!important;margin:5px 0 3px!important;color:#fff!important;font-size:17px!important;font-weight:950!important;}',
      '#pane-ch-event.event-v3 .event-level-line{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;margin:13px 1px 0!important;color:rgba(255,255,255,.46)!important;font-size:8px!important;font-weight:800!important;}',
      '#pane-ch-event.event-v3 .event-level-line strong{color:rgba(255,255,255,.78)!important;font-weight:900!important;}',
      '#pane-ch-event.event-v3 .event-progress-shell{position:relative!important;margin:0!important;padding:43px 0 54px!important;}',
      '#pane-ch-event.event-v3 .event-progress-track{position:relative!important;height:15px!important;border:1px solid rgba(255,255,255,.15)!important;border-radius:999px!important;background:rgba(2,1,10,.54)!important;box-shadow:inset 0 3px 8px rgba(0,0,0,.48),0 0 0 4px rgba(255,255,255,.025)!important;overflow:visible!important;}',
      '#pane-ch-event.event-v3 .event-progress-track::before{content:""!important;position:absolute!important;inset:3px!important;border-radius:inherit!important;background:repeating-linear-gradient(90deg,rgba(255,255,255,.028) 0 1px,transparent 1px 24px)!important;}',
      '#pane-ch-event.event-v3 .event-progress-fill{height:100%!important;border-radius:inherit!important;background:linear-gradient(90deg,var(--event-primary),var(--event-secondary) 55%,var(--event-accent))!important;box-shadow:0 0 20px rgba(var(--event-primary-rgb),.62),0 0 34px rgba(var(--event-accent-rgb),.22)!important;}',
      '#pane-ch-event.event-v3 .event-progress-glow{width:30px!important;height:30px!important;border:6px solid rgba(var(--event-accent-rgb),.22)!important;background:rgba(255,255,255,.94)!important;box-shadow:0 0 9px #fff,0 0 23px rgba(var(--event-accent-rgb),.88),0 0 42px rgba(var(--event-primary-rgb),.82)!important;}',
      '#pane-ch-event.event-v3 .event-progress-marker{top:31px!important;width:62px!important;gap:5px!important;}',
      '#pane-ch-event.event-v3 .event-progress-node{width:42px!important;height:42px!important;border:2px solid rgba(255,255,255,.13)!important;background:rgba(9,5,24,.94)!important;box-shadow:0 10px 22px rgba(0,0,0,.3)!important;}',
      '#pane-ch-event.event-v3 .event-progress-node.unlocked,#pane-ch-event.event-v3 .event-progress-node.active{border-color:rgba(255,255,255,.4)!important;background:linear-gradient(145deg,var(--event-primary),var(--event-secondary) 62%,var(--event-accent))!important;box-shadow:0 10px 25px rgba(var(--event-primary-rgb),.46),0 0 22px rgba(var(--event-accent-rgb),.3)!important;}',
      '#pane-ch-event.event-v3 .event-progress-footer{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;margin-top:-4px!important;color:rgba(255,255,255,.43)!important;font-size:7.5px!important;font-weight:800!important;}',
      '#pane-ch-event.event-v3 .event-progress-footer strong{color:rgba(255,255,255,.75)!important;}',
      '#pane-ch-event.event-v3 .event-test-row{display:none!important;}',
      '#pane-ch-event.event-v3 .event-season-stats{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9px!important;margin:0 0 16px!important;}',
      '#pane-ch-event.event-v3 .event-season-stat{position:relative!important;min-height:78px!important;padding:14px 13px 13px 45px!important;border:1px solid var(--event-v3-line)!important;border-radius:19px!important;color:var(--ink)!important;background:var(--event-v3-surface)!important;box-shadow:0 12px 28px -24px rgba(22,36,43,.55)!important;overflow:hidden!important;}',
      '#pane-ch-event.event-v3 .event-season-stat::before{content:""!important;position:absolute!important;left:14px!important;top:15px!important;width:20px!important;height:20px!important;border-radius:7px!important;background:linear-gradient(145deg,var(--event-primary),var(--event-secondary))!important;box-shadow:0 7px 16px -9px rgba(var(--event-primary-rgb),.75)!important;}',
      '#pane-ch-event.event-v3 .event-season-stat span{display:block!important;color:var(--ink-soft)!important;font-size:7px!important;font-weight:950!important;letter-spacing:.1em!important;}',
      '#pane-ch-event.event-v3 .event-season-stat strong{display:block!important;margin-top:7px!important;color:var(--ink)!important;font-family:var(--font-display)!important;font-size:17px!important;font-weight:900!important;line-height:1.05!important;}',
      '#pane-ch-event.event-v3 .event-zone{position:relative!important;margin:0 0 16px!important;padding:18px!important;border:1px solid var(--event-v3-line)!important;border-radius:25px!important;color:var(--ink)!important;background:var(--event-v3-surface)!important;box-shadow:0 18px 40px -32px rgba(22,36,43,.68)!important;overflow:hidden!important;}',
      '#pane-ch-event.event-v3 .event-zone-glow{display:none!important;}',
      '#pane-ch-event.event-v3 .event-section-head{display:flex!important;align-items:end!important;justify-content:space-between!important;gap:14px!important;margin:0 0 15px!important;}',
      '#pane-ch-event.event-v3 .event-section-kicker{display:block!important;margin:0 0 5px!important;color:var(--event-primary)!important;font-size:8px!important;font-weight:950!important;letter-spacing:.14em!important;}',
      '#pane-ch-event.event-v3 .event-section-head h3{margin:0!important;color:var(--ink)!important;font-family:var(--font-display)!important;font-size:23px!important;font-weight:900!important;letter-spacing:-.025em!important;}',
      '#pane-ch-event.event-v3 .event-section-head>strong{flex:0 0 auto!important;padding:6px 9px!important;border:1px solid var(--event-v3-line)!important;border-radius:999px!important;color:var(--event-primary)!important;background:var(--event-v3-soft)!important;font-size:8px!important;font-weight:950!important;}',
      '#pane-ch-event.event-v3 #eventRewardTrack{display:flex!important;gap:11px!important;margin:0 -2px!important;padding:2px 2px 8px!important;overflow-x:auto!important;scroll-snap-type:x mandatory!important;scrollbar-width:none!important;}',
      '#pane-ch-event.event-v3 #eventRewardTrack::-webkit-scrollbar{display:none!important;}',
      '#pane-ch-event.event-v3 #eventRewardTrack>*{flex:0 0 172px!important;min-height:156px!important;margin:0!important;padding:15px!important;border:1px solid var(--event-v3-line)!important;border-radius:20px!important;color:var(--ink)!important;background:linear-gradient(145deg,var(--card),var(--event-v3-soft))!important;box-shadow:0 12px 26px -24px rgba(22,36,43,.65)!important;scroll-snap-align:start!important;}',
      '#pane-ch-event.event-v3 #eventRewardTrack>*:first-child{border-color:color-mix(in srgb,var(--event-primary) 36%,var(--line))!important;box-shadow:0 15px 30px -24px rgba(var(--event-primary-rgb),.65)!important;}',
      '#pane-ch-event.event-v3 #eventDailyList{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;}',
      '#pane-ch-event.event-v3 #eventDailyList>*{position:relative!important;min-height:118px!important;margin:0!important;padding:16px 54px 16px 16px!important;border:1px solid var(--event-v3-line)!important;border-radius:20px!important;color:var(--ink)!important;background:linear-gradient(145deg,var(--card),var(--event-v3-soft))!important;box-shadow:0 12px 28px -25px rgba(22,36,43,.66)!important;overflow:hidden!important;}',
      '#pane-ch-event.event-v3 #eventDailyList>*::after{content:"›"!important;position:absolute!important;right:16px!important;top:50%!important;display:grid!important;place-items:center!important;width:34px!important;height:34px!important;border-radius:50%!important;color:var(--event-primary)!important;background:var(--card)!important;box-shadow:0 9px 20px -14px rgba(22,36,43,.6)!important;font-size:24px!important;line-height:1!important;transform:translateY(-50%)!important;}',
      '#pane-ch-event.event-v3 #eventDailyList>* button{border-radius:12px!important;}',
      '#pane-ch-event.event-v3 .event-info-card{display:grid!important;grid-template-columns:52px minmax(0,1fr)!important;align-items:start!important;gap:14px!important;margin:0!important;padding:17px!important;border:1px solid var(--event-v3-line)!important;border-radius:22px!important;color:var(--ink)!important;background:linear-gradient(145deg,var(--event-v3-soft),var(--card))!important;box-shadow:0 14px 32px -28px rgba(22,36,43,.62)!important;}',
      '#pane-ch-event.event-v3 .event-info-icon{display:grid!important;place-items:center!important;width:52px!important;height:52px!important;border:1px solid color-mix(in srgb,var(--event-primary) 28%,transparent)!important;border-radius:17px!important;color:#fff!important;background:linear-gradient(145deg,var(--event-primary),var(--event-secondary))!important;box-shadow:0 12px 25px -16px rgba(var(--event-primary-rgb),.72)!important;font-size:22px!important;}',
      '#pane-ch-event.event-v3 .event-info-kicker{display:block!important;margin:1px 0 5px!important;color:var(--event-primary)!important;font-size:8px!important;font-weight:950!important;letter-spacing:.13em!important;}',
      '#pane-ch-event.event-v3 .event-info-card strong{display:block!important;color:var(--ink)!important;font-size:15px!important;font-weight:900!important;}',
      '#pane-ch-event.event-v3 .event-info-card p{margin:7px 0 0!important;color:var(--ink-soft)!important;font-size:10px!important;font-weight:600!important;line-height:1.45!important;}',
      '@keyframes eventV3Orbit{to{transform:rotate(360deg)}}',
      '@keyframes eventV3Float{0%,100%{transform:translateY(0) rotate(9deg)}50%{transform:translateY(-7px) rotate(13deg)}}',
      '@keyframes eventV3Pulse{0%{opacity:.75;transform:scale(.76)}100%{opacity:0;transform:scale(1.45)}}',
      '@media(max-width:680px){#pane-ch-event.event-v3 .event-hero{padding:17px!important;border-radius:25px!important}#pane-ch-event.event-v3 .event-hero-main{grid-template-columns:minmax(0,1fr) 104px!important;min-height:118px!important;gap:10px!important}#pane-ch-event.event-v3 .event-hero-main h2{font-size:36px!important}#pane-ch-event.event-v3 .event-intro{font-size:10px!important}#pane-ch-event.event-v3 .event-celestial{width:100px!important;height:100px!important}#pane-ch-event.event-v3 .event-celestial-core{width:52px!important;height:52px!important;border-radius:18px!important;font-size:22px!important}#pane-ch-event.event-v3 .event-v3-progress-card{padding:13px 13px 9px!important;border-radius:19px!important}#pane-ch-event.event-v3 .event-season-stats{gap:7px!important}#pane-ch-event.event-v3 .event-season-stat{min-height:70px!important;padding:12px 9px 11px 37px!important;border-radius:17px!important}#pane-ch-event.event-v3 .event-season-stat::before{left:11px!important;top:13px!important;width:17px!important;height:17px!important}#pane-ch-event.event-v3 .event-season-stat strong{font-size:14px!important}#pane-ch-event.event-v3 .event-zone{padding:15px!important;border-radius:22px!important}#pane-ch-event.event-v3 #eventDailyList{grid-template-columns:1fr!important}}',
      '@media(max-width:430px){#pane-ch-event.event-v3 .event-topline{margin-bottom:14px!important}#pane-ch-event.event-v3 .event-live-lockup{max-width:63%!important;padding:6px 8px!important}#pane-ch-event.event-v3 .event-label{font-size:7px!important}#pane-ch-event.event-v3 .event-hero-main{grid-template-columns:minmax(0,1fr) 76px!important;min-height:104px!important}#pane-ch-event.event-v3 .event-hero-main h2{font-size:31px!important}#pane-ch-event.event-v3 .event-intro{max-width:290px!important;font-size:9.5px!important}#pane-ch-event.event-v3 .event-celestial{width:76px!important;height:76px!important}#pane-ch-event.event-v3 .event-celestial-core{width:43px!important;height:43px!important;border-radius:15px!important;font-size:19px!important}#pane-ch-event.event-v3 .event-orbit-two{inset:14px!important}#pane-ch-event.event-v3 .event-v3-progress-card{margin-top:16px!important}#pane-ch-event.event-v3 .event-rank-card{min-width:67px!important}#pane-ch-event.event-v3 .event-level-line{font-size:7px!important}#pane-ch-event.event-v3 .event-progress-shell{padding:39px 0 51px!important}#pane-ch-event.event-v3 .event-progress-marker{width:54px!important}#pane-ch-event.event-v3 .event-progress-node{width:37px!important;height:37px!important}#pane-ch-event.event-v3 .event-season-stats{grid-template-columns:1fr!important}#pane-ch-event.event-v3 .event-season-stat{min-height:58px!important}#pane-ch-event.event-v3 .event-section-head h3{font-size:20px!important}#pane-ch-event.event-v3 #eventRewardTrack>*{flex-basis:156px!important;min-height:144px!important}#pane-ch-event.event-v3 .event-info-card{grid-template-columns:44px minmax(0,1fr)!important;padding:14px!important}#pane-ch-event.event-v3 .event-info-icon{width:44px!important;height:44px!important;border-radius:14px!important;font-size:19px!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  function moveIntoProgressCard(hero){
    var card = hero.querySelector('.event-v3-progress-card');
    if(!card){
      card = document.createElement('section');
      card.className = 'event-v3-progress-card';
      card.setAttribute('aria-label',text('Event-XP fremdrift','Event XP progress'));
      hero.appendChild(card);
    }

    ['.event-xp-dashboard','.event-level-line','.event-progress-shell','.event-progress-footer'].forEach(function(selector){
      var element = hero.querySelector(selector) || document.querySelector('#pane-ch-event ' + selector);
      if(element && element.parentNode !== card) card.appendChild(element);
    });
  }

  function moveStatsAfterHero(pane,hero){
    var stats = pane.querySelector('.event-season-stats');
    if(stats && stats.previousElementSibling !== hero){
      hero.parentNode.insertBefore(stats,hero.nextSibling);
    }
  }

  function updateLabels(pane){
    var rewardsKicker = pane.querySelector('.event-rewards-zone .event-section-kicker');
    var dailyKicker = pane.querySelector('.event-daily-zone .event-section-kicker');
    var infoKicker = pane.querySelector('.event-info-kicker');
    if(rewardsKicker) rewardsKicker.textContent = text('SÆSONENS BELØNNINGER','SEASON REWARDS');
    if(dailyKicker) dailyKicker.textContent = text('NYE HVER DAG','NEW EVERY DAY');
    if(infoKicker) infoKicker.textContent = text('SÅDAN FUNGERER DET','HOW IT WORKS');
  }

  function decorateLists(pane){
    var rewards = pane.querySelectorAll('#eventRewardTrack>*');
    rewards.forEach(function(card,index){ card.style.setProperty('--event-card-index',index); });
    var daily = pane.querySelectorAll('#eventDailyList>*');
    daily.forEach(function(card,index){ card.style.setProperty('--event-card-index',index); });
  }

  function redesign(){
    installStyles();
    var pane = document.getElementById('pane-ch-event');
    var hero = document.getElementById('eventHero');
    if(!pane || !hero) return;

    pane.classList.add('event-v3');
    hero.classList.add('event-v3-hero');
    moveIntoProgressCard(hero);
    moveStatsAfterHero(pane,hero);

    var testRow = pane.querySelector('.event-test-row');
    if(testRow){ testRow.hidden = true; testRow.setAttribute('aria-hidden','true'); }

    updateLabels(pane);
    decorateLists(pane);
  }

  var observer;
  var queued = false;
  function queueRedesign(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(function(){ queued = false; redesign(); });
  }

  function install(){
    redesign();
    var pane = document.getElementById('pane-ch-event');
    if(pane && !observer){
      observer = new MutationObserver(queueRedesign);
      observer.observe(pane,{childList:true,subtree:true,characterData:true});
    }
  }

  window.refreshEventTabRedesign = redesign;
  window.addEventListener('streg:languagechange',queueRedesign);
  window.addEventListener('streg:startup-complete',queueRedesign);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) queueRedesign(); });

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  setTimeout(install,650);
})();
