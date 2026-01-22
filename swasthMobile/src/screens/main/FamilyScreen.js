// ✅ Family Screen - Built from Figma FamilyList.tsx
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { Dialog, Portal, SegmentedButtons } from "react-native-paper";
import { useAuth } from "../../hooks/useAuth";
import { useMember } from "../../hooks/useMember";
import {
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
} from "../../config/api";
import figmaTokens from "../../design-system/figmaTokens";
import { HeaderBar } from "../../design-system/HeaderBar";
import { FigmaCard } from "../../design-system/FigmaCard";
import { FigmaInput } from "../../design-system/FigmaInput";
import { FigmaButton } from "../../design-system/FigmaButton";

export default function FamilyScreen({ navigation }) {
  const { user } = useAuth();
  const { activeMember, setActiveMember, switchToSelf } = useMember();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add/Edit Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    allergies: "",
    conditions: "",
    medications: "",
  });

  useEffect(() => {
    if (user?.email) {
      loadMembers();
    }
  }, [user?.email]);

  const loadMembers = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getFamilyMembers(user.email);
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading family members:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load family members. Please try again.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      relationship: "",
      age: "",
      gender: "",
      height: "",
      weight: "",
      allergies: "",
      conditions: "",
      medications: "",
    });
    setEditingMember(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || "",
      relationship: member.relationship || "",
      age: member.age?.toString() || "",
      gender: member.gender || "",
      height: member.height?.toString() || "",
      weight: member.weight?.toString() || "",
      allergies: Array.isArray(member.allergies)
        ? member.allergies.join(", ")
        : "",
      conditions: Array.isArray(member.diseases)
        ? member.diseases.join(", ")
        : "",
      medications: Array.isArray(member.medications)
        ? member.medications.join(", ")
        : "",
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.name.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }

    if (!formData.relationship || !formData.relationship.trim()) {
      Alert.alert("Error", "Please enter a relationship");
      return;
    }

    if (
      formData.age &&
      (isNaN(formData.age) ||
        parseFloat(formData.age) < 0 ||
        parseFloat(formData.age) > 150)
    ) {
      Alert.alert("Error", "Please enter a valid age (0-150)");
      return;
    }

    if (
      formData.height &&
      (isNaN(formData.height) ||
        parseFloat(formData.height) <= 0 ||
        parseFloat(formData.height) > 300)
    ) {
      Alert.alert("Error", "Please enter a valid height (1-300 cm)");
      return;
    }

    if (
      formData.weight &&
      (isNaN(formData.weight) ||
        parseFloat(formData.weight) <= 0 ||
        parseFloat(formData.weight) > 500)
    ) {
      Alert.alert("Error", "Please enter a valid weight (1-500 kg)");
      return;
    }

    setSaving(true);
    try {
      const memberData = {
        name: formData.name.trim(),
        relationship: formData.relationship.trim(),
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        gender: formData.gender || undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        allergies: formData.allergies
          ? formData.allergies
              .split(",")
              .map((a) => a.trim())
              .filter((a) => a)
          : [],
        conditions: formData.conditions
          ? formData.conditions
              .split(",")
              .map((c) => c.trim())
              .filter((c) => c)
          : [],
        medications: formData.medications
          ? formData.medications
              .split(",")
              .map((m) => m.trim())
              .filter((m) => m)
          : [],
      };

      if (editingMember) {
        // Update existing member
        await updateFamilyMember(editingMember._id, memberData);
        Alert.alert("Success", "Family member updated successfully");
        setShowEditModal(false);
      } else {
        // Add new member
        await addFamilyMember(user.email, memberData);
        Alert.alert("Success", "Family member added successfully");
        setShowAddModal(false);
      }

      resetForm();
      await loadMembers();
    } catch (error) {
      console.error("Error saving family member:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save family member. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (memberId) => {
    setDeletingId(memberId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    setDeleting(true);
    try {
      await deleteFamilyMember(deletingId);
      Alert.alert("Success", "Family member deleted successfully");

      // Optimistically update UI
      setMembers((prev) => prev.filter((m) => m._id !== deletingId));
    } catch (error) {
      console.error("Error deleting family member:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete family member. Please try again.";
      Alert.alert("Error", errorMessage);
      // Reload to sync with server
      await loadMembers();
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeletingId(null);
    }
  };

  const stats = {
    total: members.length + 1, // +1 for user
    healthy: members.filter((m) => m.status === "healthy").length + 1,
    alerts: members.filter((m) => m.status === "vaccination-due").length,
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <HeaderBar
          title="Family Profiles"
          onBack={() => navigation.goBack()}
          rightIcon="plus"
          onRightPress={openAddModal}
          backgroundColor={figmaTokens.colors.white}
        />
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Stats */}
            <View style={styles.statsGrid}>
              <LinearGradient
                colors={[
                  figmaTokens.colors.blue500,
                  figmaTokens.colors.blue600,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <Text style={styles.statLabel}>Total</Text>
                <Text style={styles.statValue}>{stats.total}</Text>
              </LinearGradient>
              <LinearGradient
                colors={[
                  figmaTokens.colors.green500,
                  figmaTokens.colors.green600,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <Text style={styles.statLabel}>Healthy</Text>
                <Text style={styles.statValue}>{stats.healthy}</Text>
              </LinearGradient>
              <LinearGradient
                colors={[
                  figmaTokens.colors.orange500,
                  figmaTokens.colors.orange600,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <Text style={styles.statLabel}>Alerts</Text>
                <Text style={styles.statValue}>{stats.alerts}</Text>
              </LinearGradient>
            </View>

            {/* User Card (Self) */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                switchToSelf(user?.name || "You");
                navigation.navigate("Dashboard");
              }}
              onLongPress={() => navigation.navigate("Profile")}
            >
              <FigmaCard style={styles.memberCard}>
                <View style={styles.memberContent}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {(user?.name || "User")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberHeader}>
                      <Text style={styles.memberName}>
                        {user?.name || "You"}
                      </Text>
                      {activeMember.memberId === null && (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeText}>Active</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.memberDetails}>
                      {user?.age ? `${user.age} years` : "Age not set"}
                    </Text>
                    <Text style={styles.memberDate}>Tap to view your data</Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={figmaTokens.colors.gray400}
                  />
                </View>
              </FigmaCard>
            </TouchableOpacity>

            {/* Family Members */}
            <Text style={styles.sectionTitle}>Members</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={figmaTokens.colors.primary}
                />
                <Text style={styles.loadingText}>
                  Loading family members...
                </Text>
              </View>
            ) : error ? (
              <FigmaCard style={styles.errorCard}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={48}
                  color={figmaTokens.colors.red500}
                />
                <Text style={styles.errorText}>{error}</Text>
                <FigmaButton
                  title="Retry"
                  onPress={loadMembers}
                  style={styles.retryButton}
                />
              </FigmaCard>
            ) : members.length === 0 ? (
              <FigmaCard style={styles.emptyCard}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={64}
                  color={figmaTokens.colors.gray400}
                />
                <Text style={styles.emptyTitle}>No Family Members</Text>
                <Text style={styles.emptyText}>
                  Add family members to track their health records
                </Text>
                <FigmaButton
                  title="Add Family Member"
                  onPress={openAddModal}
                  style={styles.emptyButton}
                />
              </FigmaCard>
            ) : (
              <View style={styles.membersList}>
                {members.map((member) => (
                  <TouchableOpacity
                    key={member._id}
                    style={styles.memberCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      // Switch to this family member and go to Dashboard
                      setActiveMember(member);
                      navigation.navigate("Dashboard");
                    }}
                    onLongPress={() => openEditModal(member)}
                    delayLongPress={500}
                  >
                    <View style={styles.memberContent}>
                      <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <View style={styles.memberHeader}>
                          <Text style={styles.memberName}>{member.name}</Text>
                          {activeMember.memberId === member._id ? (
                            <View style={styles.activeBadge}>
                              <Text style={styles.activeText}>Active</Text>
                            </View>
                          ) : member.status === "vaccination-due" ? (
                            <View style={styles.alertBadge}>
                              <Text style={styles.alertText}>
                                Vaccination Due
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.memberDetails}>
                          {member.relationship} •{" "}
                          {member.age ? `${member.age} years` : "Age not set"}
                        </Text>
                        <Text style={styles.memberDate}>
                          Tap to view • Long press to edit
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color={figmaTokens.colors.gray400}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Add Family Member Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Family Member</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={figmaTokens.colors.gray700}
                />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <FigmaInput
                label="Name *"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Enter name"
              />
              <FigmaInput
                label="Relationship *"
                value={formData.relationship}
                onChangeText={(text) =>
                  setFormData({ ...formData, relationship: text })
                }
                placeholder="e.g., Father, Mother, Son, Daughter"
              />
              <FigmaInput
                label="Age"
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                placeholder="Age in years"
                keyboardType="numeric"
              />
              <Text style={styles.label}>Gender</Text>
              <SegmentedButtons
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
                buttons={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
                style={styles.segmentedButtons}
              />
              <FigmaInput
                label="Height (cm)"
                value={formData.height}
                onChangeText={(text) =>
                  setFormData({ ...formData, height: text })
                }
                placeholder="Height in cm"
                keyboardType="numeric"
              />
              <FigmaInput
                label="Weight (kg)"
                value={formData.weight}
                onChangeText={(text) =>
                  setFormData({ ...formData, weight: text })
                }
                placeholder="Weight in kg"
                keyboardType="numeric"
              />
              <FigmaInput
                label="Allergies (comma separated)"
                value={formData.allergies}
                onChangeText={(text) =>
                  setFormData({ ...formData, allergies: text })
                }
                placeholder="e.g., Peanuts, Dust"
                multiline
              />
              <FigmaInput
                label="Medical Conditions (comma separated)"
                value={formData.conditions}
                onChangeText={(text) =>
                  setFormData({ ...formData, conditions: text })
                }
                placeholder="e.g., Hypertension, Diabetes"
                multiline
              />
              <FigmaInput
                label="Medications (comma separated)"
                value={formData.medications}
                onChangeText={(text) =>
                  setFormData({ ...formData, medications: text })
                }
                placeholder="e.g., Lisinopril 10mg"
                multiline
              />
            </ScrollView>
            <View style={styles.modalFooter}>
              <FigmaButton
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                style={styles.modalButton}
              />
              <FigmaButton
                title="Add Member"
                onPress={handleSave}
                loading={saving}
                disabled={saving}
                style={styles.modalButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Family Member Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Family Member</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={figmaTokens.colors.gray700}
                />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <FigmaInput
                label="Name *"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Enter name"
              />
              <FigmaInput
                label="Relationship *"
                value={formData.relationship}
                onChangeText={(text) =>
                  setFormData({ ...formData, relationship: text })
                }
                placeholder="e.g., Father, Mother, Son, Daughter"
              />
              <FigmaInput
                label="Age"
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                placeholder="Age in years"
                keyboardType="numeric"
              />
              <Text style={styles.label}>Gender</Text>
              <SegmentedButtons
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
                buttons={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
                style={styles.segmentedButtons}
              />
              <FigmaInput
                label="Height (cm)"
                value={formData.height}
                onChangeText={(text) =>
                  setFormData({ ...formData, height: text })
                }
                placeholder="Height in cm"
                keyboardType="numeric"
              />
              <FigmaInput
                label="Weight (kg)"
                value={formData.weight}
                onChangeText={(text) =>
                  setFormData({ ...formData, weight: text })
                }
                placeholder="Weight in kg"
                keyboardType="numeric"
              />
              <FigmaInput
                label="Allergies (comma separated)"
                value={formData.allergies}
                onChangeText={(text) =>
                  setFormData({ ...formData, allergies: text })
                }
                placeholder="e.g., Peanuts, Dust"
                multiline
              />
              <FigmaInput
                label="Medical Conditions (comma separated)"
                value={formData.conditions}
                onChangeText={(text) =>
                  setFormData({ ...formData, conditions: text })
                }
                placeholder="e.g., Hypertension, Diabetes"
                multiline
              />
              <FigmaInput
                label="Medications (comma separated)"
                value={formData.medications}
                onChangeText={(text) =>
                  setFormData({ ...formData, medications: text })
                }
                placeholder="e.g., Lisinopril 10mg"
                multiline
              />
            </ScrollView>
            <View style={styles.modalFooter}>
              <FigmaButton
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                style={styles.modalButton}
              />
              <FigmaButton
                title="Save Changes"
                onPress={handleSave}
                loading={saving}
                disabled={saving}
                style={styles.modalButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            Delete Family Member
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Are you sure you want to delete this family member? This action
              cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <TouchableOpacity
              style={styles.dialogButton}
              onPress={() => {
                setShowDeleteDialog(false);
                setDeletingId(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.dialogButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dialogButton, styles.dialogButtonDestructive]}
              onPress={confirmDelete}
              disabled={deleting}
              activeOpacity={0.7}
            >
              {deleting ? (
                <ActivityIndicator
                  size="small"
                  color={figmaTokens.colors.destructive}
                />
              ) : (
                <Text
                  style={[
                    styles.dialogButtonText,
                    { color: figmaTokens.colors.destructive },
                  ]}
                >
                  Delete
                </Text>
              )}
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: figmaTokens.spacing["6"],
  },
  statsGrid: {
    flexDirection: "row",
    gap: figmaTokens.spacing["3"],
    marginBottom: figmaTokens.spacing["6"],
  },
  statCard: {
    flex: 1,
    borderRadius: figmaTokens.borderRadius["2xl"],
    padding: figmaTokens.spacing["4"],
    alignItems: "center",
  },
  statLabel: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: figmaTokens.spacing["1"],
  },
  statValue: {
    fontSize: figmaTokens.typography.fontSize["2xl"],
    fontWeight: figmaTokens.typography.fontWeight.bold,
    color: figmaTokens.colors.white,
  },
  sectionTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
    marginBottom: figmaTokens.spacing["4"],
  },
  membersList: {
    gap: figmaTokens.spacing["3"],
  },
  memberCard: {
    marginBottom: figmaTokens.spacing["3"],
    ...figmaTokens.shadows.sm,
  },
  memberContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: figmaTokens.spacing["4"],
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: figmaTokens.colors.gray200,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.bold,
    color: figmaTokens.colors.gray700,
  },
  memberInfo: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: figmaTokens.spacing["2"],
    marginBottom: figmaTokens.spacing["1"],
  },
  memberName: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
  },
  healthyBadge: {
    backgroundColor: figmaTokens.colors.green100,
    borderRadius: figmaTokens.borderRadius.full,
    paddingHorizontal: figmaTokens.spacing["2"],
    paddingVertical: figmaTokens.spacing["0.5"],
  },
  healthyText: {
    fontSize: 12,
    color: figmaTokens.colors.green700,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
  activeBadge: {
    backgroundColor: figmaTokens.colors.blue100,
    borderRadius: figmaTokens.borderRadius.full,
    paddingHorizontal: figmaTokens.spacing["2"],
    paddingVertical: figmaTokens.spacing["0.5"],
  },
  activeText: {
    fontSize: 12,
    color: figmaTokens.colors.blue700,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
  alertBadge: {
    backgroundColor: figmaTokens.colors.orange100,
    borderRadius: figmaTokens.borderRadius.full,
    paddingHorizontal: figmaTokens.spacing["2"],
    paddingVertical: figmaTokens.spacing["0.5"],
  },
  alertText: {
    fontSize: 12,
    color: figmaTokens.colors.orange700,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
  memberDetails: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray500,
    marginBottom: figmaTokens.spacing["1"],
  },
  memberDate: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray400,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: figmaTokens.spacing["8"],
    gap: figmaTokens.spacing["4"],
  },
  loadingText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
  },
  errorCard: {
    alignItems: "center",
    padding: figmaTokens.spacing["8"],
    gap: figmaTokens.spacing["4"],
  },
  errorText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray700,
    textAlign: "center",
  },
  retryButton: {
    marginTop: figmaTokens.spacing["4"],
  },
  emptyCard: {
    alignItems: "center",
    padding: figmaTokens.spacing["8"],
    gap: figmaTokens.spacing["4"],
  },
  emptyTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
  },
  emptyText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: figmaTokens.spacing["4"],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: figmaTokens.colors.white,
    borderTopLeftRadius: figmaTokens.borderRadius["2xl"],
    borderTopRightRadius: figmaTokens.borderRadius["2xl"],
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: figmaTokens.spacing["6"],
    borderBottomWidth: 1,
    borderBottomColor: figmaTokens.colors.gray200,
  },
  modalTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
  },
  modalBody: {
    padding: figmaTokens.spacing["6"],
    maxHeight: 500,
  },
  modalFooter: {
    flexDirection: "row",
    gap: figmaTokens.spacing["3"],
    padding: figmaTokens.spacing["6"],
    borderTopWidth: 1,
    borderTopColor: figmaTokens.colors.gray200,
  },
  modalButton: {
    flex: 1,
  },
  label: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
    marginBottom: figmaTokens.spacing["2"],
    marginTop: figmaTokens.spacing["4"],
  },
  segmentedButtons: {
    marginBottom: figmaTokens.spacing["4"],
  },
  dialog: {
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius.xl,
  },
  dialogTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
  },
  dialogText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray700,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: figmaTokens.spacing["2"],
    paddingTop: figmaTokens.spacing["4"],
  },
  dialogButton: {
    paddingHorizontal: figmaTokens.spacing["4"],
    paddingVertical: figmaTokens.spacing["2"],
    borderRadius: figmaTokens.borderRadius.base,
  },
  dialogButtonDestructive: {
    backgroundColor: figmaTokens.colors.red50,
  },
  dialogButtonText: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.primary,
  },
});
