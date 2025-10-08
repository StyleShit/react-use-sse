import { useEffect, useRef, useState } from 'react';
import type { SSEData, SSEStatus } from './types';

export type UseSSEArgs<TData> = {
	url: string;
	event?: string;
	withCredentials?: boolean;
	transform?: (data: string) => TData | Promise<TData>;
};

export function useSSE<TData = unknown>({
	url,
	event = 'message',
	withCredentials,
	transform,
}: UseSSEArgs<TData>): SSEData<TData> {
	const [data, setData] = useState<TData | null>(null);
	const [status, setStatus] = useState<SSEStatus>('pending');

	// Keep reference to the latest `transform` value.
	// See: https://tkdodo.eu/blog/refs-events-and-escape-hatches#the-latest-ref
	const transformRef = useRef(transform);
	transformRef.current = transform;

	useEffect(() => {
		const eventSource = new EventSource(url, { withCredentials });

		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		eventSource.addEventListener(event, async (e) => {
			if (!transformRef.current) {
				setStatus('success');
				setData(e.data as TData);

				return;
			}

			try {
				const value = await transformRef.current(e.data as string);

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
	}, [url, event, withCredentials]);

	return {
		data,
		status,
		isPending: status === 'pending',
		isSuccess: status === 'success',
		isError: status === 'error',
	} as SSEData<TData>;
}
