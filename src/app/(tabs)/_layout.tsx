import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Calculate',
                    tabBarIcon: () => (
                        <Text style={{ fontSize: 20 }}>🧮</Text>
                    ),
                }}
            />

            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: () => (
                        <Text style={{ fontSize: 20 }}>📋</Text>
                    ),
                }}
            />

            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: () => (
                        <Text style={{ fontSize: 20 }}>⚙️</Text>
                    ),
                }}
            />
        </Tabs>
    );
}