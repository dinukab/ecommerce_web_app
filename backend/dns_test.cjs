const dns = require('dns');
dns.resolveSrv('_mongodb._tcp.cluster-oneshop.497kaq6.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('SRV Error:', err);
  } else {
    console.log('SRV Records:', addresses);
  }
});
