import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack initialRouteName="(tabs)">
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerShown: false,
                }}
            />

            <Stack.Screen
                name="individual"
                options={{
                    title: 'Farm Share Calculator',
                }}
            />

            <Stack.Screen
                name="results"
                options={{
                    title: 'Results',
                }}
            />
        </Stack>
    );
}