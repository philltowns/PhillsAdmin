// Phill's Admin — service worker
// Strategy: network-first for everything, with a cache fallback for offline use.
// Every successful fetch refreshes the cache, so there's no manual version
// number to bump when you update index.html — just upload the new file.
const CACHE_NAME='phillsadmin-cache';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS).catch(()=>{})));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request).then(res=>{
      const copy=res.clone();
      caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));
      return res;
    }).catch(()=>caches.match(e.request))
  );
});
