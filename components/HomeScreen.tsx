// HomeScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageSourcePropType,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/Index';
import { setPremium } from '../store/Slices/userSlice';
import { loadFavoritesFromStorage } from '../store/storage/FavoriteStorage';
import { auth } from '../services/firebaseConfig';
import { subscribeUser } from '../services/subscriptionService';

import MainDishRecipeListMain from '../components/List/MainDishRecipeListMain';
import PastryRecipeListMain from './List/PastryRecipeListMain';
import PanaderiaRecipeListMain from './List/PanaderiaRecipeListMain';
import SoupRecipeListMain from './List/SoupRecipeListMain';
import SalsaRecipeListMain from './List/SalsaRecipeListMain';
import SaladRecipeListMain from './List/SaladRecipeListMain';
import DrinksRecipeListMain from './List/DrinksRecipeListMain';


import TechniqueList from '../components/List/TechniqueList';
import Favorites from './Favorites';
import Marketplace from '../components/MarketPlace';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Plan = {
  id: string;
  name: string;
  price: number;
  currency: string;
};

type RootStackParamList = {
  Menu: undefined;
  TechniqueDetails: any;
  MainDishRecipeDetail: any;
  PastryRecipeDetail: any;
  PanaderiaRecipeDetail: any;
  SalsaRecipeDetail: any;
  SaladRecipeDetail: any;
  SoupRecipeDetail: any;
  DrinkRecipeDetail: any;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Menu'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

enum Sections {
  Cocina = 'Cocina 🔪',
  Pasteleria = 'Pastelería 🍰',
  Panaderia = 'Panadería 🥖',
  Sopas = 'Sopas 🍲',
  Salsas = 'Salsas 🍅',
  Ensaladas = 'Ensaladas 🥗',
  Tragos = 'Tragos 🍸',
  Tecnicas = 'Tecnicas 🍳',
  Favoritos = 'Favoritos ⭐',
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [activeComponent, setActiveComponent] = useState<Sections>(Sections.Tecnicas);
  const [modalVisible, setModalVisible] = useState(false);
  const [marketplaceIcon, setMarketplaceIcon] = useState<ImageSourcePropType | null>(null);
  const [themeIndex, setThemeIndex] = useState(0);
  const [flatListBackgroundColor, setFlatListBackgroundColor] = useState('#2A5D55');
  const [isLoading, setIsLoading] = useState(false);

  const data = Object.values(Sections).map((title, index) => ({ id: index.toString(), title }));

  const themes = [
    { gradientColors: ['#16eec8', '#16ee5d', '#16ee49', '#2bee16'], buttonColor: ['#97D5CB', '#07996b'], flatListColor: '#2A5D55' },
    { gradientColors: ['#f9f9f9', '#e0e0e0', '#d0d0d0', '#b0b0b0'], buttonColor: ['#ffffff', '#cccccc'], flatListColor: '#90CAF9' },
    { gradientColors: ['#333333', '#222222', '#111111'], buttonColor: ['#666666', '#333333'], flatListColor: '#E0E0E0' },
    { gradientColors: ['#ffafcc', '#ff97b5', '#ff77aa', '#ff4e78'], buttonColor: ['#FFD1DC', '#ff69b4'], flatListColor: '#003366' },
    { gradientColors: ['#ff9f9f', '#ff7373', '#ff4e50', '#ff0000'], buttonColor: ['#ff726f', '#e60000'], flatListColor: '#A1887F' },
    { gradientColors: ['#4e54c8', '#8f94fb', '#5a7fda', '#2a4f99'], buttonColor: ['#89c2d9', '#48639c'], flatListColor: '#607D8B' },
    { gradientColors: ['#9f5f80', '#69306d', '#7a4b8c', '#5b2a60'], buttonColor: ['#b185a7', '#5d1451'], flatListColor: '#B79F00' },
  ];

  const marketplaceIcons: ImageSourcePropType[] = [
    require('../assets/MarketPlaceIcon/1.webp'),
    require('../assets/MarketPlaceIcon/2.webp'),
    require('../assets/MarketPlaceIcon/3.webp'),
    require('../assets/MarketPlaceIcon/4.webp'),
    require('../assets/MarketPlaceIcon/5.webp'),
    require('../assets/MarketPlaceIcon/6.webp'),
    require('../assets/MarketPlaceIcon/7.webp'),
    require('../assets/MarketPlaceIcon/8.webp'),
    require('../assets/MarketPlaceIcon/9.webp'),
  ];

  useEffect(() => {
    const randomIcon = marketplaceIcons[Math.floor(Math.random() * marketplaceIcons.length)];
    setMarketplaceIcon(randomIcon);
  }, []);

  const currentTheme = themes[themeIndex];

  const changeTheme = () => {
    setIsLoading(true);
    const newThemeIndex = (themeIndex + 1) % themes.length;
    setThemeIndex(newThemeIndex);
    setFlatListBackgroundColor(themes[newThemeIndex].flatListColor);
    AsyncStorage.setItem('themeIndex', newThemeIndex.toString()).finally(() => setIsLoading(false));
    AsyncStorage.setItem('flatListBackgroundColor', themes[newThemeIndex].flatListColor);
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedThemeIndex = await AsyncStorage.getItem('themeIndex');
        const savedFlatListColor = await AsyncStorage.getItem('flatListBackgroundColor');
        if (savedThemeIndex !== null) {
          setThemeIndex(Number(savedThemeIndex));
          setFlatListBackgroundColor(savedFlatListColor || themes[0].flatListColor);
        }
      } catch (error) {
        console.error('Error loading theme index', error);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    const initFavorites = async () => {
      const saved = await loadFavoritesFromStorage();
      // dispatch(setFavorites(saved)); <-- si usas tu slice
    };
    initFavorites();
  }, []);

  const handleSubscribe = async (plan: Plan) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const payload = { planId: plan.id, planName: plan.name, pricePaid: plan.price, currency: plan.currency, purchaseProvider: 'server', flashSaleApplied: false };
      await subscribeUser(user.uid, payload);
      dispatch(setPremium(true));
      setModalVisible(false);
    } catch (err) {
      console.error('Error al suscribirse:', err);
    }
  };

  return (
    <LinearGradient colors={currentTheme.gradientColors} style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        {marketplaceIcon && (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image source={marketplaceIcon} style={styles.marketplaceIcon} resizeMode="contain" />
          </TouchableOpacity>
        )}
        <Marketplace visible={modalVisible} onClose={() => setModalVisible(false)} onSubscribe={handleSubscribe} />
        <Image source={require('../assets/usedImages/Logo.png')} style={styles.logoImage} resizeMode="contain" />
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Menu')}>
          <Image source={require('../assets/usedImages/Setting.png')} style={styles.buttonImage} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Row: Theme button + FlatList */}
      <View style={styles.sectionSelectorContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.topLeftButton,
            { backgroundColor: pressed ? currentTheme.buttonColor[1] : currentTheme.buttonColor[0] },
          ]}
          onPress={changeTheme}
        >
          <Text style={styles.buttonText}></Text>
        </Pressable>

        <View style={[styles.flatListWrapper, { backgroundColor: flatListBackgroundColor }]}>
          <FlatList
            style={styles.buttonContainer}
            data={data}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [{ backgroundColor: pressed ? '#ada4a4' : 'white' }, styles.button]}
                onPress={() => setActiveComponent(item.title as Sections)}
              >
                <Text style={styles.buttonText}>{item.title}</Text>
              </Pressable>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>

      {isLoading && <ActivityIndicator size="large" color="blue" style={styles.loadingIndicator} />}

      {/* Main container */}
      <View style={[styles.container2, { backgroundColor: flatListBackgroundColor }]}>
        {activeComponent === Sections.Cocina && <MainDishRecipeListMain />}
        {activeComponent === Sections.Pasteleria && <PastryRecipeListMain />}
        {activeComponent === Sections.Panaderia && <PanaderiaRecipeListMain />}
        {activeComponent === Sections.Sopas && <SoupRecipeListMain />}
        {activeComponent === Sections.Salsas && <SalsaRecipeListMain />}
        {activeComponent === Sections.Ensaladas && <SaladRecipeListMain />}
        {activeComponent === Sections.Tragos && <DrinksRecipeListMain />}
        {activeComponent === Sections.Tecnicas && (
          <TechniqueList onPressTechnique={(item: any) => item && navigation.navigate('TechniqueDetails', { ...item })} />
        )}
        {activeComponent === Sections.Favoritos && <Favorites />}
      </View>

      <StatusBar style="auto" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20
  },
  headerContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 15,
  },
  profileButton: { width: 55, height: 55 },
  marketplaceIcon: { width: 70, height: 70 },
  logoImage: { width: 120, height: 100, alignSelf: 'center' },
  sectionSelectorContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  topLeftButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'black', justifyContent: 'center', alignItems: 'center' },
  flatListWrapper: { flex: 1, marginLeft: 10, padding: 10, borderRadius: 15, alignItems: 'center', elevation: 10, borderWidth: 1, borderColor: 'black' },
  buttonContainer: { height: 40 },
  button: { height: 40, borderRadius: 20, paddingHorizontal: 10, marginHorizontal: 5, borderWidth: 1, borderColor: 'black', justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: 'black', fontSize: 15 },
  container2: { flex: 0.96, borderWidth: 1, borderColor: 'black', borderRadius: 20, padding: 5, marginTop: 10 },
  buttonImage: { width: '100%', height: '100%', borderRadius: 50 },
  loadingIndicator: { justifyContent: 'center', alignItems: 'center' },
});
