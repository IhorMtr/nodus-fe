import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PersonalSettingsModal } from './PersonalSettingsModal';

// ==================== TEST DOUBLES ====================

const route = vi.hoisted(() => ({
  pathname: '/uk/workspaces/workspace/personal-settings',
}));

vi.mock('@mantine/core', () => ({
  Modal: ({ children }: { children: ReactNode }) => (
    <div role="dialog" aria-modal="true">
      {children}
    </div>
  ),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'uk',
  useTranslations: () => (key: string) => key,
}));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));
vi.mock('@/shared/i18n/navigation', () => ({
  useRouter: () => ({ back: vi.fn() }),
}));
vi.mock('./PersonalSettingsView', () => ({
  PersonalSettingsView: () => <button type="button">Inside</button>,
}));

// ==================== FOCUS RESTORATION ====================

describe('PersonalSettingsModal focus restoration', () => {
  afterEach(() => {
    route.pathname = '/uk/workspaces/workspace/personal-settings';
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('hides the retained slot when navigating away from settings', () => {
    const view = render(<PersonalSettingsModal workspaceId="workspace" />);
    expect(view.getByRole('dialog')).toBeInTheDocument();

    route.pathname = '/uk/workspaces/workspace/overview';
    view.rerender(<PersonalSettingsModal workspaceId="workspace" />);

    expect(view.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each(['desktop', 'mobile'] as const)(
    'returns focus to the visible %s shell trigger after unmount',
    target => {
      let frame: FrameRequestCallback | undefined;
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
        frame = callback;
        return 1;
      });

      const mobile = document.createElement('button');
      const desktop = document.createElement('button');
      mobile.dataset.settingsReturnFocus = '';
      desktop.dataset.settingsReturnFocus = '';
      vi.spyOn(mobile, 'getClientRects').mockReturnValue({
        length: target === 'mobile' ? 1 : 0,
      } as DOMRectList);
      vi.spyOn(desktop, 'getClientRects').mockReturnValue({
        length: target === 'desktop' ? 1 : 0,
      } as DOMRectList);
      document.body.append(mobile, desktop);

      const view = render(<PersonalSettingsModal workspaceId="workspace" />);
      view.getByText('Inside').focus();
      view.unmount();
      act(() => frame?.(0));

      expect(document.activeElement).toBe(
        target === 'mobile' ? mobile : desktop
      );
    }
  );

  it('does not move focus when another dialog is open', () => {
    let frame: FrameRequestCallback | undefined;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      frame = callback;
      return 1;
    });

    const trigger = document.createElement('button');
    trigger.dataset.settingsReturnFocus = '';
    vi.spyOn(trigger, 'getClientRects').mockReturnValue({
      length: 1,
    } as DOMRectList);
    document.body.append(trigger);

    const view = render(<PersonalSettingsModal workspaceId="workspace" />);
    view.getByText('Inside').focus();
    const otherDialog = document.createElement('div');
    otherDialog.setAttribute('role', 'dialog');
    otherDialog.setAttribute('aria-modal', 'true');
    document.body.append(otherDialog);
    view.unmount();
    act(() => frame?.(0));

    expect(document.activeElement).not.toBe(trigger);
  });
});
