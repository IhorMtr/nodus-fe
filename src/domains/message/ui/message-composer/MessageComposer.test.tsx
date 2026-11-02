import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MessageComposer } from './MessageComposer';

// ==================== TEST DOUBLES ====================

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// ==================== KEYBOARD BEHAVIOR ====================

describe('MessageComposer', () => {
  it('sends with Enter but keeps Shift+Enter and IME confirmation in the draft', async () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: new EventTarget(),
    });

    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <MantineProvider>
        <MessageComposer onSubmit={onSubmit} isSubmitting={false} />
      </MantineProvider>
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('Hello'));
  });
});
