
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

// WhatsApp enquiry form.
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

// Relevant fallback images for the current evergreen guides.
// A card's image_url takes priority whenever one is supplied.
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
      const url = new URL(value, window.location.href);
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

    const cardsHtml = cards.map(card => {
      const isNews =
        String(card.type || '').toLowerCase() === 'news';

      const sourceUrl = safeUrl(card.source_url);
      const publisher = card.publisher || card.source_name || '';

      const cardText = [
        card.category || '',
        card.title || '',
        card.problem || '',
        card.solution || ''
      ].join(' ');

      // Cybersecurity must be matched before software development.
      let service = 'Other enquiry';

      if (
        /cybersecurity|security|hack|malware|phishing|ransomware|vulnerability/i.test(cardText)
      ) {
        service = 'Other enquiry';
      } else if (
        /mobile app|mobile application|android|ios/i.test(cardText)
      ) {
        service = 'Mobile application';
      } else if (
        /website|web development|web application/i.test(cardText)
      ) {
        service = 'Website development';
      } else if (
        /software|programming|code/i.test(cardText)
      ) {
        service = 'Software development';
      } else if (
        /automation|workflow|repetitive task/i.test(cardText)
      ) {
        service = 'Managed project support';
      }

      const fallback = insightFallbackImages.find(item =>
        item.match.test(cardText)
      );

      const imageUrl =
        safeUrl(card.image_url) ||
        (fallback ? fallback.url : '');

      const image = imageUrl
        ? `<img
             class="insight-image"
             src="${escapeHtml(imageUrl)}"
             alt="${escapeHtml(card.image_alt || card.category || 'Business technology illustration')}"
             loading="lazy"
             width="800"
             height="450"
           >`
        : '';

      const sourceLink = isNews && sourceUrl
        ? `<a class="insight-source" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">Read original article ↗</a>`
        : isNews
          ? '<span class="evergreen-badge">Original link unavailable</span>'
          : '';

      const dateText = isNews
        ? (card.published_at || '')
        : '';

      const label = isNews
        ? 'LATEST NEWS'
        : 'PRACTICAL GUIDE';

      return `
        <article class="insight-card">
          ${image}

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
            ${publisher ? `<span class="insight-publisher">${escapeHtml(publisher)}</span>` : ''}
            ${sourceLink}
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
    }).join('');

    // The track contains two identical sets for seamless looping.
    grid.innerHTML = `
      <div class="insight-track">
        ${cardsHtml}
      </div>
    `;

    const track = grid.querySelector('.insight-track');

    Array.from(track.children).forEach(card => {
      track.appendChild(card.cloneNode(true));
    });

    updated.textContent = payload.updated_at
      ? 'Updated ' + payload.updated_at
      : 'Business insights';

    // Handle original and duplicated enquiry links.
    const needField = document.getElementById('need');
    const contactSection = document.getElementById('contact');

    grid.addEventListener('click', event => {
      const link = event.target.closest('.insight-enquiry');

      if (!link || !grid.contains(link)) return;

      const requestedService = link.dataset.service;

      if (needField && requestedService) {
        const matchingOption = Array.from(needField.options).find(
          option =>
            option.value.trim() === requestedService ||
            option.text.trim() === requestedService
        );

        if (matchingOption) {
          needField.value = matchingOption.value;
          needField.dispatchEvent(
            new Event('change', { bubbles: true })
          );
        }
      }

      if (contactSection) {
        contactSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });

    // Touch users can pause while reading; resume shortly after.
    let touchResumeTimer;

    grid.addEventListener('touchstart', () => {
      track.classList.add('is-paused');
      clearTimeout(touchResumeTimer);
    }, { passive: true });

    grid.addEventListener('touchend', () => {
      clearTimeout(touchResumeTimer);

      touchResumeTimer = setTimeout(() => {
        track.classList.remove('is-paused');
      }, 2500);
    }, { passive: true });

    grid.addEventListener('touchcancel', () => {
      clearTimeout(touchResumeTimer);
      track.classList.remove('is-paused');
    }, { passive: true });

    // Replace unavailable images with a neutral branded fallback.
    grid.querySelectorAll('.insight-image').forEach(img => {
      img.addEventListener('error', () => {
        img.style.display = 'none';
      }, { once: true });
    });

  } catch (error) {
    console.error('Unable to load business insights:', error);

    grid.innerHTML = `
      <article class="insight-card">
        <div class="insight-type">ZERO POINT ONE / INSIGHTS</div>
        <h3>Make one workflow easier this week.</h3>
        <div class="insight-label">THE CHALLENGE</div>
        <p>Repeated manual tasks can slow teams down and make progress difficult to track.</p>
        <div class="insight-label">A PRACTICAL NEXT STEP</div>
        <p>Choose one repetitive task, document the steps, and test a simple form, spreadsheet or automation.</p>
        <a class="insight-enquiry" href="#contact" data-service="Managed project support">
          Need help with this? ↗
        </a>
      </article>
    `;

    updated.textContent =
      'Showing a practical guide while the latest cards load.';

    const needField = document.getElementById('need');
    const contactSection = document.getElementById('contact');

    grid.querySelector('.insight-enquiry')?.addEventListener('click', () => {
      if (needField) {
        const option = Array.from(needField.options).find(
          item => item.value === 'Managed project support' ||
                  item.text.trim() === 'Managed project support'
        );

        if (option) needField.value = option.value;
      }

      contactSection?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }
}

loadBusinessInsights();
