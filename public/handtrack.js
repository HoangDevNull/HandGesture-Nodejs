const URL = "http://localhost:3000/";
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



const video = document.querySelector("#myVideo");
const canvas = document.querySelector("#myCanvas");
const ctx = canvas.getContext("2d");
let isVideoPlay = false;
let model = null;
const modelParams = {
    flipHorizontal: true,   // flip e.g for video
    maxNumBoxes: 2,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.8,    // confidence threshold for predictions.
}


function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            navigator.getUserMedia({ video: true, audio: false }, (stream) => {
                video.srcObject = stream;
            }, err => {
                console.log(err)
            })
            console.log("Video started. Now tracking");
            isVideoPlay = true;
            model && runDetection();
        } else {
            console.log("can't start video")
        }
    });
}


function stopVideo() {
    handTrack.stopVideo();
    isVideoPlay = false;
    var stream = video.srcObject;
    var tracks = stream.getTracks();

    for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        track.stop();
    }
    video.srcObject = null;
}


function runDetection() {
    model.detect(video).then(predictions => {

        if (predictions.length > 0) {
            console.log("Predictions: ", predictions);
            let bbox = predictions[0].bbox;
            console.log(bbox)
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, bbox[0] , bbox[1], 200, 200 , 0,0,200,200);
        }
        // model.renderPredictions(predictions, canvas, ctx, video);
        if (isVideoPlay) {
            requestAnimationFrame(runDetection);
        }
    });
}

// Load the model when page load
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    console.log("model is loaded")
});
