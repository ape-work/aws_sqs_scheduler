'use strict';
const AWS = require('aws-sdk');
const moment = require('moment');
const config = require('config');
const Schedule = require('node-schedule');
const info = require('debug')('info');
const error = require('debug')('info');


AWS.config.update(config.aws);
const lambda = new AWS.Lambda({
	region: config.aws.region
});

let scheduled = {};

const schedules = {
	stop: (id) => {
		if (id) {
			return scheduled[id].stop();
		}

		Object.keys(scheduled).forEach(key => scheduled[key].stop());
		info('all schedules stopped');
	},

	start: () => {
		config.schedules.forEach(schedule => {
			scheduled[schedule.id] = Schedule.scheduleJob(schedule.cron, () => {
				lambda.invoke({
					FunctionName: schedule.functionName,
					InvocationType: schedule.InvocationType || 'Event',
					Payload: JSON.stringify(schedule.Payload)
				})
				.promise()
				.then(res => {
					info(res);
					info(`succeed to execute lambda ${schedule.functionName} at ${moment().format()}`);
				})
				.catch(err => {
					info(`fail to execute lambda ${schedule.functionName} at ${moment().format()}`);
					error(err);
				});
			});

			info(`lambda function: ${schedule.id} scheduled with cron: ${schedule.cron}`);
		});
	}
};

module.exports = schedules;
