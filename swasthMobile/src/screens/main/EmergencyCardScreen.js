// Emergency Card Screen - Light Theme (Matching App Design)
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
  SafeAreaView,
  StyleSheet,
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

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={figmaTokens.colors.gray900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Card</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={figmaTokens.colors.red500} />
          <Text style={styles.loadingText}>Loading emergency card...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={figmaTokens.colors.gray900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Card</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centerContent}>
          <AlertCircle size={48} color={figmaTokens.colors.red500} />
          <Text style={styles.errorTitle}>{error}</Text>
          <TouchableOpacity onPress={loadEmergencyCard} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Edit Modal
  const renderEditModal = () => (
    <Modal
      visible={isEditModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {emergencyData ? "Edit Emergency Card" : "Create Emergency Card"}
            </Text>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <X size={24} color={figmaTokens.colors.gray600} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.modalContent}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                value={formData.name}
                onChangeText={(val) => setFormData({ ...formData, name: val })}
                placeholder="Enter full name"
                placeholderTextColor={figmaTokens.colors.gray400}
                style={styles.input}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  value={formData.age}
                  onChangeText={(val) => setFormData({ ...formData, age: val })}
                  placeholder="25"
                  placeholderTextColor={figmaTokens.colors.gray400}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Blood Type</Text>
                <TextInput
                  value={formData.bloodType}
                  onChangeText={(val) => setFormData({ ...formData, bloodType: val })}
                  placeholder="A+"
                  placeholderTextColor={figmaTokens.colors.gray400}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  value={formData.height}
                  onChangeText={(val) => setFormData({ ...formData, height: val })}
                  placeholder="170"
                  placeholderTextColor={figmaTokens.colors.gray400}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  value={formData.weight}
                  onChangeText={(val) => setFormData({ ...formData, weight: val })}
                  placeholder="70"
                  placeholderTextColor={figmaTokens.colors.gray400}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              <TouchableOpacity onPress={addContact} style={styles.addButton}>
                <Plus size={18} color={figmaTokens.colors.blue500} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {formData.contacts.map((contact, index) => (
              <View key={index} style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <Text style={styles.contactLabel}>Contact {index + 1}</Text>
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
                  placeholderTextColor={figmaTokens.colors.gray400}
                  style={styles.contactInput}
                />
                <TextInput
                  value={contact.relationship}
                  onChangeText={(val) => updateContact(index, "relationship", val)}
                  placeholder="Relationship (e.g., Father, Friend)"
                  placeholderTextColor={figmaTokens.colors.gray400}
                  style={styles.contactInput}
                />
                <TextInput
                  value={contact.phone}
                  onChangeText={(val) => updateContact(index, "phone", val)}
                  placeholder="Phone number"
                  placeholderTextColor={figmaTokens.colors.gray400}
                  keyboardType="phone-pad"
                  style={[styles.contactInput, { marginBottom: 0 }]}
                />
              </View>
            ))}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Allergies</Text>
              <TouchableOpacity onPress={() => addArrayItem("allergies")} style={styles.addButton}>
                <Plus size={18} color={figmaTokens.colors.blue500} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {formData.allergies.map((allergy, index) => (
              <View key={index} style={styles.arrayItemRow}>
                <TextInput
                  value={allergy}
                  onChangeText={(val) => updateArrayItem("allergies", index, val)}
                  placeholder="Enter allergy"
                  placeholderTextColor={figmaTokens.colors.gray400}
                  style={[styles.input, { flex: 1 }]}
                />
                {formData.allergies.length > 1 && (
                  <TouchableOpacity onPress={() => removeArrayItem("allergies", index)} style={{ marginLeft: 8 }}>
                    <Trash2 size={20} color={figmaTokens.colors.red500} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Medical Conditions</Text>
              <TouchableOpacity onPress={() => addArrayItem("medicalConditions")} style={styles.addButton}>
                <Plus size={18} color={figmaTokens.colors.blue500} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {formData.medicalConditions.map((condition, index) => (
              <View key={index} style={styles.arrayItemRow}>
                <TextInput
                  value={condition}
                  onChangeText={(val) => updateArrayItem("medicalConditions", index, val)}
                  placeholder="Enter medical condition"
                  placeholderTextColor={figmaTokens.colors.gray400}
                  style={[styles.input, { flex: 1 }]}
                />
                {formData.medicalConditions.length > 1 && (
                  <TouchableOpacity onPress={() => removeArrayItem("medicalConditions", index)} style={{ marginLeft: 8 }}>
                    <Trash2 size={20} color={figmaTokens.colors.red500} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Current Medications</Text>
              <TouchableOpacity onPress={() => addArrayItem("medications")} style={styles.addButton}>
                <Plus size={18} color={figmaTokens.colors.blue500} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {formData.medications.map((medication, index) => (
              <View key={index} style={styles.arrayItemRow}>
                <TextInput
                  value={medication}
                  onChangeText={(val) => updateArrayItem("medications", index, val)}
                  placeholder="Enter medication"
                  placeholderTextColor={figmaTokens.colors.gray400}
                  style={[styles.input, { flex: 1 }]}
                />
                {formData.medications.length > 1 && (
                  <TouchableOpacity onPress={() => removeArrayItem("medications", index)} style={{ marginLeft: 8 }}>
                    <Trash2 size={20} color={figmaTokens.colors.red500} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={styles.saveButton}
            >
              {saving ? (
                <ActivityIndicator size="small" color={figmaTokens.colors.white} />
              ) : (
                <>
                  <Save size={20} color={figmaTokens.colors.white} />
                  <Text style={styles.saveButtonText}>Save Emergency Card</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // No Data State
  if (!emergencyData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={figmaTokens.colors.gray900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Card</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centerContent}>
          <View style={styles.emptyIconContainer}>
            <AlertCircle size={48} color={figmaTokens.colors.gray400} />
          </View>
          <Text style={styles.emptyTitle}>No Emergency Card Found</Text>
          <Text style={styles.emptySubtitle}>
            Create your emergency card to help first responders
          </Text>
          <TouchableOpacity onPress={openEditModal} style={styles.createButton}>
            <Plus size={20} color={figmaTokens.colors.white} />
            <Text style={styles.createButtonText}>Create Emergency Card</Text>
          </TouchableOpacity>
        </View>
        {renderEditModal()}
      </SafeAreaView>
    );
  }

  // Main View with Data
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={figmaTokens.colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Card</Text>
        <TouchableOpacity onPress={openEditModal} style={styles.editButton}>
          <Edit size={18} color={figmaTokens.colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Emergency Banner */}
        <View style={styles.emergencyBanner}>
          <View style={styles.bannerRow}>
            <AlertCircle size={28} color={figmaTokens.colors.white} />
            <Text style={styles.bannerTitle}>Emergency Card</Text>
          </View>
          <Text style={styles.bannerSubtitle}>
            In case of emergency, call any contact below
          </Text>
        </View>

        {/* Personal Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <User size={22} color={figmaTokens.colors.blue500} />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{emergencyData.name}</Text>
          </View>
          {emergencyData.age && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{emergencyData.age} years</Text>
            </View>
          )}
          {emergencyData.bloodType && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Blood Type</Text>
              <Text style={[styles.infoValue, styles.bloodType]}>{emergencyData.bloodType}</Text>
            </View>
          )}
          {emergencyData.height && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>{emergencyData.height} cm</Text>
            </View>
          )}
          {emergencyData.weight && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{emergencyData.weight} kg</Text>
            </View>
          )}
        </View>

        {/* Emergency Contacts Card */}
        {emergencyData.emergencyContacts && emergencyData.emergencyContacts.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Phone size={22} color={figmaTokens.colors.green500} />
              <Text style={styles.cardTitle}>Emergency Contacts</Text>
            </View>
            {emergencyData.emergencyContacts.map((contact, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                style={styles.contactItem}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactRelation}>{contact.relationship}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
                <View style={styles.callButton}>
                  <Phone size={18} color={figmaTokens.colors.white} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Medical Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Heart size={22} color={figmaTokens.colors.red500} />
            <Text style={styles.cardTitle}>Medical Information</Text>
          </View>

          {emergencyData.allergies && emergencyData.allergies.length > 0 && (
            <View style={styles.medicalSection}>
              <Text style={styles.medicalLabel}>Allergies</Text>
              <View style={styles.tagContainer}>
                {emergencyData.allergies.map((allergy, idx) => (
                  <View key={idx} style={[styles.tag, styles.allergyTag]}>
                    <Text style={styles.allergyTagText}>{allergy}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {emergencyData.medicalConditions && emergencyData.medicalConditions.length > 0 && (
            <View style={styles.medicalSection}>
              <Text style={styles.medicalLabel}>Medical Conditions</Text>
              <View style={styles.tagContainer}>
                {emergencyData.medicalConditions.map((condition, idx) => (
                  <View key={idx} style={[styles.tag, styles.conditionTag]}>
                    <Text style={styles.conditionTagText}>{condition}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {emergencyData.currentMedications && emergencyData.currentMedications.length > 0 && (
            <View style={styles.medicalSection}>
              <Text style={styles.medicalLabel}>Current Medications</Text>
              {emergencyData.currentMedications.map((med, idx) => (
                <View key={idx} style={styles.medicationItem}>
                  <Pill size={16} color={figmaTokens.colors.purple500} />
                  <Text style={styles.medicationText}>{med}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {renderEditModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: figmaTokens.colors.gray50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: figmaTokens.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: figmaTokens.colors.gray200,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: figmaTokens.colors.gray900,
  },
  editButton: {
    backgroundColor: figmaTokens.colors.blue500,
    padding: 8,
    borderRadius: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: figmaTokens.colors.gray500,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: figmaTokens.colors.gray900,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: figmaTokens.colors.blue500,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: figmaTokens.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyIconContainer: {
    backgroundColor: figmaTokens.colors.gray100,
    padding: 20,
    borderRadius: 50,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: figmaTokens.colors.gray900,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: figmaTokens.colors.gray500,
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: figmaTokens.colors.blue500,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  createButtonText: {
    color: figmaTokens.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emergencyBanner: {
    backgroundColor: figmaTokens.colors.red500,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  bannerTitle: {
    color: figmaTokens.colors.white,
    fontSize: 22,
    fontWeight: "700",
  },
  bannerSubtitle: {
    color: figmaTokens.colors.white,
    fontSize: 14,
    opacity: 0.9,
  },
  card: {
    backgroundColor: figmaTokens.colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...figmaTokens.shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: figmaTokens.colors.gray100,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: figmaTokens.colors.gray900,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: figmaTokens.colors.gray500,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: figmaTokens.colors.gray900,
  },
  bloodType: {
    color: figmaTokens.colors.red500,
    fontWeight: "700",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: figmaTokens.colors.gray50,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: figmaTokens.colors.gray900,
    marginBottom: 2,
  },
  contactRelation: {
    fontSize: 13,
    color: figmaTokens.colors.gray500,
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    fontWeight: "600",
    color: figmaTokens.colors.blue500,
  },
  callButton: {
    backgroundColor: figmaTokens.colors.green500,
    padding: 10,
    borderRadius: 20,
  },
  medicalSection: {
    marginBottom: 16,
  },
  medicalLabel: {
    fontSize: 14,
    color: figmaTokens.colors.gray500,
    marginBottom: 10,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  allergyTag: {
    backgroundColor: figmaTokens.colors.red50,
  },
  allergyTagText: {
    fontSize: 13,
    fontWeight: "600",
    color: figmaTokens.colors.red600,
  },
  conditionTag: {
    backgroundColor: figmaTokens.colors.orange50,
  },
  conditionTagText: {
    fontSize: 13,
    fontWeight: "600",
    color: figmaTokens.colors.orange600,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  medicationText: {
    fontSize: 14,
    color: figmaTokens.colors.gray900,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: figmaTokens.colors.white,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: figmaTokens.colors.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: figmaTokens.colors.gray900,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: figmaTokens.colors.gray900,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: figmaTokens.colors.gray600,
    marginBottom: 6,
  },
  input: {
    backgroundColor: figmaTokens.colors.gray50,
    borderWidth: 1,
    borderColor: figmaTokens.colors.gray200,
    color: figmaTokens.colors.gray900,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 15,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: figmaTokens.colors.blue500,
  },
  contactCard: {
    backgroundColor: figmaTokens.colors.gray50,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: figmaTokens.colors.gray600,
  },
  contactInput: {
    backgroundColor: figmaTokens.colors.white,
    borderWidth: 1,
    borderColor: figmaTokens.colors.gray200,
    color: figmaTokens.colors.gray900,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  arrayItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: figmaTokens.colors.blue500,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  saveButtonText: {
    color: figmaTokens.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
