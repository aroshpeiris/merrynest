// Paste into the Google Sheet: Extensions > Apps Script. Change SECRET, run setup() once, then Deploy as Web app.
const SECRET = 'CHANGE_ME';
function setup(){ folder_('Quotations'); folder_('Invoices'); SpreadsheetApp.getActive(); }
function doPost(e){
  const b = JSON.parse(e.postData.contents);
  if (b.key !== SECRET) return out_({ok:false});
  if (b.action === 'state') writeState_(b.data);
  if (b.action === 'doc') saveDoc_(b);
  return out_({ok:true});
}
function out_(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function sub_(p,n){ const i=p.getFoldersByName(n); return i.hasNext()?i.next():p.createFolder(n); }
function folder_(n){ return sub_(sub_(DriveApp.getRootFolder(),'MerryNest'),n); }
function saveDoc_(b){
  const f = folder_(b.type==='INV'?'Invoices':'Quotations');
  const old = f.searchFiles('title contains "'+b.no+'"'); while(old.hasNext()) old.next().setTrashed(true);
  const css='body{font-family:Arial;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #ccc;padding:5px;text-align:left}.r{text-align:right}.tot{width:250px;margin-left:auto}';
  const html='<html><head><meta charset="utf-8"><style>'+css+'</style></head><body>'+b.html+'</body></html>';
  f.createFile(Utilities.newBlob(html,'text/html',b.no).getAs('application/pdf').setName(b.no+' - '+b.cust+'.pdf'));
}
function sheet_(n,head,rows){
  const ss=SpreadsheetApp.getActive(); const sh=ss.getSheetByName(n)||ss.insertSheet(n);
  sh.clear(); sh.getRange(1,1,1,head.length).setValues([head]).setFontWeight('bold');
  if(rows.length) sh.getRange(2,1,rows.length,head.length).setValues(rows);
}
function writeState_(d){
  sheet_('Stock',['Code','Item','Qty','Cost','Price','Reorder'],d.items.map(i=>[i.code,i.name,i.qty,i.cost,i.price,i.low]));
  sheet_('Documents',['No','Type','Date','Customer','Phone','Total','Status','Follow-up'],d.docs.map(x=>[x.no,x.type==='QT'?'Quotation':'Invoice',x.date,x.cust,x.phone,x.total,x.type==='QT'?'Lead: '+(x.lead||'Open'):(x.paid?'Paid':'Unpaid'),x.follow||'']));
  sheet_('Deliveries',['Customer','Phone','Area','Address','Order','Fee','Confirmed','Planned day','Status'],d.orders.map(o=>[o.customer,o.phone,o.area,o.address,o.product,o.fee,o.confirmed,o.day||'',o.status]));
}
