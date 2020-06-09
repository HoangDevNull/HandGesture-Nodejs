const cv = require("opencv4nodejs");
const express = require("express");
const app = express();

const { loadModel, predictData } = require("./train/model");
const { convertBufferToTensor } = require("./train/dataset");
const { makeHandMask, getHandContour, getHSVConfig, saveHSVConfig, transformToArray, removeBackground } = require("./utils");
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

// Declare some global variable
const blue = new cv.Vec(255, 0, 0);
const green = new cv.Vec(0, 255, 0);
const red = new cv.Vec(0, 0, 255);
const word = ["Thumb down", "Palm (Horizontal)", "L",
  "Fist (Horizontal)", "Fist (Vertical)", "Thumbs up",
  "Index", "OK", "Palm (Vertical)", "C"];
var img;
var skinRange = null;
const kernel = new cv.Mat(3, 3, cv.CV_8U, 1);
const point = new cv.Point(-1, -1);
getHSVConfig().then(data => skinRange = data).catch(err => console.log(err))

io.on("connection", (socket) => {
  socket.on('data', async function (data) {// listen on client emit 'data'
    let base64 = data.split(',')[1];
    img = await cv.imdecodeAsync(Buffer.from(base64, 'base64'));
  });

  const arr = ["H_L", "H_H", "S_L", "S_H", "V_L", "V_H"];
  arr.forEach(ele => {
    socket.on(ele, function (data) {// listen on client emit 'data'
      skinRange[ele] = data;
      saveHSVConfig(skinRange);
    });
  })
});

// main
(async () => {
  var k = 0;
  var bg = null;
  const model = await loadModel("model_3");
  // var bgSubtractor = new cv.BackgroundSubtractorMOG2(500, 16, false);
  // let out = bgSubtractor.apply(cropedImage).copy();
  const intvl = setInterval(async () => {
    if (img) {
      let resizedImg = img.resizeToMax(640).flip(1);
      // Create croped image to wrap the hand
      let cropedImage = resizedImg.getRegion(new cv.Rect(0, 0, 300, 350)).cvtColor(cv.COLOR_BGR2GRAY).copy();

      // get background image
      if (k < 20) {
        bg = cropedImage.copy();
        k++;
      }
      // difference image
      let diff = cropedImage.absdiff(bg).copy();

      // const mask = new cv.Mat(diff.rows, diff.cols, cv.CV_8UC1, 0);
      // let th = 10;
      // for (var i = 0; i < diff.rows; i++) {
      //   for (var j = 0; j < diff.cols; j++) {
      //     let pix = diff.atRaw(i, j);
      //     let val = (pix[0] + pix[1] + pix[2]);
      //     console.log(pix)
      //     if (val > th) {
      //       mask.set(j, i, [255]);
      //     }
      //   }
      // }

      cv.imshow("result", diff);
      // cv.imshow("mark", mask);

      // let handMask = diff.threshold(25, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
      // handMask = handMask.morphologyEx(kernel, cv.MORPH_OPEN, new cv.Point(2, 2));


      // // const handMask = makeHandMask(cropedImage, skinRange);
      // const handContour = getHandContour(handMask);

      // if (!handContour) {
      //   return;
      // }

      // const imgContours = handContour && handContour.map((contour) => {
      //   return contour.getPoints();
      // });

      // // // draw bounding box and center line
      // resizedImg.drawContours(imgContours, -1, blue, 2);
      // const imageData = handMask.resize(120, 320);


      // let tFrame = await convertBufferToTensor(imageData);

      // let contourArea = handContour[0] !== undefined ? handContour[0].area : 0;
      // if (model && contourArea > 30000) {
      //   setTimeout(() => {
      //     let predicts = model.predict(tFrame).arraySync()[0];
      //     let max = Math.max(...predicts);
      //     let predictWord = word[predicts.indexOf(max)];
      //     const fontScale = 2;
      //     console.log(predictWord)
      //     resizedImg.putText(
      //       String(predictWord),
      //       new cv.Point(20, 60),
      //       cv.FONT_ITALIC,
      //       fontScale,
      //       { color: green, thickness: 2 }
      //     );
      //   }, 300)
      // }
      // cv.imshow('background', bg);
      // cv.imshow('handMask2', handMask);
      // cv.imshow('result', resizedImg);
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