function initPlayer(src) {
  var video = document.getElementById("videoPlayer");
  var cover = document.querySelector(".play-cover");
  if (!video || !src) {
    return;
  }
  var ready = false;
  var load = function () {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
  };
  var start = function () {
    load();
    if (cover) {
      cover.classList.add("hidden");
    }
    var playAction = video.play();
    if (playAction && typeof playAction.catch === "function") {
      playAction.catch(function () {});
    }
  };
  if (cover) {
    cover.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("hidden");
    }
  });
}
