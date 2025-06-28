import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ 
  children, 
  style, 
  edges = ['top', 'left', 'right'] 
}) => {
  return (
    <SafeAreaView 
      style={[{ flex: 1 }, style]} 
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};

export default SafeAreaWrapper; 