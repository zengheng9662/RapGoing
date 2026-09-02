(() => {
  'use strict';
  const PASSWORD='0203';
  const locked=document.getElementById('locked-view');
  const unlocked=document.getElementById('unlocked-view');
  const form=document.getElementById('unlock-form');
  const pin=document.getElementById('pin');
  const error=document.getElementById('error');

  function showUnlocked(){ locked.classList.add('is-hidden'); unlocked.classList.remove('is-hidden'); }
  if(sessionStorage.getItem('rgChildhoodUnlocked')==='1') showUnlocked();
  else setTimeout(()=>pin.focus(),100);

  pin.addEventListener('input',()=>{ pin.value=pin.value.replace(/\D/g,'').slice(0,4); error.textContent=''; });
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(pin.value===PASSWORD){ sessionStorage.setItem('rgChildhoodUnlocked','1'); showUnlocked(); return; }
    error.textContent='口令不正确';
    locked.classList.remove('shake');void locked.offsetWidth;locked.classList.add('shake');pin.select();
  });
})();
