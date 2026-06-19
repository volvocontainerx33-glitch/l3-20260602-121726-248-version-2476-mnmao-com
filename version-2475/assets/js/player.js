(function () {
  function setupPlayer(box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".play-cover");
    if (!video) {
      return;
    }
    var src = video.getAttribute("data-stream");
    var loaded = false;

    function loadStream() {
      if (loaded || !src) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else {
        video.src = src;
      }
    }

    if (button) {
      button.addEventListener("click", function () {
        loadStream();
        button.style.display = "none";
        var playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {
            button.style.display = "grid";
          });
        }
      });
    }

    video.addEventListener("play", function () {
      if (button) {
        button.style.display = "none";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll(".player-box")).forEach(setupPlayer);
  });
})();
