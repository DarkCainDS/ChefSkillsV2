import { useFonts } from "expo-font";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

type TempUnit = "C" | "F";

export default function FoodNoteDetail({ route }: any) {
  const { note } = route.params;
  const { title, shortDescription, detailedInfo, images, temperatureGuide, processExplanation } = note;

  const [fontLoaded] = useFonts({
    MateSC: require("../assets/fonts/MateSC-Regular.ttf"),
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [unit, setUnit] = useState<TempUnit>("C"); // Celsius por defecto

  const toggleUnit = () => setUnit(unit === "C" ? "F" : "C");

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
      )}

      <Text style={styles.shortDescription}>{shortDescription}</Text>
      <Text style={styles.detailed}>{detailedInfo}</Text>

      <TouchableOpacity style={styles.unitButton} onPress={toggleUnit}>
        <Text style={styles.unitButtonText}>Mostrar en °{unit === "C" ? "F" : "C"}</Text>
      </TouchableOpacity>

      {temperatureGuide && (
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell]}>Término</Text>
            <Text style={[styles.cell, styles.headerCell]}>Tiempo (min)</Text>
            <Text style={[styles.cell, styles.headerCell]}>Temp al Salir (°{unit})</Text>
            <Text style={[styles.cell, styles.headerCell]}>Temp Final (°{unit})</Text>
          </View>
          {temperatureGuide.map((t: any, i: number) => (
            <View key={i} style={styles.row}>
              <Text style={styles.cell}>{t.term}</Text>
              <Text style={styles.cell}>{t.timeMin}</Text>
              <Text style={styles.cell}>{unit === "C" ? t.tempExitC : t.tempExitF}</Text>
              <Text style={styles.cell}>{unit === "C" ? t.tempFinalC : t.tempFinalF}</Text>
            </View>
          ))}
        </View>
      )}

      {processExplanation && (
        <Text style={styles.process}>{processExplanation}</Text>
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              {selectedImageIndex !== null && (
                <Image
                  source={{ uri: images[selectedImageIndex] }}
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
  unitButton: { marginTop: 15, backgroundColor: "#4CAF50", paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  unitButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  table: { marginTop: 15, width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, overflow: "hidden" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ccc" },
  headerRow: { backgroundColor: "#eee" },
  cell: { flex: 1, padding: 8, textAlign: "center", fontSize: 12 },
  headerCell: { fontWeight: "bold" },
  process: { marginTop: 15, fontSize: 14, fontStyle: "italic", textAlign: "center" },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  fullImage: { width: "90%", height: "70%", borderRadius: 15 },
});
