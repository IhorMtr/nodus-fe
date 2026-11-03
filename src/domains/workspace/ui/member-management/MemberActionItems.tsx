'use client';

import { Menu } from '@mantine/core';
import { MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { WorkspaceMember } from '../../model/members';

// ==================== TYPES ====================

interface MemberActionItemsProps {
  member: WorkspaceMember;
  canChangeRole: boolean;
  canRemove: boolean;
  onChangeRole: (member: WorkspaceMember) => void;
  onRemove: (member: WorkspaceMember) => void;
  canMessage?: boolean;
  onMessage?: (member: WorkspaceMember) => void;
  messagePending?: boolean;
}

// ==================== RENDER ====================

export function MemberActionItems({
  member,
  canChangeRole,
  canRemove,
  onChangeRole,
  onRemove,
  canMessage,
  onMessage,
  messagePending,
}: MemberActionItemsProps) {
  const management = useTranslations('workspace.management');
  const conversation = useTranslations('conversation');

  return (
    <>
      {canMessage && onMessage && (
        <Menu.Item
          leftSection={<MessageSquare size={15} />}
          disabled={messagePending}
          onClick={() => onMessage(member)}
        >
          {conversation('messageMember')}
        </Menu.Item>
      )}
      {canChangeRole && (
        <Menu.Item
          leftSection={<Pencil size={15} />}
          onClick={() => onChangeRole(member)}
        >
          {management('changeRole')}
        </Menu.Item>
      )}
      {canRemove && (
        <Menu.Item
          color="red"
          leftSection={<Trash2 size={15} />}
          onClick={() => onRemove(member)}
        >
          {management('removeMember')}
        </Menu.Item>
      )}
    </>
  );
}
