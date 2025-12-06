import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

interface CreditScoreGaugeProps {
  score: number;
  category: string;
  change: number;
  changeDirection: 'up' | 'down';
}

export default function CreditScoreGauge({ 
  score, 
  category, 
  change, 
  changeDirection 
}: CreditScoreGaugeProps) {
  const radius = 100;
  const centerX = 140;
  const centerY = 120;
  
  // Calculate the angle for the score (0-850 range maps to 180-0 degrees)
  const scoreAngle = ((850 - score) / 850) * 180;
  
  // Create the arc path
  const createArcPath = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <View style={styles.container}>
      <Svg width={280} height={200}>
        {/* Background arc */}
        <Path
          d={createArcPath(0, 180, radius)}
          stroke="#333333"
          strokeWidth="8"
          fill="none"
        />
        
        {/* Score arc */}
        <Path
          d={createArcPath(0, scoreAngle, radius)}
          stroke="#FF8800"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Score markers */}
        <SvgText
          x={40}
          y={30}
          fontSize="12"
          fill="#999999"
          textAnchor="middle"
        >
          660
        </SvgText>
        <SvgText
          x={90}
          y={20}
          fontSize="12"
          fill="#999999"
          textAnchor="middle"
        >
          720
        </SvgText>
        <SvgText
          x={190}
          y={20}
          fontSize="12"
          fill="#999999"
          textAnchor="middle"
        >
          780
        </SvgText>
        <SvgText
          x={240}
          y={30}
          fontSize="12"
          fill="#999999"
          textAnchor="middle"
        >
          850
        </SvgText>
        
        {/* Center content */}
        <SvgText
          x={centerX}
          y={centerY - 20}
          fontSize="14"
          fill="white"
          textAnchor="middle"
        >
          {category}
        </SvgText>
        
        <SvgText
          x={centerX}
          y={centerY + 10}
          fontSize="48"
          fill="white"
          fontWeight="bold"
          textAnchor="middle"
        >
          {score}
        </SvgText>
        
        <SvgText
          x={centerX}
          y={centerY + 35}
          fontSize="14"
          fill="white"
          textAnchor="middle"
        >
          {changeDirection === 'down' ? '↓' : '↑'} {change} points
        </SvgText>
      </Svg>
      
      <Text style={styles.providerText}>
        VantageScore® 3.0 provided by Experian™
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerText: {
    color: 'white',
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
  },
});
