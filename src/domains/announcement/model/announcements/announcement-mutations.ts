'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getHttpStatus } from '@/shared/api/http-error';

import { announcementApi } from '../../api/announcement-api';
import { announcementKeys } from './announcement-queries';
import type {
  Announcement,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from './announcement-types';

// ==================== CACHE UPDATES ====================

function saveAnnouncement(
  current: Announcement[] | undefined,
  announcement: Announcement
) {
  if (!current) {
    return current;
  }

  return [
    announcement,
    ...current.filter(item => item.id !== announcement.id),
  ].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)
  );
}

// ==================== MUTATIONS ====================

export function useCreateAnnouncementMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAnnouncementInput) =>
      announcementApi.create(workspaceId, input),
    onSuccess: announcement => {
      queryClient.setQueryData<Announcement[]>(
        announcementKeys.list(workspaceId),
        current => saveAnnouncement(current, announcement)
      );
      queryClient.setQueryData(
        announcementKeys.detail(workspaceId, announcement.id),
        announcement
      );
      void queryClient.invalidateQueries({
        queryKey: announcementKeys.list(workspaceId),
      });
    },
  });
}

export function useUpdateAnnouncementMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateAnnouncementInput;
    }) => announcementApi.update(workspaceId, id, input),
    onSuccess: announcement => {
      queryClient.setQueryData<Announcement[]>(
        announcementKeys.list(workspaceId),
        current => saveAnnouncement(current, announcement)
      );
      queryClient.setQueryData(
        announcementKeys.detail(workspaceId, announcement.id),
        announcement
      );
      void queryClient.invalidateQueries({
        queryKey: announcementKeys.list(workspaceId),
      });
    },
    onError: (error, variables) => {
      if (![404, 409].includes(getHttpStatus(error) ?? 0)) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: announcementKeys.list(workspaceId),
      });
      void queryClient.invalidateQueries({
        queryKey: announcementKeys.detail(workspaceId, variables.id),
        exact: true,
      });
    },
  });
}

export function useDeleteAnnouncementMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => announcementApi.remove(workspaceId, id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Announcement[]>(
        announcementKeys.list(workspaceId),
        current => current?.filter(item => item.id !== id)
      );
      queryClient.removeQueries({
        queryKey: announcementKeys.detail(workspaceId, id),
        exact: true,
      });
      void queryClient.invalidateQueries({
        queryKey: announcementKeys.list(workspaceId),
      });
    },
    onError: error => {
      if (getHttpStatus(error) !== 404) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: announcementKeys.list(workspaceId),
      });
    },
  });
}
