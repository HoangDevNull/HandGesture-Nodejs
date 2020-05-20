const tf = require('@tensorflow/tfjs');
// Load the binding (CPU computation)
const tfnode = require('@tensorflow/tfjs-node');

const { dataset, testImage } = require("./dataset");
const { getModel, train, loadModel } = require("./model");


async function run() {
    const data = await dataset();
    const model = await getModel();

    await train(model, data);

    console.log(`train finish`);
    await model.save(`file://./public/models/test_model`);

    // const model = await loadModel("test_model");
    const testData1 = await testImage(0, 1);
    const testData2 = await testImage(1, 1);
    const testData3 = await testImage(2, 1);

    let result1 = model.predict(testData1).arraySync();
    let result2 = model.predict(testData2).arraySync();
    let result3 = model.predict(testData3).arraySync();
    console.log([result1, result2, result3]);
}


run();