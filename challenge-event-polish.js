(function(){
  'use strict';

  function install(){
    var old = document.getElementById('challengeEventPolishStyles');
    if(old) old.remove();

    var style = document.createElement('style');
    style.id = 'challengeEventPolishStyles';
    style.textContent = [
      '#pane-ch-event.event-v3{padding-bottom:18px!important;}',
      '#pane-ch-event.event-v3 .event-hero{margin:0 0 12px!important;padding:18px!important;border-radius:24px!important;box-shadow:0 20px 46px -34px rgba(var(--event-primary-rgb),.88),0 10px 24px rgba(8,4,22,.18)!important;}',
      '#pane-ch-event.event-v3 .event-topline{margin-bottom:13px!important;}',
      '#pane-ch-event.event-v3 .event-live-lockup{padding:6px 9px!important;}',
      '#pane-ch-event.event-v3 .event-label{font-size:7.5px!important;letter-spacing:.12em!important;}',
      '#pane-ch-event.event-v3 .event-days span{display:none!important;}',
      '#pane-ch-event.event-v3 .event-days strong{font-size:10px!important;}',
      '#pane-ch-event.event-v3 .event-hero-main{grid-template-columns:minmax(0,1fr) 92px!important;gap:12px!important;min-height:96px!important;}',
      '#pane-ch-event.event-v3 .event-season-code{margin-bottom:7px!important;font-size:7px!important;letter-spacing:.13em!important;}',
      '#pane-ch-event.event-v3 .event-hero-main h2{font-size:clamp(30px,7vw,43px)!important;line-height:.96!important;letter-spacing:-.045em!important;}',
      '#pane-ch-event.event-v3 .event-intro{display:none!important;}',
      '#pane-ch-event.event-v3 .event-celestial{width:88px!important;height:88px!important;}',
      '#pane-ch-event.event-v3 .event-celestial-core{width:48px!important;height:48px!important;border-radius:16px!important;font-size:21px!important;}',
      '#pane-ch-event.event-v3 .event-celestial-pulse{inset:23px!important;border-radius:15px!important;}',
      '#pane-ch-event.event-v3 .event-v3-progress-card{margin-top:14px!important;padding:12px 13px 9px!important;border-radius:18px!important;}',
      '#pane-ch-event.event-v3 .event-xp-primary>span{display:none!important;}',
      '#pane-ch-event.event-v3 .event-xp-primary>div{margin-top:0!important;}',
      '#pane-ch-event.event-v3 .event-xp-primary strong{font-size:22px!important;}',
      '#pane-ch-event.event-v3 .event-rank-card{min-width:70px!important;padding:7px 9px!important;border-radius:12px!important;}',
      '#pane-ch-event.event-v3 .event-rank-card span,#pane-ch-event.event-v3 .event-rank-card small{display:none!important;}',
      '#pane-ch-event.event-v3 .event-rank-card strong{margin:0!important;font-size:14px!important;}',
      '#pane-ch-event.event-v3 .event-level-line{margin-top:9px!important;font-size:7.5px!important;}',
      '#pane-ch-event.event-v3 .event-progress-shell{padding:34px 0 45px!important;}',
      '#pane-ch-event.event-v3 .event-season-stats{display:none!important;}',
      '#pane-ch-event.event-v3 .event-info-card{display:none!important;}',
      '#pane-ch-event.event-v3 .event-zone{margin-bottom:12px!important;padding:15px!important;border-radius:20px!important;}',
      '#pane-ch-event.event-v3 .event-section-head{margin-bottom:10px!important;}',
      '#pane-ch-event.event-v3 .event-section-kicker{font-size:7px!important;letter-spacing:.12em!important;}',
      '#pane-ch-event.event-v3 .event-section-head h3{margin-top:3px!important;font-size:18px!important;line-height:1.05!important;}',
      '#pane-ch-event.event-v3 #eventDailyStatus,#pane-ch-event.event-v3 #eventRewardCount{font-size:9px!important;}',
      '#pane-ch-event.event-v3 .event-daily-list{gap:8px!important;}',
      '#pane-ch-event.event-v3 .event-daily-card{grid-template-columns:46px minmax(0,1fr) auto!important;gap:9px!important;padding:9px!important;border-radius:17px!important;box-shadow:0 7px 20px -18px rgba(22,36,43,.58)!important;}',
      '#pane-ch-event.event-v3 .event-daily-icon{width:46px!important;height:46px!important;border-radius:14px!important;}',
      '#pane-ch-event.event-v3 .event-daily-index{display:none!important;}',
      '#pane-ch-event.event-v3 .event-daily-title{font-size:12.5px!important;line-height:1.2!important;}',
      '#pane-ch-event.event-v3 .event-daily-progress{margin-top:3px!important;font-size:8.5px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}',
      '#pane-ch-event.event-v3 .event-daily-progressbar{height:5px!important;margin-top:5px!important;}',
      '#pane-ch-event.event-v3 .event-daily-action{min-width:62px!important;height:32px!important;min-height:32px!important;padding:0 9px!important;border-radius:11px!important;font-size:9.5px!important;}',
      '#pane-ch-event.event-v3 .event-reward-track{gap:8px!important;}',
      '#pane-ch-event.event-v3 .event-reward-card{border-radius:17px!important;box-shadow:0 7px 20px -18px rgba(22,36,43,.58)!important;}',
      '@media(max-width:520px){#pane-ch-event.event-v3 .event-hero{padding:15px!important;border-radius:21px!important}#pane-ch-event.event-v3 .event-hero-main{grid-template-columns:minmax(0,1fr) 72px!important;min-height:82px!important}#pane-ch-event.event-v3 .event-celestial{width:70px!important;height:70px!important}#pane-ch-event.event-v3 .event-celestial-core{width:42px!important;height:42px!important;font-size:18px!important}#pane-ch-event.event-v3 .event-orbit-three{display:none!important}#pane-ch-event.event-v3 .event-progress-shell{padding:31px 0 42px!important}#pane-ch-event.event-v3 .event-daily-card{grid-template-columns:42px minmax(0,1fr) auto!important;gap:8px!important;padding:8px!important}#pane-ch-event.event-v3 .event-daily-icon{width:42px!important;height:42px!important}#pane-ch-event.event-v3 .event-daily-action{min-width:56px!important;padding:0 7px!important}}',
      '@media(max-width:370px){#pane-ch-event.event-v3 .event-celestial{display:none!important}#pane-ch-event.event-v3 .event-hero-main{grid-template-columns:1fr!important}#pane-ch-event.event-v3 .event-daily-card{grid-template-columns:40px minmax(0,1fr)!important}#pane-ch-event.event-v3 .event-daily-action{grid-column:2!important;justify-self:start!important;margin-top:2px!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  window.refreshChallengeEventPolish = install;
  window.addEventListener('streg:startup-complete',install);
  window.addEventListener('streg:languagechange',install);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  setTimeout(install,760);
})();
