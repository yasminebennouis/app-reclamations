export type AppTheme = {
  isDark: boolean;
  colors: {
    bg: string; card: string; text: string; sub: string;
    primary: string; primaryFg: string;
    accent: string; danger: string; border: string;
  };
  radius: { sm: number; md: number; lg: number };
  shadow: { sm: object; md: object; lg: object };
  spacing: (n: number) => number;
};

const base = {
  radius: { sm: 8, md: 12, lg: 16 },
  spacing: (n: number) => n * 8,
  shadow: {
    sm: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
    md: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, elevation: 6 },
    lg: { shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 14, elevation: 10 },
  },
};

export const LightTheme: AppTheme = {
  isDark: false,
  colors: {
    bg: '#F6F8FC', card: '#FFFFFF', text: '#0F172A', sub: '#6B7280',
    primary: '#4F46E5', primaryFg: '#FFFFFF', accent: '#10B981', danger: '#EF4444', border: '#E5E7EB',
  },
  ...base,
};

export const DarkTheme: AppTheme = {
  isDark: true,
  colors: {
    bg: '#0F172A', card: '#111827', text: '#E5E7EB', sub: '#9CA3AF',
    primary: '#6366F1', primaryFg: '#FFFFFF', accent: '#34D399', danger: '#F87171', border: '#374151',
  },
  ...base,
};
