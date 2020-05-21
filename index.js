const cv = require('opencv4nodejs');
// const { grabFrames } = require("./helper/utils");
const grabFrames = (delay, onFrame) => {
    const devicePort = 0;
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
const blue = new cv.Vec(255, 0, 0);
const green = new cv.Vec(0, 255, 0);
const red = new cv.Vec(0, 0, 255);

// main
const delay = 10;
grabFrames(delay, (frame) => {

    let resizedImg = frame.resizeToMax(640).flip(1);
    // Create croped image to wrap the hand
    let cropedImage = resizedImg.getRegion(new cv.Rect(100, 100, 350, 350));
    const handMask = makeHandMask(cropedImage);


    cv.imshow('handMask', handMask);
    cv.imshow('result', cropedImage);
});


// let delay = 10;

// grabFrames(delay, (frame) => {
//     const resizedImg = frame.resizeToMax(640);
//     frame = frame.flip(1);

//     let originFrame = frame.copy();
//     originFrame.drawRectangle(
//         new cv.Point(100, 100), // top-left
//         new cv.Point(350, 350), // bottom right
//         { color: new cv.Vec3(255, 0, 0), thickness: 1 }
//     );


//     // Create croped image to wrap the hand
//     let cropedImage = frame.getRegion(new cv.Rect(100, 100, 350, 350));

//     cropedImage = cropedImage.blur(new cv.Size(5, 5));

//     const handMask = makeHandMask(cropedImage);
//     const handContour = getHandContour(handMask);
//     if (!handContour) {
//         return;
//     }

//     cv.imshow('origin', originFrame);
//     cv.imshow('mask', handMask);

//     // cv.imshow('origin', originFrame);
//     // cv.imshow('result', thresholded);
// });

