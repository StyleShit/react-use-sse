// React recommends using `await act(async actFn)`.
// See: https://react.dev/reference/react/act#await-act-async-actfn
//
/* eslint-disable @typescript-eslint/require-await */
import { useReducer } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { useSSE } from '../';
import { MockEventSource } from './mock-event-source';

// @ts-expect-error -- Mocking only what's needed.
globalThis.EventSource = MockEventSource as unknown as EventSource;

describe('useSSE', () => {
	afterEach(() => {
		MockEventSource.instance.reset();
	});

	it('should set EventSource options', () => {
		// Act.
		renderHook(() =>
			useSSE({
				url: 'http://test.com/sse',
				withCredentials: true,
			}),
		);

		// Assert.
		expect(MockEventSource.instance.getURL()).toBe('http://test.com/sse');

		expect(MockEventSource.instance.getOptions()).toStrictEqual({
			withCredentials: true,
		});
	});

	it('should rerender for every change', async () => {
		// Arrange.
		const { result, unmount } = renderHook(() =>
			useSSE({ url: 'http://test.com/sse' }),
		);

		// Act - Open the connection.
		await act(async () => {
			MockEventSource.instance.open();
		});

		// Assert.
		expect(result.current).toStrictEqual({
			data: null,
			status: 'pending',
			isPending: true,
			isSuccess: false,
			isError: false,
		});

		// Act - Emit a message from server.
		await act(async () => {
			MockEventSource.instance.emit('message', 'test-data');
		});

		// Assert.
		expect(result.current).toStrictEqual({
			data: 'test-data',
			status: 'success',
			isPending: false,
			isSuccess: true,
			isError: false,
		});

		// Act - Emit another message from server.
		await act(async () => {
			MockEventSource.instance.emit('message', 'test-data-2');
		});

		// Assert.
		expect(result.current).toStrictEqual({
			data: 'test-data-2',
			status: 'success',
			isPending: false,
			isSuccess: true,
			isError: false,
		});

		// Act - Unmount.
		unmount();

		// Assert - The connection should be closed.
		expect(MockEventSource.instance.getStatus()).toBe('closed');
	});

	it('should support a transformation function', async () => {
		// Arrange.
		const { result } = renderHook(() =>
			useSSE({
				url: 'http://test.com/sse',
				transform: async (data: string) =>
					JSON.parse(data) as { message: string },
			}),
		);

		// Act - Open the connection.
		await act(async () => {
			MockEventSource.instance.open();
		});

		// Act - Emit a message from server.
		await act(async () => {
			const data = JSON.stringify({ message: 'test-data' });

			MockEventSource.instance.emit('message', data);
		});

		// Assert.
		expect(result.current).toStrictEqual({
			data: { message: 'test-data' },
			status: 'success',
			isPending: false,
			isSuccess: true,
			isError: false,
		});
	});

	it('should support custom events', async () => {
		// Arrange.
		const { result } = renderHook(() =>
			useSSE({
				url: 'http://test.com/sse',
				event: 'custom-event',
			}),
		);

		// Act - Open the connection.
		await act(async () => {
			MockEventSource.instance.open();
		});

		// Act - Emit a generic message from server.
		await act(async () => {
			MockEventSource.instance.emit('message', 'test-data');
		});

		// Assert.
		expect(result.current).toStrictEqual({
			data: null,
			status: 'pending',
			isPending: true,
			isSuccess: false,
			isError: false,
		});

		// Act - Emit a custom message from server.
		await act(async () => {
			MockEventSource.instance.emit('custom-event', 'test-custom-data');
		});

		// Assert.
		expect(result.current).toStrictEqual({
			data: 'test-custom-data',
			status: 'success',
			isPending: false,
			isSuccess: true,
			isError: false,
		});
	});

	it('should support dynamic transform callback', async () => {
		// Arrange.
		const { result } = renderHook(() => {
			const [count, increment] = useReducer((x) => x + 1, 0);

			const transform = (data: string) => {
				const parsed = JSON.parse(data) as { random: string };

				return {
					...parsed,
					count,
				};
			};

			const sse = useSSE({
				url: 'http://test.com/sse',
				transform,
			});

			return {
				sse,
				count,
				increment,
			};
		});

		// Act - Open the connection.
		await act(async () => {
			MockEventSource.instance.open();
		});

		const closeSpy = vi.spyOn(MockEventSource.instance, 'close');

		// Act - Emit a message from server.
		await act(async () => {
			const data = JSON.stringify({ message: 'test-data' });

			MockEventSource.instance.emit('message', data);
		});

		// Assert.
		expect(result.current.sse).toStrictEqual({
			data: {
				message: 'test-data',
				count: 0,
			},
			status: 'success',
			isPending: false,
			isSuccess: true,
			isError: false,
		});

		// Act - Increment & emit another message from server.
		await act(async () => {
			result.current.increment();
		});

		await act(async () => {
			const data = JSON.stringify({ message: 'test-data-2' });

			MockEventSource.instance.emit('message', data);
		});

		// Assert.
		expect(result.current.count).toBe(1);

		expect(result.current.sse).toStrictEqual({
			data: {
				message: 'test-data-2',
				count: 1,
			},
			status: 'success',
			isPending: false,
			isSuccess: true,
			isError: false,
		});

		// Ensure we don't close the connection for each `transform` change.
		expect(closeSpy).not.toHaveBeenCalled();
	});

	it('should handle server error', async () => {
		// Arrange.
		const { result } = renderHook(() =>
			useSSE({ url: 'http://test.com/sse' }),
		);

		// Act - Open the connection.
		await act(async () => {
			MockEventSource.instance.open();
		});

		// Act - Emit an error from server.
		await act(async () => {
			MockEventSource.instance.emit('error');
		});

		// Assert.
		expect(result.current).toStrictEqual({
			data: null,
			status: 'error',
			isPending: false,
			isSuccess: false,
			isError: true,
		});
	});

	it('should handle transformation error', async () => {
		// Arrange.
		const { result } = renderHook(() =>
			useSSE({
				url: 'http://test.com/sse',
				transform: async () => {
					throw new Error('Transformation error');
				},
			}),
		);

		// Act - Open the connection.
		await act(async () => {
			MockEventSource.instance.open();
		});

		// Act - Emit a message from server.
		await act(async () => {
			MockEventSource.instance.emit('message', 'test-data');
		});

		// Assert.
		expect(result.current).toStrictEqual({
			data: null,
			status: 'error',
			isPending: false,
			isSuccess: false,
			isError: true,
		});
	});
});
