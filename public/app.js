const URL = "http://192.168.233.1:3000/";
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
      { video: true, audio: false },
      (stream) => {
        video.srcObject = stream;
      },
      (err) => {
        console.log(err);
      }
    );
    // prewViewItv = setInterval(() => {
    //   viewVideo(video, ctx);
    //   socket.emit("data", canvas.toDataURL());

    // }, 200);
  }

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
