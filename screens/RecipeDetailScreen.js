import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  query,
  orderBy,
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipe } = route.params;
  const [comments, setComments] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

  // Load favorites from AsyncStorage
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const json = await AsyncStorage.getItem("@favorites");
        const savedFavorites = json ? JSON.parse(json) : [];
        setIsFavorite(savedFavorites.includes(recipe.id));
      } catch (e) {
        console.log("Failed to load favorites:", e);
      }
    };
    loadFavorites();
  }, [recipe.id]);

  // Real-time comments listener
  useEffect(() => {
    if (!recipe.id) {
      setLoadingComments(false);
      return;
    }

    setLoadingComments(true);
    const commentsRefRoot = collection(db, "comments");
    const qRoot = query(
      commentsRefRoot,
      where("recipeId", "==", recipe.id),
      orderBy("timestamp", "desc")
    );

    const unsubRoot = onSnapshot(
      qRoot,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            text: data.text || data.comment || data.message || "",
            timestamp: data.timestamp,
            userName: data.username || data.userEmail || "Anonymous",
          };
        });
        setComments(list);
        setLoadingComments(false);
      },
      (err) => {
        console.error("Comments error:", err);
        setLoadingComments(false);
      }
    );

    return () => unsubRoot();
  }, [recipe.id]);

  // Helper: Save favorites locally
  const saveFavoritesLocal = async (recipeId, remove = false) => {
    try {
      const json = await AsyncStorage.getItem("@favorites");
      let savedFavorites = json ? JSON.parse(json) : [];
      if (remove) {
        savedFavorites = savedFavorites.filter((id) => id !== recipeId);
      } else if (!savedFavorites.includes(recipeId)) {
        savedFavorites.push(recipeId);
      }
      await AsyncStorage.setItem("@favorites", JSON.stringify(savedFavorites));
    } catch (e) {
      console.log("Failed to update local favorites:", e);
    }
  };

  // Helper: Save favorites to Firebase
  const saveFavoriteFirebase = async (recipeId, remove = false) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      if (remove) {
        await updateDoc(userRef, { favorites: arrayRemove(recipeId) });
      } else {
        await updateDoc(userRef, { favorites: arrayUnion(recipeId) });
      }
    } else if (!remove) {
      await setDoc(userRef, { favorites: [recipeId] });
    }
  };

  // Toggle favorite
  const handleFavoritePress = async () => {
    try {
      if (isFavorite) {
        setIsFavorite(false);
        await saveFavoritesLocal(recipe.id, true);
        await saveFavoriteFirebase(recipe.id, true);
        Alert.alert("Removed", "Recipe removed from favorites!");
      } else {
        setIsFavorite(true);
        await saveFavoritesLocal(recipe.id);
        await saveFavoriteFirebase(recipe.id);
        Alert.alert("Added", "Recipe added to favorites!");
      }
    } catch (error) {
      console.log("Error toggling favorite:", error);
      Alert.alert("Error", "Could not update favorites");
    }
  };

  const handleCommentPress = () => {
    if (auth.currentUser) {
      navigation.navigate("Comment", { recipeId: recipe.id });
    } else {
      Alert.alert("Login Required", "You must log in to comment", [
        { text: "Cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ]);
    }
  };

  const renderComment = ({ item }) => {
    const time =
      item.timestamp?.toDate?.()
        ? item.timestamp.toDate().toLocaleString()
        : item.timestamp
        ? new Date(item.timestamp).toLocaleString()
        : null;

    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUser}>{item.userName}</Text>
          {time && <Text style={styles.commentTime}>{time}</Text>}
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Image source={{ uri: recipe.image || "https://via.placeholder.com/600x300" }} style={styles.image} />
      <View style={styles.headerRow}>
        <Text style={styles.title}>{recipe.name}</Text>
        <Text style={styles.categoryPill}>{recipe.category}</Text>
      </View>

      <Text style={styles.subtitle}>Description</Text>
      <Text style={styles.bodyText}>{recipe.description}</Text>

      {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
        <>
          <Text style={styles.subtitle}>Ingredients</Text>
          <View style={styles.card}>
            {recipe.ingredients.map((ing, idx) => (
              <View key={idx} style={styles.ingredientRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.ingredientText}>{ing}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {Array.isArray(recipe.steps) && recipe.steps.length > 0 && (
        <>
          <Text style={styles.subtitle}>Steps</Text>
          <View style={styles.card}>
            {recipe.steps.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <Text style={styles.stepIndex}>{idx + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleCommentPress}>
          <Text style={styles.primaryButtonText}>Add Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: isFavorite ? "#aaa" : "#FF6666" }]}
          onPress={handleFavoritePress}
        >
          <Text style={styles.primaryButtonText}>{isFavorite ? "Favorited" : "Add to Favorite"}</Text>
        </TouchableOpacity>
      </View>

      {loadingComments ? (
        <ActivityIndicator size="large" color="#D35400" />
      ) : comments.length > 0 ? (
        <>
          <Text style={styles.subtitle}>Comments</Text>
          <FlatList data={comments} keyExtractor={(item) => item.id} renderItem={renderComment} scrollEnabled={false} />
        </>
      ) : (
        <Text style={styles.noComments}>No comments yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7F0", padding: 16 },
  image: { width: "100%", height: 220, borderRadius: 12, marginBottom: 14 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#6b3f2b", flex: 1, marginRight: 8 },
  categoryPill: { backgroundColor: "#FDE8D6", color: "#7a5a45", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, fontWeight: "700" },
  subtitle: { fontSize: 16, fontWeight: "700", color: "#6b3f2b", marginTop: 12, marginBottom: 6 },
  bodyText: { color: "#7a5a45", lineHeight: 20 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  ingredientRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  bullet: { color: "#7a7a7a", marginRight: 8, fontSize: 16 },
  ingredientText: { color: "#7a5a45", flex: 1 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  stepIndex: { fontWeight: "700", color: "#D35400", marginRight: 8 },
  stepText: { color: "#7a5a45", flex: 1 },
  actionsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, marginBottom: 12 },
  primaryButton: { flex: 1, backgroundColor: "#D35400", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginRight: 8 },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  commentItem: { marginBottom: 12, padding: 10, backgroundColor: "#FFFFFF", borderRadius: 8, shadowColor: "#000", shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  commentUser: { fontWeight: "700", color: "#6b3f2b", marginBottom: 4 },
  commentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  commentTime: { color: "#9b7f6b", fontSize: 12 },
  commentText: { color: "#7a5a45" },
  noComments: { textAlign: "center", color: "#7a5a45", marginTop: 12 },
});
