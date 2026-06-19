(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('.hero-slide', root);
    var dots = qsa('.hero-dot', root);
    var thumbs = qsa('.hero-thumb', root);
    var prev = qs('.hero-prev', root);
    var next = qs('.hero-next', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-index')) || 0);
        start();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        show(Number(thumb.getAttribute('data-hero-index')) || 0);
        stop();
      });
      thumb.addEventListener('mouseleave', start);
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('.filter-input', scope);
      var select = qs('.filter-select', scope);
      var cards = qsa('.movie-card, .ranking-item', scope);

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var option = select ? select.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-year') || ''
          ].join(' ').toLowerCase();
          var matchText = !keyword || haystack.indexOf(keyword) >= 0;
          var matchOption = !option || haystack.indexOf(option) >= 0;
          card.classList.toggle('is-hidden', !(matchText && matchOption));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (select) {
        select.addEventListener('change', apply);
      }
    });
  }

  function setupSearchPage() {
    var results = qs('#searchResults');
    var status = qs('#searchStatus');
    var input = qs('#searchInput');
    var fallback = qs('#searchFallback');
    if (!results || !status || !input || !window.MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 5).join(' ');
      return '<a class="movie-card" href="' + movie.url + '" data-title="' + escapeHtml(movie.title) + '" data-tags="' + escapeHtml(tags) + '">' +
        '<span class="poster-wrap"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="poster-play">▶</span></span>' +
        '<span class="movie-info"><strong>' + escapeHtml(movie.title) + '</strong><em>' + escapeHtml(movie.oneLine || '') + '</em>' +
        '<span class="movie-meta"><span>' + escapeHtml(movie.region || '') + '</span><span>' + escapeHtml(movie.type || '') + '</span><span>' + escapeHtml(movie.year || '') + '</span></span></span>' +
        '</a>';
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function render(value) {
      var term = String(value || '').trim().toLowerCase();
      if (!term) {
        results.innerHTML = '';
        status.textContent = '输入关键词发现更多影片。';
        if (fallback) {
          fallback.style.display = '';
        }
        return;
      }
      var matched = window.MOVIES.filter(function (movie) {
        var text = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return text.indexOf(term) >= 0;
      }).slice(0, 96);
      results.innerHTML = matched.map(card).join('');
      status.textContent = matched.length ? '已为你找到相关影片。' : '没有找到匹配影片，请尝试其他关键词。';
      if (fallback) {
        fallback.style.display = matched.length ? 'none' : '';
      }
    }

    input.addEventListener('input', function () {
      render(input.value);
    });
    render(query);
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var overlay = qs('.play-overlay', player);
      var started = false;
      if (!video || !overlay) {
        return;
      }

      function attach() {
        var source = video.getAttribute('data-stream');
        if (!source) {
          return;
        }
        if (started) {
          return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        attach();
        player.classList.add('is-playing');
        var request = video.play();
        if (request && typeof request.catch === 'function') {
          request.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      overlay.addEventListener('click', play);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
}());
