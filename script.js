/* Zero Point One — site interactions and manual business-insights slider */

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuButton && nav) {
  menuButton.setAttribute('aria-expanded', 'false');

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

/* WhatsApp enquiry form */
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

/* Topic-based fallback images for cards without their own image. */
const insightFallbackImages = [
  {
    match: /cybersecurity|security|hack|malware|phishing|ransomware|vulnerability/i,
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'
  },
  {
    match: /website|lead generation|website development/i,
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
  },
  {
    match: /workflow|automation|repetitive task/i,
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  },
  {
    match: /project delivery|project management|project updates/i,
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80'
  },
  {
    match: /resource planning|skills gap|recruit/i,
    url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80'
  }
];

async function loadBusinessInsights() {
  const grid = document.getElementById('insight-grid');
  const updated = document.getElementById('cards-updated');

  if (!grid) return;

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
      const url = new URL(value, window.location.href);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  };

  const getService = cardText => {
    if (/cybersecurity|security|hack|malware|phishing|ransomware|vulnerability/i.test(cardText)) {
      return 'Other enquiry';
    }
    if (/mobile app|mobile application|android|ios/i.test(cardText)) {
      return 'Mobile application';
    }
    if (/website|web development|web application/i.test(cardText)) {
      return 'Website development';
    }
    if (/software|programming|code/i.test(cardText)) {
      return 'Software development';
    }
    if (/automation|workflow|repetitive task/i.test(cardText)) {
      return 'Managed project support';
    }
    return 'Other enquiry';
  };

  try {
    const response = await fetch(
      './data/news-cards.json?v=' + Date.now(),
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Could not load insight data (' + response.status + ')');
    }

    const payload = await response.json();
    const cards = Array.isArray(payload.cards) ? payload.cards.slice(0, 5) : [];

    if (!cards.length) {
      throw new Error('No insight cards found');
    }

    const cardsHtml = cards.map(card => {
      const isNews = String(card.type || '').toLowerCase() === 'news';
      const sourceUrl = safeUrl(card.source_url);
      const publisher = card.publisher || card.source_name || '';
      const cardText = [
        card.category || '',
        card.title || '',
        card.problem || '',
        card.solution || ''
      ].join(' ');

      const fallback = insightFallbackImages.find(item => item.match.test(cardText));
      const imageUrl = safeUrl(card.image_url) || (fallback ? fallback.url : '');
      const image = imageUrl
        ? `<img class="insight-image"
                src="${escapeHtml(imageUrl)}"
                alt="${escapeHtml(card.image_alt || card.category || 'Business technology illustration')}"
                loading="lazy" width="800" height="450">`
        : '';

      const sourceLink = isNews && sourceUrl
        ? `<a class="insight-source" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">Read original article ↗</a>`
        : isNews
          ? '<span class="evergreen-badge">Original link unavailable</span>'
          : '';

      const dateText = isNews ? (card.published_at || '') : '';
      const label = isNews ? 'LATEST NEWS' : 'PRACTICAL GUIDE';
      const service = getService(cardText);

      return `
        <article class="insight-card">
          ${image}
          <div class="insight-type">${escapeHtml(card.category || 'Business & technology')}</div>
          <h3>${escapeHtml(card.title || 'A business challenge to solve')}</h3>
          <div class="insight-label">THE CHALLENGE</div>
          <p>${escapeHtml(card.problem || 'Businesses need practical ways to improve their work.')}</p>
          <div class="insight-label">A PRACTICAL NEXT STEP</div>
          <p class="insight-solution">${escapeHtml(card.solution || 'Start with a small, measurable improvement.')}</p>
          <div class="insight-footer">
            <span class="evergreen-badge">${label}</span>
            ${dateText ? `<span class="insight-date">${escapeHtml(dateText)}</span>` : ''}
            ${publisher ? `<span class="insight-publisher">${escapeHtml(publisher)}</span>` : ''}
            ${sourceLink}
          </div>
          <a class="insight-enquiry" href="#contact" data-service="${escapeHtml(service)}">
            Need help with this? ↗
          </a>
        </article>
      `;
    }).join('');

    /* One track, one set of cards: no duplicate groups and no animation. */
    grid.innerHTML = `
      <button class="insight-arrow insight-prev" type="button"
        aria-label="Previous article" title="Previous article">&#8592;</button>
      <div class="insight-viewport" aria-label="Business insights">
        <div class="insight-track">${cardsHtml}</div>
      </div>
      <button class="insight-arrow insight-next" type="button"
        aria-label="Next article" title="Next article">&#8594;</button>
    `;

    const track = grid.querySelector('.insight-track');
    const viewport = grid.querySelector('.insight-viewport');
    const previousButton = grid.querySelector('.insight-prev');
    const nextButton = grid.querySelector('.insight-next');

    const scrollArticles = direction => {
      const card = track && track.querySelector('.insight-card');
      if (!card || !viewport) return;

      const trackStyles = window.getComputedStyle(track);
      const gap = parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;
      const distance = card.getBoundingClientRect().width + gap;

      viewport.scrollBy({ left: direction * distance, behavior: 'smooth' });
    };

    previousButton.addEventListener('click', () => scrollArticles(-1));
    nextButton.addEventListener('click', () => scrollArticles(1));

    /* Keep arrow controls usable with the keyboard and update disabled states. */
    const updateArrowStates = () => {
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      previousButton.disabled = viewport.scrollLeft <= 2;
      nextButton.disabled = viewport.scrollLeft >= maxScroll - 2;
    };

    viewport.addEventListener('scroll', updateArrowStates, { passive: true });
    window.addEventListener('resize', updateArrowStates);
    requestAnimationFrame(updateArrowStates);

    /* Delegate enquiry links so the selected service is prefilled. */
    const needField = document.getElementById('need');
    const contactSection = document.getElementById('contact');

    grid.addEventListener('click', event => {
      const link = event.target.closest('.insight-enquiry');
      if (!link || !grid.contains(link)) return;

      const requestedService = link.dataset.service;
      if (needField && requestedService) {
        const matchingOption = Array.from(needField.options).find(option =>
          option.value.trim() === requestedService ||
          option.text.trim() === requestedService
        );

        if (matchingOption) {
          needField.value = matchingOption.value;
          needField.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    /* Hide broken image URLs rather than leaving broken-image icons. */
    grid.querySelectorAll('.insight-image').forEach(img => {
      img.addEventListener('error', () => {
        img.style.display = 'none';
      }, { once: true });
    });

    if (updated) {
      updated.textContent = payload.updated_at
        ? 'Updated ' + payload.updated_at
        : 'Business insights';
    }
  } catch (error) {
    console.error('Unable to load business insights:', error);

    grid.innerHTML = `
      <article class="insight-card insight-fallback-card">
        <div class="insight-type">ZERO POINT ONE / INSIGHTS</div>
        <h3>Make one workflow easier this week.</h3>
        <div class="insight-label">THE CHALLENGE</div>
        <p>Repeated manual tasks can slow teams down and make progress difficult to track.</p>
        <div class="insight-label">A PRACTICAL NEXT STEP</div>
        <p>Choose one repetitive task, document the steps, and test a simple form, spreadsheet or automation.</p>
        <a class="insight-enquiry" href="#contact" data-service="Managed project support">Need help with this? ↗</a>
      </article>
    `;

    if (updated) updated.textContent = 'Showing a practical guide while the latest cards load.';

    const needField = document.getElementById('need');
    const contactSection = document.getElementById('contact');

    grid.querySelector('.insight-enquiry')?.addEventListener('click', () => {
      if (needField) {
        const option = Array.from(needField.options).find(item =>
          item.value === 'Managed project support' ||
          item.text.trim() === 'Managed project support'
        );
        if (option) needField.value = option.value;
      }
      contactSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

loadBusinessInsights();
