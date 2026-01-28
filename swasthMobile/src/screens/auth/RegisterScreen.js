// ✅ Register Screen (LOGIN STYLE MATCHED)
import { useState } from "react";
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
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../../hooks/useAuth";
import figmaTokens from "../../design-system/figmaTokens";
import { FigmaCard } from "../../design-system/FigmaCard";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    height: "",
    weight: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    console.log("🔥 handleSubmit CALLED");

    if (loading) return;

    if (!form.name || !form.email || !form.password) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (form.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    const height = Number(form.height);
    const weight = Number(form.weight);

    if (!height || !weight) {
      Alert.alert("Error", "Enter valid height and weight");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      height,
      weight,
      goal: "Maintain",
    };

    console.log("🟡 BEFORE register()", payload);

    setLoading(true);
    try {
      await register(payload);
      Alert.alert("Success", "Account created successfully");
      navigation.replace("Dashboard");
    } catch (err) {
      console.log("❌ REGISTER ERROR:", err);
      Alert.alert("Registration Failed", err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <LinearGradient
          colors={[figmaTokens.colors.blue50, figmaTokens.colors.purple50]}
          style={styles.gradient}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <FigmaCard style={styles.card}>
              {/* HEADER */}
              <View style={styles.header}>
                <View style={styles.iconCircle}>
                  <Icon
                    name="account-plus"
                    size={26}
                    color={figmaTokens.colors.white}
                  />
                </View>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>
                  Start your Swasth journey
                </Text>
              </View>

              {/* NAME */}
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="account"
                  size={20}
                  color={figmaTokens.colors.gray400}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={figmaTokens.colors.gray400}
                  value={form.name}
                  onChangeText={(v) =>
                    setForm({ ...form, name: v })
                  }
                />
              </View>

              {/* EMAIL */}
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="email-outline"
                  size={20}
                  color={figmaTokens.colors.gray400}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={figmaTokens.colors.gray400}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={form.email}
                  onChangeText={(v) =>
                    setForm({ ...form, email: v })
                  }
                />
              </View>

              {/* PASSWORD */}
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="lock-outline"
                  size={20}
                  color={figmaTokens.colors.gray400}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor={figmaTokens.colors.gray400}
                  secureTextEntry={!showPassword}
                  value={form.password}
                  onChangeText={(v) =>
                    setForm({ ...form, password: v })
                  }
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                  />
                </TouchableOpacity>
              </View>

              {/* HEIGHT */}
              <Text style={styles.label}>Height (cm)</Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="human-male-height"
                  size={20}
                  color={figmaTokens.colors.gray400}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 170"
                  placeholderTextColor={figmaTokens.colors.gray400}
                  keyboardType="numeric"
                  value={form.height}
                  onChangeText={(v) =>
                    setForm({ ...form, height: v })
                  }
                />
              </View>

              {/* WEIGHT */}
              <Text style={styles.label}>Weight (kg)</Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="scale-bathroom"
                  size={20}
                  color={figmaTokens.colors.gray400}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 65"
                  placeholderTextColor={figmaTokens.colors.gray400}
                  keyboardType="numeric"
                  value={form.weight}
                  onChangeText={(v) =>
                    setForm({ ...form, weight: v })
                  }
                />
              </View>

              {/* BUTTON */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[
                    figmaTokens.colors.blue500,
                    figmaTokens.colors.purple500,
                  ]}
                  style={styles.submitButtonGradient}
                  pointerEvents="none"
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      Create Account
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* FOOTER */}
              <TouchableOpacity
                style={styles.footer}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.footerText}>
                  Already have an account?{" "}
                  <Text style={styles.footerLink}>Login</Text>
                </Text>
              </TouchableOpacity>
            </FigmaCard>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  gradient: { flex: 1 },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: figmaTokens.spacing["6"],
  },

  card: {
    borderRadius: figmaTokens.borderRadius["3xl"],
    padding: figmaTokens.spacing["8"],
    ...figmaTokens.shadows.xl,
  },

  header: {
    alignItems: "center",
    marginBottom: figmaTokens.spacing["6"],
  },

  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: figmaTokens.colors.blue500,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: figmaTokens.spacing["3"],
  },

  title: {
    fontSize: figmaTokens.typography.fontSize["2xl"],
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },

  subtitle: {
    marginTop: 4,
    color: figmaTokens.colors.gray500,
  },

  label: {
    marginBottom: 6,
    color: figmaTokens.colors.gray600,
    fontSize: 13,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: figmaTokens.colors.gray300,
    borderRadius: figmaTokens.borderRadius.xl,
    paddingHorizontal: figmaTokens.spacing["3"],
    marginBottom: figmaTokens.spacing["4"],
    backgroundColor: "#fff",
  },

  input: {
    flex: 1,
    paddingVertical: figmaTokens.spacing["3"],
    marginLeft: 8,
    color: figmaTokens.colors.gray900,
  },

  submitButton: {
    borderRadius: figmaTokens.borderRadius.xl,
    overflow: "hidden",
    marginTop: figmaTokens.spacing["4"],
  },

  submitButtonGradient: {
    paddingVertical: figmaTokens.spacing["3"],
    alignItems: "center",
  },

  submitButtonText: {
    color: "#fff",
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },

  footer: {
    marginTop: figmaTokens.spacing["6"],
    alignItems: "center",
  },

  footerText: {
    color: figmaTokens.colors.gray600,
  },

  footerLink: {
    color: figmaTokens.colors.blue500,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
});
