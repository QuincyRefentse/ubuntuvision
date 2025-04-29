const util = require('util');
const fs = require('fs');
const TrainingApi = require("@azure/cognitiveservices-customvision-training");
const PredictionApi = require("@azure/cognitiveservices-customvision-prediction");
const msRest = require("@azure/ms-rest-js");

const publishIterationName = "detectModel";
const setTimeoutPromise = util.promisify(setTimeout);

// retrieve environment variables
const trainingKey = process.env["4SFFXiMYtEJQlaUUNOq4aZfwfwWZtyOlQUiGK0EjhQSV9NFiZwUkJQQJ99BDACYeBjFXJ3w3AAAIACOGz9Cm"];
const trainingEndpoint = process.env["https://customvisionforcrimedetection.cognitiveservices.azure.com/"];

const predictionKey = process.env["VISION_PREDICTION_KEY"];
const predictionResourceId = process.env["VISION_PREDICTION_RESOURCE_ID"];
const predictionEndpoint = process.env["VISION_PREDICTION_ENDPOINT"];