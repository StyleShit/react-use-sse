import { useEffect, useState } from 'react';
import type { SSEData, SSEStatus } from './types';

export type UseSSEArgs<TData> = {
	url: string;
	withCredentials?: boolean;
	parseFn?: (data: string) => TData | Promise<TData>;
};

export function useSSE<TData = unknown>({
	url,
	withCredentials,
	parseFn,
}: UseSSEArgs<TData>): SSEData<TData> {
	const [data, setData] = useState<TData | null>(null);
	const [status, setStatus] = useState<SSEStatus>('pending');

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
	} as SSEData<TData>;
}
