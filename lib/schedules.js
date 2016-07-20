'use strict';
const AWS = require('aws-sdk');
const moment = require('moment');
const Schedule = require('node-schedule');
const info = require('debug')('info');
const error = require('debug')('info');

let scheduled = {};

const schedules = {
	stop: (id) => {
		if (id) {
			return scheduled[id].stop();
		}

		Object.keys(scheduled).forEach(key => scheduled[key].stop());
		info('all schedules stopped');
	},

	start: (opt) => {
		const lambda = new AWS.Lambda({
			region: opt.aws.region
		});

		if(!opt.schedules || !opt.schedules.length) {
			return error('No schedules to execute');
		}
		opt.schedules.forEach(schedule => {
			scheduled[schedule.id] = Schedule.scheduleJob(schedule.cron, () => {
				info(`invoke lambda!`);
				lambda.invoke({
					FunctionName: schedule.functionName,
					InvocationType: schedule.InvocationType || 'Event',
					Payload: JSON.stringify(schedule.Payload)
				})
				.promise()
				.then(res => {
					info(res);
					if (opt.cb) {
						opt.cb({
							FunctionName: schedule.functionName,
							InvocationType: schedule.InvocationType || 'Event',
							Payload: JSON.stringify(schedule.Payload)
						});
					}
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
