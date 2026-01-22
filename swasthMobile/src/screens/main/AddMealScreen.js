import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { HeaderBar } from "../../design-system/HeaderBar";
import { FigmaButton } from "../../design-system/FigmaButton";
import { useAuth } from "../../hooks/useAuth";
import { addMeal } from "../../config/api";
import figmaTokens from "../../design-system/figmaTokens";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function AddMealScreen({ navigation }) {
  const { user } = useAuth();

  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);

  const mealTypes = [
    { key: "breakfast", label: "Breakfast", icon: "coffee" },
    { key: "lunch", label: "Lunch", icon: "silverware-fork-knife" },
    { key: "snack", label: "Snack", icon: "food-apple" },
    { key: "dinner", label: "Dinner", icon: "moon-waning-crescent" },
  ];

  const getTodayDate = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const validate = () => {
    if (!user?.email) {
      Alert.alert("Error", "User not logged in.");
      return false;
    }
    if (!type) {
      Alert.alert("Validation", "Please select a meal type.");
      return false;
    }
    if (!name.trim()) {
      Alert.alert("Validation", "Please enter meal name.");
      return false;
    }
    const c = Number(calories);
    if (!calories || Number.isNaN(c) || c <= 0) {
      Alert.alert("Validation", "Please enter valid calories.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const payload = {
      userEmail: user.email,
      type,
      name: name.trim(),
      calories: Number(calories),
      time: time.trim() || "",
    };
    setSaving(true);
    try {
      await addMeal(payload);
      navigation.goBack();
    } catch (err) {
      console.error("Add meal error:", err);
      Alert.alert("Error", err?.message || "Unable to save meal. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <HeaderBar title="Add Meal" onBack={() => navigation.goBack()} backgroundColor={figmaTokens.colors.white} />

        <View style={styles.content}>
          <Text style={styles.label}>Meal Type</Text>
          <View style={styles.typeRow}>
            {mealTypes.map((mt) => {
              const selected = type === mt.key;
              return (
                <TouchableOpacity
                  key={mt.key}
                  style={[styles.typeChip, selected && styles.typeChipSelected]}
                  onPress={() => setType(mt.key)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={mt.icon}
                    size={18}
                    color={selected ? figmaTokens.colors.white : figmaTokens.colors.gray700}
                  />
                  <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>{mt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Meal Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Meal name"
            placeholderTextColor={figmaTokens.colors.gray400}
            style={styles.input}
            returnKeyType="done"
          />

          <Text style={styles.label}>Calories</Text>
          <TextInput
            value={calories}
            onChangeText={(t) => setCalories(t.replace(/[^0-9]/g, ""))}
            placeholder="Calories"
            placeholderTextColor={figmaTokens.colors.gray400}
            style={styles.input}
            keyboardType="numeric"
            returnKeyType="done"
          />

          <Text style={styles.label}>Time</Text>
          <TextInput
            value={time}
            onChangeText={setTime}
            placeholder="8:00 AM"
            placeholderTextColor={figmaTokens.colors.gray400}
            style={styles.input}
            returnKeyType="done"
          />

          <View style={styles.saveRow}>
            <FigmaButton
              title={saving ? "Saving..." : "Save Meal"}
              onPress={handleSave}
              disabled={saving}
              fullWidth
            />
            {saving && <ActivityIndicator style={{ marginTop: 12 }} color={figmaTokens.colors.green500} />}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: figmaTokens.colors.gray50,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: figmaTokens.spacing["6"],
  },
  label: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray900,
    marginBottom: figmaTokens.spacing["2"],
    marginTop: figmaTokens.spacing["4"],
  },
  typeRow: {
    flexDirection: "row",
    gap: figmaTokens.spacing["3"],
    flexWrap: "wrap",
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: figmaTokens.spacing["2"],
    backgroundColor: figmaTokens.colors.white,
    paddingHorizontal: figmaTokens.spacing["4"],
    paddingVertical: figmaTokens.spacing["2"],
    borderRadius: figmaTokens.borderRadius.xl,
    ...figmaTokens.shadows.sm,
  },
  typeChipSelected: {
    backgroundColor: figmaTokens.colors.green500,
  },
  typeChipText: {
    color: figmaTokens.colors.gray700,
    fontSize: figmaTokens.typography.fontSize.base,
  },
  typeChipTextSelected: {
    color: figmaTokens.colors.white,
  },
  input: {
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius["2xl"],
    paddingHorizontal: figmaTokens.spacing["4"],
    paddingVertical: figmaTokens.spacing["3"],
    ...figmaTokens.shadows.sm,
    color: figmaTokens.colors.gray900,
  },
  saveRow: {
    marginTop: figmaTokens.spacing["6"],
  },
});
