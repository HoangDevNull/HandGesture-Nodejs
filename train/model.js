const tf = require("@tensorflow/tfjs");

const tfnode = require("@tensorflow/tfjs-node");


/**
 * Todo : Configuration model
 *  CNN model
 */
async function getModel() {
    const model = tf.sequential();

    const IMAGE_WIDTH = 50;
    const IMAGE_HEIGHT = 50;
    const IMAGE_CHANNELS = 1;

    // In the first layer of our convolutional neural network we have
    // to specify the input shape. Then we specify some parameters for
    // the convolution operation that takes place in this layer.
    model.add(tf.layers.conv2d({
        inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
        kernelSize: [2, 2],
        filters: 16,
        padding: "same",
        activation: 'relu',
        name: "conv1"
    }));
    // The MaxPooling layer acts as a sort of downsampling using max values
    // in a region instead of averaging.
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: 2, name: "pool1" }));

    // Repeat another conv2d + maxPooling stack.
    // Note that we have more filters in the convolution.
    model.add(tf.layers.conv2d({
        kernelSize: [5, 5],
        filters: 32,
        padding: "same",
        activation: 'relu',
        name: "conv2"
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: [5, 5], strides: 5 }));

    model.add(tf.layers.conv2d({
        kernelSize: [5, 5],
        filters: 64,
        padding: "same",
        activation: 'relu',
        name: "conv3"
    }));

    // Now we flatten the output from the 2D filters into a 1D vector to prepare
    // it for input into our last layer. This is common practice when feeding
    // higher dimensional data to a final classification output layer.
    model.add(tf.layers.flatten({
        // inputShape: [1, 1, 64]
    }));

    model.add(tf.layers.dense({
        units: 128,
        kernelInitializer: 'varianceScaling',
        activation: 'relu'
    }));

    model.add(tf.layers.dropout({
        rate: 0.2,
    }));

    const NUM_OUTPUT_CLASSES = 3;
    model.add(tf.layers.dense({
        units: NUM_OUTPUT_CLASSES,
        kernelInitializer: 'varianceScaling',
        activation: 'softmax'
    }));


    // Choose an optimizer, loss function and accuracy metric,
    // then compile and return the model
    const optimizer = tf.train.adam();
    model.compile({
        optimizer: optimizer,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    });

    model.summary();

    return model;
}


function getModel2() {
    const model = tf.sequential();

    const IMAGE_WIDTH = 120;
    const IMAGE_HEIGHT = 320;
    const IMAGE_CHANNELS = 1;

    // In the first layer of our convolutional neural network we have
    // to specify the input shape. Then we specify some parameters for
    // the convolution operation that takes place in this layer.
    model.add(tf.layers.conv2d({
        inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
        kernelSize: [5, 5],
        filters: 32,
        activation: 'relu',
        name: "conv1"
    }));

    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2], padding: "same", name: "pool1" }));

    model.add(tf.layers.conv2d({
        kernelSize: [3, 3],
        filters: 64,
        activation: 'relu',
        name: "conv2"
    }));

    model.add(tf.layers.maxPooling2d({ poolSize: [2,2], padding: "same", name: "pool2" }));

    model.add(tf.layers.conv2d({
        kernelSize: [3,3],
        filters: 64,
        activation: 'relu',
        name: "conv3"
    }));

    model.add(tf.layers.maxPooling2d({ poolSize: [2,2], padding: "same", }));

    model.add(tf.layers.flatten());

    model.add(tf.layers.dense({
        units: 128,
        activation: 'relu'
    }));
    model.add(tf.layers.dense({
        units: 64,
        activation: 'relu'
    }));
     model.add(tf.layers.dense({
        units: 32,
        activation: 'relu'
    }));

    const NUM_OUTPUT_CLASSES = 10;
    model.add(tf.layers.dense({
        units: NUM_OUTPUT_CLASSES,
        activation: 'softmax'
    }));


    // Choose an optimizer, loss function and accuracy metric,
    // then compile and return the model
    const optimizer = tf.train.adam();
    model.compile({
        optimizer: optimizer,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    });

    model.summary();

    return model;
}

// Training model
async function train(model, data) {
    const { xs, ys } = data;
    const BATCH_SIZE = 64;
    return model.fit(xs, ys, {
        epochs: 10,
        shuffle: true,
        verbose: 1
    });
}
// Load model from disk
async function loadModel(folder) {
    // create handler to get model and weight file in to handler variable
    const handler = tfnode.io.fileSystem(
        `./public/models/${folder}/model.json`
    );
    // now we can use tf.loadLayerModel like when we using in browser
    const model = await tf.loadLayersModel(handler);
    return model;
}
// Predict sameple with tensor data : tensor4d [1,50,50,1]
async function predictData(model, data) {
    return model.predict(data).arraySync();
}

module.exports = {
    getModel,
    getModel2,
    train,
    loadModel,
    predictData
}