'use client';

import { useDebouncedValue } from '@mantine/hooks';
import { useState } from 'react';

import { useMessageSearchQuery } from '@/domains/message/model/message-search';

// ==================== CONSTANTS ====================

const SEARCH_DEBOUNCE_MS = 350;

// ==================== SEARCH STATE ====================

export function useChannelSearch(workspaceId: string, channelId: string) {
  const [input, setInput] = useState('');
  const [debouncedInput] = useDebouncedValue(input, SEARCH_DEBOUNCE_MS);
  const trimmedInput = input.trim();
  const trimmedDebouncedInput = debouncedInput.trim();
  const hasValidInput = trimmedInput.length >= 3 && trimmedInput.length <= 200;
  const isDebouncing = hasValidInput && trimmedInput !== trimmedDebouncedInput;
  const query = hasValidInput && !isDebouncing ? trimmedDebouncedInput : '';
  const results = useMessageSearchQuery(workspaceId, channelId, query);
  const items = results.data?.pages.flatMap(page => page.items) ?? [];

  return { input, setInput, query, results, items, isDebouncing };
}
