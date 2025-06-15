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

type Args<TData> = {
	url: string;
	withCredentials?: boolean;
	parseFn?: (data: string) => TData | Promise<TData>;
};

export function useSSE<TData = unknown>({
	url,
	withCredentials,
	parseFn,
}: Args<TData>): TReturn<TData> {
	const [data, setData] = useState<TData | null>(null);
	const [status, setStatus] = useState<Status>('pending');

	useEffect(() => {
		const eventSource = new EventSource(url, { withCredentials });

		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		eventSource.addEventListener('message', async (event) => {
			if (!parseFn) {
				setStatus('success');
				setData(event.data as TData);

				return;
			}

			try {
				const value = await parseFn(event.data as string);

				setStatus('success');
				setData(value);
			} catch {
				setStatus('error');
				setData(null);
			}
		});

		eventSource.addEventListener('error', () => {
			setData(null);
			setStatus('error');
		});

		return () => {
			eventSource.close();
		};
	}, [url, withCredentials, parseFn]);

	return {
		data,
		status,
		isPending: status === 'pending',
		isSuccess: status === 'success',
		isError: status === 'error',
	} as TReturn<TData>;
}
