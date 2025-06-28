import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Ellipse } from 'react-native-svg';

interface LogoProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 100, 
  color = '#6366F1', 
  backgroundColor = '#4F46E5' 
}) => {
  const center = size / 2;
  const radius = size * 0.4;
  const strokeWidth = size * 0.02;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 배경 원 */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill={color}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        
        {/* 숫자 9 스타일 */}
        <Path
          d={`M ${center * 0.625} ${center * 0.4} L ${center * 0.625} ${center * 0.8} L ${center * 0.9375} ${center * 0.8} L ${center * 0.9375} ${center * 0.6} L ${center * 0.84375} ${center * 0.6} L ${center * 0.84375} ${center * 0.8} L ${center * 0.625} ${center * 0.8} L ${center * 0.625} ${center * 0.4} L ${center * 0.9375} ${center * 0.4} L ${center * 0.9375} ${center * 0.6} L ${center * 0.84375} ${center * 0.6} L ${center * 0.84375} ${center * 0.4} Z`}
          fill="white"
        />
        
        {/* 0 스타일 */}
        <Ellipse
          cx={center}
          cy={center}
          rx={radius * 0.25}
          ry={radius * 0.4}
          fill="none"
          stroke="white"
          strokeWidth={strokeWidth * 3}
          strokeLinecap="round"
        />
        
        {/* 추가 디자인 요소 */}
        <Circle
          cx={center}
          cy={center}
          r={radius * 0.125}
          fill="none"
          stroke="white"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Logo; 