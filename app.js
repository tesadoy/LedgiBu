(function(){
'use strict';
var CFG=window.LEDGIBU||{};
var $=function(s,r){return (r||document).querySelector(s)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var store={get:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ---------- dates and money ---------- */
var DAY=864e5,NOW;
function tick(){NOW=new Date();NOW.setHours(12,0,0,0)}tick();
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function parse(s){var p=String(s).slice(0,10).split('-');return new Date(+p[0],+p[1]-1,+p[2],12)}
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var MONL=['January','February','March','April','May','June','July','August','September','October','November','December'];
var CUR={NGN:'₦',USD:'$',GBP:'£',EUR:'€',GHS:'GH₵',KES:'KSh ',ZAR:'R ',XOF:'CFA '};
var CURN={NGN:'Nigerian Naira (₦)',USD:'US Dollar ($)',GBP:'British Pound (£)',EUR:'Euro (€)',GHS:'Ghana Cedi (GH₵)',KES:'Kenyan Shilling (KSh)',ZAR:'South African Rand (R)',XOF:'West African CFA (CFA)'};
var DFMT={'DD MMM YYYY':'12 Mar 2026','DD/MM/YYYY':'12/03/2026','MM/DD/YYYY':'03/12/2026'};
var theme=store.get('lg_theme','system');
function cc(){var c=cur();return (c&&CUR[c.currency])?c.currency:'NGN'}
function money(n){var neg=n<0;n=Math.abs(n);return (neg?'-':'')+CUR[cc()]+n.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}
function short(n){var a=Math.abs(n),s=CUR[cc()].trim();if(a>=1e6)return s+(n/1e6).toFixed(a>=1e7?0:1)+'M';if(a>=1e3)return s+Math.round(n/1e3)+'k';return s+Math.round(n)}
function dstr(v){var d=parse(v),dd=String(d.getDate()).padStart(2,'0'),mm=String(d.getMonth()+1).padStart(2,'0'),f=(cur()&&cur().date_format)||'DD MMM YYYY';
  if(f==='DD/MM/YYYY')return dd+'/'+mm+'/'+d.getFullYear();if(f==='MM/DD/YYYY')return mm+'/'+dd+'/'+d.getFullYear();return d.getDate()+' '+MON[d.getMonth()]+' '+d.getFullYear()}
function applyTheme(){var r=document.documentElement;if(theme==='system')r.removeAttribute('data-theme');else r.setAttribute('data-theme',theme)}
applyTheme();
var ini=function(n){return String(n||'?').split(/\s+/).filter(Boolean).slice(0,2).map(function(w){return w[0]}).join('').toUpperCase()};
var num=function(v){return Math.round(parseFloat(String(v).replace(/,/g,''))*100)/100};
var sum=function(a,f){return a.reduce(function(t,x){return t+f(x)},0)};

/* ---------- icons ---------- */
var I={
 grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
 in:'<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>',out:'<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19.5h14"/>',
 users:'<circle cx="9" cy="8.5" r="3.3"/><path d="M3.5 19c.5-3.2 2.7-5 5.5-5s5 1.8 5.5 5"/><path d="M16 5.6a3 3 0 0 1 0 5.8M17.5 14.3c1.8.5 3 2.1 3.3 4.7"/>',
 chart:'<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>',
 swap:'<rect x="4" y="4" width="16" height="6.5" rx="2.5"/><rect x="4" y="13.5" width="16" height="6.5" rx="2.5"/>',
 exit:'<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14M10 8l-4 4 4 4M6 12h10"/>',
 more:'<path d="M4 7h16M4 12h16M4 17h16"/>',plus:'<path d="M12 5v14M5 12h14"/>',
 trash:'<path d="M5 7h14M10 4h4M7 7l1 12h8l1-12M10 11v5M14 11v5"/>',
 edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
 lock:'<rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 wallet:'<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><path d="M4 7.5V17a2 2 0 0 0 2 2h12.5a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 18.5 8H6.5A2.5 2.5 0 0 1 4 7.5Z"/><circle cx="16" cy="13.5" r="1.2"/>',
 receipt:'<path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2z"/><path d="M9 8.5h6M9 12h6"/>',
 bag:'<path d="M5.5 8h13l-1 11.5h-11z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
 hourglass:'<path d="M7 3.5h10M7 20.5h10M8 3.5c0 4 4 5 4 8.5s-4 4.5-4 8.5M16 3.5c0 4-4 5-4 8.5s4 4.5 4 8.5"/>',
 coins:'<ellipse cx="9.5" cy="8" rx="5.5" ry="2.7"/><path d="M4 8v4c0 1.5 2.5 2.7 5.5 2.7s5.5-1.2 5.5-2.7V8"/><path d="M15.5 10.5c2.6.2 4.5 1.2 4.5 2.5v4c0 1.5-2.5 2.7-5.5 2.7-2 0-3.7-.5-4.7-1.3"/>',
 calendar:'<rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M8 3.5v4M16 3.5v4M4 10.5h16"/>',
 scale:'<path d="M12 4v16M7 20h10M5 8h14"/><path d="m5 8-2.5 6a3 3 0 0 0 5 0zM19 8l-2.5 6a3 3 0 0 0 5 0z"/>',
 building:'<path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h7A1.5 1.5 0 0 1 15 5.5V20M15 10h3.5a1.5 1.5 0 0 1 1.5 1.5V20M3.5 20h17M8.5 8h3M8.5 12h3M8.5 16h3"/>',
 globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5"/>',
 palette:'<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2-1 1.6-2.1-.4-1.1.2-2.4 1.5-2.4H17a3.5 3.5 0 0 0 3.5-3.5C20.5 7 16.8 3.5 12 3.5Z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="7.8" r="1"/><circle cx="16" cy="10" r="1"/>',
 crown:'<path d="m4 8 4 4 4-6 4 6 4-4-1.5 10h-13z"/>',list:'<path d="M8.5 6.5H20M8.5 12H20M8.5 17.5H20M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01"/>',
 chat:'<path d="M5 5.5h14A1.5 1.5 0 0 1 20.5 7v8a1.5 1.5 0 0 1-1.5 1.5h-8L6.5 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5Z"/><path d="M8 10h8M8 13h5"/>',
 left:'<path d="M14.5 6 8.5 12l6 6"/>',right:'<path d="m9.5 6 6 6-6 6"/>'
};
var svg=function(k,w){return '<svg viewBox="0 0 24 24" width="'+(w||22)+'" height="'+(w||22)+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+I[k]+'</svg>'};

/* ---------- connection ---------- */
var sb=null,configured=/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(CFG.SUPABASE_URL||'')&&!!CFG.SUPABASE_KEY&&!/YOUR-PROJECT/.test(CFG.SUPABASE_URL);
if(configured&&window.supabase){sb=window.supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}
var REDIRECT=(location.origin+location.pathname).replace(/index\.html$/,'');

/* ---------- state ---------- */
var S={user:null,profile:null,biz:[],bid:null,sales:[],exps:[],reps:[],alloc:{},tSales:[],tExps:[],mem:[],inv:[],profs:{},ready:false,tok:0};
function cur(){return S.biz.filter(function(b){return b.id===S.bid})[0]||null}
function isOwner(){var c=cur();return !!c&&c.role==='owner'}
function can(p){var c=cur();return !!c&&(c.role==='owner'||!!c['can_'+p])}
function plan(){return (S.profile&&S.profile.plan)||'free'}
var FREE_BIZ=1;
function teamLimit(){return plan()==='premium'?3:1}

function fe(e){var m=(e&&e.message)||String(e||'');var l=m.toLowerCase();
 if(l.indexOf('invalid login')>-1)return 'The email or password is not right. Check it and try again.';
 if(l.indexOf('email not confirmed')>-1)return 'Please open the link we emailed you to confirm your address, then sign in.';
 if(l.indexOf('rate limit')>-1||l.indexOf('too many')>-1)return 'Too many tries. Please wait a few minutes and try again.';
 if(l.indexOf('failed to fetch')>-1||l.indexOf('network')>-1||l.indexOf('load failed')>-1)return 'No internet connection. Check your network and try again.';
 if(l.indexOf('already registered')>-1)return 'This email already has a profile. Try signing in.';
 if(l.indexOf('password should be')>-1||l.indexOf('weak')>-1)return 'Choose a stronger password with at least 8 characters.';
 if(l.indexOf('row-level security')>-1||l.indexOf('permission denied')>-1)return 'You do not have permission to do that.';
 return m}

/* ---------- loading data ---------- */
async function fetchAll(make){var out=[],from=0,step=1000;for(;;){var r=await make(from,from+step-1);if(r.error)throw r.error;out=out.concat(r.data||[]);if(!r.data||r.data.length<step)break;from+=step}return out}
async function loadProfile(){var r=await sb.from('profiles').select('*').eq('id',S.user.id).maybeSingle();if(r.error)throw r.error;S.profile=r.data||{plan:'free',full_name:'',email:S.user.email}}
async function loadBiz(){
 var m=await sb.from('members').select('*').eq('user_id',S.user.id);if(m.error)throw m.error;
 var ids=m.data.map(function(x){return x.business_id});
 if(!ids.length){S.biz=[];return}
 var b=await sb.from('businesses').select('*').in('id',ids).order('created_at',{ascending:true});if(b.error)throw b.error;
 S.biz=b.data.map(function(x){var mm=m.data.filter(function(y){return y.business_id===x.id})[0];return Object.assign({},x,{role:mm.role,can_record:mm.can_record,can_edit:mm.can_edit,can_delete:mm.can_delete})});
 if(!cur()){var saved=store.get('lg_bid','');S.bid=S.biz.some(function(x){return x.id===saved})?saved:S.biz[0].id}
}
async function loadData(){
 var id=S.bid,tok=++S.tok;if(!id)return;
 var q=function(t,col){return fetchAll(function(a,b){return sb.from(t).select('*').eq('business_id',id).order(col,{ascending:true}).order('id',{ascending:true}).range(a,b)})};
 var res=await Promise.all([q('sales','created_at'),q('expenses','created_at'),q('repayments','created_at'),q('repayment_allocations','id'),
   sb.from('members').select('*').eq('business_id',id),sb.from('invites').select('*').eq('business_id',id)]);
 if(tok!==S.tok)return;
 S.sales=[];S.tSales=[];S.exps=[];S.tExps=[];S.reps=[];S.alloc={};
 res[0].forEach(function(r){var o={id:r.id,date:r.sale_date,cust:r.customer,item:r.item,price:+r.price,paid:+r.paid,del:r.deleted_at};(r.deleted_at?S.tSales:S.sales).push(o)});
 res[1].forEach(function(r){var o={id:r.id,date:r.exp_date,what:r.what,cat:r.category,amount:+r.amount,del:r.deleted_at};(r.deleted_at?S.tExps:S.exps).push(o)});
 res[2].forEach(function(r){S.reps.push({id:r.id,date:r.pay_date,cust:r.customer,amount:+r.amount})});
 res[3].forEach(function(r){S.alloc[r.sale_id]=(S.alloc[r.sale_id]||0)+(+r.amount)});
 if(res[4].error)throw res[4].error;S.mem=res[4].data||[];S.inv=res[5].error?[]:(res[5].data||[]);
 var uids=S.mem.map(function(x){return x.user_id});
 if(uids.length){var p=await sb.from('profiles').select('id,full_name,email').in('id',uids);if(!p.error){S.profs={};(p.data||[]).forEach(function(x){S.profs[x.id]=x})}}
 S.ready=true;
}
async function refresh(){await loadData();render()}

/* ---------- calculations ---------- */
function saleAlloc(s){return S.alloc[s.id]||0}
function saleBal(s){return Math.round((s.price-s.paid-saleAlloc(s))*100)/100}
function owedBy(c){return sum(S.sales.filter(function(s){return s.cust===c}),saleBal)}
function inRange(d,a,b){return d>=a&&d<b}
function metrics(a,b){
 var s=S.sales.filter(function(x){return inRange(x.date,a,b)}),r=S.reps.filter(function(x){return inRange(x.date,a,b)}),e=S.exps.filter(function(x){return inRange(x.date,a,b)});
 var atSale=sum(s,function(x){return x.paid}),rep=sum(r,function(x){return x.amount}),out=sum(e,function(x){return x.amount});
 return {sales:sum(s,function(x){return x.price}),atSale:atSale,rep:rep,recv:atSale+rep,out:out,net:atSale+rep-out,count:s.length}}
var ALL=['0000-01-01','9999-12-31'];
function monthBounds(y,m){return [iso(new Date(y,m,1)),iso(new Date(y,m+1,1))]}
function debtors(){var m={};S.sales.forEach(function(s){var b=saleBal(s);if(b>0){(m[s.cust]=m[s.cust]||{name:s.cust,owed:0,total:0,list:[]});m[s.cust].owed+=b;m[s.cust].list.push(s)}});
 Object.keys(m).forEach(function(k){m[k].total=sum(S.sales.filter(function(s){return s.cust===k}),function(s){return s.price})});
 return Object.keys(m).map(function(k){return m[k]}).sort(function(a,b){return b.owed-a.owed})}

/* ---------- navigation ---------- */
var PAGES=[['overview','Overview','grid'],['income','Income','in'],['expenses','Expenses','out'],['debtors','My Debtors','users'],['reports','Reports','chart'],['preferences','Settings','gear'],['workspaces','Switch workspace','swap']];
function route(){var h=location.hash.replace('#','');return PAGES.some(function(p){return p[0]===h})?h:'overview'}
function renderNav(cur){
 $('#nav').innerHTML=PAGES.map(function(p){return '<a href="#'+p[0]+'" '+(p[0]===cur?'aria-current="page"':'')+'>'+svg(p[2])+'<span>'+p[1]+'</span></a>'}).join('')+
  '<a href="#signout" id="logoutLink" class="logout">'+svg('exit')+'<span>Log out</span></a>';
 var q=[['overview','Home','grid'],['income','Income','in'],['expenses','Expenses','out'],['debtors','Debtors','users']];
 $('#bottom').innerHTML=q.map(function(p){return '<a href="#'+p[0]+'" '+(p[0]===cur?'aria-current="page"':'')+'>'+svg(p[2])+p[1]+'</a>'}).join('')+'<button id="moreBtn">'+svg('more')+'Menu</button>';
}
function openMenu(o){$('#side').classList.toggle('open',o);$('#scrim').classList.toggle('on',o)}

/* ---------- view pieces ---------- */
var STAT_ICON={'Total Income':'wallet','Total Expenses':'receipt','New sales':'bag','People who owe you':'hourglass','Total sales value':'bag','Received this month':'wallet','Repayments this month':'coins','All-time expenses':'receipt','Expenses this month':'calendar','Total outstanding':'hourglass','Customers owing':'users','Sales value':'bag','Income received':'wallet','Expenses':'receipt','Outstanding':'hourglass','Net cash position':'scale'};
function ttl(i,t,c){return '<h2 class="section-title ttl"><i class="ci '+(c||'')+'">'+svg(i,20)+'</i>'+t+'</h2>'}
function head(t,p,btn){return '<div class="page-head"><div><h1>'+t+'</h1><p>'+p+'</p></div>'+(btn||'')+'</div>'}
function statCard(t,v,s,cls){return '<div class="card stat '+(cls||'')+'"><i class="ci '+((cls==='terra'||cls==='bad')?'red':cls==='gold'?'gold':'')+'">'+svg(STAT_ICON[t]||'grid',20)+'</i><h3>'+t+'</h3><span class="num">'+String(v).replace(/\.00(<|$)/,'$1')+'</span><p>'+s+'</p></div>'}
function empty(t,s){return '<div class="empty"><b>'+t+'</b>'+s+'</div>'}
function lockBtn(label,feature){return '<button class="btn ghost small" data-act="plans" data-f="'+esc(feature)+'">'+svg('lock',16).replace('<svg','<svg class="lk"')+label+'</button>'}
function saleRec(s,tools){var bal=saleBal(s),paid=s.price-bal,pc=Math.round(paid/s.price*100);
 var st=bal<=0?'<span class="pill">Paid in full</span>':(paid>0?'<span class="pill part">Part payment</span>':'<span class="pill unpaid">Not paid yet</span>');
 var btns='';if(tools){if(can('edit'))btns+='<button class="icon-btn" data-edit-sale="'+s.id+'" aria-label="Edit sale">'+svg('edit',18)+'</button>';if(can('delete'))btns+='<button class="icon-btn" data-del-sale="'+s.id+'" aria-label="Move to trash">'+svg('trash',18)+'</button>'}
 return '<div class="rec"><div class="ico '+(bal>0?'owe':'')+'">'+esc(ini(s.cust))+'</div><div style="min-width:0"><div class="t">'+esc(s.cust)+'</div><div class="s">'+esc(s.item)+' · '+dstr(s.date)+'</div></div>'+
  '<div class="amt">'+money(s.price)+'<small>Sale price</small></div><div class="row2">'+st+'<div class="bar" aria-hidden="true"><i style="width:'+pc+'%"></i></div><span class="s'+(bal>0?' red':'')+'">'+(bal>0?money(bal)+' still owed':'Received '+money(paid))+'</span>'+btns+'</div></div>'}
function expRec(e){var btns='';if(can('edit'))btns+='<button class="icon-btn" data-edit-exp="'+e.id+'" aria-label="Edit expense">'+svg('edit',18)+'</button>';if(can('delete'))btns+='<button class="icon-btn" data-del-exp="'+e.id+'" aria-label="Move to trash">'+svg('trash',18)+'</button>';
 return '<div class="rec"><div class="ico out">'+svg('out',20)+'</div><div style="min-width:0"><div class="t">'+esc(e.what)+'</div><div class="s">'+esc(e.cat)+' · '+dstr(e.date)+'</div></div><div class="amt red">'+money(e.amount)+'</div>'+(btns?'<div class="row2">'+btns+'</div>':'')+'</div>'}
function repRec(r){return '<div class="rec"><div class="ico">'+svg('in',20)+'</div><div style="min-width:0"><div class="t">'+esc(r.cust)+'</div><div class="s">Repayment · '+dstr(r.date)+'</div></div><div class="amt">'+money(r.amount)+'</div><div class="row2"><span class="pill rep">Repayment</span><span class="s">Cleared the oldest debt first</span>'+(can('edit')?'<button class="icon-btn" data-edit-rep="'+r.id+'" aria-label="Edit payment">'+svg('edit',18)+'</button>':'')+'</div></div>'}
function debtRec(d){var paid=d.total-d.owed,pc=Math.round(paid/d.total*100);var oldest=d.list.slice().sort(function(a,b){return a.date<b.date?-1:1})[0].date;
 return '<div class="rec"><div class="ico owe">'+esc(ini(d.name))+'</div><div style="min-width:0"><div class="t">'+esc(d.name)+'</div><div class="s">'+d.list.length+' unpaid '+(d.list.length>1?'sales':'sale')+' · oldest '+dstr(oldest)+'</div></div>'+
  '<div class="amt red">'+money(d.owed)+'<small>still owed</small></div><div class="row2"><div class="bar" aria-hidden="true"><i style="width:'+pc+'%"></i></div><span class="s">Paid '+pc+'% of '+money(d.total)+'</span>'+(can('record')?'<button class="btn small" data-act="repay" data-c="'+esc(d.name)+'">Receive payment</button>':'')+'</div></div>'}

function chart(){
 var months=[];for(var i=5;i>=0;i--){var d=new Date(NOW.getFullYear(),NOW.getMonth()-i,1);months.push({y:d.getFullYear(),m:d.getMonth()})}
 var data=months.map(function(x){var b=monthBounds(x.y,x.m);return {l:MON[x.m],s:metrics(b[0],b[1])}});
 var mx=Math.max.apply(null,data.map(function(d){return Math.max(d.s.sales,d.s.rep,d.s.out)}).concat([1]));var step=Math.pow(10,Math.floor(Math.log10(mx)));var top=Math.ceil(mx/step)*step;if(top/step<3)top=Math.ceil(mx/(step/2))*(step/2);
 var W=640,H=250,L=52,R=10,T=14,B=30,pw=W-L-R,ph=H-T-B,g='';
 for(var t=0;t<=4;t++){var v=top/4*t,y=T+ph-ph*(v/top);g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="var(--line)" stroke-width="1"/><text x="'+(L-8)+'" y="'+(y+4)+'" text-anchor="end">'+short(v)+'</text>'}
 var cw=pw/data.length,bw=Math.min(20,cw/4);
 data.forEach(function(d,i){var cx=L+cw*i+cw/2;[[d.s.sales,'var(--green2)'],[d.s.rep,'var(--gold)'],[d.s.out,'var(--terra)']].forEach(function(b,k){var h=ph*(b[0]/top),x=cx+(k-1)*(bw+4)-bw/2;g+='<rect x="'+x+'" y="'+(T+ph-h)+'" width="'+bw+'" height="'+Math.max(h,0)+'" rx="5" fill="'+b[1]+'"/>'});
  g+='<text x="'+cx+'" y="'+(H-8)+'" text-anchor="middle">'+d.l+'</text>'});
 return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Sales, repayments and money out for the last six months">'+g+'</svg><div class="legend"><span><i style="background:var(--green2)"></i>New sales</span><span><i style="background:var(--gold)"></i>Repayments</span><span><i style="background:var(--terra)"></i>Money out</span></div>'}

/* ---------- pages ---------- */
function vOverview(){
 var b=monthBounds(NOW.getFullYear(),NOW.getMonth()),m=metrics(b[0],b[1]),all=metrics(ALL[0],ALL[1]),db=debtors(),owed=sum(db,function(d){return d.owed});
 var rows=[];for(var i=0;i<4;i++){var d=new Date(NOW.getFullYear(),NOW.getMonth()-i,1),bb=monthBounds(d.getFullYear(),d.getMonth()),x=metrics(bb[0],bb[1]);
  rows.push('<div class="mrow"><b>'+MONL[d.getMonth()]+' '+d.getFullYear()+'</b><span data-l="New sales">'+money(x.sales)+'</span><span data-l="Repayments">'+money(x.rep)+'</span><span data-l="Money out" class="neg">'+money(x.out)+'</span><b data-l="Net cash" class="'+(x.net<0?'neg':'')+'">'+money(x.net)+'</b></div>')}
 var recent=S.sales.slice().sort(function(a,b){return a.date<b.date?1:-1}).slice(0,4).map(function(s){return saleRec(s)}).join('');
 return head('Dashboard','Your business at a glance: money in, money out and who still owes you.',can('record')?'<button class="btn gold" data-act="sale">'+svg('plus',18)+'Record income</button>':'')+
 '<div class="stack"><section class="hero"><div><h2>Net cash this month</h2><span class="big">'+money(m.net)+'</span><p>Money received (including repayments) minus money out, for '+MONL[NOW.getMonth()]+'.</p></div>'+
 '<div class="mini"><div><span>All-time net cash</span><b>'+money(all.net)+'</b></div><div><span>Still owed to you</span><b style="color:#FFB4A6">'+money(owed)+'</b></div></div></section>'+
 '<div class="grid g4 keep2">'+statCard('Total Income',money(m.recv),'Money received this month, including repayments')+statCard('Total Expenses',money(m.out),'Money out this month','terra')+statCard('New sales',money(m.sales),m.count+' sales recorded this month','gold')+statCard('People who owe you',money(owed),db.length+' customers with a balance','bad')+'</div>'+
 '<section class="card">'+ttl('chart','Monthly performance')+'<p class="section-sub">New sale value, repayments and money out are kept apart so nothing is counted twice.</p>'+chart()+
 '<div style="margin-top:20px"><div class="mrow head"><span>MONTH</span><span>NEW SALES</span><span>REPAYMENTS</span><span>MONEY OUT</span><span>NET CASH</span></div>'+rows.join('')+'</div></section>'+
 '<div class="grid g2"><section class="card">'+ttl('bag','Latest sales')+'<div class="recs">'+(recent||empty('No sales yet','Tap Record income to add your first sale.'))+'</div></section>'+
 '<section class="card">'+ttl('hourglass','Who owes you most','red')+'<div class="recs">'+(db.slice(0,4).map(debtRec).join('')||empty('Nobody owes you','Part-paid sales show up here automatically.'))+'</div></section></div></div>'}

function vIncome(){
 var b=monthBounds(NOW.getFullYear(),NOW.getMonth()),m=metrics(b[0],b[1]),all=metrics(ALL[0],ALL[1]);
 var feed=S.sales.map(function(s){return {d:s.date,id:s.id,html:saleRec(s,true)}}).concat(S.reps.map(function(r){return {d:r.date,id:r.id,html:repRec(r)}})).sort(function(a,b){return a.d<b.d?1:a.d>b.d?-1:(a.id<b.id?1:-1)});
 return head('Income','Every sale and every repayment, with what has been paid and what is left.',can('record')?'<button class="btn gold" data-act="sale">'+svg('plus',18)+'Record income</button>':'')+
 '<div class="stack"><div class="grid g3">'+statCard('Total sales value',money(all.sales),'All sales ever recorded')+statCard('Received this month',money(m.recv),'Includes '+money(m.rep)+' in repayments','gold')+statCard('Repayments this month',money(m.rep),'Customers paying off earlier sales','terra')+'</div>'+
 '<section class="card">'+ttl('list','All income records')+'<p class="section-sub">Newest first. A sale that is not fully paid becomes a debtor automatically.</p><div class="recs">'+(feed.map(function(f){return f.html}).join('')||empty('No income yet','Tap Record income to add your first sale.'))+'</div></section></div>'}

function vExpenses(){
 var b=monthBounds(NOW.getFullYear(),NOW.getMonth()),m=metrics(b[0],b[1]),all=metrics(ALL[0],ALL[1]);
 var list=S.exps.slice().sort(function(a,b){return a.date<b.date?1:a.date>b.date?-1:(a.id<b.id?1:-1)}).map(expRec).join('');
 return head('Expenses','Everything the business spends, so you can see where the money goes.',can('record')?'<button class="btn" data-act="exp">'+svg('plus',18)+'Record expense</button>':'')+
 '<div class="stack"><div class="grid g2">'+statCard('All-time expenses',money(all.out),'Total money out since you started','terra')+statCard('Expenses this month',money(m.out),'Dated in '+MONL[NOW.getMonth()],'terra')+'</div>'+
 '<section class="card">'+ttl('list','All expenses','red')+'<p class="section-sub">Deleted items go to Trash for 30 days.</p><div class="recs">'+(list||empty('No expenses yet','Tap Record expense to add one.'))+'</div></section></div>'}

function vDebtors(){var db=debtors(),owed=sum(db,function(d){return d.owed});
 return head('My Debtors','Customers who have paid part of what they owe. Payments clear their oldest debt first.',can('record')?'<button class="btn" data-act="debtor">'+svg('plus',18)+'Add a debtor</button>':'')+
 '<div class="stack"><div class="grid g2">'+statCard('Total outstanding',money(owed),'Waiting to be paid by customers','bad')+statCard('Customers owing',String(db.length),'Each has a balance left to pay','gold')+'</div>'+
 '<section class="card">'+ttl('users','Who owes you','red')+'<p class="section-sub">Biggest balance first.</p><div class="recs">'+(db.map(debtRec).join('')||empty('Nobody owes you right now','When a customer pays only part, they appear here.'))+'</div></section></div>'}

var rep={type:'month',off:0};
function range(){var t=rep.type,o=rep.off,a,b,lbl;
 if(t==='week'){var d=new Date(NOW);d.setDate(d.getDate()-((d.getDay()+6)%7)+o*7);a=new Date(d);b=new Date(d);b.setDate(b.getDate()+7);var e=new Date(b);e.setDate(e.getDate()-1);
  lbl='Mon '+a.getDate()+' '+MON[a.getMonth()]+' to Sun '+e.getDate()+' '+MON[e.getMonth()]+' '+e.getFullYear()}
 else if(t==='month'){a=new Date(NOW.getFullYear(),NOW.getMonth()+o,1);b=new Date(a.getFullYear(),a.getMonth()+1,1);lbl=MONL[a.getMonth()]+' '+a.getFullYear()}
 else{a=new Date(NOW.getFullYear()+o,0,1);b=new Date(a.getFullYear()+1,0,1);lbl='Year '+a.getFullYear()}
 return {a:iso(a),b:iso(b),lbl:lbl}}
function vReports(){var all=metrics(ALL[0],ALL[1]),owed=sum(debtors(),function(d){return d.owed}),r=range(),m=metrics(r.a,r.b);
 var label=rep.type==='week'?'financial week':rep.type;
 return head('Reports','All-time totals, plus any financial week, month or year you choose. Weeks start on Monday.')+
 '<div class="stack"><div class="grid g3">'+statCard('Sales value',money(all.sales),'Everything you have sold')+statCard('Income received',money(all.recv),'Paid at sale plus repayments','gold')+statCard('Expenses',money(all.out),'All money out','terra')+
 statCard('Outstanding',money(owed),'Still to be paid by customers','bad')+statCard('Net cash position',money(all.net),'Income received minus expenses')+'</div>'+
 '<section class="card"><div class="plan-top"><div class="grow">'+ttl('calendar','Pick a period')+'</div>'+lockBtn('Download report','Downloading reports as PDF or Excel')+'</div><div class="period gap-t"><div class="seg" role="group" aria-label="Report period">'+['week','month','year'].map(function(k){return '<button data-rt="'+k+'" aria-pressed="'+(rep.type===k)+'">'+k[0].toUpperCase()+k.slice(1)+'</button>'}).join('')+'</div></div>'+
 '<div class="period gap-t"><button class="icon-btn" data-ro="-1" aria-label="Earlier '+label+'">'+svg('left')+'</button><div class="lbl" style="text-align:center">'+r.lbl+'</div><button class="icon-btn" data-ro="1" aria-label="Later '+label+'" '+(rep.off>=0?'disabled style="opacity:.35"':'')+'>'+svg('right')+'</button></div>'+
 '<div class="gap-t">'+[['Sales made',money(m.sales)],['Received when sold',money(m.atSale)],['Repayments received',money(m.rep)],['Total money received',money(m.recv)],['Money out','<span class="neg">'+money(m.out)+'</span>'],['Net cash for this '+(rep.type==='week'?'week':rep.type),'<span class="'+(m.net<0?'neg':'')+'">'+money(m.net)+'</span>']].map(function(k){return '<div class="kv"><span>'+k[0]+'</span><b>'+k[1]+'</b></div>'}).join('')+'</div></section></div>'}

function vTeam(){
 var c=cur(),rows='',used=S.mem.filter(function(m){return m.role!=='owner'}).length+S.inv.length,lim=teamLimit();
 var chip=function(m,k,l){var on=!!m['can_'+k];return isOwner()&&m.role!=='owner'?'<button class="chip" data-perm="can_'+k+'" data-uid="'+m.user_id+'" aria-pressed="'+on+'">'+l+'</button>':(on||m.role==='owner'?'<span class="chip" aria-pressed="true">'+l+'</span>':'')};
 S.mem.slice().sort(function(a,b){return a.role==='owner'?-1:b.role==='owner'?1:(a.created_at<b.created_at?-1:1)}).forEach(function(m){
  if(!isOwner()&&m.user_id!==S.user.id)return;
  var p=S.profs[m.user_id]||{},nm=p.full_name||p.email||'Team member';
  rows+='<div class="rec"><div class="ico">'+esc(ini(nm))+'</div><div style="min-width:0"><div class="t">'+esc(nm)+(m.user_id===S.user.id?' (you)':'')+'</div><div class="s">'+esc(p.email||'')+'</div></div><div class="amt"><span class="pill '+(m.role==='owner'?'':'rep')+'">'+(m.role==='owner'?'Owner':'Team member')+'</span></div>'+
   '<div class="row2"><div class="chips">'+chip(m,'record','Can add records')+chip(m,'edit','Can edit')+chip(m,'delete','Can delete')+'</div>'+(isOwner()&&m.role!=='owner'?'<button class="btn small danger" data-remove-member="'+m.user_id+'" style="margin-left:auto">Remove access</button>':'')+'</div></div>'});
 S.inv.forEach(function(i){rows+='<div class="rec"><div class="ico owe" style="background:var(--warn-soft);color:var(--warn)">'+svg('users',20)+'</div><div style="min-width:0"><div class="t">'+esc(i.email)+'</div><div class="s">Waiting for them to create an account</div></div><div class="amt"><span class="pill part">Invited</span></div><div class="row2"><button class="btn small" data-share-invite="'+esc(i.email)+'">Copy invite message</button><button class="btn small danger" data-cancel-invite="'+i.id+'">Cancel invite</button></div></div>'});
 var form=isOwner()?(used<lim?'<div class="inv-form"><h3 style="font:700 17px var(--f-display);margin-bottom:12px">Add a team member</h3><div class="field"><label for="invEmail">Their email</label><input class="in" id="invEmail" type="email" autocomplete="off" placeholder="name@example.com"></div>'+
  '<div class="chips"><label class="check" style="margin:0"><input type="checkbox" id="pRec" checked>Can add records</label><label class="check" style="margin:0"><input type="checkbox" id="pEdit">Can edit</label><label class="check" style="margin:0"><input type="checkbox" id="pDel">Can delete</label></div><div class="err" id="invErr" role="alert"></div><button class="btn small" data-act="invite">Add team member</button></div>'
  :'<div class="inv-form"><p class="section-sub">You have used '+used+' of '+lim+' team member'+(lim>1?'s':'')+' on the '+(plan()==='premium'?'Premium':'Free')+' plan.</p>'+(plan()==='premium'?'':'<div style="margin-top:12px"><button class="btn gold small" data-act="plans" data-f="Adding more team members">See Premium</button></div>')+'</div>'):'';
 return '<section class="card">'+ttl('users','Team')+'<p class="section-sub">'+(isOwner()?'Choose who can work in this business and what they can do. You can remove access at any time. ('+used+' of '+lim+' team member'+(lim>1?'s':'')+' used)':'This is what you can do in this business.')+'</p><div class="recs">'+rows+'</div>'+form+'</section>'}

function vPrefs(){var w=cur(),own=isOwner();
 var opts=function(o,v){return Object.keys(o).map(function(k){return '<option value="'+k+'" '+(k===v?'selected':'')+'>'+esc(o[k])+'</option>'}).join('')};
 var all=S.tSales.map(function(t){return {kind:'sale',d:t}}).concat(S.tExps.map(function(t){return {kind:'exp',d:t}}));
 var tr=all.map(function(t){var name=t.kind==='exp'?t.d.what:t.d.cust+' · '+t.d.item,amt=t.kind==='exp'?t.d.amount:t.d.price,left=Math.max(0,30-Math.floor((Date.now()-new Date(t.d.del).getTime())/DAY));
  return '<div class="rec"><div class="ico '+(t.kind==='exp'?'out':'')+'">'+svg('trash',20)+'</div><div style="min-width:0"><div class="t">'+esc(name)+'</div><div class="s">'+(t.kind==='exp'?'Expense':'Sale')+' · '+money(amt)+'</div></div><div class="amt"><small>Deleted automatically in '+left+' days</small></div>'+
  '<div class="row2"><button class="btn small" data-restore="'+t.kind+':'+t.d.id+'">Restore</button><button class="btn small danger" data-purge="'+t.kind+':'+t.d.id+'">Delete for good</button></div></div>'}).join('');
 return head('Settings','Your business details, how money and dates look, and the app theme.')+
 '<div class="stack"><section class="card"><div class="plan-top"><div class="grow"><h2 class="section-title ttl"><i class="ci gold">'+svg('crown',20)+'</i>Your plan <span class="pill part" style="font-family:var(--f-body)">'+(plan()==='premium'?'Premium':'Free')+'</span></h2><p class="section-sub">Everyday bookkeeping is free. Premium adds extra tools for growing businesses.</p></div><button class="btn gold small" data-act="plans" data-f="">'+svg('lock',16).replace('<svg','<svg class="lk"')+'See Premium</button></div></section>'+
 '<section class="card">'+ttl('building','Business profile')+'<div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin:20px 0 18px"><div class="ava" style="width:76px;height:76px;font-size:26px">'+(w.logo_url?'<img alt="" src="'+esc(w.logo_url)+'">':esc(ini(w.name)))+'</div>'+
 (own?'<div><label class="btn ghost small" for="logoIn" style="cursor:pointer">Change picture</label><input id="logoIn" type="file" accept="image/*" hidden><p class="section-sub" style="margin-top:8px">A square picture works best.</p></div>':'')+'</div>'+
 '<div class="field"><label for="bizName">Business name</label><input class="in" id="bizName" value="'+esc(w.name)+'" maxlength="80" '+(own?'':'readonly')+'></div>'+(own?'<button class="btn small" id="saveBiz">Save changes</button>':'<p class="section-sub">Only the owner can change business details.</p>')+'</section>'+
 '<section class="card">'+ttl('globe','Preferences')+'<p class="section-sub" style="margin-bottom:20px">Changes apply to every page straight away.</p><div class="row2c"><div class="field"><label for="curSel">Currency</label><select class="in" id="curSel" '+(own?'':'disabled')+'>'+opts(CURN,cc())+'</select></div>'+
 '<div class="field"><label for="dfSel">Date format</label><select class="in" id="dfSel" '+(own?'':'disabled')+'>'+opts(DFMT,w.date_format||'DD MMM YYYY')+'</select></div></div>'+
 '<div class="field"><label for="langSel">Language</label><select class="in" id="langSel"><option>English</option></select><small>More languages will be added later.</small></div></section>'+
 vTeam()+
 '<section class="card">'+ttl('palette','Theme')+'<p class="section-sub" style="margin-bottom:18px">Choose how LedgiBu looks on this device.</p><div class="seg" role="group" aria-label="Theme">'+[['light','Light'],['dark','Dark'],['system','Match my device']].map(function(k){return '<button data-theme-set="'+k[0]+'" aria-pressed="'+(theme===k[0])+'">'+k[1]+'</button>'}).join('')+'</div></section>'+
 '<section class="card">'+ttl('chat','Help and feedback')+'<p class="section-sub" style="margin-bottom:16px">Found a problem or have an idea? Tell us, and we will read it.</p><button class="btn ghost small" data-act="feedback">Send feedback</button></section>'+
 '<section class="card">'+ttl('users','Your account')+'<div class="kv"><span>Name</span><b>'+esc((S.profile&&S.profile.full_name)||'')+'</b></div><div class="kv"><span>Email</span><b style="overflow-wrap:anywhere">'+esc(S.user.email)+'</b></div><div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn ghost small" data-act="pwreset">Email me a password reset link</button><button class="btn ghost small" id="logoutBtn">Log out</button></div></section>'+
 (can('delete')?'<section class="card">'+ttl('trash','Trash','red')+'<p class="section-sub">Deleted items stay here for 30 days. Restore them or delete them for good.</p><div class="recs">'+(tr||empty('Trash is empty','Items you delete will wait here for 30 days.'))+'</div></section>':'')+'</div>'}

function vWorkspaces(){
 return head('Switch workspace','Each business keeps its own records. Pick one to work in, or start a new one.','<button class="btn gold" data-act="newws">'+svg('plus',18)+'Create a business</button>')+
 '<p class="section-sub" style="margin:-8px 0 18px">'+S.biz.filter(function(b){return b.created_by===S.user.id}).length+' of '+(plan()==='premium'?'unlimited':FREE_BIZ)+' business'+(plan()==='premium'?'es':'')+' you own on the '+(plan()==='premium'?'Premium':'Free')+' plan.</p><div class="stack">'+
 S.biz.map(function(w){var on=w.id===S.bid;return '<button class="ws-card" data-ws="'+w.id+'" '+(on?'aria-current="true"':'')+'><div class="ava">'+(w.logo_url?'<img alt="" src="'+esc(w.logo_url)+'">':esc(ini(w.name)))+'</div><div style="min-width:0"><b>'+esc(w.name)+'</b><span>'+(w.role==='owner'?'Owner':'Team member')+'</span></div>'+(on?'<span class="pill" style="margin-left:auto">Working here</span>':'<span class="pill part" style="margin-left:auto">Switch</span>')+'</button>'}).join('')+'</div>'}

var VIEWS={overview:vOverview,income:vIncome,expenses:vExpenses,debtors:vDebtors,reports:vReports,preferences:vPrefs,workspaces:vWorkspaces};
function chrome(){var w=cur();$('#wsName').textContent=w.name;$('#tbName').textContent=w.name;$('#wsRole').textContent=w.role==='owner'?'Owner':'Team member';
 var av=w.logo_url?'<img alt="" src="'+esc(w.logo_url)+'">':esc(ini(w.name));$('#wsAva').innerHTML=av;$('#tbAva').innerHTML=av}
function render(){
 if(!S.user||!cur())return;tick();var pg=route();renderNav(pg);chrome();
 if(!S.ready){$('#view').innerHTML='<div class="skel"></div><div class="skel"></div><div class="skel"></div>';return}
 var y=window.scrollY;$('#view').innerHTML=VIEWS[pg]();window.scrollTo(0,y)}
window.addEventListener('hashchange',function(){openMenu(false);if($('#app').hidden)return;render();window.scrollTo(0,0)});

/* ---------- toast and modal ---------- */
function toast(t){var el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=t;document.body.appendChild(el);setTimeout(function(){el.remove()},3200)}
function close(){$('#layer').innerHTML=''}
function modal(html,onSubmit){var l=$('#layer');l.innerHTML='<div class="modal" id="mdl"><form class="sheet" id="mform" novalidate>'+html+'</form></div>';
 var f=$('#mform');var first=f.querySelector('input:not([readonly]),select');if(first)first.focus();
 $('#mdl').addEventListener('click',function(e){if(e.target.id==='mdl')close()});
 f.addEventListener('click',function(e){if(e.target.closest('[data-close]')){e.preventDefault();close()}});
 f.addEventListener('submit',async function(e){e.preventDefault();var btn=f.querySelector('[type=submit]'),er=$('#merr');if(btn&&btn.disabled)return;if(btn)btn.disabled=true;if(er)er.classList.remove('on');
  try{var msg=await onSubmit(new FormData(f));if(msg){if(er){er.textContent=msg;er.classList.add('on')}if(btn)btn.disabled=false}else close()}
  catch(err){if(er){er.textContent=fe(err);er.classList.add('on')}if(btn)btn.disabled=false}})}
var fld=function(id,lab,extra,small){return '<div class="field"><label for="'+id+'">'+lab+'</label>'+extra+(small?'<small>'+small+'</small>':'')+'</div>'}
var cancel='<button class="btn ghost" data-close>Cancel</button>';
var err0='<div class="err" id="merr" role="alert"></div>';

function saleModal(debtorMode,ed){
 var names=Array.from(new Set(S.sales.map(function(s){return s.cust}))),lockName=ed&&saleAlloc(ed)>0;
 modal('<h2>'+(ed?'Edit sale':debtorMode?'Add a debtor':'Record income')+'</h2><p>'+(ed?'Fix a mistake in this sale.':debtorMode?'A customer who has not paid everything yet.':'Money from a sale. If the customer has not paid in full, they join your debtors automatically.')+'</p>'+err0+
  fld('fc','Customer name','<input class="in" id="fc" name="c" list="cl" autocomplete="off" value="'+esc(ed?ed.cust:'')+'" '+(lockName?'readonly':'')+'><datalist id="cl">'+names.map(function(n){return '<option value="'+esc(n)+'">'}).join('')+'</datalist>',lockName?'The name is locked because this customer has already made repayments.':'')+
  fld('fi','What was sold','<input class="in" id="fi" name="i" placeholder="For example, 4 office desks" value="'+esc(ed?ed.item:'')+'">')+
  '<div class="row2c">'+fld('fp','Sale price','<input class="in" id="fp" name="p" inputmode="decimal" placeholder="0.00" value="'+(ed?ed.price:'')+'">','The full amount charged.')+fld('fa',debtorMode?'Paid so far':'Amount received','<input class="in" id="fa" name="a" inputmode="decimal" placeholder="0.00" value="'+(ed?ed.paid:debtorMode?'0':'')+'">','Less than the price? They owe the rest.')+'</div>'+
  fld('fd','Date','<input class="in" id="fd" name="d" type="date" value="'+(ed?ed.date:iso(NOW))+'">')+'<div class="actions">'+cancel+'<button class="btn" type="submit">Save</button></div>',
  async function(f){var c=(f.get('c')||'').trim(),i=(f.get('i')||'').trim(),p=num(f.get('p')),a=f.get('a')===''?p:num(f.get('a'));
   if(!c)return 'Enter the customer name.';if(!i)return 'Enter what was sold.';if(!(p>0))return 'Enter the sale price.';if(isNaN(a)||a<0)return 'Enter the amount received, or 0 if nothing was paid.';
   if(a>p)return 'The amount received cannot be more than the sale price of '+money(p)+'.';if(debtorMode&&!ed&&a>=p)return 'This customer has paid in full, so they are not a debtor. Use Record income instead.';
   var row={sale_date:f.get('d')||iso(NOW),customer:c,item:i,price:p,paid:a},r;
   if(ed)r=await sb.from('sales').update(row).eq('id',ed.id);else r=await sb.from('sales').insert(Object.assign({business_id:S.bid},row));
   if(r.error)return fe(r.error);
   toast(ed?'Sale updated':a<p?c+' added to My Debtors':'Income saved');await refresh()})}

function expModal(ed){modal('<h2>'+(ed?'Edit expense':'Record expense')+'</h2><p>'+(ed?'Fix a mistake in this expense.':'Money the business spent.')+'</p>'+err0+
  fld('fw','What was it for','<input class="in" id="fw" name="w" placeholder="For example, Shop rent" value="'+esc(ed?ed.what:'')+'">')+
  '<div class="row2c">'+fld('fm','Amount','<input class="in" id="fm" name="m" inputmode="decimal" placeholder="0.00" value="'+(ed?ed.amount:'')+'">')+fld('fk','Type','<select class="in" id="fk" name="k">'+['Stock','Rent','Salaries','Transport','Bills','Other'].map(function(x){return '<option'+(ed&&ed.cat===x?' selected':'')+'>'+x+'</option>'}).join('')+'</select>')+'</div>'+
  fld('fd','Date','<input class="in" id="fd" name="d" type="date" value="'+(ed?ed.date:iso(NOW))+'">')+'<div class="actions">'+cancel+'<button class="btn" type="submit">Save</button></div>',
  async function(f){var w=(f.get('w')||'').trim(),m=num(f.get('m'));if(!w)return 'Enter what the money was spent on.';if(!(m>0))return 'Enter the amount.';
   var row={exp_date:f.get('d')||iso(NOW),what:w,category:f.get('k'),amount:m},r;
   if(ed)r=await sb.from('expenses').update(row).eq('id',ed.id);else r=await sb.from('expenses').insert(Object.assign({business_id:S.bid},row));
   if(r.error)return fe(r.error);toast(ed?'Expense updated':'Expense saved');await refresh()})}

function repayModal(c){var owe=owedBy(c);modal('<h2>Receive payment</h2><p>'+esc(c)+' owes '+money(owe)+'. The payment clears their oldest debt first.</p>'+err0+
  fld('fa','Amount received','<input class="in" id="fa" name="a" inputmode="decimal" placeholder="0.00">')+fld('fd','Date','<input class="in" id="fd" name="d" type="date" value="'+iso(NOW)+'">')+'<div class="actions">'+cancel+'<button class="btn" type="submit">Save payment</button></div>',
  async function(f){var a=num(f.get('a'));if(!(a>0))return 'Enter the amount received.';if(a>owe)return 'That is more than '+c+' owes. The most you can record is '+money(owe)+'.';
   var r=await sb.rpc('record_repayment',{p_business:S.bid,p_customer:c,p_amount:a,p_date:f.get('d')||iso(NOW)});if(r.error)return fe(r.error);
   await refresh();toast(owedBy(c)<=0?c+' has paid in full':'Payment saved')})}

function repEditModal(r){var owe=owedBy(r.cust),max=Math.round((owe+r.amount)*100)/100;
 modal('<h2>Edit payment</h2><p>Fix a mistake in this payment from '+esc(r.cust)+'. They owe '+money(owe)+' right now.</p>'+err0+
  fld('fa','Amount received','<input class="in" id="fa" name="a" inputmode="decimal" value="'+r.amount+'">','The most this payment can be is '+money(max)+'.')+
  fld('fd','Date','<input class="in" id="fd" name="d" type="date" value="'+esc(r.date)+'">')+
  '<div id="warn" class="msg-warn" hidden>Lowering this payment means '+esc(r.cust)+' will owe more again.<label class="check" style="margin:10px 0 0"><input type="checkbox" name="ack" id="ack">I understand</label></div>'+
  '<div class="actions">'+cancel+'<button class="btn" type="submit">Save changes</button></div>',
  async function(f){var a=num(f.get('a'));if(!(a>0))return 'Enter the amount received.';if(a>max)return 'That is more than '+r.cust+' owes. The most this payment can be is '+money(max)+'.';
   if(a<r.amount&&!f.get('ack'))return 'Tick "I understand" to confirm that '+r.cust+' will owe '+money(r.amount-a)+' more.';
   var x=await sb.rpc('edit_repayment',{p_repayment:r.id,p_amount:a,p_date:f.get('d')||r.date});if(x.error)return fe(x.error);toast('Payment updated');await refresh()});
 $('#fa').addEventListener('input',function(){$('#warn').hidden=!(num(this.value)<r.amount)})}
function inviteMsg(email,kind){var link=(location.origin+location.pathname).replace(/index\.html$/,''),b=cur().name;
 return kind==='added'?'Hi, I have added you to '+b+' on LedgiBu. Open '+link+', sign in, and choose '+b+' under "Switch workspace".'
  :'Hi, I have invited you to help with '+b+' on LedgiBu.\n1. Open '+link+'\n2. Tap "Create your profile" and use this exact email: '+email+'\n3. Confirm your email from the message we send you, then sign in.\nYou will see '+b+' in your account.'}
function inviteModal(email,kind){var msg=inviteMsg(email,kind);
 modal('<h2>Send them the invite</h2><p>'+(kind==='added'?'They already have a profile, so they can open '+esc(cur().name)+' now. Let them know:':'No email goes out automatically. Send them this message:')+'</p><div class="field"><label for="im">Message</label><textarea class="in" id="im" rows="8" readonly style="height:auto;padding:12px 16px;line-height:1.5"></textarea></div>'+
  '<div class="actions"><button class="btn ghost" data-close>Done</button><a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(msg)+'">Send on WhatsApp</a><button class="btn" type="button" id="cpy">Copy message</button></div>',function(){});
 $('#im').value=msg;
 $('#cpy').onclick=async function(){try{await navigator.clipboard.writeText(msg);toast('Message copied')}catch(e){var t=$('#im');t.focus();t.select();try{document.execCommand('copy');toast('Message copied')}catch(x){toast('Press and hold the message to copy it')}}}}
var FEEDBACK_EMAIL='ledgibu.app@tesadoy.com';
function feedbackModal(){
 function compose(){var k=$('#fbk').value,m=($('#fbm').value||'').trim();
  var body=m+'\n\n---\nFrom: '+((S.user&&S.user.email)||'')+'\nPage: '+route()+'\nDevice: '+navigator.userAgent+'\nApp: LedgiBu '+location.origin+location.pathname;
  return {subject:'LedgiBu feedback: '+k,body:body,message:m}}
 modal('<h2>Send feedback</h2><p>Tell us what is not working, or what would make LedgiBu better. Your message opens in your email app, and you can read it before you send it.</p>'+err0+
  fld('fbk','What is it about','<select class="in" id="fbk" name="k"><option>Something is not working</option><option>An idea or request</option><option>Something I like</option></select>')+
  fld('fbm','Your message','<textarea class="in" id="fbm" name="m" rows="5" style="height:auto;padding:12px 16px;line-height:1.5" placeholder="Describe what happened or what you would like."></textarea>','We add your email and your phone or browser type so we can reply and fix problems. No records or amounts are included.')+
  '<div class="actions">'+cancel+'<button class="btn" type="button" id="fbSend">Open in my email app</button></div>'+
  '<p style="margin-top:16px;font-size:13px;color:var(--muted)">Nothing opened? Send your message to <b style="user-select:all">'+FEEDBACK_EMAIL+'</b> yourself, or <button type="button" class="link-btn" id="fbCopy">copy it</button>.</p>',function(){});
 $('#fbSend').onclick=function(){var c=compose(),er=$('#merr');if(!c.message){er.textContent='Write your message first.';er.classList.add('on');return}er.classList.remove('on');
  window.location.href='mailto:'+FEEDBACK_EMAIL+'?subject='+encodeURIComponent(c.subject)+'&body='+encodeURIComponent(c.body)};
 $('#fbCopy').onclick=async function(){var c=compose(),er=$('#merr');if(!c.message){er.textContent='Write your message first.';er.classList.add('on');return}er.classList.remove('on');
  var t='To: '+FEEDBACK_EMAIL+'\nSubject: '+c.subject+'\n\n'+c.body;try{await navigator.clipboard.writeText(t);toast('Message copied')}catch(e){toast('Press and hold your message to copy it')}}}
function bizForm(first){var opts=Object.keys(CURN).map(function(k){return '<option value="'+k+'">'+esc(CURN[k])+'</option>'}).join('');
 return err0+fld('fn','Business name','<input class="in" id="fn" name="n" maxlength="80" placeholder="'+(first?'For example, Ada Fabrics':'Business name')+'">',first?'Using this for yourself? Call it "My money".':'')+fld('fcur','Currency','<select class="in" id="fcur" name="cur">'+opts+'</select>')}
async function createBiz(f){var n=(f.get('n')||'').trim();if(!n)return 'Enter a business name.';
 var r=await sb.rpc('create_business',{p_name:n,p_currency:f.get('cur')||'NGN'});if(r.error)return fe(r.error);
 S.bid=r.data;store.set('lg_bid',S.bid);await loadBiz();S.ready=false;await loadData();showApp();toast(n+' is ready')}
function newWs(){if(plan()!=='premium'&&S.biz.filter(function(b){return b.created_by===S.user.id}).length>=FREE_BIZ){planModal('Adding another business');return}
 modal('<h2>Create a business</h2><p>It gets its own records, separate from your other businesses.</p>'+bizForm(false)+'<div class="actions">'+cancel+'<button class="btn" type="submit">Create</button></div>',createBiz)}

function planModal(feature){
 var chk=function(t){return '<li>'+svg('check',18)+'<span>'+t+'</span></li>'};
 modal('<h2>LedgiBu Premium</h2><p>'+(feature?esc(feature)+' is part of Premium. ':'')+'Everything you use today stays free.</p>'+
  '<div class="tier"><h3>Free <small>Always free</small></h3><ul>'+chk('1 business')+chk('Income, expenses, debtors and reports, with no limit on records')+chk('Reports by week, month and year')+chk('Trash, themes, currencies and date formats')+chk('1 team member')+'</ul></div>'+
  '<div class="tier pro"><h3>Premium <small>Opens after launch</small></h3><ul>'+chk('More than 1 business')+chk('Up to 3 team members, each with their own permissions')+chk('Automatic backup of all your records')+chk('Download reports as PDF or Excel')+'</ul></div>'+
  '<div class="actions"><button class="btn" type="submit">Got it</button></div>',function(){})}
function confirmBox(title,text,label,fn){modal('<h2>'+title+'</h2><p>'+text+'</p>'+err0+'<div class="actions">'+cancel+'<button class="btn danger" type="submit">'+label+'</button></div>',fn)}

/* ---------- auth screens ---------- */
function gate(html){$('#app').hidden=true;var g=$('#gate');g.hidden=false;g.innerHTML='<div class="signin"><div class="sheet">'+html+'</div></div>'}
var BRAND='<div class="mark"><img src="icons/mark.svg" alt="LedgiBu" width="44" height="48"></div>';
function pwField(id,lab,auto){return fld(id,lab,'<input class="in" id="'+id+'" name="'+id+'" type="password" autocomplete="'+auto+'">')+'<label class="check"><input type="checkbox" data-showpw="'+id+'">Show password</label>'}
function authScreen(mode,note){
 var h=BRAND;
 if(mode==='in')h+='<h2>Welcome back</h2><p>Sign in to keep your books up to date.</p>'+(note?'<div class="msg-ok">'+esc(note)+'</div>':'')+'<form id="af" data-mode="in" novalidate><div class="err" id="aerr" role="alert"></div>'+fld('ae','Email','<input class="in" id="ae" name="ae" type="email" autocomplete="email" inputmode="email">')+pwField('ap','Password','current-password')+'<button class="btn" style="width:100%" type="submit">Sign in</button></form><div class="auth-links"><button class="link-btn" data-auth="forgot">Forgot password?</button></div><div class="newhere"><span>New to LedgiBu?</span><button class="btn ghost" style="width:100%" data-auth="up">Create your profile</button></div>';
 if(mode==='up')h+='<h2>Create your profile</h2><p>It is free and takes a minute.</p><form id="af" data-mode="up" novalidate><div class="err" id="aerr" role="alert"></div>'+fld('an','Your name','<input class="in" id="an" name="an" autocomplete="name">')+fld('ae','Email','<input class="in" id="ae" name="ae" type="email" autocomplete="email" inputmode="email">')+pwField('ap','Password (at least 8 characters)','new-password')+'<button class="btn" style="width:100%" type="submit">Create my profile</button></form><div class="auth-links"><span>Already have a profile?</span><button class="link-btn" data-auth="in">Sign in</button></div>';
 if(mode==='forgot')h+='<h2>Reset your password</h2><p>Enter your email and we will send you a link.</p><form id="af" data-mode="forgot" novalidate><div class="err" id="aerr" role="alert"></div>'+fld('ae','Email','<input class="in" id="ae" name="ae" type="email" autocomplete="email" inputmode="email">')+'<button class="btn" style="width:100%" type="submit">Send reset link</button></form><div class="auth-links"><button class="link-btn" data-auth="in">Back to sign in</button></div>';
 if(mode==='recover')h+='<h2>Choose a new password</h2><p>Use at least 8 characters.</p><form id="af" data-mode="recover" novalidate><div class="err" id="aerr" role="alert"></div>'+pwField('ap','New password','new-password')+'<button class="btn" style="width:100%" type="submit">Save password</button></form>';
 if(mode==='check')h+='<h2>Check your email</h2><p>'+esc(note)+'</p><button class="btn" style="width:100%" data-auth="in">Back to sign in</button>';
 gate(h);var f=$('#ae')||$('#ap');if(f)f.focus()}
function setupScreen(){
 var why=!window.supabase?'The file <b>vendor/supabase.js</b> did not load. Check that the <b>vendor</b> folder was uploaded to your GitHub repository, then reload this page.'
  :!window.LEDGIBU?'The file <b>config.js</b> did not load. Check that it was uploaded to your GitHub repository, then reload this page.'
  :'The settings in <b>config.js</b> are not filled in correctly. Check the Supabase address and key, then reload this page.';
 gate(BRAND+'<h2>Almost ready</h2><p>'+why+'</p>')}
function onboard(){var nm=(S.profile&&S.profile.full_name)||'';
 gate(BRAND+'<h2>Welcome'+(nm?', '+esc(nm.split(' ')[0]):'')+'</h2><p>Let us set up your first business. You can add more later.</p><form id="obf" novalidate>'+bizForm(true)+'<button class="btn" style="width:100%" type="submit">Start keeping my books</button></form><div class="auth-links"><button class="link-btn" id="obOut">Log out</button></div>');
 $('#obf').addEventListener('submit',async function(e){e.preventDefault();var b=e.target.querySelector('[type=submit]'),er=$('#merr');b.disabled=true;er.classList.remove('on');
  try{var m=await createBiz(new FormData(e.target));if(m){er.textContent=m;er.classList.add('on');b.disabled=false}}catch(x){er.textContent=fe(x);er.classList.add('on');b.disabled=false}});
 $('#obOut').onclick=function(){signOut()}}

document.addEventListener('submit',async function(e){var f=e.target;if(f.id!=='af')return;e.preventDefault();
 var mode=f.dataset.mode,er=$('#aerr'),b=f.querySelector('[type=submit]'),val=function(id){var x=$('#'+id);return x?x.value.trim():''};
 var email=val('ae').toLowerCase(),pw=$('#ap')?$('#ap').value:'';er.classList.remove('on');
 var fail=function(m){er.textContent=m;er.classList.add('on');b.disabled=false};
 if(mode!=='recover'&&!/^\S+@\S+\.\S+$/.test(email))return fail('Enter a valid email address.');
 if(mode==='up'){if(!val('an'))return fail('Enter your name.');if(pw.length<8)return fail('Your password needs at least 8 characters.')}
 if(mode==='in'&&!pw)return fail('Enter your password.');
 if(mode==='recover'&&pw.length<8)return fail('Your password needs at least 8 characters.');
 b.disabled=true;
 try{
  if(mode==='in'){var r=await sb.auth.signInWithPassword({email:email,password:pw});if(r.error)return fail(fe(r.error))}
  else if(mode==='up'){var r2=await sb.auth.signUp({email:email,password:pw,options:{data:{full_name:val('an')},emailRedirectTo:REDIRECT}});if(r2.error)return fail(fe(r2.error));
    if(!r2.data.session)authScreen('check','We sent a link to '+email+'. Open it to confirm your email, then come back here and sign in.')}
  else if(mode==='forgot'){var r3=await sb.auth.resetPasswordForEmail(email,{redirectTo:REDIRECT});if(r3.error)return fail(fe(r3.error));authScreen('check','If '+email+' has an account, we sent a link to reset the password. It may take a few minutes to arrive.')}
  else if(mode==='recover'){var r4=await sb.auth.updateUser({password:pw});if(r4.error)return fail(fe(r4.error));history.replaceState(null,'',location.pathname);await boot()}
 }catch(x){fail(fe(x))}});
document.addEventListener('change',function(e){var t=e.target;if(t.dataset&&t.dataset.showpw){var i=$('#'+t.dataset.showpw);if(i)i.type=t.checked?'text':'password'}});

async function signOut(){try{await sb.auth.signOut()}catch(e){}S.user=null;S.profile=null;S.biz=[];S.bid=null;S.ready=false;$('#layer').innerHTML='';authScreen('in')}
function confirmOut(){modal('<h2>Log out?</h2><p>Your records are safe. You can sign back in any time.</p><div class="actions">'+cancel+'<button class="btn" type="submit">Log out</button></div>',function(){setTimeout(signOut,0)})}

/* ---------- boot ---------- */
function showApp(){$('#gate').hidden=true;$('#gate').innerHTML='';$('#app').hidden=false;render()}
var booting=false;
async function boot(){
 if(booting)return;booting=true;
 try{
  var s=await sb.auth.getSession();if(!s.data.session){S.user=null;authScreen('in');return}
  S.user=s.data.session.user;await loadProfile();await loadBiz();
  if(!S.biz.length){onboard();return}
  S.ready=false;$('#gate').hidden=true;$('#app').hidden=false;render();
  await loadData();showApp();
 }catch(e){gate(BRAND+'<h2>We could not load your books</h2><p>'+esc(fe(e))+'</p><button class="btn" style="width:100%" id="retry">Try again</button>');$('#retry').onclick=function(){booting=false;boot()}}
 finally{booting=false}}

/* ---------- actions ---------- */
document.addEventListener('click',async function(e){
 var el=e.target.closest('button,a,[data-act]');if(!el)return;var a=el.dataset||{};
 if(el.id==='logoutLink'){e.preventDefault();openMenu(false);confirmOut();return}
 if(el.id==='moreBtn'){openMenu(true);return}
 if(el.id==='logoutBtn'){confirmOut();return}
 if(el.id==='helpBtn'){feedbackModal();return}
 if(a.auth){e.preventDefault();authScreen(a.auth);return}
 if(!S.user)return;
 try{
 if(a.act==='sale')saleModal(false);else if(a.act==='debtor')saleModal(true);else if(a.act==='exp')expModal();else if(a.act==='repay')repayModal(a.c);else if(a.act==='newws')newWs();
 else if(a.act==='plans')planModal(a.f);
 else if(a.act==='feedback')feedbackModal();
 else if(a.act==='pwreset'){var r=await sb.auth.resetPasswordForEmail(S.user.email,{redirectTo:REDIRECT});toast(r.error?fe(r.error):'We sent a reset link to '+S.user.email)}
 else if(a.act==='invite'){var em=($('#invEmail').value||'').trim().toLowerCase(),er=$('#invErr');er.classList.remove('on');
   if(!/^\S+@\S+\.\S+$/.test(em)){er.textContent='Enter a valid email address.';er.classList.add('on');return}
   el.disabled=true;var ri=await sb.rpc('invite_member',{p_business:S.bid,p_email:em,p_record:$('#pRec').checked,p_edit:$('#pEdit').checked,p_delete:$('#pDel').checked});el.disabled=false;
   if(ri.error){if(/plan allows/i.test(ri.error.message||'')){planModal('Adding more team members')}else{er.textContent=fe(ri.error);er.classList.add('on')}return}
   await refresh();inviteModal(em,ri.data)}
 else if(a.shareInvite)inviteModal(a.shareInvite,'invited')
 else if(a.editRep){var rp=S.reps.filter(function(y){return y.id===a.editRep})[0];if(rp)repEditModal(rp)}
 else if(a.rt){rep.type=a.rt;rep.off=0;render()}else if(a.ro){var n=rep.off+(+a.ro);if(n<=0){rep.off=n;render()}}
 else if(a.themeSet){theme=a.themeSet;store.set('lg_theme',theme);applyTheme();render()}
 else if(a.ws){S.bid=a.ws;store.set('lg_bid',S.bid);S.ready=false;render();toast('Now working in '+cur().name);await loadData();render();location.hash='overview'}
 else if(a.editSale){var s=S.sales.filter(function(x){return x.id===a.editSale})[0];if(s)saleModal(false,s)}
 else if(a.editExp){var x=S.exps.filter(function(y){return y.id===a.editExp})[0];if(x)expModal(x)}
 else if(a.delExp){var r1=await sb.from('expenses').update({deleted_at:new Date().toISOString()}).eq('id',a.delExp);if(r1.error)return toast(fe(r1.error));toast('Moved to Trash');await refresh()}
 else if(a.delSale){var s2=S.sales.filter(function(x){return x.id===a.delSale})[0];if(!s2)return;if(saleAlloc(s2)>0){toast('This sale has repayments linked to it, so it cannot be deleted.');return}
   var r2=await sb.from('sales').update({deleted_at:new Date().toISOString()}).eq('id',a.delSale);if(r2.error)return toast(fe(r2.error));toast('Moved to Trash');await refresh()}
 else if(a.restore){var p=a.restore.split(':');var r3=await sb.from(p[0]==='exp'?'expenses':'sales').update({deleted_at:null}).eq('id',p[1]);if(r3.error)return toast(fe(r3.error));toast('Restored');await refresh()}
 else if(a.purge){var q=a.purge.split(':');confirmBox('Delete for good?','This cannot be undone.','Delete for good',async function(){var r4=await sb.from(q[0]==='exp'?'expenses':'sales').delete().eq('id',q[1]);if(r4.error)return fe(r4.error);toast('Deleted for good');await refresh()})}
 else if(a.perm){var m=S.mem.filter(function(y){return y.user_id===a.uid})[0],val=!m[a.perm],up={};up[a.perm]=val;var r5=await sb.from('members').update(up).eq('business_id',S.bid).eq('user_id',a.uid);if(r5.error)return toast(fe(r5.error));m[a.perm]=val;render()}
 else if(a.removeMember){var pr=S.profs[a.removeMember]||{};confirmBox('Remove access?',esc(pr.full_name||pr.email||'This person')+' will no longer be able to open this business.','Remove access',async function(){var r6=await sb.from('members').delete().eq('business_id',S.bid).eq('user_id',a.removeMember);if(r6.error)return fe(r6.error);toast('Access removed');await refresh()})}
 else if(a.cancelInvite){var r7=await sb.from('invites').delete().eq('id',a.cancelInvite);if(r7.error)return toast(fe(r7.error));toast('Invite cancelled');await refresh()}
 else if(el.id==='saveBiz'){var v=$('#bizName').value.trim();if(!v)return toast('Enter a business name.');var r8=await sb.from('businesses').update({name:v}).eq('id',S.bid);if(r8.error)return toast(fe(r8.error));cur().name=v;toast('Business saved');render()}
 }catch(err){toast(fe(err))}
});
document.addEventListener('change',async function(e){var t=e.target;if(!S.user)return;
 try{
 if(t.id==='curSel'||t.id==='dfSel'){var up=t.id==='curSel'?{currency:t.value}:{date_format:t.value};var r=await sb.from('businesses').update(up).eq('id',S.bid);if(r.error){toast(fe(r.error));render();return}Object.assign(cur(),up);render()}
 else if(t.id==='logoIn'&&t.files[0]){var url=await shrink(t.files[0]);var r2=await sb.from('businesses').update({logo_url:url}).eq('id',S.bid);if(r2.error)return toast(fe(r2.error));cur().logo_url=url;toast('Picture updated');render()}
 }catch(err){toast(fe(err))}});
function shrink(file){return new Promise(function(res,rej){var fr=new FileReader();fr.onerror=function(){rej(new Error('Could not read that picture.'))};fr.onload=function(){var im=new Image();im.onerror=function(){rej(new Error('That file is not a picture.'))};im.onload=function(){var s=160,c=document.createElement('canvas');c.width=c.height=s;var x=c.getContext('2d'),m=Math.min(im.width,im.height);x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,s,s);res(c.toDataURL('image/jpeg',.82))};im.src=fr.result};fr.readAsDataURL(file)})}
$('#menuBtn').onclick=function(){openMenu(true)};$('#scrim').onclick=function(){openMenu(false)};
document.addEventListener('keydown',function(e){if(e.key==='Escape'){close();openMenu(false)}});
function net(){$('#offline').hidden=navigator.onLine}
window.addEventListener('online',function(){net();if(S.user)refresh().catch(function(){})});window.addEventListener('offline',net);net();
document.addEventListener('visibilitychange',function(){if(!document.hidden&&S.user&&S.ready&&!$('#layer').innerHTML)loadData().then(render).catch(function(){})});

/* ---------- start ---------- */
if(!sb){setupScreen()}
else{
 sb.auth.onAuthStateChange(function(ev,session){
  if(ev==='PASSWORD_RECOVERY'){S.user=session&&session.user;authScreen('recover');return}
  if(ev==='SIGNED_IN'&&session){if(S.user&&S.user.id===session.user.id)return;setTimeout(boot,0)}
  if(ev==='SIGNED_OUT'){S.user=null}
 });
 boot();
}
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}
})();
