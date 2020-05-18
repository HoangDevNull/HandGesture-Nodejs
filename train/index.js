const tf = require('@tensorflow/tfjs');
// Load the binding (CPU computation)
const tfnode = require('@tensorflow/tfjs-node');

const { dataset, testImage } = require("./dataset");


async function run() {
    const { xs, ys } = await dataset();

    const model = tf.sequential();
    model.add(tf.layers.conv2d({
        inputShape: [50, 50, 1], // numberOfChannels = 3 for colorful images and one otherwise
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
    }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 3, activation: 'softmax' }));

    //sumary model
    model.summary();
    // compiling model
    model.compile({
        optimizer: tf.train.adam(),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    });


    const batchSize = 512;
    const epochs = 20;
    const modelPath = "first_model";
    await model.fit(xs, ys, {
        epochs: epochs,
        batchSize: batchSize
    });
    console.log(`train finish`);
    await model.save(`file://./public/models/${modelPath}`);


    const testData1 = await testImage(1, 1);
    const testData2 = await testImage(2, 1);
    const testData3 = await testImage(3, 1);

    let result1 = model.predict(testData1).arraySync();
    let result2 = model.predict(testData2).arraySync();
    let result3 = model.predict(testData3).arraySync();
    console.log([result1, result2, result3]);
}


run();