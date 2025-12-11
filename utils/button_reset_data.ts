✅ (3) HomeScreen

🔥 NO ejecuta watchdog
🔥 NO borra JSON
🔥 NO reescribe nada

Solo dispara un reset manual si quieres:

const resetData = async () => {
  await AsyncStorage.setItem("CS_FORCE_FULL_REFRESH", "1");
  navigation.replace("Loading");
};


Botón:

<TouchableOpacity onPress={resetData}>
  <Text style={{color: "white"}}>Resetear Datos</Text>
</TouchableOpacity>
