import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert
} from "react-native";
import { useFocusEffect } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

const NCAT_BLUE = "#004684";
const NCAT_GOLD = "#FDB927";

interface Habit {
  id: string;
  name: string;
  completedDates: string[]; 
  streak: number;
  createdAt: string; 
  notesByDate?: { [date: string]: string }; 
}

const getLocalISODate = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitInput, setHabitInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(getLocalISODate(new Date()));
  const [userName, setUserName] = useState("Aggie");

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          const hData = await AsyncStorage.getItem("NCAT_HABITS_FINAL_V3");
          const nData = await AsyncStorage.getItem("NCAT_USER_NAME");
          if (hData) setHabits(JSON.parse(hData));
          if (nData) setUserName(nData);
        } catch (e) { console.error(e); }
      };
      loadData();
    }, [])
  );

  useEffect(() => {
    const saveHabits = async () => {
      try {
        await AsyncStorage.setItem("NCAT_HABITS_FINAL_V3", JSON.stringify(habits));
      } catch (e) { console.error(e); }
    };
    saveHabits();
  }, [habits]);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = getLocalISODate(d);
      days.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        iso,
        isToday: iso === getLocalISODate(new Date())
      });
    }
    return days;
  }, []);

  const filteredHabits = useMemo(() => {
    return habits.filter(h => h.createdAt <= selectedDate);
  }, [habits, selectedDate]);

  const calculateStreak = (dates: string[]) => {
    if (dates.length === 0) return 0;
    const sorted = [...dates].sort().reverse();
    let streak = 0;
    let curr = new Date();
    for (let i = 0; i < 365; i++) {
      const dStr = getLocalISODate(curr);
      if (sorted.includes(dStr)) {
        streak++;
        curr.setDate(curr.getDate() - 1);
      } else {
        if (i === 0) { curr.setDate(curr.getDate() - 1); continue; }
        break;
      }
    }
    return streak;
  };

  const addHabit = () => {
    if (!habitInput.trim()) return;
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: habitInput,
      completedDates: [],
      streak: 0,
      createdAt: selectedDate,
      notesByDate: {}
    };
    setHabits([...habits, newHabit]);
    setHabitInput("");
    Keyboard.dismiss();
  };

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => {
      if (h.id !== id) return h;
      const done = h.completedDates.includes(selectedDate);
      const updatedDates = done 
        ? h.completedDates.filter(d => d !== selectedDate) 
        : [...h.completedDates, selectedDate];
      return { ...h, completedDates: updatedDates, streak: calculateStreak(updatedDates) };
    }));
  };

  const updateNote = (id: string, text: string) => {
    setHabits(habits.map(h => {
      if (h.id !== id) return h;
      return { ...h, notesByDate: { ...h.notesByDate, [selectedDate]: text } };
    }));
  };

  const progress = filteredHabits.length === 0 ? 0 : 
    filteredHabits.filter(h => h.completedDates.includes(selectedDate)).length / filteredHabits.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <View style={styles.mainContainer}>
          
          {/* CORRECTED HEADER PLACEMENT */}
          <Text style={styles.miniTitleCentered}>Aggie Tracker 🐾</Text>
          <View style={styles.welcomeSectionLeft}>
            <Text style={styles.welcomeText}>Hello, {userName}</Text>
          </View>

          <View style={styles.calendarStrip}>
            {weekDays.map((day, i) => {
              const existedThen = habits.filter(h => h.createdAt <= day.iso);
              const allDoneThatDay = existedThen.length > 0 && existedThen.every(h => h.completedDates.includes(day.iso));
              return (
                <TouchableOpacity 
                  key={i} 
                  onPress={() => setSelectedDate(day.iso)}
                  style={[styles.calendarDay, selectedDate === day.iso && styles.daySelected, allDoneThatDay && styles.dayAllDone]}
                >
                  <Text style={[styles.dayName, selectedDate === day.iso && { color: NCAT_GOLD }]}>{day.dayName}</Text>
                  <Text style={[styles.dayNum, selectedDate === day.iso && { color: NCAT_GOLD }]}>{day.dayNum}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.progressBox}>
            <Text style={styles.progressLabel}>
                {selectedDate === getLocalISODate(new Date()) ? "Today's Pride" : selectedDate}
            </Text>
            <View style={styles.barOuter}><View style={[styles.barInner, { width: `${progress * 100}%` }]} /></View>
          </View>

          <View style={styles.inputArea}>
            <TextInput style={styles.input} placeholder="New Goal..." value={habitInput} onChangeText={setHabitInput} onSubmitEditing={addHabit} returnKeyType="done" />
            <TouchableOpacity style={styles.addBtn} onPress={addHabit}><Text style={styles.addBtnText}>Add</Text></TouchableOpacity>
          </View>

          <FlatList 
            data={filteredHabits} 
            keyExtractor={item => item.id} 
            renderItem={({ item }) => {
              const isDone = item.completedDates.includes(selectedDate);
              return (
                <View style={[styles.habitCard, isDone ? styles.cardDone : styles.cardPending]}>
                  <View style={styles.cardHeader}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => toggleHabit(item.id)}>
                      <Text style={[styles.habitTitle, isDone && styles.textStrikethrough]}>{item.name}</Text>
                      <Text style={[styles.streakText, { color: isDone ? NCAT_GOLD : '#666' }]}>🔥 {item.streak} day streak</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setHabits(habits.filter(h => h.id !== item.id))}>
                        <Text style={{color: isDone ? '#FFF' : NCAT_BLUE, fontWeight: 'bold', fontSize: 18}}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.noteInput, isDone && styles.noteInputDone]}
                    placeholder="Add notes..."
                    value={item.notesByDate?.[selectedDate] || ""}
                    onChangeText={(text) => updateNote(item.id, text)}
                    multiline={true}
                    blurOnSubmit={true}
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>
              );
            }}
            contentContainerStyle={{ paddingBottom: 60 }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },
  mainContainer: { flex: 1, paddingHorizontal: 20 },
  
  // SPECIFIC HEADER STYLES
  miniTitleCentered: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: NCAT_BLUE, 
    textAlign: 'center', 
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: .75
  },
  welcomeSectionLeft: { 
    marginTop: 5, 
    marginBottom: 20, 
    alignItems: 'flex-start' // Forced Left
  },
  welcomeText: { 
    fontSize: 32, 
    fontWeight: "900", 
    color: "#333" 
  },

  calendarStrip: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: NCAT_BLUE, padding: 15, borderRadius: 20, marginBottom: 20 },
  calendarDay: { alignItems: 'center', padding: 10, borderRadius: 12 },
  daySelected: { backgroundColor: 'rgba(255,255,255,0.2)' },
  dayAllDone: { borderBottomWidth: 3, borderBottomColor: NCAT_GOLD },
  dayName: { color: '#FFF', fontSize: 10, opacity: 0.6 },
  dayNum: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  progressBox: { marginBottom: 20 },
  progressLabel: { fontWeight: 'bold', color: NCAT_BLUE, marginBottom: 8, textAlign: 'center' },
  barOuter: { height: 10, backgroundColor: '#EEE', borderRadius: 5, overflow: 'hidden' },
  barInner: { height: '100%', backgroundColor: NCAT_GOLD, borderRadius: 5 },
  inputArea: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#F0F0F0', padding: 12, borderRadius: 10 },
  addBtn: { backgroundColor: NCAT_BLUE, paddingHorizontal: 15, borderRadius: 10, justifyContent: 'center' },
  addBtnText: { color: NCAT_GOLD, fontWeight: 'bold' },
  habitCard: { padding: 15, borderRadius: 15, marginBottom: 10 },
  cardPending: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE' },
  cardDone: { backgroundColor: NCAT_BLUE },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  habitTitle: { fontSize: 18, fontWeight: 'bold', color: NCAT_BLUE },
  textStrikethrough: { color: '#FFF', textDecorationLine: 'line-through' },
  streakText: { fontSize: 12, marginTop: 4 },
  noteInput: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 5, fontSize: 13, fontStyle: 'italic' },
  noteInputDone: { color: '#FFF', borderTopColor: 'rgba(255,255,255,0.2)' }
});