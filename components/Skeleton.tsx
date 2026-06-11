import { tokens } from "@/constants/tokens";
import { useEffect, useRef } from "react";
import { Animated, Image, View } from "react-native";
import { images } from "@/constants";

type SkeletonBlockProps = {
  width?: number | `${number}%` | "auto";
  height: number;
  borderRadius?: number;
  className?: string;
  backgroundColor?: string;
};

export const SkeletonBlock = ({
  width = "100%",
  height,
  borderRadius = 12,
  className,
  backgroundColor = tokens.color.borderStrong,
}: SkeletonBlockProps) => {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={className}
      accessible={false}
      style={{
        width,
        height,
        borderRadius,
        opacity,
        backgroundColor,
      }}
    />
  );
};

export const SkeletonItemCard = () => (
  <View className="surface-card w-full flex-row items-stretch p-4" accessible={false}>
    <View className="flex-1 pr-4">
      <SkeletonBlock height={18} width="70%" />
      <SkeletonBlock className="mt-2" height={16} width="40%" />
      <SkeletonBlock className="mt-3" height={14} width="95%" />
      <SkeletonBlock className="mt-2" height={14} width="80%" />
      <SkeletonBlock className="mt-2" height={14} width="60%" />
    </View>
    <View className="relative w-32 items-center justify-center">
      <SkeletonBlock
        width={112}
        height={112}
        borderRadius={16}
        backgroundColor={tokens.color.borderStrong}
      />
      <Image
        source={images.logo}
        className="absolute size-14 opacity-70"
        resizeMode="contain"
        accessible={false}
      />
    </View>
  </View>
);

export const SkeletonCustomizationRow = () => (
  <View className="surface-card px-4 py-4" accessible={false}>
    <View className="flex-row items-center justify-between">
      <SkeletonBlock height={18} width="55%" />
      <SkeletonBlock height={18} width={70} />
    </View>
    <SkeletonBlock className="mt-2" height={14} width="35%" />
  </View>
);
