(() => {
  'use strict';

  const PASSCODE = '0203';
  const SESSION_KEY = 'rapGoingHubUnlocked_v1';

  const gatePanel = document.getElementById('gate-panel');
  const hubPanel = document.getElementById('hub-panel');
  const form = document.getElementById('gate-form');
  const input = document.getElementById('gate-input');
  const error = document.getElementById('gate-error');

  function showHub() {
    sessionStorage.setItem(SESSION_KEY, '1');
    gatePanel.classList.add('is-hidden');
    hubPanel.classList.remove('is-hidden');
    error.textContent = '';
  }

  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    showHub();
  } else {
    setTimeout(() => input.focus(), 120);
  }

  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 4);
    error.textContent = '';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (input.value === PASSCODE) {
      showHub();
      return;
    }

    error.textContent = '口令不对，再试一次。';
    input.value = '';
    input.focus();

    gatePanel.classList.remove('shake');
    void gatePanel.offsetWidth;
    gatePanel.classList.add('shake');
  });
})();
