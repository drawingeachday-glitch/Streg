(function(){
  'use strict';

  if(window.__stregRuntimeSafetyInstalled) return;
  window.__stregRuntimeSafetyInstalled = true;

  var lightboxPhotoId = null;
  var lastGeoUpdateAt = 0;
  var friendObserver = null;
  var MAX_GEO_FALLBACK_AGE = 20000;

  function devMode(){
    var host = String(location.hostname || '').toLowerCase();
    if(host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
    try{
      var params = new URLSearchParams(location.search);
      if(params.get('dev') === '1') return true;
    }catch(error){}
    try{ return localStorage.getItem('streg_dev_mode') === '1'; }catch(error){ return false; }
  }

  function installProductionUiGuard(){
    document.documentElement.dataset.stregDev = devMode() ? 'true' : 'false';
    if(document.getElementById('stregProductionSafetyStyles')) return;

    var style = document.createElement('style');
    style.id = 'stregProductionSafetyStyles';
    style.textContent = [
      'html[data-streg-dev="false"] #devHead,',
      'html[data-streg-dev="false"] #devBody,',
      'html[data-streg-dev="false"] #devApply,',
      'html[data-streg-dev="false"] #devUnlock,',
      'html[data-streg-dev="false"] #devFake,',
      'html[data-streg-dev="false"] #devAch,',
      'html[data-streg-dev="false"] #devClearPhotos,',
      'html[data-streg-dev="false"] #devTestPhoto,',
      'html[data-streg-dev="false"] #devLoc,',
      'html[data-streg-dev="false"] #fragmentTestAdd,',
      'html[data-streg-dev="false"] #eventTestXpBtn,',
      'html[data-streg-dev="false"] #testPhotoBtn,',
      'html[data-streg-dev="false"] .btn-test-photo,',
      'html[data-streg-dev="false"] #devSetLoc,',
      'html[data-streg-dev="false"] #devLat,',
      'html[data-streg-dev="false"] #devLng,',
      'html[data-streg-dev="false"] #devStreak,',
      'html[data-streg-dev="false"] #devBest,',
      'html[data-streg-dev="false"] #devXp,',
      'html[data-streg-dev="false"] #devCoins,',
      'html[data-streg-dev="false"] #devFreeze,',
      'html[data-streg-dev="false"] #resetDailyPhotoFull,',
      'html[data-streg-dev="false"] #resetDailyPhotoFullNote{display:none!important;}'
    ].join('');
    document.head.appendChild(style);
  }

  function transientTestCapture(lat,lng,manual,img,options){
    var app = null;
    try{ app = typeof S !== 'undefined' ? S : null; }catch(error){}
    var xp = app ? Number(app.xp) || 0 : 0;
    var coins = app ? Number(app.coins) || 0 : 0;
    var streak = app ? Number(app.streak) || 0 : 0;
    var freezes = app ? Number(app.freezes) || 0 : 0;
    var hexId = null;
    try{
      if(typeof MapView !== 'undefined' && MapView && typeof MapView.hexForLatLng === 'function'){
        hexId = MapView.hexForLatLng(lat,lng);
      }
    }catch(error){}

    return {
      ok:true,
      photo:{
        id:'test-' + Date.now() + '-' + Math.random().toString(16).slice(2,7),
        lat:lat,
        lng:lng,
        hexId:hexId,
        ts:Date.now(),
        img:img || '',
        testCapture:true,
        transient:true
      },
      isDaily:false,
      shieldUsed:false,
      rewardXp:0,
      rewardCoins:0,
      testCapture:true,
      bypassedHex:true,
      oldStreak:streak,
      newStreak:streak,
      oldXp:xp,
      newXp:xp,
      oldCoins:coins,
      newCoins:coins,
      oldFreezes:freezes,
      newFreezes:freezes,
      distanceText:'Test photo · no progression'
    };
  }

  function guardTestCaptures(){
    try{
      if(typeof saveSpot !== 'function' || saveSpot.__stregTestCaptureSafe) return;
      var original = saveSpot;
      var wrapped = function(lat,lng,manual,img,options){
        if(options && options.testCapture){
          return transientTestCapture(lat,lng,manual,img,options);
        }
        return original.apply(this,arguments);
      };
      wrapped.__stregTestCaptureSafe = true;
      wrapped.__stregOriginal = original;
      window.saveSpot = wrapped;
      try{ saveSpot = wrapped; }catch(error){}
    }catch(error){}
  }

  function watchGeoFreshness(){
    try{
      if(typeof Geo === 'undefined' || !Geo) return;
      if(!Geo.__stregFreshnessWatching && typeof Geo.onUpdate === 'function'){
        Geo.__stregFreshnessWatching = true;
        Geo.onUpdate(function(){ lastGeoUpdateAt = Date.now(); });
      }
      if(typeof Geo.override === 'function' && !Geo.override.__stregDevOnly){
        var originalOverride = Geo.override;
        var guardedOverride = function(){
          if(!devMode()) return false;
          return originalOverride.apply(Geo,arguments);
        };
        guardedOverride.__stregDevOnly = true;
        Geo.override = guardedOverride;
      }
      if(typeof Geo.current !== 'function' || Geo.current.__stregFreshFallbackGuard) return;

      var original = Geo.current;
      var wrapped = function(){
        return Promise.resolve(original.apply(Geo,arguments)).then(function(position){
          var usedWatcherFallback = false;
          try{ usedWatcherFallback = !!Geo.last && position === Geo.last; }catch(error){}
          if(usedWatcherFallback && Date.now() - lastGeoUpdateAt > MAX_GEO_FALLBACK_AGE){
            var stale = new Error('GPS position is stale');
            stale.code = 'STREG_STALE_GPS';
            throw stale;
          }
          return position;
        });
      };
      wrapped.__stregFreshFallbackGuard = true;
      wrapped.__stregOriginal = original;
      Geo.current = wrapped;
    }catch(error){}
  }

  function wrapLightbox(){
    try{
      if(typeof Lightbox === 'undefined' || !Lightbox || typeof Lightbox.open !== 'function') return;
      if(Lightbox.open.__stregTracksPhotoId) return;
      var original = Lightbox.open;
      var wrapped = function(id){
        lightboxPhotoId = id == null ? null : String(id);
        return original.apply(this,arguments);
      };
      wrapped.__stregTracksPhotoId = true;
      Lightbox.open = wrapped;
    }catch(error){}
  }

  function deleteCloudPhotoIfLocalGone(){
    var id = lightboxPhotoId;
    if(!id) return;

    var stillLocal = true;
    try{
      stillLocal = typeof S !== 'undefined' && Array.isArray(S.photos) && S.photos.some(function(photo){
        return photo && String(photo.id) === id;
      });
    }catch(error){ return; }
    if(stillLocal) return;

    lightboxPhotoId = null;
    try{
      if(typeof Cloud === 'undefined' || !Cloud || !Cloud.ready || !Cloud.client || !Cloud.userId) return;
      var client = Cloud.client;
      var userId = Cloud.userId;
      Promise.resolve(client.from('photos').delete().eq('id',id).eq('user_id',userId))
        .then(function(result){
          if(result && result.error) throw result.error;
          return client.storage.from('photos').remove([userId + '/' + id + '.jpg']);
        })
        .then(function(result){
          if(result && result.error) console.warn('STREG cloud photo file cleanup failed',result.error);
        })
        .catch(function(error){
          console.warn('STREG cloud photo deletion failed',error);
        });
    }catch(error){
      console.warn('STREG cloud photo deletion failed',error);
    }
  }

  function installCloudDeleteBridge(){
    var button = document.getElementById('lbDel');
    if(!button || button.dataset.stregCloudDeleteBridge === 'true') return;
    button.dataset.stregCloudDeleteBridge = 'true';
    button.addEventListener('click',function(){
      setTimeout(deleteCloudPhotoIfLocalGone,0);
    });
  }

  function guardLegacyRewardFlights(){
    try{
      if(typeof RewardFlight === 'undefined' || !RewardFlight || typeof RewardFlight.fly !== 'function') return false;
      if(RewardFlight.fly.__stregSuppressionAware) return true;

      var original = RewardFlight.fly;
      if(!original.__stregFileAudio) return false;

      var wrapped = function(options){
        var challengeOverlay = document.getElementById('challengeRewardCutscene');
        if(document.documentElement.classList.contains('streg-suppress-legacy-reward-flight') ||
           (challengeOverlay && challengeOverlay.classList.contains('active'))){
          return null;
        }
        return original.apply(this,arguments);
      };
      wrapped.__stregSuppressionAware = true;
      wrapped.__stregFileAudio = true;
      wrapped.__stregOriginal = original;
      RewardFlight.fly = wrapped;
      return true;
    }catch(error){ return false; }
  }

  function cleanAchievementInputs(){
    try{
      if(typeof achievementPhotos === 'function' && !achievementPhotos.__stregIgnoresTestCaptures){
        var safePhotos = function(){
          var photos = [];
          try{ photos = typeof S !== 'undefined' && Array.isArray(S.photos) ? S.photos : []; }catch(error){}
          return photos.filter(function(photo){ return photo && !photo.testCapture && !photo.transient; });
        };
        safePhotos.__stregIgnoresTestCaptures = true;
        window.achievementPhotos = safePhotos;
        try{ achievementPhotos = safePhotos; }catch(error){}
      }
    }catch(error){}

    try{
      if(typeof achievementCompletedChallenges === 'function' && !achievementCompletedChallenges.__stregNoDoubleCount){
        var safeChallengeCount = function(){
          var weeklyCount = 0;
          var todayCount = 0;
          try{ weeklyCount = S.weekly && Number(S.weekly.challengesDone) ? Number(S.weekly.challengesDone) : 0; }catch(error){}
          try{
            var daily = S.challenges && Array.isArray(S.challenges.items) ? S.challenges.items : [];
            todayCount = daily.filter(function(item){ return item && item.done; }).length;
          }catch(error){}
          return Math.max(weeklyCount,todayCount);
        };
        safeChallengeCount.__stregNoDoubleCount = true;
        window.achievementCompletedChallenges = safeChallengeCount;
        try{ achievementCompletedChallenges = safeChallengeCount; }catch(error){}
      }
    }catch(error){}
  }

  function removeDemoFriendRows(){
    if(devMode()) return;
    var list = document.getElementById('friendList');
    if(!list) return;
    Array.prototype.slice.call(list.children).forEach(function(row){
      if(row.classList.contains('me-row')) return;
      if(row.querySelector('[data-act="friend-gallery"]')) return;
      row.remove();
    });
  }

  function guardDemoFriends(){
    if(devMode()) return;
    var list = document.getElementById('friendList');
    if(!list) return;
    removeDemoFriendRows();
    if(friendObserver) return;
    friendObserver = new MutationObserver(function(){
      removeDemoFriendRows();
    });
    friendObserver.observe(list,{childList:true});
  }

  function disableConfetti(){
    try{
      if(typeof confetti !== 'function') return;
      if(confetti.__stregDisabled) return;
      var disabled = function(){ return null; };
      disabled.__stregDisabled = true;
      window.confetti = disabled;
      try{ confetti = disabled; }catch(error){}
    }catch(error){}
  }

  function install(){
    installProductionUiGuard();
    guardTestCaptures();
    watchGeoFreshness();
    wrapLightbox();
    installCloudDeleteBridge();
    guardLegacyRewardFlights();
    cleanAchievementInputs();
    guardDemoFriends();
    disableConfetti();
  }

  window.StregRuntimeSafety = {
    install:install,
    devMode:devMode
  };

  window.addEventListener('streg:startup-complete',install);
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
  setTimeout(install,450);
  setTimeout(install,1200);
  setTimeout(install,1900);
})();
