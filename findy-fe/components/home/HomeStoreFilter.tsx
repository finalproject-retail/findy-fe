import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { HomeStoreOption } from "./storeOptions";

export type HomeStoreFilterOption = HomeStoreOption;

type HomeStoreFilterProps = {
  value: number;
  options: HomeStoreFilterOption[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onChange: (storeId: number) => void;
  onRetry?: () => void;
};

export function HomeStoreFilter({
  value,
  options,
  isLoading = false,
  errorMessage = null,
  onChange,
  onRetry,
}: HomeStoreFilterProps) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const selected = useMemo(
    () => options.find((option) => option.id === value) ?? options[0],
    [options, value],
  );
  const label =
    selected?.label ?? (isLoading ? "매장 불러오는 중..." : "매장 선택");

  return (
    <View className="px-screen" style={{ paddingTop: SPACING.sm }}>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`매장 선택: ${label}`}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          alignSelf: "flex-start",
          paddingVertical: 10,
        }}
      >
        {isLoading && !selected ? (
          <ActivityIndicator size="small" color={COLORS.charcoal} />
        ) : (
          <Ionicons name="chevron-down" size={18} color={COLORS.charcoal} />
        )}
        <Text
          style={{
            ...pretendard(600),
            fontSize: TYPOGRAPHY.size.sm,
            color: COLORS.charcoal,
            ...(Platform.OS === "android" && { includeFontPadding: false }),
          }}
        >
          {label}
        </Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)" }}
        />

        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            paddingBottom: insets.bottom,
            backgroundColor: COLORS.white,
            borderTopLeftRadius: RADIUS.lg,
            borderTopRightRadius: RADIUS.lg,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              paddingHorizontal: SPACING.screen,
              paddingTop: SPACING.lg,
              paddingBottom: SPACING.md,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.lightGray,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                ...pretendard(700),
                fontSize: TYPOGRAPHY.size.lg,
                color: COLORS.text,
              }}
            >
              매장 선택
            </Text>
            <Pressable
              onPress={() => setOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="닫기"
              hitSlop={10}
            >
              <Ionicons name="close" size={22} color={COLORS.charcoal} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: SPACING.screen,
              paddingVertical: SPACING.md,
            }}
          >
            {options.length === 0 ? (
              <View style={{ paddingVertical: SPACING.md, gap: SPACING.sm }}>
                <Text
                  style={{
                    ...pretendard(500),
                    fontSize: TYPOGRAPHY.size.md,
                    color: COLORS.charcoal,
                  }}
                >
                  {isLoading
                    ? "매장 목록을 불러오는 중..."
                    : (errorMessage ?? "등록된 매장이 없습니다.")}
                </Text>
                {!isLoading && onRetry ? (
                  <Pressable
                    onPress={() => {
                      onRetry();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="매장 목록 다시 불러오기"
                  >
                    <Text
                      style={{
                        ...pretendard(600),
                        fontSize: TYPOGRAPHY.size.sm,
                        color: COLORS.main,
                      }}
                    >
                      다시 시도
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            {options.map((opt) => {
              const active = opt.id === value;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`매장 선택: ${opt.label}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: SPACING.md,
                  }}
                >
                  <Text
                    style={{
                      ...pretendard(active ? 700 : 500),
                      fontSize: TYPOGRAPHY.size.md,
                      color: COLORS.text,
                      ...(Platform.OS === "android" && {
                        includeFontPadding: false,
                      }),
                    }}
                  >
                    {opt.label}
                  </Text>
                  {active ? (
                    <Ionicons name="checkmark" size={22} color={COLORS.main} />
                  ) : (
                    <View style={{ width: 22, height: 22 }} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
