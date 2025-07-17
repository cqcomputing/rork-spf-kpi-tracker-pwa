import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from "react-native";
import { Info, Plus, Minus } from "lucide-react-native";
import Colors from "@/constants/colors";
import { KpiAction as KpiActionType } from "@/constants/kpis";
import Button from "./Button";

type KpiActionProps = {
  action: KpiActionType;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
};

const KpiAction: React.FC<KpiActionProps> = ({ action, quantity, onQuantityChange }) => {
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  const handleIncrement = () => {
    onQuantityChange(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleTextChange = (text: string) => {
    const num = parseInt(text) || 0;
    if (num >= 0) {
      onQuantityChange(num);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.actionRow}>
        <View style={styles.actionInfo}>
          <Text style={styles.actionName}>{action.name}</Text>
          <Text style={styles.actionPoints}>{action.points} points each</Text>
        </View>
        
        <View style={styles.rightContainer}>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setInfoModalVisible(true)}
          >
            <Info size={18} color={Colors.gray.light} />
          </TouchableOpacity>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity === 0 && styles.quantityButtonDisabled]}
              onPress={handleDecrement}
              disabled={quantity === 0}
            >
              <Minus size={14} color={quantity === 0 ? Colors.gray.medium : Colors.secondary} />
            </TouchableOpacity>
            
            <TextInput
              style={styles.quantityInput}
              value={quantity.toString()}
              onChangeText={handleTextChange}
              keyboardType="numeric"
              textAlign="center"
              selectTextOnFocus
            />
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleIncrement}
            >
              <Plus size={14} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={infoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{action.name}</Text>
            <Text style={styles.modalPoints}>{action.points} points each</Text>
            <Text style={styles.modalDescription}>{action.description}</Text>
            <Button
              title="Close"
              onPress={() => setInfoModalVisible(false)}
              style={styles.closeButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.darker,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionInfo: {
    flex: 1,
    marginRight: 16,
  },
  actionName: {
    fontSize: 15,
    color: Colors.secondary,
    fontWeight: "600",
    marginBottom: 2,
  },
  actionPoints: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: "500",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoButton: {
    padding: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonDisabled: {
    backgroundColor: Colors.gray.dark,
  },
  quantityInput: {
    width: 40,
    height: 32,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.secondary,
    marginBottom: 8,
  },
  modalPoints: {
    fontSize: 16,
    color: Colors.accent,
    fontWeight: "600",
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 15,
    color: Colors.secondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  closeButton: {
    alignSelf: "center",
  },
});

export default KpiAction;