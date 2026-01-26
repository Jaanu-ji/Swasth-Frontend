// ✅ Health Tracker Screen — FULL FIGMA MATCH (REWRITE)
import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCallback } from "react";

import { getHealthLogs } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';
import { useMember } from '../../hooks/useMember';
import figmaTokens from '../../design-system/figmaTokens';

export default function HealthTrackerScreen({ navigation }) {
  const { user } = useAuth();
  const { activeMember, isViewingFamily } = useMember();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                                   DATA                                     */
  /* -------------------------------------------------------------------------- */

  const loadLogs = useCallback(async (showLoader = false) => {
    if (!user?.email) return;

    try {
      // Only show loading spinner on initial load
      if (showLoader) setLoading(true);

      const res = await getHealthLogs(user.email, activeMember.memberId);

      // Backend already sorts by createdAt DESC, but ensure it's an array
      const sorted = Array.isArray(res)
        ? res.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        : [];

      setLogs(sorted);
      setInitialLoadDone(true);
    } catch (e) {
      console.error('Error loading health logs:', e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email, activeMember.memberId]);

  // Initial load with spinner
  useEffect(() => {
    if (!initialLoadDone) {
      loadLogs(true);
    }
  }, [loadLogs, initialLoadDone]);

  // Reload on screen focus - silent refresh (no loading spinner)
  useFocusEffect(
    useCallback(() => {
      if (initialLoadDone) {
        loadLogs(false);
      }
    }, [loadLogs, initialLoadDone])
  );


  /* -------------------------------------------------------------------------- */
  /*                          DERIVED / FIGMA DATA                               */
  /* -------------------------------------------------------------------------- */

  const latestVitals = useMemo(() => {
    // Build map strictly by log.type (no normalization, no guessing)
    // Only store the first (most recent) log for each type
    const map = {};

    logs.forEach((log) => {
      // Strict type matching - only use exact log.type values
      // Logs are already sorted by createdAt DESC, so first occurrence is latest
      if (log.type && !map[log.type]) {
        map[log.type] = log;
      }
    });

    // Return vitals array - each card reads from map by exact type
    return [
      {
        key: "heartRate",
        label: "Heart Rate",
        value: map.heartRate?.value ?? "--",
        unit: "bpm",
        icon: "heart-pulse",
        color: figmaTokens.colors.rose500,
      },
      {
        key: "bloodPressure",
        label: "Blood Pressure",
        value: map.bloodPressure?.value ?? "--/--",
        unit: "mmHg",
        icon: "heart",
        color: figmaTokens.colors.red500,
      },
      {
        key: "temperature",
        label: "Temperature",
        value: map.temperature?.value ?? "--",
        unit: "°F",
        icon: "thermometer",
        color: figmaTokens.colors.orange500,
      },
      {
        key: "weight",
        label: "Weight",
        value: map.weight?.value ?? "--",
        unit: "kg",
        icon: "scale-bathroom",
        color: figmaTokens.colors.blue500,
      },
      {
        key: "sugar",
        label: "Blood Glucose",
        value: map.sugar?.value ?? "--",
        unit: "mg/dL",
        icon: "water",
        color: figmaTokens.colors.purple500,
      },
    ];
  }, [logs]);


  const recentReadings = useMemo(() => {
    return logs.slice(0, 5);
  }, [logs]);

  /* -------------------------------------------------------------------------- */
  /*                                   UI                                       */
  /* -------------------------------------------------------------------------- */

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={figmaTokens.colors.primary} />
        <Text style={styles.loaderText}>Loading health data…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon
              name="arrow-left"
              size={24}
              color={figmaTokens.colors.gray900}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Health Tracker</Text>
            {isViewingFamily && (
              <Text style={styles.viewingMember}>{activeMember.name}</Text>
            )}
          </View>
        </View>

        {/* CURRENT VITALS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Vitals</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddVitals')}
            >
              <Icon
                name="plus"
                size={16}
                color={figmaTokens.colors.white}
              />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vitalsGrid}>
            {latestVitals.map((vital) => (
              <View key={vital.key} style={styles.vitalCard}>
                <View
                  style={[
                    styles.vitalIcon,
                    { backgroundColor: vital.color },
                  ]}
                >
                  <Icon
                    name={vital.icon}
                    size={20}
                    color={figmaTokens.colors.white}
                  />
                </View>

                <Text style={styles.vitalLabel}>{vital.label}</Text>
                <View style={styles.vitalValueRow}>
                  <Text style={styles.vitalValue}>{vital.value}</Text>
                  <Text style={styles.vitalUnit}>{vital.unit}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* HISTORY BUTTON */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('VitalsHistory')}
        >
          <LinearGradient
            colors={[
              figmaTokens.colors.blue500,
              figmaTokens.colors.purple500,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.historyButton}
          >
            <Icon
              name="calendar"
              size={20}
              color={figmaTokens.colors.white}
            />
            <Text style={styles.historyButtonText}>
              View History & Graphs
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* RECENT READINGS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Readings</Text>

          {recentReadings.length === 0 && (
            <Text style={styles.emptyText}>
              No health records added yet.
            </Text>
          )}

          {recentReadings.map((log, idx) => (
            <View key={idx} style={styles.readingCard}>
              <View>
                <Text style={styles.readingType}>
                  {log.type}
                </Text>
                <Text style={styles.readingDate}>
                  {new Date(log.createdAt).toLocaleString()}
                </Text>
              </View>

              <Text style={styles.readingValue}>
                {log.value}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: figmaTokens.colors.gray50,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: figmaTokens.colors.gray50,
  },
  loaderText: {
    marginTop: 12,
    color: figmaTokens.colors.gray600,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: figmaTokens.spacing['6'],
    backgroundColor: figmaTokens.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: figmaTokens.colors.gray200,
  },
  headerTitle: {
    fontSize: figmaTokens.typography.fontSize.lg,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
  },
  viewingMember: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.blue500,
  },

  section: {
    padding: figmaTokens.spacing['6'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: figmaTokens.spacing['4'],
  },
  sectionTitle: {
    fontSize: figmaTokens.typography.fontSize.lg,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: figmaTokens.colors.blue500,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: figmaTokens.borderRadius.xl,
  },
  addButtonText: {
    color: figmaTokens.colors.white,
    fontSize: figmaTokens.typography.fontSize.sm,
  },

  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: figmaTokens.spacing['4'],
  },
  vitalCard: {
    width: '48%',
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius['2xl'],
    padding: figmaTokens.spacing['4'],
    ...figmaTokens.shadows.sm,
  },
  vitalIcon: {
    padding: 8,
    borderRadius: figmaTokens.borderRadius.xl,
    marginBottom: figmaTokens.spacing['3'],
    alignSelf: 'flex-start',
  },
  vitalLabel: {
    color: figmaTokens.colors.gray600,
    marginBottom: 4,
  },
  vitalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  vitalValue: {
    fontSize: figmaTokens.typography.fontSize.xl,
    color: figmaTokens.colors.gray900,
  },
  vitalUnit: {
    color: figmaTokens.colors.gray500,
  },

  historyButton: {
    marginHorizontal: figmaTokens.spacing['6'],
    marginBottom: figmaTokens.spacing['6'],
    paddingVertical: 16,
    borderRadius: figmaTokens.borderRadius['2xl'],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  historyButtonText: {
    color: figmaTokens.colors.white,
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },

  readingCard: {
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius['2xl'],
    padding: figmaTokens.spacing['4'],
    marginBottom: figmaTokens.spacing['3'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...figmaTokens.shadows.sm,
  },
  readingType: {
    color: figmaTokens.colors.gray900,
    marginBottom: 4,
  },
  readingDate: {
    color: figmaTokens.colors.gray500,
    fontSize: figmaTokens.typography.fontSize.sm,
  },
  readingValue: {
    color: figmaTokens.colors.blue500,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },

  emptyText: {
    color: figmaTokens.colors.gray500,
    marginTop: 8,
  },
});
