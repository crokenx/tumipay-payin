export const PAYIN_ENDPOINTS = {
  base: '/payins',
  byId: (id: string) => `/payins/${id}`,
  listByCustomer: (customerId: string) =>
    `/payins?customer_id=${encodeURIComponent(customerId)}`,
} as const;
