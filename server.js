const cv = require("opencv4nodejs");
const express = require("express");
const app = express();

const { loadModel, predictData } = require("./train/model");
const { convertBufferToTensor } = require("./train/dataset");
// create server
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("index.html");
});
app.get("/handtrack", (req, res) => {
  res.redirect("handtrack.html");
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



(async () => {
  const model = await loadModel("test_model");
  const intvl = setInterval(async () => {
    if (img) {
      let resizedImg = img.resizeToMax(640).flip(1);
      // Create croped image to wrap the hand
      // let cropedImage = resizedImg.getRegion(new cv.Rect(100, 100, 350, 350));
      const handMask = makeHandMask(resizedImg);
      const imageData = handMask.resize(50, 50);

      let tFrame = await convertBufferToTensor(imageData);

      if (model) console.log(model.predict(tFrame).arraySync());

      cv.imshow('handMask', handMask);
      cv.imshow('result', imageData);
    }
    const key = cv.waitKey(10);
    done = key !== -1 && key !== 255;
    if (done) {
      clearInterval(intvl);
      console.log('Key pressed, exiting.');
      process.exit(1);
    }
  }, 200);
})();