(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === active);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var searchForms = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
    searchForms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var keyword = input ? input.value.trim() : "";
        if (keyword) {
          var target = form.getAttribute("data-target") || "categories.html";
          window.location.href = target + "?q=" + encodeURIComponent(keyword);
        }
      });
    });

    var list = document.querySelector("[data-filter-list]");
    if (list) {
      var input = document.querySelector("[data-filter-keyword]");
      var genre = document.querySelector("[data-filter-genre]");
      var year = document.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .hot-item"));
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      if (initial && input) {
        input.value = initial;
      }

      function applyFilter() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var g = genre ? genre.value : "";
        var y = year ? year.value : "";
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          var cardGenre = card.getAttribute("data-genre") || "";
          var cardYear = parseInt(card.getAttribute("data-year") || "0", 10);
          var okKeyword = !q || text.indexOf(q) !== -1;
          var okGenre = !g || cardGenre.indexOf(g) !== -1;
          var okYear = true;
          if (y === "2020") {
            okYear = cardYear >= 2020;
          }
          if (y === "2010") {
            okYear = cardYear >= 2010 && cardYear < 2020;
          }
          if (y === "2000") {
            okYear = cardYear >= 2000 && cardYear < 2010;
          }
          if (y === "old") {
            okYear = cardYear > 0 && cardYear < 2000;
          }
          card.classList.toggle("hidden-card", !(okKeyword && okGenre && okYear));
        });
      }

      [input, genre, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
      applyFilter();
    }
  });
})();
