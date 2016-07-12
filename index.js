'use strict';
const AWS = require('aws-sdk');
const config = require('config');
const Consumer = require('sqs-consumer');
const info = require('debug')('info');
const error = require('debug')('error');
const consumers = require('./lib/consumers');
const schedules = require('./lib/schedules');

AWS.config.update(config.aws);

const lambda = new AWS.Lambda({
	region: config.aws.region
});

const index = {
	initializeLambda: () => {
		info('initializing consumers');
		return Promise.all(
			config.consumers
			.map(consumer => lambda.getFunction({FunctionName: consumer.functionName }).promise())
		)
		.then(() => {
			info('lambda functions OK!');
		})
		.then(consumers.load)
		.then(consumers.start)
		.catch(err => {
			error(err);
		});
	},
	initializeSchedules: () => {
		info('initializing schedules');
		schedules.start();
	}
};

index.initializeLambda();
index.initializeSchedules();


// lambda.getFunction({FunctionName: 'updateTransactions'}).promise().then(x =>  console.log('xxx')).catch(console.log);
