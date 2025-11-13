// screens/PanaderiaRecipeDetail.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
// ✅ CORRECCIÓN: 'Animated' se removió de aquí.
import React, { useState, useRef, useEffect } from 'react'; 
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
  // ✅ CORRECCIÓN: 'Animated' se importa correctamente de 'react-native'.
  Animated 
} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite } from '../../store/Slices/FavoriteSlice';
import { saveFavoritesToStorage } from '../../store/storage/FavoriteStorage';
import LinearGradient from 'react-native-linear-gradient';
import CategoryHeader from '../UI/CSHeader_ModernPro';
import { useNavigation } from "@react-navigation/native";


interface Ingredient { name: string; quantity: string; }
interface Step { step: string; }
interface Tip { title: string; description: string; }
interface Recipe {
  uid: string;
  name: string;
  // Se ha eliminado 'description' para igualar el original.
  images: string[];
  ingredients: Ingredient[];
  steps: Step[];
  tips?: Tip[];
}
interface Props { route: { params: { recipe: Recipe } }; }

const PanaderiaRecipeDetail: React.FC<Props> = ({ route }) => {
    const navigation = useNavigation();

  const [fontLoaded] = useFonts({ MateSC: require('../../assets/fonts/MateSC-Regular.ttf') });
  const { recipe } = route.params;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [buttonText, setButtonText] = useState<string>('x1');
  const [isListVisible, setIsListVisible] = useState<boolean>(false);
  const [tipsVisible, setTipsVisible] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  const dispatch = useDispatch();
  const favorites = useSelector((state: any) => state.favorites.recipes) as Recipe[];
  const isFavorite = favorites.some(fav => fav.uid === recipe.uid);

  // 💾 Guardar cambios locales en favoritos
  const persistFavorites = async (updated: Recipe[]) => {
    try { await saveFavoritesToStorage(updated); }
    catch (error) { console.error('Error guardando favoritos', error); Alert.alert('Error', 'No se pudo guardar el favorito localmente.'); }
  };

  // ❤️ Animación del corazón
  const animateHeart = () => {
    Animated.sequence([
      Animated.timing(heartAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.timing(heartAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  // Manejar favorito
  const handleFavoritePress = async () => {
    let updatedFavorites: Recipe[];
    if (!isFavorite) {
      dispatch(addFavorite(recipe));
      updatedFavorites = [...favorites, recipe];
      animateHeart();
    }
    else {
      dispatch(removeFavorite(recipe.uid));
      updatedFavorites = favorites.filter(fav => fav.uid !== recipe.uid);
    }
    await persistFavorites(updatedFavorites);
  };

  const modifyQuantity = (quantity: string, multiplier: number) =>
    quantity.replace(/-?\d+(\.\d+)?/g, (match) => String(parseFloat(match) * multiplier));

  const handleButtonPress = () => {
    // Multiplicadores igualados a los 5 estados del componente original
    const states = [
      { multiplier: 1, text: 'x1' },
      { multiplier: 2, text: 'x2' },
      { multiplier: 3, text: 'x3' },
      { multiplier: 4, text: 'x4' }, 
      { multiplier: 0.5, text: '1/2' },
    ];
    const idx = states.findIndex(s => s.multiplier === multiplier);
    const next = states[(idx + 1) % states.length];
    setMultiplier(next.multiplier);
    setButtonText(next.text);
    setIsListVisible(true);
  };

  const getButtonColor = (multiplier: number) => {
    // Colores igualados al componente original
    switch (multiplier) {
      case 1: return '#6c757d'; 
      case 2: return '#007BFF'; 
      case 3: return '#28a745'; 
      case 4: return '#dc3545'; 
      case 0.5: return '#ffc107'; 
      default: return '#007BFF';
    }
  };

  const tipColors = ['#FFF9C4', '#C8E6C9', '#BBDEFB', '#FFCCBC', '#E1BEE7', '#F8BBD0', '#D7CCC8'];

  const openTipsModal = () => {
    setTipsVisible(true);
    fadeAnim.setValue(0);
    Animated.spring(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
  };

  const closeTipsModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setTipsVisible(false));
  };

  // ✅ Se añade la doble comprobación de carga (fuente y receta)
  if (!fontLoaded || !recipe) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando receta...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
<CategoryHeader
  title="Panadería"
  icon="🍞"
  color="#A67C52"
  titleColor="#fdf4e2"   // <--- Ahora puedes cambiarlo
  onBack={() => navigation.goBack()}
/>


      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.recipeTitle}>{recipe.name}</Text>

        <TouchableOpacity onPress={handleFavoritePress} style={styles.favoriteIcon}>
          <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={50}
              color={isFavorite ? 'red' : 'black'}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Imagenes */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled style={styles.imageContainer}>
        {/* ✅ CORRECCIÓN: Usando Encadenamiento Opcional '?.map' */}
        {recipe.images?.map((imgUrl, idx) => ( 
          <TouchableOpacity key={idx} onPress={() => setSelectedImage(imgUrl)}>
            <Image source={imgUrl} style={styles.image} contentFit="cover" transition={300} cachePolicy="memory-disk" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal Imagen */}
      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <TouchableWithoutFeedback onPress={() => setSelectedImage(null)}>
          <View style={styles.modalBackground}>
            {selectedImage && (
              <Image source={selectedImage} style={styles.image} contentFit="contain" transition={300} />
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Ingredientes */}
      <View style={styles.headerWithButton}>
        <Text style={styles.sectionTitle}>Ingredientes</Text>
        <TouchableOpacity
          style={[styles.multiplicarButton, { backgroundColor: getButtonColor(multiplier) }]}
          onPress={handleButtonPress}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ingredientsContainer}>
        <View style={[styles.tableRow, { backgroundColor: '#f5f5f5' }]}>
          <Text style={[styles.tableCellName, styles.tableHeader]}>Ingrediente</Text>
          <Text style={[styles.tableCellQuantity, styles.tableHeader]}>Cantidad</Text>
          <Text style={[styles.tableCellCheckbox, styles.tableHeader]}>✔</Text>
        </View>
        {/* ✅ CORRECCIÓN: Usando Encadenamiento Opcional '?.map' */}
        {recipe.ingredients?.map((ing, idx) => ( 
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
        {/* ✅ CORRECCIÓN: Usando Encadenamiento Opcional '?.map' */}
        {recipe.steps?.map((step, idx) => ( 
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

      {/* Tips */}
      {/* Esto ya era robusto porque usa '&& recipe.tips.length > 0' */}
      {recipe.tips && recipe.tips.length > 0 && (
        <>
          <TouchableOpacity style={styles.tipsButton} onPress={openTipsModal}>
            <MaterialIcons name="lightbulb" size={28} color="white" />
            <Text style={styles.tipsButtonText}>Tips</Text>
          </TouchableOpacity>

          <Modal visible={tipsVisible} transparent animationType="fade" onRequestClose={closeTipsModal}>
            <TouchableWithoutFeedback onPress={closeTipsModal}>
              <View style={styles.tipsModalOverlay}>
                <TouchableWithoutFeedback>
                  <Animated.View
                    style={[styles.tipsModal, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}
                  >
                    <Text style={styles.tipsTitle}>💡 Consejos útiles</Text>
                    <ScrollView showsVerticalScrollIndicator nestedScrollEnabled keyboardShouldPersistTaps="handled">
                      {/* El map aquí es seguro por la comprobación anterior */}
                      {recipe.tips.map((tip, idx) => (
                        <LinearGradient
                          key={idx}
                          colors={[tipColors[idx % tipColors.length] + 'FF', tipColors[idx % tipColors.length] + 'CC']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.tipCard}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <MaterialIcons name="lightbulb-outline" size={20} color="#333" style={{ marginRight: 6 }} />
                            <Text style={styles.tipTitle}>{tip.title}</Text>
                          </View>
                          <Text style={styles.tipDescription}>{tip.description}</Text>
                        </LinearGradient>
                      ))}
                    </ScrollView>
                    <TouchableOpacity style={styles.closeTipsButton} onPress={closeTipsModal}>
                      <Text style={styles.closeTipsText}>Cerrar</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </>
      )}
    </ScrollView>
  );
};

// Estilos idénticos al componente MainDish
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  recipeTitle: { fontFamily: 'MateSC', fontSize: 35, marginBottom: 10, padding: 5, elevation: 5, borderWidth: 2, textDecorationLine: 'underline', borderRadius: 10, textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, textAlign: 'center', flex: 1 },
  favoriteIcon: { marginLeft: 10 },
  imageContainer: { flexDirection: 'row', marginBottom: 20 },
  image: { width: 150, height: 150, marginHorizontal: 10, borderRadius: 10 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  headerWithButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  multiplicarButton: { padding: 5, borderRadius: 15, width: 55, height: 50, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, marginTop: 20, textAlign: 'center', fontStyle: 'italic', borderBottomWidth: 5, borderBottomColor: '#000', borderTopColor: '#FF9800', borderTopWidth: 2, paddingBottom: 5, marginHorizontal: 20, elevation: 5, flex: 1 },
  ingredientsContainer: { marginHorizontal: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc' },
  tableCellName: { flex: 1, textAlign: 'left', padding: 8, borderRightWidth: 1, borderRightColor: '#ccc' },
  tableCellQuantity: { flex: 1, textAlign: 'center', padding: 8, borderRightWidth: 1, borderRightColor: '#ccc' },
  tableCellCheckbox: { flex: 0.5, alignItems: 'center', justifyContent: 'center', padding: 8 },
  tableHeader: { fontWeight: 'bold', fontSize: 15 },
  stepsContainer: { marginBottom: 40, paddingHorizontal: 15 },
  stepItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#f9f9f9', borderRadius: 12, padding: 10, elevation: 2 },
  stepTextContainer: { flex: 0.85 },
  stepNumber: { fontWeight: 'bold', marginBottom: 5, fontSize: 15, color: '#333' },
  stepDescription: { fontSize: 14, color: '#555' },
  checkboxContainer: { flex: 0.15, alignItems: 'flex-end' },
  tipsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ff4d4d', paddingVertical: 12, borderRadius: 25, marginBottom: 50, width: '50%', alignSelf: 'center' },
  tipsButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18, marginLeft: 8 },
  tipsModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  tipsModal: { backgroundColor: '#fff', borderRadius: 15, padding: 20, width: '85%', maxHeight: '70%' },
  tipsTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  tipCard: { padding: 15, borderRadius: 18, marginBottom: 12, elevation: 6, shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  tipTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  tipDescription: { fontSize: 15, color: '#555', lineHeight: 20 },
  closeTipsButton: { backgroundColor: '#333', padding: 10, borderRadius: 12, marginTop: 10, alignSelf: 'center', width: '40%' },
  closeTipsText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});

export default PanaderiaRecipeDetail;