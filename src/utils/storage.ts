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

export type RetentionPeriod = 1 | 7 | 30 | 60 | null;

const SETTINGS_KEY = '@farm_calculator_settings';

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

export const deleteCalculation = async (
    id: string
): Promise<void> => {
    try {
        const existingData = await AsyncStorage.getItem(HISTORY_KEY);

        if (!existingData) {
            return;
        }

        const history: SavedCalculation[] = JSON.parse(existingData);

        const updatedHistory = history.filter(
            (calculation) => calculation.id !== id
        );

        await AsyncStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(updatedHistory)
        );
    } catch (error) {
        console.error('Failed to delete calculation:', error);
        throw error;
    }
};

export const updateCalculation = async (
    updatedCalculation: SavedCalculation
): Promise<void> => {
    try {
        const existingData = await AsyncStorage.getItem(HISTORY_KEY);

        if (!existingData) {
            return;
        }

        const history: SavedCalculation[] = JSON.parse(existingData);

        const updatedHistory = history.map(
            (calculation) =>
                calculation.id === updatedCalculation.id
                    ? updatedCalculation
                    : calculation
        );

        await AsyncStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(updatedHistory)
        );
    } catch (error) {
        console.error('Failed to update calculation:', error);
        throw error;
    }
};

export const getRetentionPeriod = async (): Promise<RetentionPeriod> => {
    try {
        const existingData = await AsyncStorage.getItem(SETTINGS_KEY);

        if (!existingData) {
            return 7;
        }

        const settings = JSON.parse(existingData);

        return settings.retentionPeriod ?? 7;
    } catch (error) {
        console.error('Failed to load settings:', error);
        return 7;
    }
};

export const setRetentionPeriod = async (
    retentionPeriod: RetentionPeriod
): Promise<void> => {
    try {
        await AsyncStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify({
                retentionPeriod,
            })
        );
    } catch (error) {
        console.error('Failed to save settings:', error);
        throw error;
    }
};