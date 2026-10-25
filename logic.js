/* Jax Vendor Events: pure helpers (saved list, deadline countdowns, distance). No network, device-only. */
(function(g){
  'use strict';
  function pd(s){var p=String(s).split('-');return Date.UTC(+p[0],+p[1]-1,+p[2]);}
  function daysBetween(a,b){return Math.round((pd(b)-pd(a))/864e5);}
  // countdown chip for an application deadline (dates as YYYY-MM-DD, deadline = last day to apply)
  function countdown(today,deadline){
    if(!deadline||deadline<today)return null;
    var n=daysBetween(today,deadline);
    var text=n===0?'Apply today':n===1?'Apply by tomorrow':'Apply in '+n+' days';
    return {days:n,text:text,urgent:n<=3};   // urgent = closing within ~72 h
  }
  function parseSaved(raw){try{var a=JSON.parse(raw||'[]');return Array.isArray(a)?a.filter(function(x){return typeof x==='string';}):[];}catch(e){return [];}}
  function toggleSaved(list,id){var a=list.slice(),i=a.indexOf(id);if(i>-1)a.splice(i,1);else a.push(id);return a;}
  var CITY=[["world golf",29.97,-81.47],["st. augustine beach",29.85,-81.27],["st. augustine",29.894,-81.314],["east palatka",29.65,-81.60],["palatka",29.648,-81.637],["neptune beach",30.312,-81.396],["atlantic beach",30.334,-81.399],["jacksonville beach",30.294,-81.393],["jax beach",30.294,-81.393],["mayport",30.385,-81.43],["keystone heights",29.786,-82.031],["palm coast",29.585,-81.208],["nocatee",30.10,-81.42],["yulee",30.632,-81.606],["flagler beach",29.475,-81.127],["ortega",30.27,-81.705],["oakleaf",30.17,-81.83],["orange park",30.166,-81.706],["hastings",29.718,-81.508],["westside",30.30,-81.78],["southside",30.25,-81.58],["fernandina",30.669,-81.462],["amelia",30.62,-81.45],["hilliard",30.691,-81.917],["green cove",29.992,-81.678],["ponte vedra",30.24,-81.385],["mandarin",30.16,-81.65],["northside",30.42,-81.65],["fleming island",30.093,-81.72],["bunnell",29.466,-81.258],["middleburg",30.069,-81.86],["riverside",30.31,-81.685],["san marco",30.305,-81.655],["callahan",30.562,-81.83],["jacksonville",30.332,-81.656]];
  var COUNTY={"Duval":[30.33,-81.66],"St. Johns":[29.95,-81.42],"Clay":[29.98,-81.86],"Nassau":[30.60,-81.77],"Baker":[30.33,-82.28],"Flagler":[29.47,-81.28],"Putnam":[29.61,-81.74]};
  // approximate town/county center for a listing (never a street address)
  function place(e){var c=String((e&&e.city)||'').toLowerCase();for(var i=0;i<CITY.length;i++){if(c.indexOf(CITY[i][0])>-1)return [CITY[i][1],CITY[i][2]];}var k=COUNTY[e&&e.county];return k?k.slice():null;}
  function miles(a,b){if(!a||!b)return null;var R=3958.8,r=Math.PI/180,dl=(b[0]-a[0])*r,dg=(b[1]-a[1])*r;var h=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dg/2)*Math.sin(dg/2);return 2*R*Math.asin(Math.sqrt(h));}
  var api={countdown:countdown,daysBetween:daysBetween,parseSaved:parseSaved,toggleSaved:toggleSaved,place:place,miles:miles,COUNTY:COUNTY};
  g.JVE_LOGIC=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
