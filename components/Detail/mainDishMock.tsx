import { getVersionedImageSync } from "../../utils/versionedImage";
// screens/MainDishRecipeDetail.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite } from '../../store/Slices/FavoriteSlice';

const MainDishRecipeDetail = ({ route }) => {
  const [fontLoaded] = useFonts({
    MateSC: require("../../assets/fonts/MateSC-Regular.ttf"),
  });

  const { recipe } = route.params;
  const [selectedImage, setSelectedImage] = useState(null);
  const [multiplier, setMultiplier] = useState(1);
  const [buttonText, setButtonText] = useState('x1');
  const [isListVisible, setIsListVisible] = useState(false);
  const [tipsVisible, setTipsVisible] = useState(false);

  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.recipes);
  const isFavorite = favorites.some((fav) => fav.uid === recipe.uid);

  const handleFavoritePress = () => {
    if (!isFavorite) dispatch(addFavorite(recipe));
    else dispatch(removeFavorite(recipe.uid));
  };

  const modifyQuantity = (quantity, multiplier) =>
    quantity.replace(/-?\d+(\.\d+)?/g, (match) =>
      String(parseFloat(match) * multiplier)
    );

  const handleButtonPress = () => {
    const states = [
      { multiplier: 1, text: 'x1' },
      { multiplier: 2, text: 'x2' },
      { multiplier: 3, text: 'x3' },
      { multiplier: 4, text: 'x4' },
      { multiplier: 0.5, text: '1/2' },
    ];
    const currentIndex = states.findIndex((s) => s.multiplier === multiplier);
    const next = states[(currentIndex + 1) % states.length];
    setMultiplier(next.multiplier);
    setButtonText(next.text);
    setIsListVisible(true);
  };

  const getButtonColor = (multiplier) => {
    switch (multiplier) {
      case 1: return '#6c757d';
      case 2: return '#007BFF';
      case 3: return '#28a745';
      case 4: return '#dc3545';
      case 0.5: return '#ffc107';
      default: return '#007BFF';
    }
  };

  if (!fontLoaded || !recipe) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando receta...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.recipeTitle}>{recipe.name}</Text>
        <TouchableOpacity onPress={handleFavoritePress} style={styles.favoriteIcon}>
          <MaterialIcons
            name={isFavorite ? "favorite" : "favorite-border"}
            size={50}
            color={isFavorite ? "red" : "black"}
          />
        </TouchableOpacity>
      </View>

      {/* Images */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled style={styles.imageContainer}>
        {recipe.images.map((img, idx) => (
          <TouchableOpacity key={idx} onPress={() => setSelectedImage(img)}>
            <Image
              source={img}
              style={styles.image}
              contentFit="cover"
              transition={300}
              cachePolicy="memory-disk"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <TouchableWithoutFeedback onPress={() => setSelectedImage(null)}>
          <View style={styles.modalBackground}>
            {selectedImage && (
              <Image
                source={selectedImage}
                style={styles.image}
                contentFit="contain"
                transition={300}
                cachePolicy="memory-disk"
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Ingredientes */}
      <View style={styles.headerWithButton}>
        <Text style={styles.sectionTitle}>Ingredientes</Text>
        <TouchableOpacity
          style={[styles.multiplicarButton, { backgroundColor: getButtonColor(multiplier) }]}
          onPress={handleButtonPress}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ingredientsContainer}>
        <View style={[styles.tableRow, { backgroundColor: '#f5f5f5' }]}>
          <Text style={[styles.tableCellName, styles.tableHeader]}>Ingrediente</Text>
          <Text style={[styles.tableCellQuantity, styles.tableHeader]}>Cantidad</Text>
          <Text style={[styles.tableCellCheckbox, styles.tableHeader]}>✔</Text>
        </View>

        {recipe.ingredients.map((ing, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={styles.tableCellName}>{ing.name}</Text>
            <Text style={styles.tableCellQuantity}>
              {isListVisible ? modifyQuantity(ing.quantity, multiplier) : ing.quantity}
            </Text>
            <View style={styles.tableCellCheckbox}>
              <BouncyCheckbox size={18} fillColor="green" unFillColor="#fff" disableBuiltInState />
            </View>
          </View>
        ))}
      </View>

      {/* Pasos */}
      <Text style={styles.sectionTitle}>Pasos</Text>
      <View style={styles.stepsContainer}>
        {recipe.steps.map((step, idx) => (
          <View key={idx} style={styles.stepItem}>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepNumber}>Paso {idx + 1}</Text>
              <Text style={styles.stepDescription}>{step.step}</Text>
            </View>
            <View style={styles.checkboxContainer}>
              <BouncyCheckbox size={25} fillColor="green" unFillColor="#fff" disableBuiltInState />
            </View>
          </View>
        ))}
      </View>

      {/* 👇 Botón de Tips */}
      {recipe.tips && recipe.tips.length > 0 && (
        <>
          <TouchableOpacity style={styles.tipsButton} onPress={() => setTipsVisible(true)}>
            <MaterialIcons name="lightbulb" size={28} color="white" />
            <Text style={styles.tipsButtonText}>Tips</Text>
          </TouchableOpacity>

          {/* Modal Tips */}
          <Modal visible={tipsVisible} transparent animationType="fade" onRequestClose={() => setTipsVisible(false)}>
            <TouchableWithoutFeedback onPress={() => setTipsVisible(false)}>
              <View style={styles.tipsModalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.tipsModal}>
                    <Text style={styles.tipsTitle}>💡 Consejos útiles</Text>

                    {recipe.tips.map((tip, idx) => {
                      const colors = ['#FFF9C4', '#C8E6C9', '#BBDEFB', '#FFCCBC', '#E1BEE7']; // Amarillo, verde, azul, naranja, lila
                      const bgColor = colors[idx % colors.length];
                      return (
                        <View key={idx} style={[styles.tipCard, { backgroundColor: bgColor }]}>
                          <Text style={styles.tipTitle}>{tip.title}</Text>
                          <Text style={styles.tipDescription}>{tip.description}</Text>
                        </View>
                      );
                    })}

                    <TouchableOpacity style={styles.closeTipsButton} onPress={() => setTipsVisible(false)}>
                      <Text style={styles.closeTipsText}>Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  recipeTitle: { fontFamily: 'MateSC', fontSize: 35, textAlign: 'center' },
  imageContainer: { flexDirection: 'row', marginBottom: 20 },
  image: { width: 150, height: 150, marginHorizontal: 10, borderRadius: 10 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  headerWithButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  multiplicarButton: { padding: 5, borderRadius: 15, width: 55, height: 50, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, marginTop: 20, textAlign: 'center' },
  ingredientsContainer: { marginHorizontal: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc' },
  tableCellName: { flex: 1, textAlign: 'left', padding: 8, borderRightWidth: 1, borderRightColor: '#ccc' },
  tableCellQuantity: { flex: 1, textAlign: 'center', padding: 8, borderRightWidth: 1, borderRightColor: '#ccc' },
  tableCellCheckbox: { flex: 0.5, alignItems: 'center', justifyContent: 'center', padding: 8 },
  tableHeader: { fontWeight: 'bold', fontSize: 15 },
  stepsContainer: { marginBottom: 40, paddingHorizontal: 15 },
  stepItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#f9f9f9', borderRadius: 12, padding: 10 },
  stepTextContainer: { flex: 0.85 },
  stepNumber: { fontWeight: 'bold', marginBottom: 5, fontSize: 15, color: '#333' },
  stepDescription: { fontSize: 14, color: '#555' },
  checkboxContainer: { flex: 0.15, alignItems: 'flex-end' },

  // 🔥 Tips styles
  tipsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4d4d',
    paddingVertical: 12,
    borderRadius: 25,
    marginVertical: 25,
    width: '50%',
    alignSelf: 'center',
  },
  tipsButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18, marginLeft: 8 },
  tipsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsModal: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  tipsTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  tipCard: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  tipTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  tipDescription: { fontSize: 14, color: '#555' },
  closeTipsButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    alignSelf: 'center',
    width: '40%',
  },
  closeTipsText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});

export default MainDishRecipeDetail;
