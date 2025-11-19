import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SensorsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Датчики</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  text: {
    fontSize: 24,
    color: '#F9F9F9',
  },
});