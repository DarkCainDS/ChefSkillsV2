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
import { Image } from 'expo-image';
import { useFonts } from 'expo-font';
import { RouteProp, useRoute } from '@react-navigation/native';

// --- Tipado de los parámetros que recibe el componente ---
interface TechniqueParams {
  name?: string;
  description?: string;
  imageUrls?: string[];
  detailedInfo?: string;
}

type TechniqueDetailsRouteProp = RouteProp<Record<string, TechniqueParams>, string>;

// --- Componente principal ---
const TechniqueDetails: React.FC = () => {
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

  // 🔒 Si no hay fuente cargada o los datos son inválidos, no renderizamos
  if (!fontLoaded) return null;

  const safeImages = Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls : [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🔤 Título seguro */}
      <Text style={styles.name}>{name ?? 'Técnica sin nombre'}</Text>

      {/* 🖼️ Galería de imágenes (solo si hay imágenes válidas) */}
      {safeImages.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.gallery}
          
        >
          {safeImages.map((url, index) => (
            <TouchableOpacity
              key={`image-${index}`}
              onPress={() => openModal(index)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: url }}
                style={styles.image}
                transition={300}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noImages}>No hay imágenes disponibles.</Text>
      )}

      {/* 🧾 Descripción segura */}
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : (
        <Text style={styles.placeholderText}>Sin descripción disponible.</Text>
      )}

      {/* 📚 Detalles seguros */}
      {detailedInfo ? (
        <Text style={styles.detailedInfo}>{detailedInfo}</Text>
      ) : (
        <Text style={styles.placeholderText}>No hay información detallada.</Text>
      )}

      {/* 🔍 Modal de imagen ampliada */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalBackground}>
            {selectedImageIndex !== null && safeImages[selectedImageIndex] ? (
              <TouchableWithoutFeedback>
                <Image
                  source={{ uri: safeImages[selectedImageIndex] }}
                  style={styles.fullImage}
                  transition={300}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              </TouchableWithoutFeedback>
            ) : null}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
};

// --- Estilos idénticos con algunos refinamientos ---
const styles = StyleSheet.create({
  container: {
    flexGrow: 0.2,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  name: {
    fontFamily: 'MateSC',
    fontSize: 35,
    marginBottom: 10,
    padding: 5,
    elevation: 5,
    borderWidth: 2,
    textDecorationLine: 'underline',
    borderRadius: 10,
    textAlign: 'center',
  },
  gallery: {
    flexDirection: 'row',
    marginVertical: 10,

  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  noImages: {
    fontSize: 16,
    color: '#777',
    marginVertical: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  detailedInfo: {
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    marginTop: 10,
    color: '#999',
    textAlign: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
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
