import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import store from './store/Index';
import HomeScreen from './components/HomeScreen';
import LoadingScreen from './components/LoadingScreen';
import TechniqueDetails from './components/Detail/TechniqueDetails';

import MainDishRecipeDetail from './components/Detail/MainDishRecipeDetail';
import PastryRecipeDetail from './components/Detail/PastryRecipeDetail';
import PanaderiaRecipeDetail from './components/Detail/PanaderiaRecipeDetail';
import SalsaRecipeDetail from './components/Detail/SalsaRecipeDetail';
import SaladRecipeDetail from './components/Detail/SaladRecipeDetail';
import SoupRecipeDetail from './components/Detail/SoupRecipeDetail';
import DrinkRecipeDetail from './components/Detail/DrinkRecipeDetail';




import FavoriteRecipeDetail from './components/Detail/FavoriteRecipeDetail';
import Menu from './components/Menu';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Loading" component={LoadingScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="TechniqueDetails" component={TechniqueDetails} options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: { backgroundColor: '#4CAF50', height: 80, elevation: 5, shadowOpacity: 0.5 },
              headerTintColor: 'black',
            }} />
            <Stack.Screen name="MainDishRecipeDetail" component={MainDishRecipeDetail} options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: { backgroundColor: '#FF9800', elevation: 5, shadowOpacity: 0.5 },
              headerTintColor: 'black',
            }} />
            <Stack.Screen name="PastryRecipeDetail" component={PastryRecipeDetail} options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: { backgroundColor: '#F48FB1', elevation: 5, shadowOpacity: 0.5 },
              headerTintColor: 'black',
            }} />
            <Stack.Screen name="PanaderiaRecipeDetail" component={PanaderiaRecipeDetail} options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: { backgroundColor: '#8B4513', elevation: 5, shadowOpacity: 0.5 },
              headerTintColor: 'black',
            }} />
            <Stack.Screen name="SalsaRecipeDetail" component={SalsaRecipeDetail} options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: { backgroundColor: '#FF7043', elevation: 5, shadowOpacity: 0.5 },
              headerTintColor: 'black',
            }} />
            <Stack.Screen name="SaladRecipeDetail" component={SaladRecipeDetail} options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: { backgroundColor: '#81C784', elevation: 5, shadowOpacity: 0.5 },
              headerTintColor: 'black',
            }} />
            <Stack.Screen name="SoupRecipeDetail" component={SoupRecipeDetail} options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: { backgroundColor: '#FFC107', elevation: 5, shadowOpacity: 0.5 },
              headerTintColor: 'black',
            }} />
            <Stack.Screen name="DrinkRecipeDetail" component={DrinkRecipeDetail} options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: { backgroundColor: '#4DB6AC', elevation: 5, shadowOpacity: 0.5 },
              headerTintColor: 'black',
            }} />
            <Stack.Screen name="FavoriteRecipeDetail" component={FavoriteRecipeDetail} options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: { backgroundColor: '#E53935', elevation: 5, shadowOpacity: 0.5 },
              headerTintColor: 'black',
            }} />
            <Stack.Screen name="Menu" component={Menu} options={{
              headerShown: true,
              title: '',
              headerStyle: { backgroundColor: '#5a86c3', height: 100, elevation: 5, shadowOpacity: 0.5 },
              headerTintColor: 'black',
            }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
