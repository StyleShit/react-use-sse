import { useEffect, useState } from 'react';

type TReturn<TData> =
	| {
			status: 'pending';
			data: null;
			isPending: true;
			isSuccess: false;
			isError: false;
	  }
	| {
			status: 'success';
			data: TData;
			isPending: false;
			isSuccess: true;
			isError: false;
	  }
	| {
			status: 'error';
			data: null;
			isPending: false;
			isSuccess: false;
			isError: true;
	  };

type Status = 'pending' | 'success' | 'error';

export function useSSE<TData = unknown>(url: string): TReturn<TData> {
	const [data, setData] = useState<TData | null>(null);
	const [status, setStatus] = useState<Status>('pending');

	useEffect(() => {
		const eventSource = new EventSource(url);

		eventSource.addEventListener('message', (event) => {
			setData(event.data as TData);
			setStatus('success');
		});

		eventSource.addEventListener('error', () => {
			setData(null);
			setStatus('error');
		});

		return () => {
			eventSource.close();
		};
	}, [url]);

	return {
		data,
		status,
		isPending: status === 'pending',
		isSuccess: status === 'success',
		isError: status === 'error',
	} as TReturn<TData>;
}
