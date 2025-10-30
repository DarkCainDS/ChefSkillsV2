import React, { useMemo, useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import techniquesData from '../../assets/Json/Techniques.json';

type TechniquesArray = NonNullable<typeof techniquesData.techniques>;
export type Technique = NonNullable<TechniquesArray[number]>;

interface TechniqueListProps {
  onPressTechnique: (item: Technique) => void;
}

const placeholders = [
  require('../../assets/404/placeholder1.webp'),
  require('../../assets/404/placeholder2.webp'),
  require('../../assets/404/placeholder3.webp'),
];

const shuffleArray = <T,>(array: T[] | undefined | null): T[] => {
  if (!Array.isArray(array)) return [];
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const TechniqueList: React.FC<TechniqueListProps> = ({ onPressTechnique }) => {
  const validData = Array.isArray(techniquesData?.techniques)
    ? techniquesData.techniques
    : [];

  const shuffledTechniques = useMemo(() => shuffleArray(validData), []); // 🔹 orden fijo

  const getPlaceholder = useCallback(() =>
    placeholders[Math.floor(Math.random() * placeholders.length)],
    []
  );

  const renderTechnique = useCallback(({ item }: { item: Technique }) => {
    if (!item?.name || !item?.description) return null;

    const imageUri = Array.isArray(item.imageUrls) && item.imageUrls[0];
    const imageSource = imageUri ? { uri: imageUri } : getPlaceholder();

    return (
      <TouchableOpacity style={styles.card} onPress={() => onPressTechnique(item)} activeOpacity={0.8}>
        <Image
          source={imageSource}
          style={styles.image}
          transition={300}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.title}>{item.name}</Text>
          <Text numberOfLines={2} style={styles.description}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [onPressTechnique, getPlaceholder]);

  if (!shuffledTechniques.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay técnicas disponibles en este momento.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={shuffledTechniques}
      keyExtractor={(item, index) => item?.id?.toString() ?? `tech-${index}`}
      renderItem={renderTechnique}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      initialNumToRender={8}
      maxToRenderPerBatch={6}
      windowSize={5}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 15,
    elevation: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
});

export default React.memo(TechniqueList);
