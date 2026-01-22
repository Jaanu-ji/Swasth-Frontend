import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  Plus,
  Utensils,
  Apple,
  Coffee,
  Moon,
} from "lucide-react-native";
import { useAuth } from '../../hooks/useAuth';
import { useMember } from '../../hooks/useMember';
import { getTodayMeals } from '../../config/api';
import { useFocusEffect } from '@react-navigation/native';

export default function MealPlanner({ navigation }) {
  const { user } = useAuth();
  const { activeMember, isViewingFamily } = useMember();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  const quickActions = [
    { title: "Calorie Tracker", icon: "🔥", route: "CalorieTracker" },
    { title: "Water Tracker", icon: "💧", route: "WaterTracker" },
    { title: "Recipes", icon: "📖", route: "Recipes" },
  ];

  const totalCalories = meals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);
  const calorieGoal = 2000;
  const remainingCalories = Math.max(calorieGoal - totalCalories, 0);
  const progress = Math.min((totalCalories / calorieGoal) * 100, 100);

  async function loadMeals() {
    if (!user?.email) {
      setMeals([]);
      return;
    }
    setLoading(true);
    try {
      console.log('USER EMAIL:', user?.email);
      const res = await getTodayMeals(user.email, activeMember.memberId);
      console.log('MEALS API RESPONSE:', res);
      setMeals(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('Error fetching meals', e);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [user?.email, activeMember.memberId])
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={{ backgroundColor: "white", borderBottomWidth: 1, borderColor: "#e5e7eb" }}>
        <View style={{ padding: 16, flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={26} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text style={{ marginLeft: 10, fontSize: 20, color: "#111827" }}>
              Meal Planner
            </Text>
            {isViewingFamily && (
              <Text style={{ marginLeft: 10, fontSize: 14, color: "#22c55e" }}>{activeMember.name}</Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {/* Calorie Summary */}
        <View
          style={{
            backgroundColor: "#22c55e",
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "white", marginBottom: 10, fontSize: 18 }}>
            Today's Progress
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <View>
              <Text style={{ color: "white", fontSize: 32 }}>{totalCalories}</Text>
              <Text style={{ color: "#dcfce7" }}>of {calorieGoal} calories</Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: "white", fontSize: 28 }}>
                {remainingCalories}
              </Text>
              <Text style={{ color: "#dcfce7" }}>remaining</Text>
            </View>
          </View>

          <View style={{ height: 12, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 20 }}>
            <View
              style={{
                backgroundColor: "white",
                width: `${progress}%`,
                height: "100%",
                borderRadius: 20,
              }}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(action.route)}
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                padding: 16,
                width: "30%",
                alignItems: "center",
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 28 }}>{action.icon}</Text>
              <Text style={{ color: "#111827", marginTop: 6 }}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Meals */}
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={{ fontSize: 18, color: "#111827" }}>Today's Meals</Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('AddMeal')}
                style={{
                  backgroundColor: "#22c55e",
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Plus size={18} color="white" />
                <Text style={{ color: "white", marginLeft: 6 }}>Add</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : meals.length === 0 ? (
              <Text style={{ color: "#6b7280" }}>No meals added today</Text>
            ) : (
              meals.map((meal, index) => {
                console.log('RENDER MEAL:', meal);
                // Map backend type to UI label/icon/color
                const type = (meal.type || '').toLowerCase();
                let Label = 'Meal';
                let Icon = Utensils;
                let color = '#ffffff';
                if (type === 'breakfast') {
                  Label = 'Breakfast';
                  Icon = Coffee;
                  color = '#f59e0b';
                } else if (type === 'lunch') {
                  Label = 'Lunch';
                  Icon = Utensils;
                  color = '#22c55e';
                } else if (type === 'snack') {
                  Label = 'Snack';
                  Icon = Apple;
                  color = '#fb923c';
                } else if (type === 'dinner') {
                  Label = 'Dinner';
                  Icon = Moon;
                  color = '#3b82f6';
                }

                return (
                  <View
                    key={index}
                    style={{
                      backgroundColor: "white",
                      padding: 16,
                      borderRadius: 20,
                      flexDirection: "row",
                      marginBottom: 12,
                      elevation: 2,
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: color,
                        padding: 10,
                        borderRadius: 14,
                        marginRight: 12,
                      }}
                    >
                      <Icon size={20} color="white" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", marginBottom: 4 }}>
                        <Text style={{ fontSize: 16, color: "#111827", marginRight: 6 }}>
                          {Label}
                        </Text>
                        <Text style={{ color: "#6b7280" }}>• {meal.time}</Text>
                      </View>

                      <Text style={{ color: "#6b7280" }}>{meal.name}</Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ color: "#111827" }}>{meal.calories}</Text>
                      <Text style={{ color: "#6b7280" }}>cal</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
      </ScrollView>
    </View>
  );
}
