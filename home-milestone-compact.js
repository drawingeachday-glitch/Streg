(function(){
  'use strict';

  function installStyles(){
    if(document.getElementById('homeMilestoneCompactStyles')) return;
    var style = document.createElement('style');
    style.id = 'homeMilestoneCompactStyles';
    style.textContent = [
      '#streakJourneyLink,.streak-journey-link,.streak-route-footer{display:none!important;}',
      '#streakCommandHero .streak-route-panel{padding:12px 15px 8px!important;}',
      '#streakCommandHero .streak-route{margin:11px 1px 2px!important;}',
      '#streakCommandHero.streak-command-hero{padding-bottom:14px!important;}',
      '@media(max-width:720px){#streakCommandHero .streak-route-panel{margin-top:0!important;padding:11px 13px 7px!important;}#streakCommandHero .streak-route{margin:10px 0 1px!important;}#streakCommandHero.streak-command-hero{padding-bottom:12px!important;}}',
      '@media(max-width:430px){#streakCommandHero .streak-route-panel{padding:10px 11px 6px!important;}#streakCommandHero .streak-route{margin:9px 0 0!important;}#streakCommandHero.streak-command-hero{padding-bottom:10px!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function compact(){
    installStyles();
    var link = document.getElementById('streakJourneyLink') || document.querySelector('.streak-journey-link');
    if(link) link.remove();

    var footer = document.querySelector('#streakCommandHero .streak-route-footer');
    if(footer){
      footer.hidden = true;
      footer.setAttribute('aria-hidden','true');
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',compact,{once:true});
  }else{
    compact();
  }

  window.addEventListener('streg:startup-complete',compact);
  window.addEventListener('streg:languagechange',compact);
  setTimeout(compact,500);
  setInterval(compact,1800);
})();
