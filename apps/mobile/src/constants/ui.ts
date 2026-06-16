export const uiColors = {
  background: {
    primary: "#050508",
    secondary: "#0d0d12"
  },
  surface: {
    base: "#14141b",
    raised: "#1d1d27",
    soft: "#242430"
  },
  text: {
    primary: "#f7f3ee",
    secondary: "#d8d0c7",
    muted: "#9f9891",
    inverse: "#050508"
  },
  border: {
    subtle: "#2d2d38"
  },
  accent: {
    voice: "#d8b46a",
    privacy: "#8fa7ff"
  },
  state: {
    success: "#8ac99a",
    warning: "#e0b76f",
    danger: "#e28787"
  }
} as const;

export const uiSpacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48
} as const;

export const uiRadius = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 18,
  round: 999
} as const;

export const uiTypography = {
  screenTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "600"
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600"
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "400"
  },
  supporting: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400"
  },
  metadata: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500"
  },
  action: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600"
  }
} as const;

export const uiShadows = {
  none: {
    shadowOpacity: 0,
    elevation: 0
  },
  soft: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4
  }
} as const;

export const uiScreen = {
  backgroundColor: uiColors.background.primary,
  horizontalPadding: uiSpacing.xl,
  verticalPadding: uiSpacing.xxl,
  maxContentWidth: 520
} as const;
