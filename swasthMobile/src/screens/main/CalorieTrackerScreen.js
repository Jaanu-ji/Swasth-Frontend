import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, Search, Plus } from "lucide-react-native";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { getTodayMeals } from "../../config/api";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function CalorieTracker({ navigation }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meals, setMeals] = useState([]);

  const loadMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodayMeals(user?.email);
      setMeals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load meals");
      console.error("Meals error:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (user?.email) {
        loadMeals();
      }
    }, [user?.email])
  );

  // Calculate totals from meals
  const calculateTotals = () => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };

    meals.forEach(meal => {
      totals.calories += meal.calories || 0;
      totals.protein += meal.protein || 0;
      totals.carbs += meal.carbs || 0;
      totals.fat += meal.fat || 0;
    });

    return totals;
  };

  const totals = calculateTotals();
  const totalCalories = totals.calories;
  const goal = 2000; // This could come from user profile

  const macroData = [
    { name: "Protein", value: totals.protein, color: "#3b82f6" },
    { name: "Carbs", value: totals.carbs, color: "#10b981" },
    { name: "Fat", value: totals.fat, color: "#f59e0b" },
  ];

  // Format meals as recent foods for display
  const recentFoods = meals.slice(0, 10).map(meal => ({
    name: meal.name || meal.foodName || "Food Item",
    serving: meal.serving || meal.servingSize || "1 serving",
    calories: meal.calories || 0,
    protein: meal.protein || 0,
    carbs: meal.carbs || 0,
    fat: meal.fat || 0,
  }));

  const screenWidth = Dimensions.get("window").width;

  // Shared Header Component
  const Header = () => (
    <View style={{ backgroundColor: "white", borderBottomWidth: 1, borderColor: "#e5e7eb" }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={{ marginLeft: 8, fontSize: 20, color: "#111827" }}>
          Calorie Tracker
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
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={{ marginTop: 12, color: "#6b7280" }}>Loading meals...</Text>
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
            onPress={loadMeals}
            style={{
              marginTop: 20,
              backgroundColor: "#10b981",
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
        {/* Summary Card */}
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 20,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 5,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={{ color: "#6b7280" }}>Consumed</Text>
              <Text style={{ fontSize: 30, color: "#111827" }}>{totalCalories}</Text>
              <Text style={{ color: "#6b7280" }}>of {goal} cal</Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: "#6b7280" }}>Remaining</Text>
              <Text style={{ fontSize: 30, color: "#16a34a" }}>{goal - totalCalories}</Text>
              <Text style={{ color: "#6b7280" }}>cal</Text>
            </View>
          </View>

          {totalCalories > 0 ? (
            <View style={{ marginTop: 20 }}>
              <PieChart
                data={macroData.map((m) => ({
                  name: m.name,
                  population: m.value > 0 ? m.value : 1,
                  color: m.color,
                  legendFontColor: "#111827",
                  legendFontSize: 12,
                }))}
                width={screenWidth - 64}
                height={200}
                chartConfig={{
                  color: () => `rgba(0,0,0,0.8)`,
                  labelColor: () => "#111827",
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
              />

              {/* Legend */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
                {macroData.map((macro, index) => (
                  <View key={index} style={{ alignItems: "center" }}>
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: macro.color,
                      }}
                    />
                    <Text style={{ color: "#111827", marginTop: 4 }}>{Math.round(macro.value)}g</Text>
                    <Text style={{ color: "#6b7280" }}>{macro.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={{ marginTop: 20, alignItems: "center" }}>
              <Icon name="food-apple" size={48} color="#d1d5db" />
              <Text style={{ marginTop: 12, color: "#6b7280", textAlign: "center" }}>
                No meals logged yet today
              </Text>
              <Text style={{ marginTop: 4, color: "#9ca3af", fontSize: 14, textAlign: "center" }}>
                Start tracking your meals to see your macros
              </Text>
            </View>
          )}
        </View>

        {/* Search */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ position: "relative" }}>
            <Search
              size={22}
              color="#9ca3af"
              style={{ position: "absolute", left: 12, top: 12 }}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search foods..."
              style={{
                backgroundColor: "white",
                paddingVertical: 12,
                paddingLeft: 48,
                paddingRight: 16,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#d1d5db",
              }}
            />
          </View>
        </View>

        {/* Recent Foods */}
        <Text style={{ fontSize: 18, color: "#111827", marginBottom: 12 }}>Quick Add</Text>

        {recentFoods.map((food, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "white",
              padding: 16,
              borderRadius: 16,
              marginBottom: 12,
              flexDirection: "row",
              justifyContent: "space-between",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: "#111827" }}>{food.name}</Text>
              <Text style={{ color: "#6b7280", marginBottom: 6 }}>{food.serving}</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Text style={{ color: "#2563eb" }}>{food.protein}g P</Text>
                <Text style={{ color: "#16a34a" }}>{food.carbs}g C</Text>
                <Text style={{ color: "#f59e0b" }}>{food.fat}g F</Text>
              </View>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text style={{ marginBottom: 6, color: "#111827" }}>{food.calories}</Text>
              <TouchableOpacity style={{ backgroundColor: "#3b82f6", padding: 8, borderRadius: 10 }}>
                <Plus size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
