
/* Zero Point One — site interactions and reliable manual insights slider */

(() => {
  'use strict';

  /* Mobile navigation */
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuButton && nav) {
    menuButton.setAttribute('aria-expanded', 'false');

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

  /* Footer year */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* WhatsApp enquiry form */
  const enquiryForm = document.getElementById('enquiry-form');

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', event => {
      event.preventDefault();

      const status = document.getElementById('form-status');
      const number = String(
        window.ZPO_CONFIG?.whatsappNumber || ''
      ).replace(/\D/g, '');

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
        'https://wa.me/' + number +
        '?text=' + encodeURIComponent(message);

      const opened = window.open(
        whatsappUrl,
        '_blank',
        'noopener,noreferrer'
      );

      if (status) {
        status.textContent = opened
          ? 'WhatsApp opened with your enquiry prepared. Review it and press Send in WhatsApp.'
          : 'If WhatsApp did not open, allow pop-ups or open WhatsApp and send your enquiry.';
      }
    });
  }

  /* Shared helpers */
  const escapeHtml = value =>
    String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);

  const safeHttpUrl = value => {
    if (!value) return '';

    try {
      const url = new URL(String(value), window.location.href);
      return ['http:', 'https:'].includes(url.protocol)
        ? url.href
        : '';
    } catch {
      return '';
    }
  };

  /* Topic-specific fallback photos */
  const fallbackImages = [
    {
      match: /cybersecurity|security|hack|malware|phishing|ransomware|vulnerability/i,
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80'
    },
    {
      match: /website|web development|lead generation/i,
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80'
    },
    {
      match: /automation|workflow|technology|software/i,
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80'
    },
    {
      match: /project|management|delivery/i,
      url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80'
    },
    {
      match: /resource|recruit|team|skills/i,
      url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80'
    }
  ];

  /* Always-available monochrome image if a photo fails */
  const makeFallbackGraphic = (category, title) => {
    const safeCategory = escapeHtml(
      String(category || 'BUSINESS & TECHNOLOGY').slice(0, 42)
    );
    const safeTitle = escapeHtml(
      String(title || 'Business insights').slice(0, 70)
    );

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg"
        width="900" height="506" viewBox="0 0 900 506">
        <rect width="900" height="506" fill="#101010"/>
        <g stroke="#393939" stroke-width="1">
          ${Array.from({ length: 10 }, (_, i) =>
            `<path d="M${i * 100} 0 V506"/>`).join('')}
          ${Array.from({ length: 6 }, (_, i) =>
            `<path d="M0 ${i * 100} H900"/>`).join('')}
        </g>
        <circle cx="700" cy="210" r="110"
          fill="none" stroke="#777" stroke-width="2"/>
        <circle cx="700" cy="210" r="72"
          fill="none" stroke="#555" stroke-width="2"/>
        <circle cx="700" cy="210" r="30" fill="#ddd"/>
        <path d="M550 210 H660 M700 60 V100 M700 320 V365 M750 210 H830"
          stroke="#ddd" stroke-width="3" fill="none"/>
        <text x="42" y="65" fill="#bbb" font-family="Arial,sans-serif"
          font-size="19" letter-spacing="3">${safeCategory}</text>
        <path d="M42 88 H390" stroke="#666" stroke-width="2"/>
        <foreignObject x="42" y="125" width="470" height="250">
          <div xmlns="http://www.w3.org/1999/xhtml"
            style="font:bold 36px Arial,sans-serif;color:#fff;line-height:1.2;overflow-wrap:anywhere">
            ${safeTitle}
          </div>
        </foreignObject>
        <text x="42" y="462" fill="#999" font-family="Arial,sans-serif"
          font-size="15" letter-spacing="4">ZERO POINT ONE</text>
      </svg>`;

    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  const getService = text => {
    if (/mobile app|mobile application|android|ios/i.test(text)) {
      return 'Mobile application';
    }
    if (/website|web development|web application/i.test(text)) {
      return 'Website development';
    }
    if (/software|programming|code/i.test(text)) {
      return 'Software development';
    }
    if (/automation|workflow|project|management|resource|security|hack|malware|phishing/i.test(text)) {
      return 'Managed project support';
    }
    return 'Other enquiry';
  };

  const getPhotoUrl = card => {
    const suppliedImage = safeHttpUrl(card.image_url || card.imageUrl || card.image);
    if (suppliedImage) return suppliedImage;

    const text = [
      card.category,
      card.title,
      card.problem,
      card.solution
    ].join(' ');

    return fallbackImages.find(item => item.match.test(text))?.url || '';
  };

  /* Build one article card */
  const createCard = card => {
    const article = document.createElement('article');
    article.className = 'insight-card';

    const category = card.category || 'Business & technology';
    const title = card.title || 'A business challenge to solve';
    const isNews = String(card.type || '').toLowerCase() === 'news';
    const publisher = card.publisher || card.source_name || '';
    const date = isNews ? (card.published_at || '') : '';
    const sourceUrl = safeHttpUrl(card.source_url);
    const fullText = [
      category,
      title,
      card.problem,
      card.solution
    ].join(' ');

    const image = document.createElement('img');
    image.className = 'insight-image';
    image.alt = card.image_alt || (category + ' illustration');
    image.loading = 'lazy';
    image.decoding = 'async';

    const graphicUrl = makeFallbackGraphic(category, title);
    image.src = getPhotoUrl(card) || graphicUrl;

    image.addEventListener('error', () => {
      if (!image.dataset.fallbackApplied) {
        image.dataset.fallbackApplied = 'true';
        image.src = graphicUrl;
      }
    });

    const type = document.createElement('div');
    type.className = 'insight-type';
    type.textContent = category;

    const heading = document.createElement('h3');
    heading.textContent = title;

    const challengeLabel = document.createElement('div');
    challengeLabel.className = 'insight-label';
    challengeLabel.textContent = 'THE CHALLENGE';

    const challenge = document.createElement('p');
    challenge.textContent =
      card.problem ||
      'Businesses need practical ways to improve their work.';

    const nextLabel = document.createElement('div');
    nextLabel.className = 'insight-label';
    nextLabel.textContent = 'A PRACTICAL NEXT STEP';

    const solution = document.createElement('p');
    solution.className = 'insight-solution';
    solution.textContent =
      card.solution ||
      'Start with a small, measurable improvement.';

    const footer = document.createElement('div');
    footer.className = 'insight-footer';

    const kind = document.createElement('span');
    kind.className = 'evergreen-badge';
    kind.textContent = isNews ? 'LATEST NEWS' : 'PRACTICAL GUIDE';
    footer.appendChild(kind);

    if (date) {
      const dateElement = document.createElement('span');
      dateElement.className = 'insight-date';
      dateElement.textContent = date;
      footer.appendChild(dateElement);
    }

    if (publisher) {
      const publisherElement = document.createElement('span');
      publisherElement.className = 'insight-publisher';
      publisherElement.textContent = publisher;
      footer.appendChild(publisherElement);
    }

    if (isNews && sourceUrl) {
      const sourceLink = document.createElement('a');
      sourceLink.className = 'insight-source';
      sourceLink.href = sourceUrl;
      sourceLink.target = '_blank';
      sourceLink.rel = 'noopener noreferrer';
      sourceLink.textContent = 'Read original article ↗';
      footer.appendChild(sourceLink);
    }

    const enquiry = document.createElement('a');
    enquiry.className = 'insight-enquiry';
    enquiry.href = '#contact';
    enquiry.dataset.service = getService(fullText);
    enquiry.textContent = 'Discuss a similar challenge ↗';

    article.append(
      image,
      type,
      heading,
      challengeLabel,
      challenge,
      nextLabel,
      solution,
      footer,
      enquiry
    );

    return article;
  };

  /* Create the slider once, with one consistent movement method */
  const renderSlider = (grid, cards) => {
    grid.innerHTML = `
      <button class="insight-arrow insight-prev"
        type="button" aria-label="Previous articles"
        title="Previous articles">&#8592;</button>
      <div class="insight-viewport" aria-label="Business insights">
        <div class="insight-track"></div>
      </div>
      <button class="insight-arrow insight-next"
        type="button" aria-label="Next articles"
        title="Next articles">&#8594;</button>
    `;

    const viewport = grid.querySelector('.insight-viewport');
    const track = grid.querySelector('.insight-track');
    const previous = grid.querySelector('.insight-prev');
    const next = grid.querySelector('.insight-next');

    cards.forEach(card => track.appendChild(createCard(card)));

    let currentIndex = 0;
    let visibleCount = 3;
    let resizeFrame = 0;

    const getVisibleCount = () => {
      if (window.matchMedia('(max-width: 700px)').matches) return 1;
      if (window.matchMedia('(max-width: 1000px)').matches) return 2;
      return 3;
    };

    const updateSlider = () => {
      resizeFrame = 0;
      visibleCount = getVisibleCount();

      const viewportWidth = viewport.clientWidth;
      const cardGap =
        parseFloat(window.getComputedStyle(track).gap) || 0;
      const cardsInView = Math.min(visibleCount, cards.length);
      const totalGaps = Math.max(0, cardsInView - 1) * cardGap;
      const cardWidth = cardsInView
        ? (viewportWidth - totalGaps) / cardsInView
        : viewportWidth;

      track.querySelectorAll('.insight-card').forEach(card => {
        card.style.flex = `0 0 ${Math.max(0, cardWidth)}px`;
        card.style.width = `${Math.max(0, cardWidth)}px`;
      });

      const maxIndex = Math.max(0, cards.length - visibleCount);
      currentIndex = Math.min(currentIndex, maxIndex);

      const distance = cardWidth + cardGap;
      track.style.transform =
        `translate3d(${-currentIndex * distance}px, 0, 0)`;

      previous.disabled = currentIndex === 0;
      next.disabled = currentIndex >= maxIndex;

      const hasOverflow = cards.length > visibleCount;
      previous.hidden = !hasOverflow;
      next.hidden = !hasOverflow;
    };

    const scheduleUpdate = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(updateSlider);
    };

    next.addEventListener('click', () => {
      const maxIndex = Math.max(0, cards.length - visibleCount);
      if (currentIndex < maxIndex) {
        currentIndex += 1;
        updateSlider();
      }
    });

    previous.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex -= 1;
        updateSlider();
      }
    });

    /* Prefill the contact form when a visitor chooses a card */
    grid.addEventListener('click', event => {
      const link = event.target.closest('.insight-enquiry');
      if (!link || !grid.contains(link)) return;

      const needField = document.getElementById('need');
      const contactSection = document.getElementById('contact');
      const requestedService = link.dataset.service;

      if (needField && requestedService) {
        const option = Array.from(needField.options).find(item =>
          item.value.trim() === requestedService ||
          item.text.trim() === requestedService
        );

        if (option) {
          needField.value = option.value;
          needField.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      if (contactSection) {
        contactSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });

    window.addEventListener('resize', scheduleUpdate, { passive: true });

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(scheduleUpdate);
      observer.observe(viewport);
    }

    updateSlider();
  };

  /* Load news data and display a useful fallback if loading fails */
  async function loadBusinessInsights() {
    const grid = document.getElementById('insight-grid');
    const updated = document.getElementById('cards-updated');

    if (!grid) return;

    try {
      const response = await fetch(
        './data/news-cards.json?v=' + Date.now(),
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error('News request failed with status ' + response.status);
      }

      const payload = await response.json();
      const cards = Array.isArray(payload.cards)
        ? payload.cards.slice(0, 12)
        : [];

      if (!cards.length) {
        throw new Error('The news data contains no cards.');
      }

      renderSlider(grid, cards);

      if (updated) {
        updated.textContent = payload.updated_at
          ? 'Updated ' + payload.updated_at +
            ' · News links credited to their original publishers.'
          : 'News links credited to their original publishers.';
      }
    } catch (error) {
      console.error('Zero Point One insights:', error);

      const fallbackCards = [{
        category: 'Business & technology',
        title: 'Business problems. Smarter solutions.',
        problem:
          'Businesses can lose time when repetitive tasks and project updates are difficult to track.',
        solution:
          'Choose one workflow to improve, define a measurable goal, and test a practical solution.',
        type: 'guide'
      }];

      renderSlider(grid, fallbackCards);

      if (updated) {
        updated.textContent =
          'Showing a practical guide. Latest news could not be loaded.';
      }
    }
  }

  loadBusinessInsights();
})();
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

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;'
  })[c]);

  const safeUrl = value => {
    try {
      const url = new URL(value, location.href);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  };

  /* A built-in graphic guarantees a visible image even if a photo fails. */
  const graphic = (category, title) => {
    const label = esc(category || 'TECHNOLOGY').slice(0, 45);
    const heading = esc(title || 'Business insights').slice(0, 65);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="420" viewBox="0 0 800 420">
        <rect width="800" height="420" fill="#111111"/>
        <g stroke="#555" stroke-width="1" opacity=".6">
          ${Array.from({length: 9}, (_, i) =>
            `<path d="M${i * 100} 0 V420"/>`).join('')}
          ${Array.from({length: 5}, (_, i) =>
            `<path d="M0 ${i * 100} H800"/>`).join('')}
        </g>
        <circle cx="620" cy="155" r="100" fill="none" stroke="#999" stroke-width="2"/>
        <circle cx="620" cy="155" r="70" fill="none" stroke="#666" stroke-width="2"/>
        <circle cx="620" cy="155" r="35" fill="#ddd"/>
        <path d="M500 155 H585 M620 35 V85 M620 225 V275 M655 155 H740"
          stroke="#ddd" stroke-width="3" fill="none"/>
        <text x="42" y="65" fill="#bbb" font-family="Arial,sans-serif"
          font-size="18" letter-spacing="4">${label}</text>
        <path d="M42 92 H310" stroke="#777" stroke-width="2"/>
        <foreignObject x="42" y="125" width="430" height="190">
          <div xmlns="http://www.w3.org/1999/xhtml"
            style="font: bold 34px Arial,sans-serif;color:#fff;line-height:1.2;overflow-wrap:anywhere">
            ${heading}
          </div>
        </foreignObject>
        <text x="42" y="375" fill="#999" font-family="Arial,sans-serif"
          font-size="14" letter-spacing="3">ZERO POINT ONE</text>
      </svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  const fallbackFor = text => {
    if (/security|hack|malware|phishing|cyber/i.test(text))
      return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80';
    if (/website|web development/i.test(text))
      return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
    if (/automation|workflow/i.test(text))
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
    if (/project|management/i.test(text))
      return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80';
    return '';
  };

  try {
    const response = await fetch('./data/news-cards.json?v=' + Date.now(), {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('News data could not be loaded');

    const payload = await response.json();
    const cards = Array.isArray(payload.cards) ? payload.cards : [];
    if (!cards.length) throw new Error('No cards found');

    grid.innerHTML = `
      <button class="insight-arrow insight-prev" type="button" aria-label="Previous articles">←</button>
      <div class="insight-viewport">
        <div class="insight-track"></div>
      </div>
      <button class="insight-arrow insight-next" type="button" aria-label="Next articles">→</button>
    `;

    const track = grid.querySelector('.insight-track');
    const viewport = grid.querySelector('.insight-viewport');
    const prev = grid.querySelector('.insight-prev');
    const next = grid.querySelector('.insight-next');

    cards.forEach(card => {
      const text = [card.category, card.title, card.problem, card.solution].join(' ');
      const photo = safeUrl(card.image_url) || fallbackFor(text);
      const graphicUrl = graphic(card.category, card.title);
      const isNews = String(card.type).toLowerCase() === 'news';
      const source = safeUrl(card.source_url);

      const article = document.createElement('article');
      article.className = 'insight-card';

      const img = document.createElement('img');
      img.className = 'insight-image';
      img.alt = (card.category || 'Technology') + ' illustration';
      img.loading = 'lazy';
      img.src = photo || graphicUrl;
      img.addEventListener('error', () => {
        if (img.src !== graphicUrl) img.src = graphicUrl;
      });

      article.innerHTML = `
        <div class="insight-type">${esc(card.category || 'Business & technology')}</div>
        <h3>${esc(card.title || 'Business insight')}</h3>
        <div class="insight-label">THE CHALLENGE</div>
        <p>${esc(card.problem || '')}</p>
        <div class="insight-label">A PRACTICAL NEXT STEP</div>
        <p class="insight-solution">${esc(card.solution || '')}</p>
        <div class="insight-footer">
          <span>${isNews ? 'LATEST NEWS' : 'PRACTICAL GUIDE'}</span>
          <span>${esc(card.published_at || '')}</span>
          <span>${esc(card.publisher || '')}</span>
          ${isNews && source
            ? `<a class="insight-source" href="${esc(source)}" target="_blank" rel="noopener noreferrer">Original article ↗</a>`
            : ''}
        </div>
        <a class="insight-enquiry" href="#contact">Discuss a similar challenge ↗</a>
      `;

      article.prepend(img);
      track.appendChild(article);
    });

    /* Move by one card; wrap at both ends so the slider never gets stuck. */
    let index = 0;
    let visible = 3;

    const measure = () => {
      visible = window.matchMedia('(max-width: 700px)').matches ? 1
        : window.matchMedia('(max-width: 1000px)').matches ? 2 : 3;

      index = Math.min(index, Math.max(0, cards.length - visible));
      render();
    };

    const render = () => {
      const first = track.querySelector('.insight-card');
      if (!first) return;

      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      const distance = first.getBoundingClientRect().width + gap;
      const maxIndex = Math.max(0, cards.length - visible);

      track.style.transform = `translateX(${-index * distance}px)`;
      prev.disabled = false;
      next.disabled = false;

      /* If there are fewer cards than the visible slots, don't move. */
      if (cards.length <= visible) {
        prev.disabled = true;
        next.disabled = true;
      }

      prev.setAttribute('aria-label', 'Previous article');
      next.setAttribute('aria-label', 'Next article');
    };

    next.addEventListener('click', () => {
      const maxIndex = Math.max(0, cards.length - visible);
      index = index >= maxIndex ? 0 : index + 1;
      render();
    });

    prev.addEventListener('click', () => {
      const maxIndex = Math.max(0, cards.length - visible);
      index = index <= 0 ? maxIndex : index - 1;
      render();
    });

    window.addEventListener('resize', measure);
    requestAnimationFrame(measure);

    const needField = document.getElementById('need');
    grid.addEventListener('click', event => {
      if (!event.target.closest('.insight-enquiry')) return;
      if (needField) {
        const option = Array.from(needField.options).find(o =>
          /managed project support/i.test(o.text) ||
          /managed project support/i.test(o.value)
        );
        if (option) needField.value = option.value;
      }
    });

    if (updated) {
      updated.textContent = payload.updated_at
        ? 'Updated ' + payload.updated_at
        : 'Business insights';
    }
  } catch (error) {
    console.error('Business insights error:', error);
    grid.innerHTML = `
      <article class="insight-card">
        <div class="insight-type">ZERO POINT ONE</div>
        <h3>Business problems. Smarter solutions.</h3>
        <p>Practical technology ideas to help businesses work better.</p>
        <a class="insight-enquiry" href="#contact">Discuss your project ↗</a>
      </article>`;
    if (updated) updated.textContent = 'Business insights';
  }
}


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
