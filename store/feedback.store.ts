import { create } from "zustand";

export type FeedbackButtonStyle = "default" | "cancel" | "destructive";

export type FeedbackButton = {
  text: string;
  style?: FeedbackButtonStyle;
  onPress?: () => void;
};

type ToastType = "success" | "error" | "info";

type ToastState = {
  visible: boolean;
  title?: string;
  message: string;
  type: ToastType;
};

type DialogState = {
  visible: boolean;
  title: string;
  message?: string;
  buttons: FeedbackButton[];
};

type FeedbackStore = {
  toast: ToastState;
  dialog: DialogState;
  showToast: (payload: {
    title?: string;
    message: string;
    type?: ToastType;
  }) => void;
  hideToast: () => void;
  showDialog: (payload: {
    title: string;
    message?: string;
    buttons?: FeedbackButton[];
  }) => void;
  hideDialog: () => void;
};

const defaultDialog: DialogState = {
  visible: false,
  title: "",
  message: "",
  buttons: [],
};

const defaultToast: ToastState = {
  visible: false,
  title: "",
  message: "",
  type: "info",
};

const useFeedbackStore = create<FeedbackStore>((set) => ({
  toast: defaultToast,
  dialog: defaultDialog,

  showToast: ({ title, message, type = "info" }) =>
    set({
      toast: {
        visible: true,
        title,
        message,
        type,
      },
    }),

  hideToast: () =>
    set((state) => ({
      toast: { ...state.toast, visible: false },
    })),

  showDialog: ({ title, message, buttons }) =>
    set({
      dialog: {
        visible: true,
        title,
        message,
        buttons:
          buttons && buttons.length > 0
            ? buttons
            : [{ text: "OK", style: "default" }],
      },
    }),

  hideDialog: () =>
    set({
      dialog: defaultDialog,
    }),
}));

export default useFeedbackStore;
