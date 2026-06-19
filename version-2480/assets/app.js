document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var show = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filters = document.querySelectorAll("[data-filter-scope]");
  filters.forEach(function (scope) {
    var input = scope.querySelector("[data-filter-input]");
    var year = scope.querySelector("[data-year-select]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : "";
      var y = year ? year.value : "";
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title || "",
          card.dataset.tags || "",
          card.dataset.region || "",
          card.dataset.year || ""
        ].join(" ").toLowerCase();
        var okText = !q || haystack.indexOf(q) !== -1;
        var okYear = !y || (card.dataset.year || "") === y;
        card.classList.toggle("is-hidden", !(okText && okYear));
      });
    };
    if (input) {
      input.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
  });

  var searchPage = document.querySelector("[data-search-page]");
  if (searchPage && window.SEARCH_DATA) {
    var form = searchPage.querySelector("[data-search-form]");
    var input = searchPage.querySelector("[data-search-input]");
    var results = searchPage.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }
    var render = function (query) {
      var q = query.trim().toLowerCase();
      var list = window.SEARCH_DATA.filter(function (item) {
        var target = [item.title, item.region, item.type, item.year, item.genre, item.tags].join(" ").toLowerCase();
        return !q || target.indexOf(q) !== -1;
      }).slice(0, 120);
      if (!list.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
        return;
      }
      results.innerHTML = list.map(function (item) {
        return '<a class="result-card" href="' + item.href + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<div><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.desc) + '</p></div>' +
          '</a>';
      }).join("");
    };
    var escapeHtml = function (value) {
      return String(value).replace(/[&<>"']/g, function (ch) {
        return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[ch];
      });
    };
    if (form && input) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render(input.value);
      });
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    render(initial);
  }
});
