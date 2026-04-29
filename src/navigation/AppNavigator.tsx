// App Navigator - Navigation Setup
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CreatePayInScreen } from '../features/payin/presentation/screens/CreatePayInScreen';
import { PayInDetailScreen } from '../features/payin/presentation/screens/PayInDetailScreen';
import { PayInListScreen } from '../features/payin/presentation/screens/PayInListScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

export type RootStackParamList = {
  MainTabs: undefined;
  PayInDetail: { payInId: string };
};

export type PayInStackParamList = {
  PayInList: undefined;
  PayInDetail: { payInId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const PayInStack = createNativeStackNavigator<PayInStackParamList>();
const Tab = createBottomTabNavigator();

const PayInNavigator = () => {
  return (
    <PayInStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#007AFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <PayInStack.Screen
        name="PayInList"
        component={PayInListScreen}
        options={{
          headerShown: false,
        }}
      />
      <PayInStack.Screen
        name="PayInDetail"
        component={PayInDetailScreen}
        options={{
          title: 'Transaction Details',
        }}
      />
    </PayInStack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="List"
        component={PayInNavigator}
        options={{
            tabBarButtonTestID: 'tab-transactions-button',
          tabBarLabel: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreatePayInScreen}
        options={{
          tabBarLabel: 'Create',
          tabBarButtonTestID: 'tab-create-button',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};
