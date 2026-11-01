import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { workspaceMembersKey } from './use-workspace-members-query';
import { applyWorkspaceMemberPresence } from './workspace-member-presence';
import type { WorkspaceMember } from './workspace-member-types';

// ==================== FIXTURES ====================

const member = (userId: string): WorkspaceMember => ({
  userId,
  firstName: 'John',
  lastName: 'Doe',
  email: `${userId}@example.com`,
  role: 'Member',
  joinedAt: '2026-10-25T12:00:00.000Z',
  status: 'offline',
});

// ==================== TESTS ====================

describe('applyWorkspaceMemberPresence', () => {
  it('updates the member in every cached workspace list', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(workspaceMembersKey('w1'), [member('u1')]);
    queryClient.setQueryData(workspaceMembersKey('w2'), [
      member('u2'),
      member('u1'),
    ]);

    applyWorkspaceMemberPresence(queryClient, { userId: 'U1', status: 'dnd' });

    expect(
      queryClient.getQueryData<WorkspaceMember[]>(
        workspaceMembersKey('w1')
      )?.[0]?.status
    ).toBe('dnd');
    expect(
      queryClient
        .getQueryData<WorkspaceMember[]>(workspaceMembersKey('w2'))
        ?.map(item => item.status)
    ).toEqual(['offline', 'dnd']);
  });

  it('keeps lists without the user unchanged', () => {
    const queryClient = new QueryClient();
    const members = [member('u2')];
    queryClient.setQueryData(workspaceMembersKey('w1'), members);

    applyWorkspaceMemberPresence(queryClient, {
      userId: 'u1',
      status: 'online',
    });

    expect(queryClient.getQueryData(workspaceMembersKey('w1'))).toBe(members);
  });
});
