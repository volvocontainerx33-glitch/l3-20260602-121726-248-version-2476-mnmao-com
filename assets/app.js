(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function auto() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.dataset.heroDot));
                auto();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                auto();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                auto();
            });
        }

        auto();
    }

    const filterInput = document.querySelector("[data-filter-input]");
    const filterSelect = document.querySelector("[data-filter-select]");
    const cards = Array.from(document.querySelectorAll("[data-movie-card]"));

    function applyFilter() {
        const keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
        const year = filterSelect ? filterSelect.value : "";

        cards.forEach(function (card) {
            const title = (card.dataset.title || "").toLowerCase();
            const cardYear = card.dataset.year || "";
            const keywordMatch = keyword === "" || title.includes(keyword);
            const yearMatch = year === "" || cardYear === year;
            card.classList.toggle("hidden", !(keywordMatch && yearMatch));
        });
    }

    if (filterInput) {
        filterInput.addEventListener("input", applyFilter);
    }

    if (filterSelect) {
        filterSelect.addEventListener("change", applyFilter);
    }
}());
