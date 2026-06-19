(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function toggleMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var links = document.querySelector("[data-nav-links]");
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener("click", function () {
      links.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-go]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-go")) || 0);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function initRails() {
    document.querySelectorAll("[data-scroll-left], [data-scroll-right]").forEach(function (button) {
      button.addEventListener("click", function () {
        var id = button.getAttribute("data-scroll-left") || button.getAttribute("data-scroll-right");
        var rail = document.getElementById(id);
        var direction = button.hasAttribute("data-scroll-left") ? -1 : 1;
        if (rail) {
          rail.scrollBy({
            left: direction * 420,
            behavior: "smooth"
          });
        }
      });
    });
  }

  function initFilters() {
    document.querySelectorAll(".page-filter").forEach(function (input) {
      var targetId = input.getAttribute("data-filter-target");
      var target = document.getElementById(targetId);
      if (!target) {
        return;
      }
      var items = Array.prototype.slice.call(target.querySelectorAll("[data-search]"));
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && !input.value) {
        input.value = q;
      }
      function apply() {
        var term = input.value.trim().toLowerCase();
        items.forEach(function (item) {
          var text = (item.getAttribute("data-search") || "").toLowerCase();
          item.classList.toggle("is-filter-hidden", term && text.indexOf(term) === -1);
        });
      }
      input.addEventListener("input", apply);
      apply();
    });
  }

  function attachStream(video, stream) {
    if (!stream) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = stream;
  }

  function initPlayers() {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      var stream = shell.getAttribute("data-stream");
      var loaded = false;

      function start() {
        if (!video) {
          return;
        }
        if (!loaded) {
          attachStream(video, stream);
          loaded = true;
        }
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!loaded || video.paused) {
            start();
          } else {
            video.pause();
          }
        });
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
      }
    });
  }

  ready(function () {
    toggleMenu();
    initHero();
    initRails();
    initFilters();
    initPlayers();
  });
})();
