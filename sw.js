const CACHE='wasgeht-shell-v6';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon.svg?v=4'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('./index.html')));return}
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok&&url.pathname.match(/\\.(?:js|css|svg|webmanifest)$/))caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));
    return response;
  })));
});
self.addEventListener('push',event=>{
  let data={title:'Talentpointchat',body:'Du hast eine neue Nachricht.',url:'./'};
  try{if(event.data)data={...data,...event.data.json()}}catch{if(event.data)data.body=event.data.text()}
  event.waitUntil(self.registration.showNotification(data.title||'Talentpointchat',{
    body:data.body||'Du hast eine neue Nachricht.',
    icon:'./icon.svg?v=4',
    badge:'./icon.svg?v=4',
    tag:data.tag||'talentpointchat-message',
    data:{url:data.url||'./'},
    renotify:true
  }));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  // Notification payloads from older deployments may contain the obsolete
  // GitHub Pages URL. Never navigate away from the currently deployed app.
  let target;
  try{
    const requested=new URL(event.notification.data?.url||'./',self.location.origin);
    target=requested.origin===self.location.origin?requested.href:new URL('./',self.location.origin).href;
  }catch{
    target=new URL('./',self.location.origin).href;
  }
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>{
    const existing=clients.find(client=>client.url.startsWith(self.location.origin));
    if(existing){existing.navigate(target);return existing.focus()}
    return self.clients.openWindow(target);
  }));
});
