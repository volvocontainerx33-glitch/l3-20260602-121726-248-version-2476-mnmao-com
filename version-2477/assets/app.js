(function () {
  function queryAll(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slider = document.querySelector('.hero-slider');

    if (!slider) {
      return;
    }

    var slides = queryAll('.hero-slide', slider);
    var dots = queryAll('.hero-dot', slider);
    var previous = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        startTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        startTimer();
      });
    }

    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);
    show(0);
    startTimer();
  }

  function setupHeroSearch() {
    var form = document.querySelector('.hero-search');

    if (!form) {
      return;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var keyword = input ? input.value.trim() : '';
      var target = './movies.html';

      if (keyword) {
        target += '?q=' + encodeURIComponent(keyword);
      }

      window.location.href = target;
    });
  }

  function setupFilters() {
    var panels = queryAll('.filter-panel');

    panels.forEach(function (panel) {
      var input = panel.querySelector('.site-search-input');
      var filters = queryAll('.site-filter', panel);
      var cards = queryAll('.movie-card');
      var empty = document.querySelector('.empty-state');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query && input) {
        input.value = query;
      }

      function passesYear(card, threshold) {
        if (!threshold) {
          return true;
        }

        var raw = card.getAttribute('data-year') || '';
        var match = raw.match(/\d{4}/);

        if (!match) {
          return true;
        }

        return Number(match[0]) >= Number(threshold);
      }

      function applyFilters() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;

        cards.forEach(function (card) {
          var ok = true;
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();

          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }

          filters.forEach(function (filter) {
            var value = filter.value;
            var type = filter.getAttribute('data-filter');

            if (!value || !ok) {
              return;
            }

            if (type === 'year-mode') {
              ok = passesYear(card, value);
              return;
            }

            var current = card.getAttribute('data-' + type) || '';
            ok = current.indexOf(value) !== -1;
          });

          card.hidden = !ok;

          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', applyFilters);
      }

      filters.forEach(function (filter) {
        filter.addEventListener('change', applyFilters);
      });

      panel.addEventListener('reset', function () {
        window.setTimeout(applyFilters, 0);
      });

      applyFilters();
    });
  }

  function setupPlayer() {
    var player = document.querySelector('[data-player]');

    if (!player) {
      return;
    }

    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var button = player.querySelector('.play-trigger');
    var message = player.querySelector('.player-message');
    var mediaUrl = window.siteVideoUrl || '';
    var initialized = false;
    var hlsInstance = null;

    function setMessage(text) {
      if (!message) {
        return;
      }

      message.textContent = text || '';
      message.hidden = !text;
    }

    function attachMedia() {
      if (!video || !mediaUrl || initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(mediaUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = mediaUrl;
    }

    function playVideo() {
      attachMedia();

      if (cover) {
        cover.classList.add('hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setMessage('点击视频区域即可继续播放。');
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        playVideo();
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        setMessage('');
      });
      video.addEventListener('error', function () {
        setMessage('视频暂时无法播放，请稍后重试。');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupHeroSearch();
    setupFilters();
    setupPlayer();
  });
})();
