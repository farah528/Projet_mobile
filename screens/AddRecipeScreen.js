import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Image } from "react-native";
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
      <Button title="Pick an Image" onPress={pickImage} />
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: "100%", height: 200, marginVertical: 10, borderRadius: 8 }}
        />
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

      <Button title="Add Recipe" onPress={handleAddRecipe} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: "top",
  },
});
