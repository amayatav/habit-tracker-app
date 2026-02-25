import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Icons for a pro look

const NCAT_BLUE = "#004684";
const NCAT_GOLD = "#FDB927";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: NCAT_GOLD,
      tabBarInactiveTintColor: "#ABB8C3",
      tabBarStyle: { 
        backgroundColor: NCAT_BLUE, 
        height: 70, 
        paddingBottom: 10,
        borderTopWidth: 0 
      },
      headerShown: false 
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Tracker",
          tabBarIcon: ({ color }) => <Ionicons name="list" size={28} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="progress" 
        options={{ 
          title: "Progress",
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={28} color={color} />
        }} 
      />
      {/* ADDED PROFILE SCREEN BELOW */}
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: "Profile",
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />
        }} 
      />
    </Tabs>
  );
}