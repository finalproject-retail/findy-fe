const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * react-native-ble-plx 라이브러리 매니페스트가 BLUETOOTH_SCAN 에
 * neverForLocation 을 넣어 iBeacon 이 스캔에서 빠지는 경우가 있음 → 앱에서 덮어씀.
 */
function withBleScanNoNeverForLocation(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    manifest.manifest.$ = manifest.manifest.$ ?? {};
    manifest.manifest.$['xmlns:tools'] =
      'http://schemas.android.com/tools';
    const permissions = manifest.manifest['uses-permission'] ?? [];
    const filtered = permissions.filter(
      (item) => item.$?.['android:name'] !== 'android.permission.BLUETOOTH_SCAN'
    );
    filtered.push({
      $: {
        'android:name': 'android.permission.BLUETOOTH_SCAN',
        'tools:node': 'merge',
        'tools:remove': 'android:usesPermissionFlags',
      },
    });
    manifest.manifest['uses-permission'] = filtered;
    return config;
  });
}

module.exports = withBleScanNoNeverForLocation;
