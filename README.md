# marathon-service-router

A Marathon app that can be run by Marathon and route to other Marathon apps using HAProxy.


## Differences from Marathon's service-router.py

Own template


## Usage



## Marathon state object

Example:

```json
{
    "services": [
        {
			"id": "my-app-50501",
            "appId": "my-app",
			"env": {
				"MY_VAR": "example",
				"MY_OTHER_VAR": "test"
			},
			"servicePort": 50501,
			"tasks": [
				{
					"id": "marathon-task-id-1",
					"host": "192.168.33.10",
					"port": 31001
				},
				{
					"id": "marathon-task-id-2",
					"host": "192.168.33.11",
					"port": 31002
				}
			]
		}
    ]
}
```
