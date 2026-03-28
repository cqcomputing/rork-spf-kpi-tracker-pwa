import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ChevronDown, ChevronRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import { KpiCategory as KpiCategoryType } from "@/constants/kpis";

type KpiCategoryProps = {
  category: KpiCategoryType;
  expanded?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
};

const KpiCategory: React.FC<KpiCategoryProps> = ({
  category,
  expanded = false,
  onToggle,
  children,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <View style={[styles.categoryIndicator, { backgroundColor: category.color }]} />
            <Text style={styles.title}>{category.name}</Text>
          </View>
          
          <View style={styles.iconContainer}>
            {expanded ? (
              <ChevronDown color={Colors.secondary} size={20} />
            ) : (
              <ChevronRight color={Colors.secondary} size={20} />
            )}
          </View>
        </View>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    backgroundColor: Colors.gray.darkest,
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    padding: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.secondary,
    flex: 1,
  },
  iconContainer: {
    padding: 4,
  },
  content: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});

export default KpiCategory;