// screens/PanaderiaRecipeListMain.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import panaderiaData from '../../assets/Json/Panaderia.json';

// Importar imágenes locales de 404
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

const shuffleArray = (array: any[]) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const PanaderiaRecipeListMain = () => {
  const navigation = useNavigation();
  const [recipes] = useState(panaderiaData.recipes);
  const [filteredRecipes, setFilteredRecipes] = useState(recipes);
  const [searchText, setSearchText] = useState('');

  const filterRecipes = (text: string) => {
    setSearchText(text);
    if (text) {
      const filtered = recipes.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(text.toLowerCase()) ||
          recipe.description.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(recipes);
    }
  };

  const shuffledRecipes = useMemo(() => shuffleArray(filteredRecipes), [filteredRecipes]);

  const renderRecipe = ({ item }: any) => {
    const imageSource = item.images?.[0]
      ? { uri: item.images[0] }
      : placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PanaderiaRecipeDetail', { recipe: item })}
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
          <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar receta de panadería..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={filterRecipes}
        />
      </View>

      <FlatList
        data={shuffledRecipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecipe}
        showsVerticalScrollIndicator={false}
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
    height: 105, // altura fija igual que MainDish
  },
  image: { width: 80, height: 80, borderRadius: 10, resizeMode: 'cover' },
  info: { flex: 1, justifyContent: 'center', marginLeft: 10 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 6, color:"black" },
  divider: { height: 1, backgroundColor: '#ccc', marginBottom: 6, width: '100%' },
  description: { fontSize: 14, fontStyle: 'italic', color: '#333', marginLeft: 2 },
});

export default PanaderiaRecipeListMain;
