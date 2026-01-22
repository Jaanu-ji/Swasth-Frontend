// ✅ HeaderBar Component - Migrated to React Native CLI
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import figmaTokens from './figmaTokens';

export function HeaderBar({
  title,
  onBack,
  rightIcon,
  onRightPress,
  backgroundColor = figmaTokens.colors.white,
  showBorder = true,
}) {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <View style={[styles.header, { backgroundColor }, showBorder && styles.headerWithBorder]}>
        <View style={styles.leftSection}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="arrow-left" size={24} color={figmaTokens.colors.gray900} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.centerSection}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.rightSection}>
          {rightIcon && (
            <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
              <Icon name={rightIcon} size={20} color={figmaTokens.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: figmaTokens.spacing['3'],
    paddingHorizontal: figmaTokens.spacing['4'],
    height: 56,
  },
  headerWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: figmaTokens.colors.gray200,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: figmaTokens.spacing['1'],
  },
  rightButton: {
    padding: figmaTokens.spacing['1'],
  },
  title: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
  },
});

export default HeaderBar;
