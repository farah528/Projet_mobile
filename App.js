import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import RecipeDetailScreen from "./screens/RecipeDetailScreen";
import LoginScreen from "./screens/auth/LoginScreen";
import RegisterScreen from "./screens/auth/RegisterScreen";
import ProfileScreen from "./screens/ProfileScreen"; // added Profile screen
import AddRecipeScreen from "./screens/AddRecipeScreen";
import CommentScreen from './screens/CommentScreen'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: "All Recipes" }}
        />
        <Stack.Screen 
          name="RecipeDetail" 
          component={RecipeDetailScreen} 
          options={{ title: "Recipe Details" }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: "Login" }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: "Register" }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "My Profile" }}
        />
        <Stack.Screen
          name="AddRecipe"
          component={AddRecipeScreen}
           options={{ title: "Create a Recipe" }}
        />
        <Stack.Screen 
        name="Comment" 
        component={CommentScreen} 
        options={{ title: "Add Comment" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
