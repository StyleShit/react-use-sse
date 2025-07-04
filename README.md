# React SSE

React hook for real-time updates with SSE. Plug in, Stream on. ⚡️

## Installation

```bash
npm install react-use-sse
```

## Usage

This library provides a single hook, `useSSE`, which you can use to connect to a
[Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) endpoint.

The API is similar to [`useQuery`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery)
from [`@tanstack/react-query`](https://tanstack.com/query/latest/docs/framework/react/overview),
but it's designed specifically for SSE:

```tsx
import React from 'react';
import { useSSE } from 'react-use-sse';

function App() {
  const { data, isPending, isError } = useSSE({
    url: 'https://server.com/stream',
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
      <p>Updated value from server: {data}</p>
    </div>
  );
}
```

Each time the server sends an update, the hook will re-render your component with the new data.

You can also pass a `transform` function to modify the data before it is returned, since the data received from the server is a string:

```tsx
import React from 'react';
import { useSSE } from 'react-use-sse';

function App() {
  const { data, isPending, isError } = useSSE<{ valueFromServer: number }>({
    url: 'https://server.com/stream',
    transform: (data: string) => JSON.parse(data),
  });

  return (
    <div>
      <h1>React SSE</h1>
      <p>Updated value from server: {data.valueFromServer}</p>
    </div>
  );
}
```

The `data` type will either be inferred from the `transform` function or can be explicitly defined in the hook call (as shown above).

It also supports passing a [`withCredentials`](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/EventSource#withcredentials) option to the request:

```tsx
useSSE({
  url: 'https://server.com/stream',
  withCredentials: true,
});
```

## Development

To run the development client and server use:

```bash
npm run dev
```

This will start the client on `http://localhost:5173` and the server on `http://localhost:8888`.

There is no need to open the server URL in the browser, as the client will automatically connect to it (and because you'll be stuck in an infinite loop).
