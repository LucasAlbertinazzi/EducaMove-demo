// Remove somente o antigo worker desta distribuição ao atualizar a demonstração.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  await self.registration.unregister();
  for(const client of await self.clients.matchAll({type:'window'})) {
    if(client.url.startsWith(self.registration.scope)) await client.navigate(client.url);
  }
})()));
