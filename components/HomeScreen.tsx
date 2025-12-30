import { getVersionedImageSync } from "../utils/versionedImage";
// ===============================================
// HomeScreen.tsx — Versión Final con Watchdog + Redirect
// ===============================================

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

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/Index';
import { setPremium } from '../store/Slices/userSlice';

import { loadFavoritesFromStorage } from '../store/storage/FavoriteStorage';
import { auth } from '../services/firebaseConfig';

import MainDishRecipeListMain from '../components/List/MainDishRecipeListMain';
import PastryRecipeListMain from './List/PastryRecipeListMain';
import PanaderiaRecipeListMain from './List/PanaderiaRecipeListMain';
import SoupRecipeListMain from './List/SoupRecipeListMain';
import SalsaRecipeListMain from './List/SalsaRecipeListMain';
import SaladRecipeListMain from './List/SaladRecipeListMain';
import DrinksRecipeListMain from './List/DrinksRecipeListMain';
import VeganListMain from './List/VeganListMain';

import TechniqueList from '../components/List/TechniqueList';
import Favorites from './Favorites';
import Marketplace from '../components/MarketPlace';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from "@react-navigation/native";



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

interface Theme {
  gradientColors: string[];
  buttonColor: string[];
  flatListColor: string;
}

enum Sections {
  Cocina = 'Cocina 🔪',
  Pasteleria = 'Pastelería 🍰',
  Panaderia = 'Panadería 🥖',
  Sopas = 'Sopas 🍲',
  Salsas = 'Salsas 🍅',
  Ensaladas = 'Ensaladas 🥗',
  Tragos = 'Tragos 🍸',
  Vegan = 'Vegan 🥑',
  Tecnicas = 'Tecnicas 🍳',
  Favoritos = 'Favoritos ⭐',
}

