import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { auth } from "../../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      // ✅ Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);

      Alert.alert("Success", "Logged in successfully!");
      navigation.goBack(); // or navigate to Home
    } catch (error) {
      console.log("Login error code:", error.code);
      console.log("Login error message:", error.message);

      // Handle common errors
      if (error.code === "auth/user-not-found") {
        Alert.alert("Login failed", "No user found with this email. Please register first.");
      } else if (error.code === "auth/wrong-password") {
        Alert.alert("Login failed", "Incorrect password.");
      } else {
        Alert.alert("Login failed", error.message);
      }
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
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to discover delicious recipes</Text>
      </View>

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

      <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.9}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Register</Text></Text>
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
