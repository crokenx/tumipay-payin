// PayIn Status Badge Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PayInStatus } from '../../domain/entities/PayIn';

interface PayInStatusBadgeProps {
  status: PayInStatus;
}

export const PayInStatusBadge: React.FC<PayInStatusBadgeProps> = ({
  status,
}) => {
  const getStatusStyles = (status: PayInStatus) => {
    switch (status) {
      case PayInStatus.CREATED:
        return {
          backgroundColor: '#E3F2FD',
          borderColor: '#2196F3',
          color: '#1976D2',
        };
      case PayInStatus.VALIDATED:
        return {
          backgroundColor: '#F3E5F5',
          borderColor: '#9C27B0',
          color: '#7B1FA2',
        };
      case PayInStatus.PROCESSED:
        return {
          backgroundColor: '#E8F5E9',
          borderColor: '#4CAF50',
          color: '#388E3C',
        };
      case PayInStatus.FAILED:
        return {
          backgroundColor: '#FFEBEE',
          borderColor: '#F44336',
          color: '#D32F2F',
        };
      default:
        return {
          backgroundColor: '#F5F5F5',
          borderColor: '#9E9E9E',
          color: '#616161',
        };
    }
  };

  const styles = getStatusStyles(status);

  return (
    <View
      style={[
        badgeStyles.container,
        {
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor,
        },
      ]}
    >
      <Text style={[badgeStyles.text, { color: styles.color }]}>
        {status}
      </Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
