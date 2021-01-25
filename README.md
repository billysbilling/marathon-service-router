# marathon-service-router

A Marathon app that can be run by Marathon and route to other Marathon apps using HAProxy.

**This is still alpha software.**

TODO:

- What happens if HAProxy dies? Does the container die, or should the health check guard against that?
- Add examples folder with an API gateway example
- Finish readme

## Environment variables

Name | Required | Default | Description
---- | -------- | ------- | -----------
`SERVICE_NAME` | `false` | `marathon-service-router` | Service name for logging
`LOG_LEVEL` | `false` | `'INFO'` | Level at which log records will not be suppressed
`MARATHON_HOST` | `false` | `'http://master.mesos:8080'` | Marathon URL
`HAPROXY_TEMPLATE_PATH` | `false` | `'../templates/haproxy.cfg.hbs'` | Path to HAProxy configuration template
`HAPROXY_CONFIG_PATH` | `false` | `'./haproxy.cfg'` | Path to HAProxy configuration
`NO_HAPROXY_RELOAD` | `false` | | Supress reloading HAProxy on changes

## Local development
A running marathon cluster is required. Since this service only reads from the Marathon API it's safe to run against a real cluster.

Copy env.example to .env for increased logging and to connect to the staging Marathon cluster:
```cp env.example .env```

Start the service using docker-compose:
```docker-compose up --build```

To run test, uncomment the `command`-line in docker-compose.yml and start the service as started above.


## Alternatives (service-router.py, marathon-haproxy-bridge)

- Built-in HAProxy. Ready to run as a Marathon app.
- Own template. Use HAProxy language, and not a limited custom DSL.


## Using the standard template


## Using your own template

Create your own repo.

Copy `templates/haproxy.cfg.hbs` into the root of your repo. Adjust it as you wish.

Add a `Dockerfile` that inherits from the `sebastianseilund/marathon-service-router` image and adds your own template to the image:

```Dockerfile
FROM sebastianseilund/marathon-service-router:latest

COPY haproxy.cfg.hbs /haproxy.cfg.hbs
```



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

## Improvements

- Handle events more intelligently. Instead of reloading the complete state, we should be able to add/remove apps and tasks from our state. This will especially be important in larger clusters with many tasks where the Marathon API maybe is slower?
