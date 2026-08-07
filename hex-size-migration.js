(function(){
  'use strict';

  if(window.__stregHexSizeMigrationInstalled) return;
  window.__stregHexSizeMigrationInstalled = true;

  var TARGET_SIZE_M = 45;
  var MIGRATION_KEY = 'hexGridMeters';
  var retryTimer = null;

  function state(){
    try{ return typeof S !== 'undefined' && S ? S : null; }catch(error){ return null; }
  }

  function distanceMeters(a,b){
    if(!a || !b) return NaN;
    var radius = 6371000;
    var toRad = Math.PI / 180;
    var lat1 = Number(a.lat) * toRad;
    var lat2 = Number(b.lat) * toRad;
    var dLat = (Number(b.lat) - Number(a.lat)) * toRad;
    var dLng = (Number(b.lng) - Number(a.lng)) * toRad;
    var sinLat = Math.sin(dLat / 2);
    var sinLng = Math.sin(dLng / 2);
    var h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
    return 2 * radius * Math.asin(Math.min(1,Math.sqrt(h)));
  }

  function effectiveHexSize(){
    try{
      if(typeof MapView === 'undefined' || !MapView || typeof MapView.centerForId !== 'function') return NaN;
      var a = MapView.centerForId('h_0_0');
      var b = MapView.centerForId('h_1_0');
      var neighborDistance = distanceMeters(a,b);
      return neighborDistance / Math.sqrt(3);
    }catch(error){
      return NaN;
    }
  }

  function validCoord(value){
    return Number.isFinite(Number(value));
  }

  function latestPhotoWithLocation(photos){
    var result = null;
    (photos || []).forEach(function(photo){
      if(!photo || !validCoord(photo.lat) || !validCoord(photo.lng) || photo.testCapture || photo.transient) return;
      if(!result || Number(photo.ts || 0) > Number(result.ts || 0)) result = photo;
    });
    return result;
  }

  function rebuildPhotoHexes(app){
    var mapped = Object.create(null);
    var photos = Array.isArray(app.photos) ? app.photos : [];

    photos.forEach(function(photo){
      if(!photo || photo.testCapture || photo.transient || !validCoord(photo.lat) || !validCoord(photo.lng)) return;
      var id;
      try{ id = MapView.hexForLatLng(Number(photo.lat),Number(photo.lng)); }catch(error){ return; }
      if(!id) return;

      photo.hexId = id;
      var entry = {
        id:id,
        photoId:photo.id,
        img:photo.img || '',
        ts:photo.ts,
        lat:Number(photo.lat),
        lng:Number(photo.lng)
      };

      /* A smaller grid should almost never merge two old explored hexes. If it
         does, keep the newest photo as the visible map marker while preserving
         every photo in S.photos/Journey. */
      if(!mapped[id] || Number(entry.ts || 0) >= Number(mapped[id].ts || 0)) mapped[id] = entry;
    });

    app.hexMap.photos = mapped;
  }

  function migrate(){
    var app = state();
    if(!app || typeof MapView === 'undefined' || !MapView || typeof MapView.hexForLatLng !== 'function') return false;

    var measured = effectiveHexSize();
    /* On the one transitional page load the previous service worker can still
       serve the old 90 m core. Never mark migration complete on that page. */
    if(!Number.isFinite(measured) || Math.abs(measured - TARGET_SIZE_M) > 2.5) return false;

    app.hexMap = app.hexMap && typeof app.hexMap === 'object' ? app.hexMap : {};
    if(Number(app.hexMap[MIGRATION_KEY]) === TARGET_SIZE_M) return true;

    rebuildPhotoHexes(app);

    var anchor = null;
    try{
      if(typeof Geo !== 'undefined' && Geo && Geo.last && validCoord(Geo.last.lat) && validCoord(Geo.last.lng)){
        anchor = MapView.hexForLatLng(Number(Geo.last.lat),Number(Geo.last.lng));
      }
    }catch(error){}

    if(!anchor){
      var latest = latestPhotoWithLocation(app.photos);
      if(latest){
        try{ anchor = MapView.hexForLatLng(Number(latest.lat),Number(latest.lng)); }catch(error){}
      }
    }

    app.hexMap.currentHex = anchor || null;
    app.hexMap.selectedHex = anchor || null;

    /* Chests/hotspots contain only old grid IDs, not GPS coordinates, so they
       cannot be migrated honestly. Regenerate them once on the new grid. */
    app.hexMap.daily = null;
    app.hexMap.hotspots = null;
    app.hexMap.chestOpened = {};
    app.hexMap.lootReroll = 0;
    app.hexMap[MIGRATION_KEY] = TARGET_SIZE_M;
    app.hexMap.gridMigrationVersion = 1;
    app.hexMap.gridMigratedAt = Date.now();

    try{ localStorage.setItem('streg_v3',JSON.stringify(app)); }catch(error){}
    try{ if(typeof save === 'function') save(); }catch(error){}
    try{ if(MapView.ensureState) MapView.ensureState(); }catch(error){}
    try{ if(MapView.redraw) MapView.redraw(); }catch(error){}
    try{ if(window.renderMiniCaptureMap) window.renderMiniCaptureMap(); }catch(error){}

    return true;
  }

  function install(){
    clearTimeout(retryTimer);
    if(migrate()) return;
    retryTimer = setTimeout(function(){
      if(!migrate()) retryTimer = setTimeout(migrate,1600);
    },650);
  }

  window.StregHexGrid = {
    sizeMeters:TARGET_SIZE_M,
    migrate:migrate
  };

  window.addEventListener('streg:startup-complete',install);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
