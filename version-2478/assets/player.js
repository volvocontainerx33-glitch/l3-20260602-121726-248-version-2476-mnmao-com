(function () {
  var currentScript = document.currentScript;
  var scriptUrl = currentScript && currentScript.src ? currentScript.src : window.location.href;
  var hlsModuleUrl = new URL('hls-local.js', scriptUrl).href;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function canPlayHlsNatively(video) {
    return video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
  }

  async function attachHls(video, source) {
    if (canPlayHlsNatively(video)) {
      video.src = source;
      return true;
    }

    try {
      var module = await import(hlsModuleUrl);
      var Hls = module.H;

      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        window.__currentHlsPlayer = hls;
        return true;
      }
    } catch (error) {
      console.warn('HLS module could not be loaded. Falling back to direct source.', error);
    }

    video.src = source;
    return false;
  }

  ready(function () {
    var video = document.getElementById('movie-player');
    var startButton = document.querySelector('.player-start');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    var isAttached = false;

    async function startPlayback() {
      if (!source) {
        return;
      }

      if (!isAttached) {
        isAttached = true;
        await attachHls(video, source);
      }

      if (startButton) {
        startButton.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (startButton) {
      startButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', function () {
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    });
  });
})();
