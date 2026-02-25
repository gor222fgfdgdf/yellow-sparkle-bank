import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c2d2ddb7eee04d3c8c511d25a45053ec',
  appName: 'yellow-sparkle-bank',
  webDir: 'dist',
  server: {
    url: 'https://yellow-sparkle-bank.lovable.app?forceHideBadge=true',
    cleartext: true,
    allowNavigation: ['*.lovable.app'],
    appendUserAgent: 'CapacitorApp',
  },
  loggingBehavior: 'debug' as any,
};

export default config;
