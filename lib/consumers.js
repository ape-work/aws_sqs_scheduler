'use strict';
const AWS = require('aws-sdk');
const moment = require('moment');
const Consumer = require('sqs-consumer');
const info = require('debug')('info');
const error = require('debug')('info');

let events = {};

const consumers = {
	start: (id) => {
		if (id) {
			return events[id].start();
		}

		Object.keys(events).forEach(key => events[key].start());
		info('all consumers started');
	},

	stop: (id) => {
		if (id) {
			return events[id].stop();
		}

		Object.keys(events).forEach(key => events[key].stop());
		info('all consumers stopped');
	},

	_handleError: (err) => {
		error(err);
	},

	load: (opt) => {
		const lambda = new AWS.Lambda({
			region: opt.aws.region
		});

		if (!opt.consumers.length) {
			throw new Error('No consumers configured');
		}

		opt.consumers.forEach(consumer => {
			events[consumer.id] = Consumer.create({
				queueUrl: consumer.queueUrl,
				region: consumer.region,
				batchSize: consumer.batchSize,
				handleMessage: (message, done) => {
					info(`lambda ${consumer.functionName} invoked!`);
					lambda.invoke({
						FunctionName: consumer.functionName,
						InvocationType: consumer.InvocationType || 'Event',
						Payload: JSON.stringify(message)
					})
					.promise()
					.then(res => {
						if (opt.cb) {
							process.nextTick(() => {
								opt.cb({
									id: consumer.id,
									FunctionName: consumer.functionName,
									InvocationType: consumer.InvocationType || 'Event',
									Payload: JSON.stringify(message)
								});
							});
						}
						info(res);
						info(`succeed to execute lambda ${consumer.functionName} at ${moment().format()}`);
						done();
					})
					.catch(err => {
						info(`fail to execute lambda ${consumer.functionName} at ${moment().format()}`);
						error(err);
					});
				}
			});

			info('consumers loaded');
			events[consumer.id].on('error', consumers._handleError);
		});
	}
};

module.exports = consumers;
