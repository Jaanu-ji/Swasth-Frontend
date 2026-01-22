// ✅ Emergency Card Screen - FULLY EDITABLE with Backend
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import {
  ArrowLeft,
  Phone,
  AlertCircle,
  User,
  Heart,
  Pill,
  Edit,
  X,
  Plus,
  Trash2,
  Save,
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { getEmergencyCard, createEmergencyCard, updateEmergencyCard } from "../../config/api";
import figmaTokens from "../../design-system/figmaTokens";

export default function EmergencyCard({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emergencyData, setEmergencyData] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    bloodType: "",
    height: "",
    weight: "",
    contacts: [{ name: "", relationship: "", phone: "" }],
    allergies: [""],
    medicalConditions: [""],
    medications: [""],
  });

  const loadEmergencyCard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmergencyCard(user?.email);
      setEmergencyData(data);
    } catch (err) {
      setError(err.message || "Failed to load emergency card");
      console.error("Emergency card error:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (user?.email) {
        loadEmergencyCard();
      }
    }, [user?.email])
  );

  const openEditModal = () => {
    if (emergencyData) {
      setFormData({
        name: emergencyData.name || "",
        age: emergencyData.age?.toString() || "",
        bloodType: emergencyData.bloodType || "",
        height: emergencyData.height?.toString() || "",
        weight: emergencyData.weight?.toString() || "",
        contacts: emergencyData.emergencyContacts?.length > 0
          ? emergencyData.emergencyContacts
          : [{ name: "", relationship: "", phone: "" }],
        allergies: emergencyData.allergies?.length > 0 ? emergencyData.allergies : [""],
        medicalConditions: emergencyData.medicalConditions?.length > 0 ? emergencyData.medicalConditions : [""],
        medications: emergencyData.currentMedications?.length > 0 ? emergencyData.currentMedications : [""],
      });
    } else {
      setFormData({
        name: user?.name || "",
        age: user?.age?.toString() || "",
        bloodType: "",
        height: user?.height?.toString() || "",
        weight: user?.weight?.toString() || "",
        contacts: [{ name: "", relationship: "", phone: "" }],
        allergies: [""],
        medicalConditions: [""],
        medications: [""],
      });
    }
    setIsEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        Alert.alert("Error", "Name is required");
        return;
      }

      setSaving(true);

      const cleanData = {
        name: formData.name.trim(),
        age: formData.age ? Number(formData.age) : undefined,
        bloodType: formData.bloodType.trim() || undefined,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        emergencyContacts: formData.contacts
          .filter(c => c.name.trim() && c.phone.trim())
          .map(c => ({
            name: c.name.trim(),
            relationship: c.relationship.trim() || "Other",
            phone: c.phone.trim(),
          })),
        allergies: formData.allergies.filter(a => a.trim()),
        medicalConditions: formData.medicalConditions.filter(m => m.trim()),
        currentMedications: formData.medications.filter(m => m.trim()),
      };

      if (emergencyData) {
        await updateEmergencyCard(user?.email, cleanData);
        Alert.alert("Success", "Emergency card updated successfully!");
      } else {
        await createEmergencyCard(user?.email, cleanData);
        Alert.alert("Success", "Emergency card created successfully!");
      }

      setIsEditModalVisible(false);
      loadEmergencyCard();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to save emergency card");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, { name: "", relationship: "", phone: "" }],
    });
  };

  const removeContact = (index) => {
    const newContacts = formData.contacts.filter((_, i) => i !== index);
    setFormData({ ...formData, contacts: newContacts.length > 0 ? newContacts : [{ name: "", relationship: "", phone: "" }] });
  };

  const updateContact = (index, field, value) => {
    const newContacts = [...formData.contacts];
    newContacts[index][field] = value;
    setFormData({ ...formData, contacts: newContacts });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray.length > 0 ? newArray : [""] });
  };

  const updateArrayItem = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: figmaTokens.colors.gray900 }}>
        <View style={{ paddingTop: 60, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={figmaTokens.colors.white} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={figmaTokens.colors.red500} />
          <Text style={{ color: figmaTokens.colors.gray400, marginTop: 16, fontSize: 16 }}>
            Loading emergency card...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: figmaTokens.colors.gray900 }}>
        <View style={{ paddingTop: 60, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={figmaTokens.colors.white} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
          <AlertCircle size={48} color={figmaTokens.colors.red500} />
          <Text style={{ color: figmaTokens.colors.white, fontSize: 18, fontWeight: "600", marginTop: 16 }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={loadEmergencyCard}
            style={{
              backgroundColor: figmaTokens.colors.red500,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 12,
              marginTop: 20,
            }}
          >
            <Text style={{ color: figmaTokens.colors.white, fontSize: 16, fontWeight: "600" }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderEditModal = () => (
    <Modal
      visible={isEditModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View style={{
          flex: 1,
          backgroundColor: figmaTokens.colors.gray900,
          marginTop: 50,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: figmaTokens.colors.gray800,
          }}>
            <Text style={{ color: figmaTokens.colors.white, fontSize: 20, fontWeight: "700" }}>
              {emergencyData ? "Edit Emergency Card" : "Create Emergency Card"}
            </Text>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <X size={24} color={figmaTokens.colors.gray400} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            <Text style={{ color: figmaTokens.colors.white, fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
              Personal Information
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14, marginBottom: 6 }}>Full Name *</Text>
              <TextInput
                value={formData.name}
                onChangeText={(val) => setFormData({ ...formData, name: val })}
                placeholder="Enter full name"
                placeholderTextColor={figmaTokens.colors.gray600}
                style={{
                  backgroundColor: figmaTokens.colors.gray800,
                  color: figmaTokens.colors.white,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  fontSize: 16,
                }}
              />
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14, marginBottom: 6 }}>Age</Text>
                <TextInput
                  value={formData.age}
                  onChangeText={(val) => setFormData({ ...formData, age: val })}
                  placeholder="25"
                  placeholderTextColor={figmaTokens.colors.gray600}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: figmaTokens.colors.gray800,
                    color: figmaTokens.colors.white,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    fontSize: 16,
                  }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14, marginBottom: 6 }}>Blood Type</Text>
                <TextInput
                  value={formData.bloodType}
                  onChangeText={(val) => setFormData({ ...formData, bloodType: val })}
                  placeholder="A+"
                  placeholderTextColor={figmaTokens.colors.gray600}
                  style={{
                    backgroundColor: figmaTokens.colors.gray800,
                    color: figmaTokens.colors.white,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    fontSize: 16,
                  }}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14, marginBottom: 6 }}>Height (cm)</Text>
                <TextInput
                  value={formData.height}
                  onChangeText={(val) => setFormData({ ...formData, height: val })}
                  placeholder="170"
                  placeholderTextColor={figmaTokens.colors.gray600}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: figmaTokens.colors.gray800,
                    color: figmaTokens.colors.white,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    fontSize: 16,
                  }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14, marginBottom: 6 }}>Weight (kg)</Text>
                <TextInput
                  value={formData.weight}
                  onChangeText={(val) => setFormData({ ...formData, weight: val })}
                  placeholder="70"
                  placeholderTextColor={figmaTokens.colors.gray600}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: figmaTokens.colors.gray800,
                    color: figmaTokens.colors.white,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    fontSize: 16,
                  }}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: figmaTokens.colors.white, fontSize: 18, fontWeight: "600" }}>
                Emergency Contacts
              </Text>
              <TouchableOpacity onPress={addContact} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Plus size={20} color={figmaTokens.colors.red500} />
                <Text style={{ color: figmaTokens.colors.red500, fontSize: 14, fontWeight: "600" }}>Add</Text>
              </TouchableOpacity>
            </View>

            {formData.contacts.map((contact, index) => (
              <View key={index} style={{
                backgroundColor: figmaTokens.colors.gray800,
                padding: 16,
                borderRadius: 12,
                marginBottom: 12
              }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14, fontWeight: "600" }}>
                    Contact {index + 1}
                  </Text>
                  {formData.contacts.length > 1 && (
                    <TouchableOpacity onPress={() => removeContact(index)}>
                      <Trash2 size={18} color={figmaTokens.colors.red500} />
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  value={contact.name}
                  onChangeText={(val) => updateContact(index, "name", val)}
                  placeholder="Contact name"
                  placeholderTextColor={figmaTokens.colors.gray600}
                  style={{
                    backgroundColor: figmaTokens.colors.gray900,
                    color: figmaTokens.colors.white,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 8,
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                />

                <TextInput
                  value={contact.relationship}
                  onChangeText={(val) => updateContact(index, "relationship", val)}
                  placeholder="Relationship (e.g., Father, Friend)"
                  placeholderTextColor={figmaTokens.colors.gray600}
                  style={{
                    backgroundColor: figmaTokens.colors.gray900,
                    color: figmaTokens.colors.white,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 8,
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                />

                <TextInput
                  value={contact.phone}
                  onChangeText={(val) => updateContact(index, "phone", val)}
                  placeholder="Phone number"
                  placeholderTextColor={figmaTokens.colors.gray600}
                  keyboardType="phone-pad"
                  style={{
                    backgroundColor: figmaTokens.colors.gray900,
                    color: figmaTokens.colors.white,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
              </View>
            ))}

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 12 }}>
              <Text style={{ color: figmaTokens.colors.white, fontSize: 18, fontWeight: "600" }}>
                Allergies
              </Text>
              <TouchableOpacity onPress={() => addArrayItem("allergies")} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Plus size={20} color={figmaTokens.colors.red500} />
                <Text style={{ color: figmaTokens.colors.red500, fontSize: 14, fontWeight: "600" }}>Add</Text>
              </TouchableOpacity>
            </View>

            {formData.allergies.map((allergy, index) => (
              <View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <TextInput
                  value={allergy}
                  onChangeText={(val) => updateArrayItem("allergies", index, val)}
                  placeholder="Enter allergy"
                  placeholderTextColor={figmaTokens.colors.gray600}
                  style={{
                    flex: 1,
                    backgroundColor: figmaTokens.colors.gray800,
                    color: figmaTokens.colors.white,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    fontSize: 16,
                  }}
                />
                {formData.allergies.length > 1 && (
                  <TouchableOpacity onPress={() => removeArrayItem("allergies", index)}>
                    <Trash2 size={20} color={figmaTokens.colors.red500} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 12 }}>
              <Text style={{ color: figmaTokens.colors.white, fontSize: 18, fontWeight: "600" }}>
                Medical Conditions
              </Text>
              <TouchableOpacity onPress={() => addArrayItem("medicalConditions")} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Plus size={20} color={figmaTokens.colors.red500} />
                <Text style={{ color: figmaTokens.colors.red500, fontSize: 14, fontWeight: "600" }}>Add</Text>
              </TouchableOpacity>
            </View>

            {formData.medicalConditions.map((condition, index) => (
              <View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <TextInput
                  value={condition}
                  onChangeText={(val) => updateArrayItem("medicalConditions", index, val)}
                  placeholder="Enter medical condition"
                  placeholderTextColor={figmaTokens.colors.gray600}
                  style={{
                    flex: 1,
                    backgroundColor: figmaTokens.colors.gray800,
                    color: figmaTokens.colors.white,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    fontSize: 16,
                  }}
                />
                {formData.medicalConditions.length > 1 && (
                  <TouchableOpacity onPress={() => removeArrayItem("medicalConditions", index)}>
                    <Trash2 size={20} color={figmaTokens.colors.red500} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 12 }}>
              <Text style={{ color: figmaTokens.colors.white, fontSize: 18, fontWeight: "600" }}>
                Current Medications
              </Text>
              <TouchableOpacity onPress={() => addArrayItem("medications")} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Plus size={20} color={figmaTokens.colors.red500} />
                <Text style={{ color: figmaTokens.colors.red500, fontSize: 14, fontWeight: "600" }}>Add</Text>
              </TouchableOpacity>
            </View>

            {formData.medications.map((medication, index) => (
              <View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <TextInput
                  value={medication}
                  onChangeText={(val) => updateArrayItem("medications", index, val)}
                  placeholder="Enter medication"
                  placeholderTextColor={figmaTokens.colors.gray600}
                  style={{
                    flex: 1,
                    backgroundColor: figmaTokens.colors.gray800,
                    color: figmaTokens.colors.white,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    fontSize: 16,
                  }}
                />
                {formData.medications.length > 1 && (
                  <TouchableOpacity onPress={() => removeArrayItem("medications", index)}>
                    <Trash2 size={20} color={figmaTokens.colors.red500} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: figmaTokens.colors.red500,
                paddingVertical: 16,
                borderRadius: 12,
                marginTop: 24,
                marginBottom: 40,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
              }}
            >
              {saving ? (
                <ActivityIndicator size="small" color={figmaTokens.colors.white} />
              ) : (
                <>
                  <Save size={20} color={figmaTokens.colors.white} />
                  <Text style={{ color: figmaTokens.colors.white, fontSize: 16, fontWeight: "700" }}>
                    Save Emergency Card
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (!emergencyData) {
    return (
      <View style={{ flex: 1, backgroundColor: figmaTokens.colors.gray900 }}>
        <View style={{ paddingTop: 60, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={figmaTokens.colors.white} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
          <AlertCircle size={48} color={figmaTokens.colors.gray500} />
          <Text style={{ color: figmaTokens.colors.white, fontSize: 18, fontWeight: "600", marginTop: 16, textAlign: "center" }}>
            No Emergency Card Found
          </Text>
          <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14, marginTop: 8, textAlign: "center" }}>
            Create your emergency card to help first responders
          </Text>
          <TouchableOpacity
            onPress={openEditModal}
            style={{
              backgroundColor: figmaTokens.colors.red500,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 12,
              marginTop: 20,
            }}
          >
            <Text style={{ color: figmaTokens.colors.white, fontSize: 16, fontWeight: "600" }}>
              Create Emergency Card
            </Text>
          </TouchableOpacity>
        </View>
        {renderEditModal()}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: figmaTokens.colors.gray900 }}>
      <View style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={figmaTokens.colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={openEditModal} style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: figmaTokens.colors.red500,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          }}>
            <Edit size={18} color={figmaTokens.colors.white} />
            <Text style={{ color: figmaTokens.colors.white, fontSize: 14, fontWeight: "600" }}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View style={{
          backgroundColor: figmaTokens.colors.red500,
          borderRadius: 20,
          padding: 20,
          marginBottom: 20,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <AlertCircle size={32} color={figmaTokens.colors.white} />
            <Text style={{ color: figmaTokens.colors.white, fontSize: 24, fontWeight: "700" }}>
              Emergency Card
            </Text>
          </View>
          <Text style={{ color: figmaTokens.colors.white, fontSize: 14, opacity: 0.9 }}>
            In case of emergency, call any contact below
          </Text>
        </View>

        <View style={{
          backgroundColor: figmaTokens.colors.gray800,
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <User size={24} color={figmaTokens.colors.red500} />
            <Text style={{ color: figmaTokens.colors.white, fontSize: 18, fontWeight: "700" }}>
              Personal Information
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14 }}>Name</Text>
              <Text style={{ color: figmaTokens.colors.white, fontSize: 14, fontWeight: "600" }}>
                {emergencyData.name}
              </Text>
            </View>
            {emergencyData.age && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14 }}>Age</Text>
                <Text style={{ color: figmaTokens.colors.white, fontSize: 14, fontWeight: "600" }}>
                  {emergencyData.age} years
                </Text>
              </View>
            )}
            {emergencyData.bloodType && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14 }}>Blood Type</Text>
                <Text style={{ color: figmaTokens.colors.white, fontSize: 14, fontWeight: "600" }}>
                  {emergencyData.bloodType}
                </Text>
              </View>
            )}
            {emergencyData.height && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14 }}>Height</Text>
                <Text style={{ color: figmaTokens.colors.white, fontSize: 14, fontWeight: "600" }}>
                  {emergencyData.height} cm
                </Text>
              </View>
            )}
            {emergencyData.weight && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14 }}>Weight</Text>
                <Text style={{ color: figmaTokens.colors.white, fontSize: 14, fontWeight: "600" }}>
                  {emergencyData.weight} kg
                </Text>
              </View>
            )}
          </View>
        </View>

        {emergencyData.emergencyContacts && emergencyData.emergencyContacts.length > 0 && (
          <View style={{
            backgroundColor: figmaTokens.colors.gray800,
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Phone size={24} color={figmaTokens.colors.red500} />
              <Text style={{ color: figmaTokens.colors.white, fontSize: 18, fontWeight: "700" }}>
                Emergency Contacts
              </Text>
            </View>

            {emergencyData.emergencyContacts.map((contact, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                style={{
                  backgroundColor: figmaTokens.colors.gray900,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: figmaTokens.colors.white, fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
                      {contact.name}
                    </Text>
                    <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14, marginBottom: 4 }}>
                      {contact.relationship}
                    </Text>
                    <Text style={{ color: figmaTokens.colors.red500, fontSize: 14, fontWeight: "600" }}>
                      {contact.phone}
                    </Text>
                  </View>
                  <Phone size={20} color={figmaTokens.colors.red500} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{
          backgroundColor: figmaTokens.colors.gray800,
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Heart size={24} color={figmaTokens.colors.red500} />
            <Text style={{ color: figmaTokens.colors.white, fontSize: 18, fontWeight: "700" }}>
              Medical Information
            </Text>
          </View>

          {emergencyData.allergies && emergencyData.allergies.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14, marginBottom: 8 }}>
                Allergies
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {emergencyData.allergies.map((allergy, idx) => (
                  <View key={idx} style={{
                    backgroundColor: figmaTokens.colors.red500 + "20",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}>
                    <Text style={{ color: figmaTokens.colors.red500, fontSize: 13, fontWeight: "600" }}>
                      {allergy}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {emergencyData.medicalConditions && emergencyData.medicalConditions.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14, marginBottom: 8 }}>
                Medical Conditions
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {emergencyData.medicalConditions.map((condition, idx) => (
                  <View key={idx} style={{
                    backgroundColor: figmaTokens.colors.orange500 + "20",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}>
                    <Text style={{ color: figmaTokens.colors.orange500, fontSize: 13, fontWeight: "600" }}>
                      {condition}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {emergencyData.currentMedications && emergencyData.currentMedications.length > 0 && (
            <View>
              <Text style={{ color: figmaTokens.colors.gray400, fontSize: 14, marginBottom: 8 }}>
                Current Medications
              </Text>
              <View style={{ gap: 8 }}>
                {emergencyData.currentMedications.map((med, idx) => (
                  <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Pill size={16} color={figmaTokens.colors.blue500} />
                    <Text style={{ color: figmaTokens.colors.white, fontSize: 14 }}>
                      {med}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {renderEditModal()}
    </View>
  );
}
