/* STREG offline shell. Same-origin app files are refreshed from the network
   when possible and fall back to the last good cached version outdoors. */
const VERSION = 'streg-v14';
const SHELL = VERSION + '-shell';
const LIBS = VERSION + '-libs';

const SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './achievement-vault.css',
  './event-command-center.css',
  './journey-story.css',
  './journey-story.js',
  './streak-route.css',
  './streak-route.js',
  './tutorial-cinematic.css',
  './tutorial-cinematic.js',
  './haptics-engine.js',
  './app-audio.js',
  './daily-photo-reset.js',
  './performance-runtime.js',
  './runtime-safety.js',
  './theme-audio.js',
  './home-challenges.js',
  './challenge-page-redesign.js',
  './daily-challenge-single-target.js',
  './event-tab-redesign.js',
  './challenge-event-polish.js',
  './challenge-card-actions.js',
  './xp-liquid-bar.js',
  './level-up-xp-explosion.js',
  './uploaded-ui-sounds.js',
  './inventory.js',
  './inventory-clean.js',
  './SoundsForStreg/Coin collect.mp3',
  './SoundsForStreg/Navigation sound.mp3',
  './SoundsForStreg/Startup App.mp3',
  './SoundsForStreg/collecting reward from challenges.mp3',
  './SoundsForStreg/level up.mp3',
  './SoundsForStreg/xp.mp3',
  './SoundsForStreg/shop sound.mp3',
  './SoundsForStreg/journey sound.mp3',
  './SoundsForStreg/challenge sound.mp3',
  './SoundsForStreg/purchasing.mp3',
  './SoundsForStreg/switch tab.mp3',
  './SoundsForStreg/nature-ambient.mp3.mp3',
  './SoundsForStreg/fireplace.mp3.mp3',
  './SoundsForStreg/map switch.mp3',
  './SoundsForStreg/space song.mp3'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(SHELL).then(function(cache){
      return Promise.all(SHELL_URLS.map(function(url){
        return cache.add(new Request(url,{cache:'reload'})).catch(function(){ return null; });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(names.map(function(name){
        if(name !== SHELL && name !== LIBS) return caches.delete(name);
        return null;
      }));
    }).then(function(){
      return self.clients.claim();
    })
  );
});

function isLibrary(url){
  return url.hostname === 'cdnjs.cloudflare.com' ||
    url.hostname === 'cdn.jsdelivr.net' ||
    url.hostname === 'unpkg.com';
}

function isLiveOnly(url){
  return url.hostname.indexOf('supabase.co') !== -1 ||
    url.hostname.indexOf('tile.openstreetmap.org') !== -1 ||
    url.hostname.indexOf('opentopomap.org') !== -1 ||
    url.hostname.indexOf('basemaps.cartocdn.com') !== -1 ||
    url.hostname.indexOf('arcgisonline.com') !== -1 ||
    url.hostname.indexOf('accounts.google.com') !== -1;
}

function cachedStatic(request){
  return caches.match(request,{ignoreSearch:true});
}

function cacheFreshResponse(request,response){
  if(!response || !response.ok) return response;
  var copy = response.clone();
  caches.open(SHELL).then(function(cache){
    return cache.put(request,copy);
  }).catch(function(){});
  return response;
}

self.addEventListener('fetch', function(event){
  const request = event.request;
  if(request.method !== 'GET') return;

  let url;
  try{ url = new URL(request.url); }catch(error){ return; }
  if(isLiveOnly(url)) return;

  if(isLibrary(url)){
    event.respondWith(
      caches.match(request).then(function(cached){
        if(cached) return cached;
        return fetch(request).then(function(response){
          if(response && response.ok){
            const copy = response.clone();
            caches.open(LIBS).then(function(cache){ return cache.put(request,copy); });
          }
          return response;
        });
      })
    );
    return;
  }

  if(url.origin !== self.location.origin) return;

  if(request.mode === 'navigate'){
    event.respondWith(
      fetch(new Request(request,{cache:'no-store'}))
        .then(function(response){ return cacheFreshResponse(request,response); })
        .catch(function(){
          return cachedStatic(request).then(function(cached){
            if(cached) return cached;
            return caches.match('./index.html',{ignoreSearch:true}).then(function(fallback){
              return fallback || caches.match('./',{ignoreSearch:true});
            });
          });
        })
    );
    return;
  }

  event.respondWith(
    fetch(new Request(request,{cache:'no-store'}))
      .then(function(response){ return cacheFreshResponse(request,response); })
      .catch(function(){
        return cachedStatic(request).then(function(cached){
          return cached || Response.error();
        });
      })
  );
});
