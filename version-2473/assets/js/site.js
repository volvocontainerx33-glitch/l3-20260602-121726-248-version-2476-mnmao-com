(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupImageFallbacks() {
        document.querySelectorAll('img[data-fallback-image]').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-hidden');
                var poster = image.closest('.poster');
                if (poster) {
                    poster.classList.add('poster-fallback');
                }
            });
        });
    }

    function setupHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupFilters() {
        document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var yearFilter = scope.querySelector('[data-year-filter]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));
            var count = scope.querySelector('[data-result-count]');

            function update() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var year = yearFilter ? yearFilter.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-year') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-genre') || '',
                        card.textContent || ''
                    ].join(' ').toLowerCase();
                    var cardYear = card.getAttribute('data-year') || '';
                    var matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!year || cardYear === year);
                    card.classList.toggle('is-filtered', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '筛选结果：' + visible + ' 部内容';
                }
            }

            if (input) {
                input.addEventListener('input', update);
            }
            if (yearFilter) {
                yearFilter.addEventListener('change', update);
            }

            if (input && input.hasAttribute('data-query-input')) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get('q');
                if (query) {
                    input.value = query;
                }
            }
            update();
        });
    }

    function setupPlayer() {
        document.querySelectorAll('[data-play-button]').forEach(function (button) {
            button.addEventListener('click', function () {
                var shell = button.closest('.video-shell');
                var video = shell ? shell.querySelector('[data-player-video]') : null;
                var videoUrl = button.getAttribute('data-video');
                if (!video || !videoUrl) {
                    return;
                }

                button.classList.add('is-hidden');
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(videoUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = videoUrl;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = videoUrl;
                    video.play().catch(function () {});
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupImageFallbacks();
        setupHeroSlider();
        setupFilters();
        setupPlayer();
    });
})();
