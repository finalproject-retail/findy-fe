# findy-mobile → findy-fe 비콘 통합

findy-fe(지도·경로 UI)에 findy-mobile(BLE 수신·EMA·서버 전송) 로직을 합친 구조입니다.

## 아키텍처

```
BLE 스캔 (lib/beacon/services/bleScanner)
    → EMA 필터 (lib/beacon/utils/beaconRssiFilter)
    → 사용자 grid_id (nearest_grid_id 의미)
    → gridX/gridY 변환 (constants/beacon.gridIdToGridPoint)
    → MapNavigationContext.currentLocation  ← 지도 UI
    → POST /api/v1/beacon-signals (로그인 토큰 있을 때)
```

## 폴더

| 경로 | 출처 |
|------|------|
| `lib/beacon/` | findy-mobile `src/` (beacon, BLE, EMA) |
| `contexts/BeaconLocationContext.tsx` | 신규 — 지도와 BLE 연결 |
| `constants/beacon.ts` | minor→gridId, MAP API URL |

## 환경 변수

```env
EXPO_PUBLIC_MAP_API_URL=http://<PC_IP>:8888
```

일반 API는 기존 `EXPO_PUBLIC_API_URL` (Gateway 8080) 그대로.

## 실행 (Expo Go 불가)

```bash
cd findy-fe/findy-fe
cp .env.example .env
npm install
npx expo run:android   # 최초 1회
npm start
```

지도 탭 진입 시 BLE 자동 시작, 이탈 시 중지.

## 개발용 CSV 로그 (`__DEV__`만)

지도 탭 상단 패널:

- **CSV 공유** — 수집한 스캔을 findy-mobile과 동일 형식으로 공유
- **버퍼 비우기** — 메모리 버퍼 초기화

컬럼: `timestamp_iso,mac,bluetooth_address_hex,rssi,uuid,major,minor,tx,nearest_grid_id`  
`nearest_grid_id` = EMA 기준 **사용자 격자** (raw `rssi`/`minor`는 패킷 원본).

## 로그인 / 서버 전송

- **지도 현위치**: 토큰 없어도 BLE만 되면 `currentLocation` 갱신
- **beacon-signals POST**: `lib/api/client.setAccessToken()` 후에만 전송

Auth 연동 시 로그인 성공 콜백에서 `setAccessToken(token)` 호출.

## findy-mobile과의 관계

- **findy-mobile**: 비콘 단독 테스트 화면(`BeaconTesterScreen`) — 계속 사용 가능
- **findy-fe**: 통합 앱 — 지도 + 장보기 + 비콘 위치

로직 변경 시 `lib/beacon/` 을 한쪽에서 수정하고 다른 쪽에 반영하거나, 추후 공유 패키지로 분리 권장.

## Android Studio

네이티브 빌드 절차는 findy-mobile의 [ANDROID_STUDIO_SETUP.md](../../findy-mobile/ANDROID_STUDIO_SETUP.md) 와 동일합니다.
