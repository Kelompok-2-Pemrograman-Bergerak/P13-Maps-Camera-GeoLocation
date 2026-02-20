import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter', // sesuaikan dengan appId project kamu
  appName: 'KurirTrack',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // ✅ WAJIB: API Key Google Maps untuk Android
    GoogleMaps: {
      androidAPIKey: 'AIzaSyCqJ6WGgK20pQT1ravXzYeXfSw3hA6ChBM',
      // iOSAPIKey: 'YOUR_IOS_API_KEY_HERE', // jika perlu iOS
    },
    // ✅ Izin kamera dan galeri
    Camera: {
      // permissions sudah dihandle di AndroidManifest
    }
  }
};

export default config;