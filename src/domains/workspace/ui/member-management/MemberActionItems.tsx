'use client';

import { Menu } from '@mantine/core';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { WorkspaceMember } from '../../model/members';

// ==================== TYPES ====================

interface MemberActionItemsProps {
  member: WorkspaceMember;
  canChangeRole: boolean;
  canRemove: boolean;
  onChangeRole: (member: WorkspaceMember) => void;
  onRemove: (member: WorkspaceMember) => void;
}

// ==================== RENDER ====================

// Menu items shared by every member menu: the "more" button and the context menu.
export function MemberActionItems({
  member,
  canChangeRole,
  canRemove,
  onChangeRole,
  onRemove,
}: MemberActionItemsProps) {
  const management = useTranslations('workspace.management');

  return (
    <>
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
