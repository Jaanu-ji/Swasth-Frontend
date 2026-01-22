import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { useMember } from "../../hooks/useMember";
import { getWorkouts } from "../../config/api";

export default function WorkoutsScreen({ navigation }) {
  const { user } = useAuth();
  const { activeMember, isViewingFamily } = useMember();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workouts, setWorkouts] = useState([]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWorkouts(user?.email, activeMember.memberId);
      setWorkouts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load workouts");
      console.error("Workouts error:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (user?.email) {
        loadWorkouts();
      }
    }, [user?.email, activeMember.memberId])
  );

  // Calculate stats from workout data
  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.date || w.createdAt).toISOString().split('T')[0];
      return workoutDate === today;
    });

    const totalCalories = todayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const totalMinutes = todayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);

    return [
      { label: "Steps Today", value: "0", icon: "walk", color: "#3b82f6" },
      { label: "Active Minutes", value: totalMinutes.toString(), icon: "dumbbell", color: "#f97316" },
      { label: "Calories Burned", value: totalCalories.toString(), icon: "fire", color: "#f43f5e" },
    ];
  };

  const stats = calculateStats();

  const workoutCategories = [
    {
      name: "Step Counter",
      description: "Track daily steps",
      icon: "walk",
      color: "#3b82f6",
      screen: "step-counter",
    },
    {
      name: "Exercise Videos",
      description: "Guided workouts",
      icon: "play-circle",
      color: "#8b5cf6",
      screen: "exercise-videos",
    },
  ];

  // Format workouts for display
  const recentWorkouts = workouts.slice(0, 10).map(workout => ({
    name: workout.name || workout.type || "Workout",
    duration: `${workout.duration || 0} min`,
    calories: workout.caloriesBurned || 0,
    time: workout.date ? new Date(workout.date).toLocaleDateString() : "N/A",
    image: workout.image || "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=300&fit=crop",
  }));

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate("Dashboard");
          }}
        >
          <Icon name="arrow-left" size={26} color="#111827" />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 20, color: "#111827" }}>Fitness</Text>
          {isViewingFamily && (
            <Text style={{ fontSize: 14, color: "#3b82f6" }}>{activeMember.name}</Text>
          )}
        </View>
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
          <Text style={{ marginTop: 12, color: "#6b7280" }}>Loading workouts...</Text>
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
            onPress={loadWorkouts}
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

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <Header />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={{
                flex: 1,
                backgroundColor: stat.color,
                borderRadius: 20,
                padding: 16,
              }}
            >
              <Icon name={stat.icon} size={26} color="white" style={{ marginBottom: 6 }} />
              <Text style={{ fontSize: 22, color: "white" }}>{stat.value}</Text>
              <Text style={{ color: "rgba(255,255,255,0.8)" }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, color: "#111827", marginBottom: 12 }}>
            Quick Access
          </Text>

          {workoutCategories.map((category, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleNavigate(category.screen)}
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                padding: 16,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                elevation: 2,
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View
                  style={{
                    backgroundColor: category.color,
                    padding: 10,
                    borderRadius: 14,
                  }}
                >
                  <Icon name={category.icon} size={22} color="white" />
                </View>
                <View>
                  <Text style={{ color: "#111827", fontSize: 16 }}>
                    {category.name}
                  </Text>
                  <Text style={{ color: "#6b7280" }}>
                    {category.description}
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={22} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        <View>
          <Text style={{ fontSize: 18, color: "#111827", marginBottom: 12 }}>
            Recent Workouts
          </Text>

          {recentWorkouts.length === 0 ? (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                padding: 32,
                alignItems: "center",
                elevation: 2,
              }}
            >
              <Icon name="dumbbell" size={48} color="#d1d5db" />
              <Text style={{ marginTop: 12, color: "#6b7280", textAlign: "center" }}>
                No workouts recorded yet
              </Text>
              <Text style={{ marginTop: 4, color: "#9ca3af", fontSize: 14, textAlign: "center" }}>
                Start tracking your fitness journey today
              </Text>
            </View>
          ) : (
            recentWorkouts.map((workout, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  marginBottom: 12,
                  overflow: "hidden",
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <Image
                    source={{ uri: workout.image }}
                    style={{ width: 96, height: 96 }}
                  />
                  <View style={{ flex: 1, padding: 16 }}>
                    <Text style={{ color: "#111827", fontSize: 16, marginBottom: 2 }}>
                      {workout.name}
                    </Text>
                    <Text style={{ color: "#6b7280", marginBottom: 6 }}>
                      {workout.time}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 16 }}>
                      <Text style={{ color: "#3b82f6" }}>{workout.duration}</Text>
                      <Text style={{ color: "#f43f5e" }}>{workout.calories} cal</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
