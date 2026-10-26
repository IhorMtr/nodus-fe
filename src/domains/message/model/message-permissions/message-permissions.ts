import type { Message } from '../message-history/message-types';

// Only the author can edit, even for workspace Owners and Admins.
export function canEditMessage(message: Message, userId: string) {
  return message.author.id === userId;
}

// Authors can delete their messages; Owners and Admins can delete any message.
export function canDeleteMessage(
  message: Message,
  userId: string,
  canModerate: boolean
) {
  return canModerate || canEditMessage(message, userId);
}
