import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useFonts } from 'expo-font';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import CategoryHeader from '../UI/CSHeader_ModernPro';

// --- Tipado ---
interface TechniqueParams {
  name?: string;
  description?: string;
  imageUrls?: string[];
  detailedInfo?: string;
}

type TechniqueDetailsRouteProp = RouteProp<Record<string, TechniqueParams>, string>;

// --- Componente principal ---
const TechniqueDetails: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<TechniqueDetailsRouteProp>();
  const { name, description, imageUrls, detailedInfo } = route.params ?? {};

  const [fontLoaded] = useFonts({
    MateSC: require('../../assets/fonts/MateSC-Regular.ttf'),
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImageIndex(null);
  };

  if (!fontLoaded) return null;

  const safeImages = Array.isArray(imageUrls) ? imageUrls : [];

  return (
    <LinearGradient
      colors={['#A5D8FF', '#73C2FB', '#3FA9F5']}  // 🔵 Azul más fuerte y legible
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>

        {/* HEADER */}
        <CategoryHeader
          title="Técnicas"
          icon="🔪"
          color="#2A7CC7"
          titleColor="#ffffff"
          onBack={() => navigation.goBack()}
        />

        {/* TÍTULO */}
        <Text style={styles.name}>{name ?? 'Técnica sin nombre'}</Text>

        {/* GALERÍA */}
        {safeImages.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
            {safeImages.map((url, index) => (
              <TouchableOpacity key={index} onPress={() => openModal(index)} activeOpacity={0.8}>
                <Image
                  source={{ uri: url }}
                  style={styles.image}
                  transition={200}
                  contentFit="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noImages}>No hay imágenes disponibles.</Text>
        )}

        {/* DESCRIPCIÓN */}
        {description ? (
          <>
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionTitle}>Descripción</Text>
            </View>
            <Text style={styles.description}>{description}</Text>
          </>
        ) : null}

        {/* INFO DETALLADA */}
        {detailedInfo ? (
          <>
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionTitle}>Información detallada</Text>
            </View>

            <View style={styles.detailBox}>
              <Text style={styles.detailedInfo}>{detailedInfo}</Text>
            </View>
          </>
        ) : null}

        {/* MODAL */}
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalBackground}>
              {selectedImageIndex !== null && safeImages[selectedImageIndex] ? (
                <TouchableWithoutFeedback>
                  <Image
                    source={{ uri: safeImages[selectedImageIndex] }}
                    style={styles.fullImage}
                    contentFit="contain"
                  />
                </TouchableWithoutFeedback>
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </Modal>

      </ScrollView>
    </LinearGradient>
  );
};

// --- ESTILOS FUERTES ---
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'stretch',
  },

  name: {
    fontFamily: 'MateSC',
    fontSize: 36,
    marginBottom: 20,
    textDecorationLine: 'underline',
    textAlign: 'center',
    color: '#0D1B2A',
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#2A7CC7',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },

  gallery: {
    flexDirection: 'row',
    marginBottom: 25,
    paddingLeft: 5,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginRight: 10,
  },

  sectionDivider: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 24,
    fontFamily: 'MateSC',
    textDecorationLine: 'underline',
    color: '#0D1B2A',
    borderBottomWidth: 3,
    borderBottomColor: '#2A7CC7',
  },

  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: '#1A1A1A',
  },

  // ⭐ Caja premium fuerte
  detailBox: {
    borderWidth: 2,
    borderColor: '#2A7CC7',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  detailedInfo: {
    fontSize: 17,
    textAlign: 'left',
    lineHeight: 25,
    color: '#1A1A1A',
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '70%',
    borderRadius: 15,
  },
});

export default TechniqueDetails;
