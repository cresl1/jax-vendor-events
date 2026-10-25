(function(){
  'use strict';
  var f=document.getElementById('signupForm'); if(!f) return;
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var m=document.getElementById('suMsg');
    m.textContent='Thanks! Signup isn\u2019t switched on yet \u2014 this is a draft, so nothing was saved or sent.';
  });
})();
