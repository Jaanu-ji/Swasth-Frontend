import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ArrowLeft, TrendingUp, Award, Target } from "lucide-react-native";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function StepCounterScreen({ navigation }) {
  const todaySteps = 8234;
  const goal = 10000;
  const progress = (todaySteps / goal) * 100;

  const weeklyData = [
    { day: "Mon", steps: 7234 },
    { day: "Tue", steps: 9123 },
    { day: "Wed", steps: 8456 },
    { day: "Thu", steps: 10234 },
    { day: "Fri", steps: 8934 },
    { day: "Sat", steps: 6789 },
    { day: "Sun", steps: 8234 },
  ];

  const achievements = [
    { title: "5K Steps", icon: "🏃", completed: true },
    { title: "10K Steps", icon: "🎯", completed: false },
    { title: "15K Steps", icon: "🏆", completed: false },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, color: "#111827", marginLeft: 12 }}>
            Step Counter
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {/* Today's Steps */}
        <View
          style={{
            backgroundColor: "#6366f1",
            borderRadius: 24,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Svg width={200} height={200}>
              <Circle
                cx="100"
                cy="100"
                r="90"
                stroke="white"
                strokeWidth="15"
                opacity="0.2"
                fill="none"
              />
              <Circle
                cx="100"
                cy="100"
                r="90"
                stroke="white"
                strokeWidth="15"
                strokeDasharray={`${progress * 5.65} 565`}
                strokeLinecap="round"
                fill="none"
                rotation="-90"
                origin="100, 100"
              />
            </Svg>

            <View
              style={{
                position: "absolute",
                top: "38%",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 36 }}>
                {todaySteps.toLocaleString()}
              </Text>
              <Text style={{ color: "#dbeafe" }}>steps</Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 10,
            }}
          >
            <View>
              <Text style={{ color: "#dbeafe" }}>Goal</Text>
              <Text style={{ color: "white", fontSize: 24 }}>
                {goal.toLocaleString()}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: "#dbeafe" }}>Remaining</Text>
              <Text style={{ color: "white", fontSize: 24 }}>
                {(goal - todaySteps).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: 20,
              padding: 16,
              alignItems: "center",
              elevation: 2,
            }}
          >
            <TrendingUp size={22} color="#16a34a" />
            <Text style={{ fontSize: 18 }}>2.8 km</Text>
            <Text style={{ color: "#6b7280" }}>Distance</Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: 20,
              padding: 16,
              alignItems: "center",
              elevation: 2,
            }}
          >
            <Target size={22} color="#ea580c" />
            <Text style={{ fontSize: 18 }}>220</Text>
            <Text style={{ color: "#6b7280" }}>Calories</Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: 20,
              padding: 16,
              alignItems: "center",
              elevation: 2,
            }}
          >
            <Award size={22} color="#3b82f6" />
            <Text style={{ fontSize: 18 }}>5</Text>
            <Text style={{ color: "#6b7280" }}>Streak</Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
            elevation: 2,
          }}
        >
          <Text style={{ marginBottom: 10, fontSize: 18, color: "#111827" }}>
            This Week
          </Text>

          <BarChart
            data={{
              labels: weeklyData.map((d) => d.day),
              datasets: [{ data: weeklyData.map((d) => d.steps) }],
            }}
            width={Dimensions.get("window").width - 60}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: () => "#3b82f6",
              labelColor: () => "#6b7280",
              barPercentage: 0.6,
            }}
            style={{ borderRadius: 20 }}
          />
        </View>

        {/* Achievements */}
        <Text style={{ marginBottom: 10, fontSize: 18, color: "#111827" }}>
          Daily Goals
        </Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          {achievements.map((a, idx) => (
            <View
              key={idx}
              style={{
                flex: 1,
                backgroundColor: a.completed ? "#f59e0b" : "white",
                padding: 20,
                borderRadius: 20,
                alignItems: "center",
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 30 }}>{a.icon}</Text>
              <Text style={{ color: a.completed ? "white" : "#111827" }}>
                {a.title}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

