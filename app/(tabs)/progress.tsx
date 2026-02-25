import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Calendar } from "react-native-calendars";
import { useFocusEffect } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Circle } from 'react-native-svg';

const NCAT_BLUE = "#004684";
const NCAT_GOLD = "#FDB927";
const { width } = Dimensions.get("window");

export default function ProgressScreen() {
  const [habits, setHabits] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        const data = await AsyncStorage.getItem("NCAT_HABITS_FINAL_V3");
        if (data) setHabits(JSON.parse(data));
      };
      load();
    }, [])
  );

  const getMarkedDates = () => {
    let marked: any = {};
    habits.forEach((h: any) => {
      h.completedDates.forEach((date: string) => {
        marked[date] = { marked: true, dotColor: NCAT_GOLD };
      });
    });
    return marked;
  };

  const getUniqueDaysCompleted = () => {
    const allDates = habits.flatMap((h: any) => h.completedDates);
    return new Set(allDates).size;
  };

  const getMonthlyRate = () => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let completedEntries = 0;
    let possibleEntries = habits.length * daysInMonth;

    habits.forEach((h: any) => {
      h.completedDates.forEach((date: string) => {
        const d = new Date(date + 'T00:00:00'); 
        if (d.getMonth() === month && d.getFullYear() === year) {
          completedEntries++;
        }
      });
    });
    return possibleEntries === 0 ? 0 : Math.round((completedEntries / possibleEntries) * 100);
  };

  const totalDays = getUniqueDaysCompleted();
  const completionRate = getMonthlyRate();

  // Gauge Settings
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (completionRate / 100) * circumference;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Progress Tracker</Text>
      
      <View style={styles.card}>
        <Calendar 
          markedDates={getMarkedDates()}
          theme={{
            todayTextColor: NCAT_GOLD,
            arrowColor: NCAT_BLUE,
            monthTextColor: NCAT_BLUE,
            textDayFontWeight: '600',
            textMonthFontWeight: 'bold',
          }}
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          You've completed {totalDays} {totalDays === 1 ? 'day' : 'days'}!
        </Text>
        <Text style={styles.subText}>The sky is the limit ⋆｡°✩</Text>
      </View>

      {/* CIRCULAR GAUGE COMPONENT */}
      <View style={styles.gaugeCard}>
        <View style={styles.gaugeContainer}>
          <Svg width={size} height={size}>
            {/* Background Circle */}
            <Circle
              stroke="#F0F0F0"
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            {/* Progress Circle */}
            <Circle
              stroke={NCAT_GOLD}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <View style={styles.gaugeTextContainer}>
            <Text style={styles.gaugePercent}>{completionRate}%</Text>
          </View>
        </View>

        <View style={styles.gaugeInfo}>
          <Text style={styles.rateTitle}>Monthly Consistency</Text>
          <Text style={styles.rateSubtext}>
            You've filled {completionRate}% of your goal slots this month.
          </Text>
        </View>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD", padding: 20 },
  title: { fontSize: 32, fontWeight: "900", color: NCAT_BLUE, marginBottom: 25, marginTop: 40, textAlign: 'center' },
  card: { backgroundColor: "#FFF", borderRadius: 25, padding: 15, marginBottom: 20, elevation: 8, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12 },
  infoBox: { backgroundColor: NCAT_BLUE, padding: 30, borderRadius: 25, marginTop: 5, alignItems: 'center' },
  infoText: { color: NCAT_GOLD, fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  subText: { color: '#FFF', fontSize: 14, textAlign: 'center', marginTop: 8, fontStyle: 'italic', opacity: 0.8 },
  
  // GAUGE STYLES
  gaugeCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 25,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#EEE",
  },
  gaugeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugePercent: {
    fontSize: 22,
    fontWeight: '900',
    color: NCAT_BLUE,
  },
  gaugeInfo: {
    flex: 1,
    marginLeft: 20,
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NCAT_BLUE,
    marginBottom: 4,
  },
  rateSubtext: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});