import React from 'react';
import { View, Text } from 'react-native';

export default function MinimalApp() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4CAF50' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white' }}>
        ✅ WORKING!
      </Text>
      <Text style={{ fontSize: 18, color: 'white', marginTop: 20 }}>
        SwasthMobile App
      </Text>
      <Text style={{ fontSize: 14, color: 'white', marginTop: 10 }}>
        Metro Connected ✓
      </Text>
    </View>
  );
}
