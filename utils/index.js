const cv = require('opencv4nodejs');
const fs = require("fs");
const path = require("path");

const getHandContour = (handMask) => {
    let contours = handMask.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_NONE, new cv.Point2(0, 0));
    return contours.sort((c0, c1) => c1.area - c0.area);
};

const makeHandMask = (img, skinRange) => {
    // filter by skin color
    const imgHLS = img.cvtColor(cv.COLOR_BGR2HLS);
    const rangeMask = imgHLS.inRange(
        new cv.Vec(skinRange.H_L, skinRange.S_L, skinRange.V_L),
        new cv.Vec(skinRange.H_H, skinRange.S_H, skinRange.V_H));

    // Mat of 1
    const kernel = new cv.Mat(5, 5, cv.CV_8U, 1);

    // morphological operator - OPEN
    const open = rangeMask.morphologyEx(kernel, cv.MORPH_OPEN, new cv.Point(2, 2), 3);

    // remove noise
    const blurred = open.blur(new cv.Size(10, 10));
    const thresholded = blurred.threshold(0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
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
    getHandContour, makeHandMask, getHSVConfig, saveHSVConfig
}