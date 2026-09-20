import AsyncStorage from '@react-native-async-storage/async-storage';

export type SavedCalculation = {
    id: string;
    createdAt: string;
    saved: boolean;
    workers: {
        name: string;
        kahon: number;
        harvestTaro: number;
        harvesterShare: number;
        fixedKahonShare: number;
        harvestShare: number;
        ownerShare: number;
        tenantShare: number;
    }[];
};

const HISTORY_KEY = '@farm_calculator_history';

export const saveCalculation = async (
    calculation: SavedCalculation
): Promise<void> => {
    try {
        const existingData = await AsyncStorage.getItem(HISTORY_KEY);

        const history: SavedCalculation[] = existingData
            ? JSON.parse(existingData)
            : [];

        history.push(calculation);

        await AsyncStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(history)
        );
    } catch (error) {
        console.error('Failed to save calculation:', error);
        throw error;
    }
};

export const getHistory = async (): Promise<SavedCalculation[]> => {
    try {
        const existingData = await AsyncStorage.getItem(HISTORY_KEY);

        if (!existingData) {
            return [];
        }

        return JSON.parse(existingData);
    } catch (error) {
        console.error('Failed to load history:', error);
        return [];
    }
};