// ✅ AI Insights Screen - Built from Figma AISuggestions.tsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { getAIInsights, generateAIInsights } from '../../config/api';
import figmaTokens from '../../design-system/figmaTokens';
import { HeaderBar } from '../../design-system/HeaderBar';
import { FigmaCard } from '../../design-system/FigmaCard';
import { FigmaButton } from '../../design-system/FigmaButton';

export default function AIInsightsScreen({ navigation }) {
  const { user } = useAuth();
  const [insights, setInsights] = useState([]);
  const [healthGoals, setHealthGoals] = useState([]);
  const [personalizedTips, setPersonalizedTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user?.email) {
      loadInsights();
    }
  }, [user?.email]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await getAIInsights(user.email);

      if (data.insights) setInsights(data.insights);
      if (data.healthGoals) setHealthGoals(data.healthGoals);
      if (data.personalizedTips) setPersonalizedTips(data.personalizedTips);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!user?.email) return;
    setGenerating(true);
    try {
      await generateAIInsights(user.email);
      await loadInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getIconForCategory = (category) => {
    const icons = {
      'Fitness': 'dumbbell',
      'Nutrition': 'food-apple',
      'Hydration': 'water',
      'Sleep': 'moon-waning-crescent',
    };
    return icons[category] || 'lightbulb';
  };

  const getColorForCategory = (category) => {
    const colors = {
      'Fitness': figmaTokens.colors.orange500,
      'Nutrition': figmaTokens.colors.green500,
      'Hydration': figmaTokens.colors.cyan500,
      'Sleep': figmaTokens.colors.indigo500,
    };
    return colors[category] || figmaTokens.colors.purple500;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return { bg: figmaTokens.colors.red100, text: figmaTokens.colors.red700 };
      case 'medium':
        return { bg: figmaTokens.colors.amber100, text: figmaTokens.colors.amber700 };
      case 'low':
        return { bg: figmaTokens.colors.green100, text: figmaTokens.colors.green700 };
      default:
        return { bg: figmaTokens.colors.gray100, text: figmaTokens.colors.gray700 };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <HeaderBar
          title="AI Suggestions"
          onBack={() => navigation.goBack()}
          backgroundColor={figmaTokens.colors.white}
        />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header Card */}
            <LinearGradient
              colors={[figmaTokens.colors.purple500, figmaTokens.colors.pink500]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerCard}
            >
              <View style={styles.headerCardContent}>
                <View style={styles.headerIconBg}>
                  <Icon name="lightbulb" size={24} color={figmaTokens.colors.white} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>Personalized Insights</Text>
                  <Text style={styles.headerSubtitle}>Based on your health data</Text>
                </View>
              </View>
              <Text style={styles.headerDescription}>
                Our AI has analyzed your health patterns and created personalized recommendations to help you achieve your goals.
              </Text>
            </LinearGradient>

            {insights.length === 0 && (
              <FigmaButton
                title="Generate Insights"
                onPress={handleGenerate}
                loading={generating}
                fullWidth
                style={styles.generateButton}
              />
            )}

            {loading && (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color={figmaTokens.colors.purple500} />
                <Text style={styles.loaderText}>Loading insights...</Text>
              </View>
            )}

            {!loading && insights.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Priority Recommendations</Text>
                <View style={styles.insightsList}>
                  {insights.map((insight, index) => {
                    const priorityColors = getPriorityColor(insight.priority);
                    return (
                      <FigmaCard key={index} style={styles.insightCard}>
                        <View style={styles.insightContent}>
                          <View style={[styles.insightIconBg, { backgroundColor: insight.color || getColorForCategory(insight.category) }]}>
                            <Icon name={insight.icon || getIconForCategory(insight.category)} size={24} color={figmaTokens.colors.white} />
                          </View>
                          <View style={styles.insightText}>
                            <View style={styles.insightHeader}>
                              <Text style={styles.insightTitle}>{insight.title}</Text>
                              <View style={[styles.priorityBadge, { backgroundColor: priorityColors.bg }]}>
                                <Text style={[styles.priorityText, { color: priorityColors.text }]}>
                                  {insight.priority}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.insightDescription}>{insight.description}</Text>
                            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                              <Text style={styles.actionButtonText}>{insight.action}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </FigmaCard>
                    );
                  })}
                </View>

                {healthGoals.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Goal Insights</Text>
                    <View style={styles.goalsList}>
                      {healthGoals.map((goal, index) => (
                        <FigmaCard key={index} style={styles.goalCard}>
                          <View style={styles.goalContent}>
                            <View style={styles.goalIconBg}>
                              <Icon name={goal.icon || 'target'} size={20} color={figmaTokens.colors.blue600} />
                            </View>
                            <View style={styles.goalText}>
                              <Text style={styles.goalTitle}>{goal.goal}</Text>
                              <View style={styles.progressBarContainer}>
                                <View style={styles.progressBarBg}>
                                  <LinearGradient
                                    colors={[figmaTokens.colors.blue500, figmaTokens.colors.purple500]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.progressBarFill, { width: `${goal.progress || 0}%` }]}
                                  />
                                </View>
                                <Text style={styles.progressText}>{goal.progress || 0}%</Text>
                              </View>
                              <Text style={styles.goalTip}>{goal.tip}</Text>
                            </View>
                          </View>
                        </FigmaCard>
                      ))}
                    </View>
                  </>
                )}

                {personalizedTips.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Personalized Tips</Text>
                    <FigmaCard style={styles.tipsCard}>
                      <View style={styles.tipsList}>
                        {personalizedTips.map((tip, index) => (
                          <View key={index} style={styles.tipItem}>
                            <View style={styles.tipIcon}>
                              <Icon name="lightbulb-outline" size={16} color={figmaTokens.colors.purple600} />
                            </View>
                            <Text style={styles.tipText}>{tip}</Text>
                          </View>
                        ))}
                      </View>
                    </FigmaCard>
                  </>
                )}
              </>
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
  headerCard: {
    borderRadius: figmaTokens.borderRadius['2xl'],
    padding: figmaTokens.spacing['6'],
    marginBottom: figmaTokens.spacing['6'],
    ...figmaTokens.shadows.md,
  },
  headerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['3'],
    marginBottom: figmaTokens.spacing['3'],
  },
  headerIconBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: figmaTokens.borderRadius.full,
    padding: figmaTokens.spacing['3'],
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.white,
    marginBottom: figmaTokens.spacing['1'],
  },
  headerSubtitle: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.purple100,
  },
  headerDescription: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
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
    color: figmaTokens.colors.mutedForeground,
  },
  sectionTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
    marginBottom: figmaTokens.spacing['4'],
  },
  insightsList: {
    gap: figmaTokens.spacing['3'],
    marginBottom: figmaTokens.spacing['6'],
  },
  insightCard: {
    marginBottom: 0,
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: figmaTokens.spacing['4'],
  },
  insightIconBg: {
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['3'],
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightText: {
    flex: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['2'],
    marginBottom: figmaTokens.spacing['1'],
  },
  insightTitle: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
    flex: 1,
  },
  priorityBadge: {
    borderRadius: figmaTokens.borderRadius.full,
    paddingHorizontal: figmaTokens.spacing['2'],
    paddingVertical: figmaTokens.spacing['0.5'],
  },
  priorityText: {
    fontSize: 12,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
  insightDescription: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
    marginBottom: figmaTokens.spacing['3'],
  },
  actionButton: {
    backgroundColor: figmaTokens.colors.purple100,
    borderRadius: figmaTokens.borderRadius.base,
    paddingHorizontal: figmaTokens.spacing['4'],
    paddingVertical: figmaTokens.spacing['2'],
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: figmaTokens.colors.purple600,
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
  goalsList: {
    gap: figmaTokens.spacing['3'],
    marginBottom: figmaTokens.spacing['6'],
  },
  goalCard: {
    marginBottom: 0,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: figmaTokens.spacing['3'],
  },
  goalIconBg: {
    backgroundColor: figmaTokens.colors.blue100,
    borderRadius: figmaTokens.borderRadius.full,
    padding: figmaTokens.spacing['2'],
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
    marginBottom: figmaTokens.spacing['1'],
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['2'],
    marginBottom: figmaTokens.spacing['2'],
  },
  progressBarBg: {
    flex: 1,
    backgroundColor: figmaTokens.colors.gray200,
    borderRadius: figmaTokens.borderRadius.full,
    height: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: figmaTokens.borderRadius.full,
  },
  progressText: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray600,
    minWidth: 40,
  },
  goalTip: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
  },
  tipsCard: {
    marginBottom: 0,
  },
  tipsList: {
    gap: figmaTokens.spacing['3'],
  },
  tipItem: {
    flexDirection: 'row',
    gap: figmaTokens.spacing['3'],
  },
  tipIcon: {
    backgroundColor: figmaTokens.colors.purple100,
    borderRadius: figmaTokens.borderRadius.full,
    padding: 4,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  tipText: {
    flex: 1,
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray700,
  },
});
