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
import {
  getWorkspaceMemberName,
  useWorkspaceMembersQuery,
} from '@/domains/workspace/model/members';
import {
  canManageWorkspace,
  useWorkspaceQuery,
} from '@/domains/workspace/model/workspace';
import { useRouter } from '@/shared/i18n/navigation';

import { useAnnouncementEditor } from './use-announcement-editor';

// ==================== PAGE ORCHESTRATION ====================

export function useAnnouncementsView(workspaceId: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('announcement');
  const [editor, setEditor] = useState<'create' | 'edit' | null>(null);
  const [editingTarget, setEditingTarget] = useState<Announcement | null>(null);
  const [filter, setFilter] = useState<'published' | 'scheduled'>('published');
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

  const canManage = canManageWorkspace(workspace.data?.role);
  const authorNames = useMemo(
    () =>
      new Map(
        members.data?.map(member => [
          member.userId,
          getWorkspaceMemberName(member),
        ]) ?? []
      ),
    [members.data]
  );
  const publishedItems = useMemo(
    () =>
      (announcements.data ?? [])
        .filter(item => Boolean(item.publishedAt))
        .sort((a, b) =>
          (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
        ),
    [announcements.data]
  );
  const scheduledItems = useMemo(
    () =>
      (announcements.data ?? [])
        .filter(item => !item.publishedAt)
        .sort((a, b) => (a.publishAt ?? '').localeCompare(b.publishAt ?? '')),
    [announcements.data]
  );
  const items =
    canManage && filter === 'scheduled' ? scheduledItems : publishedItems;

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
    setEditingTarget(null);
    announcementEditor.openCreate();
    setEditor('create');
  };

  const openEdit = (announcement: Announcement) => {
    setEditingTarget(announcement);
    announcementEditor.openEdit(announcement);
    setEditor('edit');
  };

  const closeEditor = () => {
    if (!announcementEditor.isSaving) {
      setEditor(null);
    }
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
    } catch {}
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
    editingTarget,
    closeEditor,
    filter,
    setFilter,
    deleteTarget,
    announcementEditor,
    canManage,
    authorNames,
    items,
    publishedItems,
    scheduledItems,
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
