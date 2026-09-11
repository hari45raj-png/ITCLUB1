/**
 * St. Mary's English School - IT Club Branding & Design Tokens
 * 
 * Official School Identity & Visual Directives
 * 
 * Global Color System:
 * - Primary Dark: Deep charcoal / near-black (#0F1419 / #18181B)
 * - Primary Background: White (#FFFFFF)
 * - Secondary Background: Very light neutral gray (#F9FAFB / #F8F9FA)
 * - Primary Text: Very dark charcoal (#0F1419)
 * - Secondary Text: Medium neutral gray (#536471 / #6B7280)
 * - Accent: Refined Instagram-inspired gradient (Purple #7928CA, Magenta #D946EF, Pink #EC4899, Orange #F97316)
 * - Proportions: 70-80% neutral/white, 15-20% dark/charcoal, 5-10% accent
 */

export const SCHOOL_BRAND = {
  // Official School Identity (Strict Content Specification)
  schoolName: "ST. MARY'S ENGLISH SCHOOL",
  clubName: "IT CLUB",
  shortName: "SMES IT Club",
  motto: "Virtue, Knowledge & Innovation",
  estYear: "2002",
  establishedText: "Established in 2002",
  establishedShort: "Established • 2002",

  // Official Institutional Credentials
  location: "Sheikhpura Road, Barbigha (Sheikhpura) Bihar - 811101",
  cbseAffiliationNo: "330509",
  schoolCode: "65518",
  udiseCode: "10262909101",
  affiliation: "CBSE Affiliation No.: 330509",

  // Dynamic logo reference: defaults to null (which activates the clean circular SVG crest),
  // and will be populated dynamically from CMS / Supabase Storage.
  customLogoUrl: null as string | null,

  // Theme Color System (Design Tokens)
  colors: {
    // Primary Dark
    primaryDark: "#0F1419",
    primaryDarkHover: "#1F242A",
    
    // Backgrounds & Surfaces
    primaryBg: "#FFFFFF",
    secondaryBg: "#F9FAFB",
    surfaceWhite: "#FFFFFF",
    
    // Text Tones (WCAG AA Compliant)
    primaryText: "#0F1419",
    secondaryText: "#536471",
    mutedText: "#8E8E93",
    textPrimary: "#0F1419",
    textSecondary: "#536471",
    textMuted: "#8E8E93",
    
    // Borders
    border: "#E5E7EB",
    borderSubtle: "#E5E7EB",
    borderStrong: "#D1D5DB",

    // Refined Accent Family (Used selectively: 5-10%)
    accentPurple: "#7928CA",
    accentMagenta: "#D946EF",
    accentPink: "#EC4899",
    accentOrange: "#F97316",
    accentGradient: "linear-gradient(135deg, #7928CA 0%, #D946EF 35%, #EC4899 70%, #F97316 100%)",

    // Backwards Compatibility Aliases
    primaryRed: "#EC4899",
    primaryRedHover: "#DB2777",
    primaryRedActive: "#BE185D",
    primaryRedSubtle: "#FDF2F8",
    deepNavy: "#0F1419",
    navyMuted: "#27272A",
    navyDarkest: "#09090B",
    charcoal: "#0F1419",
    charcoalMuted: "#536471",
    canvasLight: "#FFFFFF",
  },

  // Brand Pillars
  pillars: [
    {
      title: "Academic Computing",
      desc: "Computer science curricula, study resources, model question papers, and foundational logic.",
    },
    {
      title: "Innovative Engineering",
      desc: "Web development, robotics, algorithm design, open-source projects, and hands-on coding.",
    },
    {
      title: "Competitive Excellence",
      desc: "Inter-school hackathons, Olympiad preparation, technical quizzes, and verified credentials.",
    },
  ],
};
