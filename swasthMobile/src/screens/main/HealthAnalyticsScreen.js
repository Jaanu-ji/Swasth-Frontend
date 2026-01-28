// ✅ Health Analytics Screen - Redesigned with Figma Design System
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { LineChart } from 'react-native-chart-kit';

import { useAuth } from '../../hooks/useAuth';
import { useMember } from '../../hooks/useMember';
import { getHealthLogs } from '../../config/api';
import figmaTokens from '../../design-system/figmaTokens';
import { HeaderBar } from '../../design-system/HeaderBar';
import { FigmaCard } from '../../design-system/FigmaCard';

const screenWidth = Dimensions.get('window').width;

export default function HealthAnalyticsScreen({ navigation }) {
  const { user } = useAuth();
  const { activeMember, isViewingFamily } = useMember();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthScores, setHealthScores] = useState([]);
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
      const steps = dayLogs.filter((x) => x.type === 'steps').reduce((s, x) => s + Number(x.value || 0), 0);
      const water = dayLogs.filter((x) => x.type === 'water').reduce((s, x) => s + Number(x.value || 0), 0);
      const calories = dayLogs.filter((x) => x.type === 'calories').reduce((s, x) => s + Number(x.value || 0), 0);
      const sleep = dayLogs.filter((x) => x.type === 'sleep').reduce((s, x) => s + Number(x.value || 0), 0);
      const heartRates = dayLogs.filter((x) => x.type === 'heartRate').map((x) => Number(x.value || 0));

      const normSteps = steps ? Math.min(steps / stepGoal, 1) : null;
      const normWater = water ? Math.min(water / waterGoal, 1) : null;
      const normCalories = calories ? Math.max(0, 1 - Math.abs(calories - calorieGoal) / calorieGoal) : null;
      const normSleep = sleep ? Math.min(sleep / sleepGoal, 1) : null;
      const normHR = heartRates.length
        ? Math.max(0, 1 - Math.abs(heartRates.reduce((a, b) => a + b, 0) / heartRates.length - 70) / 100)
        : null;

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
      const steps = dayLogs.filter((x) => x.type === 'steps').reduce((s, x) => s + Number(x.value || 0), 0);
      const water = dayLogs.filter((x) => x.type === 'water').reduce((s, x) => s + Number(x.value || 0), 0);
      const calories = dayLogs.filter((x) => x.type === 'calories').reduce((s, x) => s + Number(x.value || 0), 0);
      const sleep = dayLogs.filter((x) => x.type === 'sleep').reduce((s, x) => s + Number(x.value || 0), 0);
      const heartRates = dayLogs.filter((x) => x.type === 'heartRate').map((x) => Number(x.value || 0));

      const normSteps = steps ? Math.min(steps / stepGoal, 1) : null;
      const normWater = water ? Math.min(water / waterGoal, 1) : null;
      const normCalories = calories ? Math.max(0, 1 - Math.abs(calories - calorieGoal) / calorieGoal) : null;
      const normSleep = sleep ? Math.min(sleep / sleepGoal, 1) : null;
      const normHR = heartRates.length
        ? Math.max(0, 1 - Math.abs(heartRates.reduce((a, b) => a + b, 0) / heartRates.length - 70) / 100)
        : null;

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
        const water = dayLogs.filter((x) => x.type === 'water').reduce((s, x) => s + Number(x.value || 0), 0);
        if (water) prevWater.push(Math.min(water / waterGoal, 1));
      });
      avgWaterPrevCalc = safeAvg(prevWater);
    }

    const achievedDays = dailySteps.filter((s) => s >= stepGoal).length;
    const improvedWaterPct = Math.round((avgWaterRecent - avgWaterPrevCalc) * 100);

    if (achievedDays > 0) {
      insightsOut.push({
        title: 'Step Goal',
        description: `Achieved on ${achievedDays}/7 days`,
        value: `${achievedDays} days`,
        icon: 'walk',
        color: figmaTokens.colors.green600,
        bgColor: figmaTokens.colors.green50,
      });
    }

    if (improvedWaterPct !== 0) {
      insightsOut.push({
        title: 'Water Intake',
        description: `${improvedWaterPct > 0 ? 'Improved' : 'Decreased'} by ${Math.abs(improvedWaterPct)}%`,
        value: `${improvedWaterPct > 0 ? '+' : ''}${improvedWaterPct}%`,
        icon: 'water',
        color: improvedWaterPct > 0 ? figmaTokens.colors.blue600 : figmaTokens.colors.red600,
        bgColor: improvedWaterPct > 0 ? figmaTokens.colors.blue50 : figmaTokens.colors.red50,
      });
    }

    const caloriesExceeded = dayKeys
      .map((k) => {
        const dayLogs = byDate[k] || [];
        const calories = dayLogs.filter((x) => x.type === 'calories').reduce((s, x) => s + Number(x.value || 0), 0);
        return calories > calorieGoal;
      })
      .filter(Boolean).length;

    if (caloriesExceeded > 0) {
      insightsOut.push({
        title: 'Calories Alert',
        description: `Exceeded goal on ${caloriesExceeded} day(s)`,
        value: `${caloriesExceeded} days`,
        icon: 'fire',
        color: figmaTokens.colors.orange600,
        bgColor: figmaTokens.colors.orange50,
      });
    }

    return {
      dailyScores,
      dailySteps,
      labels: days.map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]),
      radar,
      overallRecent,
      prevAvg,
      insightsOut,
    };
  };

  const loadData = useCallback(async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [user?.email, activeMember.memberId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Radar Chart Component
  const RadarChart = ({ categories, values }) => {
    const size = 220;
    const center = size / 2;
    const radius = 80;
    const angleStep = (2 * Math.PI) / categories.length;

    const points = values.map((val, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = radius * (isNaN(val) ? 0 : val);
      return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
    });

    const polygonPoints = points.map((p) => p.join(',')).join(' ');

    return (
      <View style={styles.radarContainer}>
        <Svg width={size} height={size}>
          {[1, 0.75, 0.5, 0.25].map((lvl, idx) => (
            <Circle
              key={idx}
              cx={center}
              cy={center}
              r={radius * lvl}
              stroke={figmaTokens.colors.gray200}
              strokeWidth="1"
              fill="none"
            />
          ))}

          {categories.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            return (
              <Line
                key={i}
                x1={center}
                y1={center}
                x2={center + radius * Math.cos(angle)}
                y2={center + radius * Math.sin(angle)}
                stroke={figmaTokens.colors.gray200}
                strokeWidth="1"
              />
            );
          })}

          <Polygon
            points={polygonPoints}
            fill="rgba(99, 102, 241, 0.3)"
            stroke={figmaTokens.colors.primary}
            strokeWidth="2"
          />

          {categories.map((label, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + 20;
            return (
              <SvgText
                key={i}
                x={center + labelRadius * Math.cos(angle)}
                y={center + labelRadius * Math.sin(angle) + 4}
                fontSize="11"
                textAnchor="middle"
                fill={figmaTokens.colors.gray600}
              >
                {label}
              </SvgText>
            );
          })}
        </Svg>
      </View>
    );
  };

  const radarCategories = ['Fitness', 'Nutrition', 'Sleep', 'Mental', 'Hydration', 'Vitals'];

  const getScoreColor = (score) => {
    if (score >= 80) return figmaTokens.colors.green600;
    if (score >= 60) return figmaTokens.colors.blue600;
    if (score >= 40) return figmaTokens.colors.orange600;
    return figmaTokens.colors.red600;
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeaderBar
          title="Health Analytics"
          subtitle={isViewingFamily ? activeMember.name : null}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={figmaTokens.colors.primary} />
          <Text style={styles.loadingText}>Analyzing your health data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBar
        title="Health Analytics"
        subtitle={isViewingFamily ? activeMember.name : null}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Score Card */}
        <LinearGradient
          colors={[figmaTokens.colors.blue500, figmaTokens.colors.purple500]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scoreCard}
        >
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>Overall Health Score</Text>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreBadgeText}>{getScoreLabel(overallScore)}</Text>
            </View>
          </View>

          <View style={styles.scoreValueRow}>
            <Text style={styles.scoreValue}>{overallScore}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>

          <View style={styles.scoreDeltaRow}>
            <Icon
              name={scoreDelta >= 0 ? 'trending-up' : 'trending-down'}
              size={20}
              color={figmaTokens.colors.white}
            />
            <Text style={styles.scoreDeltaText}>
              {scoreDelta >= 0 ? '+' : ''}
              {scoreDelta} points from last week
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${overallScore}%` }]} />
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: figmaTokens.colors.blue50 }]}>
              <Icon name="walk" size={24} color={figmaTokens.colors.blue600} />
            </View>
            <Text style={styles.statValue}>{stepsSeries.reduce((a, b) => a + b, 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Steps</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: figmaTokens.colors.green50 }]}>
              <Icon name="calendar-check" size={24} color={figmaTokens.colors.green600} />
            </View>
            <Text style={styles.statValue}>{healthScores.filter((s) => s >= 0.6).length}</Text>
            <Text style={styles.statLabel}>Good Days</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: figmaTokens.colors.purple50 }]}>
              <Icon name="chart-line" size={24} color={figmaTokens.colors.purple600} />
            </View>
            <Text style={styles.statValue}>{Math.round(safeAvg(healthScores) * 100)}%</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
        </View>

        {/* Activity Chart */}
        <FigmaCard style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <Icon name="chart-areaspline" size={22} color={figmaTokens.colors.blue600} />
            <Text style={styles.cardTitle}>Weekly Activity</Text>
          </View>

          <LineChart
            data={{
              labels: labels.length ? labels : ['', '', '', '', '', '', ''],
              datasets: [
                {
                  data: stepsSeries.length && stepsSeries.some((s) => s > 0) ? stepsSeries : [0, 0, 0, 0, 0, 0, 0],
                },
              ],
            }}
            width={screenWidth - 80}
            height={180}
            chartConfig={{
              backgroundColor: figmaTokens.colors.white,
              backgroundGradientFrom: figmaTokens.colors.white,
              backgroundGradientTo: figmaTokens.colors.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
              labelColor: () => figmaTokens.colors.gray500,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: figmaTokens.colors.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        </FigmaCard>

        {/* Health Balance Radar */}
        <FigmaCard style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <Icon name="radar" size={22} color={figmaTokens.colors.purple600} />
            <Text style={styles.cardTitle}>Health Balance</Text>
          </View>

          <RadarChart categories={radarCategories} values={radarValues} />
        </FigmaCard>

        {/* Key Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Key Insights</Text>

          {insights.length === 0 ? (
            <FigmaCard style={styles.emptyInsights}>
              <Icon name="lightbulb-outline" size={48} color={figmaTokens.colors.gray300} />
              <Text style={styles.emptyTitle}>No insights yet</Text>
              <Text style={styles.emptyText}>Start tracking your health to see personalized insights</Text>
            </FigmaCard>
          ) : (
            insights.map((insight, index) => (
              <FigmaCard key={index} style={styles.insightCard}>
                <View style={styles.insightRow}>
                  <View style={[styles.insightIcon, { backgroundColor: insight.bgColor }]}>
                    <Icon name={insight.icon} size={22} color={insight.color} />
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                    <Text style={styles.insightDescription}>{insight.description}</Text>
                  </View>
                  <View style={[styles.insightBadge, { backgroundColor: insight.bgColor }]}>
                    <Text style={[styles.insightValue, { color: insight.color }]}>{insight.value}</Text>
                  </View>
                </View>
              </FigmaCard>
            ))
          )}
        </View>

        {/* Tips Section */}
        <FigmaCard style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Icon name="lightbulb-on" size={24} color={figmaTokens.colors.yellow600} />
            <Text style={styles.tipsTitle}>Health Tip</Text>
          </View>
          <Text style={styles.tipsText}>
            {overallScore < 50
              ? 'Focus on drinking more water and taking short walks to improve your health score.'
              : overallScore < 75
              ? 'Great progress! Try adding 10 more minutes of activity to reach the next level.'
              : "Excellent work! Maintain your healthy habits and inspire others around you."}
          </Text>
        </FigmaCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: figmaTokens.colors.gray50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: figmaTokens.spacing['4'],
    paddingBottom: figmaTokens.spacing['12'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: figmaTokens.spacing['4'],
  },
  loadingText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
  },

  // Score Card
  scoreCard: {
    borderRadius: figmaTokens.borderRadius['2xl'],
    padding: figmaTokens.spacing['6'],
    marginBottom: figmaTokens.spacing['4'],
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: figmaTokens.spacing['2'],
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: figmaTokens.typography.fontSize.base,
  },
  scoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: figmaTokens.spacing['3'],
    paddingVertical: figmaTokens.spacing['1'],
    borderRadius: figmaTokens.borderRadius.full,
  },
  scoreBadgeText: {
    color: figmaTokens.colors.white,
    fontSize: figmaTokens.typography.fontSize.sm,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
  scoreValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: figmaTokens.spacing['2'],
  },
  scoreValue: {
    color: figmaTokens.colors.white,
    fontSize: 56,
    fontWeight: figmaTokens.typography.fontWeight.bold,
  },
  scoreMax: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: figmaTokens.typography.fontSize.xl,
    marginBottom: 10,
    marginLeft: 4,
  },
  scoreDeltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['2'],
    marginBottom: figmaTokens.spacing['4'],
  },
  scoreDeltaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: figmaTokens.typography.fontSize.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: figmaTokens.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius.full,
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    gap: figmaTokens.spacing['3'],
    marginBottom: figmaTokens.spacing['4'],
  },
  statCard: {
    flex: 1,
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['4'],
    alignItems: 'center',
    ...figmaTokens.shadows.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: figmaTokens.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: figmaTokens.spacing['2'],
  },
  statValue: {
    fontSize: figmaTokens.typography.fontSize.lg,
    fontWeight: figmaTokens.typography.fontWeight.bold,
    color: figmaTokens.colors.gray900,
  },
  statLabel: {
    fontSize: figmaTokens.typography.fontSize.xs,
    color: figmaTokens.colors.gray500,
    marginTop: 2,
  },

  // Chart Card
  chartCard: {
    marginBottom: figmaTokens.spacing['4'],
    padding: figmaTokens.spacing['4'],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['2'],
    marginBottom: figmaTokens.spacing['4'],
  },
  cardTitle: {
    fontSize: figmaTokens.typography.fontSize.lg,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.gray900,
  },
  chart: {
    marginLeft: -16,
    borderRadius: figmaTokens.borderRadius.xl,
  },
  radarContainer: {
    alignItems: 'center',
    paddingVertical: figmaTokens.spacing['2'],
  },

  // Insights
  insightsSection: {
    marginBottom: figmaTokens.spacing['4'],
  },
  sectionTitle: {
    fontSize: figmaTokens.typography.fontSize.lg,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.gray900,
    marginBottom: figmaTokens.spacing['3'],
  },
  insightCard: {
    marginBottom: figmaTokens.spacing['3'],
    padding: figmaTokens.spacing['4'],
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['3'],
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: figmaTokens.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.gray900,
  },
  insightDescription: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray500,
    marginTop: 2,
  },
  insightBadge: {
    paddingHorizontal: figmaTokens.spacing['3'],
    paddingVertical: figmaTokens.spacing['2'],
    borderRadius: figmaTokens.borderRadius.lg,
  },
  insightValue: {
    fontSize: figmaTokens.typography.fontSize.sm,
    fontWeight: figmaTokens.typography.fontWeight.bold,
  },
  emptyInsights: {
    alignItems: 'center',
    padding: figmaTokens.spacing['8'],
    gap: figmaTokens.spacing['2'],
  },
  emptyTitle: {
    fontSize: figmaTokens.typography.fontSize.lg,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray700,
  },
  emptyText: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray500,
    textAlign: 'center',
  },

  // Tips
  tipsCard: {
    backgroundColor: figmaTokens.colors.yellow50,
    borderWidth: 1,
    borderColor: figmaTokens.colors.yellow200,
    padding: figmaTokens.spacing['4'],
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['2'],
    marginBottom: figmaTokens.spacing['2'],
  },
  tipsTitle: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.yellow800,
  },
  tipsText: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.yellow700,
    lineHeight: 20,
  },
});
