(function(){
  'use strict';

  function install(){
    var existing = document.getElementById('challengeCircleFixStyles');
    if(existing) existing.remove();

    var style = document.createElement('style');
    style.id = 'challengeCircleFixStyles';
    style.textContent = [
      /* The redesign added an empty decorative circle with ::before even though
         each challenge already has a real .ch-icon circle. Keep only the icon. */
      '#challengeList>*::before,#weeklyList>*::before,#monthlyList>*::before{content:none!important;display:none!important;}',

      /* Remove the empty space that was reserved for that decorative circle. */
      '#challengeList>* ,#weeklyList>* ,#monthlyList>*{padding-left:18px!important;}',

      /* The featured first daily challenge had an oversized second circle too. */
      '#challengeList>*:first-child::before{content:none!important;display:none!important;}',
      '#challengeList>*:first-child{padding-left:22px!important;}',
      '#challengeList>*:first-child .ch-icon{flex:0 0 auto!important;}',
      '#challengeList>*:first-child .challenge-focus-kicker{left:101px!important;}',

      '@media(max-width:620px){#challengeList>* ,#weeklyList>* ,#monthlyList>*{padding-left:14px!important;}#challengeList>*:first-child{padding-left:16px!important;}#challengeList>*:first-child .challenge-focus-kicker{left:91px!important;}}',
      '@media(max-width:390px){#challengeList>*:first-child{padding-left:13px!important;}#challengeList>*:first-child .challenge-focus-kicker{left:83px!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  window.addEventListener('streg:startup-complete',install);
  setTimeout(install,500);
})();
