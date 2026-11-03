// ==================== CHANNEL IDENTITY ====================

const CHANNEL_TONE_COUNT = 5;

export function getChannelColor(channelId: string) {
  let hash = 0;

  for (const character of channelId) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  const tone = (hash % CHANNEL_TONE_COUNT) + 1;

  return `var(--color-channel-${tone})`;
}
