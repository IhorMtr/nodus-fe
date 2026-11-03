// ==================== TYPES ====================

export type ProductVisualSource = {
  src: string;
  width: number;
  height: number;
};

// ==================== VISUALS ====================

export const productVisuals = {
  heroChannel: {
    src: '/images/product/hero-channel-dark.webp',
    width: 1672,
    height: 941,
  },
  workspaceOverview: {
    src: '/images/product/workspace-overview-dark.webp',
    width: 1586,
    height: 992,
  },
  directConversation: {
    src: '/images/product/direct-messages-dark.webp',
    width: 1586,
    height: 992,
  },
  channelLight: {
    src: '/images/product/channels-light.webp',
    width: 1586,
    height: 992,
  },
  announcements: {
    src: '/images/product/announcements-dark.webp',
    width: 1586,
    height: 992,
  },
  members: {
    src: '/images/product/members-dark.webp',
    width: 1586,
    height: 992,
  },
  notifications: {
    src: '/images/product/notifications-dark.webp',
    width: 1586,
    height: 992,
  },
} satisfies Record<string, ProductVisualSource>;
