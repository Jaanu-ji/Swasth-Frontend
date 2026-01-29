import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useAuth } from '../../hooks/useAuth';
import { useMember } from '../../hooks/useMember';
import { getHealthDocuments, uploadHealthDocument, deleteHealthDocument } from '../../config/api';
import figmaTokens from '../../design-system/figmaTokens';
import { HeaderBar } from '../../design-system/HeaderBar';
import { FigmaCard } from '../../design-system/FigmaCard';

const CATEGORIES = [
  { label: 'Prescription', value: 'Prescription', icon: 'prescription', color: '#3b82f6' },
  { label: 'Lab Report', value: 'Lab Report', icon: 'test-tube', color: '#10b981' },
  { label: 'X-Ray', value: 'X-Ray', icon: 'radiology-box', color: '#8b5cf6' },
  { label: 'MRI/CT Scan', value: 'MRI/CT Scan', icon: 'brain', color: '#f59e0b' },
  { label: 'Bill/Invoice', value: 'Bill/Invoice', icon: 'receipt', color: '#ef4444' },
  { label: 'Discharge Summary', value: 'Discharge Summary', icon: 'hospital-building', color: '#06b6d4' },
  { label: 'Other', value: 'Other', icon: 'file-document', color: '#6b7280' },
];

export default function HealthHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const { activeMember, isViewingFamily } = useMember();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Add Document Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [documentDate, setDocumentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  // View Document Modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewingImageIndex, setViewingImageIndex] = useState(0);

  const loadDocuments = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const data = await getHealthDocuments(user.email, activeMember.memberId);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email, activeMember.memberId]);

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [loadDocuments])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Other');
    setDocumentDate(new Date());
    setSelectedImages([]);
  };

  const handlePickImages = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 10,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', 'Failed to pick images');
          return;
        }
        if (response.assets) {
          setSelectedImages([...selectedImages, ...response.assets]);
        }
      }
    );
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Swasth needs access to your camera to take photos of documents',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera permission in settings to take photos.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          if (response.errorCode === 'camera_unavailable') {
            Alert.alert('Error', 'Camera is not available on this device');
          } else if (response.errorCode === 'permission') {
            Alert.alert(
              'Permission Denied',
              'Camera permission is required to take photos.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
              ]
            );
          } else {
            Alert.alert('Error', 'Failed to take photo');
          }
          return;
        }
        if (response.assets && response.assets[0]) {
          setSelectedImages([...selectedImages, response.assets[0]]);
        }
      }
    );
  };

  const removeSelectedImage = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Please select at least one image');
      return;
    }

    setUploading(true);
    try {
      await uploadHealthDocument(
        user.email,
        selectedImages,
        title.trim(),
        description.trim(),
        documentDate.toISOString(),
        category,
        activeMember.memberId,
        activeMember.name || 'Self'
      );
      Alert.alert('Success', 'Document uploaded successfully');
      setShowAddModal(false);
      resetForm();
      loadDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (doc) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHealthDocument(doc._id);
              loadDocuments();
              setShowViewModal(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const openDocument = (doc) => {
    setSelectedDocument(doc);
    setViewingImageIndex(0);
    setShowViewModal(true);
  };

  const getCategoryInfo = (cat) => {
    return CATEGORIES.find((c) => c.value === cat) || CATEGORIES[6];
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getImageUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;

    // Convert backslashes to forward slashes
    let cleanPath = filePath.replace(/\\/g, '/');

    // Extract only the uploads/... part from the full path
    // Path could be like: C:/Users/.../backend/uploads/health-documents/file.jpg
    // Or: /app/uploads/health-documents/file.jpg (on render.com)
    const uploadsIndex = cleanPath.indexOf('uploads/');
    if (uploadsIndex !== -1) {
      cleanPath = cleanPath.substring(uploadsIndex);
    }

    return `https://swasth-bk.onrender.com/${cleanPath}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <HeaderBar
          title="Health History"
          subtitle={isViewingFamily ? activeMember.name : null}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.content}>
            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Icon name="folder-heart" size={24} color={figmaTokens.colors.purple600} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Store Your Health Records</Text>
                <Text style={styles.infoDescription}>
                  Upload prescriptions, reports, and medical documents for easy access anytime
                </Text>
              </View>
            </View>

            {/* Add Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.7}
            >
              <Icon name="plus" size={24} color={figmaTokens.colors.white} />
              <Text style={styles.addButtonText}>Add Document</Text>
            </TouchableOpacity>

            {/* Documents List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={figmaTokens.colors.purple500} />
                <Text style={styles.loadingText}>Loading documents...</Text>
              </View>
            ) : documents.length === 0 ? (
              <FigmaCard style={styles.emptyCard}>
                <Icon name="file-document-outline" size={64} color={figmaTokens.colors.gray300} />
                <Text style={styles.emptyTitle}>No Documents Yet</Text>
                <Text style={styles.emptyText}>
                  Upload your first health document to get started
                </Text>
              </FigmaCard>
            ) : (
              <View style={styles.documentsList}>
                {documents.map((doc) => {
                  const catInfo = getCategoryInfo(doc.category);
                  return (
                    <TouchableOpacity
                      key={doc._id}
                      style={styles.documentCard}
                      onPress={() => openDocument(doc)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.documentHeader}>
                        <View style={[styles.categoryIcon, { backgroundColor: catInfo.color + '20' }]}>
                          <Icon name={catInfo.icon} size={24} color={catInfo.color} />
                        </View>
                        <View style={styles.documentInfo}>
                          <Text style={styles.documentTitle} numberOfLines={1}>
                            {doc.title}
                          </Text>
                          <View style={styles.documentMeta}>
                            <Text style={styles.documentCategory}>{doc.category}</Text>
                            <Text style={styles.documentDot}>•</Text>
                            <Text style={styles.documentDate}>{formatDate(doc.documentDate)}</Text>
                          </View>
                        </View>
                        <View style={styles.imageCount}>
                          <Icon name="image-multiple" size={16} color={figmaTokens.colors.gray500} />
                          <Text style={styles.imageCountText}>{doc.images?.length || 0}</Text>
                        </View>
                      </View>
                      {doc.description ? (
                        <Text style={styles.documentDescription} numberOfLines={2}>
                          {doc.description}
                        </Text>
                      ) : null}
                      {doc.images && doc.images.length > 0 && (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={styles.thumbnailScroll}
                        >
                          {doc.images.slice(0, 4).map((img, idx) => (
                            <Image
                              key={idx}
                              source={{ uri: getImageUrl(img.filePath) }}
                              style={styles.thumbnail}
                            />
                          ))}
                          {doc.images.length > 4 && (
                            <View style={styles.moreImages}>
                              <Text style={styles.moreImagesText}>+{doc.images.length - 4}</Text>
                            </View>
                          )}
                        </ScrollView>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add Document Modal */}
        <Modal visible={showAddModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Document</Text>
                <TouchableOpacity onPress={() => { setShowAddModal(false); resetForm(); }}>
                  <Icon name="close" size={24} color={figmaTokens.colors.gray600} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* Title */}
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g., Blood Test Report"
                  placeholderTextColor={figmaTokens.colors.gray400}
                />

                {/* Description */}
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Add notes about this document..."
                  placeholderTextColor={figmaTokens.colors.gray400}
                  multiline
                  numberOfLines={3}
                />

                {/* Category */}
                <Text style={styles.inputLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.categoryChip,
                        category === cat.value && { backgroundColor: cat.color + '20', borderColor: cat.color },
                      ]}
                      onPress={() => setCategory(cat.value)}
                    >
                      <Icon
                        name={cat.icon}
                        size={18}
                        color={category === cat.value ? cat.color : figmaTokens.colors.gray500}
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          category === cat.value && { color: cat.color },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Date */}
                <Text style={styles.inputLabel}>Document Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icon name="calendar" size={20} color={figmaTokens.colors.gray600} />
                  <Text style={styles.dateButtonText}>{formatDate(documentDate)}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={documentDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (date) setDocumentDate(date);
                    }}
                    maximumDate={new Date()}
                  />
                )}

                {/* Images */}
                <Text style={styles.inputLabel}>Images *</Text>
                <View style={styles.imageButtons}>
                  <TouchableOpacity style={styles.imageButton} onPress={handlePickImages}>
                    <Icon name="image-plus" size={24} color={figmaTokens.colors.purple600} />
                    <Text style={styles.imageButtonText}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.imageButton} onPress={handleTakePhoto}>
                    <Icon name="camera" size={24} color={figmaTokens.colors.purple600} />
                    <Text style={styles.imageButtonText}>Camera</Text>
                  </TouchableOpacity>
                </View>

                {selectedImages.length > 0 && (
                  <View style={styles.selectedImagesGrid}>
                    {selectedImages.map((img, idx) => (
                      <View key={idx} style={styles.selectedImageContainer}>
                        <Image source={{ uri: img.uri }} style={styles.selectedImage} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => removeSelectedImage(idx)}
                        >
                          <Icon name="close-circle" size={22} color={figmaTokens.colors.red500} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              {/* Upload Button */}
              <TouchableOpacity
                style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                onPress={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color={figmaTokens.colors.white} />
                ) : (
                  <>
                    <Icon name="upload" size={20} color={figmaTokens.colors.white} />
                    <Text style={styles.uploadButtonText}>Upload Document</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* View Document Modal */}
        <Modal
          visible={showViewModal}
          animationType="slide"
          onRequestClose={() => setShowViewModal(false)}
        >
          <View style={styles.viewModalContainer}>
            {/* Fixed Header */}
            <View style={styles.viewModalHeader}>
              <TouchableOpacity
                onPress={() => setShowViewModal(false)}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="arrow-left" size={28} color={figmaTokens.colors.gray900} />
              </TouchableOpacity>
              <Text style={styles.viewModalTitle} numberOfLines={1}>
                {selectedDocument?.title}
              </Text>
              <TouchableOpacity
                onPress={() => handleDelete(selectedDocument)}
                style={styles.deleteButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="delete-outline" size={26} color={figmaTokens.colors.red500} />
              </TouchableOpacity>
            </View>

            {selectedDocument && (
              <ScrollView style={styles.viewModalScroll} showsVerticalScrollIndicator={false}>
                  {/* Main Image */}
                  {selectedDocument.images && selectedDocument.images.length > 0 && (
                    <View style={styles.mainImageContainer}>
                      <Image
                        source={{ uri: getImageUrl(selectedDocument.images[viewingImageIndex]?.filePath) }}
                        style={styles.mainImage}
                        resizeMode="contain"
                      />
                      {selectedDocument.images.length > 1 && (
                        <View style={styles.imageNavigation}>
                          <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => setViewingImageIndex(Math.max(0, viewingImageIndex - 1))}
                            disabled={viewingImageIndex === 0}
                          >
                            <Icon
                              name="chevron-left"
                              size={28}
                              color={viewingImageIndex === 0 ? figmaTokens.colors.gray300 : figmaTokens.colors.gray700}
                            />
                          </TouchableOpacity>
                          <Text style={styles.imageCounter}>
                            {viewingImageIndex + 1} / {selectedDocument.images.length}
                          </Text>
                          <TouchableOpacity
                            style={styles.navButton}
                            onPress={() =>
                              setViewingImageIndex(
                                Math.min(selectedDocument.images.length - 1, viewingImageIndex + 1)
                              )
                            }
                            disabled={viewingImageIndex === selectedDocument.images.length - 1}
                          >
                            <Icon
                              name="chevron-right"
                              size={28}
                              color={
                                viewingImageIndex === selectedDocument.images.length - 1
                                  ? figmaTokens.colors.gray300
                                  : figmaTokens.colors.gray700
                              }
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Thumbnails */}
                  {selectedDocument.images && selectedDocument.images.length > 1 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.viewThumbnails}>
                      {selectedDocument.images.map((img, idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => setViewingImageIndex(idx)}
                          style={[
                            styles.viewThumbnail,
                            idx === viewingImageIndex && styles.viewThumbnailActive,
                          ]}
                        >
                          <Image
                            source={{ uri: getImageUrl(img.filePath) }}
                            style={styles.viewThumbnailImage}
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}

                  {/* Details */}
                  <View style={styles.viewDetails}>
                    <View style={styles.viewDetailRow}>
                      <Icon name="tag" size={20} color={figmaTokens.colors.gray500} />
                      <Text style={styles.viewDetailLabel}>Category:</Text>
                      <Text style={styles.viewDetailValue}>{selectedDocument.category}</Text>
                    </View>
                    <View style={styles.viewDetailRow}>
                      <Icon name="calendar" size={20} color={figmaTokens.colors.gray500} />
                      <Text style={styles.viewDetailLabel}>Date:</Text>
                      <Text style={styles.viewDetailValue}>{formatDate(selectedDocument.documentDate)}</Text>
                    </View>
                    {selectedDocument.description && (
                      <View style={styles.viewDescriptionBox}>
                        <Text style={styles.viewDescriptionLabel}>Description</Text>
                        <Text style={styles.viewDescriptionText}>{selectedDocument.description}</Text>
                      </View>
                    )}
                  </View>
              </ScrollView>
            )}
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: figmaTokens.colors.gray50 },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: figmaTokens.spacing['6'] },

  infoBanner: {
    backgroundColor: figmaTokens.colors.purple50,
    borderWidth: 1,
    borderColor: figmaTokens.colors.purple200,
    borderRadius: figmaTokens.borderRadius['2xl'],
    padding: figmaTokens.spacing['4'],
    marginBottom: figmaTokens.spacing['4'],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: figmaTokens.spacing['3'],
  },
  infoContent: { flex: 1 },
  infoTitle: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.purple900,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.purple700,
  },

  addButton: {
    backgroundColor: figmaTokens.colors.purple600,
    borderRadius: figmaTokens.borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: figmaTokens.spacing['4'],
    gap: figmaTokens.spacing['2'],
    marginBottom: figmaTokens.spacing['6'],
  },
  addButtonText: {
    color: figmaTokens.colors.white,
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: figmaTokens.spacing['8'],
    gap: figmaTokens.spacing['4'],
  },
  loadingText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
  },

  emptyCard: {
    alignItems: 'center',
    padding: figmaTokens.spacing['8'],
    gap: figmaTokens.spacing['3'],
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

  documentsList: { gap: figmaTokens.spacing['4'] },
  documentCard: {
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius['2xl'],
    padding: figmaTokens.spacing['4'],
    ...figmaTokens.shadows.sm,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['3'],
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: figmaTokens.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: { flex: 1 },
  documentTitle: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.gray900,
    marginBottom: 4,
  },
  documentMeta: { flexDirection: 'row', alignItems: 'center' },
  documentCategory: {
    fontSize: figmaTokens.typography.fontSize.xs,
    color: figmaTokens.colors.gray500,
  },
  documentDot: { marginHorizontal: 6, color: figmaTokens.colors.gray400 },
  documentDate: {
    fontSize: figmaTokens.typography.fontSize.xs,
    color: figmaTokens.colors.gray500,
  },
  imageCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  imageCountText: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray500,
  },
  documentDescription: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray600,
    marginTop: figmaTokens.spacing['2'],
  },
  thumbnailScroll: { marginTop: figmaTokens.spacing['3'] },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: figmaTokens.borderRadius.lg,
    marginRight: figmaTokens.spacing['2'],
  },
  moreImages: {
    width: 60,
    height: 60,
    borderRadius: figmaTokens.borderRadius.lg,
    backgroundColor: figmaTokens.colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesText: {
    fontSize: figmaTokens.typography.fontSize.sm,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray600,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: figmaTokens.colors.white,
    borderTopLeftRadius: figmaTokens.borderRadius['3xl'],
    borderTopRightRadius: figmaTokens.borderRadius['3xl'],
    maxHeight: '90%',
    paddingBottom: figmaTokens.spacing['6'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: figmaTokens.spacing['4'],
    borderBottomWidth: 1,
    borderBottomColor: figmaTokens.colors.gray200,
  },
  modalTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.gray900,
  },
  modalScroll: { padding: figmaTokens.spacing['4'] },

  inputLabel: {
    fontSize: figmaTokens.typography.fontSize.sm,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray700,
    marginBottom: figmaTokens.spacing['2'],
    marginTop: figmaTokens.spacing['4'],
  },
  textInput: {
    backgroundColor: figmaTokens.colors.gray100,
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['4'],
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray900,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  categoryScroll: { marginBottom: figmaTokens.spacing['2'] },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: figmaTokens.spacing['3'],
    paddingVertical: figmaTokens.spacing['2'],
    borderRadius: figmaTokens.borderRadius.full,
    borderWidth: 1,
    borderColor: figmaTokens.colors.gray300,
    marginRight: figmaTokens.spacing['2'],
    gap: figmaTokens.spacing['2'],
  },
  categoryChipText: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray600,
  },

  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: figmaTokens.colors.gray100,
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['4'],
    gap: figmaTokens.spacing['3'],
  },
  dateButtonText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray900,
  },

  imageButtons: {
    flexDirection: 'row',
    gap: figmaTokens.spacing['4'],
  },
  imageButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: figmaTokens.spacing['6'],
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: figmaTokens.colors.purple300,
    borderRadius: figmaTokens.borderRadius.xl,
    backgroundColor: figmaTokens.colors.purple50,
    gap: figmaTokens.spacing['2'],
  },
  imageButtonText: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.purple700,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },

  selectedImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: figmaTokens.spacing['3'],
    marginTop: figmaTokens.spacing['4'],
  },
  selectedImageContainer: { position: 'relative' },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: figmaTokens.borderRadius.lg,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius.full,
  },

  uploadButton: {
    backgroundColor: figmaTokens.colors.purple600,
    borderRadius: figmaTokens.borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: figmaTokens.spacing['4'],
    marginHorizontal: figmaTokens.spacing['4'],
    gap: figmaTokens.spacing['2'],
  },
  uploadButtonDisabled: { backgroundColor: figmaTokens.colors.gray400 },
  uploadButtonText: {
    color: figmaTokens.colors.white,
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },

  // View Modal
  viewModalContainer: {
    flex: 1,
    backgroundColor: figmaTokens.colors.white,
  },
  viewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: figmaTokens.spacing['4'],
    paddingTop: Platform.OS === 'ios' ? 50 : figmaTokens.spacing['4'],
    paddingBottom: figmaTokens.spacing['4'],
    borderBottomWidth: 1,
    borderBottomColor: figmaTokens.colors.gray200,
    backgroundColor: figmaTokens.colors.white,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: figmaTokens.colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: figmaTokens.colors.red50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModalTitle: {
    flex: 1,
    fontSize: figmaTokens.typography.fontSize.lg,
    fontWeight: figmaTokens.typography.fontWeight.semibold,
    color: figmaTokens.colors.gray900,
    textAlign: 'center',
    marginHorizontal: figmaTokens.spacing['3'],
  },
  viewModalScroll: { flex: 1 },

  mainImageContainer: {
    backgroundColor: figmaTokens.colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: figmaTokens.spacing['4'],
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  imageNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: figmaTokens.spacing['4'],
    gap: figmaTokens.spacing['4'],
  },
  navButton: { padding: figmaTokens.spacing['2'] },
  imageCounter: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
  },

  viewThumbnails: {
    padding: figmaTokens.spacing['4'],
  },
  viewThumbnail: {
    marginRight: figmaTokens.spacing['2'],
    borderRadius: figmaTokens.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  viewThumbnailActive: {
    borderColor: figmaTokens.colors.purple500,
  },
  viewThumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: figmaTokens.borderRadius.lg,
  },

  viewDetails: {
    padding: figmaTokens.spacing['4'],
    gap: figmaTokens.spacing['3'],
  },
  viewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['3'],
  },
  viewDetailLabel: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray500,
  },
  viewDetailValue: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray900,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
  viewDescriptionBox: {
    backgroundColor: figmaTokens.colors.gray100,
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['4'],
    marginTop: figmaTokens.spacing['2'],
  },
  viewDescriptionLabel: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray500,
    marginBottom: figmaTokens.spacing['2'],
  },
  viewDescriptionText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray700,
    lineHeight: 22,
  },
});
