// ✅ FigmaInput Component
import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import figmaTokens from './figmaTokens';

export function FigmaInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  icon,
  style,
  error,
}) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        {icon && <View style={styles.iconContainer}>{icon()}</View>}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            multiline && styles.inputMultiline,
            error && styles.inputError,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={figmaTokens.colors.gray400}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: figmaTokens.spacing['4'],
  },
  label: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray700,
    marginBottom: figmaTokens.spacing['2'],
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    left: figmaTokens.spacing['4'],
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: figmaTokens.colors.white,
    borderWidth: 1,
    borderColor: figmaTokens.colors.gray300,
    borderRadius: figmaTokens.borderRadius.xl,
    paddingVertical: figmaTokens.spacing['3'],
    paddingHorizontal: figmaTokens.spacing['4'],
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.black,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: figmaTokens.colors.destructive,
  },
  errorText: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.destructive,
    marginTop: figmaTokens.spacing['1'],
  },
});

export default FigmaInput;
