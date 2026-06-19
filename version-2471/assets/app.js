(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let slideIndex = 0;
  function showSlide(index) {
    if (!slides.length) return;
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === slideIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === slideIndex);
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.dataset.target || 0));
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5600);
  }

  const filterInput = document.querySelector('.card-filter');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  let activeFilter = '';
  function runCardFilter() {
    const keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    document.querySelectorAll('.movie-card').forEach(function (card) {
      const haystack = [
        card.dataset.title,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.region,
        card.textContent
      ].join(' ').toLowerCase();
      const okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      const okTag = !activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
      card.classList.toggle('is-hidden', !(okKeyword && okTag));
    });
  }
  if (filterInput) {
    filterInput.addEventListener('input', runCardFilter);
  }
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.dataset.filter || '';
      runCardFilter();
    });
  });

  let hlsLoading = null;
  function loadHlsScript() {
    if (window.Hls) return Promise.resolve();
    if (hlsLoading) return hlsLoading;
    hlsLoading = new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsLoading;
  }

  function startPlayer(stage) {
    const video = stage.querySelector('video');
    const button = stage.querySelector('.play-button');
    if (!video) return;
    const source = video.dataset.src;
    if (!source) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) video.src = source;
      video.play().then(function () {
        stage.classList.add('playing');
      }).catch(function () {
        if (button) button.querySelector('strong').textContent = '点击重试';
      });
      return;
    }
    loadHlsScript().then(function () {
      if (window.Hls && window.Hls.isSupported()) {
        if (!video._hlsReady) {
          const hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hlsReady = true;
        }
        video.play().then(function () {
          stage.classList.add('playing');
        }).catch(function () {
          if (button) button.querySelector('strong').textContent = '点击重试';
        });
      }
    }).catch(function () {
      if (button) button.querySelector('strong').textContent = '播放失败';
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (stage) {
    const button = stage.querySelector('.play-button');
    if (button) {
      button.addEventListener('click', function () {
        const label = button.querySelector('strong');
        if (label) label.textContent = '正在加载';
        startPlayer(stage);
      });
    }
  });

  const searchInput = document.getElementById('siteSearchInput');
  const searchButton = document.getElementById('siteSearchButton');
  const searchResults = document.getElementById('searchResults');
  const yearFilter = document.getElementById('yearFilter');
  if (searchInput && searchResults && Array.isArray(window.siteSearchData)) {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    searchInput.value = initial;
    const years = Array.from(new Set(window.siteSearchData.map(function (item) {
      return item.year;
    }))).sort().reverse();
    years.forEach(function (year) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });
    function itemCard(item) {
      return '<article class="movie-card compact" data-title="' + escapeHtml(item.title) + '">' +
        '<a class="poster" href="' + item.file + '">' +
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="poster-badge">' + escapeHtml(item.year) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
        '<h3><a href="' + item.file + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>' +
        '</div>' +
        '</article>';
    }
    function escapeHtml(text) {
      return String(text || '').replace(/[&<>"']/g, function (s) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s];
      });
    }
    function runSearch() {
      const q = searchInput.value.trim().toLowerCase();
      const year = yearFilter.value;
      const results = window.siteSearchData.filter(function (item) {
        const text = [item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ').toLowerCase();
        return (!q || text.indexOf(q) !== -1) && (!year || item.year === year);
      }).slice(0, 80);
      searchResults.innerHTML = results.map(itemCard).join('');
    }
    searchInput.addEventListener('input', runSearch);
    searchButton.addEventListener('click', runSearch);
    yearFilter.addEventListener('change', runSearch);
    runSearch();
  }
})();
