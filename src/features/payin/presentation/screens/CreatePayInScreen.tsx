// Create PayIn Screen
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { usePayInStore } from '../store/usePayInStore';
import { CreatePayInRequest } from '../../domain/entities/PayIn';
import { ErrorMessage, LoadingOverlay } from '../../../../shared';

interface CreatePayInScreenProps {
  onSuccess?: () => void;
}

export const CreatePayInScreen: React.FC<CreatePayInScreenProps> = ({
  onSuccess,
}) => {
  const { createPayIn, loading, error, clearError } = usePayInStore();

  const [formData, setFormData] = useState<CreatePayInRequest>({
    customer_id: 'cust-123', // Pre-filled for demo
    amount: 0,
    currency: 'USD',
    payment_method: '',
    description: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.customer_id) {
      errors.customer_id = 'Customer ID is required';
    }
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    if (!formData.currency) {
      errors.currency = 'Currency is required';
    }
    if (!formData.payment_method) {
      errors.payment_method = 'Payment method is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreatePayIn = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await createPayIn(formData);
      Alert.alert('Success', 'PayIn created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setFormData({
              customer_id: 'cust-123',
              amount: 0,
              currency: 'USD',
              payment_method: '',
              description: '',
            });
            setValidationErrors({});
            onSuccess?.();
          },
        },
      ]);
    } catch (err) {
      // Error is handled by the store
      console.error('Failed to create PayIn:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create Payment</Text>
        <Text style={styles.subtitle}>Enter payment details below</Text>

        {error && (
          <ErrorMessage
            title="Error"
            message={error}
            actionLabel="Dismiss"
            onAction={clearError}
            style={{ marginTop: 16, marginBottom: 16 }}
          />
        )}

        <View style={styles.formGroup}>
          <Label text="Customer ID" required />
          <TextInput
            testID='input-customer-id'
            style={[
              styles.input,
              validationErrors.customer_id && styles.inputError,
            ]}
            placeholder="Enter customer ID"
            value={formData.customer_id}
            onChangeText={(text) =>
              setFormData({ ...formData, customer_id: text })
            }
            editable={!loading}
          />
          {validationErrors.customer_id && (
            <Text style={styles.errorText}>{validationErrors.customer_id}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Label text="Amount" required />
          <View style={styles.amountRow}>
            <TextInput
            testID='input-amount'
              style={[
                styles.input,
                styles.amountInput,
                validationErrors.amount && styles.inputError,
              ]}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={formData.amount ? String(formData.amount) : ''}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  amount: text ? parseFloat(text) : 0,
                })
              }
              editable={!loading}
            />
            <TextInput
              style={[
                styles.input,
                styles.currencyInput,
                validationErrors.currency && styles.inputError,
              ]}
              placeholder="USD"
              maxLength={3}
              value={formData.currency}
              onChangeText={(text) =>
                setFormData({ ...formData, currency: text.toUpperCase() })
              }
              editable={!loading}
            />
          </View>
          {validationErrors.amount && (
            <Text style={styles.errorText}>{validationErrors.amount}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Label text="Payment Method" required />
          <TextInput
            testID='input-payment-method'
            style={[
              styles.input,
              validationErrors.payment_method && styles.inputError,
            ]}
            placeholder="e.g., credit_card, paypal, bank_transfer"
            value={formData.payment_method}
            onChangeText={(text) =>
              setFormData({ ...formData, payment_method: text })
            }
            editable={!loading}
          />
          {validationErrors.payment_method && (
            <Text style={styles.errorText}>
              {validationErrors.payment_method}
            </Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Label text="Description" />
          <TextInput
            testID='input-description'
            style={[styles.input, styles.textArea]}
            placeholder="Optional description"
            value={formData.description || ''}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            multiline
            numberOfLines={4}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          testID='btn-create-payment'
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleCreatePayIn}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating...' : 'Create Payment'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <LoadingOverlay visible={loading} message="Creating payment..." />
    </KeyboardAvoidingView>
  );
};

const Label: React.FC<{ text: string; required?: boolean }> = ({
  text,
  required,
}) => (
  <Text style={styles.label}>
    {text}
    {required && <Text style={styles.requiredAsterisk}>*</Text>}
  </Text>
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
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: '#FF6B6B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: 'white',
    color: '#333',
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFEBEE',
  },
  amountRow: {
    flexDirection: 'row',
    gap: 12,
  },
  amountInput: {
    flex: 2,
  },
  currencyInput: {
    flex: 1,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#B3D9FF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
