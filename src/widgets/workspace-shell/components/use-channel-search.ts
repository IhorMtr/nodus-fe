'use client';

import { useState, type FormEvent } from 'react';

import { useMessageSearchQuery } from '@/domains/message/model/message-search';

// ==================== SEARCH STATE ====================

export function useChannelSearch(workspaceId: string, channelId: string) {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const results = useMessageSearchQuery(workspaceId, channelId, query);
  const items = results.data?.pages.flatMap(page => page.items) ?? [];
  const valid = input.trim().length >= 3 && input.trim().length <= 200;

  // ==================== HANDLERS ====================

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (valid) {
      setQuery(input.trim());
    }
  }

  return { input, setInput, query, results, items, valid, submit };
}
