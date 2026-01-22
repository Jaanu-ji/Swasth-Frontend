import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { getVaccinations } from "../../config/api";

export default function VaccinationScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vaccinationsData, setVaccinationsData] = useState([]);

  const loadVaccinations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVaccinations(user?.email);
      setVaccinationsData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load vaccinations");
      console.error("Vaccinations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (user?.email) {
        loadVaccinations();
      }
    }, [user?.email])
  );

  // Group vaccinations by name for display
  const groupVaccinations = () => {
    const grouped = {};
    vaccinationsData.forEach(vac => {
      const name = vac.name || vac.vaccineName || "Unknown Vaccine";
      if (!grouped[name]) {
        grouped[name] = [];
      }
      grouped[name].push({
        doseNumber: vac.doseNumber || grouped[name].length + 1,
        date: vac.date ? new Date(vac.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : "N/A",
        status: vac.status || "completed",
      });
    });

    return Object.keys(grouped).map(name => ({
      name,
      doses: grouped[name].sort((a, b) => a.doseNumber - b.doseNumber),
    }));
  };

  const vaccinations = groupVaccinations();

  // Calculate stats
  const calculateStats = () => {
    const completed = vaccinationsData.filter(v => v.status === "completed").length;
    const upcoming = vaccinationsData.filter(v => v.status === "upcoming").length;
    const scheduled = vaccinationsData.filter(v => v.status === "scheduled").length;
    return { completed, upcoming, scheduled };
  };

  const stats = calculateStats();

  const getIcon = (status) => {
    switch (status) {
      case "completed":
        return <Icon name="check-circle" size={22} color="#16a34a" />;
      case "upcoming":
        return <Icon name="alert-circle" size={22} color="#ea580c" />;
      case "scheduled":
        return <Icon name="clock" size={22} color="#3b82f6" />;
      default:
        return null;
    }
  };

  const getBorderColor = (status) => {
    switch (status) {
      case "completed":
        return "#dcfce7";
      case "upcoming":
        return "#ffedd5";
      case "scheduled":
        return "#dbeafe";
      default:
        return "#f3f4f6";
    }
  };

  const getBackgroundColor = (status) => {
    switch (status) {
      case "completed":
        return "#f0fdf4";
      case "upcoming":
        return "#fff7ed";
      case "scheduled":
        return "#eff6ff";
      default:
        return "#f9fafb";
    }
  };

  // Shared Header Component
  const Header = () => (
    <View
      style={{
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 20, color: "#111827" }}>
          Vaccination Records
        </Text>
      </View>
    </View>
  );

  // Show loading state
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <Header />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={{ marginTop: 12, color: "#6b7280" }}>Loading vaccinations...</Text>
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
            onPress={loadVaccinations}
            style={{
              marginTop: 20,
              backgroundColor: "#7c3aed",
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

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <Header />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <View
          style={{
            backgroundColor: "#8b5cf6",
            padding: 20,
            borderRadius: 20,
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.3)",
                padding: 10,
                borderRadius: 50,
                marginRight: 10,
              }}
            >
              <Icon name="needle" size={26} color="white" />
            </View>
            <View>
              <Text style={{ color: "white", fontSize: 18 }}>
                {user?.name || "User"}
              </Text>
              <Text style={{ color: "#fce7f3" }}>Vaccination Records</Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            <View>
              <Text style={{ color: "#fce7f3" }}>Completed</Text>
              <Text style={{ color: "white", fontSize: 22 }}>{stats.completed}</Text>
            </View>

            <View>
              <Text style={{ color: "#fce7f3" }}>Upcoming</Text>
              <Text style={{ color: "white", fontSize: 22 }}>{stats.upcoming}</Text>
            </View>

            <View>
              <Text style={{ color: "#fce7f3" }}>Scheduled</Text>
              <Text style={{ color: "white", fontSize: 22 }}>{stats.scheduled}</Text>
            </View>
          </View>
        </View>

        <Text style={{ marginBottom: 12, fontSize: 18, color: "#111827" }}>
          Vaccination History
        </Text>

        {vaccinations.length === 0 ? (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 32,
              alignItems: "center",
              elevation: 2,
            }}
          >
            <Icon name="needle" size={48} color="#d1d5db" />
            <Text style={{ marginTop: 12, color: "#6b7280", textAlign: "center" }}>
              No vaccination records found
            </Text>
            <Text style={{ marginTop: 4, color: "#9ca3af", fontSize: 14, textAlign: "center" }}>
              Add your vaccination history to keep track
            </Text>
          </View>
        ) : (
          vaccinations.map((vaccine, idx) => (
          <View
            key={idx}
            style={{
              backgroundColor: "white",
              padding: 16,
              marginBottom: 12,
              borderRadius: 20,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View
                style={{
                  backgroundColor: "#ede9fe",
                  padding: 8,
                  borderRadius: 10,
                  marginRight: 10,
                }}
              >
                <Icon name="needle" size={20} color="#7c3aed" />
              </View>
              <Text style={{ fontSize: 16, color: "#111827" }}>{vaccine.name}</Text>
            </View>

            {vaccine.doses.map((dose, dIdx) => (
              <View
                key={dIdx}
                style={{
                  borderWidth: 2,
                  borderColor: getBorderColor(dose.status),
                  backgroundColor: getBackgroundColor(dose.status),
                  padding: 12,
                  borderRadius: 15,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {getIcon(dose.status)}
                  <View style={{ marginLeft: 12 }}>
                    <Text style={{ color: "#111827" }}>Dose {dose.doseNumber}</Text>
                    <Text style={{ color: "#6b7280" }}>{dose.date}</Text>
                  </View>
                </View>

                <View>
                  <Text
                    style={{
                      backgroundColor: "white",
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 12,
                      fontSize: 12,
                      color:
                        dose.status === "completed"
                          ? "#166534"
                          : dose.status === "upcoming"
                          ? "#c2410c"
                          : "#1d4ed8",
                    }}
                  >
                    {dose.status[0].toUpperCase() + dose.status.slice(1)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))
        )}

        <TouchableOpacity
          style={{
            backgroundColor: "#7c3aed",
            paddingVertical: 16,
            borderRadius: 20,
            marginTop: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>
            + Add Vaccination Record
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
