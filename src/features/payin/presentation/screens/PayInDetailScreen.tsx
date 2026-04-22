// PayIn Detail Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { usePayInStore } from '../store/usePayInStore';
import { PayInStatusBadge } from '../components/PayInStatusBadge';
import { EmptyState, ErrorMessage, LoadingOverlay } from '../../../../shared';

type PayInDetailRouteProp = RouteProp<{
  PayInDetail: { payInId: string };
}, 'PayInDetail'>;

interface PayInDetailScreenProps {
  payInId?: string;
}

export const PayInDetailScreen: React.FC<PayInDetailScreenProps> = ({
  payInId: initialPayInId,
}) => {
  const route = useRoute<PayInDetailRouteProp>();
  const routePayInId = route.params?.payInId;
  const { getPayInById, currentPayIn, loading, error, clearError } =
    usePayInStore();
  const [searchId, setSearchId] = useState(routePayInId || initialPayInId || 'payin-001');
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (routePayInId || initialPayInId) {
      const idToLoad = routePayInId || initialPayInId;
      loadPayIn(idToLoad!);
    }
  }, [routePayInId, initialPayInId]);

  const loadPayIn = async (id: string) => {
    setFetchError(null);
    try {
      await getPayInById(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch PayIn';
      setFetchError(message);
    }
  };

  const handleSearch = () => {
    if (searchId.trim()) {
      loadPayIn(searchId.trim());
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Transaction Detail</Text>
        <Text style={styles.subtitle}>Search by PayIn ID</Text>

        {(error || fetchError) && (
          <ErrorMessage
            title="Error"
            message={error || fetchError || 'Unknown error'}
            actionLabel="Dismiss"
            onAction={() => {
              clearError();
              setFetchError(null);
            }}
            style={{ marginTop: 16, marginBottom: 16 }}
          />
        )}

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter PayIn ID (e.g., payin-001)"
              value={searchId}
              onChangeText={setSearchId}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.searchButton, loading && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {currentPayIn ? (
          <View style={styles.detailContainer}>
            <View style={styles.headerSection}>
              <View style={styles.titleRow}>
                <Text style={styles.detailTitle}>PayIn #{currentPayIn.id}</Text>
                <PayInStatusBadge status={currentPayIn.status} />
              </View>
            </View>

            <View style={styles.section}>
              <SectionTitle title="Transaction Information" />

              <DetailRow
                label="ID"
                value={currentPayIn.id}
              />
              <DetailRow
                label="Customer ID"
                value={currentPayIn.customer_id}
              />
              <DetailRow
                label="Amount"
                value={formatCurrency(currentPayIn.amount, currentPayIn.currency)}
                valueStyle={styles.amountValue}
              />
              <DetailRow
                label="Currency"
                value={currentPayIn.currency}
              />
              <DetailRow
                label="Payment Method"
                value={currentPayIn.payment_method}
              />
            </View>

            {currentPayIn.description && (
              <View style={styles.section}>
                <SectionTitle title="Description" />
                <Text style={styles.descriptionText}>
                  {currentPayIn.description}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <SectionTitle title="Dates" />
              <DetailRow
                label="Created"
                value={formatDate(currentPayIn.created_at)}
              />
              <DetailRow
                label="Updated"
                value={formatDate(currentPayIn.updated_at)}
              />
            </View>

            {currentPayIn.error_message && (
              <View style={styles.errorSection}>
                <SectionTitle title="Error Details" error />
                <Text style={styles.errorText}>
                  {currentPayIn.error_message}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => loadPayIn(currentPayIn.id)}
              disabled={loading}
            >
              <Text style={styles.refreshButtonText}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : !loading ? (
          <EmptyState
            title="No Transaction Found"
            message="Search for a PayIn ID to view its details"
            style={{ marginTop: 24 }}
          />
        ) : null}
      </ScrollView>
      <LoadingOverlay visible={loading} message="Loading transaction..." />
    </View>
  );
};

const SectionTitle: React.FC<{ title: string; error?: boolean }> = ({
  title,
  error,
}) => (
  <Text
    style={[
      styles.sectionTitle,
      error && { color: '#D32F2F' },
    ]}
  >
    {title}
  </Text>
);

const DetailRow: React.FC<{
  label: string;
  value: string;
  valueStyle?: any;
}> = ({ label, value, valueStyle }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: 'white',
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 18,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#B3D9FF',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  detailContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  headerSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  amountValue: {
    color: '#007AFF',
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 6,
  },
  errorSection: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    lineHeight: 20,
  },
  refreshButton: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
