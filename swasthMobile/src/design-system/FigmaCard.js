// ✅ FigmaCard Component
import React from 'react';
import { View, StyleSheet } from 'react-native';
import figmaTokens from './figmaTokens';

export function FigmaCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius['2xl'],
    padding: figmaTokens.spacing['6'],
    ...figmaTokens.shadows.sm,
  },
});

export default FigmaCard;
