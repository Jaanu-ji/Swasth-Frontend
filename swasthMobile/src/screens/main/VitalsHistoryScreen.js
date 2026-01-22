import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { ArrowLeft, Heart, Activity, Weight } from "lucide-react-native";
import { LineChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { getHealthLogs } from "../../config/api";

export default function VitalsHistory({ navigation }) {
  const { user } = useAuth();

  const [heartData, setHeartData] = useState([]);
  const [bpSystolic, setBpSystolic] = useState([]);
  const [bpDiastolic, setBpDiastolic] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [heartLabels, setHeartLabels] = useState([]);
  const [bpLabels, setBpLabels] = useState([]);
  const [weightLabels, setWeightLabels] = useState([]);

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
    labelColor: () => "#6b7280",
    propsForDots: {
      r: "4",
    },
  };

  const processLogs = (logs, type) => {
    const filtered = logs
      .filter((l) => l.type === type)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 7);

    const labels = filtered
      .map((l) => new Date(l.createdAt).getDate().toString())
      .reverse();

    if (type === "heartRate") {
      const data = filtered.map((l) => Number(l.value)).reverse();
      setHeartData(data);
      setHeartLabels(labels);
    } else if (type === "bloodPressure") {
      const systolic = [];
      const diastolic = [];
      filtered
        .map((l) => l.value)
        .reverse()
        .forEach((v) => {
          if (!v || typeof v !== "string") {
            systolic.push(null);
            diastolic.push(null);
            return;
          }
          const parts = v.split("/").map((p) => parseInt(p, 10));
          systolic.push(Number.isNaN(parts[0]) ? null : parts[0]);
          diastolic.push(Number.isNaN(parts[1]) ? null : parts[1]);
        });

      setBpSystolic(systolic);
      setBpDiastolic(diastolic);
      setBpLabels(labels);
    } else if (type === "weight") {
      const data = filtered.map((l) => Number(l.value)).reverse();
      setWeightData(data);
      setWeightLabels(labels);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const load = async () => {
        if (!user?.email) return;
        try {
          const res = await getHealthLogs(user.email);
          if (cancelled) return;
          const logs = Array.isArray(res) ? res : [];

          processLogs(logs, "heartRate");
          processLogs(logs, "bloodPressure");
          processLogs(logs, "weight");
        } catch (e) {
          // silent failure; keep existing UI
        }
      };

      load();

      return () => {
        cancelled = true;
      };
    }, [user])
  );

  const width = Dimensions.get("window").width - 60;

  const renderEmpty = (title) => (
    <View style={{ paddingVertical: 24 }}>
      <Text style={{ color: "#6b7280" }}>No {title} records yet.</Text>
    </View>
  );

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
          <Text style={{ marginLeft: 12, fontSize: 20, color: "#111827" }}>
            Vitals History
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {/* Heart Rate */}
        <View style={{ backgroundColor: "white", padding: 16, borderRadius: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ backgroundColor: "#f43f5e", padding: 8, borderRadius: 10, marginRight: 10 }}>
              <Heart size={20} color="white" />
            </View>
            <View>
              <Text style={{ fontSize: 16, color: "#111827" }}>Heart Rate</Text>
              <Text style={{ color: "#6b7280" }}>Last 7 days</Text>
            </View>
          </View>

          {heartData && heartData.length > 0 ? (
            <LineChart
              data={{ labels: heartLabels, datasets: [{ data: heartData }] }}
              width={width}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 16 }}
            />
          ) : (
            renderEmpty("heart rate")
          )}

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <Text style={{ color: "#374151" }}>
              Average: {heartData && heartData.length ? Math.round(heartData.reduce((s, v) => s + v, 0) / heartData.length) : "-"} bpm
            </Text>
            <Text style={{ color: "#374151" }}>
              Range: {heartData && heartData.length ? `${Math.min(...heartData)}-${Math.max(...heartData)} bpm` : "-"}
            </Text>
          </View>
        </View>

        {/* Blood Pressure */}
        <View style={{ backgroundColor: "white", padding: 16, borderRadius: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ backgroundColor: "#ef4444", padding: 8, borderRadius: 10, marginRight: 10 }}>
              <Activity size={20} color="white" />
            </View>
            <View>
              <Text style={{ fontSize: 16, color: "#111827" }}>Blood Pressure</Text>
              <Text style={{ color: "#6b7280" }}>Last 7 days</Text>
            </View>
          </View>

          {bpSystolic && bpSystolic.some((v) => v != null) ? (
            <LineChart
              data={{
                labels: bpLabels,
                datasets: [
                  { data: bpSystolic, color: () => "#dc2626" },
                  { data: bpDiastolic, color: () => "#f97316" },
                ],
              }}
              width={width}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 16 }}
            />
          ) : (
            renderEmpty("blood pressure")
          )}

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <Text style={{ color: "#ef4444" }}>Systolic</Text>
            <Text style={{ color: "#f97316" }}>Diastolic</Text>
          </View>
        </View>

        {/* Weight */}
        <View style={{ backgroundColor: "white", padding: 16, borderRadius: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ backgroundColor: "#3b82f6", padding: 8, borderRadius: 10, marginRight: 10 }}>
              <Weight size={20} color="white" />
            </View>
            <View>
              <Text style={{ fontSize: 16, color: "#111827" }}>Weight</Text>
              <Text style={{ color: "#6b7280" }}>Last 7 days</Text>
            </View>
          </View>

          {weightData && weightData.length > 0 ? (
            <LineChart
              data={{ labels: weightLabels, datasets: [{ data: weightData }] }}
              width={width}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 16 }}
            />
          ) : (
            renderEmpty("weight")
          )}

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <Text style={{ color: "#16a34a" }}>
              Change: {weightData && weightData.length > 1 ? `${(weightData[weightData.length - 1] - weightData[0]).toFixed(1)} kg` : "-"}
            </Text>
            <Text style={{ color: "#111827" }}>Goal: 65 kg</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
