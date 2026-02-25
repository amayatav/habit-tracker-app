import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NCAT_BLUE = "#004684";
const NCAT_GOLD = "#FDB927";

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [totalHabits, setTotalHabits] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const savedName = await AsyncStorage.getItem("NCAT_USER_NAME");
      const savedHabits = await AsyncStorage.getItem("NCAT_HABITS_FINAL_V3");
      if (savedName) setName(savedName);
      if (savedHabits) setTotalHabits(JSON.parse(savedHabits).length);
    };
    loadData();
  }, []);

  const save = async () => {
    await AsyncStorage.setItem("NCAT_USER_NAME", name);
    Keyboard.dismiss();
    Alert.alert("Profile Updated", "Looking good, Aggie! 🐾");
  };

  const clearData = () => {
    Alert.alert(
      "Reset All Data?",
      "This will delete all your habits and progress forever. You can't undo this!",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Everything", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.clear();
            setName("");
            setTotalHabits(0);
            Alert.alert("Reset Complete", "Fresh start initialized.");
          } 
        }
      ]
    );
  };

  // Logic for the Rank
  const getRank = () => {
    if (totalHabits === 0) return "New Aggie";
    if (totalHabits < 3) return "Habit Freshman";
    if (totalHabits < 6) return "Aggie Scholar";
    return "Aggie Legend 🏆";
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* 1. AVATAR SECTION */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{name ? name[0].toUpperCase() : "A"}</Text>
        </View>
        <Text style={styles.rankText}>{getRank()}</Text>
      </View>

      {/* 2. PROFILE EDIT CARD */}
      <View style={styles.card}>
        <Text style={styles.label}>Identity</Text>
        <TextInput 
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name..."
          placeholderTextColor="#999"
          onSubmitEditing={save}
        />
        <TouchableOpacity style={styles.btn} onPress={save}>
          <Text style={styles.btnText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

      {/* 3. QUICK STATS ROW */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{totalHabits}</Text>
          <Text style={styles.statLabel}>Active Goals</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>1891</Text>
          <Text style={styles.statLabel}>Est.</Text>
        </View>
      </View>

      {/* 4. DANGER ZONE */}
      <TouchableOpacity style={styles.resetBtn} onPress={clearData}>
        <Text style={styles.resetBtnText}>Reset All App Data</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>Your habits will determine your future.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#FDFDFD", padding: 25, alignItems: 'center', justifyContent: 'center' },
  
  // Avatar Styles
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarCircle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: NCAT_BLUE, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 4,
    borderColor: NCAT_GOLD,
    marginBottom: 10
  },
  avatarText: { fontSize: 40, fontWeight: '900', color: NCAT_GOLD },
  rankText: { fontSize: 18, fontWeight: '700', color: NCAT_BLUE, fontStyle: 'italic' },

  // Card Styles
  card: { backgroundColor: "#FFF", padding: 25, borderRadius: 25, elevation: 6, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, width: '100%', marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '800', color: "#AAA", marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 15, marginBottom: 20, fontSize: 18, color: NCAT_BLUE, fontWeight: '600' },
  btn: { backgroundColor: NCAT_BLUE, padding: 16, borderRadius: 15, alignItems: 'center' },
  btnText: { color: NCAT_GOLD, fontWeight: '800', fontSize: 16 },

  // Stats Styles
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  statItem: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, width: '48%', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  statNum: { fontSize: 24, fontWeight: '900', color: NCAT_BLUE },
  statLabel: { fontSize: 12, color: '#666', fontWeight: '600' },

  // Reset Styles
  resetBtn: { marginTop: 20 },
  resetBtnText: { color: '#FF4444', fontWeight: '700', fontSize: 14, textDecorationLine: 'underline' },
  
  footerText: { marginTop: 40, color: '#DDD', fontSize: 18, fontWeight: '900', fontStyle: 'italic' }
});