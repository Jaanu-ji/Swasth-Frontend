import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function RecipesScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Breakfast", "Lunch", "Dinner", "Snacks", "Dessert"];

  const recipes = [
    {
      name: "Avocado Toast",
      image:
        "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop",
      time: "10 min",
      servings: 2,
      calories: 320,
      category: "Breakfast",
      liked: true,
    },
    {
      name: "Grilled Salmon Bowl",
      image:
        "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
      time: "25 min",
      servings: 2,
      calories: 520,
      category: "Lunch",
      liked: false,
    },
    {
      name: "Quinoa Salad",
      image:
        "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=300&fit=crop",
      time: "15 min",
      servings: 4,
      calories: 280,
      category: "Lunch",
      liked: true,
    },
    {
      name: "Berry Smoothie Bowl",
      image:
        "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop",
      time: "5 min",
      servings: 1,
      calories: 240,
      category: "Breakfast",
      liked: false,
    },
    {
      name: "Chicken Stir Fry",
      image:
        "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop",
      time: "20 min",
      servings: 3,
      calories: 380,
      category: "Dinner",
      liked: true,
    },
    {
      name: "Greek Yogurt Parfait",
      image:
        "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
      time: "5 min",
      servings: 1,
      calories: 180,
      category: "Snacks",
      liked: false,
    },
  ];

  const filteredRecipes =
    activeCategory === "All"
      ? recipes
      : recipes.filter((r) => r.category === activeCategory);

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View
        style={{
          backgroundColor: "white",
          borderBottomColor: "#e5e7eb",
          borderBottomWidth: 1,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={{ marginLeft: 10, fontSize: 20, color: "#111827" }}>
            Healthy Recipes
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <View style={{ marginBottom: 16, position: "relative" }}>
          <Icon
            name="magnify"
            size={20}
            color="#9ca3af"
            style={{ position: "absolute", top: 12, left: 12, zIndex: 1 }}
          />

          <TextInput
            placeholder="Search recipes..."
            style={{
              backgroundColor: "white",
              paddingVertical: 12,
              paddingLeft: 40,
              paddingRight: 16,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#d1d5db",
            }}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveCategory(category)}
              style={{
                backgroundColor:
                  activeCategory === category ? "#22c55e" : "white",
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                marginRight: 8,
                borderWidth: activeCategory === category ? 0 : 1,
                borderColor: "#d1d5db",
              }}
            >
              <Text
                style={{
                  color: activeCategory === category ? "white" : "#374151",
                }}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {filteredRecipes.map((recipe, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                marginBottom: 16,
                width: "48%",
                elevation: 2,
              }}
            >
              <View style={{ height: 120, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: "hidden" }}>
                <Image
                  source={{ uri: recipe.image }}
                  style={{ width: "100%", height: "100%" }}
                />

                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    backgroundColor: "rgba(255,255,255,0.9)",
                    padding: 6,
                    borderRadius: 18,
                  }}
                >
                  <Icon
                    name={recipe.liked ? "heart" : "heart-outline"}
                    size={16}
                    color={recipe.liked ? "#e11d48" : "#6b7280"}
                  />
                </TouchableOpacity>
              </View>

              <View style={{ padding: 10 }}>
                <Text style={{ color: "#111827", marginBottom: 4 }}>{recipe.name}</Text>

                <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "center" }}>
                  <Icon name="clock-outline" size={16} color="#6b7280" />
                  <Text style={{ marginLeft: 4, color: "#6b7280", fontSize: 12 }}>
                    {recipe.time}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <Icon name="account-group" size={16} color="#6b7280" />
                  <Text style={{ marginLeft: 4, color: "#6b7280", fontSize: 12 }}>
                    {recipe.servings}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: "#22c55e" }}>{recipe.calories} cal</Text>

                  <TouchableOpacity>
                    <Text style={{ color: "#22c55e" }}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
