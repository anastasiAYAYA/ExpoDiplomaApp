import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; 


import HomeScreen from './app/screens/HomeScreen'; 
import AnalysisScreen from './app/screens/AnalysisScreen';
import SensorsScreen from './app/screens/SensorsScreen';
import AccountScreen from './app/screens/AccountScreen';

const Tab = createBottomTabNavigator();

const activeColor = '#a993ffff';
const inactiveColor = '#BDBDBD';
const backgroundColor = '#2D2D2D';

function TabBarNavigation() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Analysis') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Sensors') {
            iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
            backgroundColor: backgroundColor,
            borderTopWidth: 1,
            borderTopColor: '#3A3A3A',
            height: 60, 
            paddingBottom: 5,
            paddingTop: 5,
        },
        tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600'
        }
      })}
    >
      {/* Определяем маршруты (экраны) */}
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Дашборд' }}
      />
      <Tab.Screen 
        name="Analysis" 
        component={AnalysisScreen} 
        options={{ tabBarLabel: 'Анализ' }}
      />
      <Tab.Screen 
        name="Sensors" 
        component={SensorsScreen} 
        options={{ tabBarLabel: 'Датчики' }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen} 
        options={{ tabBarLabel: 'Аккаунт' }}
      />
    </Tab.Navigator>
  );
}

// Экспортируем корневой компонент
export default function App() {
  return (
    <NavigationContainer>
      <TabBarNavigation />
    </NavigationContainer>
  );
}