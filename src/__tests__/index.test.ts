// React recommends using `await act(async actFn)`.
// See: https://react.dev/reference/react/act#await-act-async-actfn
//
/* eslint-disable @typescript-eslint/require-await */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSSE } from '../';
import { MockEventSource } from './mock-event-source';

// @ts-expect-error -- Mocking only what's needed.
globalThis.EventSource = MockEventSource as unknown as EventSource;

describe('useSSE', () => {
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

	it('should support parsing function', async () => {
		// Arrange.
		const { result } = renderHook(() =>
			useSSE({
				url: 'http://test.com/sse',
				parseFn: async (data: string) =>
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

		// // Assert.
		expect(result.current).toStrictEqual({
			data: { message: 'test-data' },
			status: 'success',
			isPending: false,
			isSuccess: true,
			isError: false,
		});
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

		// // Assert.
		expect(result.current).toStrictEqual({
			data: null,
			status: 'error',
			isPending: false,
			isSuccess: false,
			isError: true,
		});
	});

	it('should handle parsing error', async () => {
		// Arrange.
		const { result } = renderHook(() =>
			useSSE({
				url: 'http://test.com/sse',
				parseFn: async () => {
					throw new Error('Parsing error');
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

		// // Assert.
		expect(result.current).toStrictEqual({
			data: null,
			status: 'error',
			isPending: false,
			isSuccess: false,
			isError: true,
		});
	});
});
