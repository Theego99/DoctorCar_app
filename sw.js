// Bump CACHE version whenever you update the app to force phones to refresh.
const CACHE='doctorcar-v3';
const ASSETS=['./','./index.html','./manifest.json','./doctorcar-icon-192.png','./doctorcar-icon-512.png'];

self.addEventListener('install',e=>{
  self.skipWaiting(); // activate new SW immediately
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)) // delete old caches
    )).then(()=>self.clients.claim())
  );
});

// Network-first for the app shell so updates show immediately; fall back to cache offline.
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  const isShell=url.pathname.endsWith('/')||url.pathname.endsWith('index.html')||url.pathname.endsWith('manifest.json')||url.pathname.endsWith('sw.js');
  if(isShell){
    e.respondWith(
      fetch(e.request).then(r=>{
        const copy=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
        return r;
      }).catch(()=>caches.match(e.request))
    );
  }else{
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
  }
});
