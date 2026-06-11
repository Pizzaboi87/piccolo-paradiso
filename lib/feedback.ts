import { Alert, AlertButton } from "react-native";
import useFeedbackStore, { FeedbackButton } from "@/store/feedback.store";

const mapButtons = (buttons?: AlertButton[]): FeedbackButton[] | undefined => {
  if (!buttons || buttons.length === 0) return undefined;
  return buttons.map((button) => ({
    text: button.text || "OK",
    style: button.style,
    onPress: button.onPress,
  }));
};

export const installCustomAlert = () => {
  const originalAlert = Alert.alert;

  Alert.alert = (title, message, buttons, _options) => {
    useFeedbackStore.getState().showDialog({
      title: title || "Üzenet",
      message: message || "",
      buttons: mapButtons(buttons),
    });
  };

  return () => {
    Alert.alert = originalAlert;
  };
};

export const showSuccessToast = (message: string, title = "Siker") => {
  useFeedbackStore.getState().showToast({
    title,
    message,
    type: "success",
  });
};

export const showErrorToast = (message: string, title = "Hiba") => {
  useFeedbackStore.getState().showToast({
    title,
    message,
    type: "error",
  });
};

export const showInfoToast = (message: string, title?: string) => {
  useFeedbackStore.getState().showToast({
    title,
    message,
    type: "info",
  });
};
