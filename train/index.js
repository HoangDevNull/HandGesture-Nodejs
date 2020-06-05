const tf = require('@tensorflow/tfjs');
// Load the binding (CPU computation)
const tfnode = require('@tensorflow/tfjs-node');

const { dataset, testImage } = require("./dataset");
const { getModel, getModel2, train, loadModel } = require("./model");


async function run() {
    const data = await dataset();
    const model = await getModel2();

    await train(model, data);

    console.log(`train finish`);
    await model.save(`file://./public/models/test_model2`);

    // const model = await loadModel("test_model");
    const testData1 = await testImage(0, 500);
    const testData2 = await testImage(1, 200);
    const testData3 = await testImage(2, 33);

    let result1 = model.predict(testData1).arraySync();
    let result2 = model.predict(testData2).arraySync();
    let result3 = model.predict(testData3).arraySync();
    console.log([result1, result2, result3]);
}


run();