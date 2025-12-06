import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CitiLogo() {
  return (
    <View style={styles.container}>
      <Text style={styles.citiText}>
        cit<Text style={styles.redI}>i</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  citiText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0066CC',
    letterSpacing: 1,
  },
  redI: {
    color: '#0066CC',
    position: 'relative',
  },
});

