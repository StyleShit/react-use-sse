type Options = {
	withCredentials?: boolean;
};

export class MockEventSource {
	public static instance: MockEventSource;

	private status: 'connecting' | 'open' | 'closed' = 'connecting';

	private listeners: Record<string, ((event: MessageEvent) => void)[]> = {};

	private url: string;

	private options: Options = {};

	constructor(url: string, options?: Options) {
		this.url = url;
		this.options = options || {};

		// Make it available for testing.
		MockEventSource.instance = this;
	}

	addEventListener(
		event: string,
		callback: (event: MessageEvent) => void,
	): void {
		if (!this.listeners[event]) {
			this.listeners[event] = [];
		}

		this.listeners[event].push(callback);
	}

	emit(event: string, data: unknown = null): void {
		this.listeners[event]?.forEach((callback) => {
			callback(new MessageEvent(event, { data }));
		});
	}

	open(): void {
		this.status = 'open';

		this.emit('open', new MessageEvent('open'));
	}

	close(): void {
		this.status = 'closed';

		this.listeners = {};
	}

	getStatus() {
		return this.status;
	}

	getURL() {
		return this.url;
	}

	getOptions() {
		return this.options;
	}

	reset() {
		this.close();

		MockEventSource.instance = undefined as unknown as MockEventSource;
	}
}
