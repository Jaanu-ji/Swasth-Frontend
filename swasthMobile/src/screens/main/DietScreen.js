// ✅ Diet Screen - Built from Figma MealPlanner.tsx
import { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { generateDiet, fetchDietHistory, fetchMealsByDate } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native';
import figmaTokens from '../../design-system/figmaTokens';
import { HeaderBar } from '../../design-system/HeaderBar';
import { FigmaCard } from '../../design-system/FigmaCard';
import { FigmaButton } from '../../design-system/FigmaButton';

export default function DietScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('');
  const [planData, setPlanData] = useState(null);
  const [error, setError] = useState('');
  const [meals, setMeals] = useState([]);
  const [mealsLoading, setMealsLoading] = useState(false);
  const fade = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (user?.email) {
      loadDietHistory();
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      // load today's meals on mount
      loadMeals(getTodayDate());
    }
  }, [user?.email]);

  // Reload latest plan on screen focus
  useFocusEffect(
    useCallback(() => {
      if (user?.email) {
        loadDietHistory();
        loadMeals(getTodayDate());
      }
    }, [user?.email])
  );

  const loadDietHistory = async () => {
    try {
      setError('');
      const history = await fetchDietHistory(user.email);
      const items = Array.isArray(history) ? history : [];
      if (items.length > 0) {
        // ensure sorted by createdAt DESC and pick latest
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const latest = items[0];
        setPlan(latest.plan || '');
        setPlanData(latest);
        Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      } else {
        // no plan available
        setPlan('');
        setPlanData(null);
      }
    } catch (err) {
      console.error('Error loading diet:', err);
      setError('Unable to load diet plan. Please try again later.');
    }
  };

  const handleGenerate = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      setError('');
      const response = await generateDiet(user.email);
      setPlan(response.plan || '');
      setPlanData(response);
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } catch (error) {
      console.error('Error generating diet:', error);
      setError('Failed to generate diet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const loadMeals = async (date) => {
    if (!user?.email || !date) return;
    setMealsLoading(true);
    try {
      const res = await fetchMealsByDate(user.email, date);
      const items = Array.isArray(res) ? res : [];
      // sort by time ascending (server already sorts, but ensure fallback)
      items.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      setMeals(items);
    } catch (err) {
      console.error('Error loading meals:', err);
      setMeals([]);
    } finally {
      setMealsLoading(false);
    }
  };

  // Calories must come only from backend. If missing, show placeholder.
  const calorieGoal = 2000;
  // Compute total calories eaten today from backend `meals` (source of truth).
  // Do NOT use the generated diet plan's calories for the progress bar.
  const totalCalories = Array.isArray(meals)
    ? meals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0)
    : 0;
  const remainingCalories = Math.max(calorieGoal - totalCalories, 0);
  const progress = Math.min((totalCalories / calorieGoal) * 100, 100);

  // meals array is loaded from backend. UI mapping below converts backend meals
  // to the existing card shape. Meals are for today's date (YYYY-MM-DD).
  const todaysMeals = meals.map((m) => {
    const typeMap = {
      breakfast: { label: 'Breakfast', icon: 'coffee', color: figmaTokens.colors.amber500 },
      lunch: { label: 'Lunch', icon: 'silverware-fork-knife', color: figmaTokens.colors.green500 },
      snack: { label: 'Snack', icon: 'food-apple', color: figmaTokens.colors.orange500 },
      dinner: { label: 'Dinner', icon: 'moon-waning-crescent', color: figmaTokens.colors.blue500 },
    };
    const meta = typeMap[m.type] || { label: m.type, icon: 'food', color: figmaTokens.colors.gray100 };
    return {
      type: meta.label,
      icon: meta.icon,
      time: m.time || '',
      meal: m.name || '',
      calories: m.calories != null ? m.calories : '--',
      color: meta.color,
    };
  });

  const quickActions = [
    { title: 'Calorie Tracker', description: 'Track daily calories', icon: '🔥', screen: 'CalorieTracker' },
    { title: 'Water Tracker', description: 'Monitor hydration', icon: '💧', screen: 'WaterTracker' },
    { title: 'Recipes', description: 'Healthy meal ideas', icon: '📖', screen: 'Recipes' },
  ];

  // Note: Calorie and Water trackers rely on HealthLog backend entries.

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <HeaderBar
          title="Meal Planner"
          onBack={() => navigation.goBack()}
          backgroundColor={figmaTokens.colors.white}
        />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {plan && (
              <>
                {/* Calorie Summary - EXACT Figma lines 69-87 */}
                <LinearGradient
                  colors={[figmaTokens.colors.green500, figmaTokens.colors.emerald500]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.calorieCard}
                >
                  <Text style={styles.calorieTitle}>Today's Progress</Text>
                  <View style={styles.calorieStats}>
                    <View>
                      <Text style={styles.calorieValue}>{totalCalories != null ? totalCalories : '--'}</Text>
                      <Text style={styles.calorieLabel}>of {calorieGoal} calories</Text>
                    </View>
                    <View style={styles.calorieRemaining}>
                      <Text style={styles.calorieRemainingValue}>{remainingCalories}</Text>
                      <Text style={styles.calorieLabel}>remaining</Text>
                    </View>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                  </View>
                </LinearGradient>

                {/* Quick Actions - EXACT Figma lines 89-101 */}
                <View style={styles.quickActionsGrid}>
                  {quickActions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quickActionCard}
                      onPress={() => navigation.navigate(action.screen)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.quickActionIcon}>{action.icon}</Text>
                      <Text style={styles.quickActionTitle}>{action.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Today's Meals - EXACT Figma lines 103-139 */}
                <View style={styles.mealsSection}>
                  <View style={styles.mealsHeader}>
                    <Text style={styles.mealsTitle}>Today's Meals</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      activeOpacity={0.7}
                      // Navigate to AddMeal screen
                      onPress={() => navigation.navigate('AddMeal')}
                    >
                      <Icon name="plus" size={16} color={figmaTokens.colors.white} />
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.mealsList}>
                    {mealsLoading ? (
                      <ActivityIndicator size="small" color={figmaTokens.colors.green500} />
                    ) : todaysMeals.length === 0 ? (
                      <Text style={{ color: figmaTokens.colors.gray500 }}>No meals added today</Text>
                    ) : (
                      todaysMeals.map((meal, index) => (
                        <View key={index} style={styles.mealCard}>
                          <View style={[styles.mealIconBg, { backgroundColor: meal.color }]}>
                            <Icon name={meal.icon} size={24} color={figmaTokens.colors.white} />
                          </View>
                          <View style={styles.mealContent}>
                            <View style={styles.mealHeader}>
                              <Text style={styles.mealType}>{meal.type}</Text>
                              <Text style={styles.mealTime}>• {meal.time}</Text>
                            </View>
                            <Text style={styles.mealName}>{meal.meal}</Text>
                          </View>
                          <View style={styles.mealCalories}>
                            <Text style={styles.mealCaloriesValue}>{meal.calories}</Text>
                            <Text style={styles.mealCaloriesLabel}>cal</Text>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              </>
            )}

            {!plan && !loading && (
              <View style={styles.generateSection}>
                <FigmaButton
                  title="Generate Diet Plan"
                  onPress={handleGenerate}
                  fullWidth
                  style={styles.generateButton}
                />
              </View>
            )}

            {loading && (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color={figmaTokens.colors.green500} />
                <Text style={styles.loaderText}>Generating your personalized diet plan...</Text>
              </View>
            )}

            {error ? (
              <View style={{ marginTop: figmaTokens.spacing['6'] }}>
                <Text style={{ color: figmaTokens.colors.red500 }}>{error}</Text>
              </View>
            ) : null}

            {plan && (
              <Animated.View style={{ opacity: fade, marginTop: figmaTokens.spacing['6'] }}>
                <FigmaCard style={styles.planCard}>
                  <Text style={styles.planText}>{plan}</Text>
                </FigmaCard>
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: figmaTokens.colors.gray50,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: figmaTokens.spacing['6'],
  },
  calorieCard: {
    borderRadius: figmaTokens.borderRadius['2xl'],
    padding: figmaTokens.spacing['6'],
    marginBottom: figmaTokens.spacing['6'],
  },
  calorieTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.white,
    marginBottom: figmaTokens.spacing['4'],
  },
  calorieStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: figmaTokens.spacing['3'],
  },
  calorieValue: {
    fontSize: figmaTokens.typography.fontSize['3xl'],
    fontWeight: figmaTokens.typography.fontWeight.bold,
    color: figmaTokens.colors.white,
    marginBottom: figmaTokens.spacing['1'],
  },
  calorieRemaining: {
    alignItems: 'flex-end',
  },
  calorieRemainingValue: {
    fontSize: figmaTokens.typography.fontSize['2xl'],
    fontWeight: figmaTokens.typography.fontWeight.bold,
    color: figmaTokens.colors.white,
    marginBottom: figmaTokens.spacing['1'],
  },
  calorieLabel: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.green100,
  },
  progressBarBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: figmaTokens.borderRadius.full,
    height: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: figmaTokens.colors.white,
    height: '100%',
    borderRadius: figmaTokens.borderRadius.full,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: figmaTokens.spacing['3'],
    marginBottom: figmaTokens.spacing['6'],
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius['2xl'],
    padding: figmaTokens.spacing['4'],
    alignItems: 'center',
    ...figmaTokens.shadows.sm,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: figmaTokens.spacing['2'],
  },
  quickActionTitle: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
    textAlign: 'center',
  },
  mealsSection: {
    marginBottom: figmaTokens.spacing['6'],
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: figmaTokens.spacing['4'],
  },
  mealsTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
  },
  addButton: {
    backgroundColor: figmaTokens.colors.green500,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: figmaTokens.spacing['4'],
    paddingVertical: figmaTokens.spacing['2'],
    borderRadius: figmaTokens.borderRadius.xl,
    gap: figmaTokens.spacing['2'],
  },
  addButtonText: {
    color: figmaTokens.colors.white,
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
  mealsList: {
    gap: figmaTokens.spacing['3'],
  },
  mealCard: {
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius['2xl'],
    padding: figmaTokens.spacing['4'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['4'],
    ...figmaTokens.shadows.sm,
  },
  mealIconBg: {
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['3'],
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealContent: {
    flex: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['2'],
    marginBottom: figmaTokens.spacing['1'],
  },
  mealType: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
  },
  mealTime: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray500,
  },
  mealName: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
  },
  mealCalories: {
    alignItems: 'flex-end',
  },
  mealCaloriesValue: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
  },
  mealCaloriesLabel: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray500,
  },
  generateSection: {
    marginTop: figmaTokens.spacing['12'],
  },
  generateButton: {
    marginBottom: figmaTokens.spacing['6'],
  },
  loader: {
    alignItems: 'center',
    marginTop: figmaTokens.spacing['12'],
    gap: figmaTokens.spacing['4'],
  },
  loaderText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
  },
  planCard: {
    marginBottom: figmaTokens.spacing['6'],
  },
  planText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray700,
    lineHeight: figmaTokens.typography.lineHeight.normal * figmaTokens.typography.fontSize.base,
  },
});
