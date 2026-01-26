// Minimal Test App - No third party libraries
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MinimalTestApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Swasth App</Text>
      <Text style={styles.subtitle}>App is working!</Text>
      <Text style={styles.info}>If you see this, the basic app loads correctly.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#22c55e',
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
