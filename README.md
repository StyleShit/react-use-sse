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

### Transforming the Data

You can also pass a `transform` function to modify the data before it is returned, since the data received from the server is a string:

```tsx
import React from 'react';
import { useSSE } from 'react-use-sse';

function App() {
  const { data } = useSSE<{ valueFromServer: number }>({
    url: 'https://server.com/stream',
    transform: (rawData: string) => JSON.parse(rawData),
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

### Custom Events

SSE supports [custom events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#listening_for_custom_events).
To use them, you can pass the custom event name using the `event` option:

```tsx
import React from 'react';
import { useSSE } from 'react-use-sse';

function App() {
  const { data } = useSSE({
    url: 'https://server.com/stream',
    event: 'custom-event',
  });

  return (
    <div>
      <h1>React SSE</h1>
      <p>Updated value from server: {data}</p>
    </div>
  );
}
```

### Attaching Credentials

You can also [attach the user's credentials](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/EventSource#withcredentials) by passing a `withCredentials` option to the hook call:

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
