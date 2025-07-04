import http from 'node:http';

const server = http.createServer((req, res) => {
	res.writeHead(200, {
		'Access-Control-Allow-Origin': '*',
		'Content-Type': 'text/event-stream',
	});

	setInterval(() => {
		const data = {
			random: Math.random() * 100000,
		};

		res.write(`data: ${JSON.stringify(data)}\n\n`);
	}, 1000);
});

server.listen(8888);

// eslint-disable-next-line no-console
console.log('Server is running on http://localhost:8888');
