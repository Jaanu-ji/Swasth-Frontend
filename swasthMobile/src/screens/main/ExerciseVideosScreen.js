import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import {
  ArrowLeft,
  Play,
  Clock,
  TrendingUp,
  Heart,
} from "lucide-react-native";

export default function ExerciseVideos({ navigation }) {
  const categories = ["All", "Cardio", "Strength", "Yoga", "HIIT", "Pilates"];

  const videos = [
    {
      title: "30-Min Full Body HIIT",
      instructor: "Sarah Johnson",
      duration: "30 min",
      difficulty: "Advanced",
      calories: 350,
      thumbnail:
        "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=250&fit=crop",
      category: "HIIT",
    },
    {
      title: "Morning Yoga Flow",
      instructor: "Emma Wilson",
      duration: "20 min",
      difficulty: "Beginner",
      calories: 120,
      thumbnail:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop",
      category: "Yoga",
    },
    {
      title: "Strength Training Basics",
      instructor: "Mike Chen",
      duration: "45 min",
      difficulty: "Intermediate",
      calories: 280,
      thumbnail:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=250&fit=crop",
      category: "Strength",
    },
    {
      title: "Cardio Dance Workout",
      instructor: "Lisa Martinez",
      duration: "25 min",
      difficulty: "Beginner",
      calories: 200,
      thumbnail:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=250&fit=crop",
      category: "Cardio",
    },
    {
      title: "Core Pilates Session",
      instructor: "Anna Lee",
      duration: "30 min",
      difficulty: "Intermediate",
      calories: 180,
      thumbnail:
        "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&h=250&fit=crop",
      category: "Pilates",
    },
    {
      title: "Evening Stretch & Relax",
      instructor: "David Park",
      duration: "15 min",
      difficulty: "Beginner",
      calories: 80,
      thumbnail:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop",
      category: "Yoga",
    },
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "#16a34a";
      case "Intermediate":
        return "#ca8a04";
      case "Advanced":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={{ marginLeft: 10, fontSize: 20, color: "#111827" }}>
            Exercise Videos
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
        >
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: index === 0 ? "#a855f7" : "white",
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                marginRight: 8,
                borderWidth: index === 0 ? 0 : 1,
                borderColor: "#d1d5db",
              }}
            >
              <Text
                style={{
                  color: index === 0 ? "white" : "#4b5563",
                }}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Video */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            overflow: "hidden",
            marginBottom: 20,
            elevation: 3,
          }}
        >
          <View style={{ position: "relative", height: 180 }}>
            <Image
              source={{ uri: videos[0].thumbnail }}
              style={{ width: "100%", height: "100%" }}
            />
            <View
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
            />

            <View style={{ position: "absolute", top: 10, left: 10 }}>
              <Text
                style={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 16,
                }}
              >
                Featured
              </Text>
            </View>

            <TouchableOpacity
              style={{
                position: "absolute",
                inset: 0,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  padding: 12,
                  borderRadius: 50,
                }}
              >
                <Play size={26} color="#a855f7" />
              </View>
            </TouchableOpacity>

            <View style={{ position: "absolute", bottom: 10, left: 10 }}>
              <Text style={{ color: "white", fontSize: 18 }}>
                {videos[0].title}
              </Text>
              <View style={{ flexDirection: "row", marginTop: 4 }}>
                <Text style={{ color: "white", marginRight: 10 }}>
                  ⏱ {videos[0].duration}
                </Text>
                <Text style={{ color: "white" }}>🔥 {videos[0].calories} cal</Text>
              </View>
            </View>
          </View>
        </View>

        {/* All workouts */}
        <Text style={{ fontSize: 18, color: "#111827", marginBottom: 12 }}>
          All Workouts
        </Text>

        {videos.slice(1).map((video, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              marginBottom: 12,
              flexDirection: "row",
              overflow: "hidden",
              elevation: 2,
            }}
          >
            <Image
              source={{ uri: video.thumbnail }}
              style={{ width: 120, height: 90 }}
            />

            <View style={{ flex: 1, padding: 12 }}>
              <Text style={{ fontSize: 16, color: "#111827" }}>{video.title}</Text>
              <Text style={{ color: "#6b7280", marginBottom: 4 }}>
                {video.instructor}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ color: "#4b5563" }}>{video.duration}</Text>
                <Text style={{ color: getDifficultyColor(video.difficulty) }}>
                  {video.difficulty}
                </Text>
                <Text style={{ color: "#ea580c" }}>{video.calories} cal</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
