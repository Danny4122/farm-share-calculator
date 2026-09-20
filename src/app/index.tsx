import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        <Text style={styles.icon}>🌾</Text>

        <Text style={styles.title}>
          Farm Share Calculator
        </Text>

        <Text style={styles.subtitle}>
          4 taro = 1 sack
        </Text>

        <Text style={styles.question}>
          Choose Calculation Method
        </Text>

        <Pressable
          style={styles.option}
          onPress={() => router.push('/individual')}
        >
          <Text style={styles.optionTitle}>
            👥 Individual
          </Text>

          <Text style={styles.optionDescription}>
            Calculate each mananomay separately
          </Text>
        </Pressable>

        <Pressable style={styles.option}>
          <Text style={styles.optionTitle}>
            📊 General
          </Text>

          <Text style={styles.optionDescription}>
            Calculate the total harvest as one pool
          </Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F2',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },

  icon: {
    fontSize: 60,
    textAlign: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },

  question: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },

  option: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },

  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  optionDescription: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
});