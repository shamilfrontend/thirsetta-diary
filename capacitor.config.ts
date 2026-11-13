import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.tirzetta.diary',
  appName: 'Дневник Тирзетты',
  webDir: 'dist',
  backgroundColor: '#0e1a2b',
  android: {
    backgroundColor: '#0e1a2b',
  },
  plugins: {
    SystemBars: {
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
      style: 'DARK',
    },
  },
}

export default config
