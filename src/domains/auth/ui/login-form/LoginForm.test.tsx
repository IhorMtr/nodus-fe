import { http, HttpResponse } from 'msw';
import { vi, describe, expect, it, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoginView } from '@/views/auth/login-view/LoginView';
import { authSession } from '@/domains/auth/model/session/auth-session';
import { server } from '@/test/utils/server';
import { renderWithProviders } from '@/test/utils/render';

const navigation = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock('@/shared/i18n/navigation', () => ({
  useRouter: () => navigation,
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

describe('login form', () => {
  beforeEach(() => {
    authSession.clear();
    navigation.replace.mockReset();
  });

  // ==================== FORM DISPLAY AND VALIDATION ====================

  it('renders labeled fields and the sign-in action', () => {
    renderWithProviders(<LoginView />);

    expect(screen.getByRole('textbox', { name: 'Email' })).toBeVisible();
    expect(
      screen.getByLabelText(/Password/, { selector: 'input' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  it('shows validation errors without sending a request', async () => {
    const user = userEvent.setup();
    let requestCount = 0;
    server.use(
      http.post('/api/auth/login', () => {
        requestCount += 1;
        return HttpResponse.json({});
      })
    );
    renderWithProviders(<LoginView />);

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter your email address.')).toBeVisible();
    expect(screen.getByText('Enter your password.')).toBeVisible();
    expect(requestCount).toBe(0);
  });

  // ==================== REQUEST INTERACTIONS ====================

  it('submits valid credentials once and locks the form while waiting', async () => {
    const user = userEvent.setup();
    let requestCount = 0;
    let finishRequest: (() => void) | undefined;
    server.use(
      http.post('/api/auth/login', async ({ request }) => {
        requestCount += 1;
        expect(await request.json()).toEqual({
          email: 'person@example.com',
          password: 'StrongPass123',
        });
        await new Promise<void>(resolve => {
          finishRequest = resolve;
        });
        return HttpResponse.json({
          success: true,
          data: { accessToken: 'token', expiresAt: Date.now() + 60_000 },
          messageType: null,
          errors: null,
        });
      })
    );
    renderWithProviders(<LoginView />);

    await user.type(
      screen.getByRole('textbox', { name: 'Email' }),
      'person@example.com'
    );
    await user.type(
      screen.getByLabelText(/Password/, { selector: 'input' }),
      'StrongPass123'
    );
    const submit = screen.getByRole('button', { name: 'Sign in' });
    await user.click(submit);

    await waitFor(() => expect(submit).toBeDisabled());
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute(
      'readonly'
    );
    expect(
      screen.getByLabelText(/Password/, { selector: 'input' })
    ).toHaveAttribute('readonly');
    expect(requestCount).toBe(1);
    await user.click(submit);
    expect(requestCount).toBe(1);
    finishRequest?.();

    await waitFor(() =>
      expect(navigation.replace).toHaveBeenCalledWith('/app')
    );
  });

  it('shows a translated server error after rejected credentials', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('/api/auth/login', () =>
        HttpResponse.json(
          {
            success: false,
            data: null,
            messageType: 'InvalidCredentials',
            errors: null,
          },
          { status: 401 }
        )
      )
    );
    renderWithProviders(<LoginView />);

    await user.type(
      screen.getByRole('textbox', { name: 'Email' }),
      'person@example.com'
    );
    await user.type(
      screen.getByLabelText(/Password/, { selector: 'input' }),
      'wrong-password'
    );
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The email or password is incorrect.'
    );
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it('does not navigate when the request returns an internal server error', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('/api/auth/login', () => HttpResponse.json({}, { status: 500 }))
    );
    renderWithProviders(<LoginView />);

    await user.type(
      screen.getByRole('textbox', { name: 'Email' }),
      'person@example.com'
    );
    await user.type(
      screen.getByLabelText(/Password/, { selector: 'input' }),
      'StrongPass123'
    );
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again later.'
    );
    expect(navigation.replace).not.toHaveBeenCalled();
  });
});
