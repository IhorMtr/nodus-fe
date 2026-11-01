'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  useAnnouncementQuery,
  useAnnouncementsQuery,
  useDeleteAnnouncementMutation,
  useUpdateAnnouncementMutation,
  type Announcement,
} from '@/domains/announcement/model/announcements';
import { useWorkspaceMembersQuery } from '@/domains/workspace/model/members';
import { useWorkspaceQuery } from '@/domains/workspace/model/workspace';
import { useRouter } from '@/shared/i18n/navigation';

import { useAnnouncementEditor } from './use-announcement-editor';

// ==================== PAGE ORCHESTRATION ====================

export function useAnnouncementsView(workspaceId: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('announcement');
  const [editor, setEditor] = useState<'create' | 'edit' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  // ==================== QUERIES AND MUTATIONS ====================

  const workspace = useWorkspaceQuery(workspaceId);
  const announcements = useAnnouncementsQuery(workspaceId);
  const detail = useAnnouncementQuery(workspaceId, selectedId);
  const members = useWorkspaceMembersQuery(workspaceId);
  const remove = useDeleteAnnouncementMutation(workspaceId);
  const publish = useUpdateAnnouncementMutation(workspaceId);
  const announcementEditor = useAnnouncementEditor(workspaceId, () =>
    setEditor(null)
  );

  // ==================== DERIVED STATE ====================

  const canManage =
    workspace.data?.role === 'Owner' || workspace.data?.role === 'Admin';
  const authorNames = useMemo(
    () =>
      new Map(
        members.data?.map(member => [
          member.userId,
          `${member.firstName} ${member.lastName}`,
        ]) ?? []
      ),
    [members.data]
  );
  const items = useMemo(
    () =>
      [...(announcements.data ?? [])].sort(
        (a, b) =>
          b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)
      ),
    [announcements.data]
  );

  // ==================== NAVIGATION ====================

  const openDetail = (id: string) => {
    router.push({
      pathname: '/workspaces/[workspaceId]/announcements',
      params: { workspaceId },
      query: { announcement: id },
    });
  };

  const closeDetail = () => {
    router.replace({
      pathname: '/workspaces/[workspaceId]/announcements',
      params: { workspaceId },
    });
  };

  // ==================== EDITOR HANDLERS ====================

  const openCreate = () => {
    announcementEditor.openCreate();
    setEditor('create');
  };

  const openEdit = (announcement: Announcement) => {
    announcementEditor.openEdit(announcement);
    setEditor('edit');
  };

  const publishNow = (announcement: Announcement) => {
    if (publish.isPending) {
      return;
    }

    publish.mutate({ id: announcement.id, input: { publishAt: null } });
  };

  const openDelete = (announcement: Announcement) => {
    remove.reset();
    setDeleteTarget(announcement);
  };

  const closeDelete = () => {
    if (!remove.isPending) {
      setDeleteTarget(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || remove.isPending) {
      return;
    }

    try {
      await remove.mutateAsync(deleteTarget.id);
      if (selectedId === deleteTarget.id) {
        closeDetail();
      }
      setDeleteTarget(null);
    } catch {
      // The mutation retains the backend error for the dialog to display.
    }
  };

  const retry = () => {
    void workspace.refetch();
    void announcements.refetch();
  };

  return {
    workspace,
    announcements,
    detail,
    members,
    remove,
    publish,
    editor,
    setEditor,
    deleteTarget,
    announcementEditor,
    canManage,
    authorNames,
    items,
    selectedId,
    openDetail,
    closeDetail,
    openCreate,
    openEdit,
    publishNow,
    openDelete,
    closeDelete,
    confirmDelete,
    retry,
  };
}
