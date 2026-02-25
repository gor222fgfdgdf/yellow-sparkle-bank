import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c2d2ddb7eee04d3c8c511d25a45053ec',
  appName: 'yellow-sparkle-bank',
  webDir: 'dist',
  server: {
    url: 'https://c2d2ddb7-eee0-4d3c-8c51-1d25a45053ec.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    allowNavigation: ['*.lovableproject.com'],
    appendUserAgent: 'CapacitorApp',
  },
  loggingBehavior: 'debug' as any,
};

export default config;
