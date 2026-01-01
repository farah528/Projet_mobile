import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { auth, db, doc, setDoc, serverTimestamp } from "../../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function RegisterScreen({ route, navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const recipeId = route.params?.recipeId; // optional redirect

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      // 1️⃣ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Save additional info in Firestore with UID as doc ID
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username,
        email,
        createdAt: serverTimestamp()
      });

      Alert.alert("Success", "Account created successfully!");

      // 3️⃣ Redirect
      if (recipeId) {
        navigation.navigate("RecipeDetail", { recipeId });
      } else {
        navigation.navigate("Home");
      }

    } catch (error) {
  console.log("Registration error code:", error.code);
  console.log("Registration error message:", error.message);
  Alert.alert("Registration failed", error.message);
}

  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.logoTop}>MyRecipe</Text>
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>Join to save and share your favorite recipes</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor="#8b6b5a"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#8b6b5a"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#8b6b5a"
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} activeOpacity={0.9}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    justifyContent: "flex-start",
    backgroundColor: "#FFF7F0",
  },
  header: {
    alignItems: "center",
    marginBottom: 12,
  },
  logoTop: {
    color: "#D35400",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#6b3f2b",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#8b6b5a",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0DCCF",
    color: "#6b3f2b",
  },
  button: {
    backgroundColor: "#D35400",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#D35400",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  linkContainer: { marginTop: 16, alignItems: "center" },
  linkText: { color: "#7a5a45" , fontSize: 13},
  linkBold: { color: "#D35400", fontWeight: "700" },
  backButton: {
    position: "absolute",
    top: 18,
    left: 14,
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFF2E6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },
  backButtonText: {
    color: "#D35400",
    fontSize: 20,
    fontWeight: "700",
  },
});
