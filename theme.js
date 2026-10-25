/* Jax Vendor Events: color themes + dark mode (runs in <head> before paint) */
(function(){
  'use strict';
  var THEMES={"sunset":{"name":"Sunset Coast","desc":"Cream, sunset orange & teal","meta":"#f7f3ea","dark":false,"sw":["#c4461a","#0d6e6e","#12324a"],"bg":"#f7f3ea","bar":"#c4461a","metaDark":"#0b1520","bgDark":"#0b1520","swDark":["#f2784a","#4fc2bb","#121e2b"]},"midnight":{"name":"Midnight Gold","desc":"Deep navy-black with warm gold","meta":"#0a0e16","dark":true,"sw":["#f0c869","#8fb3d9","#4a3c1f"],"bg":"#0a0e16","bar":"#c9973a","metaDark":"#0a0e16","bgDark":"#0a0e16","swDark":["#f0c869","#8fb3d9","#4a3c1f"]},"ocean":{"name":"Ocean Glass","desc":"Deep teal & aqua over warm sand · Tab’s pick","meta":"#f4efe6","dark":false,"sw":["#075f6b","#1d5f8a","#05303d"],"bg":"#f4efe6","bar":"#075f6b","metaDark":"#041a20","bgDark":"#041a20","swDark":["#2fc4bf","#6fb6e3","#0a242c"]},"palm":{"name":"Palm & Coral","desc":"Soft sage, palm green & coral","meta":"#f2f5ee","dark":false,"sw":["#cc4334","#2f7a55","#163a2b"],"bg":"#f2f5ee","bar":"#cc4334","metaDark":"#0c1611","bgDark":"#0c1611","swDark":["#ff7a63","#6fcf9a","#122019"]},"mono":{"name":"Pure Mono","desc":"Crisp white, graphite & electric blue","meta":"#fafafa","dark":false,"sw":["#2f4bff","#111214","#eeeeef"],"bg":"#fafafa","bar":"#111214","metaDark":"#0b0b0d","bgDark":"#0b0b0d","swDark":["#6f86ff","#8a9cff","#131416"]}};
  var ORDER=['sunset','midnight','ocean','palm','mono'];
  var DEFAULT='ocean';
  var MODES=[['light','Light'],['dark','Dark'],['auto','Auto']];
  var K='jve_theme', KM='jve_mode', root=document.documentElement, mq=null;
  try{mq=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;}catch(e){}
  function get(k){try{return localStorage.getItem(k);}catch(e){return null;}}
  function put(k,v){try{localStorage.setItem(k,v);}catch(e){}}
  function theme(){var s=get(K);return THEMES[s]?s:DEFAULT;}
  function modePref(){var m=get(KM);return (m==='light'||m==='dark'||m==='auto')?m:'auto';}
  function phoneDark(){return !!(mq&&mq.matches);}
  function isDark(t,m){if(THEMES[t].dark)return true;return m==='dark'||(m==='auto'&&phoneDark());}
  function setMeta(t,dark){var c=dark?THEMES[t].metaDark:THEMES[t].meta;
    var ms=document.querySelectorAll('meta[name="theme-color"]');if(!ms.length){var n=document.createElement('meta');n.name='theme-color';document.head.appendChild(n);ms=[n];}
    for(var i=0;i<ms.length;i++){ms[i].removeAttribute('media');ms[i].setAttribute('content',c);}
    var s=document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');if(s)s.setAttribute('content',dark?'black-translucent':'default');}
  function sync(){var t=root.getAttribute('data-theme'),m=modePref(),dark=root.getAttribute('data-mode')==='dark';
    var opts=document.querySelectorAll('.topt');for(var i=0;i<opts.length;i++){var k=opts[i].getAttribute('data-theme'),T=THEMES[k],dk=T.dark||dark;
      opts[i].setAttribute('aria-checked',String(k===t));var pv=opts[i].querySelector('.tprev');if(pv){pv.style.background=dk?T.bgDark:T.bg;var sw=pv.querySelectorAll('.sw'),cols=dk?T.swDark:T.sw;for(var j=0;j<sw.length;j++)sw[j].style.background=cols[j];}}
    var seg=document.querySelectorAll('.mseg button');for(var x=0;x<seg.length;x++)seg[x].setAttribute('aria-checked',String(seg[x].getAttribute('data-mode')===m));
    var h=document.getElementById('modeHint');if(h)h.textContent=THEMES[t].dark?'Midnight Gold is always dark.':(m==='auto'?'Auto follows your phone (now '+(phoneDark()?'dark':'light')+').':(m==='dark'?'Dark backgrounds for night use.':'Bright and clean for daytime.'));}
  function apply(animate){var t=theme(),m=modePref(),dark=isDark(t,m);
    if(animate){root.classList.add('theming');clearTimeout(apply._t);apply._t=setTimeout(function(){root.classList.remove('theming');},520);}
    root.setAttribute('data-theme',t);root.setAttribute('data-mode',dark?'dark':'light');root.style.colorScheme=dark?'dark':'light';setMeta(t,dark);sync();}
  apply(false);
  window.JVE_THEMES={list:ORDER,themes:THEMES,defaultTheme:DEFAULT,
    apply:function(t){if(!THEMES[t])return;put(K,t);apply(true);},
    setMode:function(m){if(m!=='light'&&m!=='dark'&&m!=='auto')return;put(KM,m);apply(true);},
    current:function(){return root.getAttribute('data-theme');},mode:function(){return modePref();},
    effectiveMode:function(){return root.getAttribute('data-mode');}};
  if(mq){var on=function(){if(modePref()==='auto')apply(true);else sync();};mq.addEventListener?mq.addEventListener('change',on):mq.addListener&&mq.addListener(on);}
  window.addEventListener('storage',function(e){if(e.key===K||e.key===KM)apply(true);});
  var CHECK='<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var X='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var GEAR='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
  var ICO={light:'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    dark:'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    auto:'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M12 6.5a5.5 5.5 0 0 1 0 11z" fill="currentColor"/></svg>'};
  function build(){
    var hdr=document.querySelector('.top .wrap');if(!hdr||document.getElementById('themeBtn'))return;
    var b=document.createElement('button');b.type='button';b.id='themeBtn';b.className='themebtn';b.setAttribute('aria-label','Settings');b.setAttribute('aria-haspopup','dialog');b.title='Settings';
    b.innerHTML=GEAR;hdr.appendChild(b);
    var sc=document.createElement('div');sc.className='tsheet-scrim';sc.id='themeScrim';
    var sh=document.createElement('div');sh.className='tsheet';sh.id='themeSheet';sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');sh.setAttribute('aria-labelledby','themeTitle');sh.hidden=true;
    var h='<div class="grab" aria-hidden="true"></div><button type="button" class="x" id="themeClose" aria-label="Close">'+X+'</button><h2 id="themeTitle">Settings</h2><p class="tsub">Saved on this device</p>';
    h+='<p class="slabel">Appearance</p><div class="sgroup"><div class="srow"><span class="stitle"><b id="modeLabel">Dark mode</b><small id="modeHint"></small></span></div><div class="mseg" role="radiogroup" aria-labelledby="modeLabel">';
    MODES.forEach(function(m){h+='<button type="button" role="radio" data-mode="'+m[0]+'" aria-checked="false">'+ICO[m[0]]+'<span>'+m[1]+'</span></button>';});
    h+='</div></div><p class="slabel">Theme</p><ul class="tlist" role="radiogroup" aria-label="Color theme">';
    ORDER.forEach(function(k){var t=THEMES[k];
      h+='<li><button type="button" class="topt" role="radio" data-theme="'+k+'" aria-checked="false"><span class="tprev"><span class="sw"></span><span class="sw"></span><span class="sw"></span><span class="bar" style="background:'+t.bar+'"></span></span><span class="tname"><b>'+t.name+'</b><small>'+t.desc+'</small></span><span class="tcheck">'+CHECK+'</span></button></li>';});
    h+='</ul><p class="slabel">Near me</p><div class="sgroup"><label class="srow" for="homeCounty"><span class="stitle"><b>Home county</b><small>Used for “Near me” when location is off. Stays on this device.</small></span></label><div class="hsel"><select id="homeCounty"><option value="">Not set</option>'+['Duval','St. Johns','Clay','Nassau','Baker','Flagler','Putnam'].map(function(c){return '<option'+(get('jve_home')===c?' selected':'')+'>'+c+'</option>';}).join('')+'</select></div></div><p class="tfoot">Every theme has a light and a dark look. Auto switches with your phone.</p>';
    sh.innerHTML=h;document.body.appendChild(sc);document.body.appendChild(sh);
    sync();
    var last=null;
    function open(){last=document.activeElement;sh.hidden=false;void sh.offsetWidth;sh.classList.add('open');sc.classList.add('open');var c=sh.querySelector('.mseg [aria-checked=true]')||sh.querySelector('.topt');if(c)c.focus({preventScroll:true});}
    function close(){sh.classList.remove('open');sc.classList.remove('open');setTimeout(function(){if(!sh.classList.contains('open'))sh.hidden=true;},380);if(last&&last.focus)last.focus({preventScroll:true});}
    b.addEventListener('click',open);sc.addEventListener('click',close);document.getElementById('themeClose').addEventListener('click',close);
    var tb=document.querySelectorAll('[data-open-settings]');for(var i=0;i<tb.length;i++)tb[i].addEventListener('click',open);
    sh.addEventListener('click',function(e){var o=e.target.closest('.topt');if(o){window.JVE_THEMES.apply(o.getAttribute('data-theme'));return;}var s=e.target.closest('.mseg button');if(s)window.JVE_THEMES.setMode(s.getAttribute('data-mode'));});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&sh.classList.contains('open')){e.stopPropagation();close();}},true);
    var hc=document.getElementById('homeCounty');if(hc)hc.addEventListener('change',function(){put('jve_home',hc.value);try{window.dispatchEvent(new Event('jve:home'));}catch(_){}});
    window.JVE_THEMES.open=open;window.JVE_THEMES.close=close;
    extras();
  }
  function standalone(){try{return (window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;}catch(e){return false;}}
  function extras(){
    // iPhone "Add to Home Screen" hint, shown once (unlocked only)
    var ios=/iphone|ipad|ipod/i.test(navigator.userAgent||'')||/[?&]a2hs=1/.test(location.search);
    if(ios&&!standalone()&&!get('jve_a2hs')&&!root.classList.contains('locked')){
      var c=document.createElement('div');c.className='a2hs';c.setAttribute('role','note');
      c.innerHTML='<span class="a2i"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg></span><span class="a2t"><b>Install the app</b><small>Tap Share, then “Add to Home Screen”. Opens full screen, works offline.</small></span><button type="button" class="a2x" aria-label="Dismiss">'+X+'</button>';
      document.body.appendChild(c);setTimeout(function(){c.classList.add('show');},900);
      c.querySelector('.a2x').addEventListener('click',function(){put('jve_a2hs','1');c.classList.remove('show');setTimeout(function(){c.remove();},400);});
    }
    // pull to refresh (home-screen app only; Safari has its own)
    if(standalone()||/[?&]ptr=1/.test(location.search)){
      var ind=document.createElement('div');ind.className='ptr';ind.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v4h-4"/></svg>';document.body.appendChild(ind);
      var y0=null,dy=0;
      document.addEventListener('touchstart',function(e){if(window.scrollY<=0&&!document.querySelector('.sheet.open,.tsheet.open')){y0=e.touches[0].clientY;dy=0;}},{passive:true});
      document.addEventListener('touchmove',function(e){if(y0===null)return;dy=Math.max(0,Math.min(130,(e.touches[0].clientY-y0)*0.55));ind.style.transform='translate(-50%,'+(dy-50)+'px) rotate('+(dy*2.6)+'deg)';ind.classList.toggle('ready',dy>72);ind.style.opacity=String(Math.min(1,dy/60));},{passive:true});
      document.addEventListener('touchend',function(){if(y0===null)return;y0=null;if(dy>72){ind.classList.add('spin');setTimeout(function(){location.reload();},350);}else{ind.style.transform='';ind.style.opacity='0';}});
    }
  }
  // offline: cache the app on this device (network first, so updates show right away)
  if('serviceWorker' in navigator&&location.protocol==='https:'){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
