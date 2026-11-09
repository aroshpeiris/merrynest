# MerryNest Pro
Mobile web app: stock, quotations (leads), invoices, delivery day runs. Works offline once opened, installable on a phone.

## 1. Put it on GitHub Pages
1. Create a new GitHub repo (e.g. `merrynest`), upload all files in this folder (keep `apps-script` folder too).
2. Settings > Pages > Source: `main` branch, `/ (root)` > Save.
3. Open `https://<your-username>.github.io/merrynest/` on your phone > browser menu > Add to Home screen.

## 2. Google Sheet + Drive auto-save
1. Make a new Google Sheet. Extensions > Apps Script. Paste `apps-script/Code.gs`.
2. Change `SECRET` to your own password. Run `setup` once and allow access.
3. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone > Deploy. Copy the URL.
4. In the app: Backup & business > paste the URL and the same password > Save details > Sync now.
Result: Sheet tabs Stock, Documents, Deliveries update automatically; every quotation and invoice is saved as a PDF in Drive > MerryNest > Quotations / Invoices.

Data is stored in the phone's browser; the Sheet is a live copy. Use Download backup too.
