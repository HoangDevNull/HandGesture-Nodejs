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


let word = ["A", "B", "C"];

const skinRange = {
  H_L: 0, H_H: 0, S_L: 0, S_H: 0, V_L: 0, V_H: 0
};

const blue = new cv.Vec(255, 0, 0);
const green = new cv.Vec(0, 255, 0);
const red = new cv.Vec(0, 0, 255);

var img;

const makeHandMask = (img) => {
  // filter by skin color
  const imgHLS = img.cvtColor(cv.COLOR_BGR2HLS);
  const rangeMask = imgHLS.inRange(
    new cv.Vec(skinRange.H_L, skinRange.S_L, skinRange.V_L),
    new cv.Vec(skinRange.H_H, skinRange.S_H, skinRange.V_H));

  // remove noise
  const blurred = rangeMask.blur(new cv.Size(10, 10));
  const thresholded = blurred.threshold(0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
  // const kernel = new cv.Mat(5, 5, cv.CV_8U, 1);
  // const point = new cv.Point(-1, -1);
  // const dilation = thresholded.dilate(
  //   kernel,
  //   point,
  //   1
  // );
  // const erotion = dilation.erode(kernel,
  //   point,
  //   1);
  return thresholded;
};

io.on("connection", (socket) => {
  socket.on('data', async function (data) {// listen on client emit 'data'
    let base64 = data.split(',')[1];
    img = await cv.imdecodeAsync(Buffer.from(base64, 'base64'));
  });

  const arr = ["H_L", "H_H", "S_L", "S_H", "V_L", "V_H"];
  arr.forEach(ele => {
    socket.on(ele, function (data) {// listen on client emit 'data'
      skinRange[ele] = data;
    });
  })
});

// main
(async () => {
  const model = await loadModel("test_model");
  const intvl = setInterval(async () => {
    if (img) {
      let resizedImg = img.resizeToMax(640).flip(1);
      // Create croped image to wrap the hand
      let cropedImage = resizedImg.getRegion(new cv.Rect(0, 0, 500, 500));
      const handMask = makeHandMask(cropedImage);
      const imageData = handMask.resize(50, 50);

      let tFrame = await convertBufferToTensor(imageData);

      if (model) {
        setTimeout(() => {
          let predicts = model.predict(tFrame).arraySync()[0];
          let max = Math.max(...predicts);
          let predictWord = word[predicts.indexOf(max)];
          console.log(predictWord)
          // const fontScale = 2;
          // handMask.putText(
          //   String(predictWord),
          //   new cv.Point(20, 60),
          //   cv.FONT_ITALIC,
          //   fontScale,
          //   { color: green, thickness: 2 }
          // );
        }, 300)
      }
      cv.imshow('handMask', handMask);
      cv.imshow('handMask2', imageData);
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