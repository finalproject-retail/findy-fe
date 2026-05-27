# 🛒 고객 맞춤형 장보기 경험을 제공하는 Findy 마트
이 프로젝트는 **React Native (Expo)** 와 **NativeWind v4**를 기반으로 구축되었습니다. 
아래 절차에 따라 개발 환경을 세팅해 주세요.

<br>

## 📌 사전 준비물
1. **Node.js** 설치 (LTS 버전 권장)
2. **Development Build** 필수 (비콘 BLE — Expo Go 불가). Android Studio 설정은 [findy-mobile/ANDROID_STUDIO_SETUP.md](../findy-mobile/ANDROID_STUDIO_SETUP.md) 참고.
3. 에디터: **Cursor** 또는 **VS Code**

<br>

## 🛠️ 초기 세팅 (Installation)
프로젝트를 클론(Clone) 받은 후, 터미널에서 아래 명령어를 순서대로 입력하세요.

```bash
# 1. 패키지 설치
npm install

# 2. NativeWind v4 관련 필수 모듈 설치 (에러 방지)
npm install react-native-css-interop
```

<br>

## 🏃 실행하기 (Running)
설정이 바뀐 경우나 처음 실행할 때는 **캐시를 지우고 실행**하는 것이 가장 안전합니다.

```bash
cd findy-fe
cp .env.example .env   # EXPO_PUBLIC_MAP_API_URL = PC IP
npm install
npx expo run:android   # 최초 1회 (BLE 네이티브)
npm start
```

* 비콘·지도 통합: [findy-fe/docs/BEACON_INTEGRATION.md](./findy-fe/docs/BEACON_INTEGRATION.md)
* 지도 탭에서 BLE 자동 시작 → **현재 위치**가 `MapNavigationContext`에 반영됩니다.

<br>

## 📂 프로젝트 구조 (Expo Router)
우리 프로젝트는 **파일 기반 라우팅**을 사용합니다. 파일 위치가 곧 앱의 페이지가 됩니다.

* **`app/_layout.tsx`**: 전체 앱의 심장부. 테일윈드(`global.css`)가 여기서 로드됩니다.
* **`app/(tabs)/`**: 하단 탭 바가 포함된 메인 페이지들이 모여 있습니다.
* **`app/onboarding.tsx`**: 온보딩 등 탭 바가 없는 단독 페이지입니다.
* **`global.css`**: 테일윈드 스타일 정의 파일입니다.

<br>

## ⚠️ 중요: 스타일링 가이드 (NativeWind v4)
웹의 Tailwind CSS와 거의 동일하게 사용하지만, 아래 규칙을 반드시 지켜주세요.

1. **컴포넌트 사용:** `div` 대신 `View`, `span/p` 대신 `Text`를 사용합니다.
2. **클래스명:** `className` 속성을 그대로 사용하면 됩니다.
3. **에러 발생 시:** 폰 화면이 빨갛게 변하며 `Unable to resolve module...` 에러가 나면, 터미널을 끄고 `npx expo start -c`로 재시작하세요.

<br>

## 🔧 주요 설정 파일 (수정 금지)
* **`babel.config.js`**: NativeWind 번역 설정이 들어있습니다.
* **`tailwind.config.js`**: 디자인 시스템 및 경로 설정이 들어있습니다.
* **`tsconfig.json`**: 타입스크립트 설정 파일입니다.

<br>

### 💡 팁
> 코드를 수정하고 저장(`Ctrl + S`)하면 폰에서 실시간으로 화면이 바뀝니다. 만약 바뀌지 않는다면 터미널에서 `r`을 눌러 새로고침 하세요!
