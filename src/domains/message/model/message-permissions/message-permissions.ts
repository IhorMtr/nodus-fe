import type { Message } from '../message-history/message-types';

export function canEditMessage(message: Message, userId: string) {
  return message.author.id === userId;
}

export function canDeleteMessage(
  message: Message,
  userId: string,
  canModerate: boolean
) {
  return canModerate || canEditMessage(message, userId);
}
