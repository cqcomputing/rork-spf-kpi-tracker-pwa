import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";

type LogoProps = {
  size?: "small" | "medium" | "large";
  variant?: "light" | "dark";
};

const Logo: React.FC<LogoProps> = ({ size = "medium", variant = "light" }) => {
  const getImageSize = () => {
    switch (size) {
      case "small":
        return { width: 40, height: 40 };
      case "large":
        return { width: 80, height: 80 };
      default:
        return { width: 60, height: 60 };
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source="https://emerald.stadiumpremierfitness.com.au/wp-content/uploads/2024/05/StadiumPremierFitness_LowRes_Icon-Logo_White-1.png"
        style={[styles.logo, getImageSize()]}
        contentFit="contain"
        transition={200}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    resizeMode: "contain",
  },
});

export default Logo;