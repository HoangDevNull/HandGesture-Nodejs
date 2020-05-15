const URL = "http://localhost:3000";
var socket = io(URL);
socket.on("connect", () => {
  console.log("connect to" + URL);
});
socket.on("disconnect", () => {
  console.log("disconnect to" + URL);
});

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

const video = document.querySelector("#video");
const canvas = document.querySelector("#myCanvas");
const ctx = canvas.getContext("2d");
var prewViewItv;
function startWebcam() {
  if (navigator.getUserMedia) {
    navigator.getUserMedia(
      { video: { facingMode: "user" }, audio: false },
      (stream) => {
        video.srcObject = stream;
      },
      (err) => {
        console.log(err);
      }
    );
  }
  prewViewItv = setInterval(() => {
    viewVideo(video, ctx);
    console.log(canvas.toDataURL("image/webp"));
  }, 200);
}

function stopWebcam(e) {
  var stream = video.srcObject;
  var tracks = stream.getTracks();

  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];
    track.stop();
  }
  video.srcObject = null;

  clearInterval(prewViewItv);
}

function viewVideo(video, context) {
  context.drawImage(video, 0, 0);
}
