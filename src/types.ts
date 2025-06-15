export type SSEData<TData> =
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

export type SSEStatus = 'pending' | 'success' | 'error';
