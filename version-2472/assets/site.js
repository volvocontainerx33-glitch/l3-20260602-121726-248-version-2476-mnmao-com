(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", panel.classList.contains("is-open"));
        });
        panel.addEventListener("click", function (event) {
            if (event.target.tagName === "A") {
                panel.classList.remove("is-open");
                document.body.classList.remove("menu-open");
            }
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            window.clearInterval(timer);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                stop();
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var outer = scope.parentElement || document;
            var list = outer.querySelector("[data-movie-list]") || document;
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .compact-card"));
            var input = scope.querySelector("[data-search-input]");
            var category = scope.querySelector("[data-filter-category]");
            var type = scope.querySelector("[data-filter-type]");
            var year = scope.querySelector("[data-filter-year]");
            var count = scope.querySelector("[data-result-count]");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (input && query) {
                input.value = query;
            }
            function textOf(card) {
                return (card.getAttribute("data-search-text") || "").toLowerCase();
            }
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var categoryValue = category ? category.value : "";
                var typeValue = type ? type.value : "";
                var yearValue = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var matched = true;
                    if (keyword && textOf(card).indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (categoryValue && card.getAttribute("data-category") !== categoryValue) {
                        matched = false;
                    }
                    if (typeValue && (card.getAttribute("data-type") || "").indexOf(typeValue) === -1) {
                        matched = false;
                    }
                    if (yearValue && card.getAttribute("data-year") !== yearValue) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = "匹配 " + visible + " 部";
                }
            }
            [input, category, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function setupHeaderSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-header-search]"));
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function startVideo(wrapper) {
        var video = wrapper.querySelector("video");
        var button = wrapper.querySelector("[data-play-button]");
        var playlistUrl = wrapper.getAttribute("data-video-url");
        if (!video || !playlistUrl) {
            return;
        }
        function play() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (video.getAttribute("data-ready") === "1") {
            wrapper.classList.add("is-playing");
            play();
            return;
        }
        video.setAttribute("data-ready", "1");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = playlistUrl;
            video.addEventListener("loadedmetadata", play, { once: true });
            wrapper.classList.add("is-playing");
            play();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(playlistUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                wrapper.classList.add("is-playing");
                play();
            });
            hls.on(window.Hls.Events.ERROR, function (_, data) {
                if (data && data.fatal) {
                    hls.destroy();
                    video.src = playlistUrl;
                    wrapper.classList.add("is-playing");
                    play();
                }
            });
            wrapper.hlsInstance = hls;
        } else {
            video.src = playlistUrl;
            video.addEventListener("loadedmetadata", play, { once: true });
            wrapper.classList.add("is-playing");
            play();
        }
        if (button) {
            button.blur();
        }
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-video-url]"));
        players.forEach(function (wrapper) {
            var button = wrapper.querySelector("[data-play-button]");
            var video = wrapper.querySelector("video");
            if (button) {
                button.addEventListener("click", function () {
                    startVideo(wrapper);
                });
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        startVideo(wrapper);
                    }
                });
                video.addEventListener("play", function () {
                    wrapper.classList.add("is-playing");
                });
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupHeaderSearch();
        setupPlayers();
    });
})();
