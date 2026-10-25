(function(){
  'use strict';
  var D=window.JVE_DATA||{events:[]};
  var MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var MOL=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var COUNTIES=['Duval','St. Johns','Clay','Nassau','Baker','Flagler','Putnam'];
  function $(id){return document.getElementById(id);}
  function pd(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
  function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function add(s,n){var d=pd(s);d.setDate(d.getDate()+n);return iso(d);}
  var today=iso(new Date());
  var floor=today<D.updated?D.updated:today;
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];});}
  function ico(n,c){return '<svg class="ico'+(c?' '+c:'')+'" aria-hidden="true"><use href="#i-'+n+'"/></svg>';}
  function fmt(s){var d=pd(s);return WD[d.getDay()]+', '+MO[d.getMonth()]+' '+d.getDate();}
  function short(s){var d=pd(s);return MO[d.getMonth()]+' '+d.getDate();}
  function days(a,b){return Math.round((pd(b)-pd(a))/864e5);}
  function safeUrl(u){return /^https?:\/\//i.test(u||'')?u:null;}
  var ev=D.events.map(function(e){
    var ds=(e.dates||[]).filter(function(x){return x>=floor||(e.end_date&&e.end_date>=floor&&x===e.dates[0]);});
    return Object.assign({},e,{up:ds});
  }).filter(function(e){return e.up.length||(!e.dates.length&&e.schedule);});
  var byId={};ev.forEach(function(e){byId[e.id]=e;});
  function hasDl(e){return e.deadline&&e.deadline>=floor;}
  function dlSoon(e){return hasDl(e)&&days(floor,e.deadline)<=30;}
  // this weekend: Fri..Sun around the next Sunday on/after floor
  var fd=pd(floor),sun=add(floor,(7-fd.getDay())%7),fri=add(sun,-2);var wkStart=fri<floor?floor:fri;
  function inWeekend(e){return e.up.some(function(x){return x>=wkStart&&x<=sun;})||(e.end_date&&e.up.length&&e.up[0]<=sun&&e.end_date>=wkStart);}
  function feeLabel(e){if(e.fee_bucket==='free')return 'Free to vend';if(!e.fee)return 'Fee not listed';if(e.fee.length<=14)return e.fee;var m=e.fee.match(/\$[\d.,]*\d/);return m?m[0]+'+':'See details';}
  // months
  var months={};ev.forEach(function(e){e.up.forEach(function(x){months[x.slice(0,7)]=1;});});
  var fM=$('fMonth'),fC=$('fCounty'),fF=$('fFee'),fS=$('fSort'),fQ=$('fQ');
  Object.keys(months).sort().forEach(function(m){var o=document.createElement('option');o.value=m;o.textContent=MOL[+m.slice(5)-1]+' '+m.slice(0,4);fM.appendChild(o);});
  $('stTotal').textContent=ev.length;
  $('stDl').textContent=ev.filter(dlSoon).length;
  $('nAll').textContent=ev.length;$('nWk').textContent=ev.filter(inWeekend).length;$('nFree').textContent=ev.filter(function(e){return e.fee_bucket==='free';}).length;$('nDl').textContent=ev.filter(dlSoon).length;
  // deadline strip
  var dls=ev.filter(hasDl).sort(function(a,b){return a.deadline<b.deadline?-1:1;}).slice(0,10);
  $('dlStrip').innerHTML=dls.map(function(e){var n=days(floor,e.deadline);
    return '<button class="dl" type="button" data-id="'+esc(e.id)+'"><span class="cd"><b>'+(n<=0?'!':n)+'</b><small>'+(n<=0?'today':n===1?'day':'days')+'</small></span><span class="t"><b>'+esc(e.name)+'</b><span>Apply by '+short(e.deadline)+' · '+esc(e.county)+'</span></span></button>';}).join('');
  if(!dls.length) $('dlStrip').closest('section').hidden=true;
  var quick='',view='list';
  function badges(e,full){
    var b=[];
    if(dlSoon(e)) b.push('<span class="b hot">'+ico('clock')+'Apply by '+short(e.deadline)+'</span>');
    b.push('<span class="b county">'+esc(e.county)+'</span>');
    b.push('<span class="b fee'+(e.fee_bucket==='free'?' free':'')+'">'+ico('tag')+esc(feeLabel(e))+'</span>');
    if(e.recurring) b.push('<span class="b rec">'+ico('repeat')+'Recurring</span>');
    if(e.handmade&&full) b.push('<span class="b">Handmade / juried</span>');
    b.push(e.verified?'<span class="b ok">'+ico('check')+'Verified</span>':'<span class="b unv">Unverified</span>');
    return b.join('');
  }
  function card(e,anchor,i){
    var dt=anchor?pd(anchor):null;
    var dbox=dt?'<span class="dt'+(e.recurring?' rec':'')+'" aria-hidden="true"><span class="m">'+MO[dt.getMonth()].toUpperCase()+'</span><span class="d">'+dt.getDate()+'</span><span class="w">'+WD[dt.getDay()]+'</span></span>':'<span class="dt rec" aria-hidden="true"><span class="m">ONGOING</span><span class="d">∞</span><span class="w">see page</span></span>';
    var place=[e.city,e.venue].filter(Boolean).map(esc).join(' · ')||esc(e.county)+' County';
    return '<button class="card" type="button" data-id="'+esc(e.id)+'" data-a="'+(anchor||'')+'" style="animation-delay:'+Math.min(i,12)*30+'ms">'+dbox+'<span class="cb"><span class="ct">'+esc(e.name)+'</span><span class="meta">'+ico('pin','sm')+'<span>'+place+'</span></span><span class="bd">'+badges(e)+'</span></span>'+ico('right','chev')+'</button>';
  }
  function filtered(){
    var m=fM.value,c=fC.value,f=fF.value,q=fQ.value.trim().toLowerCase(),rows=[];
    ev.forEach(function(e){
      if(c&&e.county!==c) return;
      if(f&&e.fee_bucket!==f) return;
      if(quick==='free'&&e.fee_bucket!=='free') return;
      if(quick==='deadline'&&!dlSoon(e)) return;
      if(quick==='weekend'&&!inWeekend(e)) return;
      if(q&&[e.name,e.city,e.venue,e.county,e.organizer].join(' ').toLowerCase().indexOf(q)<0) return;
      var a=e.up;
      if(quick==='weekend'){var w=a.filter(function(x){return x>=wkStart&&x<=sun;});a=w.length?w:a;}
      if(m){a=a.filter(function(x){return x.slice(0,7)===m;}); if(!a.length) return;}
      rows.push({e:e,a:a[0]||null});
    });
    var s=fS.value;
    function bydate(x,y){return (x.a||'9999')<(y.a||'9999')?-1:(x.a||'9999')>(y.a||'9999')?1:x.e.name.localeCompare(y.e.name);}
    var FR={free:0,under50:1,'50plus':2,unknown:3};
    rows.sort(function(x,y){
      if(s==='deadline'){var dx=hasDl(x.e)?x.e.deadline:'9999',dy=hasDl(y.e)?y.e.deadline:'9999';if(dx!==dy)return dx<dy?-1:1;}
      if(s==='free'){var fx=FR[x.e.fee_bucket],fy=FR[y.e.fee_bucket];if(fx!==fy)return fx-fy;}
      return bydate(x,y);});
    return rows;
  }
  function group(rows,keyf,labelf){
    var out='',cur=null,buf=[],i=0;
    function flush(){if(cur!==null){out+='<h2 class="month">'+labelf(cur)+' <small>'+buf.length+' event'+(buf.length===1?'':'s')+'</small></h2><div class="grid">'+buf.join('')+'</div>';}}
    rows.forEach(function(r){var k=keyf(r);if(k!==cur){flush();cur=k;buf=[];}buf.push(card(r.e,r.a,i++));});
    flush();return out;
  }
  function render(){
    var rows=filtered(),html='';
    var active=!!(fM.value||fC.value||fF.value||fQ.value.trim()||quick||fS.value!=='soon');
    $('fClear').hidden=!active;
    [fM,fC,fF].forEach(function(x){x.parentNode.classList.toggle('on',!!x.value);});
    if(!rows.length){
      html='<div class="empty"><div class="art">'+ico('search','lg')+'</div><h3>No events match</h3><p>Try another month, county or fee, or clear the filters.</p><button class="btn ghost" type="button" data-clear>Clear filters</button></div>';
    }else if(view==='county'){
      var cnt={};rows.forEach(function(r){cnt[r.e.county]=(cnt[r.e.county]||0)+1;});
      var mx=Math.max.apply(null,COUNTIES.map(function(c){return cnt[c]||0;}));
      html='<div class="cgrid">'+COUNTIES.filter(function(c){return cnt[c];}).map(function(c){return '<button class="cty" type="button" data-county="'+esc(c)+'"><b>'+cnt[c]+'</b><span>'+esc(c)+'</span><span class="bar"><i style="width:'+Math.round(cnt[c]/mx*100)+'%"></i></span></button>';}).join('')+'</div>';
      var ordered=rows.slice().sort(function(x,y){var a=COUNTIES.indexOf(x.e.county),b=COUNTIES.indexOf(y.e.county);return a-b;});
      html+=group(ordered,function(r){return r.e.county;},function(k){return '<span id="cty-'+esc(k.replace(/\W/g,''))+'">'+esc(k)+' County</span>';});
    }else if(fS.value==='soon'){
      html=group(rows,function(r){return r.a?r.a.slice(0,7):'ongoing';},function(k){return k==='ongoing'?'Ongoing — dates on organizer page':MOL[+k.slice(5)-1]+' '+k.slice(0,4);});
    }else{
      var lab=fS.value==='deadline'?'Sorted by application deadline':'Free to vend first';
      html=group(rows,function(){return 'all';},function(){return lab;});
    }
    $('list').innerHTML=html;
    $('count').innerHTML='<b>'+rows.length+'</b> event'+(rows.length===1?'':'s')+' shown';
    $('countSub').textContent=quick==='weekend'?(short(wkStart)+(wkStart!==sun?' – '+short(sun):'')):'';
  }
  function setQuick(q){quick=q;document.querySelectorAll('.tab').forEach(function(t){t.setAttribute('aria-pressed',String(t.dataset.q===q));});render();}
  function clearAll(){fM.value=fC.value=fF.value='';fS.value='soon';fQ.value='';setQuick('');}
  document.querySelectorAll('.tab').forEach(function(t){t.addEventListener('click',function(){setQuick(t.dataset.q===quick?'':t.dataset.q);});});
  document.querySelectorAll('.seg button').forEach(function(b){b.addEventListener('click',function(){view=b.dataset.v;document.querySelectorAll('.seg button').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});render();});});
  [fM,fC,fF,fS].forEach(function(x){x.addEventListener('change',render);});
  var qt;fQ.addEventListener('input',function(){clearTimeout(qt);qt=setTimeout(render,120);});
  $('fClear').addEventListener('click',clearAll);
  // sticky shadow
  var disc=$('disc'),sent=document.createElement('div');sent.style.height='1px';disc.parentNode.insertBefore(sent,disc);
  if('IntersectionObserver' in window){new IntersectionObserver(function(en){disc.classList.toggle('stuck',!en[0].isIntersecting);},{rootMargin:'-70px 0px 0px 0px'}).observe(sent);}
  // detail sheet
  var sheet=$('sheet'),scrim=$('scrim'),curE=null,curA=null,lastFocus=null;
  function row(ic,k,v){return v?'<dl class="kv">'+ico(ic)+'<dt>'+k+'</dt><dd>'+v+'</dd></dl>':'';}
  function lnk(u,t){var s=safeUrl(u);return s?'<a href="'+esc(s)+'" target="_blank" rel="noopener">'+esc(t||s.replace(/^https?:\/\/(www\.)?/,'').split('/')[0])+'</a>':esc(u);}
  function openSheet(id,anchor){
    var e=byId[id];if(!e) return;curE=e;curA=anchor||e.up[0]||null;lastFocus=document.activeElement;
    $('shBadges').innerHTML=badges(e,true);
    $('shTitle').textContent=e.name;
    $('shSub').innerHTML=ico('pin','sm')+esc([e.city,e.county+' County'].filter(Boolean).join(', '));
    var when=curA?'<b>'+fmt(curA)+'</b>'+(e.end_date&&e.end_date!==curA&&e.up.length===1?' – '+fmt(e.end_date):''):'';
    var more=e.up.filter(function(x){return x!==curA;});
    var extra=[];if(e.schedule) extra.push(esc(e.schedule));
    if(more.length) extra.push((e.projected?'Next: ':'Also ')+more.slice(0,5).map(short).join(', ')+(more.length>5?' +'+(more.length-5)+' more':''));
    if(e.projected) extra.push('dates projected from the published schedule');
    var apply=safeUrl(e.apply);
    var appl=[];if(hasDl(e)) appl.push('<b>Apply by '+fmt(e.deadline)+'</b> ('+days(floor,e.deadline)+' days)');if(e.deadline_note) appl.push(esc(e.deadline_note));
    var contact=[];if(e.apply) contact.push(lnk(e.apply,apply?'Application / vendor info':null));if(e.contact) contact.push(/@/.test(e.contact)&&!/\s/.test(e.contact)?'<a href="mailto:'+esc(e.contact)+'">'+esc(e.contact)+'</a>':esc(e.contact));
    var src=e.source?lnk(e.source)+(e.source_kind==='scan'?' <span style="color:var(--mut)">(web match)</span>':e.source_kind==='database'?' <span style="color:var(--mut)">(vendor database)</span>':''):'';
    $('shBody').innerHTML=
      row('cal','When',[when,extra.join(' · ')].filter(Boolean).join('<br>')||'See organizer page')+
      row('pin','Where',esc([e.venue,e.city,e.county+' County'].filter(Boolean).join(', ')))+
      row('tag','Vendor fee',e.fee?esc(e.fee):(e.fee_bucket==='free'?'Free':'Fee not listed'))+
      row('clock','Applications',appl.join('<br>'))+
      row('link','Apply / contact',contact.join('<br>')||'Link not on file yet')+
      row('user','Organizer',esc(e.organizer))+
      row('ext','Source',src)+
      row('check','Last checked',e.last_checked?fmt(e.last_checked)+', '+e.last_checked.slice(0,4):'Not yet re-checked')+
      (e.verified?'<p class="sh-note ok">'+ico('shield')+'<span>Verified against the organizer\'s own page. Still confirm details before you pay.</span></p>':'<p class="sh-note">'+ico('info')+'<span>Unverified: from a public post or web scan, not re-checked yet. Confirm with the organizer before you pay.</span></p>');
    var ap=$('shApply');if(apply){ap.href=apply;ap.hidden=false;}else if(safeUrl(e.source)){ap.href=e.source;ap.hidden=false;ap.firstChild.textContent='View source ';}else{ap.hidden=true;}
    if(apply) ap.firstChild.textContent='Apply / vendor info ';
    $('shIcs').disabled=!curA;
    sheet.setAttribute('aria-hidden','false');sheet.classList.add('open');scrim.classList.add('open');document.body.style.overflow='hidden';
    $('shBody').scrollTop=0;setTimeout(function(){$('shClose').focus({preventScroll:true});},60);
    try{history.replaceState(null,'','#e='+encodeURIComponent(e.id));}catch(_){}
  }
  function closeSheet(){if(!sheet.classList.contains('open'))return;sheet.classList.remove('open');scrim.classList.remove('open');sheet.setAttribute('aria-hidden','true');sheet.style.transform='';document.body.style.overflow='';
    try{history.replaceState(null,'',location.pathname+location.search);}catch(_){} if(lastFocus&&lastFocus.focus) lastFocus.focus({preventScroll:true});}
  document.addEventListener('click',function(ev2){
    var t=ev2.target.closest('[data-id]');if(t&&!t.closest('.sheet')){openSheet(t.dataset.id,t.dataset.a);return;}
    if(ev2.target.closest('[data-clear]')){clearAll();return;}
    var c=ev2.target.closest('[data-county]');if(c){var el=$('cty-'+c.dataset.county.replace(/\W/g,''));if(el) el.scrollIntoView({behavior:'smooth',block:'start'});}
  });
  scrim.addEventListener('click',closeSheet);$('shClose').addEventListener('click',closeSheet);
  document.addEventListener('keydown',function(k){if(k.key==='Escape') closeSheet();
    if(k.key==='Tab'&&sheet.classList.contains('open')){var f=sheet.querySelectorAll('a[href]:not([hidden]),button:not([disabled])');if(!f.length)return;var a=f[0],z=f[f.length-1];if(k.shiftKey&&document.activeElement===a){z.focus();k.preventDefault();}else if(!k.shiftKey&&document.activeElement===z){a.focus();k.preventDefault();}}});
  // swipe down to close (mobile)
  var y0=null,dy=0;sheet.addEventListener('touchstart',function(t){if(t.target.closest('.sh-body')&&$('shBody').scrollTop>0)return;y0=t.touches[0].clientY;dy=0;},{passive:true});
  sheet.addEventListener('touchmove',function(t){if(y0===null)return;dy=Math.max(0,t.touches[0].clientY-y0);if(dy>0){sheet.style.transition='none';sheet.style.transform='translateY('+dy+'px)';}},{passive:true});
  sheet.addEventListener('touchend',function(){if(y0===null)return;sheet.style.transition='';y0=null;if(dy>110)closeSheet();else sheet.style.transform='';});
  function toast(m){var t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove('show');},2200);}
  function icsEsc(s){return String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/([,;])/g,'\\$1');}
  function fold(l){var o='';while(l.length>74){o+=l.slice(0,74)+'\r\n ';l=l.slice(74);}return o+l;}
  $('shIcs').addEventListener('click',function(){
    var e=curE;if(!e||!curA)return;
    var end=(e.end_date&&e.end_date>curA&&e.up.length===1)?add(e.end_date,1):add(curA,1);
    var desc=['Vendor fee: '+(e.fee||'fee not listed'),e.apply?'Apply: '+e.apply:'',e.source?'Source: '+e.source:'',e.verified?'Verified':'Unverified, confirm with the organizer'].filter(Boolean).join('\n');
    var stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
    var L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Jax Vendor Events//Draft//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+e.id+'-'+curA+'@jaxvendorevents','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+curA.replace(/-/g,''),'DTEND;VALUE=DATE:'+end.replace(/-/g,''),
      'SUMMARY:'+icsEsc(e.name),'LOCATION:'+icsEsc([e.venue,e.city,e.county+' County, FL'].filter(Boolean).join(', ')),'DESCRIPTION:'+icsEsc(desc)];
    if(safeUrl(e.apply||e.source)) L.push('URL:'+safeUrl(e.apply||e.source));
    L.push('END:VEVENT','END:VCALENDAR');
    var blob=new Blob([L.map(fold).join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'});
    var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=e.name.replace(/[^\w]+/g,'-').replace(/^-|-$/g,'').slice(0,50)+'-'+curA+'.ics';
    document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},800);toast('Calendar file downloaded');
  });
  $('shShare').addEventListener('click',function(){
    var e=curE;if(!e)return;var url=location.origin+location.pathname+'#e='+encodeURIComponent(e.id);
    var text=e.name+(curA?' · '+fmt(curA):'')+' · '+[e.city,e.county+' County'].filter(Boolean).join(', ');
    if(navigator.share){navigator.share({title:e.name,text:text,url:url}).catch(function(){});}
    else if(navigator.clipboard){navigator.clipboard.writeText(text+'\n'+url).then(function(){toast('Link copied');},function(){toast(url);});}
    else toast(url);
  });
  render();
  var h=location.hash.match(/^#e=(.+)$/);if(h){var id=decodeURIComponent(h[1]);setTimeout(function(){openSheet(id);},150);}
})();
