// screens/MainDishRecipeListMain.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useMemo, useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import recipesData from '../../assets/Json/Main_Dish.json';

// Imágenes locales de respaldo
const placeholderImages = [
  require('../../assets/404/placeholder1.webp'),
  require('../../assets/404/placeholder2.webp'),
  require('../../assets/404/placeholder3.webp'),
  require('../../assets/404/placeholder4.webp'),
  require('../../assets/404/placeholder5.webp'),
  require('../../assets/404/placeholder6.webp'),
  require('../../assets/404/placeholder7.webp'),
  require('../../assets/404/placeholder8.webp'),
  require('../../assets/404/placeholder9.webp'),
  require('../../assets/404/placeholder10.webp'),
  require('../../assets/404/placeholder11.webp'),
  require('../../assets/404/placeholder12.webp'),
  require('../../assets/404/placeholder13.webp'),
  require('../../assets/404/placeholder14.webp'),
  require('../../assets/404/placeholder15.webp'),
  require('../../assets/404/placeholder16.webp'),
];

// Función para barajar elementos
const shuffleArray = (array: any[]) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const MainDishRecipeListMain = () => {
  const navigation = useNavigation();
  const [recipes] = useState(recipesData.recipes);
  const [searchText, setSearchText] = useState('');

  // Generador de placeholder aleatorio (memorizado)
  const getPlaceholder = useCallback(() => {
    const index = Math.floor(Math.random() * placeholderImages.length);
    return placeholderImages[index];
  }, []);

  // Filtro de recetas según texto de búsqueda (memorizado)
  const filteredRecipes = useMemo(() => {
    if (!searchText.trim()) return recipes;
    const lowerText = searchText.toLowerCase();
    return recipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(lowerText) ||
        recipe.description.toLowerCase().includes(lowerText)
    );
  }, [recipes, searchText]);

  // Mezclar las recetas solo cuando cambia el filtro
  const shuffledRecipes = useMemo(
    () => shuffleArray(filteredRecipes),
    [filteredRecipes]
  );

  // Render optimizado del ítem
  const renderRecipe = useCallback(
    ({ item }: { item: any }) => {
      const imageSource = item.images?.[0]
        ? { uri: item.images[0] }
        : getPlaceholder();

      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('MainDishRecipeDetail', { recipe: item })
          }
        >
          <Image
            source={imageSource}
            style={styles.image}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
          <View style={styles.info}>
            <Text style={styles.title}>{item.name}</Text>
            <View style={styles.divider} />
            <Text
              style={styles.description}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.description}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, getPlaceholder]
  );

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar plato..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Lista de recetas */}
      <FlatList
        data={shuffledRecipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecipe}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 40, fontSize: 16, color: '#333' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ebeaeaff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 3,
    marginBottom: 15,
    elevation: 5,
    height: 105,
  },
  image: { width: 80, height: 80, borderRadius: 10, resizeMode: 'cover' },
  info: { flex: 1, justifyContent: 'center', marginLeft: 10 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginBottom: 6,
    width: '100%',
  },
  description: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#333',
    marginLeft: 2,
  },
});

export default React.memo(MainDishRecipeListMain);
