import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ArrowLeft, Download, TrendingUp } from "lucide-react-native";
import { LineChart, ProgressChart } from "react-native-chart-kit";
import Svg, { Circle, Line, Polygon, Text as SvgText } from "react-native-svg";
import { useAuth } from "../../hooks/useAuth";
import { useMember } from "../../hooks/useMember";
import { getHealthLogs } from "../../config/api";

export default function HealthAnalyticsScreen({ navigation }) {
  const { user } = useAuth();
  const { activeMember, isViewingFamily } = useMember();
  const screenWidth = Dimensions.get("window").width;

  const [healthScores, setHealthScores] = useState([]); // normalized 0-1 per day
  const [stepsSeries, setStepsSeries] = useState([]);
  const [labels, setLabels] = useState([]);
  const [radarValues, setRadarValues] = useState([0, 0, 0, 0.7, 0, 0]);
  const [overallScore, setOverallScore] = useState(0);
  const [scoreDelta, setScoreDelta] = useState(0);
  const [insights, setInsights] = useState([]);

  const formatDateKey = (d) => d.toISOString().slice(0, 10);

  const lastNDates = (n) => {
    const arr = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(d);
    }
    return arr;
  };

  const safeAvg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  const computeMetrics = (logs) => {
    const days = lastNDates(7);
    const dayKeys = days.map(formatDateKey);

    const byDate = {};
    logs.forEach((l) => {
      const k = formatDateKey(new Date(l.createdAt));
      if (!byDate[k]) byDate[k] = [];
      byDate[k].push(l);
    });

    const stepGoal = 8000;
    const waterGoal = 8;
    const calorieGoal = 2000;
    const sleepGoal = 7;

    const dailyScores = [];
    const dailySteps = [];

    const stepsAvgArr = [];
    const waterAvgArr = [];
    const caloriesAvgArr = [];
    const sleepAvgArr = [];
    const hrAvgArr = [];

    dayKeys.forEach((k) => {
      const dayLogs = byDate[k] || [];
      const steps = dayLogs.filter((x) => x.type === "steps").reduce((s, x) => s + Number(x.value || 0), 0);
      const water = dayLogs.filter((x) => x.type === "water").reduce((s, x) => s + Number(x.value || 0), 0);
      const calories = dayLogs.filter((x) => x.type === "calories").reduce((s, x) => s + Number(x.value || 0), 0);
      const sleep = dayLogs.filter((x) => x.type === "sleep").reduce((s, x) => s + Number(x.value || 0), 0);
      const heartRates = dayLogs.filter((x) => x.type === "heartRate").map((x) => Number(x.value || 0));

      const normSteps = steps ? Math.min(steps / stepGoal, 1) : null;
      const normWater = water ? Math.min(water / waterGoal, 1) : null;
      const normCalories = calories ? Math.max(0, 1 - Math.abs(calories - calorieGoal) / calorieGoal) : null;
      const normSleep = sleep ? Math.min(sleep / sleepGoal, 1) : null;
      const normHR = heartRates.length ? Math.max(0, 1 - (Math.abs((heartRates.reduce((a,b)=>a+b,0)/heartRates.length) - 70) / 100)) : null;

      const comps = [normSteps, normWater, normCalories, normSleep, normHR].filter((v) => v !== null);
      const dayScore = comps.length ? safeAvg(comps) : 0;

      dailyScores.push(dayScore);
      dailySteps.push(steps);

      if (normSteps !== null) stepsAvgArr.push(normSteps);
      if (normWater !== null) waterAvgArr.push(normWater);
      if (normCalories !== null) caloriesAvgArr.push(normCalories);
      if (normSleep !== null) sleepAvgArr.push(normSleep);
      if (normHR !== null) hrAvgArr.push(normHR);
    });

    const radar = [
      safeAvg(stepsAvgArr),
      safeAvg(caloriesAvgArr),
      safeAvg(sleepAvgArr),
      0.7,
      safeAvg(waterAvgArr),
      safeAvg(hrAvgArr),
    ];

    const overallRecent = safeAvg(dailyScores);

    const prevDayKeys = [];
    for (let i = 14 - 1; i >= 7; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      prevDayKeys.push(formatDateKey(d));
    }
    const prevScores = [];
    prevDayKeys.forEach((k) => {
      const dayLogs = logs.filter((l) => formatDateKey(new Date(l.createdAt)) === k);
      const steps = dayLogs.filter((x) => x.type === "steps").reduce((s, x) => s + Number(x.value || 0), 0);
      const water = dayLogs.filter((x) => x.type === "water").reduce((s, x) => s + Number(x.value || 0), 0);
      const calories = dayLogs.filter((x) => x.type === "calories").reduce((s, x) => s + Number(x.value || 0), 0);
      const sleep = dayLogs.filter((x) => x.type === "sleep").reduce((s, x) => s + Number(x.value || 0), 0);
      const heartRates = dayLogs.filter((x) => x.type === "heartRate").map((x) => Number(x.value || 0));

      const normSteps = steps ? Math.min(steps / stepGoal, 1) : null;
      const normWater = water ? Math.min(water / waterGoal, 1) : null;
      const normCalories = calories ? Math.max(0, 1 - Math.abs(calories - calorieGoal) / calorieGoal) : null;
      const normSleep = sleep ? Math.min(sleep / sleepGoal, 1) : null;
      const normHR = heartRates.length ? Math.max(0, 1 - (Math.abs((heartRates.reduce((a,b)=>a+b,0)/heartRates.length) - 70) / 100)) : null;

      const comps = [normSteps, normWater, normCalories, normSleep, normHR].filter((v) => v !== null);
      prevScores.push(comps.length ? safeAvg(comps) : 0);
    });

    const prevAvg = safeAvg(prevScores);

    const insightsOut = [];
    const avgWaterRecent = safeAvg(waterAvgArr);
    let avgWaterPrevCalc = 0;
    if (prevDayKeys.length) {
      const prevWater = [];
      prevDayKeys.forEach((k) => {
        const dayLogs = logs.filter((l) => formatDateKey(new Date(l.createdAt)) === k);
        const water = dayLogs.filter((x) => x.type === "water").reduce((s, x) => s + Number(x.value || 0), 0);
        if (water) prevWater.push(Math.min(water / waterGoal, 1));
      });
      avgWaterPrevCalc = safeAvg(prevWater);
    }

    const achievedDays = dailySteps.filter((s) => s >= stepGoal).length;
    const improvedWaterPct = Math.round((avgWaterRecent - avgWaterPrevCalc) * 100);

    if (achievedDays > 0) {
      insightsOut.push({ title: "Step Goal Achievements", description: `You achieved step goal on ${achievedDays}/7 days`, change: `${achievedDays} days`, color: "#16a34a" });
    }

    if (improvedWaterPct !== 0) {
      insightsOut.push({ title: "Water Intake Change", description: `Water intake changed by ${improvedWaterPct}% this week`, change: `${improvedWaterPct}%`, color: improvedWaterPct > 0 ? "#16a34a" : "#dc2626" });
    }

    const caloriesExceeded = dayKeys.map((k) => {
      const dayLogs = byDate[k] || [];
      const calories = dayLogs.filter((x) => x.type === "calories").reduce((s, x) => s + Number(x.value || 0), 0);
      return calories > calorieGoal;
    }).filter(Boolean).length;

    if (caloriesExceeded > 0) {
      insightsOut.push({ title: "Calories Exceeded", description: `Calories exceeded goal on ${caloriesExceeded} day(s)`, change: `${caloriesExceeded} days`, color: "#f59e0b" });
    }

    return { dailyScores, dailySteps, labels: days.map((d) => String(d.getDate())), radar, overallRecent, prevAvg, insightsOut };
  };

  const load = useCallback(async () => {
    if (!user?.email) return;
    try {
      const logs = await getHealthLogs(user.email, activeMember.memberId);
      const mapped = Array.isArray(logs) ? logs : [];
      const res = computeMetrics(mapped);

      setHealthScores(res.dailyScores);
      setStepsSeries(res.dailySteps);
      setLabels(res.labels);
      setRadarValues(res.radar.map((v) => (isNaN(v) ? 0 : Number(v))));

      const score = Math.round((res.overallRecent || 0) * 100);
      setOverallScore(score);
      const delta = Math.round(((res.overallRecent || 0) - (res.prevAvg || 0)) * 100);
      setScoreDelta(delta);

      setInsights(res.insightsOut);
    } catch (e) {
      setHealthScores([]);
      setStepsSeries([]);
      setLabels([]);
      setRadarValues([0, 0, 0, 0.7, 0, 0]);
      setOverallScore(0);
      setScoreDelta(0);
      setInsights([]);
    }
  }, [user?.email, activeMember.memberId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDownload = () => {
    Alert.alert("Download Report", "Health report will be downloaded");
  };

  const RadarReplacement = ({ categories, values }) => {
    const size = 250;
    const center = size / 2;
    const radius = 90;
    const angleStep = (2 * Math.PI) / categories.length;

    const points = values.map((val, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = radius * (isNaN(val) ? 0 : val);
      return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
    });

    const polygonPoints = points.map((p) => p.join(",")).join(" ");

    return (
      <Svg width={size} height={size}>
        {[1, 0.75, 0.5, 0.25].map((lvl, idx) => (
          <Circle key={idx} cx={center} cy={center} r={radius * lvl} stroke="#e5e7eb" strokeWidth="1" fill="none" />
        ))}

        {categories.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          return (
            <Line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="#e5e7eb" strokeWidth="1" />
          );
        })}

        <Polygon points={polygonPoints} fill="rgba(139, 92, 246, 0.4)" stroke="#8b5cf6" strokeWidth="2" />

        {categories.map((label, i) => {
          const angle = i * angleStep - Math.PI / 2;
          return (
            <SvgText key={i} x={center + (radius + 18) * Math.cos(angle)} y={center + (radius + 18) * Math.sin(angle)} fontSize="10" textAnchor="middle" fill="#374151">
              {label}
            </SvgText>
          );
        })}
      </Svg>
    );
  };

  const radarCategories = ["Fitness", "Nutrition", "Sleep", "Mental", "Hydration", "Vitals"];

  const activityData = {
    labels: labels.length ? labels : ["", "", "", "", "", "", ""],
    datasets: [{ data: stepsSeries.length ? stepsSeries : [0, 0, 0, 0, 0, 0, 0] }],
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={{ backgroundColor: "white", borderBottomWidth: 1, borderColor: "#e5e7eb" }}>
        <View style={{ padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={26} color="#111827" />
            </TouchableOpacity>
            <View>
              <Text style={{ marginLeft: 10, fontSize: 20, color: "#111827" }}>Health Analytics</Text>
              {isViewingFamily && (
                <Text style={{ marginLeft: 10, fontSize: 14, color: "#a855f7" }}>{activeMember.name}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity onPress={handleDownload} style={{ backgroundColor: "#a855f7", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, flexDirection: "row", alignItems: "center" }}>
            <Download size={18} color="white" />
            <Text style={{ color: "white", marginLeft: 6 }}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <View style={{ backgroundColor: "#a855f7", borderRadius: 20, padding: 20, marginBottom: 16 }}>
          <Text style={{ color: "white" }}>Overall Health Score</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <Text style={{ color: "white", fontSize: 48 }}>{overallScore}</Text>
            <Text style={{ color: "#f3e8ff", marginLeft: 6 }}>/100</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TrendingUp size={20} color="white" />
            <Text style={{ color: "white", marginLeft: 6 }}>{scoreDelta >= 0 ? `+${scoreDelta} points from last period` : `${scoreDelta} points from last period`}</Text>
          </View>
        </View>

        <View style={{ backgroundColor: "white", borderRadius: 20, padding: 20, marginBottom: 16 }}>
          <Text style={{ color: "#111827", marginBottom: 10 }}>Health Score Trend</Text>

          <ProgressChart data={{ data: healthScores.length ? healthScores : [0, 0, 0, 0, 0, 0, 0] }} width={screenWidth - 64} height={200} strokeWidth={12} radius={32} chartConfig={{ backgroundGradientFrom: "#fff", backgroundGradientTo: "#fff", color: () => "rgba(139, 92, 246, 0.8)", strokeWidth: 2 }} />
        </View>

        <View style={{ backgroundColor: "white", borderRadius: 20, padding: 20, marginBottom: 16 }}>
          <Text style={{ color: "#111827", marginBottom: 10 }}>Activity Trends</Text>

          <LineChart data={activityData} width={screenWidth - 64} height={220} chartConfig={{ backgroundGradientFrom: "#fff", backgroundGradientTo: "#fff", color: () => "#3b82f6" }} bezier />
        </View>

        <View style={{ backgroundColor: "white", borderRadius: 20, padding: 20, marginBottom: 16, alignItems: "center" }}>
          <Text style={{ color: "#111827", marginBottom: 10 }}>Health Balance</Text>

          <RadarReplacement categories={radarCategories} values={radarValues} />
        </View>

        <View>
          <Text style={{ fontSize: 18, color: "#111827", marginBottom: 12 }}>Key Insights</Text>

          {insights.map((item, index) => (
            <View key={index} style={{ backgroundColor: "white", borderRadius: 20, padding: 16, marginBottom: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={{ color: "#111827", fontSize: 16 }}>{item.title}</Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TrendingUp size={16} color={item.color} />
                  <Text style={{ color: item.color, marginLeft: 4 }}>{item.change}</Text>
                </View>
              </View>

              <Text style={{ color: "#6b7280" }}>{item.description}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={handleDownload} style={{ backgroundColor: "#a855f7", paddingVertical: 14, borderRadius: 20, marginTop: 10, flexDirection: "row", justifyContent: "center" }}>
          <Download size={20} color="white" />
          <Text style={{ color: "white", marginLeft: 8 }}>Download Full Health Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
