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
const labelArray = [0, 1, 2];
const IMAGE_LARGE = 2400;


async function testImage(folder, index) {
    const imageBuffer = await readFile(path.join(__dirname, `${URL}/${folder}/${index}.jpg`));
    tensorFeature = tfnode.node.decodeImage(imageBuffer); // create a tensor for the image
    return tensorFeature;
}

const loadData = async () => {
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


const dataset = async () => {
    const data = await loadData()
    const tensorFeatures = tf.stack(data);
    const tensorLabels = tf.oneHot(tf.tensor1d(labelArray, 'int32'), 3);

    return {
        xs: tensorFeatures,
        ys: tensorLabels
    }
}


module.exports = {
    dataset,
    testImage
}