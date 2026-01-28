// ✅ Forgot Password Screen - OTP based password reset
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import figmaTokens from '../../design-system/figmaTokens';
import { FigmaCard } from '../../design-system/FigmaCard';
import { sendPasswordResetOTP, verifyPasswordResetOTP, resetPassword } from '../../config/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetOTP(email.trim().toLowerCase());
      Alert.alert('Success', 'OTP has been sent to your email');
      setStep(2);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Error', 'Please enter a valid OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyPasswordResetOTP(email.trim().toLowerCase(), otp);
      setStep(3);
    } catch (err) {
      Alert.alert('Error', err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase(), otp, newPassword);
      Alert.alert('Success', 'Password reset successfully! Please login with your new password.', [
        { text: 'OK', onPress: () => navigation.replace('Login') }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await sendPasswordResetOTP(email.trim().toLowerCase());
      Alert.alert('Success', 'OTP has been resent to your email');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
      <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
      <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
      <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
      <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
    </View>
  );

  const renderEmailStep = () => (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputWrapper}>
          <Icon
            name="email"
            size={20}
            color={figmaTokens.colors.gray400}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Enter your registered email"
            placeholderTextColor={figmaTokens.colors.gray400}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSendOTP}
        style={styles.submitButton}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[figmaTokens.colors.blue500, figmaTokens.colors.purple500]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitButtonGradient}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={figmaTokens.colors.white} />
              <Text style={styles.submitButtonText}>Sending OTP...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Send OTP</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderOTPStep = () => (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter OTP</Text>
        <Text style={styles.helperText}>We've sent a 6-digit code to {email}</Text>
        <View style={styles.inputWrapper}>
          <Icon
            name="numeric"
            size={20}
            color={figmaTokens.colors.gray400}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Enter 6-digit OTP"
            placeholderTextColor={figmaTokens.colors.gray400}
            value={otp}
            onChangeText={setOtp}
            style={styles.input}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
      </View>

      <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
        <Text style={styles.resendText}>Didn't receive OTP? Resend</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleVerifyOTP}
        style={styles.submitButton}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[figmaTokens.colors.blue500, figmaTokens.colors.purple500]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitButtonGradient}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={figmaTokens.colors.white} />
              <Text style={styles.submitButtonText}>Verifying...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Verify OTP</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderPasswordStep = () => (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputWrapper}>
          <Icon
            name="lock"
            size={20}
            color={figmaTokens.colors.gray400}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Enter new password"
            placeholderTextColor={figmaTokens.colors.gray400}
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={figmaTokens.colors.gray400}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputWrapper}>
          <Icon
            name="lock-check"
            size={20}
            color={figmaTokens.colors.gray400}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Confirm new password"
            placeholderTextColor={figmaTokens.colors.gray400}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeButton}
          >
            <Icon
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={20}
              color={figmaTokens.colors.gray400}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleResetPassword}
        style={styles.submitButton}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[figmaTokens.colors.blue500, figmaTokens.colors.purple500]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitButtonGradient}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={figmaTokens.colors.white} />
              <Text style={styles.submitButtonText}>Resetting...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Reset Password</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Forgot Password';
      case 2: return 'Verify OTP';
      case 3: return 'Create New Password';
      default: return 'Forgot Password';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1: return 'Enter your email to receive a password reset OTP';
      case 2: return 'Enter the OTP sent to your email';
      case 3: return 'Create a new secure password';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <LinearGradient
          colors={[figmaTokens.colors.blue50, figmaTokens.colors.purple50]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <FigmaCard style={styles.card}>
                <View style={styles.logoContainer}>
                  <LinearGradient
                    colors={[figmaTokens.colors.blue500, figmaTokens.colors.purple500]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.logoCircle}
                  >
                    <Icon name="lock-reset" size={48} color={figmaTokens.colors.white} />
                  </LinearGradient>
                </View>

                <Text style={styles.title}>{getStepTitle()}</Text>
                <Text style={styles.subtitle}>{getStepSubtitle()}</Text>

                {renderStepIndicator()}

                <View style={styles.form}>
                  {step === 1 && renderEmailStep()}
                  {step === 2 && renderOTPStep()}
                  {step === 3 && renderPasswordStep()}
                </View>

                <View style={styles.backContainer}>
                  <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backLink}>Back to Login</Text>
                  </TouchableOpacity>
                </View>
              </FigmaCard>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: figmaTokens.spacing['6'],
    paddingVertical: figmaTokens.spacing['12'],
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  card: {
    borderRadius: figmaTokens.borderRadius['3xl'],
    padding: figmaTokens.spacing['8'],
    ...figmaTokens.shadows.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: figmaTokens.spacing['6'],
  },
  logoCircle: {
    borderRadius: figmaTokens.borderRadius.full,
    padding: figmaTokens.spacing['4'],
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: figmaTokens.typography.fontSize['2xl'],
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
    textAlign: 'center',
    marginBottom: figmaTokens.spacing['2'],
  },
  subtitle: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
    textAlign: 'center',
    marginBottom: figmaTokens.spacing['6'],
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: figmaTokens.spacing['6'],
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: figmaTokens.colors.gray300,
  },
  stepDotActive: {
    backgroundColor: figmaTokens.colors.blue500,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: figmaTokens.colors.gray300,
    marginHorizontal: figmaTokens.spacing['1'],
  },
  stepLineActive: {
    backgroundColor: figmaTokens.colors.blue500,
  },
  form: {
    gap: figmaTokens.spacing['4'],
  },
  inputContainer: {
    marginBottom: figmaTokens.spacing['2'],
  },
  label: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray700,
    marginBottom: figmaTokens.spacing['2'],
  },
  helperText: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.gray500,
    marginBottom: figmaTokens.spacing['2'],
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: figmaTokens.spacing['4'],
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingLeft: 48,
    paddingRight: figmaTokens.spacing['4'],
    paddingVertical: figmaTokens.spacing['3'],
    borderWidth: 1,
    borderColor: figmaTokens.colors.gray300,
    borderRadius: figmaTokens.borderRadius.xl,
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray900,
    backgroundColor: figmaTokens.colors.white,
  },
  eyeButton: {
    position: 'absolute',
    right: figmaTokens.spacing['4'],
    padding: figmaTokens.spacing['2'],
  },
  resendText: {
    color: figmaTokens.colors.blue500,
    fontSize: figmaTokens.typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: figmaTokens.spacing['4'],
  },
  submitButton: {
    width: '100%',
    borderRadius: figmaTokens.borderRadius.xl,
    overflow: 'hidden',
    marginTop: figmaTokens.spacing['4'],
    ...figmaTokens.shadows.lg,
  },
  submitButtonGradient: {
    paddingVertical: figmaTokens.spacing['3'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: figmaTokens.spacing['2'],
  },
  submitButtonText: {
    color: figmaTokens.colors.white,
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
  backContainer: {
    marginTop: figmaTokens.spacing['6'],
    alignItems: 'center',
  },
  backLink: {
    color: figmaTokens.colors.blue500,
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
});
