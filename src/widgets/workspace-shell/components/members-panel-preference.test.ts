import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useMembersPanelPreference } from './members-panel-preference';

// ==================== CONSTANTS ====================

const STORAGE_KEY = 'nodus:ui:members-panel';

// ==================== TESTS ====================

describe('useMembersPanelPreference', () => {
  it('keeps the panel open until the user closes it', () => {
    const { result } = renderHook(() => useMembersPanelPreference('first'));

    expect(result.current.open).toBe(true);

    act(() => {
      result.current.setOpen(false);
    });

    expect(result.current.open).toBe(false);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toEqual({
      state: { openByUser: { first: false } },
      version: 1,
    });
  });

  it('stores the preference separately for each user', () => {
    const first = renderHook(() => useMembersPanelPreference('FIRST'));
    const second = renderHook(() => useMembersPanelPreference('second'));

    expect(first.result.current.open).toBe(false);
    expect(second.result.current.open).toBe(true);

    act(() => {
      first.result.current.setOpen(true);
    });

    expect(first.result.current.open).toBe(true);
    expect(second.result.current.open).toBe(true);
  });
});
