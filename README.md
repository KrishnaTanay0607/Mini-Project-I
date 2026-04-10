# 📚 StudyHub

## Run normally (if MongoDB connects fine)

  Terminal 1:  cd studyhub-backend  →  npm install  →  npm run dev
  Terminal 2:  cd studyhub-frontend →  npm install  →  npm start

Credentials already set in .env — no editing needed.

---

## ❌ If you see "querySrv ECONNREFUSED" on your laptop

### Step 1 — Test the connection
  cd studyhub-backend
  node test-connection.js
  (It will tell you exactly what's wrong)

### Step 2 — Fix DNS (PowerShell as Administrator)
  Right-click PowerShell → "Run as Administrator"
  cd into studyhub-backend
  .\FIX-DNS.ps1

  OR run manually:
  Set-DnsClientServerAddress -InterfaceAlias Wi-Fi -ServerAddresses 8.8.8.8,8.8.4.4
  ipconfig /flushdns

### Step 3 — Restart
  npm run dev

### Why it works on PC but not laptop
  Your laptop's DNS server (from your ISP) can't look up MongoDB's
  SRV record. Google DNS (8.8.8.8) always works.
  server.js already tries Google DNS automatically, but if it still
  fails the system DNS is overriding it — that's what FIX-DNS.ps1 fixes.
