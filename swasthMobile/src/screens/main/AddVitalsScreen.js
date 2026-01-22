import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import {
  ArrowLeft,
  Heart,
  Activity,
  Thermometer,
  Weight,
  Droplet,
} from "lucide-react-native";

import { addHealthLog } from "../../config/api";
import { useAuth } from "../../hooks/useAuth";
import { useMember } from "../../hooks/useMember";

export default function AddVitals({ navigation }) {
  const { user } = useAuth();
  const { activeMember, isViewingFamily } = useMember();

  const [selectedVital, setSelectedVital] = useState("");
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const vitals = [
    { id: "heart-rate", label: "Heart Rate", icon: Heart, unit: "bpm", color: "#f43f5e" },
    { id: "blood-pressure", label: "Blood Pressure", icon: Activity, unit: "mmHg", dual: true, color: "#ef4444" },
    { id: "temperature", label: "Temperature", icon: Thermometer, unit: "°F", color: "#fb923c" },
    { id: "weight", label: "Weight", icon: Weight, unit: "kg", color: "#3b82f6" },
    { id: "glucose", label: "Blood Glucose", icon: Droplet, unit: "mg/dL", color: "#a855f7" },
  ];

  /* ---------------- SAVE ---------------- */

  const handleSave = async () => {
    // Safety check: Ensure user is available
    if (!user?.email) {
      Alert.alert("Error", "User not authenticated. Please log in again.");
      return;
    }

    // Validate vital selection and value
    if (!selectedVital || !value1.trim()) {
      Alert.alert("Error", "Please select a vital and enter value");
      return;
    }

    // Validate blood pressure requires both values
    if (selectedVital === "blood-pressure" && !value2.trim()) {
      Alert.alert("Error", "Please enter both systolic and diastolic values");
      return;
    }

    // Type mapping: UI IDs → Backend enum values
    const typeMap = {
      "heart-rate": "heartRate",
      "blood-pressure": "bloodPressure",
      temperature: "temperature",
      weight: "weight",
      glucose: "sugar",
    };

    const mappedType = typeMap[selectedVital];
    if (!mappedType) {
      Alert.alert("Error", "Invalid vital type selected");
      return;
    }

    // Build payload exactly as backend expects
    const payload = {
      userEmail: user.email,
      type: mappedType,
      value:
        selectedVital === "blood-pressure"
          ? `${value1.trim()}/${value2.trim()}`
          : value1.trim(),
      notes: notes.trim() || "",
      memberId: activeMember.memberId || null,
    };

    try {
      setSaving(true);

      await addHealthLog(payload);

      // Reset form immediately
      setSelectedVital("");
      setValue1("");
      setValue2("");
      setNotes("");

      // Show success alert, then navigate back
      Alert.alert("Saved", "Vital recorded successfully", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (err) {
      const errorMessage = err?.message || "Failed to save vital. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const selectedVitalData = vitals.find((v) => v.id === selectedVital);

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={{ backgroundColor: "white", borderBottomWidth: 1, borderColor: "#e5e7eb" }}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text style={{ marginLeft: 8, fontSize: 20, color: "#111827" }}>
              Add Vitals
            </Text>
            {isViewingFamily && (
              <Text style={{ marginLeft: 8, fontSize: 14, color: "#3b82f6" }}>
                for {activeMember.name}
              </Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Select Vital */}
        <Text style={{ marginBottom: 12, fontSize: 16, color: "#111827" }}>
          Select Vital
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {vitals.map((v) => {
            const Icon = v.icon;
            const isSelected = selectedVital === v.id;

            return (
              <TouchableOpacity
                key={v.id}
                onPress={() => setSelectedVital(v.id)}
                style={{
                  width: "48%",
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: isSelected ? "#3b82f6" : "#e5e7eb",
                  backgroundColor: isSelected ? "#eff6ff" : "white",
                  borderRadius: 16,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: v.color,
                    padding: 8,
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                >
                  <Icon size={20} color="white" />
                </View>
                <Text style={{ color: isSelected ? "#2563eb" : "#111827" }}>
                  {v.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Inputs */}
        {selectedVital && (
          <View style={{ marginTop: 20, backgroundColor: "white", padding: 20, borderRadius: 16 }}>
            {selectedVitalData?.dual ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ width: "48%" }}>
                  <Text style={{ marginBottom: 6 }}>Systolic</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={value1}
                    onChangeText={setValue1}
                    placeholder="120"
                    style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
                  />
                </View>

                <View style={{ width: "48%" }}>
                  <Text style={{ marginBottom: 6 }}>Diastolic</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={value2}
                    onChangeText={setValue2}
                    placeholder="80"
                    style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
                  />
                </View>
              </View>
            ) : (
              <View>
                <Text style={{ marginBottom: 6 }}>Value</Text>
                <TextInput
                  keyboardType="numeric"
                  value={value1}
                  onChangeText={setValue1}
                  placeholder="Enter value"
                  style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
                />
              </View>
            )}

            <View style={{ marginTop: 12 }}>
              <Text style={{ marginBottom: 6 }}>Notes</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional notes..."
                multiline
                style={{ borderWidth: 1, padding: 12, borderRadius: 10, height: 80 }}
              />
            </View>
          </View>
        )}

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            marginTop: 24,
            backgroundColor: saving ? "#93c5fd" : "#3b82f6",
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>
            {saving ? "Saving..." : "Save Vital"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
