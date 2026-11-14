// Paste into the Google Sheet: Extensions > Apps Script. Change SECRET, run setup() once (click Allow), then Deploy as Web app.
const SECRET = 'CHANGE_ME';
const NOTIFY_EMAIL = ''; // leave empty to use your own Google account email

function setup(){ clients_(); SpreadsheetApp.getActive(); MailApp.getRemainingDailyQuota(); }
function createDailyTrigger(){ ScriptApp.newTrigger('dailyDigest').timeBased().everyDays(1).atHour(8).create(); } // run once for a daily 8am follow-up email

function doPost(e){
  const b = JSON.parse(e.postData.contents);
  if (b.key !== SECRET) return out_({ok:false});
  if (b.action === 'state') writeState_(b.data);
  if (b.action === 'doc') saveDoc_(b);
  return out_({ok:true});
}
function doGet(e){
  if(!e||!e.parameter||e.parameter.key!==SECRET) return out_({ok:false});
  return out_({ok:true,data:getState_()});
}
function getState_(){
  const sh=SpreadsheetApp.getActive().getSheetByName('AppData');
  if(!sh||sh.getLastRow()<1) return null;
  return JSON.parse(sh.getRange(1,1,sh.getLastRow(),1).getValues().map(r=>r[0]).join(''));
}
function saveData_(d){
  const ss=SpreadsheetApp.getActive(); const sh=ss.getSheetByName('AppData')||ss.insertSheet('AppData');
  sh.clear(); const t=JSON.stringify(d), rows=[];
  for(let i=0;i<t.length;i+=40000) rows.push([t.slice(i,i+40000)]);
  const r=sh.getRange(1,1,rows.length,1); r.setNumberFormat('@'); r.setValues(rows);
}
function out_(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// ---- Drive: LUMINA/Clients/<Client> - INV-0001 (QT-0001)/  holds the quotation + invoice PDFs
function sub_(p,n){ const i=p.getFoldersByName(n); return i.hasNext()?i.next():p.createFolder(n); }
function clients_(){ return sub_(sub_(DriveApp.getRootFolder(),'LUMINA'),'Clients'); }
function clean_(s){ return String(s||'').replace(/[\\\/:*?"<>|]/g,'').trim(); }
function findF_(p,txt){ const it=p.getFolders(); while(it.hasNext()){ const f=it.next(); if(f.getName().indexOf(txt)>=0) return f; } return null; }
function docFolder_(b){
  const root=clients_(), c=clean_(b.cust)||'Client';
  if(b.type==='INV'&&b.ref){ const f=findF_(root,b.ref); if(f){ f.setName(c+' - '+b.no+' ('+b.ref+')'); return f; } }
  return findF_(root,b.no)||root.createFolder(c+' - '+b.no);
}
function saveDoc_(b){
  const f=docFolder_(b), L=b.lang||'EN';
  const old=f.searchFiles('title contains "'+b.no+' '+L+'"'); while(old.hasNext()) old.next().setTrashed(true);
  const css='body{font-family:Arial;font-size:12px}table{border-collapse:collapse}th,td{text-align:left}';
  const html='<html><head><meta charset="utf-8"><style>'+css+'</style></head><body>'+b.html+'</body></html>';
  f.createFile(Utilities.newBlob(html,'text/html',b.no).getAs('application/pdf').setName(b.no+' '+L+' - '+clean_(b.cust)+'.pdf'));
  if(b.type==='QT'&&L==='EN'){ try{ notifyLead_(b); }catch(err){} }
}

// ---- Email alerts for leads
function to_(){ return NOTIFY_EMAIL||Session.getEffectiveUser().getEmail(); }
function notifyLead_(b){
  const p=PropertiesService.getScriptProperties(); if(p.getProperty('n_'+b.no)) return; p.setProperty('n_'+b.no,'1');
  MailApp.sendEmail(to_(),'New lead: '+b.no+' - '+b.cust,'New quotation (open lead)\n\nQuotation: '+b.no+'\nCustomer: '+b.cust+'\nPhone: '+(b.phone||'-')+'\nTotal: Rs. '+Number(b.total||0).toLocaleString('en-LK'));
}
function dailyDigest(){
  const d=getState_(); if(!d) return;
  const today=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyy-MM-dd');
  const leads=d.docs.filter(x=>x.type==='QT'&&x.lead!=='Won'&&x.lead!=='Lost');
  const due=leads.filter(x=>x.follow&&x.follow<=today);
  if(!leads.length) return;
  const line=x=>'- '+x.no+' '+x.cust+' ('+(x.phone||'no phone')+') Rs. '+Number(x.total||0).toLocaleString('en-LK')+(x.follow?' follow-up '+x.follow:'');
  MailApp.sendEmail(to_(),'LUMINA: '+due.length+' follow-up(s) due, '+leads.length+' open leads','Follow up now:\n'+(due.map(line).join('\n')||'none')+'\n\nAll open leads:\n'+leads.map(line).join('\n'));
}

// ---- Google Sheet tabs
function sheet_(n,head,rows){
  const ss=SpreadsheetApp.getActive(); const sh=ss.getSheetByName(n)||ss.insertSheet(n);
  sh.clear(); sh.getRange(1,1,1,head.length).setValues([head]).setFontWeight('bold');
  if(rows.length) sh.getRange(2,1,rows.length,head.length).setValues(rows);
}
function writeState_(d){
  saveData_(d);
  sheet_('Stock',['Code','Item','Qty','Avg cost','Last buy price','Price','Reorder'],d.items.map(i=>[i.code,i.name,i.qty,i.cost,i.lastBuy||'',i.price,i.low]));
  sheet_('Documents',['No','Type','Date','Customer','Phone','Total','Status','Follow-up'],d.docs.map(x=>[x.no,x.type==='QT'?'Quotation':'Invoice',x.date,x.cust,x.phone,x.total,x.type==='QT'?'Lead: '+(x.lead||'Open'):(x.paid?'Paid':'Unpaid'),x.follow||'']));
  sheet_('Deliveries',['Customer','Phone','Area','Address','Order','Fee','Confirmed','Planned day','Status'],d.orders.map(o=>[o.customer,o.phone,o.area,o.address,o.product,o.fee,o.confirmed,o.day||'',o.status]));
}
