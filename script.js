// IMPORTANT: Set your WhatsApp number in config.js before publishing.
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('enquiry-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const number = (window.ZPO_CONFIG && window.ZPO_CONFIG.whatsappNumber || '').replace(/\D/g, '');
  const status = document.getElementById('form-status');
  if (!number || number === '91XXXXXXXXXX' || number.length < 10) {
    status.textContent = 'WhatsApp is not configured yet. Open config.js and enter your business WhatsApp number with country code.';
    return;
  }
  const data = new FormData(event.currentTarget);
  const message = [
    'Hello Zero Point One, I would like to discuss an enquiry.',
    '',
    'Name: ' + (data.get('name') || ''),
    'Company: ' + (data.get('company') || 'Not provided'),
    'Requirement: ' + (data.get('need') || ''),
    'Project details: ' + (data.get('message') || '')
  ].join('\n');
  window.open('https://wa.me/' + number + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
  status.textContent = 'WhatsApp opened with your enquiry prepared. Review it and press Send in WhatsApp.';
});
