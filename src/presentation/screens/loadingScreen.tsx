
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/theme/colors';
/** Full-screen spinner used while the saved session is being read. */
interface LoadingScreenProps {
  message?: string | null;
}
export const LoadingScreen = ({ message }: LoadingScreenProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#10B981" style={styles.spinner} />
      <Text style={styles.subtext}>{message || "You're almost done!\nWe're creating your profile."}</Text>
    </View>
  );
};



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