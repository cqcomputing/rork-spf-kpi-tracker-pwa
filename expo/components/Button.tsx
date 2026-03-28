import React from "react";
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Colors from "@/constants/colors";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: any;
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "primary" && styles.primaryButton,
        variant === "secondary" && styles.secondaryButton,
        variant === "outline" && styles.outlineButton,
        size === "small" && styles.smallButton,
        size === "large" && styles.largeButton,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? Colors.accent : Colors.secondary} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "primary" && styles.primaryText,
            variant === "secondary" && styles.secondaryText,
            variant === "outline" && styles.outlineText,
            size === "small" && styles.smallText,
            size === "large" && styles.largeText,
            disabled && styles.disabledText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
  },
  secondaryButton: {
    backgroundColor: Colors.gray.darkest,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 80,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 160,
  },
  disabledButton: {
    backgroundColor: Colors.gray.dark,
    borderColor: Colors.gray.dark,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  primaryText: {
    color: Colors.secondary,
  },
  secondaryText: {
    color: Colors.secondary,
  },
  outlineText: {
    color: Colors.accent,
  },
  smallText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    color: Colors.gray.medium,
  },
});

export default Button;