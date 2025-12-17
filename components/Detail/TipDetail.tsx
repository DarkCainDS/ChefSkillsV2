import { getVersionedImageSync } from "../../utils/versionedImage";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

export default function TipDetail({ route }) {
  const { tip } = route.params;
  const { title, shortDescription, detailedInfo, images } = tip;

  const [fontLoaded] = useFonts({
    MateSC: require("../assets/fonts/MateSC-Regular.ttf"),
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {images && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled style={styles.gallery}>
          {images.map((url, index) => (
            <TouchableOpacity key={index} onPress={() => openModal(index)}>
              <Image source={getVersionedImageSync(url)} }} style={styles.image} transition={300} contentFit="contain" cachePolicy="memory-disk" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <Text style={styles.shortDescription}>{shortDescription}</Text>
      <Text style={styles.detailed}>{detailedInfo}</Text>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              {selectedImageIndex !== null && (
                <Image
                  source={getVersionedImageSync(images)}[selectedImageIndex] }}
                  style={styles.fullImage}
                  transition={300}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              )}
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#fff", alignItems: "center" },
  title: { fontFamily: "MateSC", fontSize: 32, marginBottom: 10, textAlign: "center", textDecorationLine: "underline" },
  gallery: { flexDirection: "row", marginVertical: 10 },
  image: { width: 150, height: 150, borderRadius: 10, marginHorizontal: 10 },
  shortDescription: { fontSize: 16, marginTop: 10, textAlign: "center" },
  detailed: { fontSize: 14, marginTop: 15, textAlign: "center" },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  fullImage: { width: "90%", height: "70%", borderRadius: 15 },
});
