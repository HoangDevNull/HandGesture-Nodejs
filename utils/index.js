const cv = require('opencv4nodejs');
const fs = require("fs");
const path = require("path");

const getHandContour = (handMask) => {
    let contours = handMask.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_NONE, new cv.Point2(0, 0));
    return contours.sort((c0, c1) => c1.area - c0.area);
};

const transformToArray = (image, imageBuffer) => {
    const ui8 = new Uint8Array(imageBuffer);
    const imageData = new Array((image.rows * image.cols));
    let index = 0;
    for (let i = 0; i < ui8.length; i += 3) {
        imageData[index] = [ui8[i], ui8[i + 1], ui8[i + 2]];
        index++;
    }
    return imageData;
}

const removeBackground = (frame, background) => {
    var thresholdOffset = 10;
    for (var i = 0; i < frame.rows; i++) {
        for (var j = 0; j < frame.cols; j++) {
            const framePixel = frame.at(i, j);
            const bgPixel = background.at(i, j);
            // console.log(framePixel)
            if (framePixel >= bgPixel - thresholdOffset && framePixel <= bgPixel + thresholdOffset)
                frame.set(i, j, [0])
            else
                frame.set(i, j, [255])
        }
    }
}

const makeHandMask = (img, skinRange) => {
    // filter by skin color
    const imgHLS = img.cvtColor(cv.COLOR_BGR2HLS);
    const rangeMask = imgHLS.inRange(
        new cv.Vec(skinRange.H_L, skinRange.S_L, skinRange.V_L),
        new cv.Vec(skinRange.H_H, skinRange.S_H, skinRange.V_H));

    // remove noise
    const blurred = rangeMask.blur(new cv.Size(5, 5));

    const kernel = new cv.Mat(5, 5, cv.CV_8U, 1);
    const point = new cv.Point(-1, -1);

    // const erotion = dilation.erode(kernel,
    //     point,
    //     1);
    // morphological operator - OPEN
    // const open = rangeMask.morphologyEx(kernel, cv.MORPH_OPEN, new cv.Point(2, 2), 3);
    // const close = open.morphologyEx(kernel, cv.MORPH_CLOSE, new cv.Point(2, 2), 3);
    const thresholded = blurred.threshold(0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
    const dilation = thresholded.dilate(
        kernel,
        point,
        2
    );
    const erotion = dilation.erode(kernel,
        point,
        1);
    return erotion;
};





const getHSVConfig = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(path.resolve(__dirname), "../config/config.json"), "utf-8", (err, jsonData) => {
            if (err) return reject(err);

            return resolve(JSON.parse(jsonData));
        });
    })
}

const saveHSVConfig = (data) => {
    fs.writeFileSync(path.join(path.resolve(__dirname), "../config/config.json"), JSON.stringify(data), "utf-8");
}


module.exports = {
    getHandContour, makeHandMask, getHSVConfig, saveHSVConfig, transformToArray, removeBackground
}