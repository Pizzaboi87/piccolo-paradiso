import { tokens } from "@/constants/tokens";
import useFeedbackStore, { FeedbackButton } from "@/store/feedback.store";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FeedbackHost = () => {
  const insets = useSafeAreaInsets();
  const toast = useFeedbackStore((state) => state.toast);
  const dialog = useFeedbackStore((state) => state.dialog);
  const hideToast = useFeedbackStore((state) => state.hideToast);
  const hideDialog = useFeedbackStore((state) => state.hideDialog);

  const toastProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast.visible) return;

    Animated.sequence([
      Animated.timing(toastProgress, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(toastProgress, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast();
    });
  }, [toast.visible, toastProgress, hideToast]);

  const toastColor = useMemo(() => {
    if (toast.type === "success") return "#0EA267";
    if (toast.type === "error") return tokens.color.danger;
    return tokens.color.textPrimary;
  }, [toast.type]);

  const toastTranslateY = toastProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-36, 0],
  });

  const toastOpacity = toastProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const onDialogButtonPress = (button: FeedbackButton) => {
    hideDialog();
    button.onPress?.();
  };

  return (
    <>
      {toast.visible ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            top: insets.top + 10,
            zIndex: 9999,
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslateY }],
          }}
        >
          <View
            className="rounded-2xl border bg-surface-card px-4 py-3"
            style={{
              borderColor: `${toastColor}55`,
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            {toast.title ? (
              <Text className="paragraph-semibold" style={{ color: toastColor }}>
                {toast.title}
              </Text>
            ) : null}
            <Text className="body-medium mt-1 text-text-primary">{toast.message}</Text>
          </View>
        </Animated.View>
      ) : null}

      <Modal
        visible={dialog.visible}
        transparent
        animationType="fade"
        onRequestClose={hideDialog}
      >
        <Pressable
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: "rgba(16,18,20,0.45)" }}
          onPress={hideDialog}
        >
          <Pressable
            className="w-full max-w-[430px] rounded-3xl border border-border-subtle bg-surface-card p-5"
            onPress={() => {}}
          >
            <Text className="h3-bold">{dialog.title}</Text>
            {dialog.message ? (
              <Text className="body-large mt-2 text-text-secondary">{dialog.message}</Text>
            ) : null}

            <View className="mt-5 gap-2">
              {dialog.buttons.map((button, index) => {
                const isDestructive = button.style === "destructive";
                const isCancel = button.style === "cancel";

                return (
                  <Pressable
                    key={`${button.text}-${index}`}
                    className="h-12 items-center justify-center rounded-2xl border"
                    style={{
                      borderColor: isDestructive
                        ? "#F2B4B4"
                        : isCancel
                        ? tokens.color.borderStrong
                        : `${tokens.color.brandPrimary}66`,
                      backgroundColor: isDestructive
                        ? "#FCEEEE"
                        : isCancel
                        ? tokens.color.surfaceCard
                        : `${tokens.color.brandPrimary}15`,
                    }}
                    onPress={() => onDialogButtonPress(button)}
                    accessibilityRole="button"
                    accessibilityLabel={button.text}
                  >
                    <Text
                      className="paragraph-semibold"
                      style={{
                        color: isDestructive
                          ? "#C92A2A"
                          : isCancel
                          ? tokens.color.textPrimary
                          : tokens.color.brandPrimary,
                      }}
                    >
                      {button.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default FeedbackHost;
