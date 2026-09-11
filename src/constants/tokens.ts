/**
 * St. Mary's English School - IT Club Platform
 * Master Design Tokens & Visual Language
 * 
 * PROMPT 5: Centralized Design Tokens (Colors, Typography, Spacing, Elevation, Transitions)
 * 
 * School Identity Palette:
 * - School Red (Primary Crimson): Academic excellence, vitality, school identity
 * - Deep Navy: Integrity, technical depth, institutional authority
 * - Charcoal & Dark Neutrals: High-contrast legible body text and structured borders
 * - Warm White & Canvas Neutrals: Clean, open, academic reading surfaces
 */

export const DESIGN_TOKENS = {
  // 1. Centralized Color Palette
  colors: {
    // Primary Dark (Near-black / Charcoal)
    primaryDark: '#0F1419',
    primaryDarkHover: '#1F242A',
    
    // Refined Accent Family (Instagram-inspired: Purple, Magenta, Pink, Orange)
    accentPurple: '#7928CA',
    accentMagenta: '#D946EF',
    accentPink: '#EC4899',
    accentOrange: '#F97316',
    accentGradient: 'linear-gradient(135deg, #7928CA 0%, #D946EF 35%, #EC4899 70%, #F97316 100%)',
    primary: '#EC4899', // Default accent
    primaryHover: '#DB2777',
    primaryActive: '#BE185D',
    primarySubtle: '#FDF2F8',
    primaryBorder: '#FBCFE8',

    // Deep Authority Dark
    navy: '#0F1419',
    navyMuted: '#27272A',
    navySubtle: '#09090B',
    navyBorder: '#27272A',

    // Neutral Surfaces & Canvases
    background: '#FFFFFF', // Clean white background
    backgroundSecondary: '#F9FAFB', // Light neutral gray
    surface: '#FFFFFF', // Pure white card surface
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#F9FAFB',

    // Borders & Dividers
    border: '#E5E7EB', // Neutral 200
    borderStrong: '#D1D5DB', // Neutral 300
    borderSubtle: '#F3F4F6', // Neutral 100

    // Typography Tones
    textPrimary: '#0F1419', // Near-black
    textSecondary: '#536471', // Medium neutral gray
    textMuted: '#8E8E93', // Muted gray
    textInverted: '#FFFFFF',

    // Functional State Colors
    success: '#10B981', // Emerald 500
    successBg: '#ECFDF5',
    successBorder: '#A7F3D0',

    warning: '#F59E0B', // Amber 500
    warningBg: '#FFFBEB',
    warningBorder: '#FDE68A',

    error: '#EF4444', // Red 500
    errorBg: '#FEF2F2',
    errorBorder: '#FECACA',

    info: '#0284C7', // Sky 600
    infoBg: '#F0F9FF',
    infoBorder: '#BAE6FD',
  },

  // 2. Typography Hierarchy (Type Scale, Tracking, Line Heights)
  typography: {
    fonts: {
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    styles: {
      display: 'text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight',
      h1: 'text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug',
      h2: 'text-xl sm:text-2xl font-bold tracking-tight leading-snug',
      h3: 'text-lg sm:text-xl font-bold tracking-normal leading-normal',
      h4: 'text-base font-semibold tracking-normal leading-normal',
      body: 'text-sm sm:text-base font-normal leading-relaxed text-slate-700',
      bodySmall: 'text-xs sm:text-sm font-normal leading-normal text-slate-600',
      caption: 'text-[11px] font-medium leading-tight text-slate-500',
      label: 'text-xs font-bold uppercase tracking-wider text-slate-700',
      button: 'text-xs sm:text-sm font-semibold tracking-wide',
    },
  },

  // 3. Spacing Rhythm
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    section: 'py-12 sm:py-16 lg:py-20',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  },

  // 4. Border Radius Tokens
  radius: {
    sm: 'rounded-md', // 6px
    md: 'rounded-lg', // 8px
    lg: 'rounded-xl', // 12px
    full: 'rounded-full', // Pills & Avatars
  },

  // 5. Elevation & Shadows (Academic Minimalist - No exaggerated glows)
  shadows: {
    subtle: 'shadow-xs shadow-slate-900/5',
    card: 'shadow-sm shadow-slate-900/5 border border-slate-200/80',
    elevated: 'shadow-md shadow-slate-900/10 border border-slate-200',
    dropdown: 'shadow-lg shadow-slate-900/15 border border-slate-200',
  },

  // 6. Transitions & Motion Tokens
  transitions: {
    fast: 'transition-all duration-150 ease-in-out',
    standard: 'transition-all duration-200 ease-in-out',
    modal: 'transition-all duration-250 ease-out',
  },
} as const;
