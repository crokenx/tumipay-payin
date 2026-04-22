// PayIn Card Component
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import { PayIn } from '../../domain/entities/PayIn';
import { PayInStatusBadge } from './PayInStatusBadge';

interface PayInCardProps {
  payIn: PayIn;
  onPress?: (event: GestureResponderEvent) => void;
}

export const PayInCard: React.FC<PayInCardProps> = ({ payIn, onPress }) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.id}>ID: {payIn.id}</Text>
          <Text style={styles.customer}>
            Customer: {payIn.customer_id}
          </Text>
        </View>
        <PayInStatusBadge status={payIn.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.amount}>
            {formatCurrency(payIn.amount, payIn.currency)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>{payIn.payment_method}</Text>
        </View>

        {payIn.description && (
          <View style={styles.row}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>{payIn.description}</Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>Created</Text>
          <Text style={styles.value}>{formatDate(payIn.created_at)}</Text>
        </View>

        {payIn.error_message && (
          <View style={styles.errorRow}>
            <Text style={styles.errorLabel}>Error</Text>
            <Text style={styles.errorValue}>{payIn.error_message}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  id: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  customer: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  content: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    maxWidth: '70%',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  errorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FFEBEE',
  },
  errorLabel: {
    fontSize: 12,
    color: '#D32F2F',
    fontWeight: '500',
  },
  errorValue: {
    fontSize: 13,
    color: '#D32F2F',
    maxWidth: '70%',
  },
});
