import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GameScreen from './screens/GameScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Game">
        <Stack.Screen
          name="Game"
          component={GameScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
