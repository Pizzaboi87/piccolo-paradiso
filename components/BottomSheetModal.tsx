import { tokens } from "@/constants/tokens";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, Text, View } from "react-native";

type BottomSheetModalProps = {
  visible: boolean;
  onClose: () => void;
  onAfterClose?: () => void;
  title: string;
  mandatoryLabel?: string;
  children: ReactNode;
};

const BottomSheetModal = ({
  visible,
  onClose,
  onAfterClose,
  title,
  mandatoryLabel,
  children,
}: BottomSheetModalProps) => {
  const [mounted, setMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(520)).current;
  const isClosingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      isClosingRef.current = false;
      setMounted(true);
      translateY.setValue(520);

      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    if (!mounted || isClosingRef.current) return;

    isClosingRef.current = true;
    Animated.timing(translateY, {
      toValue: 520,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setMounted(false);
      isClosingRef.current = false;
      onAfterClose?.();
    });
  }, [visible, mounted, onAfterClose, translateY]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: tokens.color.overlay }}>
        <Pressable className="flex-1" onPress={onClose} />

        <Animated.View
          className="absolute bottom-0 left-0 right-0 max-h-[70%] rounded-t-3xl bg-surface-card px-5 pb-8 pt-5"
          style={{ transform: [{ translateY }] }}
        >
          <View className="absolute -top-16 left-0 right-0 z-10 items-center">
            <Pressable
              className="size-14 items-center justify-center rounded-full bg-surface-card"
              style={{
                shadowColor: tokens.color.textPrimary,
                shadowOpacity: 0.15,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Bezárás"
              accessibilityHint="Bezárja az alsó felugró panelt."
            >
              <Text className="text-4xl font-quicksand-bold leading-none text-text-primary">×</Text>
            </Pressable>
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <Text className="h3-bold">{title}</Text>
          </View>

          {mandatoryLabel ? <Text className="mb-3 body-medium text-brand-primary">{mandatoryLabel}</Text> : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default BottomSheetModal;
