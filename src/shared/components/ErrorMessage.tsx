// Error Message Component - Shared UI
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  DimensionValue,
} from 'react-native';

interface ErrorMessageProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: { marginTop?: DimensionValue; marginBottom?: DimensionValue };
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} style={styles.button}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFE5E5',
    borderLeftColor: '#FF6B6B',
    borderLeftWidth: 4,
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#B71C1C',
    marginBottom: 12,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
