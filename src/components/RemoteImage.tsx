import { Image, type ImageContentFit, type ImageStyle } from "expo-image";
import React from "react";
import type { StyleProp } from "react-native";

type Props = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
};

function RemoteImage({ uri, style, contentFit = "cover" }: Props) {
  if (!uri) {
    return null;
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={contentFit}
      cachePolicy="memory-disk"
      transition={150}
      recyclingKey={uri}
    />
  );
}

export default RemoteImage;
