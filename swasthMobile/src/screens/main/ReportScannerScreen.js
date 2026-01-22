// ✅ ReportScanner Screen - Enhanced with AI Analysis Display
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../hooks/useAuth';
import figmaTokens from '../../design-system/figmaTokens';
import { HeaderBar, FigmaCard, FigmaButton } from '../../design-system';
import { getOCRHistory } from '../../config/api';

export default function ReportScannerScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [scans, setScans] = useState([]);
  const [expandedScan, setExpandedScan] = useState(null);

  const loadScans = useCallback(async () => {
    if (!user?.email) {
      console.log('[ReportScanner] No user email, skipping load');
      return;
    }

    try {
      console.log('[ReportScanner] Loading scans for user:', user.email);
      setLoading(true);
      setError(null);

      const data = await getOCRHistory(user.email);
      console.log('[ReportScanner] Received data:', data);

      // Handle different response formats
      if (!data) {
        console.log('[ReportScanner] No data received, setting to empty array');
        setScans([]);
      } else if (Array.isArray(data)) {
        console.log('[ReportScanner] Data is array with', data.length, 'items');
        setScans(data);
      } else if (typeof data === 'object' && data.scans) {
        console.log('[ReportScanner] Data has scans property');
        setScans(Array.isArray(data.scans) ? data.scans : []);
      } else {
        console.log('[ReportScanner] Unexpected data format, setting to empty array');
        setScans([]);
      }
    } catch (error) {
      console.error('[ReportScanner] Error loading scans:', error);

      // Handle 404 or no scans available
      if (error.response?.status === 404) {
        console.log('[ReportScanner] 404 - No scans available yet');
        setScans([]);
        setError(null);
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to load scan history';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useFocusEffect(
    useCallback(() => {
      loadScans();
    }, [loadScans])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScans();
    setRefreshing(false);
  };

  const toggleExpand = (scanId) => {
    setExpandedScan(expandedScan === scanId ? null : scanId);
  };

  /* -------------------------------------------------------------------------- */
  /*                           RENDER HELPERS                                   */
  /* -------------------------------------------------------------------------- */

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return figmaTokens.colors.green500;
      case 'processing':
        return figmaTokens.colors.blue500;
      case 'failed':
        return figmaTokens.colors.red500;
      default:
        return figmaTokens.colors.gray500;
    }
  };

  const getMetricColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return figmaTokens.colors.green500;
      case 'high':
        return figmaTokens.colors.red500;
      case 'low':
        return figmaTokens.colors.orange500;
      default:
        return figmaTokens.colors.gray500;
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                  UI                                        */
  /* -------------------------------------------------------------------------- */

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <HeaderBar title="Scan History" onBack={() => navigation.goBack()} />
        <ScrollView
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={figmaTokens.colors.purple500} />
                <Text style={styles.loadingText}>Loading scan history...</Text>
              </View>
            ) : error ? (
              <FigmaCard style={styles.errorCard}>
                <Icon name="alert-circle" size={48} color={figmaTokens.colors.red500} />
                <Text style={styles.errorText}>{error}</Text>
                <FigmaButton title="Retry" onPress={loadScans} />
              </FigmaCard>
            ) : scans.length === 0 ? (
              <FigmaCard style={styles.emptyCard}>
                <Icon name="file-document-outline" size={64} color={figmaTokens.colors.gray400} />
                <Text style={styles.emptyTitle}>No Scans Yet</Text>
                <Text style={styles.emptyText}>
                  Scan your first medical report to see it here with AI analysis
                </Text>
                <FigmaButton
                  title="Scan Report"
                  onPress={() => navigation.navigate('OCR')}
                  leftIcon="camera-plus"
                  style={styles.scanButton}
                />
              </FigmaCard>
            ) : (
              scans.map((scan, index) => {
                const isExpanded = expandedScan === (scan._id || index);
                const scanDate = scan.createdAt || scan.uploadedAt || scan.date;
                const dateString = scanDate
                  ? new Date(scanDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Unknown date';

                const hasAI = scan.aiAnalysis && typeof scan.aiAnalysis === 'object';

                return (
                  <FigmaCard key={scan._id || index} style={styles.scanCard}>
                    {/* Header */}
                    <TouchableOpacity onPress={() => toggleExpand(scan._id || index)} activeOpacity={0.7}>
                      <View style={styles.scanHeader}>
                        <Icon name="file-document" size={40} color={figmaTokens.colors.purple500} />
                        <View style={styles.scanInfo}>
                          <Text style={styles.scanType}>
                            {scan.reportType || scan.type || 'Medical Report'}
                          </Text>
                          <View style={styles.metaRow}>
                            <Icon name="account" size={14} color={figmaTokens.colors.gray500} />
                            <Text style={styles.metaText}>
                              {scan.memberName || 'Self'}
                            </Text>
                            <Text style={styles.metaDot}>•</Text>
                            <Text style={styles.metaText}>{dateString}</Text>
                          </View>
                        </View>
                        <View style={styles.headerRight}>
                          {hasAI && (
                            <Icon
                              name="brain"
                              size={20}
                              color={figmaTokens.colors.purple500}
                              style={{ marginBottom: 4 }}
                            />
                          )}
                          <Icon
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color={figmaTokens.colors.gray400}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Status Badge */}
                    <View style={styles.statusRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(scan.status) + '20' },
                        ]}
                      >
                        <Icon
                          name={
                            scan.status === 'completed'
                              ? 'check-circle'
                              : scan.status === 'processing'
                              ? 'clock'
                              : 'alert-circle'
                          }
                          size={14}
                          color={getStatusColor(scan.status)}
                        />
                        <Text
                          style={[styles.statusText, { color: getStatusColor(scan.status) }]}
                        >
                          {scan.status || 'Completed'}
                        </Text>
                      </View>
                    </View>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <View style={styles.expandedContent}>
                        {/* AI Summary */}
                        {hasAI && scan.aiAnalysis.summary && (
                          <View style={styles.summarySection}>
                            <View style={styles.sectionHeader}>
                              <Icon name="clipboard-text" size={18} color={figmaTokens.colors.purple600} />
                              <Text style={styles.sectionTitle}>AI Summary</Text>
                            </View>
                            <Text style={styles.summaryText}>{scan.aiAnalysis.summary}</Text>
                          </View>
                        )}

                        {/* Health Metrics */}
                        {hasAI &&
                          scan.aiAnalysis.healthMetrics &&
                          scan.aiAnalysis.healthMetrics.length > 0 && (
                            <View style={styles.metricsSection}>
                              <View style={styles.sectionHeader}>
                                <Icon name="chart-line" size={18} color={figmaTokens.colors.blue600} />
                                <Text style={styles.sectionTitle}>Health Metrics</Text>
                              </View>
                              {scan.aiAnalysis.healthMetrics.map((metric, idx) => (
                                <View key={idx} style={styles.metricItem}>
                                  <View style={styles.metricLeft}>
                                    <Text style={styles.metricLabel}>
                                      {metric.type
                                        .replace(/([A-Z])/g, ' $1')
                                        .replace(/^./, (str) => str.toUpperCase())}
                                    </Text>
                                    <View style={styles.metricValueRow}>
                                      <Text style={styles.metricValue}>{metric.value}</Text>
                                      <Text style={styles.metricUnit}>{metric.unit}</Text>
                                    </View>
                                  </View>
                                  {metric.status && (
                                    <View
                                      style={[
                                        styles.metricStatusBadge,
                                        { backgroundColor: getMetricColor(metric.status) + '20' },
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.metricStatusText,
                                          { color: getMetricColor(metric.status) },
                                        ]}
                                      >
                                        {metric.status}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              ))}
                            </View>
                          )}

                        {/* Concerns */}
                        {hasAI && scan.aiAnalysis.concerns && scan.aiAnalysis.concerns.length > 0 && (
                          <View style={styles.concernsSection}>
                            <View style={styles.sectionHeader}>
                              <Icon name="alert" size={18} color={figmaTokens.colors.orange600} />
                              <Text style={styles.sectionTitle}>Health Concerns</Text>
                            </View>
                            {scan.aiAnalysis.concerns.map((concern, idx) => (
                              <View key={idx} style={styles.concernItem}>
                                <Icon
                                  name="alert-circle-outline"
                                  size={16}
                                  color={figmaTokens.colors.orange500}
                                />
                                <Text style={styles.concernText}>{concern}</Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Recommendations */}
                        {hasAI &&
                          scan.aiAnalysis.recommendations &&
                          scan.aiAnalysis.recommendations.length > 0 && (
                            <View style={styles.recommendationsSection}>
                              <View style={styles.sectionHeader}>
                                <Icon name="lightbulb" size={18} color={figmaTokens.colors.green600} />
                                <Text style={styles.sectionTitle}>Recommendations</Text>
                              </View>
                              {scan.aiAnalysis.recommendations.map((rec, idx) => (
                                <View key={idx} style={styles.recommendationItem}>
                                  <Icon
                                    name="check-circle-outline"
                                    size={16}
                                    color={figmaTokens.colors.green500}
                                  />
                                  <Text style={styles.recommendationText}>{rec}</Text>
                                </View>
                              ))}
                            </View>
                          )}

                        {/* Extracted Text (fallback if no AI) */}
                        {!hasAI && scan.extractedText && (
                          <View style={styles.textSection}>
                            <View style={styles.sectionHeader}>
                              <Icon name="text" size={18} color={figmaTokens.colors.gray600} />
                              <Text style={styles.sectionTitle}>Extracted Text</Text>
                            </View>
                            <Text style={styles.extractedText} numberOfLines={5}>
                              {scan.extractedText}
                            </Text>
                          </View>
                        )}

                        {/* Confidence Score */}
                        {hasAI && scan.aiAnalysis.confidence && (
                          <View style={styles.confidenceSection}>
                            <Text style={styles.confidenceText}>
                              Analysis Confidence:{' '}
                              {Math.round(scan.aiAnalysis.confidence * 100)}%
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </FigmaCard>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: figmaTokens.colors.gray50 },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: figmaTokens.spacing['6'] },

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: figmaTokens.spacing['8'],
    gap: figmaTokens.spacing['4'],
  },
  loadingText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
  },

  errorCard: {
    alignItems: 'center',
    padding: figmaTokens.spacing['8'],
    gap: figmaTokens.spacing['4'],
  },
  errorText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray700,
    textAlign: 'center',
  },

  emptyCard: {
    alignItems: 'center',
    padding: figmaTokens.spacing['8'],
    gap: figmaTokens.spacing['4'],
  },
  emptyTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
  },
  emptyText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
    textAlign: 'center',
  },
  scanButton: {
    marginTop: figmaTokens.spacing['2'],
  },

  scanCard: {
    padding: figmaTokens.spacing['4'],
    marginBottom: figmaTokens.spacing['3'],
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['3'],
  },
  scanInfo: {
    flex: 1,
  },
  scanType: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.gray900,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: figmaTokens.typography.fontSize.xs,
    color: figmaTokens.colors.gray500,
  },
  metaDot: {
    fontSize: figmaTokens.typography.fontSize.xs,
    color: figmaTokens.colors.gray400,
  },
  headerRight: {
    alignItems: 'center',
  },

  statusRow: {
    marginTop: figmaTokens.spacing['3'],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: figmaTokens.spacing['2'],
    paddingVertical: 4,
    borderRadius: figmaTokens.borderRadius.md,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: figmaTokens.typography.fontSize.xs,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },

  expandedContent: {
    marginTop: figmaTokens.spacing['4'],
    paddingTop: figmaTokens.spacing['4'],
    borderTopWidth: 1,
    borderTopColor: figmaTokens.colors.gray200,
    gap: figmaTokens.spacing['4'],
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['2'],
    marginBottom: figmaTokens.spacing['2'],
  },
  sectionTitle: {
    fontSize: figmaTokens.typography.fontSize.sm,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.gray900,
  },

  summarySection: {
    backgroundColor: figmaTokens.colors.purple50,
    padding: figmaTokens.spacing['3'],
    borderRadius: figmaTokens.borderRadius.lg,
  },
  summaryText: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray700,
    lineHeight: 20,
  },

  metricsSection: {
    gap: figmaTokens.spacing['2'],
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: figmaTokens.colors.blue50,
    padding: figmaTokens.spacing['3'],
    borderRadius: figmaTokens.borderRadius.lg,
  },
  metricLeft: {
    flex: 1,
  },
  metricLabel: {
    fontSize: figmaTokens.typography.fontSize.xs,
    color: figmaTokens.colors.gray600,
    marginBottom: 2,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metricValue: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.gray900,
  },
  metricUnit: {
    fontSize: figmaTokens.typography.fontSize.xs,
    color: figmaTokens.colors.gray600,
  },
  metricStatusBadge: {
    paddingHorizontal: figmaTokens.spacing['2'],
    paddingVertical: 4,
    borderRadius: figmaTokens.borderRadius.md,
  },
  metricStatusText: {
    fontSize: figmaTokens.typography.fontSize.xs,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },

  concernsSection: {
    gap: figmaTokens.spacing['2'],
  },
  concernItem: {
    flexDirection: 'row',
    gap: figmaTokens.spacing['2'],
    backgroundColor: figmaTokens.colors.orange50,
    padding: figmaTokens.spacing['3'],
    borderRadius: figmaTokens.borderRadius.lg,
  },
  concernText: {
    flex: 1,
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray700,
    lineHeight: 18,
  },

  recommendationsSection: {
    gap: figmaTokens.spacing['2'],
  },
  recommendationItem: {
    flexDirection: 'row',
    gap: figmaTokens.spacing['2'],
    backgroundColor: figmaTokens.colors.green50,
    padding: figmaTokens.spacing['3'],
    borderRadius: figmaTokens.borderRadius.lg,
  },
  recommendationText: {
    flex: 1,
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray700,
    lineHeight: 18,
  },

  textSection: {
    gap: figmaTokens.spacing['2'],
  },
  extractedText: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray600,
    lineHeight: 20,
    backgroundColor: figmaTokens.colors.gray100,
    padding: figmaTokens.spacing['3'],
    borderRadius: figmaTokens.borderRadius.lg,
  },

  confidenceSection: {
    alignItems: 'center',
    paddingTop: figmaTokens.spacing['2'],
    borderTopWidth: 1,
    borderTopColor: figmaTokens.colors.gray200,
  },
  confidenceText: {
    fontSize: figmaTokens.typography.fontSize.xs,
    color: figmaTokens.colors.gray500,
    fontStyle: 'italic',
  },
});
