import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { useMember } from "../../hooks/useMember";
import { getReminders } from "../../config/api";

export default function RemindersScreen({ navigation }) {
  const { user } = useAuth();
  const { activeMember, isViewingFamily } = useMember();
  const [activeTab, setActiveTab] = useState("medicine");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remindersData, setRemindersData] = useState([]);

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

  // Separate reminders by type
  const medicineReminders = remindersData
    .filter(r => r.type === "medicine" || r.type === "medication")
    .map(r => ({
      id: r._id || r.id,
      name: r.title || r.name || "Medicine",
      dosage: r.dosage || "1 tablet",
      times: r.times || [r.time] || ["9:00 AM"],
      taken: r.taken || [false],
      color: r.color || "#3b82f6",
    }));

  const appointments = remindersData
    .filter(r => r.type === "appointment")
    .map(r => ({
      id: r._id || r.id,
      title: r.title || "Appointment",
      doctor: r.doctor || "Doctor",
      date: r.date ? new Date(r.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : "N/A",
      time: r.time || "N/A",
      location: r.location || "N/A",
      color: r.color || "#3b82f6",
    }));

  // Shared Header Component
  const Header = () => (
    <View
      style={{
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
      }}
    >
      <View
        style={{
          padding: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={26} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text style={{ marginLeft: 10, fontSize: 20, color: "#111827" }}>Reminders</Text>
            {isViewingFamily && (
              <Text style={{ marginLeft: 10, fontSize: 14, color: "#3b82f6" }}>{activeMember.name}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: "#3b82f6",
            padding: 10,
            borderRadius: 50,
          }}
        >
          <Icon name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", borderTopWidth: 1, borderColor: "#e5e7eb" }}>
        <TouchableOpacity
          onPress={() => setActiveTab("medicine")}
          style={{
            flex: 1,
            paddingVertical: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: activeTab === "medicine" ? "#3b82f6" : "#6b7280" }}>
            Medicine
          </Text>
          {activeTab === "medicine" && (
            <View
              style={{ height: 2, backgroundColor: "#3b82f6", width: "100%", marginTop: 6 }}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("appointments")}
          style={{
            flex: 1,
            paddingVertical: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: activeTab === "appointments" ? "#3b82f6" : "#6b7280" }}>
            Appointments
          </Text>
          {activeTab === "appointments" && (
            <View
              style={{ height: 2, backgroundColor: "#3b82f6", width: "100%", marginTop: 6 }}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Show loading state
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <Header />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ marginTop: 12, color: "#6b7280" }}>Loading reminders...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <Header />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Icon name="alert-circle" size={48} color="#ef4444" />
          <Text style={{ marginTop: 12, color: "#111827", fontSize: 16, textAlign: "center" }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={loadReminders}
            style={{
              marginTop: 20,
              backgroundColor: "#3b82f6",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Calculate medicine stats
  const totalDoses = medicineReminders.reduce((sum, med) => sum + med.times.length, 0);
  const takenDoses = medicineReminders.reduce((sum, med) =>
    sum + med.taken.filter(t => t).length, 0
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <Header />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {activeTab === "medicine" ? (
          <>
            <LinearGradient
              colors={["#3b82f6", "#8b5cf6"]}
              style={{
                borderRadius: 20,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <Text style={{ color: "white", marginBottom: 10, fontSize: 18 }}>
                Today's Medications
              </Text>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ color: "white", fontSize: 32 }}>
                    {takenDoses} / {totalDoses}
                  </Text>
                  <Text style={{ color: "#dbeafe" }}>doses taken</Text>
                </View>

                <View style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: 12, borderRadius: 50 }}>
                  <Icon name="pill" size={34} color="white" />
                </View>
              </View>
            </LinearGradient>

            <Text style={{ marginBottom: 10, fontSize: 18, color: "#111827" }}>Medications</Text>

            {medicineReminders.length === 0 ? (
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 32,
                  alignItems: "center",
                  elevation: 2,
                }}
              >
                <Icon name="pill" size={48} color="#d1d5db" />
                <Text style={{ marginTop: 12, color: "#6b7280", textAlign: "center" }}>
                  No medicine reminders set
                </Text>
                <Text style={{ marginTop: 4, color: "#9ca3af", fontSize: 14, textAlign: "center" }}>
                  Add reminders to track your medications
                </Text>
              </View>
            ) : (
              medicineReminders.map((med) => (
              <View
                key={med.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 16,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: "row", marginBottom: 10 }}>
                  <View
                    style={{
                      backgroundColor: med.color,
                      padding: 10,
                      borderRadius: 14,
                      marginRight: 12,
                    }}
                  >
                    <Icon name="pill" size={20} color="white" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, color: "#111827" }}>{med.name}</Text>
                    <Text style={{ color: "#6b7280" }}>{med.dosage}</Text>
                  </View>
                </View>

                {med.times.map((time, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: med.taken[index] ? "#ecfdf5" : "#f3f4f6",
                      padding: 12,
                      borderRadius: 14,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 10,
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Icon name="clock-outline" size={18} color="#6b7280" />
                      <Text style={{ marginLeft: 6, color: "#111827" }}>{time}</Text>
                    </View>

                    {med.taken[index] ? (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Icon name="check" size={18} color="#16a34a" />
                        <Text style={{ marginLeft: 4, color: "#16a34a" }}>Taken</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#3b82f6",
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 10,
                        }}
                      >
                        <Text style={{ color: "white" }}>Mark Taken</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            ))
            )}
          </>
        ) : (
          <>
            <LinearGradient
              colors={["#22c55e", "#10b981"]}
              style={{
                borderRadius: 20,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <Text style={{ color: "white", fontSize: 18, marginBottom: 10 }}>
                Upcoming Appointments
              </Text>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ color: "white", fontSize: 32 }}>{appointments.length}</Text>
                  <Text style={{ color: "#dcfce7" }}>scheduled</Text>
                </View>

                <View style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: 12, borderRadius: 50 }}>
                  <Icon name="calendar" size={34} color="white" />
                </View>
              </View>
            </LinearGradient>

            <Text style={{ marginBottom: 10, fontSize: 18, color: "#111827" }}>Schedule</Text>

            {appointments.length === 0 ? (
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 32,
                  alignItems: "center",
                  elevation: 2,
                }}
              >
                <Icon name="calendar" size={48} color="#d1d5db" />
                <Text style={{ marginTop: 12, color: "#6b7280", textAlign: "center" }}>
                  No appointments scheduled
                </Text>
                <Text style={{ marginTop: 4, color: "#9ca3af", fontSize: 14, textAlign: "center" }}>
                  Add appointments to keep track of them
                </Text>
              </View>
            ) : (
              appointments.map((app) => (
              <TouchableOpacity
                key={app.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 14,
                  elevation: 2,
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    backgroundColor: app.color,
                    padding: 10,
                    borderRadius: 14,
                    marginRight: 14,
                  }}
                >
                  <Icon name="calendar" size={22} color="white" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#111827", fontSize: 16 }}>{app.title}</Text>
                  <Text style={{ color: "#6b7280", marginBottom: 6 }}>{app.doctor}</Text>

                  <View style={{ flexDirection: "row", marginBottom: 4 }}>
                    <Icon name="clock-outline" size={16} color="#6b7280" />
                    <Text style={{ marginLeft: 4, color: "#6b7280", fontSize: 12 }}>
                      {app.time}
                    </Text>
                  </View>

                  <Text style={{ color: "#6b7280", fontSize: 12 }}>{app.date}</Text>
                  <Text style={{ color: "#6b7280", marginTop: 6 }}>{app.location}</Text>
                </View>

                <Icon name="chevron-right" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
