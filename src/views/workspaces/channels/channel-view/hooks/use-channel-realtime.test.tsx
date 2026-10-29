import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import { describe, expect, it, vi } from 'vitest';

import { SocketContext } from '@/shared/realtime/socket-context';

import { useChannelRealtime } from './use-channel-realtime';

type Listener = (...args: never[]) => void;

function createSocket() {
  const listeners = new Map<string, Set<Listener>>();
  const acknowledgements: Array<(ack: unknown) => void> = [];
  const emit = vi.fn((event: string, ...args: unknown[]) => {
    if (event === 'channel:join') {
      acknowledgements.push(args[1] as (ack: unknown) => void);
    }
  });
  const socket = {
    connected: true,
    id: 'socket-1',
    emit,
    on(event: string, listener: Listener) {
      const handlers = listeners.get(event) ?? new Set<Listener>();
      handlers.add(listener);
      listeners.set(event, handlers);
    },
    off(event: string, listener: Listener) {
      listeners.get(event)?.delete(listener);
    },
  } as unknown as Socket;

  return {
    socket,
    emit,
    acknowledgements,
    dispatch(event: string) {
      listeners.get(event)?.forEach(listener => listener());
    },
  };
}

describe('channel room lifecycle', () => {
  it('keeps the replacement mount in the room when the old join ACK arrives late', () => {
    const connection = createSocket();
    const client = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>
        <SocketContext.Provider value={connection.socket}>
          {children}
        </SocketContext.Provider>
      </QueryClientProvider>
    );

    const first = renderHook(() => useChannelRealtime('workspace', 'channel'), {
      wrapper,
    });
    expect(connection.acknowledgements).toHaveLength(1);

    first.unmount();
    const second = renderHook(
      () => useChannelRealtime('workspace', 'channel'),
      {
        wrapper,
      }
    );
    expect(connection.acknowledgements).toHaveLength(2);

    const success = {
      success: true,
      data: { workspaceId: 'workspace', channelId: 'channel' },
      messageType: null,
      errors: null,
    };

    act(() => {
      connection.acknowledgements[1](success);
      connection.acknowledgements[0](success);
    });

    expect(
      connection.emit.mock.calls.filter(call => call[0] === 'channel:leave')
    ).toHaveLength(1);

    act(() => {
      connection.socket.connected = false;
      connection.dispatch('disconnect');
      connection.socket.connected = true;
      connection.socket.id = 'socket-2';
      connection.dispatch('connect');
    });

    expect(connection.acknowledgements).toHaveLength(3);
    second.unmount();
  });
});
