// Reminders Screen - Fully Functional
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  StyleSheet,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useAuth } from "../../hooks/useAuth";
import { useMember } from "../../hooks/useMember";
import {
  getReminders,
  addReminder,
  updateReminder,
  deleteReminder,
  toggleReminder,
} from "../../config/api";
import figmaTokens from "../../design-system/figmaTokens";
import NotificationService from "../../services/NotificationService";

export default function RemindersScreen({ navigation }) {
  const { user } = useAuth();
  const { activeMember, isViewingFamily } = useMember();

  const [activeTab, setActiveTab] = useState("medication");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remindersData, setRemindersData] = useState([]);

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timePickerDate, setTimePickerDate] = useState(new Date());

  // Custom time picker state for Android
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
  const [tempHour, setTempHour] = useState("09");
  const [tempMinute, setTempMinute] = useState("00");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Medication",
    time: "09:00",
    frequency: "Daily",
    doctor: "",
    location: "",
    date: new Date(),
  });

  const loadReminders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReminders(user?.email, activeMember.memberId);
      setRemindersData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load reminders");
      console.error("Reminders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (user?.email) {
        loadReminders();
      }
    }, [user?.email, activeMember.memberId])
  );

  // Filter reminders by type
  const medicationReminders = remindersData.filter(
    (r) => r.type === "Medication"
  );
  const appointmentReminders = remindersData.filter(
    (r) => r.type === "Appointment"
  );

  // Handle Mark Taken (update reminder lastTriggered)
  const handleMarkTaken = async (reminderId) => {
    try {
      await updateReminder(reminderId, { lastTriggered: new Date() });
      loadReminders(); // Refresh
      Alert.alert("Done", "Marked as taken!");
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to mark as taken");
    }
  };

  // Handle Delete
  const handleDelete = (reminderId) => {
    Alert.alert("Delete Reminder", "Are you sure you want to delete this reminder?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReminder(reminderId);
            // Also cancel the scheduled notification
            await NotificationService.cancelReminder(reminderId);
            loadReminders();
          } catch (err) {
            Alert.alert("Error", err.message || "Failed to delete");
          }
        },
      },
    ]);
  };

  // Handle Toggle Enable/Disable
  const handleToggle = async (reminderId) => {
    try {
      await toggleReminder(reminderId);
      loadReminders();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to toggle reminder");
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      title: "",
      description: "",
      type: activeTab === "medication" ? "Medication" : "Appointment",
      time: "09:00",
      frequency: "Daily",
      doctor: "",
      location: "",
      date: new Date(),
    });
    setShowAddModal(true);
  };

  // Handle Save Reminder
  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        userEmail: user.email,
        memberId: activeMember.memberId || null,
        memberName: activeMember.name || "Self",
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        time: formData.time,
        frequency: formData.frequency,
      };

      // Add appointment-specific fields
      if (formData.type === "Appointment") {
        payload.doctor = formData.doctor.trim();
        payload.location = formData.location.trim();
        payload.date = formData.date.toISOString();
      }

      const result = await addReminder(payload);

      // Schedule notification for this reminder
      if (result && result._id) {
        await NotificationService.scheduleReminder({
          _id: result._id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          time: formData.time,
          type: formData.type,
          frequency: formData.frequency,
          date: formData.type === "Appointment" ? formData.date.toISOString() : null,
        });
      }

      setShowAddModal(false);
      loadReminders();
      Alert.alert("Success", "Reminder added with notification!");
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to add reminder");
    } finally {
      setSaving(false);
    }
  };

  // Time picker handler
  const onTimeChange = (event, selectedDate) => {
    // On Android, picker closes automatically. On iOS, keep it open until user dismisses.
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (event.type === "dismissed") {
      setShowTimePicker(false);
      return;
    }

    if (selectedDate) {
      const hours = String(selectedDate.getHours()).padStart(2, "0");
      const minutes = String(selectedDate.getMinutes()).padStart(2, "0");
      setFormData({ ...formData, time: `${hours}:${minutes}` });
    }
  };

  // Date picker handler
  const onDateChange = (event, selectedDate) => {
    // On Android, picker closes automatically. On iOS, keep it open until user dismisses.
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate });
    }
  };

  // Check if taken today
  const isTakenToday = (reminder) => {
    if (!reminder.lastTriggered) return false;
    const lastTriggered = new Date(reminder.lastTriggered);
    const today = new Date();
    return (
      lastTriggered.getDate() === today.getDate() &&
      lastTriggered.getMonth() === today.getMonth() &&
      lastTriggered.getFullYear() === today.getFullYear()
    );
  };

  // Calculate stats
  const totalMeds = medicationReminders.length;
  const takenToday = medicationReminders.filter(isTakenToday).length;

  // Render Add Modal
  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Add {formData.type === "Medication" ? "Medicine" : "Appointment"} Reminder
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Icon name="close" size={24} color={figmaTokens.colors.gray600} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.modalContent}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                value={formData.title}
                onChangeText={(val) => setFormData({ ...formData, title: val })}
                placeholder={formData.type === "Medication" ? "e.g., Paracetamol" : "e.g., Dentist Checkup"}
                placeholderTextColor={figmaTokens.colors.gray400}
                style={styles.input}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                value={formData.description}
                onChangeText={(val) => setFormData({ ...formData, description: val })}
                placeholder={formData.type === "Medication" ? "e.g., 1 tablet after meal" : "Notes"}
                placeholderTextColor={figmaTokens.colors.gray400}
                style={styles.input}
                multiline
              />
            </View>

            {/* Time Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  const [hours, minutes] = (formData.time || "09:00").split(":");
                  if (Platform.OS === "android") {
                    // Use custom time picker on Android to avoid crash
                    setTempHour(hours || "09");
                    setTempMinute(minutes || "00");
                    setShowCustomTimePicker(true);
                  } else {
                    const date = new Date();
                    date.setHours(parseInt(hours, 10) || 9);
                    date.setMinutes(parseInt(minutes, 10) || 0);
                    date.setSeconds(0);
                    setTimePickerDate(date);
                    setShowTimePicker(true);
                  }
                }}
              >
                <Icon name="clock-outline" size={20} color={figmaTokens.colors.gray600} />
                <Text style={styles.pickerText}>{formData.time}</Text>
              </TouchableOpacity>
            </View>

            {/* Frequency (for medication) */}
            {formData.type === "Medication" && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Frequency</Text>
                <View style={styles.frequencyRow}>
                  {["Daily", "Weekly", "Once"].map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.frequencyChip,
                        formData.frequency === freq && styles.frequencyChipActive,
                      ]}
                      onPress={() => setFormData({ ...formData, frequency: freq })}
                    >
                      <Text
                        style={[
                          styles.frequencyText,
                          formData.frequency === freq && styles.frequencyTextActive,
                        ]}
                      >
                        {freq}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Appointment-specific fields */}
            {formData.type === "Appointment" && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Icon name="calendar" size={20} color={figmaTokens.colors.gray600} />
                    <Text style={styles.pickerText}>
                      {formData.date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Doctor Name</Text>
                  <TextInput
                    value={formData.doctor}
                    onChangeText={(val) => setFormData({ ...formData, doctor: val })}
                    placeholder="e.g., Dr. Smith"
                    placeholderTextColor={figmaTokens.colors.gray400}
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    value={formData.location}
                    onChangeText={(val) => setFormData({ ...formData, location: val })}
                    placeholder="e.g., City Hospital"
                    placeholderTextColor={figmaTokens.colors.gray400}
                    style={styles.input}
                  />
                </View>
              </>
            )}

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={styles.saveButton}
            >
              {saving ? (
                <ActivityIndicator size="small" color={figmaTokens.colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Reminder</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={26} color={figmaTokens.colors.gray900} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Reminders</Text>
            {isViewingFamily && (
              <Text style={styles.headerSubtitle}>{activeMember.name}</Text>
            )}
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={figmaTokens.colors.blue500} />
          <Text style={styles.loadingText}>Loading reminders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={26} color={figmaTokens.colors.gray900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reminders</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <Icon name="alert-circle" size={48} color={figmaTokens.colors.red500} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadReminders} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color={figmaTokens.colors.gray900} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Reminders</Text>
          {isViewingFamily && (
            <Text style={styles.headerSubtitle}>{activeMember.name}</Text>
          )}
        </View>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Icon name="plus" size={20} color={figmaTokens.colors.white} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab("medication")}
          style={[styles.tab, activeTab === "medication" && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === "medication" && styles.tabTextActive]}>
            Medicine
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("appointment")}
          style={[styles.tab, activeTab === "appointment" && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === "appointment" && styles.tabTextActive]}>
            Appointments
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === "medication" ? (
          <>
            {/* Stats Card */}
            <LinearGradient
              colors={[figmaTokens.colors.blue500, figmaTokens.colors.purple500]}
              style={styles.statsCard}
            >
              <Text style={styles.statsTitle}>Today's Medications</Text>
              <View style={styles.statsRow}>
                <View>
                  <Text style={styles.statsValue}>
                    {takenToday} / {totalMeds}
                  </Text>
                  <Text style={styles.statsLabel}>doses taken</Text>
                </View>
                <View style={styles.statsIcon}>
                  <Icon name="pill" size={34} color={figmaTokens.colors.white} />
                </View>
              </View>
            </LinearGradient>

            <Text style={styles.sectionTitle}>Medications</Text>

            {medicationReminders.length === 0 ? (
              <View style={styles.emptyCard}>
                <Icon name="pill" size={48} color={figmaTokens.colors.gray300} />
                <Text style={styles.emptyTitle}>No medicine reminders</Text>
                <Text style={styles.emptyText}>Tap + to add a reminder</Text>
              </View>
            ) : (
              medicationReminders.map((reminder) => {
                const taken = isTakenToday(reminder);
                return (
                  <View key={reminder._id} style={styles.reminderCard}>
                    <View style={styles.reminderHeader}>
                      <View style={[styles.reminderIcon, { backgroundColor: figmaTokens.colors.blue500 }]}>
                        <Icon name="pill" size={20} color={figmaTokens.colors.white} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reminderTitle}>{reminder.title}</Text>
                        <Text style={styles.reminderDesc}>
                          {reminder.description || reminder.frequency}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(reminder._id)}>
                        <Icon name="delete-outline" size={22} color={figmaTokens.colors.red500} />
                      </TouchableOpacity>
                    </View>

                    <View style={[styles.timeRow, taken && styles.timeRowTaken]}>
                      <View style={styles.timeLeft}>
                        <Icon name="clock-outline" size={18} color={figmaTokens.colors.gray500} />
                        <Text style={styles.timeText}>{reminder.time}</Text>
                      </View>

                      {taken ? (
                        <View style={styles.takenBadge}>
                          <Icon name="check" size={16} color={figmaTokens.colors.green600} />
                          <Text style={styles.takenText}>Taken</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.markButton}
                          onPress={() => handleMarkTaken(reminder._id)}
                        >
                          <Text style={styles.markButtonText}>Mark Taken</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            {/* Appointments Stats */}
            <LinearGradient
              colors={[figmaTokens.colors.green500, figmaTokens.colors.emerald500]}
              style={styles.statsCard}
            >
              <Text style={styles.statsTitle}>Upcoming Appointments</Text>
              <View style={styles.statsRow}>
                <View>
                  <Text style={styles.statsValue}>{appointmentReminders.length}</Text>
                  <Text style={styles.statsLabel}>scheduled</Text>
                </View>
                <View style={styles.statsIcon}>
                  <Icon name="calendar" size={34} color={figmaTokens.colors.white} />
                </View>
              </View>
            </LinearGradient>

            <Text style={styles.sectionTitle}>Schedule</Text>

            {appointmentReminders.length === 0 ? (
              <View style={styles.emptyCard}>
                <Icon name="calendar" size={48} color={figmaTokens.colors.gray300} />
                <Text style={styles.emptyTitle}>No appointments scheduled</Text>
                <Text style={styles.emptyText}>Tap + to add an appointment</Text>
              </View>
            ) : (
              appointmentReminders.map((appointment) => (
                <View key={appointment._id} style={styles.appointmentCard}>
                  <View style={[styles.reminderIcon, { backgroundColor: figmaTokens.colors.green500 }]}>
                    <Icon name="calendar" size={22} color={figmaTokens.colors.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reminderTitle}>{appointment.title}</Text>
                    <Text style={styles.reminderDesc}>{appointment.doctor || "Doctor"}</Text>

                    <View style={styles.appointmentMeta}>
                      <Icon name="clock-outline" size={14} color={figmaTokens.colors.gray500} />
                      <Text style={styles.metaText}>{appointment.time}</Text>
                    </View>

                    {appointment.date && (
                      <View style={styles.appointmentMeta}>
                        <Icon name="calendar-outline" size={14} color={figmaTokens.colors.gray500} />
                        <Text style={styles.metaText}>
                          {new Date(appointment.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                      </View>
                    )}

                    {appointment.location && (
                      <View style={styles.appointmentMeta}>
                        <Icon name="map-marker-outline" size={14} color={figmaTokens.colors.gray500} />
                        <Text style={styles.metaText}>{appointment.location}</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(appointment._id)}>
                    <Icon name="delete-outline" size={22} color={figmaTokens.colors.red500} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {renderAddModal()}

      {/* Time Picker - Outside Modal to prevent crash */}
      {showTimePicker && (
        <DateTimePicker
          value={timePickerDate}
          mode="time"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
      )}

      {/* Date Picker - Outside Modal to prevent crash */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.date || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Custom Time Picker Modal for Android */}
      <Modal
        visible={showCustomTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCustomTimePicker(false)}
      >
        <TouchableOpacity
          style={styles.customTimeOverlay}
          activeOpacity={1}
          onPress={() => setShowCustomTimePicker(false)}
        >
          <View style={styles.customTimeContainer}>
            <Text style={styles.customTimeTitle}>Select Time</Text>

            <View style={styles.customTimeRow}>
              {/* Hours */}
              <View style={styles.customTimeColumn}>
                <Text style={styles.customTimeLabel}>Hour</Text>
                <ScrollView style={styles.customTimeScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.customTimeItem,
                        tempHour === hour && styles.customTimeItemActive,
                      ]}
                      onPress={() => setTempHour(hour)}
                    >
                      <Text
                        style={[
                          styles.customTimeItemText,
                          tempHour === hour && styles.customTimeItemTextActive,
                        ]}
                      >
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.customTimeSeparator}>:</Text>

              {/* Minutes */}
              <View style={styles.customTimeColumn}>
                <Text style={styles.customTimeLabel}>Minute</Text>
                <ScrollView style={styles.customTimeScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.customTimeItem,
                        tempMinute === minute && styles.customTimeItemActive,
                      ]}
                      onPress={() => setTempMinute(minute)}
                    >
                      <Text
                        style={[
                          styles.customTimeItemText,
                          tempMinute === minute && styles.customTimeItemTextActive,
                        ]}
                      >
                        {minute}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.customTimeButtons}>
              <TouchableOpacity
                style={styles.customTimeCancelBtn}
                onPress={() => setShowCustomTimePicker(false)}
              >
                <Text style={styles.customTimeCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customTimeConfirmBtn}
                onPress={() => {
                  setFormData({ ...formData, time: `${tempHour}:${tempMinute}` });
                  setShowCustomTimePicker(false);
                }}
              >
                <Text style={styles.customTimeConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: figmaTokens.colors.gray900,
  },
  headerSubtitle: {
    fontSize: 14,
    color: figmaTokens.colors.blue500,
  },
  addButton: {
    backgroundColor: figmaTokens.colors.blue500,
    padding: 10,
    borderRadius: 50,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: figmaTokens.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: figmaTokens.colors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: figmaTokens.colors.blue500,
  },
  tabText: {
    fontSize: 15,
    color: figmaTokens.colors.gray500,
  },
  tabTextActive: {
    color: figmaTokens.colors.blue500,
    fontWeight: "600",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: figmaTokens.colors.gray500,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: figmaTokens.colors.gray700,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: figmaTokens.colors.blue500,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: figmaTokens.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    color: figmaTokens.colors.white,
    fontSize: 18,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsValue: {
    color: figmaTokens.colors.white,
    fontSize: 32,
    fontWeight: "700",
  },
  statsLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  statsIcon: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: figmaTokens.colors.gray900,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: figmaTokens.colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    ...figmaTokens.shadows.sm,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    color: figmaTokens.colors.gray600,
  },
  emptyText: {
    marginTop: 4,
    fontSize: 14,
    color: figmaTokens.colors.gray400,
  },
  reminderCard: {
    backgroundColor: figmaTokens.colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...figmaTokens.shadows.sm,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  reminderIcon: {
    padding: 10,
    borderRadius: 14,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: figmaTokens.colors.gray900,
  },
  reminderDesc: {
    fontSize: 14,
    color: figmaTokens.colors.gray500,
    marginTop: 2,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: figmaTokens.colors.gray100,
    padding: 12,
    borderRadius: 12,
  },
  timeRowTaken: {
    backgroundColor: figmaTokens.colors.green50,
  },
  timeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: figmaTokens.colors.gray700,
  },
  takenBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  takenText: {
    color: figmaTokens.colors.green600,
    fontWeight: "600",
  },
  markButton: {
    backgroundColor: figmaTokens.colors.blue500,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  markButtonText: {
    color: figmaTokens.colors.white,
    fontWeight: "600",
  },
  appointmentCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: figmaTokens.colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    ...figmaTokens.shadows.sm,
  },
  appointmentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 13,
    color: figmaTokens.colors.gray500,
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
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: figmaTokens.colors.gray50,
    borderWidth: 1,
    borderColor: figmaTokens.colors.gray200,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  pickerText: {
    fontSize: 15,
    color: figmaTokens.colors.gray900,
  },
  frequencyRow: {
    flexDirection: "row",
    gap: 10,
  },
  frequencyChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: figmaTokens.colors.gray100,
  },
  frequencyChipActive: {
    backgroundColor: figmaTokens.colors.blue500,
  },
  frequencyText: {
    color: figmaTokens.colors.gray600,
    fontWeight: "500",
  },
  frequencyTextActive: {
    color: figmaTokens.colors.white,
  },
  saveButton: {
    backgroundColor: figmaTokens.colors.blue500,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    alignItems: "center",
  },
  saveButtonText: {
    color: figmaTokens.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  // Custom Time Picker Styles
  customTimeOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  customTimeContainer: {
    backgroundColor: figmaTokens.colors.white,
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxHeight: 400,
  },
  customTimeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: figmaTokens.colors.gray900,
    textAlign: "center",
    marginBottom: 16,
  },
  customTimeRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  customTimeColumn: {
    alignItems: "center",
  },
  customTimeLabel: {
    fontSize: 14,
    color: figmaTokens.colors.gray500,
    marginBottom: 8,
  },
  customTimeScroll: {
    height: 200,
    width: 80,
  },
  customTimeItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 2,
  },
  customTimeItemActive: {
    backgroundColor: figmaTokens.colors.blue500,
  },
  customTimeItemText: {
    fontSize: 18,
    color: figmaTokens.colors.gray700,
    textAlign: "center",
  },
  customTimeItemTextActive: {
    color: figmaTokens.colors.white,
    fontWeight: "600",
  },
  customTimeSeparator: {
    fontSize: 32,
    fontWeight: "bold",
    color: figmaTokens.colors.gray900,
    marginHorizontal: 10,
  },
  customTimeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  customTimeCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: figmaTokens.colors.gray100,
    alignItems: "center",
  },
  customTimeCancelText: {
    color: figmaTokens.colors.gray700,
    fontSize: 16,
    fontWeight: "600",
  },
  customTimeConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: figmaTokens.colors.blue500,
    alignItems: "center",
  },
  customTimeConfirmText: {
    color: figmaTokens.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
