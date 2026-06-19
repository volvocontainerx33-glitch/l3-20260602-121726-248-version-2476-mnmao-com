(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('.menu-toggle');

    if (!button) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = document.body.classList.toggle('nav-open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prevButton = document.querySelector('.hero-prev');
    var nextButton = document.querySelector('.hero-next');

    if (slides.length === 0) {
      return;
    }

    var currentIndex = 0;
    var timer = null;

    function showSlide(index) {
      currentIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === currentIndex);
      });
    }

    function nextSlide() {
      showSlide(currentIndex + 1);
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(nextSlide, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = Number(dot.getAttribute('data-slide') || 0);
        showSlide(target);
        startTimer();
      });
    });

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(currentIndex - 1);
        startTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(currentIndex + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  function setupFilters() {
    var filterPanel = document.querySelector('.filter-panel');
    var list = document.querySelector('[data-filter-list]');
    var countNode = document.querySelector('[data-result-count]');

    if (!filterPanel || !list) {
      return;
    }

    var controls = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(list.children);

    function textIncludes(source, target) {
      return String(source || '').toLowerCase().indexOf(String(target || '').toLowerCase()) !== -1;
    }

    function applyFilters() {
      var keyword = '';
      var year = '';
      var genre = '';
      var category = '';

      controls.forEach(function (control) {
        var name = control.getAttribute('data-filter');
        var value = control.value.trim();

        if (name === 'keyword') {
          keyword = value;
        }

        if (name === 'year') {
          year = value;
        }

        if (name === 'genre') {
          genre = value;
        }

        if (name === 'category') {
          category = value;
        }
      });

      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' ');

        var matchesKeyword = !keyword || textIncludes(haystack, keyword);
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var matchesGenre = !genre || textIncludes(card.getAttribute('data-genre'), genre) || textIncludes(haystack, genre);
        var matchesCategory = !category || card.getAttribute('data-category') === category;
        var isVisible = matchesKeyword && matchesYear && matchesGenre && matchesCategory;

        card.classList.toggle('is-hidden-card', !isVisible);

        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visibleCount);
      }
    }

    controls.forEach(function (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
  });
})();
