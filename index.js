const cv = require('opencv4nodejs');
// const { grabFrames } = require("./helper/utils");
const grabFrames = (delay, onFrame) => {
    const devicePort = 1;
    const cap = new cv.VideoCapture(devicePort);
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

// segmenting by skin color (has to be adjusted)
const skinColorUpper = hue => new cv.Vec(hue, 0.8 * 255, 0.6 * 255);
const skinColorLower = hue => new cv.Vec(hue, 0.1 * 255, 0.05 * 255);
const makeHandMask = (img) => {
    // filter by skin color
    const imgHLS = img.cvtColor(cv.COLOR_BGR2HLS);
    const rangeMask = imgHLS.inRange(skinColorLower(0), skinColorUpper(30));

    // remove noise
    const blurred = rangeMask.blur(new cv.Size(10, 10));
    const thresholded = blurred.threshold(200, 255, cv.THRESH_BINARY);

    return thresholded;
};

const getHandContour = (handMask) => {
    const mode = cv.RETR_EXTERNAL;
    const method = cv.CHAIN_APPROX_SIMPLE;
    const contours = handMask.findContours(mode, method);

    // largest contour
    return contours.sort((c0, c1) => c1.area - c0.area)[0];
};

let delay = 10;

grabFrames(delay, (frame) => {
    const resizedImg = frame.resizeToMax(640);
    frame = frame.flip(1);

    let originFrame = frame.copy();
    originFrame.drawRectangle(
        new cv.Point(100, 100), // top-left
        new cv.Point(350, 350), // bottom right
        { color: new cv.Vec3(255, 0, 0), thickness: 1 }
    );


    // Create croped image to wrap the hand
    let cropedImage = frame.getRegion(new cv.Rect(100, 100, 350, 350));

    cropedImage = cropedImage.blur(new cv.Size(5, 5));

    const imgHLS = cropedImage.cvtColor(cv.COLOR_BGR2HLS);
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
    // const blurred = rangeMask.blur(new cv.Size(10, 10));
    // const thresholded = blurred.threshold(200, 255, cv.THRESH_BINARY);



    cv.imshow('origin', originFrame);
    cv.imshow('mask', erotion);

    // cv.imshow('origin', originFrame);
    // cv.imshow('result', thresholded);
});

