# marathon-service-router

A Marathon app that can be run by Marathon and route to other Marathon apps using HAProxy.

TODO:

- Should handle Marathon failures
- Hbs partials
- Readme:
    - Official image
    - Own image
    - Official image with mounted template
- Does Marathon use paging?
- Add tests of marathon-monitor
- Add examples folder with an API gateway example
- Finish readme


## Alternatives (service-router.py, marathon-haproxy-bridge)

Own template. Use HAProxy language, and not a limited custom DSL.


## Usage of the standard template


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
