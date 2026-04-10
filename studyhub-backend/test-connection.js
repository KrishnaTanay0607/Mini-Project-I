/**
 * Run this to diagnose MongoDB connection:
 *   node test-connection.js
 */
require('dotenv').config();

var dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

var mongoose = require('mongoose');

var URI = process.env.MONGO_URI;
if (!URI) { console.error('No MONGO_URI in .env'); process.exit(1); }

console.log('\n🔍  Testing MongoDB Atlas connection...');
console.log('URI: ' + URI.replace(/:([^@]+)@/, ':***@') + '\n');

// Step 1: DNS test
var host = 'study-hub.im3y4tl.mongodb.net';
console.log('Step 1: DNS lookup for ' + host);
dns.resolve4(host, function (err, addrs) {
  if (err) {
    console.error('  ❌  DNS FAILED: ' + err.message);
    console.error('  Your laptop DNS cannot resolve Atlas. See fix below.\n');
    showDNSFix();
  } else {
    console.log('  ✅  DNS OK → ' + addrs[0] + '\n');
    // Step 2: Mongoose connect
    console.log('Step 2: Connecting to MongoDB...');
    mongoose.connect(URI, { serverSelectionTimeoutMS: 15000, family: 4 })
      .then(function () {
        console.log('  ✅  MongoDB connected!\n');
        console.log('Everything is working. Run: npm run dev\n');
        mongoose.disconnect();
      })
      .catch(function (err) {
        console.error('  ❌  MongoDB error: ' + err.message + '\n');
        showDNSFix();
      });
  }
});

function showDNSFix() {
  console.log('┌──────────────────────────────────────────────────────┐');
  console.log('│  RUN THIS IN PowerShell (as Administrator):          │');
  console.log('│                                                      │');
  console.log('│  Set-DnsClientServerAddress -InterfaceAlias Wi-Fi \\ │');
  console.log('│    -ServerAddresses 8.8.8.8,8.8.4.4                 │');
  console.log('│  ipconfig /flushdns                                  │');
  console.log('│                                                      │');
  console.log('│  Then run: node test-connection.js                   │');
  console.log('└──────────────────────────────────────────────────────┘\n');
  process.exit(1);
}
