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

// 1. IMPORTACIÓN DE UTILIDAD DE IMÁGENES (Arquitectura centralizada)
import { getSafeVersionedImage } from "../../utils/imageSource";

// --- 2. TIPADO SÓLIDO ---
interface Technique {
  id: number;
  name: string;
  description: string;
  detailedInfo: string;
  imageUrls: string[];
}

type RootStackParamList = {
  TechniqueDetails: { technique: Technique };
};

type TechniqueDetailsRouteProp = RouteProp<RootStackParamList, 'TechniqueDetails'>;

const TechniqueDetails: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<TechniqueDetailsRouteProp>();
  
  // Extraemos la técnica completa según el nuevo patrón
  const { technique } = route.params;

  const [fontLoaded] = useFonts({
    MateSC: require('../../assets/fonts/MateSC-Regular.ttf'),
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  // 3. PROCESAMIENTO DE IMÁGENES CON LA LÓGICA DE LA APP
  const imageSources = getSafeVersionedImage(undefined, technique.imageUrls);

  const openModal = (uri: string) => {
    setSelectedImageUri(uri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImageUri(null);
  };

  if (!fontLoaded) return null;

  return (
    <LinearGradient
      colors={['#A5D8FF', '#73C2FB', '#3FA9F5']}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>

        <CategoryHeader
          title="Técnicas"
          icon="🔪"
          color="#2A7CC7"
          titleColor="#ffffff"
          onBack={() => navigation.goBack()}
        />

        <Text style={styles.name}>{technique.name}</Text>

        {/* GALERÍA USANDO SOURCES VERSIONADOS */}
        {imageSources.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
            {imageSources.map((src, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => typeof src === 'object' && 'uri' in src && openModal(src.uri)} 
                activeOpacity={0.8}
              >
                <Image
                  source={src} // Usa el objeto devuelto por la utilidad (cache, version, etc)
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
        {technique.description && (
          <>
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionTitle}>Descripción</Text>
            </View>
            <Text style={styles.description}>{technique.description}</Text>
          </>
        )}

        {/* INFO DETALLADA */}
        {technique.detailedInfo && (
          <>
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionTitle}>Información detallada</Text>
            </View>

            <View style={styles.detailBox}>
              <Text style={styles.detailedInfo}>{technique.detailedInfo}</Text>
            </View>
          </>
        )}

        {/* MODAL UNIFICADO */}
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalBackground}>
              {selectedImageUri && (
                <TouchableWithoutFeedback>
                  <Image
                    source={getSafeVersionedImage(selectedImageUri)[0]}
                    style={styles.fullImage}
                    contentFit="contain"
                  />
                </TouchableWithoutFeedback>
              )}
            </View>
          </TouchableWithoutFeedback>
        </Modal>

      </ScrollView>
    </LinearGradient>
  );
};

// Mantengo tus estilos originales que pediste ("Estilos Fuertes")
const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40, alignItems: 'stretch' },
  name: {
    fontFamily: 'MateSC',
    fontSize: 34,
    marginBottom: 20,
    textDecorationLine: 'underline',
    textAlign: 'center',
    color: '#0D1B2A',
    paddingVertical: 10,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#2A7CC7',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  gallery: { flexDirection: 'row', marginBottom: 25, paddingLeft: 5 },
  image: { width: 150, height: 150, borderRadius: 12, marginRight: 10 },
  noImages: { textAlign: 'center', color: '#fff', marginBottom: 20 },
  sectionDivider: { width: '100%', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'MateSC',
    textDecorationLine: 'underline',
    color: '#0D1B2A',
    borderBottomWidth: 3,
    borderBottomColor: '#2A7CC7',
  },
  description: { fontSize: 18, textAlign: 'center', lineHeight: 24, marginBottom: 20, paddingHorizontal: 10, color: '#1A1A1A' },
  detailBox: {
    borderWidth: 2,
    borderColor: '#2A7CC7',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  detailedInfo: { fontSize: 17, textAlign: 'left', lineHeight: 25, color: '#1A1A1A' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '95%', height: '80%', borderRadius: 15 },
});

export default TechniqueDetails;