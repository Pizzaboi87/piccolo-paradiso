import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  TextInput,
} from "react-native";

type AppKeyboardAwareScrollViewProps = ScrollViewProps & {
  extraKeyboardSpace?: number;
  bottomOffset?: number;
};

const AppKeyboardAwareScrollView = forwardRef<ScrollView, AppKeyboardAwareScrollViewProps>(
  (
    {
      extraKeyboardSpace = 0,
      bottomOffset = 0,
      keyboardShouldPersistTaps = "always",
      keyboardDismissMode = "on-drag",
      contentContainerStyle,
      ...props
    },
    ref
  ) => {
    const scrollRef = useRef<ScrollView>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useImperativeHandle(ref, () => scrollRef.current as ScrollView);

    const scrollFocusedInputIntoView = useCallback((target?: number | null) => {
      const scrollNode = scrollRef.current;
      if (!scrollNode) return;

      const focusedInput =
        target ??
        (TextInput.State.currentlyFocusedInput?.())

      if (!focusedInput) return;

      setTimeout(() => {
        scrollNode.scrollResponderScrollNativeHandleToKeyboard(
          focusedInput,
          24 + bottomOffset,
          true
        );
      }, 40);
    }, [bottomOffset]);

    useEffect(() => {
      const onShow = Keyboard.addListener("keyboardDidShow", (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        requestAnimationFrame(() => scrollFocusedInputIntoView());
      });

      const onHide = Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardHeight(0);
      });

      return () => {
        onShow.remove();
        onHide.remove();
      };
    }, [scrollFocusedInputIntoView]);

    return (
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          keyboardDismissMode={keyboardDismissMode}
          contentContainerStyle={[
            contentContainerStyle,
            keyboardHeight > 0
              ? { paddingBottom: keyboardHeight + extraKeyboardSpace + bottomOffset }
              : null,
          ]}
          {...props}
        />
      </KeyboardAvoidingView>
    );
  }
);

AppKeyboardAwareScrollView.displayName = "AppKeyboardAwareScrollView";

export default AppKeyboardAwareScrollView;
