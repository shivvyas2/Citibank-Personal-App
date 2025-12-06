import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CitiLogo({ size = 24, color = 'white' }: { size?: number; color?: string }) {
  return (
    <View style={styles.container}>
      <Text style={[styles.citiText, { fontSize: size, color }]}>
        cit<Text style={[styles.redI, { color: color === 'white' ? '#E31837' : '#E31837' }]}>i</Text>®
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
    fontWeight: '300',
    letterSpacing: 1,
  },
  redI: {
    position: 'relative',
  },
});

