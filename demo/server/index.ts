import http from 'node:http';

const server = http.createServer((req, res) => {
	res.writeHead(200, {
		'Access-Control-Allow-Origin': '*',
		'Content-Type': 'text/event-stream',
	});

	if (!req.url) {
		res.writeHead(400);
		res.end('Bad Request');

		return;
	}

	const queryParams = new URLSearchParams(req.url.split('?')[1]);
	const event = queryParams.get('event');

	setInterval(() => {
		const data = {
			random: Math.random() * 100000,
		};

		if (event) {
			res.write(`event: ${event}\n`);
		}

		res.write(`data: ${JSON.stringify(data)}\n\n`);
	}, 1000);
});

server.listen(8888);

// eslint-disable-next-line no-console
console.log('Server is running on http://localhost:8888');
