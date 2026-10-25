(function(){
  'use strict';
  var D=window.JVE_DATA||{events:[]};
  var MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var MOL=['January','February','March','April','May','June','July','August','September','October','November','December'];
  function pd(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
  function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  var now=new Date(); var today=iso(now);
  var floor=today<D.updated?D.updated:today;
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];});}
  function fmt(s){var d=pd(s);return WD[d.getDay()]+', '+MO[d.getMonth()]+' '+d.getDate();}
  function short(s){var d=pd(s);return MO[d.getMonth()]+' '+d.getDate();}
  function days(a,b){return Math.round((pd(b)-pd(a))/864e5);}
  var ev=D.events.map(function(e){
    var ds=(e.dates||[]).filter(function(x){return x>=floor||(e.end_date&&e.end_date>=floor&&x===e.dates[0]);});
    return Object.assign({},e,{up:ds});
  }).filter(function(e){return e.up.length||(!e.dates.length&&e.schedule);});
  function dlSoon(e){return e.deadline&&e.deadline>=floor&&days(floor,e.deadline)<=14;}
  // months
  var months={};ev.forEach(function(e){e.up.forEach(function(x){months[x.slice(0,7)]=1;});});
  var ms=Object.keys(months).sort();
  var sel=document.getElementById('fMonth');
  ms.forEach(function(m){var o=document.createElement('option');o.value=m;o.textContent=MOL[+m.slice(5)-1]+' '+m.slice(0,4);sel.appendChild(o);});
  document.getElementById('stTotal').textContent=ev.length;
  document.getElementById('stDl').textContent=ev.filter(dlSoon).length;
  var fM=sel,fC=document.getElementById('fCounty'),fF=document.getElementById('fFee'),fQ=document.getElementById('fQ');
  function card(e,anchor){
    var b=[];
    if(dlSoon(e)) b.push('<span class="b hot">Deadline '+short(e.deadline)+'</span>');
    if(e.fee_bucket==='free') b.push('<span class="b free">Free to vend</span>');
    if(e.handmade) b.push('<span class="b">Handmade / juried focus</span>');
    b.push(e.verified?'<span class="b ok">Checked</span>':'<span class="b unv">Unverified</span>');
    var dt=anchor?pd(anchor):null;
    var dbox=dt?'<div class="dt'+(e.recurring?' rec':'')+'" aria-hidden="true"><span class="m">'+MO[dt.getMonth()].toUpperCase()+'</span><span class="d">'+dt.getDate()+'</span><span class="w">'+WD[dt.getDay()]+'</span></div>':'<div class="dt rec" aria-hidden="true"><span class="m">ONGOING</span><span class="d">↻</span></div>';
    var when='';
    if(anchor){when=fmt(anchor)+(e.end_date&&e.end_date!==anchor&&e.up.length===1?' – '+short(e.end_date):'');}
    var more=e.up.filter(function(x){return x!==anchor;});
    var whenLine=e.schedule?esc(e.schedule):'';
    if(more.length&&!e.projected) whenLine+=(whenLine?' · ':'')+'Also '+more.slice(0,4).map(short).join(', ')+(more.length>4?' +'+(more.length-4)+' more':'');
    if(e.projected) whenLine+=(whenLine?' · ':'')+'dates projected from the published schedule';
    var place=[e.city,e.county+' County',e.venue].filter(Boolean).map(esc).join(' · ');
    var fee=e.fee?'<b>'+esc(e.fee)+'</b>':'fee not listed';
    var lk=[];
    if(e.apply) lk.push('<a href="'+esc(e.apply)+'" target="_blank" rel="noopener">Apply / vendor info</a>');
    else if(e.contact) lk.push('<span>Contact: '+esc(e.contact)+'</span>');
    if(e.source&&e.source!==e.apply) lk.push('<a href="'+esc(e.source)+'" target="_blank" rel="noopener">'+(e.source_kind==='scan'?'Source (web match)':'Source')+'</a>');
    if(!e.apply&&!e.source) lk.push('<span>Link not on file yet</span>');
    if(e.last_checked) lk.push('<span>Last checked '+short(e.last_checked)+'</span>');
    var dl=(e.deadline&&!dlSoon(e)&&e.deadline>=floor)?'<p class="meta">Apply by '+short(e.deadline)+'</p>':(e.deadline_note&&!e.deadline?'<p class="meta">Applications: '+esc(e.deadline_note)+'</p>':'');
    return '<article class="card">'+dbox+'<div><div class="bd">'+b.join('')+'</div><h3>'+esc(e.name)+'</h3><p class="meta">'+place+'</p>'+(when?'<p class="when"><b style="color:#14212b">'+when+'</b>'+(whenLine?' · '+whenLine:'')+'</p>':(whenLine?'<p class="when">'+whenLine+'</p>':''))+'<p class="fee">Vendor fee: '+fee+'</p>'+dl+'<p class="lk">'+lk.join('')+'</p></div></article>';
  }
  function render(){
    var m=fM.value,c=fC.value,f=fF.value,q=fQ.value.trim().toLowerCase();
    var rows=[];
    ev.forEach(function(e){
      if(c&&e.county!==c) return;
      if(f&&e.fee_bucket!==f) return;
      if(q&&[e.name,e.city,e.venue,e.county,e.organizer].join(' ').toLowerCase().indexOf(q)<0) return;
      var a=e.up;
      if(m){a=a.filter(function(x){return x.slice(0,7)===m;}); if(!a.length) return;}
      rows.push({e:e,a:a[0]||null});
    });
    rows.sort(function(x,y){return (x.a||'9999')<(y.a||'9999')?-1:(x.a||'9999')>(y.a||'9999')?1:x.e.name.localeCompare(y.e.name);});
    var out='',cur='';
    rows.forEach(function(r){
      var k=r.a?r.a.slice(0,7):'ongoing';
      if(k!==cur){ if(cur) out+='</div>'; cur=k; out+='<h2 class="month">'+(r.a?MOL[+k.slice(5)-1]+' '+k.slice(0,4):'Ongoing — dates on organizer page')+'</h2><div class="grid">'; }
      out+=card(r.e,r.a);
    });
    if(cur) out+='</div>';
    document.getElementById('list').innerHTML=out||'<p class="empty">No events match those filters.</p>';
    document.getElementById('count').textContent=rows.length+' event'+(rows.length===1?'':'s')+' shown';
  }
  [fM,fC,fF].forEach(function(x){x.addEventListener('change',render);});
  fQ.addEventListener('input',render);
  render();
})();
