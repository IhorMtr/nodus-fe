import { differenceInMinutes, isSameDay } from 'date-fns';

// ==================== TYPES ====================

type TimelineMessage = {
  author: { id: string };
  createdAt: string;
};

export type TimelineEntry<T extends TimelineMessage> = {
  message: T;
  startsGroup: boolean;
  startsDay: boolean;
};

// ==================== CONSTANTS ====================

const GROUP_WINDOW_MINUTES = 5;

// ==================== TIMELINE ====================

// Consecutive messages from one author within a short window form a group,
// so only the first one repeats the avatar and name.
export function buildTimeline<T extends TimelineMessage>(
  messages: T[]
): TimelineEntry<T>[] {
  return messages.map((message, index) => {
    const previous = messages[index - 1];

    if (!previous) {
      return { message, startsGroup: true, startsDay: true };
    }

    const createdAt = new Date(message.createdAt);
    const previousCreatedAt = new Date(previous.createdAt);
    const startsDay = !isSameDay(createdAt, previousCreatedAt);
    const startsGroup =
      startsDay ||
      previous.author.id !== message.author.id ||
      differenceInMinutes(createdAt, previousCreatedAt) >= GROUP_WINDOW_MINUTES;

    return { message, startsGroup, startsDay };
  });
}
