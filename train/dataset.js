const fs = require("fs");
const util = require('util');
const path = require("path");
const tf = require('@tensorflow/tfjs');
// Load the binding (CPU computation)
const tfnode = require('@tensorflow/tfjs-node');

// Convert fs.readFile into Promise version of same
const readFile = util.promisify(fs.readFile);

// Create some constant
const URL = "../data/gestures";
const labelArray = [0, 1, 2, 3, 4, 5, 6];
const IMAGE_LARGE = 2400;


async function testImage(folder, index) {
    const imageBuffer = await readFile(path.join(__dirname, `${URL}/${folder}/${index}.jpg`));
    let tensorFeature = tfnode.node.decodeImage(imageBuffer); // create a tensor for the image
    return tf.stack([tensorFeature]);
}


async function convertBufferToTensor(bufferData) {

    let data = new Uint8Array(bufferData.getData().buffer);
    let tFrame = tf.stack([tf.tensor3d(data, [120, 320, 1])]);
    return tFrame;
}

const loadFeatureData = async () => {
    try {
        let tensorArray = [];
        for (const ele of labelArray) {
            for (let i = 1; i <= IMAGE_LARGE; i++) {
                const imageBuffer = await readFile(path.join(__dirname, `${URL}/${ele}/${i}.jpg`));
                tensorFeature = tfnode.node.decodeImage(imageBuffer); // create a tensor for the image
                tensorArray.push(tensorFeature);
            }
        }
        return tensorArray;
    } catch (err) {
        console.log(err)
    }
}

const getLabelData = () => {
    let arr0 = new Array(2400).fill(0);
    let arr1 = new Array(2400).fill(1);
    let arr2 = new Array(2400).fill(2);
    let arr3 = new Array(2400).fill(3);
    let arr4 = new Array(2400).fill(4);
    let arr5 = new Array(2400).fill(5);
    let arr6 = new Array(2400).fill(6);
    return [...arr0, ...arr1, ...arr2, ...arr3, ...arr4, ...arr5, ...arr6];
}


const dataset = async () => {
    const features = await loadFeatureData();
    const labels = getLabelData();
    const tensorFeatures = tf.stack(features);
    const tensorLabels = tf.oneHot(tf.tensor1d(labels, 'int32'), 7);

    return {
        xs: tensorFeatures,
        ys: tensorLabels
    }
}


module.exports = {
    dataset,
    testImage,
    convertBufferToTensor
}