import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { channelApi } from '@/domains/channel/api/channel-api';
import type { Message } from '@/domains/message/model/message-history';

import { useChannelReadState } from './use-channel-read-state';

// ==================== FIXTURES ====================

const message = (id: string, minute: number): Message => ({
  id,
  channelId: 'channel',
  author: { id: 'author', firstName: 'John', lastName: 'Doe' },
  content: id,
  createdAt: `2026-10-25T12:${String(minute).padStart(2, '0')}:00.000Z`,
  updatedAt: `2026-10-25T12:${String(minute).padStart(2, '0')}:00.000Z`,
});

function setup(initial: { messages: Message[]; hasUnread: boolean }) {
  const markRead = vi
    .spyOn(channelApi, 'markRead')
    .mockResolvedValue({ lastReadMessageId: 'x', lastReadAt: '' });
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  const hook = renderHook(
    ({ messages, hasUnread }) =>
      useChannelReadState({
        workspaceId: 'workspace',
        channelId: 'channel',
        messages,
        isHistoryReady: true,
        hasUnread,
      }),
    { wrapper, initialProps: initial }
  );

  return { hook, markRead };
}

// ==================== TESTS ====================

describe('channel read state', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('marks the latest message read once when an unread channel is viewed', async () => {
    const messages = [message('m1', 1), message('m2', 2)];
    const { hook, markRead } = setup({ messages, hasUnread: true });

    await waitFor(() => expect(markRead).toHaveBeenCalledTimes(1));
    expect(markRead).toHaveBeenCalledWith('workspace', 'channel', 'm2');

    hook.rerender({ messages: [...messages], hasUnread: true });
    await waitFor(() => expect(markRead).toHaveBeenCalledTimes(1));
  });

  it('sends nothing when an already read channel is opened', async () => {
    const { markRead } = setup({
      messages: [message('m1', 1)],
      hasUnread: false,
    });

    await new Promise(resolve => setTimeout(resolve, 20));
    expect(markRead).not.toHaveBeenCalled();
  });

  it('waits until the reader scrolls back to the bottom', async () => {
    const messages = [message('m1', 1)];
    const { hook, markRead } = setup({ messages, hasUnread: false });

    act(() => hook.result.current.onBottomChange(false));
    hook.rerender({
      messages: [...messages, message('m2', 2)],
      hasUnread: false,
    });

    await new Promise(resolve => setTimeout(resolve, 20));
    expect(markRead).not.toHaveBeenCalled();

    act(() => hook.result.current.onBottomChange(true));
    await waitFor(() =>
      expect(markRead).toHaveBeenCalledWith('workspace', 'channel', 'm2')
    );
  });

  it('never sends anything for an empty channel', async () => {
    const { markRead } = setup({ messages: [], hasUnread: false });

    await new Promise(resolve => setTimeout(resolve, 20));
    expect(markRead).not.toHaveBeenCalled();
  });
});
