import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { messageApi } from '@/domains/message/api/message-api';

import { useChannelSearch } from './use-channel-search';

// ==================== TEST HARNESS ====================

function SearchHarness({ channelId }: { channelId: string }) {
  const search = useChannelSearch('workspace', channelId);

  return (
    <div>
      <input
        aria-label="Search"
        value={search.input}
        onChange={event => search.setInput(event.currentTarget.value)}
      />
      <output>{search.query}</output>
      <button
        type="button"
        disabled={!search.results.hasNextPage}
        onClick={() => void search.results.fetchNextPage()}
      >
        More
      </button>
    </div>
  );
}

// ==================== SEARCH BEHAVIOR ====================

describe('channel search', () => {
  it('searches the trimmed query after a pause and paginates with its cursor', async () => {
    const request = vi.spyOn(messageApi, 'search');
    request
      .mockResolvedValueOnce({ items: [], nextCursor: 'older' })
      .mockResolvedValueOnce({ items: [], nextCursor: null });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={client}>
        <SearchHarness channelId="channel-one" />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: '  ab  ' },
    });
    await new Promise(resolve => setTimeout(resolve, 400));
    expect(request).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: '  hel  ' },
    });
    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: '  hello  ' },
    });
    expect(request).not.toHaveBeenCalled();

    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request).toHaveBeenNthCalledWith(
      1,
      'workspace',
      { q: 'hello', channelId: 'channel-one', cursor: undefined },
      expect.any(AbortSignal)
    );

    await waitFor(() => expect(screen.getByText('More')).toBeEnabled());
    fireEvent.click(screen.getByText('More'));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    expect(request).toHaveBeenNthCalledWith(
      2,
      'workspace',
      { q: 'hello', channelId: 'channel-one', cursor: 'older' },
      expect.any(AbortSignal)
    );
  });

  it('clears the search and cancels the old request when the channel panel remounts', async () => {
    const request = vi
      .spyOn(messageApi, 'search')
      .mockImplementation(() => new Promise(() => {}));
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const view = render(
      <QueryClientProvider client={client}>
        <SearchHarness key="first" channelId="first" />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'hello' },
    });
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    const signal = request.mock.calls[0][2];

    view.rerender(
      <QueryClientProvider client={client}>
        <SearchHarness key="second" channelId="second" />
      </QueryClientProvider>
    );

    expect(screen.getByLabelText('Search')).toHaveValue('');
    expect(signal?.aborted).toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
  });
});
