import { useEffect, useRef, useState } from "react";
import { Keyboard } from "react-native";

const useKeyboardAwareScroll = () => {
  const scrollRef = useRef<{ scrollToEnd?: (options?: { animated?: boolean }) => void } | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Keyboard.addListener("keyboardDidShow", (event) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
    });

    const hideEvent = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showEvent.remove();
      hideEvent.remove();
    };
  }, []);

  const registerScrollRef = (
    ref: { scrollToEnd?: (options?: { animated?: boolean }) => void } | null
  ) => {
    scrollRef.current = ref;
  };

  const scrollToBottomOnFocus = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true });
    }, 100);
  };

  return {
    isKeyboardVisible,
    keyboardHeight,
    registerScrollRef,
    scrollToBottomOnFocus,
  };
};

export default useKeyboardAwareScroll;
