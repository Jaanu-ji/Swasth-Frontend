// ✅ Dashboard Screen - Redesigned
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState, useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { useMember } from '../../hooks/useMember';
import { useFocusEffect } from '@react-navigation/native';
import figmaTokens from '../../design-system/figmaTokens';

export default function DashboardScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const { activeMember, isViewingFamily } = useMember();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Refresh on focus if needed
    }, [user?.email, activeMember.memberId])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  // Main features - 5 items
  const mainFeatures = [
    { title: 'Health Tracker', icon: 'heart-pulse', screen: 'HealthTracker', color: figmaTokens.colors.rose500 },
    { title: 'Family Profiles', icon: 'account-group', screen: 'Family', color: figmaTokens.colors.blue500 },
    { title: 'Health History', icon: 'folder-heart', screen: 'HealthHistory', color: figmaTokens.colors.orange500 },
    { title: 'Analytics', icon: 'chart-line', screen: 'HealthAnalytics', color: figmaTokens.colors.purple500 },
    { title: 'Reminders', icon: 'bell-ring', screen: 'Reminders', color: figmaTokens.colors.yellow600 },
  ];

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <LinearGradient
            colors={[figmaTokens.colors.blue500, figmaTokens.colors.purple500]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>
                {isViewingFamily ? activeMember.name : (user?.name || 'User')}
              </Text>
              {isViewingFamily && (
                <Text style={styles.viewingAs}>Viewing family member</Text>
              )}
            </View>
          </LinearGradient>

          <View style={styles.content}>
            {/* Quick Actions - Emergency Card & Report Scanner */}
            <View style={styles.quickActionsContainer}>
              {/* Emergency Card */}
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => handleNavigate('EmergencyCard')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionGradient}
                >
                  <View style={styles.quickActionLeft}>
                    <View style={styles.quickActionIconBg}>
                      <Icon name="shield-account" size={28} color="#EF4444" />
                    </View>
                    <View style={styles.quickActionTextContainer}>
                      <Text style={styles.quickActionTitle}>Emergency Card</Text>
                      <Text style={styles.quickActionSubtitle}>Medical info for emergencies</Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={24} color="rgba(255,255,255,0.8)" />
                </LinearGradient>
              </TouchableOpacity>

              {/* Report Scanner */}
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => handleNavigate('OCR')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionGradient}
                >
                  <View style={styles.quickActionLeft}>
                    <View style={styles.quickActionIconBg}>
                      <Icon name="file-document-outline" size={28} color="#8B5CF6" />
                    </View>
                    <View style={styles.quickActionTextContainer}>
                      <Text style={styles.quickActionTitle}>Report Scanner</Text>
                      <Text style={styles.quickActionSubtitle}>AI-powered report analysis</Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={24} color="rgba(255,255,255,0.8)" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Main Features */}
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.mainFeaturesContainer}>
              {/* First Row - 3 items */}
              <View style={styles.mainFeaturesRow}>
                {mainFeatures.slice(0, 3).map((feature, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleNavigate(feature.screen)}
                    style={styles.mainFeatureCard}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.mainFeatureIconBg, { backgroundColor: feature.color }]}>
                      <Icon name={feature.icon} size={26} color={figmaTokens.colors.white} />
                    </View>
                    <Text style={styles.mainFeatureTitle}>{feature.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Second Row - 2 items centered */}
              <View style={styles.mainFeaturesRowCentered}>
                {mainFeatures.slice(3, 5).map((feature, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleNavigate(feature.screen)}
                    style={styles.mainFeatureCardWide}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.mainFeatureIconBg, { backgroundColor: feature.color }]}>
                      <Icon name={feature.icon} size={26} color={figmaTokens.colors.white} />
                    </View>
                    <Text style={styles.mainFeatureTitle}>{feature.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Additional Quick Links */}
            <View style={styles.quickLinksContainer}>
              <TouchableOpacity
                style={styles.quickLinkCard}
                onPress={() => handleNavigate('Diet')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickLinkIconBg, { backgroundColor: figmaTokens.colors.green100 }]}>
                  <Icon name="food-apple" size={22} color={figmaTokens.colors.green600} />
                </View>
                <Text style={styles.quickLinkTitle}>Meal Planner</Text>
                <Icon name="chevron-right" size={18} color={figmaTokens.colors.gray400} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickLinkCard}
                onPress={() => handleNavigate('AIInsights')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickLinkIconBg, { backgroundColor: figmaTokens.colors.amber100 }]}>
                  <Icon name="lightbulb-on" size={22} color={figmaTokens.colors.amber600} />
                </View>
                <Text style={styles.quickLinkTitle}>AI Suggestions</Text>
                <Icon name="chevron-right" size={18} color={figmaTokens.colors.gray400} />
              </TouchableOpacity>
            </View>
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
  headerGradient: {
    paddingTop: figmaTokens.spacing['8'],
    paddingBottom: figmaTokens.spacing['10'],
    paddingHorizontal: figmaTokens.spacing['6'],
    borderBottomLeftRadius: figmaTokens.borderRadius['3xl'],
    borderBottomRightRadius: figmaTokens.borderRadius['3xl'],
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: figmaTokens.typography.fontSize['2xl'],
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.white,
    marginBottom: figmaTokens.spacing['1'],
  },
  userName: {
    fontSize: figmaTokens.typography.fontSize.lg,
    color: figmaTokens.colors.blue100,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
  viewingAs: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.yellow300,
    marginTop: figmaTokens.spacing['2'],
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: figmaTokens.spacing['3'],
    paddingVertical: figmaTokens.spacing['1'],
    borderRadius: figmaTokens.borderRadius.full,
  },
  content: {
    padding: figmaTokens.spacing['5'],
    marginTop: -figmaTokens.spacing['6'],
  },
  // Quick Actions (Emergency Card & Report Scanner)
  quickActionsContainer: {
    gap: figmaTokens.spacing['3'],
    marginBottom: figmaTokens.spacing['6'],
  },
  quickActionCard: {
    borderRadius: figmaTokens.borderRadius['2xl'],
    overflow: 'hidden',
    ...figmaTokens.shadows.md,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: figmaTokens.spacing['5'],
    paddingHorizontal: figmaTokens.spacing['5'],
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['4'],
    flex: 1,
  },
  quickActionIconBg: {
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['3'],
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionTextContainer: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: figmaTokens.typography.fontSize.lg,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.white,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  // Section Title
  sectionTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.gray900,
    marginBottom: figmaTokens.spacing['4'],
  },
  // Main Features
  mainFeaturesContainer: {
    marginBottom: figmaTokens.spacing['6'],
  },
  mainFeaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: figmaTokens.spacing['4'],
  },
  mainFeaturesRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: figmaTokens.spacing['4'],
  },
  mainFeatureCard: {
    width: '31%',
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius['2xl'],
    paddingVertical: figmaTokens.spacing['5'],
    paddingHorizontal: figmaTokens.spacing['3'],
    ...figmaTokens.shadows.sm,
    alignItems: 'center',
  },
  mainFeatureCardWide: {
    width: '40%',
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius['2xl'],
    paddingVertical: figmaTokens.spacing['5'],
    paddingHorizontal: figmaTokens.spacing['3'],
    ...figmaTokens.shadows.sm,
    alignItems: 'center',
  },
  mainFeatureIconBg: {
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['3'],
    marginBottom: figmaTokens.spacing['3'],
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainFeatureTitle: {
    fontSize: figmaTokens.typography.fontSize.sm,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray800,
    textAlign: 'center',
  },
  // Quick Links
  quickLinksContainer: {
    gap: figmaTokens.spacing['3'],
  },
  quickLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius.xl,
    paddingVertical: figmaTokens.spacing['4'],
    paddingHorizontal: figmaTokens.spacing['4'],
    ...figmaTokens.shadows.sm,
  },
  quickLinkIconBg: {
    borderRadius: figmaTokens.borderRadius.lg,
    padding: figmaTokens.spacing['2'],
    marginRight: figmaTokens.spacing['3'],
  },
  quickLinkTitle: {
    flex: 1,
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray800,
  },
});
