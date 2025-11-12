import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) { // <- navigation берём из props
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Главный экран 🎓</Text>
      <Button
        title="Перейти к деталям"
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f2f2' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#004AAD', marginBottom: 20 },
});
