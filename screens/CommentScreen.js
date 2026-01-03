import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { auth, db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CommentScreen({ route, navigation }) {
  const { recipeId } = route.params;
  const [comment, setComment] = useState("");

  const handleAddComment = async () => {
    if (!comment.trim()) {
      Alert.alert("Error", "Comment cannot be empty");
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Login Required", "You must log in to comment");
      return;
    }

    try {
      // Add comment to the centralized "comments" collection
      const commentsRef = collection(db, "comments");
      await addDoc(commentsRef, {
        text: comment,
        userId: auth.currentUser.uid,
        recipeId: recipeId, // link comment to recipe
        username: auth.currentUser.displayName || auth.currentUser.email,
        userEmail: auth.currentUser.email,
        timestamp: serverTimestamp(),
      });

      Alert.alert("Success", "Comment added!");
      setComment(""); // clear input
      navigation.goBack(); // go back to RecipeDetailScreen
    } catch (error) {
      console.log("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TextInput
        style={styles.input}
        placeholder="Write your comment here..."
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <Button title="Post Comment" onPress={handleAddComment} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF7F0", justifyContent: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    textAlignVertical: "top",
    minHeight: 100,
    backgroundColor: "#FFFFFF",
  },
});
