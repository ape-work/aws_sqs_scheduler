# AWS - SQS Scheduler

A tiny helper to manage scheduled lambda function and sqs + lambda using BBC`s [sqs-consumer](http://mrdoob.com/projects/code-editor/).


## Usage

#### `sqs_scheculer.init(opt)`

Launch the scheduler and sqs queue consumers.
- **opt** (Object) options.

- **opt.aws** (Object) aws region, accessKeyId and secretAccessKey.
- **opt.consumers[]** (Array) List of consumers.
	- **id** (String) internal identifier to be used in logs
	- **queueUrl** (String) sqs url
	- **batchSize** (Number) size batch max = 10
	- **functionName** (String) aws lambda function name
- **opt.schedules[]** (Array) List of event`s schedules.
	- **id** (String) internal idetifier to be used in logs
	- **cron** (String) cron, ex: */2 * * * 1-5,
	- **functionName** (String) event name,
	- **Payload** (String) lambda event payload
- **opt.cb** (Function) function thats is called in every aws lambda invoke, with {FunctionName, InvocationType, Payload}


example:

```javascript
var sqs_scheculer = require('./aws_sqs_scheduler');

sqs_scheculer.init({
	aws: {
		region: 'us-east-1',
		accessKeyId: '12312312313123',
		secretAccessKey: '312321312321312321312313131'
	},
	consumers: [{
		id: 'update_transactions',
		queueUrl: 'https://sqs.us-east-1.amazonaws.com/111111/transactions',
		batchSize: '1',
		functionName: 'update-transaction'
	}],
	schedules: [{
		id: 'list_user',
		cron: '*/2 * * * 1-5',
		functionName: 'queue_users',
		Payload: ''
	}],
	cb: (event) => {
		// event.FunctionName
		// event.InvocationType
		// event.Payload
		console.log(event);
	}
});
```

##Debug mode
````
DEBUG=info,error node index
```

------
Very useful [cron helper ](http://crontab.guru/)
