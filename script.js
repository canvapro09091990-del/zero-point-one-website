
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Keep the existing WhatsApp enquiry functionality.
const enquiryForm = document.getElementById('enquiry-form');

if (enquiryForm) {
  enquiryForm.addEventListener('submit', event => {
    event.preventDefault();

    const number = (
      window.ZPO_CONFIG &&
      window.ZPO_CONFIG.whatsappNumber || ''
    ).replace(/\D/g, '');

    const status = document.getElementById('form-status');

    if (!number || number === '91XXXXXXXXXX' || number.length < 10) {
      if (status) {
        status.textContent =
          'WhatsApp is not configured. Please check config.js.';
      }
      return;
    }

    const data = new FormData(enquiryForm);

    const message = [
      'Hello Zero Point One, I would like to discuss an enquiry.',
      '',
      'Name: ' + (data.get('name') || ''),
      'Company: ' + (data.get('company') || 'Not provided'),
      'Requirement: ' + (data.get('need') || ''),
      'Project details: ' + (data.get('message') || '')
    ].join('\n');

    window.open(
      'https://wa.me/' + number + '?text=' + encodeURIComponent(message),
      '_blank',
      'noopener,noreferrer'
    );

    if (status) {
      status.textContent =
        'WhatsApp opened with your enquiry prepared. Review it and press Send in WhatsApp.';
    }
  });
}


 // Load business insight cards from the public JSON file.
async function loadBusinessInsights() {
  const grid = document.getElementById('insight-grid');
  const updated = document.getElementById('cards-updated');

  if (!grid || !updated) return;

  const escapeHtml = value =>
    String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);

  const safeUrl = value => {
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol)
        ? url.href
        : '';
    } catch {
      return '';
    }
  };

  try {
    const response = await fetch(
      './data/news-cards.json?v=' + Date.now(),
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Could not load insight data');
    }

    const payload = await response.json();
    const cards = Array.isArray(payload.cards)
      ? payload.cards.slice(0, 5)
      : [];

    if (!cards.length) {
      throw new Error('No insight cards found');
    }

    grid.innerHTML = cards.map(card => {
      const isNews = String(card.type || '').toLowerCase() === 'news';
      const sourceUrl = safeUrl(card.source_url);

      const dateText = isNews
        ? (card.published_at || '')
        : '';

      const label = isNews
        ? 'LATEST NEWS'
        : 'PRACTICAL GUIDE';

      const sourceLink = isNews && sourceUrl
  ? `<a class="insight-source" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">Read original article ↗</a>`
  : isNews
    ? '<span class="evergreen-badge">Original link unavailable</span>'
    : '';

      const publisher = isNews && card.publisher
        ? `<span class="insight-publisher">${escapeHtml(card.publisher)}</span>`
        : '';

      return `
        <article class="insight-card">
          <div class="insight-type">
            ${escapeHtml(card.category || 'Business & technology')}
          </div>

          <h3>${escapeHtml(card.title || 'A business challenge to solve')}</h3>

          <div class="insight-label">THE CHALLENGE</div>
          <p>${escapeHtml(card.problem || 'Businesses need practical ways to improve their work.')}</p>

          <div class="insight-label">A PRACTICAL NEXT STEP</div>
          <p class="insight-solution">${escapeHtml(card.solution || 'Start with a small, measurable improvement.')}</p>

          <div class="insight-footer">
            <span class="evergreen-badge">${label}</span>
            ${dateText ? `<span class="insight-date">${escapeHtml(dateText)}</span>` : ''}
            ${publisher}
            ${sourceLink}
          </div>
        </article>
      `;
    }).join('');

    updated.textContent = payload.updated_at
      ? 'Updated ' + payload.updated_at +
        ' · News links are credited to their original publishers.'
      : 'Business insights · News links are credited to their original publishers.';

  } catch (error) {
    grid.innerHTML = `
      <article class="insight-card">
        <div class="insight-type">ZERO POINT ONE / INSIGHTS</div>
        <h3>Make one workflow easier this week.</h3>
        <div class="insight-label">THE CHALLENGE</div>
        <p>Repeated manual tasks can slow teams down and make progress difficult to track.</p>
        <div class="insight-label">A PRACTICAL NEXT STEP</div>
        <p class="insight-solution">Choose one repetitive task, document the steps, and test a simple form, spreadsheet or automation.</p>
        <div class="insight-footer">
          <span class="evergreen-badge">PRACTICAL GUIDE</span>
        </div>
      </article>
    `;

    updated.textContent = 'Showing a practical guide while the latest cards load.';
  }
}

loadBusinessInsights();
