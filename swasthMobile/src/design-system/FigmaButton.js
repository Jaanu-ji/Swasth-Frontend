// ✅ FigmaButton Component - Migrated to React Native CLI
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import figmaTokens from './figmaTokens';

export function FigmaButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) {
  const isGradient = variant === 'primary';
  const isOutline = variant === 'outline';
  const isText = variant === 'text';

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={isGradient || isText ? figmaTokens.colors.white : figmaTokens.colors.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            isGradient && styles.primaryText,
            isOutline && styles.outlineText,
            isText && styles.textVariant,
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </>
  );

  if (isGradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[styles.button, fullWidth && styles.fullWidth, disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={figmaTokens.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, fullWidth && styles.fullWidth]}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        isOutline && styles.outline,
        isText && styles.textButton,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      {buttonContent}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: figmaTokens.spacing['3'],
    paddingHorizontal: figmaTokens.spacing['4'],
    borderRadius: figmaTokens.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    paddingVertical: figmaTokens.spacing['3'],
    paddingHorizontal: figmaTokens.spacing['4'],
    borderRadius: figmaTokens.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: figmaTokens.colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
  },
  primaryText: {
    color: figmaTokens.colors.white,
  },
  outlineText: {
    color: figmaTokens.colors.primary,
  },
  textVariant: {
    color: figmaTokens.colors.primary,
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default FigmaButton;
