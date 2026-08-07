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
    if(host === 'localhost' || host === '127.0.0.