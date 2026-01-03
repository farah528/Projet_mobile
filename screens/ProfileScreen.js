import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, FlatList, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function ProfileScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [myRecipes, setMyRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  // Fetch user info from Firebase Auth
  useEffect(() => {
    if (!auth.currentUser) return;
    setEmail(auth.currentUser.email);
  }, []);

  // Fetch recipes added by this user
  useEffect(() => {
    const fetchMyRecipes = async () => {
      if (!auth.currentUser) return;

      try {
        const recipesRef = collection(db, "recipes");
        const q = query(recipesRef, where("userId", "==", auth.currentUser.uid));
        const snapshot = await getDocs(q);
        const recipesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyRecipes(recipesList);
      } catch (error) {
        console.log("Error fetching user's recipes:", error);
      }
    };

    fetchMyRecipes();
  }, []);

  // Fetch favorite recipes from AsyncStorage
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const json = await AsyncStorage.getItem("@favorites");
        const favorites = json ? JSON.parse(json) : [];

        if (favorites.length === 0) {
          setFavoriteRecipes([]);
          return;
        }

        const recipesRef = collection(db, "recipes");
        const snapshot = await getDocs(recipesRef);
        const allRecipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const favRecipes = allRecipes.filter(r => favorites.includes(r.id));
        setFavoriteRecipes(favRecipes);
      } catch (error) {
        console.log("Error fetching favorite recipes:", error);
      }
    };

    fetchFavorites();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    Alert.alert("Logged out", "You have been logged out");
    navigation.navigate("Home");
  };

  const renderRecipe = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeItem}
      onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
    >
      <Text style={styles.recipeName}>{item.name}</Text>
      <Text>{item.category}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoTop}>MyRecipe</Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.usernameText}>{username}</Text>
        <Text style={styles.emailText}>{email}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("AddRecipe")}
          >
            <Text style={styles.actionButtonText}>Create Recipe</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.subtitle}>My Recipes</Text>
      {myRecipes.length === 0 ? (
        <Text style={styles.noRecipes}>You haven't added any recipes yet.</Text>
      ) : (
        <FlatList
          data={myRecipes}
          keyExtractor={(item) => item.id}
          renderItem={renderRecipe}
        />
      )}

      <Text style={styles.subtitle}>Favorites</Text>
      {favoriteRecipes.length === 0 ? (
        <Text style={styles.noRecipes}>You haven't added any favorites yet.</Text>
      ) : (
        <FlatList
          data={favoriteRecipes}
          keyExtractor={(item) => item.id}
          renderItem={renderRecipe}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF7F0" },
  header: { alignItems: "center", marginBottom: 12 },
  logoTop: { color: "#D35400", fontSize: 26, fontWeight: "800" },

  profileCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  usernameText: { fontSize: 20, fontWeight: "800", color: "#6b3f2b", marginBottom: 4 },
  emailText: { fontSize: 14, color: "#7a5a45", marginBottom: 12 },
  actionRow: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: {
    flex: 1,
    backgroundColor: "#D35400",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 8,
  },
  actionButtonText: { color: "#fff", fontWeight: "700" },
  logoutButton: { backgroundColor: "#F2F2F2", marginRight: 0, marginLeft: 8 },
  logoutButtonText: { color: "#D35400" },

  subtitle: { fontSize: 18, fontWeight: "700", color: "#6b3f2b", marginBottom: 8, marginTop: 12 },
  noRecipes: { color: "#7a5a45", marginBottom: 12 },

  recipeItem: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  recipeName: { fontWeight: "700", fontSize: 16, color: "#6b3f2b" },
});
