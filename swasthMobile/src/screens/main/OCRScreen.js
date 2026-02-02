// ✅ OCR Screen - Report Scanner with AI Summary
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
  Modal,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../hooks/useAuth';
import { uploadOCR, getOCRStatus, getOCRHistory } from '../../config/api';
import figmaTokens from '../../design-system/figmaTokens';
import { HeaderBar } from '../../design-system/HeaderBar';
import { FigmaCard } from '../../design-system/FigmaCard';

export default function OCRScreen({ navigation }) {
  const { user } = useAuth();
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, success, invalid, unclear, failed
  const [previousScans, setPreviousScans] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    if (user?.email) {
      loadPreviousScans();
    }
  }, [user?.email]);

  const loadPreviousScans = async () => {
    try {
      const res = await getOCRHistory(user.email);
      const scans = Array.isArray(res) ? res : [];
      setPreviousScans(scans.map(scan => ({
        id: scan._id,
        type: scan.aiAnalysis?.reportType || scan.fileName || 'Medical Report',
        date: new Date(scan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: scan.status || 'completed',
        error: scan.error,
        aiAnalysis: scan.aiAnalysis || null,
        extractedText: scan.extractedText || '',
      })));
    } catch (error) {
      console.error('Error loading scans:', error);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    try {
      launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      }, async (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', 'Failed to take photo');
          return;
        }
        if (response.assets && response.assets[0]) {
          await handleUpload(response.assets[0]);
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handlePickImage = async () => {
    try {
      launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      }, async (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', 'Failed to pick image');
          return;
        }
        if (response.assets && response.assets[0]) {
          await handleUpload(response.assets[0]);
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUpload = async (imageAsset) => {
    if (!user?.email) return;

    setScanStatus('scanning');
    setUploading(true);
    setLastScanResult(null);

    try {
      const response = await uploadOCR(user.email, imageAsset);
      if (response && response.scanId) {
        await pollStatus(response.scanId, 12);
      } else {
        Alert.alert('Upload Error', 'Server did not return a scan id. Please try again.');
        setScanStatus('idle');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload report');
      setScanStatus('idle');
    } finally {
      setUploading(false);
    }
  };

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const pollStatus = async (scanId, retries = 10) => {
    try {
      const res = await getOCRStatus(scanId);
      const status = res?.status || 'processing';

      if (status === 'completed') {
        setScanStatus('success');
        setLastScanResult(res);
        await loadPreviousScans();
        return;
      }

      if (status === 'invalid') {
        setScanStatus('invalid');
        setLastScanResult(res);
        return;
      }

      if (status === 'unclear') {
        setScanStatus('unclear');
        setLastScanResult(res);
        return;
      }

      if (status === 'failed') {
        setScanStatus('failed');
        setLastScanResult(res);
        return;
      }

      // Still processing
      if (retries > 0) {
        await sleep(2500);
        return pollStatus(scanId, retries - 1);
      }

      Alert.alert('Timeout', 'Processing is taking too long. Please try again.');
      setScanStatus('idle');
    } catch (err) {
      console.error('Error polling OCR status:', err);
      if (retries > 0) {
        await sleep(2500);
        return pollStatus(scanId, retries - 1);
      }
      Alert.alert('Error', 'Unable to verify OCR status. Please try again.');
      setScanStatus('idle');
    }
  };

  const resetScan = () => {
    setScanStatus('idle');
    setLastScanResult(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return figmaTokens.colors.green500;
      case 'attention_needed': return figmaTokens.colors.orange500;
      case 'critical': return figmaTokens.colors.red500;
      default: return figmaTokens.colors.blue500;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return 'check-circle';
      case 'attention_needed': return 'alert-circle';
      case 'critical': return 'alert-octagon';
      default: return 'information';
    }
  };

  const getMetricStatusColor = (status) => {
    switch (status) {
      case 'normal': return figmaTokens.colors.green600;
      case 'high': return figmaTokens.colors.red600;
      case 'low': return figmaTokens.colors.orange600;
      default: return figmaTokens.colors.gray600;
    }
  };

  // Render AI Analysis Summary
  const renderAISummary = (aiAnalysis, error) => {
    if (!aiAnalysis) return null;

    return (
      <View style={styles.summaryContainer}>
        {/* Overall Status Badge */}
        {aiAnalysis.overallStatus && (
          <View style={[styles.overallStatusBadge, { backgroundColor: getStatusColor(aiAnalysis.overallStatus) + '20' }]}>
            <Icon name={getStatusIcon(aiAnalysis.overallStatus)} size={24} color={getStatusColor(aiAnalysis.overallStatus)} />
            <Text style={[styles.overallStatusText, { color: getStatusColor(aiAnalysis.overallStatus) }]}>
              {aiAnalysis.overallStatus === 'good' ? 'Report Normal Hai' :
               aiAnalysis.overallStatus === 'attention_needed' ? 'Dhyan Dein' : 'Serious - Doctor Se Milein'}
            </Text>
          </View>
        )}

        {/* Summary */}
        {aiAnalysis.summary && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Icon name="file-document-outline" size={20} color={figmaTokens.colors.purple600} />
              <Text style={styles.summaryTitle}>Report Summary</Text>
            </View>
            <Text style={styles.summaryText}>{aiAnalysis.summary}</Text>
          </View>
        )}

        {/* Health Metrics */}
        {aiAnalysis.healthMetrics && aiAnalysis.healthMetrics.length > 0 && (
          <View style={styles.metricsCard}>
            <Text style={styles.sectionLabel}>Health Metrics</Text>
            {aiAnalysis.healthMetrics.map((metric, index) => (
              <View key={index} style={styles.metricRow}>
                <View style={styles.metricLeft}>
                  <Text style={styles.metricType}>{metric.type}</Text>
                  <Text style={styles.metricValue}>{metric.value} {metric.unit}</Text>
                </View>
                <View style={[styles.metricStatusBadge, { backgroundColor: getMetricStatusColor(metric.status) + '20' }]}>
                  <Text style={[styles.metricStatusText, { color: getMetricStatusColor(metric.status) }]}>
                    {metric.status === 'normal' ? 'Normal' : metric.status === 'high' ? 'High' : 'Low'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Concerns */}
        {aiAnalysis.concerns && aiAnalysis.concerns.length > 0 && (
          <View style={styles.concernsCard}>
            <View style={styles.concernsHeader}>
              <Icon name="alert-circle" size={20} color={figmaTokens.colors.orange600} />
              <Text style={styles.concernsTitle}>Dhyan Dein (Concerns)</Text>
            </View>
            {aiAnalysis.concerns.map((concern, index) => (
              <View key={index} style={styles.concernItem}>
                <Text style={styles.concernBullet}>•</Text>
                <Text style={styles.concernText}>{concern}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recommendations */}
        {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
          <View style={styles.recommendationsCard}>
            <View style={styles.recommendationsHeader}>
              <Icon name="lightbulb-on" size={20} color={figmaTokens.colors.blue600} />
              <Text style={styles.recommendationsTitle}>Suggestions</Text>
            </View>
            {aiAnalysis.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationBullet}>✓</Text>
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Result Modal for viewing scan details
  const renderResultModal = () => (
    <Modal
      visible={showResultModal}
      animationType="slide"
      onRequestClose={() => setShowResultModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowResultModal(false)}>
            <Icon name="arrow-left" size={24} color={figmaTokens.colors.gray900} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Report Analysis</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.modalContent}>
          {selectedScan?.aiAnalysis && renderAISummary(selectedScan.aiAnalysis, selectedScan.error)}
          {!selectedScan?.aiAnalysis && (
            <View style={styles.noAnalysisContainer}>
              <Icon name="file-question" size={48} color={figmaTokens.colors.gray400} />
              <Text style={styles.noAnalysisText}>No AI analysis available for this scan</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <HeaderBar
          title="Report Scanner"
          onBack={() => navigation.goBack()}
          backgroundColor={figmaTokens.colors.white}
        />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Icon name="information" size={20} color={figmaTokens.colors.blue600} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>AI Report Analysis</Text>
                <Text style={styles.infoDescription}>
                  Medical report ya test ki photo dalein, AI aapko simple language mein samjhayega
                </Text>
              </View>
            </View>

            {/* Upload/Result Area */}
            <FigmaCard style={styles.uploadCard}>
              {scanStatus === 'idle' && (
                <>
                  <View style={styles.uploadHeader}>
                    <View style={styles.uploadIconBg}>
                      <Icon name="file-document-outline" size={48} color={figmaTokens.colors.purple600} />
                    </View>
                    <Text style={styles.uploadTitle}>Scan Medical Report</Text>
                    <Text style={styles.uploadDescription}>
                      Sirf medical reports ya test results ki photo dalein
                    </Text>
                  </View>

                  <View style={styles.uploadButtonsGrid}>
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={handleTakePhoto}
                      disabled={uploading}
                      activeOpacity={0.7}
                    >
                      <Icon name="camera" size={32} color={figmaTokens.colors.gray600} />
                      <Text style={styles.uploadButtonText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={handlePickImage}
                      disabled={uploading}
                      activeOpacity={0.7}
                    >
                      <Icon name="upload" size={32} color={figmaTokens.colors.gray600} />
                      <Text style={styles.uploadButtonText}>Upload File</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {scanStatus === 'scanning' && (
                <View style={styles.scanningContainer}>
                  <View style={styles.scanningIconBg}>
                    <ActivityIndicator size="large" color={figmaTokens.colors.purple600} />
                  </View>
                  <Text style={styles.scanningTitle}>Analyzing Report...</Text>
                  <Text style={styles.scanningDescription}>AI aapki report padh raha hai</Text>
                </View>
              )}

              {scanStatus === 'success' && lastScanResult && (
                <View style={styles.resultContainer}>
                  {/* Report Type Header */}
                  <View style={styles.reportTypeHeader}>
                    <View style={styles.reportTypeIconBg}>
                      <Icon name="file-document-check" size={32} color={figmaTokens.colors.purple600} />
                    </View>
                    <Text style={styles.reportTypeText}>
                      {lastScanResult.aiAnalysis?.reportType || 'Medical Report'}
                    </Text>
                  </View>

                  {/* AI Summary - Main Focus */}
                  {renderAISummary(lastScanResult.aiAnalysis, lastScanResult.error)}

                  {/* Scan Another - Small Link */}
                  <TouchableOpacity style={styles.scanAnotherLink} onPress={resetScan}>
                    <Icon name="plus-circle-outline" size={18} color={figmaTokens.colors.purple600} />
                    <Text style={styles.scanAnotherText}>Naya Report Scan Karein</Text>
                  </TouchableOpacity>
                </View>
              )}

              {scanStatus === 'invalid' && (
                <View style={styles.errorContainer}>
                  <View style={styles.errorIconBg}>
                    <Icon name="file-remove" size={48} color={figmaTokens.colors.red600} />
                  </View>
                  <Text style={styles.errorTitle}>Ye Medical Report Nahi Hai</Text>
                  <Text style={styles.errorDescription}>
                    {lastScanResult?.error || 'Please sirf medical reports ya test results ki photo dalein'}
                  </Text>
                  <TouchableOpacity style={styles.retryButton} onPress={resetScan}>
                    <Icon name="refresh" size={20} color={figmaTokens.colors.white} />
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}

              {scanStatus === 'unclear' && (
                <View style={styles.errorContainer}>
                  <View style={[styles.errorIconBg, { backgroundColor: figmaTokens.colors.orange100 }]}>
                    <Icon name="image-off" size={48} color={figmaTokens.colors.orange600} />
                  </View>
                  <Text style={styles.errorTitle}>Image Clear Nahi Hai</Text>
                  <Text style={styles.errorDescription}>
                    {lastScanResult?.error || 'Photo blur hai ya text nahi dikh raha. Please clear photo lein'}
                  </Text>
                  <TouchableOpacity style={[styles.retryButton, { backgroundColor: figmaTokens.colors.orange500 }]} onPress={resetScan}>
                    <Icon name="camera" size={20} color={figmaTokens.colors.white} />
                    <Text style={styles.retryButtonText}>Retake Photo</Text>
                  </TouchableOpacity>
                </View>
              )}

              {scanStatus === 'failed' && (
                <View style={styles.errorContainer}>
                  <View style={styles.errorIconBg}>
                    <Icon name="alert-circle" size={48} color={figmaTokens.colors.red600} />
                  </View>
                  <Text style={styles.errorTitle}>Analysis Failed</Text>
                  <Text style={styles.errorDescription}>
                    Kuch gadbad ho gayi. Please dobara try karein.
                  </Text>
                  <TouchableOpacity style={styles.retryButton} onPress={resetScan}>
                    <Icon name="refresh" size={20} color={figmaTokens.colors.white} />
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}
            </FigmaCard>

            {/* Previous Scans */}
            {previousScans.length > 0 && scanStatus === 'idle' && (
              <>
                <Text style={styles.sectionTitle}>Previous Reports</Text>
                <View style={styles.scansList}>
                  {previousScans.filter(s => s.status === 'completed').map((scan) => (
                    <TouchableOpacity
                      key={scan.id}
                      style={styles.scanCard}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedScan(scan);
                        setShowResultModal(true);
                      }}
                    >
                      <View style={styles.scanContent}>
                        <View style={styles.scanIconBg}>
                          <Icon name="file-document-outline" size={24} color={figmaTokens.colors.purple600} />
                        </View>
                        <View style={styles.scanText}>
                          <View style={styles.scanHeader}>
                            <Text style={styles.scanType}>{scan.type}</Text>
                            {scan.aiAnalysis?.overallStatus && (
                              <View style={[styles.miniStatusBadge, { backgroundColor: getStatusColor(scan.aiAnalysis.overallStatus) + '20' }]}>
                                <Icon name={getStatusIcon(scan.aiAnalysis.overallStatus)} size={12} color={getStatusColor(scan.aiAnalysis.overallStatus)} />
                              </View>
                            )}
                          </View>
                          <Text style={styles.scanDate}>{scan.date}</Text>
                          {scan.aiAnalysis?.summary && (
                            <Text style={styles.scanSummary} numberOfLines={2}>
                              {scan.aiAnalysis.summary}
                            </Text>
                          )}
                        </View>
                        <Icon name="chevron-right" size={20} color={figmaTokens.colors.gray400} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
      {renderResultModal()}
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
  infoBanner: {
    backgroundColor: figmaTokens.colors.blue50,
    borderWidth: 1,
    borderColor: figmaTokens.colors.blue200,
    borderRadius: figmaTokens.borderRadius['2xl'],
    padding: figmaTokens.spacing['4'],
    marginBottom: figmaTokens.spacing['6'],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: figmaTokens.spacing['3'],
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.blue900,
    marginBottom: figmaTokens.spacing['1'],
  },
  infoDescription: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.blue700,
  },
  uploadCard: {
    padding: figmaTokens.spacing['6'],
    marginBottom: figmaTokens.spacing['6'],
  },
  uploadHeader: {
    alignItems: 'center',
    marginBottom: figmaTokens.spacing['6'],
  },
  uploadIconBg: {
    backgroundColor: figmaTokens.colors.purple100,
    borderRadius: figmaTokens.borderRadius.full,
    padding: figmaTokens.spacing['6'],
    marginBottom: figmaTokens.spacing['4'],
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
    marginBottom: figmaTokens.spacing['2'],
  },
  uploadDescription: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
    textAlign: 'center',
  },
  uploadButtonsGrid: {
    flexDirection: 'row',
    gap: figmaTokens.spacing['4'],
  },
  uploadButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: figmaTokens.spacing['3'],
    padding: figmaTokens.spacing['6'],
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: figmaTokens.colors.gray300,
    borderRadius: figmaTokens.borderRadius.xl,
    backgroundColor: figmaTokens.colors.white,
  },
  uploadButtonText: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
  },
  scanningContainer: {
    alignItems: 'center',
    paddingVertical: figmaTokens.spacing['8'],
  },
  scanningIconBg: {
    backgroundColor: figmaTokens.colors.purple100,
    borderRadius: figmaTokens.borderRadius.full,
    padding: figmaTokens.spacing['6'],
    marginBottom: figmaTokens.spacing['4'],
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
    marginBottom: figmaTokens.spacing['2'],
  },
  scanningDescription: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
  },
  resultContainer: {
    paddingVertical: figmaTokens.spacing['2'],
  },
  reportTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['3'],
    marginBottom: figmaTokens.spacing['5'],
    backgroundColor: figmaTokens.colors.purple50,
    padding: figmaTokens.spacing['4'],
    borderRadius: figmaTokens.borderRadius.xl,
  },
  reportTypeIconBg: {
    backgroundColor: figmaTokens.colors.purple100,
    borderRadius: figmaTokens.borderRadius.lg,
    padding: figmaTokens.spacing['2'],
  },
  reportTypeText: {
    fontSize: figmaTokens.typography.fontSize.lg,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.purple900,
    flex: 1,
  },
  scanAnotherLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: figmaTokens.spacing['2'],
    paddingVertical: figmaTokens.spacing['4'],
    marginTop: figmaTokens.spacing['4'],
  },
  scanAnotherText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.purple600,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: figmaTokens.spacing['8'],
  },
  errorIconBg: {
    backgroundColor: figmaTokens.colors.red100,
    borderRadius: figmaTokens.borderRadius.full,
    padding: figmaTokens.spacing['6'],
    marginBottom: figmaTokens.spacing['4'],
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
    marginBottom: figmaTokens.spacing['2'],
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
    textAlign: 'center',
    marginBottom: figmaTokens.spacing['6'],
    paddingHorizontal: figmaTokens.spacing['4'],
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['2'],
    backgroundColor: figmaTokens.colors.red500,
    paddingHorizontal: figmaTokens.spacing['6'],
    paddingVertical: figmaTokens.spacing['3'],
    borderRadius: figmaTokens.borderRadius.xl,
  },
  retryButtonText: {
    color: figmaTokens.colors.white,
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
  // Summary Styles
  summaryContainer: {
    gap: figmaTokens.spacing['4'],
  },
  overallStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: figmaTokens.spacing['2'],
    paddingVertical: figmaTokens.spacing['3'],
    paddingHorizontal: figmaTokens.spacing['4'],
    borderRadius: figmaTokens.borderRadius.xl,
  },
  overallStatusText: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
  },
  summaryCard: {
    backgroundColor: figmaTokens.colors.purple50,
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['4'],
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['2'],
    marginBottom: figmaTokens.spacing['2'],
  },
  summaryTitle: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.purple900,
  },
  summaryText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray800,
    lineHeight: 22,
  },
  metricsCard: {
    backgroundColor: figmaTokens.colors.gray50,
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['4'],
  },
  sectionLabel: {
    fontSize: figmaTokens.typography.fontSize.sm,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.gray600,
    marginBottom: figmaTokens.spacing['3'],
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: figmaTokens.spacing['2'],
    borderBottomWidth: 1,
    borderBottomColor: figmaTokens.colors.gray200,
  },
  metricLeft: {
    flex: 1,
  },
  metricType: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray600,
    textTransform: 'capitalize',
  },
  metricValue: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.gray900,
  },
  metricStatusBadge: {
    paddingHorizontal: figmaTokens.spacing['3'],
    paddingVertical: figmaTokens.spacing['1'],
    borderRadius: figmaTokens.borderRadius.full,
  },
  metricStatusText: {
    fontSize: figmaTokens.typography.fontSize.sm,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
  concernsCard: {
    backgroundColor: figmaTokens.colors.orange50,
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['4'],
  },
  concernsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['2'],
    marginBottom: figmaTokens.spacing['3'],
  },
  concernsTitle: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.orange900,
  },
  concernItem: {
    flexDirection: 'row',
    gap: figmaTokens.spacing['2'],
    marginBottom: figmaTokens.spacing['2'],
  },
  concernBullet: {
    color: figmaTokens.colors.orange600,
    fontSize: figmaTokens.typography.fontSize.base,
  },
  concernText: {
    flex: 1,
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray800,
    lineHeight: 20,
  },
  recommendationsCard: {
    backgroundColor: figmaTokens.colors.blue50,
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['4'],
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['2'],
    marginBottom: figmaTokens.spacing['3'],
  },
  recommendationsTitle: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.blue900,
  },
  recommendationItem: {
    flexDirection: 'row',
    gap: figmaTokens.spacing['2'],
    marginBottom: figmaTokens.spacing['2'],
  },
  recommendationBullet: {
    color: figmaTokens.colors.blue600,
    fontSize: figmaTokens.typography.fontSize.base,
  },
  recommendationText: {
    flex: 1,
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray800,
    lineHeight: 20,
  },
  // Previous Scans
  sectionTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
    marginBottom: figmaTokens.spacing['4'],
  },
  scansList: {
    gap: figmaTokens.spacing['3'],
  },
  scanCard: {
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius['2xl'],
    padding: figmaTokens.spacing['4'],
    ...figmaTokens.shadows.sm,
  },
  scanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['4'],
  },
  scanIconBg: {
    backgroundColor: figmaTokens.colors.purple100,
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['3'],
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    flex: 1,
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: figmaTokens.spacing['1'],
  },
  scanType: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
  },
  miniStatusBadge: {
    padding: figmaTokens.spacing['1'],
    borderRadius: figmaTokens.borderRadius.full,
  },
  scanDate: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray500,
    marginBottom: figmaTokens.spacing['2'],
  },
  scanSummary: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray600,
    lineHeight: 18,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: figmaTokens.colors.gray50,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: figmaTokens.spacing['4'],
    paddingVertical: figmaTokens.spacing['4'],
    backgroundColor: figmaTokens.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: figmaTokens.colors.gray200,
  },
  modalTitle: {
    fontSize: figmaTokens.typography.fontSize.lg,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.gray900,
  },
  modalContent: {
    padding: figmaTokens.spacing['6'],
  },
  noAnalysisContainer: {
    alignItems: 'center',
    paddingVertical: figmaTokens.spacing['12'],
  },
  noAnalysisText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray500,
    marginTop: figmaTokens.spacing['4'],
  },
});
