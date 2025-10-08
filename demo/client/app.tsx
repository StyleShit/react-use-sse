import { useSSE } from '../../src';

export const App = () => {
	const genericEvent = useSSE({
		url: 'http://localhost:8888',
		transform: (data) => JSON.parse(data) as { random: number },
	});

	const customEvent = useSSE({
		url: 'http://localhost:8888?event=custom-event',
		event: 'custom-event',
		transform: (data) => JSON.parse(data) as { random: number },
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
		</div>
	);
};
