import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from "react-native";
import { db, auth } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';

export default function AddRecipeScreen({ navigation }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState(""); // local picked image
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");

  // Step 1: Pick image from phone
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddRecipe = async () => {
    if (!name || !category || !description || !imageUri || !ingredients || !steps) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      // For now, we just store the local URI (Step 2 will upload to Firebase Storage)
      await addDoc(collection(db, "recipes"), {
        name,
        category,
        description,
        image: imageUri,
        ingredients: ingredients.split("\n"),
        steps: steps.split("\n"),
        userId: auth.currentUser.uid,
        timestamp: new Date(),
      });

      Alert.alert("Success", "Recipe added successfully!");
      navigation.goBack();
    } catch (error) {
      console.log("Error adding recipe:", error);
      Alert.alert("Error", "Failed to add recipe");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add a New Recipe</Text>

      <TextInput
        style={styles.input}
        placeholder="Recipe Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Step 1: Pick Image */}
      <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
        <Text style={styles.pickButtonText}>Pick an Image</Text>
      </TouchableOpacity>
      {imageUri ? (
        <View style={styles.imagePreview}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
          />
        </View>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Ingredients (one per line)"
        value={ingredients}
        onChangeText={setIngredients}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Steps (one per line)"
        value={steps}
        onChangeText={setSteps}
        multiline
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleAddRecipe}>
        <Text style={styles.primaryButtonText}>Add Recipe</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF8F0" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 18, color: "#8B3E2F" },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  pickButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D35400",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  pickButtonText: { color: "#D35400", fontWeight: "600" },
  imagePreview: { width: "100%", alignItems: "center", marginVertical: 10 },
  image: { width: "100%", height: 220, borderRadius: 12 },
  primaryButton: {
    backgroundColor: "#D35400",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
