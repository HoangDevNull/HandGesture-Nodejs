const cv = require("opencv4nodejs");
const express = require("express");
const app = express();

const { loadModel, predictData } = require("./train/model");
const { convertBufferToTensor } = require("./train/dataset");
const { makeHandMask, getHandContour, getHSVConfig, saveHSVConfig } = require("./utils");
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
var img;
var skinRange = null;
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
  const model = await loadModel("test_model");
  const intvl = setInterval(async () => {
    if (img) {
      let resizedImg = img.resizeToMax(640);
      // Create croped image to wrap the hand
      // let cropedImage = resizedImg.getRegion(new cv.Rect(0, 0, 300, 300));
      const handMask = makeHandMask(resizedImg, skinRange);
      const handContour = getHandContour(handMask);

      if (!handContour) {
        return;
      }

      const imgContours = handContour && handContour.map((contour) => {
        return contour.getPoints();
      });

      // draw bounding box and center line
      resizedImg.drawContours(imgContours, -1, blue, 2);
      const imageData = handMask.resize(50, 50);


      // let tFrame = await convertBufferToTensor(imageData);

      // if (model) {
      //   setTimeout(() => {
      //     let predicts = model.predict(tFrame).arraySync()[0];
      //     let max = Math.max(...predicts);
      //     let predictWord = word[predicts.indexOf(max)];
      //     console.log(predictWord)
      //     // const fontScale = 2;
      //     // handMask.putText(
      //     //   String(predictWord),
      //     //   new cv.Point(20, 60),
      //     //   cv.FONT_ITALIC,
      //     //   fontScale,
      //     //   { color: green, thickness: 2 }
      //     // );
      //   }, 300)
      // }
      cv.imshow('handMask', handMask);
      cv.imshow('handMask2', resizedImg);
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