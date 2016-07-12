# AWS - SQS Schedule

A tiny helper to manage scheduled lambda function and sqs + lambda using BBC`s [sqs-consumer](http://mrdoob.com/projects/code-editor/).


## Usage

1. Edit `config/default` or create a `config/production`

```json
{
	"aws": {
		"region":"<aws region>",
		"accessKeyId": "<accessKeyId>",
		"secretAccessKey": "<secretAccessKey>"
	},
	"consumers": [{
		"id": "<internal idetifier to be used in logs>",
		"queueUrl": ":<sqs url>",
		"batchSize": ":<size batch max = 10>",
		"functionName": ":<aws lambda function name>"
	}],
	"schedules": [{
		"id": "<internal idetifier to be used in logs>",
		"cron": ":<crom time>",
		"functionName": ":<aws lambda function name>"
	}]
}
```
Very useful [cron helper ](http://crontab.guru/)

2.Run
```
npm start
```
