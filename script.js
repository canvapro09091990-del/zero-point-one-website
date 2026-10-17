
/* =========================================================
   ZERO POINT ONE — MAIN JAVASCRIPT
   Mobile navigation, WhatsApp enquiry and business insights
   ========================================================= */


/* ---------------------------------------------------------
   1. MOBILE NAVIGATION
   --------------------------------------------------------- */

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}


/* ---------------------------------------------------------
   2. AUTOMATIC FOOTER YEAR
   --------------------------------------------------------- */

const year = document.getElementById('year');

if (year) {
  year.textContent = new Date().getFullYear();
}


/* ---------------------------------------------------------
   3. WHATSAPP ENQUIRY FORM
   --------------------------------------------------------- */

const enquiryForm = document.getElementById('enquiry-form');

if (enquiryForm) {
  enquiryForm.addEventListener('submit', event => {
    event.preventDefault();

    const number = (
      window.ZPO_CONFIG &&
      window.ZPO_CONFIG.whatsappNumber
        ? window.ZPO_CONFIG.whatsappNumber
        : ''
    ).replace(/\D/g, '');

    const status = document.getElementById('form-status');

    if (
      !number ||
      number === '91XXXXXXXXXX' ||
      number.length < 10
    ) {
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

    const whatsappUrl =
      'https://wa.me/' +
      number +
      '?text=' +
      encodeURIComponent(message);

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    );

    if (status) {
      status.textContent =
        'WhatsApp opened with your enquiry prepared. ' +
        'Review it and press Send in WhatsApp.';
    }
  });
}


/* ---------------------------------------------------------
   4. HELPER FUNCTIONS FOR BUSINESS INSIGHT CARDS
   --------------------------------------------------------- */

// Escape text before inserting it into HTML.
function escapeInsightHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}


// Allow only HTTP and HTTPS URLs.
function getSafeInsightUrl(value) {
  try {
    const url = new URL(value, window.location.href);

    if (!['https:', 'http:'].includes(url.protocol)) {
      return '';
    }

    return url.href;
  } catch {
    return '';
  }
}


// Match card topics to the available enquiry services.
function getInsightService(card) {
  const cardText = [
    card.category || '',
    card.title || '',
    card.problem || '',
    card.solution || ''
  ].join(' ').toLowerCase();

  // Keep cybersecurity enquiries on the general enquiry option
  // until a dedicated cybersecurity option exists in the form.
  if (
    /cybersecurity|cyber security|hacking|hack\b|malware|phishing|ransomware|vulnerability|data breach|information security/.test(cardText)
  ) {
    return 'Other enquiry';
  }

  if (
    /mobile app|mobile application|android|ios|iphone/.test(cardText)
  ) {
    return 'Mobile application';
  }

  if (
    /website|web development|web application|web design|landing page/.test(cardText)
  ) {
    return 'Website development';
  }

  if (
    /software|developer|programming|coding|codebase|software development/.test(cardText)
  ) {
    return 'Software development';
  }

  if (
    /automation|workflow|repetitive task|manual process|project management|project delivery/.test(cardText)
  ) {
    return 'Managed project support';
  }

  return 'Other enquiry';
}


// Select the matching option in the contact form.
function selectInsightEnquiryService(requestedService) {
  const needField = document.getElementById('need');

  if (!needField || !requestedService) {
    return;
  }

  const matchingOption = Array.from(needField.options).find(option => {
    return (
      option.value.trim() === requestedService ||
      option.text.trim() === requestedService
    );
  });

  if (matchingOption) {
    needField.value = matchingOption.value;

    needField.dispatchEvent(
      new Event('change', { bubbles: true })
    );
  }
}


/* ---------------------------------------------------------
   5. RENDER BUSINESS INSIGHT CARDS
   --------------------------------------------------------- */

