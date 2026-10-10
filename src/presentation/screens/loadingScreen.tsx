import { Colors } from '@/theme/colors';
import { Color } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * LoadingScreen component - shows a spinner while the saved session is read
 */

interface LoadingScreenProps {
    message?: string | null;
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner}/>
            <Text style={styles.subtext}>{message || 'Loading saved details...'}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: 24,
    },
    spinner: {
        marginBottom: 24,
    },
    subtext: {
        color: Colors.textPrimary,
        fontSize: 18,
        fontWeight: 'normal',
    },
});