// PayIn Zustand Store - State Management
import { create } from 'zustand';
import { CreatePayInRequest, CreatePayInUseCase, GetPayInByIdUseCase, ListPayInsUseCase, PayIn, PayInApiAdapter, PayInMockAdapter } from '../..';
import { ENV } from '../../../../config/env';

// Get repository instance
const getRepository = () => {
  if (ENV.USE_MOCK_API) {
    console.log('🔄 Using Mock API Adapter');
    return new PayInMockAdapter();
  }
  console.log('🌐 Using Real API Adapter');
  return new PayInApiAdapter();
};

interface PayInStore {
  // State
  payins: PayIn[];
  currentPayIn: PayIn | null;
  loading: boolean;
  error: string | null;

  // Actions
  createPayIn: (request: CreatePayInRequest) => Promise<PayIn>;
  getPayInById: (id: string) => Promise<PayIn>;
  listPayIns: (customerId: string) => Promise<void>;
  clearError: () => void;
  clearCurrentPayIn: () => void;
  reset: () => void;
}

export const usePayInStore = create<PayInStore>((set) => {
  const repository = getRepository();
  const createPayInUseCase = new CreatePayInUseCase(repository);
  const getPayInByIdUseCase = new GetPayInByIdUseCase(repository);
  const listPayInsUseCase = new ListPayInsUseCase(repository);

  return {
    // Initial state
    payins: [],
    currentPayIn: null,
    loading: false,
    error: null,

    // Actions
    createPayIn: async (request: CreatePayInRequest) => {
      set({ loading: true, error: null });
      try {
        const result = await createPayInUseCase.execute(request);
        set((state) => ({
          payins: [result as PayIn, ...state.payins],
          currentPayIn: result as PayIn,
          loading: false,
        }));
        return result as PayIn;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to create PayIn';
        set({ error: errorMessage, loading: false });
        throw error;
      }
    },

    getPayInById: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const result = await getPayInByIdUseCase.execute(id);
        set({ currentPayIn: result, loading: false });
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch PayIn';
        set({ error: errorMessage, loading: false });
        throw error;
      }
    },

    listPayIns: async (customerId: string) => {
      set({ loading: true, error: null });
      try {
        const result = await listPayInsUseCase.execute(customerId);
        set({ payins: result, loading: false });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch PayIns';
        set({ error: errorMessage, loading: false });
        throw error;
      }
    },

    clearError: () => set({ error: null }),
    clearCurrentPayIn: () => set({ currentPayIn: null }),
    reset: () =>
      set({
        payins: [],
        currentPayIn: null,
        loading: false,
        error: null,
      }),
  };
});
