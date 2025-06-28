import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import TabNavigator from './TabNavigator';
import HabitFormScreen from '../screens/HabitFormScreen';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
  HabitForm: {
    habit?: any;
    isEdit?: boolean;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // 로딩 화면을 표시할 수 있습니다
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          // 인증된 사용자
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="HabitForm" 
              component={HabitFormScreen}
              options={{
                headerShown: true,
                title: '습관 만들기',
                headerStyle: {
                  backgroundColor: '#fcf8f9',
                },
                headerTintColor: '#1b0d12',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
          </>
        ) : (
          // 인증되지 않은 사용자
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 