export default function HomeScreen({ navigation }: HomeScreenProps) {

  const nav = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { isPremium, subscriptionResolved } = useSelector((state: RootState) => state.user);

  const [activeComponent, setActiveComponent] = useState<Sections>(Sections.Tecnicas);
  const [modalVisible, setModalVisible] = useState(false);
  const [marketplaceIcon, setMarketplaceIcon] = useState<ImageSourcePropType | null>(null);
  const [themeIndex, setThemeIndex] = useState(0);
  const [flatListBackgroundColor, setFlatListBackgroundColor] = useState('#2A5D55');
  const [isLoading, setIsLoading] = useState(false);







  // ============================================================
  // 🎨 THEMES
  // ============================================================

  const themesFree: Theme[] = [
    { gradientColors: ['#16eec8', '#16ee5d', '#16ee49', '#2bee16'], buttonColor: ['#97D5CB', '#07996b'], flatListColor: '#2A5D55' },
    { gradientColors: ['#f9f9f9', '#e0e0e0', '#d0d0d0', '#b0b0b0'], buttonColor: ['#ffffff', '#cccccc'], flatListColor: '#90CAF9' },
    { gradientColors: ['#333333', '#222222', '#111111'], buttonColor: ['#666666', '#333333'], flatListColor: '#E0E0E0' },
    { gradientColors: ['#ffafcc', '#ff97b5', '#ff77aa', '#ff4e78'], buttonColor: ['#FFD1DC', '#ff69b4'], flatListColor: '#003366' },
    { gradientColors: ['#ff9f9f', '#ff7373', '#ff4e50', '#ff0000'], buttonColor: ['#ff726f', '#e60000'], flatListColor: '#A1887F' },
    { gradientColors: ['#4e54c8', '#8f94fb', '#5a7fda', '#2a4f99'], buttonColor: ['#89c2d9', '#48639c'], flatListColor: '#607D8B' },
    { gradientColors: ['#9f5f80', '#69306d', '#7a4b8c', '#5b2a60'], buttonColor: ['#b185a7', '#5d1451'], flatListColor: '#B79F00' },
  ];

  const themesPremium: Theme[] = [
    ...themesFree,
    { gradientColors: ['#ffe0f0', '#ffcad4', '#ffb3c1', '#ff99a6'], buttonColor: ['#ffb6c1', '#ff7f9c'], flatListColor: '#FFDDEE' },
    { gradientColors: ['#cce7ff', '#99d1ff', '#66bbff', '#3399ff'], buttonColor: ['#99ccff', '#3399ff'], flatListColor: '#A0CFFF' },
    { gradientColors: ['#d4ffdf', '#a6ffc2', '#77ffaa', '#4de38d'], buttonColor: ['#a0e6a0', '#33cc66'], flatListColor: '#80FFB3' },
    { gradientColors: ['#2c003e', '#4b0066', '#660099', '#8c00cc'], buttonColor: ['#5d1a99', '#330066'], flatListColor: '#30004d' },
    { gradientColors: ['#f2f2f2', '#d9d9d9', '#bfbfbf', '#a6a6a6'], buttonColor: ['#d9d9d9', '#8c8c8c'], flatListColor: '#CCCCCC' },
    { gradientColors: ['#ff9f43', '#ff7f11', '#ff6600', '#e65c00'], buttonColor: ['#ffa64d', '#cc5200'], flatListColor: '#FFAB66' },
    { gradientColors: ['#001f3f', '#003366', '#004080', '#0059b3'], buttonColor: ['#3366cc', '#003366'], flatListColor: '#00264d' },
    { gradientColors: ['#014421', '#026633', '#038544', '#04A655'], buttonColor: ['#028844', '#014422'], flatListColor: '#015833' },
    { gradientColors: ['#8B0000', '#B22222', '#DC143C', '#FF4500'], buttonColor: ['#FF6347', '#8B0000'], flatListColor: '#A52A2A' },
    { gradientColors: ['#00008B', '#0000CD', '#4169E1', '#1E90FF'], buttonColor: ['#4682B4', '#00008B'], flatListColor: '#000080' },
    { gradientColors: ['#4B0082', '#6A0DAD', '#8A2BE2', '#9370DB'], buttonColor: ['#7B68EE', '#4B0082'], flatListColor: '#6A0DAD' },
    { gradientColors: ['#FF8C00', '#FFA500', '#FFB347', '#FFCC66'], buttonColor: ['#FF9933', '#FF8C00'], flatListColor: '#FF7F50' },
    { gradientColors: ['#FF1493', '#FF69B4', '#FF85A2', '#FFB6C1'], buttonColor: ['#FF77AA', '#FF1493'], flatListColor: '#FF69B4' },
    { gradientColors: ['#FFD700', '#FFEA00', '#FFFACD', '#FFF68F'], buttonColor: ['#FFEB3B', '#FFD700'], flatListColor: '#FFC107' },
  ];

  const availableThemes = isPremium ? themesPremium : themesFree;
  const currentTheme = availableThemes[themeIndex % availableThemes.length];

  const data = Object.values(Sections).map((title, index) => ({ id: index.toString(), title }));

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


  // ============================================================
  // ICON RANDOM
  // ============================================================
  useEffect(() => {
    const randomIcon = marketplaceIcons[Math.floor(Math.random() * marketplaceIcons.length)];
    setMarketplaceIcon(randomIcon);
  }, []);


  // ============================================================
  // THEME HANDLING
  // ============================================================
  useEffect(() => {
    const key = isPremium ? 'themeIndexPremium' : 'themeIndexFree';

    const loadTheme = async () => {
      try {
        const savedThemeIndex = await AsyncStorage.getItem(key);
        const savedFlatListColor = await AsyncStorage.getItem(`${key}_color`);
        if (savedThemeIndex !== null) {
          setThemeIndex(Number(savedThemeIndex));
          setFlatListBackgroundColor(savedFlatListColor || availableThemes[0].flatListColor);
        }
      } catch (e) {
        console.log("Theme load error:", e);
      }
    };

    loadTheme();
  }, [isPremium]);

  const changeTheme = () => {
    setIsLoading(true);
    const newThemeIndex = (themeIndex + 1) % availableThemes.length;
    setThemeIndex(newThemeIndex);
    setFlatListBackgroundColor(availableThemes[newThemeIndex].flatListColor);

    const key = isPremium ? 'themeIndexPremium' : 'themeIndexFree';
    AsyncStorage.setItem(key, newThemeIndex.toString());
    AsyncStorage.setItem(`${key}_color`, availableThemes[newThemeIndex].flatListColor);

    setIsLoading(false);
  };


  // ============================================================
  // FAVORITOS
  // ============================================================
  useEffect(() => {
    loadFavoritesFromStorage();
  }, []);


 

  // ============================================================
  // SI SUB NO ESTÁ LISTA → LOADING
  // ============================================================
  if (!subscriptionResolved) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#40E0D0" />
        <Text style={{ color: 'white', marginTop: 10 }}>Verificando suscripción...</Text>
      </View>
    );
  }


  // ============================================================
  // RENDER
  // ============================================================
  return (
    <LinearGradient colors={currentTheme.gradientColors} style={styles.container}>
      <View style={styles.headerContainer}>
        {marketplaceIcon && (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image source={marketplaceIcon} style={styles.marketplaceIcon} resizeMode="contain" />
          </TouchableOpacity>
        )}

        <Marketplace
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />

        <Image
          source={require('../assets/usedImages/Logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Menu')}
        >
          <Image
            source={require('../assets/usedImages/Setting.png')}
            style={styles.buttonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionSelectorContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.topLeftButton,
            { backgroundColor: pressed ? currentTheme.buttonColor[1] : currentTheme.buttonColor[0] },
          ]}
          onPress={changeTheme}
        >
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

      <View style={[styles.container2, { backgroundColor: flatListBackgroundColor }]}>

        {activeComponent === Sections.Cocina && <MainDishRecipeListMain />}
        {activeComponent === Sections.Pasteleria && <PastryRecipeListMain />}
        {activeComponent === Sections.Panaderia && <PanaderiaRecipeListMain />}
        {activeComponent === Sections.Sopas && <SoupRecipeListMain />}
        {activeComponent === Sections.Salsas && <SalsaRecipeListMain />}
        {activeComponent === Sections.Ensaladas && <SaladRecipeListMain />}
        {activeComponent === Sections.Tragos && <DrinksRecipeListMain />}
        {activeComponent === Sections.Vegan && <VeganListMain />}

        {activeComponent === Sections.Tecnicas && (
          <TechniqueList
            onPressTechnique={(item: any) =>
              item && navigation.navigate('TechniqueDetails', { ...item })
            }
          />
        )}

        {activeComponent === Sections.Favoritos && <Favorites />}
      </View>

      <StatusBar style="auto" />
    </LinearGradient>
  );
}



// ============================================================
// 🔥 ESTILOS
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 15 },
  profileButton: { width: 55, height: 55 },
  marketplaceIcon: { width: 70, height: 70 },
  logoImage: { width: 120, height: 100, alignSelf: 'center' },
  sectionSelectorContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  topLeftButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'black', justifyContent: 'center', alignItems: 'center' },
  flatListWrapper: { flex: 1, marginLeft: 10, padding: 10, borderRadius: 15, alignItems: 'center', elevation: 10, borderWidth: 1, borderColor: 'black' },
  buttonContainer: { height: 40 },
  button: { height: 40, borderRadius: 20, paddingHorizontal: 10, marginHorizontal: 5, borderWidth: 1, borderColor: 'black', justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: 'black', fontSize: 15 },
  container2: { flex: 0.95, borderWidth: 1, borderColor: 'black', borderRadius: 20, padding: 5, marginTop: 10 },
  buttonImage: { width: '100%', height: '100%', borderRadius: 50 },
  loadingIndicator: { justifyContent: 'center', alignItems: 'center' },
});
