import CustomButton from "@/components/CustomButton";
import { tokens } from "@/constants/tokens";
import { ActivityIndicator, Pressable, Text } from "react-native";

type FormActionsProps = {
  onSave: () => void;
  isSaving?: boolean;
  saveTitle?: string;
  onCancel: () => void;
  cancelTitle?: string;
  disableCancel?: boolean;
  destructiveTitle?: string;
  onDestructive?: () => void;
  isDestructiveLoading?: boolean;
  disableDestructive?: boolean;
};

export default function FormActions({
  onSave,
  isSaving = false,
  saveTitle = "Mentés",
  onCancel,
  cancelTitle = "Mégse",
  disableCancel = false,
  destructiveTitle,
  onDestructive,
  isDestructiveLoading = false,
  disableDestructive = false,
}: FormActionsProps) {
  return (
    <>
      <CustomButton title={saveTitle} onPress={onSave} isLoading={isSaving} />

      <Pressable
        className="mt-3 h-12 items-center justify-center rounded-2xl border border-border-strong bg-surface-card"
        onPress={onCancel}
        disabled={disableCancel}
      >
        <Text className="paragraph-semibold text-text-secondary">{cancelTitle}</Text>
      </Pressable>

      {destructiveTitle && onDestructive ? (
        <Pressable
          className="mt-3 h-12 items-center justify-center rounded-2xl border border-red-400 bg-red-50"
          onPress={onDestructive}
          disabled={disableDestructive}
        >
          {isDestructiveLoading ? (
            <ActivityIndicator size="small" color={tokens.color.danger} />
          ) : (
            <Text className="paragraph-semibold text-red-700">{destructiveTitle}</Text>
          )}
        </Pressable>
      ) : null}
    </>
  );
}
