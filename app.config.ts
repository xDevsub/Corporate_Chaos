import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Corporate Chaos',
  slug: 'corporate-chaos',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'corporatechaos',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#1a1a2e',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.corporatechaos.game',
    buildNumber: '1',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1a1a2e',
    },
    package: 'com.corporatechaos.game',
    versionCode: 1,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    [
      'expo-av',
      {
        microphonePermission: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    // Environment
    env: process.env.EXPO_PUBLIC_ENV ?? 'development',
    
    // Feature flags
    enableAds: process.env.EXPO_PUBLIC_ENABLE_ADS === 'true',
    enableIAP: process.env.EXPO_PUBLIC_ENABLE_IAP === 'true',
    enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
    
    // EAS
    eas: {
      projectId: 'your-eas-project-id',
    },
  },
});

