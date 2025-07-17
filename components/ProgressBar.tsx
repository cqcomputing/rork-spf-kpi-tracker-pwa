import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

type ProgressBarProps = {
  progress: number; // 0-100
  label?: string;
  height?: number;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  height = 16,
  showPercentage = false,
  color = Colors.accent,
  backgroundColor = Colors.gray.darkest,
}) => {
  // Ensure progress is between 0-100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.progressContainer, { height, backgroundColor }]}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${clampedProgress}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.percentage}>{clampedProgress}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: Colors.secondary,
  },
  progressContainer: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBar: {
    borderRadius: 8,
  },
  percentage: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
    color: Colors.secondary,
  },
});

export default ProgressBar;