function renderBusinessInsightCard(card) {
  const isNews =
    String(card.type || '').toLowerCase() === 'news';

  const category = escapeInsightHtml(
    card.category || 'Business & technology'
  );

  const title = escapeInsightHtml(
    card.title || 'A business challenge to solve'
  );

  const problem = escapeInsightHtml(
    card.problem ||
    'Businesses need practical ways to improve their work.'
  );

  const solution = escapeInsightHtml(
    card.solution ||
    'Start with a small, measurable improvement.'
  );

  const publisher = escapeInsightHtml(
    card.publisher || ''
  );

  const publishedAt = escapeInsightHtml(
    card.published_at || ''
  );

  const sourceUrl = getSafeInsightUrl(
    card.source_url || ''
  );

  const service = escapeInsightHtml(
    getInsightService(card)
  );

  const cardLabel = isNews
    ? 'LATEST NEWS'
    : 'PRACTICAL GUIDE';

  const publisherHtml =
    isNews && publisher
      ? `<span class="insight-publisher">${publisher}</span>`
      : '';

  const dateHtml =
    isNews && publishedAt
      ? `<span class="insight-date">${publishedAt}</span>`
      : '';

  const sourceHtml = isNews
    ? sourceUrl
      ? `
        <a
          class="insight-source"
          href="${escapeInsightHtml(sourceUrl)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read original article ↗
        </a>
      `
      : `
        <span class="evergreen-badge">
          Original link unavailable
        </span>
      `
    : '';

  return `
    <article class="insight-card">

      <div class="insight-type">
        ${category}
      </div>

      <h3>${title}</h3>

      <div class="insight-label">
        THE CHALLENGE
      </div>

      <p>${problem}</p>

      <div class="insight-label">
        A PRACTICAL NEXT STEP
      </div>

      <p class="insight-solution">
        ${solution}
      </p>

      <div class="insight-footer">

        <span class="evergreen-badge">
          ${cardLabel}
        </span>

        ${dateHtml}

        ${publisherHtml}

        ${sourceHtml}

      </div>

      <a
        class="insight-enquiry"
        href="#contact"
        data-service="${service}"
      >
        Need help with this? ↗
      </a>

    </article>
  `;
}


/* ---------------------------------------------------------
   6. FALLBACK CARD IF THE JSON FILE CANNOT LOAD
   --------------------------------------------------------- */

function showBusinessInsightFallback(grid, updated) {
  grid.innerHTML = `
    <article class="insight-card">

      <div class="insight-type">
        ZERO POINT ONE / INSIGHTS
      </div>

      <h3>
        Make one workflow easier this week.
      </h3>

      <div class="insight-label">
        THE CHALLENGE
      </div>

      <p>
        Repeated manual tasks can slow teams down
        and make progress difficult to track.
      </p>

      <div class="insight-label">
        A PRACTICAL NEXT STEP
      </div>

      <p class="insight-solution">
        Choose one repetitive task, document the steps,
        and test a simple form, spreadsheet or automation.
      </p>

      <div class="insight-footer">
        <span class="evergreen-badge">
          PRACTICAL GUIDE
        </span>
      </div>

      <a
        class="insight-enquiry"
        href="#contact"
        data-service="Managed project support"
      >
        Need help with this? ↗
      </a>

    </article>
  `;

  updated.textContent =
    'Showing a practical guide while the latest cards load.';
}


/* ---------------------------------------------------------
   7. CONNECT ENQUIRY LINKS
   --------------------------------------------------------- */

function connectInsightEnquiryLinks(grid) {
  grid.querySelectorAll('.insight-enquiry').forEach(link => {
    link.addEventListener('click', () => {
      selectInsightEnquiryService(link.dataset.service);
    });
  });
}


/* ---------------------------------------------------------
   8. LOAD BUSINESS INSIGHTS FROM PUBLIC JSON
   --------------------------------------------------------- */

async function loadBusinessInsights() {
  const grid = document.getElementById('insight-grid');
  const updated = document.getElementById('cards-updated');

  if (!grid || !updated) {
    return;
  }

  try {
    const response = await fetch(
      './data/news-cards.json?v=' + Date.now(),
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(
        'Insight JSON request failed: HTTP ' + response.status
      );
    }

    const payload = await response.json();

    if (!payload || !Array.isArray(payload.cards)) {
      throw new Error(
        'The JSON file must contain a cards array.'
      );
    }

    const cards = payload.cards.slice(0, 5);

    if (cards.length === 0) {
      throw new Error('No insight cards were found.');
    }

    grid.innerHTML = cards
      .map(renderBusinessInsightCard)
      .join('');

    connectInsightEnquiryLinks(grid);

    updated.textContent = payload.updated_at
      ? 'Updated ' + escapeInsightHtml(payload.updated_at)
      : 'Business insights';

  } catch (error) {
    console.error(
      'Unable to load business insights:',
      error
    );

    showBusinessInsightFallback(grid, updated);

    connectInsightEnquiryLinks(grid);
  }
}


/* ---------------------------------------------------------
   9. START THE INSIGHTS LOADER
   --------------------------------------------------------- */

loadBusinessInsights();
