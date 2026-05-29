import CalendarIcon from "@/assets/icons/calendar.svg";
import EyeOffIcon from "@/assets/icons/eye_off.svg";
import EyeOnIcon from "@/assets/icons/eye_on.svg";
import RadioButtonFillIcon from "@/assets/icons/radio-button-fill.svg";
import RadioButtonIcon from "@/assets/icons/radio-button.svg";
import { Button } from "@/components/common/Button";
import { DatePickerModal } from "@/components/common/DatePicker";
import { Header } from "@/components/common/Header";
import { Input } from "@/components/common/Input";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Gender = "female" | "male";

/** DatePicker(yyyy.mm.dd) → API LocalDate(yyyy-MM-dd) */
function toApiBirthDate(date: string): string {
  return date.trim().replace(/\./g, "-");
}

/** UI gender → API enum (MALE | FEMALE) */
function toApiGender(gender: Gender): "MALE" | "FEMALE" {
  return gender === "male" ? "MALE" : "FEMALE";
}

function toApiPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

function PasswordField({
  placeholder,
  value,
  onChangeText,
  visible,
  onToggleVisible,
  error,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  error?: string;
}) {
  return (
    <View className="relative w-full">
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#A3A3A3"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        className={`w-full h-[52px] border rounded-md bg-white px-screen font-pretendard text-md font-regular text-text-main ${
          error ? "border-text-red" : "border-gray"
        }`}
      />
      <Pressable
        onPress={onToggleVisible}
        className="absolute right-screen top-0 bottom-0 justify-center items-center w-8"
        accessibilityRole="button"
        accessibilityLabel={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
      >
        {visible ? (
          <EyeOnIcon width={24} height={24} />
        ) : (
          <EyeOffIcon width={24} height={24} />
        )}
      </Pressable>
    </View>
  );
}

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);

  // 에러 메시지 상태 관리
  const [nameError, setNameError] = useState("");
  const [idError, setIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [birthdateError, setBirthdateError] = useState("");
  const [genderError, setGenderError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false); 

  const handleBirthdatePress = () => {
    setIsDatePickerVisible(true);
  };

  const handleSignup = async () => {
    setNameError("");
    setIdError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setPhoneError("");
    setBirthdateError("");
    setGenderError("");

    let isValid = true;

    if (!name.trim()) {
      setNameError("* 이름을 입력해 주세요.");
      isValid = false;
    }
    if (!id.trim()) {
      setIdError("* 5자 이상 영문으로 된 아이디를 입력해 주세요. / 아이디 중복 확인을 해주세요.");
      isValid = false;
    }
    if (!password) {
      setPasswordError("* 8~16자리의 비밀번호를 입력해 주세요.");
      isValid = false;
    }
    if (!confirmPassword || password !== confirmPassword) {
      setConfirmPasswordError("* 비밀번호를 입력해 주세요. / 비밀번호를 다시 입력해 주세요.");
      isValid = false;
    }
    if (!phone.trim()) {
      setPhoneError("* 전화번호를 입력해 주세요. / 전화번호 형식에 맞게 입력해 주세요.");
      isValid = false;
    }
    if (!birthdate) {
      setBirthdateError("* 생년월일을 입력해 주세요.");
      isValid = false;
    }
    if (!gender) {
      setGenderError("* 성별을 선택해 주세요.");
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);
    try {
      const payload = {
        email: id.trim(),
        password,
        name: name.trim(),
        phoneNumber: toApiPhoneNumber(phone),
        birthDate: toApiBirthDate(birthdate),
        gender: toApiGender(gender!),
      };
      const response = await axios.post(
        "http://192.168.0.32:8889/api/v1/users/signup",
        payload,
      );
      const body = response.data as { success?: boolean; message?: string };
      if (body?.success === false) {
        throw new Error(body.message ?? "회원가입에 실패했습니다.");
      }
      setIsLoading(false);
      Alert.alert("성공", body?.message ?? "회원가입 완료!", [
        {
          text: "확인",
          onPress: () =>
            router.replace({
              pathname: "/login",
              params: { name: name.trim() },
            }),
        },
      ]);
    } catch (error: unknown) {
      setIsLoading(false);
      let errorMsg = "회원가입 중 오류가 발생했습니다.";
      if (error instanceof Error && error.message) {
        errorMsg = error.message;
      } else if (axios.isAxiosError(error) && error.response?.data) {
        const data = error.response.data as {
          message?: string | string[];
        };
        if (typeof data.message === "string") {
          errorMsg = data.message;
        } else if (Array.isArray(data.message)) {
          errorMsg = data.message.join("\n");
        }
      }
      Alert.alert("에러", errorMsg);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header
        title="회원가입"
        showBack
        onBackPress={() => router.replace("/login")}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 40,
          }}
        >
          {/* 1. 이름 필드 */}
          <View className="mb-md">
            <Text className="font-pretendard text-sm font-bold text-text-main mb-[10px]">이름</Text>
            <Input
              placeholder="홍길동"
              value={name}
              onChangeText={setName}
              error={nameError}
            />
          </View>

          {/* 2. 아이디 필드 (시안대로 버튼 없이 깔끔하게 변경) */}
          <View className="mb-md">
            <Text className="font-pretendard text-sm font-bold text-text-main mb-[10px]">아이디</Text>
            <Input
              placeholder="xxxxxxx@gmail.com"
              value={id}
              onChangeText={setId}
              autoCapitalize="none"
              autoCorrect={false}
              error={idError}
            />
          </View>

          {/* 3. 비밀번호 필드 */}
          <View className="mb-md">
            <Text className="font-pretendard text-sm font-bold text-text-main mb-[10px]">비밀번호</Text>
            <PasswordField
              placeholder="영문, 숫자, 특수문자 포함 8자 이상"
              value={password}
              onChangeText={setPassword}
              visible={showPassword}
              onToggleVisible={() => setShowPassword((v) => !v)}
              error={passwordError}
            />
            {passwordError ? (
              <Text className="mt-[6px] font-pretendard text-xs text-text-red">{passwordError}</Text>
            ) : null}
          </View>

          {/* 4. 비밀번호 확인 필드 */}
          <View className="mb-md">
            <Text className="font-pretendard text-sm font-bold text-text-main mb-[10px]">비밀번호 확인</Text>
            <PasswordField
              placeholder=""
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              visible={showConfirmPassword}
              onToggleVisible={() => setShowConfirmPassword((v) => !v)}
              error={confirmPasswordError}
            />
            {confirmPasswordError ? (
              <Text className="mt-[6px] font-pretendard text-xs text-text-red">{confirmPasswordError}</Text>
            ) : null}
          </View>

          {/* 5. 전화번호 필드 */}
          <View className="mb-md">
            <Text className="font-pretendard text-sm font-bold text-text-main mb-[10px]">전화번호</Text>
            <Input
              placeholder="010-1234-5678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={phoneError}
            />
          </View>

          {/* 6. 생년월일 필드 */}
          <View className="mb-md">
            <Text className="font-pretendard text-sm font-bold text-text-main mb-[10px]">생년월일</Text>
            <Pressable
              onPress={handleBirthdatePress}
              className={`w-full h-[52px] border rounded-md bg-white px-screen flex-row items-center justify-between ${
                birthdateError ? "border-text-red" : "border-gray"
              }`}
              accessibilityRole="button"
              accessibilityLabel="생년월일 선택"
            >
              <Text
                className={`font-pretendard text-md font-regular ${
                  birthdate ? "text-text-main" : "text-text-sub2"
                }`}
              >
                {birthdate || "yyyy.mm.dd"}
              </Text>
              <CalendarIcon width={20} height={20} />
            </Pressable>
            {birthdateError ? (
              <Text className="mt-[6px] font-pretendard text-xs text-text-red">{birthdateError}</Text>
            ) : null}
          </View>

          {/* 7. 성별 필드 */}
          <View className="mb-md">
            <Text className="font-pretendard text-sm font-bold text-text-main mb-[10px]">성별</Text>
            <View className="flex-row gap-x-lg">
              <Pressable
                onPress={() => setGender("female")}
                className="flex-row items-center gap-x-sm h-8"
                accessibilityRole="radio"
                accessibilityState={{ selected: gender === "female" }}
              >
                {gender === "female" ? (
                  <RadioButtonFillIcon width={22} height={22} className="text-main" />
                ) : (
                  <RadioButtonIcon width={22} height={22} />
                )}
                <Text className="font-pretendard text-md font-regular text-text-main">여자</Text>
              </Pressable>

              <Pressable
                onPress={() => setGender("male")}
                className="flex-row items-center gap-x-sm h-8"
                accessibilityRole="radio"
                accessibilityState={{ selected: gender === "male" }}
              >
                {gender === "male" ? (
                  <RadioButtonFillIcon width={22} height={22} className="text-main" />
                ) : (
                  <RadioButtonIcon width={22} height={22} />
                )}
                <Text className="font-pretendard text-md font-regular text-text-main">남자</Text>
              </Pressable>
            </View>
            {genderError ? (
              <Text className="mt-[6px] font-pretendard text-xs text-text-red">{genderError}</Text>
            ) : null}
          </View>

          {/* 회원가입 버튼 */}
          <View className="mt-xl">
            <Button onPress={handleSignup} isLoading={isLoading}>
              회원가입
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <DatePickerModal
        isVisible={isDatePickerVisible}
        onClose={() => setIsDatePickerVisible(false)}
        value={birthdate || undefined}
        onSelectDate={(date) => {
          setBirthdate(date);       // 선택한 날짜(yyyy.mm.dd)를 생년월일 상태에 저장
          setBirthdateError("");    // 날짜가 들어왔으니 기존 에러 메시지 초기화
        }}
      />
    </SafeAreaView>
  );
}