const cv = require("opencv4nodejs");
const express = require("express");
const app = express();
const path = require("path");
// create server
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("index.html");
});

server.listen(3000, () => {
  console.log("app is runing");
});

// segmenting by skin color (has to be adjusted)
const skinColorUpper = hue => new cv.Vec(hue, 150, 0.6 * 255);
const skinColorLower = hue => new cv.Vec(hue, 20, 0.05 * 255);
const makeHandMask = (img) => {
  // filter by skin color
  const imgHLS = img.cvtColor(cv.COLOR_BGR2HLS);
  const rangeMask = imgHLS.inRange(skinColorLower(140), skinColorUpper(180));

  // remove noise
  const blurred = rangeMask.medianBlur(3);
  const thresholded = blurred.threshold(200, 255, cv.THRESH_BINARY);

  const kernel = new cv.Mat(5, 5, cv.CV_8U, 1);
  const point = new cv.Point(-1, -1);
  const dilation = thresholded.dilate(
    kernel,
    point,
    1
  );
  const erotion = dilation.erode(kernel,
    point,
    1);


  return erotion;
};
var img;

io.on("connection", (socket) => {
  socket.on('data', async function (data) {// listen on client emit 'data'
    let base64 = data.split(',')[1];
    img = await cv.imdecodeAsync(Buffer.from(base64, 'base64'));
  })
});

const intvl = setInterval(() => {
  if (img) {
    let flipImage = img.flip(1);
    // Create croped image to wrap the hand
    // let cropedImage = resizedImg.getRegion(new cv.Rect(100, 100, 350, 350));
    // flipImage.drawRectangle(
    //   new cv.Point(100, 100), // top-left
    //   new cv.Point(350, 350), // bottom right
    //   { color: new cv.Vec3(255, 0, 0), thickness: 1 }
    // );
    // create threshold image
    const handMask = makeHandMask(flipImage);

    cv.imshow('origin', flipImage);
    cv.imshow('handMask', handMask);
  }
  const key = cv.waitKey(10);
  done = key !== -1 && key !== 255;
  if (done) {
    clearInterval(intvl);
    console.log('Key pressed, exiting.');
    process.exit(1);
  }
}, 200);

