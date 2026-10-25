/* Jax Vendor Events: color themes (runs in <head> before paint) */
(function(){
  'use strict';
  var THEMES={"sunset":{"name":"Sunset Coast","desc":"Cream, sunset orange & teal","meta":"#f7f3ea","dark":false,"sw":["#f0663a","#0d6e6e","#12324a"],"bg":"#f7f3ea","bar":"#f0663a"},"midnight":{"name":"Midnight Gold","desc":"Deep navy-black with warm gold","meta":"#0a0e16","dark":true,"sw":["#f0c869","#8fb3d9","#4a3c1f"],"bg":"#0a0e16","bar":"#c9973a"},"ocean":{"name":"Ocean Glass","desc":"Deep teal & aqua over warm sand","meta":"#f4efe6","dark":false,"sw":["#075f6b","#1d5f8a","#05303d"],"bg":"#f4efe6","bar":"#075f6b"},"palm":{"name":"Palm & Coral","desc":"Soft sage, palm green & coral","meta":"#f2f5ee","dark":false,"sw":["#cc4334","#2f7a55","#163a2b"],"bg":"#f2f5ee","bar":"#cc4334"},"mono":{"name":"Pure Mono","desc":"Crisp white, graphite & electric blue","meta":"#fafafa","dark":false,"sw":["#2f4bff","#111214","#eeeeef"],"bg":"#fafafa","bar":"#111214"}};
  var ORDER=['sunset','midnight','ocean','palm','mono'];
  var K='jve_theme', root=document.documentElement;
  function saved(){try{return localStorage.getItem(K);}catch(e){return null;}}
  function initial(){var s=saved();if(THEMES[s])return s;try{if(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)return 'midnight';}catch(e){}return 'sunset';}
  function setMeta(t){var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m);}m.setAttribute('content',THEMES[t].meta);
    var s=document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');if(s)s.setAttribute('content',THEMES[t].dark?'black-translucent':'default');}
  function apply(t,animate){if(!THEMES[t])t='sunset';
    if(animate){root.classList.add('theming');clearTimeout(apply._t);apply._t=setTimeout(function(){root.classList.remove('theming');},520);}
    root.setAttribute('data-theme',t);setMeta(t);
    var opts=document.querySelectorAll('.topt');for(var i=0;i<opts.length;i++)opts[i].setAttribute('aria-checked',String(opts[i].getAttribute('data-theme')===t));}
  apply(initial(),false);
  window.JVE_THEMES={list:ORDER,themes:THEMES,apply:function(t){try{localStorage.setItem(K,t);}catch(e){}apply(t,true);},current:function(){return root.getAttribute('data-theme');}};
  try{var mq=matchMedia('(prefers-color-scheme: dark)');var on=function(e){if(!THEMES[saved()])apply(e.matches?'midnight':'sunset',true);};mq.addEventListener?mq.addEventListener('change',on):mq.addListener(on);}catch(e){}
  var CHECK='<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var X='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  function build(){
    var hdr=document.querySelector('.top .wrap');if(!hdr||document.getElementById('themeBtn'))return;
    var b=document.createElement('button');b.type='button';b.id='themeBtn';b.className='themebtn';b.setAttribute('aria-label','Color theme');b.setAttribute('aria-haspopup','dialog');b.title='Color theme';
    b.innerHTML='<span class="tdots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';hdr.appendChild(b);
    var sc=document.createElement('div');sc.className='tsheet-scrim';sc.id='themeScrim';
    var sh=document.createElement('div');sh.className='tsheet';sh.id='themeSheet';sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');sh.setAttribute('aria-labelledby','themeTitle');sh.hidden=true;
    var h='<div class="grab" aria-hidden="true"></div><button type="button" class="x" id="themeClose" aria-label="Close">'+X+'</button><h2 id="themeTitle">Appearance</h2><p class="tsub">Settings · pick a color theme</p><ul class="tlist" role="radiogroup" aria-label="Color theme">';
    ORDER.forEach(function(k){var t=THEMES[k];
      h+='<li><button type="button" class="topt" role="radio" data-theme="'+k+'" aria-checked="false"><span class="tprev" style="background:'+t.bg+'"><span class="sw" style="background:'+t.sw[0]+'"></span><span class="sw" style="background:'+t.sw[1]+'"></span><span class="sw" style="background:'+t.sw[2]+'"></span><span class="bar" style="background:'+t.bar+'"></span></span><span class="tname"><b>'+t.name+'</b><small>'+t.desc+'</small></span><span class="tcheck">'+CHECK+'</span></button></li>';});
    h+='</ul><p class="tfoot">Saved on this device. Dark mode phones start on Midnight Gold.</p>';
    sh.innerHTML=h;document.body.appendChild(sc);document.body.appendChild(sh);
    apply(root.getAttribute('data-theme'),false);
    var last=null;
    function open(){last=document.activeElement;sh.hidden=false;void sh.offsetWidth;sh.classList.add('open');sc.classList.add('open');var c=sh.querySelector('.topt[aria-checked=true]')||sh.querySelector('.topt');if(c)c.focus({preventScroll:true});}
    function close(){sh.classList.remove('open');sc.classList.remove('open');setTimeout(function(){if(!sh.classList.contains('open'))sh.hidden=true;},380);if(last&&last.focus)last.focus({preventScroll:true});}
    b.addEventListener('click',open);sc.addEventListener('click',close);document.getElementById('themeClose').addEventListener('click',close);
    sh.addEventListener('click',function(e){var o=e.target.closest('.topt');if(o)window.JVE_THEMES.apply(o.getAttribute('data-theme'));});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&sh.classList.contains('open')){e.stopPropagation();close();}},true);
    window.JVE_THEMES.open=open;window.JVE_THEMES.close=close;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
