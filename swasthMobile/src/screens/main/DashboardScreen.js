// ✅ Dashboard Screen - Built from Figma
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { useMember } from '../../hooks/useMember';
import figmaTokens from '../../design-system/figmaTokens';

export default function DashboardScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const { activeMember, isViewingFamily } = useMember();
  const [refreshing, setRefreshing] = useState(false);

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

  const quickActions = [
    {
      title: 'Emergency Card',
      subtitle: 'Medical info for emergencies',
      icon: 'shield-account',
      screen: 'EmergencyCard',
      color: figmaTokens.colors.rose100,
      iconColor: figmaTokens.colors.rose600,
    },
    {
      title: 'Report Scanner',
      subtitle: 'AI-powered report analysis',
      icon: 'file-document-outline',
      screen: 'OCR',
      color: figmaTokens.colors.purple100,
      iconColor: figmaTokens.colors.purple600,
    },
  ];

  const mainFeatures = [
    { title: 'Health Tracker', icon: 'heart-pulse', screen: 'HealthTracker', color: figmaTokens.colors.rose500 },
    { title: 'Family Profiles', icon: 'account-group', screen: 'Family', color: figmaTokens.colors.blue500 },
    { title: 'Meal Planner', icon: 'food-apple', screen: 'Diet', color: figmaTokens.colors.green500 },
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
          {/* Header with Quick Stats */}
          <LinearGradient
            colors={[figmaTokens.colors.blue500, figmaTokens.colors.purple500]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.userName}>
                  {isViewingFamily ? activeMember.name : (user?.name || 'User')}
                </Text>
                {isViewingFamily && (
                  <Text style={styles.viewingAs}>Viewing family member</Text>
                )}
              </View>
              <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
                <Icon name="bell" size={24} color={figmaTokens.colors.white} />
              </TouchableOpacity>
            </View>

            {/* Quick Actions - Emergency Card & Report Scanner */}
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickActionCard}
                  onPress={() => handleNavigate(action.screen)}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickActionHeader}>
                    <View style={[styles.quickActionIconBg, { backgroundColor: action.color }]}>
                      <Icon name={action.icon} size={20} color={action.iconColor} />
                    </View>
                  </View>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>

          <View style={styles.content}>
            {/* Main Features - 3x2 Grid */}
            <Text style={styles.sectionTitle}>Main Features</Text>
            <View style={styles.mainFeaturesGrid}>
              {mainFeatures.map((feature, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleNavigate(feature.screen)}
                  style={styles.mainFeatureCard}
                  activeOpacity={0.7}
                >
                  <View style={[styles.mainFeatureIconBg, { backgroundColor: feature.color }]}>
                    <Icon name={feature.icon} size={24} color={figmaTokens.colors.white} />
                  </View>
                  <Text style={styles.mainFeatureTitle}>{feature.title}</Text>
                </TouchableOpacity>
              ))}
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
    paddingTop: figmaTokens.spacing['6'],
    paddingBottom: figmaTokens.spacing['6'],
    paddingHorizontal: figmaTokens.spacing['6'],
    borderBottomLeftRadius: figmaTokens.borderRadius['3xl'],
    borderBottomRightRadius: figmaTokens.borderRadius['3xl'],
    ...figmaTokens.shadows.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: figmaTokens.spacing['6'],
  },
  greeting: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.white,
    marginBottom: figmaTokens.spacing['1'],
  },
  userName: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.blue100,
  },
  viewingAs: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.yellow300,
    marginTop: figmaTokens.spacing['1'],
  },
  notificationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: figmaTokens.borderRadius.full,
    padding: figmaTokens.spacing['3'],
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: figmaTokens.spacing['3'],
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: figmaTokens.borderRadius['2xl'],
    padding: figmaTokens.spacing['4'],
  },
  quickActionHeader: {
    marginBottom: figmaTokens.spacing['3'],
  },
  quickActionIconBg: {
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['3'],
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.white,
    marginBottom: figmaTokens.spacing['1'],
  },
  quickActionSubtitle: {
    fontSize: figmaTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    padding: figmaTokens.spacing['6'],
  },
  sectionTitle: {
    fontSize: figmaTokens.typography.fontSize.lg,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.gray900,
    marginBottom: figmaTokens.spacing['4'],
  },
  mainFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: figmaTokens.spacing['6'],
  },
  mainFeatureCard: {
    width: '31%',
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius['2xl'],
    paddingVertical: figmaTokens.spacing['4'],
    paddingHorizontal: figmaTokens.spacing['3'],
    marginBottom: figmaTokens.spacing['4'],
    ...figmaTokens.shadows.sm,
    alignItems: 'center',
  },
  mainFeatureIconBg: {
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['3'],
    marginBottom: figmaTokens.spacing['3'],
  },
  mainFeatureTitle: {
    fontSize: figmaTokens.typography.fontSize.sm,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
    textAlign: 'center',
  },
});
