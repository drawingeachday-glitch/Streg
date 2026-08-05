/* STREG offline shell. Same-origin app files are refreshed from the network
   when possible and fall back to the last good cached version outdoors. */
const VERSION = 'streg-v10';
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
  './haptics-engine.js',
  './journey-story.css',
  './journey-story.js',
  './streak-route.css',
  './streak-route.js',
  './tutorial-cinematic.css',
  './tutorial-cinematic.js',
  './app-audio.js',
  './daily-photo-reset.js',
  './home-challenges.js',
  './home-milestone-compact.js',
  './SoundsForStreg/Coin collect.mp3',
  './SoundsForStreg/Navigation sound.mp3',
  './SoundsForStreg/Startup App.mp3',
  './SoundsForStreg/collecting reward from challenges.mp3',
  './SoundsForStreg/level up.mp3',
  './SoundsForStreg/purchasing.mp3',
  './SoundsForStreg/switch tab.mp3',
  './SoundsForStreg/nature-ambient.mp3.mp3',
  './SoundsForStreg/fireplace.mp3.mp3'
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
    }).then(function(){
      return self.clients.matchAll({type:'window',includeUncontrolled:true});
    }).then(function(windowClients){
      return Promise.all(windowClients.map(function(client){
        if(!client.url) return null;
        return client.navigate(client.url).catch(function(){ return null; });
      }));
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

function injectRuntimeScripts(response){
  const type = response.headers.get('content-type') || '';
  if(!type.includes('text/html')) return Promise.resolve(response);

  return response.text().then(function(html){
    const tags = [];
    if(!html.includes('app-audio.js')) tags.push('<script src="./app-audio.js" defer></script>');
    if(!html.includes('daily-photo-reset.js')) tags.push('<script src="./daily-photo-reset.js" defer></script>');
    if(!html.includes('home-challenges.js')) tags.push('<script src="./home-challenges.js" defer></script>');
    if(!html.includes('home-milestone-compact.js')) tags.push('<script src="./home-milestone-compact.js" defer></script>');

    if(tags.length === 0){
      return new Response(html,{
        status:response.status,
        statusText:response.statusText,
        headers:response.headers
      });
    }

    const injected = html.includes('</body>')
      ? html.replace('</body>',tags.join('') + '</body>')
      : html + tags.join('');

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    return new Response(injected,{
      status:response.status,
      statusText:response.statusText,
      headers:headers
    });
  });
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

  if(request.mode === 'navigate' || url.origin === self.location.origin){
    const freshRequest = new Request(request,{cache:'no-store'});
    event.respondWith(
      fetch(freshRequest).then(function(response){
        if(response && response.ok){
          const copy = response.clone();
          caches.open(SHELL).then(function(cache){ return cache.put(request,copy); });
        }
        return request.mode === 'navigate' ? injectRuntimeScripts(response) : response;
      }).catch(function(){
        return caches.match(request).then(function(cached){
          if(cached) return request.mode === 'navigate' ? injectRuntimeScripts(cached) : cached;
          return caches.match('./index.html').then(function(fallback){
            if(!fallback) return caches.match('./');
            return injectRuntimeScripts(fallback);
          });
        });
      })
    );
  }
});
