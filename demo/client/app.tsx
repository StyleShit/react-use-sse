import { useReducer } from 'react';
import { useSSE } from '../../src';

export const App = () => {
	const [count, increment] = useReducer((x) => x + 1, 0);

	const transform = (data: string) => {
		const parsed = JSON.parse(data) as { random: string };

		return {
			...parsed,
			count,
		};
	};

	const genericEvent = useSSE({
		url: 'http://localhost:8888',
		transform,
	});

	const customEvent = useSSE({
		url: 'http://localhost:8888?event=custom-event',
		event: 'custom-event',
		transform,
	});

	if (genericEvent.isPending || customEvent.isPending) {
		return <div>Loading...</div>;
	}

	if (genericEvent.isError || customEvent.isError) {
		return <div>Error occurred while fetching data.</div>;
	}

	return (
		<div>
			<h1>React SSE</h1>
			<p>GenericEvent: {genericEvent.data.random}</p>
			<p>CustomEvent: {customEvent.data.random}</p>

			<p>Count from transform: {customEvent.data.count}</p>
			<button type="button" onClick={increment}>
				Increment ({count})
			</button>
		</div>
	);
};
