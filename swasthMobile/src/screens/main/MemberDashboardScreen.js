import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { getFamilyMembers, getHealthLogs } from "../../config/api";

export default function MemberDashboard({ navigation }) {
  const { user } = useAuth();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [member, setMember] = useState(null);
  const [healthLogs, setHealthLogs] = useState([]);

  // Get member ID from route params or use first family member
  const memberId = route.params?.memberId;

  const loadMemberData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load family members
      const familyData = await getFamilyMembers(user?.email);
      const familyMembers = Array.isArray(familyData) ? familyData : [];

      // Find the specific member or use the first one
      let selectedMember = null;
      if (memberId) {
        selectedMember = familyMembers.find(m => (m._id || m.id) === memberId);
      } else if (familyMembers.length > 0) {
        selectedMember = familyMembers[0];
      }

      if (selectedMember) {
        setMember({
          id: selectedMember._id || selectedMember.id,
          name: selectedMember.name || "Family Member",
          age: selectedMember.age || 0,
          relationship: selectedMember.relationship || "Family",
          avatar: selectedMember.avatar || "https://images.unsplash.com/photo-1518295644163-4e9f60057d4e?w=200&h=200&fit=crop",
          height: selectedMember.height,
          weight: selectedMember.weight,
          bloodGroup: selectedMember.bloodGroup,
        });

        // Load health logs for this member
        const logsData = await getHealthLogs(user?.email);
        const allLogs = Array.isArray(logsData) ? logsData : [];
        const memberLogs = allLogs.filter(log =>
          (log.memberId === selectedMember._id || log.memberId === selectedMember.id)
        );
        setHealthLogs(memberLogs);
      }
    } catch (err) {
      setError(err.message || "Failed to load member data");
      console.error("Member dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (user?.email) {
        loadMemberData();
      }
    }, [user?.email, memberId])
  );

  // Calculate health stats from member data
  const healthStats = member ? [
    {
      label: "Height",
      value: member.height ? member.height.toString() : "N/A",
      unit: member.height ? "cm" : "",
      icon: "chart-line",
      bg: "#dbeafe",
      color: "#2563eb"
    },
    {
      label: "Weight",
      value: member.weight ? member.weight.toString() : "N/A",
      unit: member.weight ? "kg" : "",
      icon: "pulse",
      bg: "#dcfce7",
      color: "#16a34a"
    },
    {
      label: "Blood Group",
      value: member.bloodGroup || "N/A",
      unit: "",
      icon: "heart",
      bg: "#ffe4e6",
      color: "#e11d48"
    },
  ] : [];

  // Format recent vitals from health logs
  const recentVitals = healthLogs.slice(0, 3).map(log => ({
    label: log.type ? log.type.charAt(0).toUpperCase() + log.type.slice(1) : "Vital",
    value: `${log.value} ${log.unit || ""}`,
    date: log.createdAt ? new Date(log.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }) : "N/A",
  }));

  // Placeholder for upcoming events - would need separate API
  const upcomingEvents = [
    { name: "Scheduled Checkup", date: "Coming Soon", icon: "calendar", bg: "#3b82f6" },
  ];

  // Shared Header Component
  const Header = () => (
    <LinearGradient
      colors={["#ec4899", "#8b5cf6"]}
      style={{
        paddingBottom: 80,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 20, marginLeft: 10 }}>
          Member Profile
        </Text>
      </View>
    </LinearGradient>
  );

  // Show loading state
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <Header />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: -60 }}>
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={{ marginTop: 12, color: "#6b7280" }}>Loading member data...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <Header />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20, marginTop: -60 }}>
          <Icon name="alert-circle" size={48} color="#ef4444" />
          <Text style={{ marginTop: 12, color: "#111827", fontSize: 16, textAlign: "center" }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={loadMemberData}
            style={{
              marginTop: 20,
              backgroundColor: "#ec4899",
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

  // Show empty state if no member found
  if (!member) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <Header />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20, marginTop: -60 }}>
          <Icon name="account-group" size={48} color="#d1d5db" />
          <Text style={{ marginTop: 12, color: "#6b7280", textAlign: "center" }}>
            No family members found
          </Text>
          <Text style={{ marginTop: 4, color: "#9ca3af", fontSize: 14, textAlign: "center" }}>
            Add family members to view their health profiles
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <Header />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, marginTop: -60, paddingBottom: 80 }}>
        {/* Profile Card */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 30,
            padding: 20,
            marginBottom: 20,
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Image
              source={{ uri: member.avatar }}
              style={{ width: 80, height: 80, borderRadius: 40, marginRight: 16 }}
            />
            <View>
              <Text style={{ fontSize: 18, color: "#111827" }}>{member.name}</Text>
              <Text style={{ color: "#6b7280" }}>
                {member.relationship} • {member.age} years
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {healthStats.map((stat, index) => (
              <View key={index} style={{ alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: stat.bg,
                    padding: 10,
                    borderRadius: 10,
                    marginBottom: 6,
                  }}
                >
                  <Icon name={stat.icon} size={18} color={stat.color} />
                </View>
                <Text style={{ color: "#111827" }}>
                  {stat.value}
                  {stat.unit}
                </Text>
                <Text style={{ color: "#6b7280", fontSize: 12 }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming */}
        <Text style={{ marginBottom: 10, fontSize: 18, color: "#111827" }}>Upcoming</Text>
        {upcomingEvents.map((event, i) => (
          <TouchableOpacity
            key={i}
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            <View
              style={{
                backgroundColor: event.bg,
                padding: 12,
                borderRadius: 14,
                marginRight: 12,
              }}
            >
              <Icon name={event.icon} size={20} color="white" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: "#111827", marginBottom: 2 }}>{event.name}</Text>
              <Text style={{ color: "#6b7280" }}>{event.date}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Recent Vitals */}
        <Text style={{ marginTop: 20, marginBottom: 10, fontSize: 18, color: "#111827" }}>
          Recent Vitals
        </Text>

        <View
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 16,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          {recentVitals.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <Icon name="clipboard-pulse" size={48} color="#d1d5db" />
              <Text style={{ marginTop: 12, color: "#6b7280", textAlign: "center" }}>
                No vitals recorded yet
              </Text>
              <Text style={{ marginTop: 4, color: "#9ca3af", fontSize: 14, textAlign: "center" }}>
                Start tracking health metrics for this member
              </Text>
            </View>
          ) : (
            recentVitals.map((vital, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: idx === recentVitals.length - 1 ? 0 : 14,
                }}
              >
                <View>
                  <Text style={{ color: "#111827" }}>{vital.label}</Text>
                  <Text style={{ color: "#6b7280", fontSize: 12 }}>{vital.date}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: "#111827" }}>{vital.value}</Text>
                  <Text style={{ color: "#16a34a", fontSize: 12 }}>Normal</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
