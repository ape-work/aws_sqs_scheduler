'use strict';
const AWS = require('aws-sdk');
const Consumer = require('sqs-consumer');
const info = require('debug')('info');
const error = require('debug')('error');
const consumers = require('./lib/consumers');
const schedules = require('./lib/schedules');

const index = {
	initializeLambda: (opt) => {
		info('initializing consumers');

		const lambda = new AWS.Lambda({
			region: opt.aws.region
		});

		if (!opt.consumers || !opt.consumers.length) {
			return error('No consumers to load');
		}

		return Promise.all(
			opt.consumers
			.map(consumer => lambda.getFunction({FunctionName: consumer.functionName }).promise())
		)
		.then(() => {
			info('lambda functions OK!');
		})
		.then(() => consumers.load(opt))
		.then(() => consumers.start())
		.catch(err => {
			error(err);
		});
	},
	initializeSchedules: (opt) => {
		info('initializing schedules');
		schedules.start(opt);
	}
};

module.exports = {
	init: (opt) => {
		AWS.config.update(opt.aws);
		index.initializeLambda(opt);
		index.initializeSchedules(opt);
	}
};
