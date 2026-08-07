(function(){
  'use strict';

  /* The challenge hub now has a single consolidated layout in
     challenge-page-redesign.js. This legacy file intentionally does not add
     spacing or pseudo-element overrides anymore; keeping it as a harmless
     runtime stub avoids stale loaders from reintroducing the old patch-on-patch
     layout. */

  function cleanup(){
    var old = document.getElementById('challengeCircleFixStyles');
    if(old) old.remove();
  }

  window.cleanChallengeCirclePatch = cleanup;

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',cleanup,{once:true});
  }else{
    cleanup();
  }
  window.addEventListener('streg:startup-complete',cleanup);
})();
