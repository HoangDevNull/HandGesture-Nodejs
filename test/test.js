const cv = require("opencv4nodejs");

const tf = require('@tensorflow/tfjs');
// Load the binding (CPU computation)
const tfnode = require('@tensorflow/tfjs-node');
const { grabFrames } = require("../helper/utils");
const { convertBufferToTensor } = require("../train/dataset");
const { loadModel } = require("../train/model");

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
    const model = await loadModel("test_model");
    grabFrames('./data/hand-gesture.mp4', 10, async (frame) => {
        let resizedImg = frame.resizeToMax(640);
        // Create croped image to wrap the hand
        // let cropedImage = resizedImg.getRegion(new cv.Rect(100, 100, 350, 350));
        const handMask = makeHandMask(resizedImg);
        const imageData = handMask.resize(50, 50);

        let tFrame = await convertBufferToTensor(imageData);

        if (model) console.log(model.predict(tFrame).arraySync());

        cv.imshow('handMask', handMask);
        cv.imshow('result', imageData);
    });
}

init();

