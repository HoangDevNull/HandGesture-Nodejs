const cv = require("opencv4nodejs");

const tf = require('@tensorflow/tfjs');
// Load the binding (CPU computation)
const tfnode = require('@tensorflow/tfjs-node');
const { convertBufferToTensor } = require("../train/dataset");
const { loadModel } = require("../train/model");

const grabFrames = (videoFile, delay, onFrame) => {
    const cap = new cv.VideoCapture(videoFile);
    let done = false;
    const intvl = setInterval(() => {
        let frame = cap.read();
        // loop back to start on end of stream reached
        if (frame.empty) {
            cap.reset();
            frame = cap.read();
        }
        onFrame(frame);

        const key = cv.waitKey(delay);
        done = key !== -1 && key !== 255;
        if (done) {
            clearInterval(intvl);
            console.log('Key pressed, exiting.');
        }
    }, 0);
};
const word = ["Thumb down", "Palm (Horizontal)", "L",
    "Fist (Horizontal)", "Fist (Vertical)", "Thumbs up",
    "Index", "OK", "Palm (Vertical)", "C"];
// segmenting by skin color (has to be adjusted)
const skinColorUpper = hue => new cv.Vec(hue, 0.8 * 255, 0.6 * 255);
const skinColorLower = hue => new cv.Vec(hue, 0.1 * 255, 0.05 * 255);
const makeHandMask = (img) => {
    // filter by skin color
    const imgHLS = img.cvtColor(cv.COLOR_BGR2HLS);
    const rangeMask = imgHLS.inRange(skinColorLower(0), skinColorUpper(15));
    // remove noise
    const blurred = rangeMask.blur(new cv.Size(10, 10));
    const thresholded = blurred.threshold(200, 255, cv.THRESH_BINARY);

    return thresholded;
};

async function init() {
    const model = await loadModel("model_4");
    grabFrames('./data/hand-gesture.mp4', 100, async (frame) => {
        let resizedImg = frame.copy();
        // Create croped image to wrap the hand
        // let cropedImage = resizedImg.getRegion(new cv.Rect(100, 100, 350, 350));
        const handMask = makeHandMask(resizedImg);
        const imageData = handMask.resize(50, 50);

        let tFrame = await convertBufferToTensor(imageData);
        let predicts = model.predict(tFrame).arraySync()[0];
        console.log(predicts)
        // let max = Math.max(...predicts);
        // let predictWord = word[predicts.indexOf(max)];
        // console.log(predictWord)
        cv.imshow('handMask', handMask);
        cv.imshow('result', imageData);
    });
}

init();

