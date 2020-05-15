const cv = require("opencv4nodejs");
const { grabFrames } = require("../helper/utils");

// segmenting by skin color (has to be adjusted)
const skinColorUpper = hue => new cv.Vec(hue, 0.8 * 255, 0.6 * 255);
const skinColorLower = hue => new cv.Vec(hue, 0.1 * 255, 0.05 * 255);
const makeHandMask = (img) => {
    // filter by skin color
    const imgHLS = img.cvtColor(cv.COLOR_BGR2HLS);
    const rangeMask = imgHLS.inRange(skinColorLower(0), skinColorUpper(60));

    // remove noise
    const blurred = rangeMask.blur(new cv.Size(10, 10));
    const thresholded = blurred.threshold(100, 255, cv.THRESH_BINARY);

    return thresholded;
};

const getHandContour = (handMask) => {
    const mode = cv.RETR_EXTERNAL;
    const method = cv.CHAIN_APPROX_SIMPLE;
    const contours = handMask.findContours(mode, method);

    // largest contour
    return contours.sort((c0, c1) => c1.area - c0.area)[0];
};

grabFrames('./data/hand.mp4', 10, (frame) => {
    var resizedImg = frame.resizeToMax(640);
    resizedImg = resizedImg.flip(-1)

    const imgHLS = resizedImg.cvtColor(cv.COLOR_BGR2HLS);
    const rangeMask = imgHLS.inRange(new cv.Vec(2, 0, 0), new cv.Vec(25, 255, 255));

    const kernel = new cv.Mat(5, 5, cv.CV_8U, 1);
    const point = new cv.Point(-1, -1);
    const dilation = rangeMask.dilate(
        kernel,
        point,
        1
    );
    const erotion = dilation.erode(kernel,
        point,
        1);

    // remove noise
    // remove noise
    const blurred = rangeMask.blur(new cv.Size(10, 10));
    const thresholded = blurred.threshold(200, 255, cv.THRESH_BINARY);



    cv.imshow('origin', rangeMask);
    cv.imshow('mask', blurred);

});