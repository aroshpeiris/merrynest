# MerryNest Pro (final, v5 live)
Mobile-friendly web app: stock, quotations (leads), invoices, delivery day runs, Sinhala/English documents with bank details, live sync between devices via Google Sheet + PDFs saved to Google Drive.

## 1. GitHub Pages
1. New repo (Public), upload ALL files here (keep the `apps-script` folder).
2. Settings > Pages > Source: `main` / root > Save.
3. Open `https://<username>.github.io/<repo>/` on each device. Phone: menu > Add to Home screen.

## 2. Google Sheet + Drive (once)
1. New Google Sheet > Extensions > Apps Script > paste `apps-script/Code.gs`.
2. Change `SECRET` to your own password. Run `setup` once and click Allow.
3. Deploy > New deployment > Web app > Execute as: Me, Access: Anyone > Deploy. Copy the URL.
   (After any later change to Code.gs: Deploy > Manage deployments > Edit > New version > Deploy.)

## 3. On EACH device (laptop, phone)
Backup & business > paste URL + the same password > Save details. The top bar shows "synced", "up to date" or "updated from other device".
- Bank details: Backup & business > Bank details > Save (printed on quotations and invoices).
- Download a backup now and then.

## Notes
- Checks the Sheet every 20 seconds while the app is open. Avoid editing the same record on two devices at the same second.
- Quotation/invoice PDFs (EN + SI) are saved to Drive: MerryNest/Quotations and MerryNest/Invoices.
