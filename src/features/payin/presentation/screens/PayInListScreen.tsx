// PayIn List Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { usePayInStore } from '../store/usePayInStore';
import { PayInCard } from '../components/PayInCard';
import { EmptyState, ErrorMessage, LoadingOverlay } from '../../../../shared';

interface PayInListScreenProps {
  customerId?: string;
  onSelectPayIn?: (payInId: string) => void;
}

export const PayInListScreen: React.FC<PayInListScreenProps> = ({
  customerId = 'cust-123', // Default for demo
  onSelectPayIn,
}) => {
  const { listPayIns, payins, loading, error, clearError } = usePayInStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    loadPayIns();
  }, []);

  const loadPayIns = async () => {
    try {
      await listPayIns(customerId);
    } catch (err) {
      console.error('Failed to load PayIns:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await listPayIns(customerId);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredPayins = filterStatus
    ? payins.filter((p) => p.status === filterStatus)
    : payins;

  const handlePayInPress = (payInId: string) => {
    onSelectPayIn?.(payInId);
  };

  const statuses = [
    { key: null, label: 'All' },
    { key: 'CREATED', label: 'Created' },
    { key: 'VALIDATED', label: 'Validated' },
    { key: 'PROCESSED', label: 'Processed' },
    { key: 'FAILED', label: 'Failed' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Transactions</Text>
          <Text style={styles.subtitle}>Customer: {customerId}</Text>
        </View>
        <View style={styles.count}>
          <Text style={styles.countText}>{payins.length}</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <ErrorMessage
            title="Error"
            message={error}
            actionLabel="Retry"
            onAction={() => {
              clearError();
              loadPayIns();
            }}
          />
        </View>
      )}

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {statuses.map((status) => (
            <TouchableOpacity
              key={status.key}
              style={[
                styles.filterButton,
                filterStatus === status.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilterStatus(status.key as string | null)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterStatus === status.key && styles.filterButtonTextActive,
                ]}
              >
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && payins.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : filteredPayins.length > 0 ? (
        <FlatList
          data={filteredPayins}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PayInCard
              payIn={item}
              onPress={() => handlePayInPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="No Transactions"
            message={
              filterStatus
                ? `No ${filterStatus.toLowerCase()} transactions found`
                : 'No transactions found for this customer'
            }
            actionLabel="Refresh"
            onAction={handleRefresh}
          />
        </View>
      )}

      <LoadingOverlay visible={loading && payins.length > 0} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  count: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  errorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: 'white',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
