import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { ArrowLeft, Plus, Minus, Droplet } from "lucide-react-native";
import { useAuth } from '../../hooks/useAuth';
import { useMember } from '../../hooks/useMember';
import { addWaterLog, fetchTodayWaterLogs, removeLastWaterLog } from '../../config/api';
import { useFocusEffect } from '@react-navigation/native';

export default function WaterTracker({ navigation }) {
  const { user } = useAuth();
  const { activeMember, isViewingFamily } = useMember();
  const [cups, setCups] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const goal = 8;
  const progress = Math.min(goal > 0 ? (cups / goal) * 100 : 0, 100);

  const cupSizes = [
    { label: "1 Cup", value: 1, ml: 250 },
    { label: "2 Cups", value: 2, ml: 500 },
    { label: "3 Cups", value: 3, ml: 750 },
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
          <View>
            <Text style={{ marginLeft: 12, fontSize: 20, color: "#111827" }}>
              Water Tracker
            </Text>
            {isViewingFamily && (
              <Text style={{ marginLeft: 12, fontSize: 14, color: "#06b6d4" }}>
                {activeMember.name}
              </Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {/* Water Visual */}
        <View
          style={{
            backgroundColor: "#ecfeff",
            padding: 24,
            borderRadius: 24,
            marginBottom: 24,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                position: "relative",
                width: 120,
                height: 200,
                marginBottom: 24,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  inset: 0,
                  borderWidth: 4,
                  borderColor: "#06b6d4",
                  borderRadius: 20,
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "#22d3ee",
                    height: `${progress}%`,
                    borderBottomLeftRadius: 20,
                    borderBottomRightRadius: 20,
                  }}
                />
              </View>
              <Droplet
                size={48}
                color="rgba(6,182,212,0.3)"
                style={{
                  position: "absolute",
                  top: "40%",
                  left: "30%",
                }}
              />
            </View>

            <Text style={{ fontSize: 22, color: "#111827", marginBottom: 4 }}>
              {cups} / {goal} Cups
            </Text>
            <Text style={{ color: "#4b5563", marginBottom: 12 }}>
              {cups * 250} ml of {goal * 250} ml
            </Text>

            <View style={{ flexDirection: "row", gap: 20 }}>
              <TouchableOpacity
                onPress={async () => {
                  if (!user?.email || loading) return;
                  if (cups <= 0) return;
                  setLoading(true);
                  try {
                    await removeLastWaterLog(user.email, activeMember.memberId);
                    await loadToday();
                  } catch (e) {
                    console.error('Error removing last water log', e);
                  } finally {
                    setLoading(false);
                  }
                }}
                style={{
                  backgroundColor: "white",
                  padding: 14,
                  borderRadius: 50,
                  elevation: 3,
                }}
              >
                <Minus size={24} color="#1f2937" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (!user?.email || loading) return;
                  // Hard limit: do nothing if already at or above goal
                  if (cups >= goal) return;
                  setLoading(true);
                  try {
                    await addWaterLog(user.email, 1, activeMember.memberId);
                    await loadToday();
                  } catch (e) {
                    console.error('Error adding water log', e);
                  } finally {
                    setLoading(false);
                  }
                }}
                style={{
                  backgroundColor: "#06b6d4",
                  padding: 14,
                  borderRadius: 50,
                  elevation: 3,
                }}
              >
                <Plus size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Add */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, color: "#111827", marginBottom: 12 }}>
            Quick Add
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {cupSizes.map((size, index) => (
              <TouchableOpacity
                key={index}
                onPress={async () => {
                  if (!user?.email || loading) return;
                  // remaining cups for today
                  const remaining = Math.max(goal - cups, 0);
                  const toAdd = Math.min(size.value, remaining);
                  if (toAdd <= 0) return;
                  setLoading(true);
                  try {
                    for (let i = 0; i < toAdd; i++) {
                      await addWaterLog(user.email, 1, activeMember.memberId);
                    }
                    await loadToday();
                  } catch (e) {
                    console.error('Error adding quick water log', e);
                  } finally {
                    setLoading(false);
                  }
                }}
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 16,
                  width: "30%",
                  alignItems: "center",
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#cffafe",
                    padding: 10,
                    borderRadius: 50,
                    marginBottom: 6,
                  }}
                >
                  <Droplet size={20} color="#0891b2" />
                </View>
                <Text style={{ color: "#111827" }}>{size.label}</Text>
                <Text style={{ color: "#6b7280" }}>{size.ml} ml</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* History */}
        <View>
          <Text style={{ fontSize: 18, color: "#111827", marginBottom: 12 }}>
            Today's History
          </Text>

          {loading ? (
            <ActivityIndicator color="#06b6d4" />
          ) : history.length === 0 ? (
            <Text style={{ color: "#6b7280" }}>No water logs for today</Text>
          ) : (
            history.map((entry, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "white",
                padding: 16,
                borderRadius: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: "#cffafe",
                    padding: 10,
                    borderRadius: 10,
                    marginRight: 10,
                  }}
                >
                  <Droplet size={20} color="#0891b2" />
                </View>
                <View>
                  <Text style={{ color: "#111827" }}>{entry.amount}</Text>
                  <Text style={{ color: "#6b7280" }}>{entry.time}</Text>
                </View>
              </View>

              <Text style={{ color: "#06b6d4" }}>{entry.ml} ml</Text>
            </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );

  async function loadToday() {
    if (!user?.email) {
      setCups(0);
      setHistory([]);
      return;
    }

    setLoading(true);
    try {
      // Fetch only today's water logs (UTC-safe)
      const items = await fetchTodayWaterLogs(user.email, activeMember.memberId);
      const arr = Array.isArray(items) ? items : [];

      // Sort latest first
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Count logs as 1 cup each
      const total = arr.length;
      setCups(total);

      const mapped = arr.map((l) => {
        const created = l.createdAt ? new Date(l.createdAt) : new Date();
        const time = created.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const v = 1;
        return { time, amount: `${v} ${v === 1 ? 'cup' : 'cups'}`, ml: v * 250 };
      });

      setHistory(mapped);
    } catch (e) {
      console.error('Error loading today water logs', e);
      setCups(0);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadToday();
    }, [user?.email, activeMember.memberId])
  );
}
