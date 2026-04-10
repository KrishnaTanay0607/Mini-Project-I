/**
 * Run this if MongoDB won't connect on your laptop:
 *   node fix-network.js
 *
 * It will diagnose the DNS / network issue automatically.
 */
var dns = require('dns');
var https = require('https');

console.log('\n🔍  StudyHub — Network Diagnostics\n');

// Test 1: DNS resolution
var host = 'study-hub.im3y4tl.mongodb.net';
console.log('1. Resolving Atlas hostname: ' + host);
dns.lookup(host, function (err, addr) {
  if (err) {
    console.error('   ❌  DNS FAILED: ' + err.message);
    console.error('   Fix: Change your DNS to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare)');
    console.error('   Windows: Settings → Network → DNS → Manual → 8.8.8.8\n');
  } else {
    console.log('   ✅  DNS OK → ' + addr);
  }

  // Test 2: Internet connectivity
  console.log('2. Testing internet connection...');
  var req = https.get('https://www.google.com', function (res) {
    console.log('   ✅  Internet OK (HTTP ' + res.statusCode + ')');
    console.log('\nIf DNS failed but internet works: change DNS settings (see above).');
    console.log('If both fail: check WiFi / firewall / VPN.\n');
  });
  req.on('error', function (err) {
    console.error('   ❌  No internet: ' + err.message);
    console.error('   Check your WiFi connection.\n');
  });
  req.setTimeout(5000, function () { req.destroy(); console.error('   ❌  Timeout\n'); });
});
