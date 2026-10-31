'use client';

import { Modal, Select } from '@mantine/core';
import { useTranslations } from 'next-intl';

import { getWorkspaceManagementErrorKey } from '@/domains/workspace/model/workspace';
import type { WorkspaceMember } from '@/domains/workspace/model/members';
import { Button } from '@/shared/ui/button';

import type { useMemberManagement } from '../hooks/use-member-management';
import styles from '../MembersView.module.scss';

// ==================== MEMBER MANAGEMENT DIALOGS ====================

export function MemberManagementDialogs({
  state,
}: {
  state: ReturnType<typeof useMemberManagement>;
}) {
  const t = useTranslations('invite');
  const management = useTranslations('workspace.management');
  const {
    changeRole,
    removeMember,
    roleTarget,
    removeTarget,
    selectedRole,
    setSelectedRole,
    closeRole,
    saveRole,
    closeRemove,
    confirmRemove,
  } = state;
  const memberName = (member: WorkspaceMember) =>
    `${member.firstName} ${member.lastName}`.trim() || member.email;

  // ==================== RENDER ====================

  return (
    <>
      {/* ==================== ROLE MANAGEMENT ==================== */}

      <Modal
        opened={roleTarget !== null}
        onClose={closeRole}
        title={management('changeRole')}
        centered
        size="sm"
        closeOnClickOutside={!changeRole.isPending}
        closeOnEscape={!changeRole.isPending}
      >
        <div className={styles.modalBody}>
          <p>
            {management('changeRoleFor', {
              name: roleTarget ? memberName(roleTarget) : '',
            })}
          </p>
          <Select
            label={management('roleLabel')}
            value={selectedRole}
            onChange={value => {
              if (value === 'Admin' || value === 'Member') {
                setSelectedRole(value);
              }
            }}
            data={[
              { value: 'Member', label: t('roles.Member') },
              { value: 'Admin', label: t('roles.Admin') },
            ]}
            disabled={changeRole.isPending}
            allowDeselect={false}
          />
          {changeRole.isError && (
            <p className={styles.error} role="alert">
              {management(
                `errors.${getWorkspaceManagementErrorKey(changeRole.error)}`
              )}
            </p>
          )}
          <div className={styles.modalActions}>
            <Button
              variant="secondary"
              onClick={closeRole}
              disabled={changeRole.isPending}
            >
              {management('cancel')}
            </Button>
            <Button
              onClick={() => void saveRole()}
              loading={changeRole.isPending}
              disabled={selectedRole === roleTarget?.role}
            >
              {management('save')}
            </Button>
          </div>
        </div>
      </Modal>
      {/* ==================== MEMBER REMOVAL ==================== */}

      <Modal
        opened={removeTarget !== null}
        onClose={closeRemove}
        title={management('removeMember')}
        centered
        size="sm"
        closeOnClickOutside={!removeMember.isPending}
        closeOnEscape={!removeMember.isPending}
      >
        <div className={styles.modalBody}>
          <p>
            {management('removeConfirmation', {
              name: removeTarget ? memberName(removeTarget) : '',
            })}
          </p>
          {removeMember.isError && (
            <p className={styles.error} role="alert">
              {management(
                `errors.${getWorkspaceManagementErrorKey(removeMember.error)}`
              )}
            </p>
          )}
          <div className={styles.modalActions}>
            <Button
              variant="secondary"
              onClick={closeRemove}
              disabled={removeMember.isPending}
            >
              {management('cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => void confirmRemove()}
              loading={removeMember.isPending}
            >
              {management('removeMember')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
