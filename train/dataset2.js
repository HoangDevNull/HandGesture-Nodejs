const fs = require("fs");
const util = require('util');
const path = require("path");
const cv = require("opencv4nodejs");
const tf = require('@tensorflow/tfjs');
// Load the binding (CPU computation)
const tfnode = require('@tensorflow/tfjs-node');

// Convert fs.readFile into Promise version of same
const readFile = util.promisify(fs.readFile);

// Create some constant
const URL = "../data/gesture2";
const folderName = ["01_palm", "02_l", "03_fist", "04_fist_moved",
    "05_thumb", "06_index", "07_ok", "08_palm_moved", "09_c", "10_down"];
const rootFolderName = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09"];
const childFolderName = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
const labelArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const IMAGE_LARGE = 200;

const loadFeatureData = async () => {
    try {
        let tensorArray = [];
        for (ele of rootFolderName) {
            for (let i = 0; i < folderName.length; i++) {
                for (let j = 1; j <= IMAGE_LARGE; j++) {
                    if (j < 10) j = "00" + j;
                    if (j < 100 && j >= 10) j = "0" + j
                    let imageFile = cv.imread(path.join(__dirname,
                        `${URL}/${ele}/${folderName[i]}/frame_${ele}_${childFolderName[i]}_0${j}.png`));
                    let img = imageFile.cvtColor(cv.COLOR_BGR2GRAY)// Converts into the corret colorspace(GRAY)
                    img = img.resize(120, 320);// Reduce image size so training can be faster
                    let imageBuffer = cv.imencode(".png", img);
                    tensorFeature = tfnode.node.decodeImage(imageBuffer); // create a tensor for the image
                    tensorArray.push(tensorFeature);
                }
            }
        }

        return tensorArray;
    } catch (err) {
        console.log(err)
    }
}

const getLabelData = () => {
    let array = [];
    for (let i = 0; i < childFolderName.length; i++) {
        for (let i = 0; i <= 9; i++) {
            array = [...array, ...new Array(IMAGE_LARGE).fill(i)];
        }
    }
    return array;
}


const dataset = async () => {
    const features = await loadFeatureData();
    const labels = getLabelData();
    const tensorFeatures = tf.stack(features);
    const tensorLabels = tf.oneHot(tf.tensor1d(labels, 'int32'), 10);

    return {
        xs: tensorFeatures,
        ys: tensorLabels
    }
}



module.exports = {
    dataset
}