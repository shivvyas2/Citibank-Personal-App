import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface CreditScoreProgressBarProps {
  score: number;
  minScore?: number;
  maxScore?: number;
  showScore?: boolean;
}

export default function CreditScoreProgressBar({ 
  score, 
  minScore = 300, 
  maxScore = 850,
  showScore = true 
}: CreditScoreProgressBarProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Calculate progress percentage
  const progress = ((score - minScore) / (maxScore - minScore)) * 100;
  
  // Determine color based on score range (supports both 0-100 and 300-850 scales)
  const getScoreColor = () => {
    // For 0-100 scale (Intelliscore)
    if (maxScore === 100) {
      if (score >= 75) return '#00AA00'; // Excellent - Green
      if (score >= 50) return '#66B3FF'; // Good - Light Blue
      if (score >= 25) return '#FF8800'; // Fair - Orange
      return '#FF4444'; // Poor - Red
    }
    // For 300-850 scale (Traditional credit score)
    if (score >= 750) return '#00AA00'; // Excellent - Green
    if (score >= 700) return '#66B3FF'; // Good - Light Blue
    if (score >= 650) return '#FF8800'; // Fair - Orange
    return '#FF4444'; // Poor - Red
  };
  
  // Get score category
  const getScoreCategory = () => {
    // For 0-100 scale (Intelliscore)
    if (maxScore === 100) {
      if (score >= 75) return 'Excellent';
      if (score >= 50) return 'Good';
      if (score >= 25) return 'Fair';
      return 'Poor';
    }
    // For 300-850 scale (Traditional credit score)
    if (score >= 750) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    return 'Poor';
  };

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [score, progress]);

  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {showScore && (
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreCategory}>{getScoreCategory()}</Text>
        </View>
      )}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBarFill, 
              { 
                width: widthInterpolate,
                backgroundColor: getScoreColor(),
              }
            ]} 
          />
        </View>
        <View style={styles.scoreRange}>
          <Text style={styles.rangeText}>{minScore}</Text>
          <Text style={styles.rangeText}>{maxScore}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  scoreCategory: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#E5E5E5',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  scoreRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  rangeText: {
    fontSize: 11,
    color: '#999999',
  },
});

