import { useSSE } from '../../src';

export const App = () => {
	const { data, isPending, isError } = useSSE({
		url: 'http://localhost:8888',
		transform: (data) => JSON.parse(data) as { random: string },
	});

	if (isPending) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error occurred while fetching data.</div>;
	}

	return (
		<div>
			<h1>React SSE</h1>
			<p>{data.random}</p>
		</div>
	);
};
