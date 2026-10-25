(function(){
  'use strict';
  var H='162c8e48e83400fb9cac9947ab71ea63e5e27490040529ddae7283fda6991d64'; // SHA-256 of the draft password; the password itself is not in this code
  var K='jve_unlock';
  function unlock(){document.documentElement.classList.remove('locked');}
  async function sha(t){var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return Array.prototype.map.call(new Uint8Array(b),function(x){return x.toString(16).padStart(2,'0');}).join('');}
  try{if(localStorage.getItem(K)===H){unlock();return;}}catch(e){}
  document.addEventListener('DOMContentLoaded',function(){
    var f=document.getElementById('gateForm'); if(!f) return;
    f.addEventListener('submit',async function(e){
      e.preventDefault();
      var v=document.getElementById('gatePw').value.trim();
      if(await sha(v)===H){try{localStorage.setItem(K,H);}catch(_e){} unlock();}
      else{document.getElementById('gateErr').textContent='That password didn\'t match.';}
    });
  });
})();
