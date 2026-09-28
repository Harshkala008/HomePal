import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>HomePal</Text>
      <Text style={styles.subtitle}>Calorie tracker for Indian meals</Text>
      <Text style={styles.card}>Search, scan, and log smarter.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F111A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#EDEFF5',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#8A8FA3',
    fontSize: 16,
    marginBottom: 24,
  },
  card: {
    color: '#00B464',
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: '#121722',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
