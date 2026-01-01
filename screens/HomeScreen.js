import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image, TextInput } from "react-native";
import { auth, db } from "../firebase/firebase"; // only auth & db from your firebase.js
import { collection, getDocs } from "firebase/firestore"; // import firestore functions here


export default function HomeScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch recipes from Firestore
  const fetchRecipes = async () => {
    try {
      const recipesCol = collection(db, "recipes");
      const recipesSnapshot = await getDocs(recipesCol);
      const recipesList = recipesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecipes(recipesList);
    } catch (error) {
      console.log("Error fetching recipes:", error);
    }
  };

  // Refresh recipes when the screen is focused
  useEffect(() => {
    fetchRecipes(); // initial fetch

    const unsubscribe = navigation.addListener("focus", () => {
      fetchRecipes();
    });

    return unsubscribe;
  }, [navigation]);

  // Navigate to Profile if logged in, else ask to login
  const goToProfile = () => {
    if (auth.currentUser) {
      navigation.navigate("Profile");
    } else {
      Alert.alert("Login Required", "You must log in to view your profile", [
        { text: "Cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ]);
    }
  };

  // Render each recipe item
  const renderRecipe = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeItem}
      onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
    >
      {/* Recipe Image */}
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/150" }}
        style={styles.recipeImage}
        resizeMode="cover"
      />

      <Text style={styles.recipeName}>{item.name}</Text>
      <Text style={styles.recipeCategory}>{item.category}</Text>
      <Text numberOfLines={2}>{item.description}</Text>
    </TouchableOpacity>
  );

  const q = searchQuery.trim().toLowerCase();
  const filteredRecipes = q
    ? recipes.filter((item) => {
        const name = (item.name || "").toLowerCase();
        const category = (item.category || "").toLowerCase();
        return name.includes(q) || category.includes(q);
      })
    : recipes;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoTop}>MyRecipe</Text>
        <TouchableOpacity style={styles.profileButton} onPress={goToProfile} activeOpacity={0.9}>
          <Text style={styles.profileButtonText}>My Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name or category"
          placeholderTextColor="#8b6b5a"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title}>Recipes</Text>
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipe}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF7F0" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  logoTop: { color: "#D35400", fontSize: 24, fontWeight: "800" },
  profileButton: {
    backgroundColor: "#D35400",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: "#D35400",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  profileButtonText: { color: "#fff", fontWeight: "700" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12, color: "#6b3f2b" },
  recipeItem: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  recipeImage: { width: "100%", height: 180, borderRadius: 10, marginBottom: 10 },
  recipeName: { fontSize: 18, fontWeight: "700", color: "#6b3f2b", marginBottom: 6 },
  recipeCategory: {
    alignSelf: "flex-start",
    backgroundColor: "#FDE8D6",
    color: "#7a5a45",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginBottom: 8,
  },
  description: { color: "#7a5a45" },
  searchContainer: { position: "relative", marginBottom: 12 },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#F0DCCF",
    color: "#6b3f2b",
  },
  clearButton: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF2E6",
  },
  clearButtonText: { color: "#7a5a45", fontSize: 18, fontWeight: "700" },
  noResultsText: { textAlign: "center", color: "#7a5a45", marginTop: 20 },
});
