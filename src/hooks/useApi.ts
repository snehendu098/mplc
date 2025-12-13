// SRGG Marketplace - React Hooks for API Data Fetching
'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseMutationState<T, P> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (params: P) => Promise<ApiResponse<T>>;
  reset: () => void;
}

// Helper to get auth token
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

// Generic fetch helper
async function apiFetch<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  return response.json();
}

// ============================================================================
// Generic Hooks
// ============================================================================

export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  deps: unknown[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetcher();
      if (response.success && response.data) {
        setData(response.data as T);
      } else {
        setError(response.error?.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  return { data, loading, error, refetch: fetchData };
}

export function useMutation<T, P>(
  mutator: (params: P) => Promise<ApiResponse<T>>
): UseMutationState<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (params: P): Promise<ApiResponse<T>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await mutator(params);
      if (response.success && response.data) {
        setData(response.data as T);
      } else {
        setError(response.error?.message || 'Operation failed');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: { code: 'ERROR', message: errorMessage } };
    } finally {
      setLoading(false);
    }
  }, [mutator]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, mutate, reset };
}

// ============================================================================
// Dashboard Hook
// ============================================================================

interface DashboardStats {
  producers: { total: number; verified: number; pending: number };
  listings: { total: number; active: number; totalValue: number };
  orders: { total: number; pending: number; completed: number; revenue: number };
  tokens: { total: number; active: number; minted: number };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    buyer: string;
    commodity: string;
    quantity: number;
    totalPrice: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  topCommodities: Array<{
    commodity: { id: string; name: string; category: string };
    listingCount: number;
    totalValue: number;
  }>;
}

export function useDashboardStats() {
  return useApi<DashboardStats>(
    () => apiFetch('/api/dashboard/stats'),
    []
  );
}

// ============================================================================
// Producer Hooks
// ============================================================================

interface Producer {
  id: string;
  srggEid: string;
  name: string;
  email?: string;
  phone: string;
  type: string;
  country: string;
  region?: string;
  city?: string;
  verificationStatus: string;
  rating: number;
  totalVolume: number;
  commodities?: string[];
}

interface ProducerListResponse {
  data: Producer[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function useProducers(params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
}) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString();

  return useApi<ProducerListResponse>(
    () => apiFetch(`/api/producers${queryString ? `?${queryString}` : ''}`),
    [params?.page, params?.limit, params?.status, params?.type, params?.search]
  );
}

export function useCreateProducer() {
  return useMutation<Producer, Record<string, unknown>>(
    (data) => apiFetch('/api/producers', { method: 'POST', body: JSON.stringify(data) })
  );
}

// ============================================================================
// Listing Hooks
// ============================================================================

interface Listing {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  currency: string;
  status: string;
  origin?: string;
  isVerified: boolean;
  isInsured: boolean;
  isTokenized: boolean;
  commodity: { id: string; name: string; category: string };
  producer: { id: string; name: string; srggEid: string; rating: number };
}

interface ListingListResponse {
  data: Listing[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function useListings(params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
}) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString();

  return useApi<ListingListResponse>(
    () => apiFetch(`/api/listings${queryString ? `?${queryString}` : ''}`),
    [params?.page, params?.limit, params?.status, params?.category, params?.search]
  );
}

export function useCreateListing() {
  return useMutation<Listing, Record<string, unknown>>(
    (data) => apiFetch('/api/listings', { method: 'POST', body: JSON.stringify(data) })
  );
}

export function useCreateOrder() {
  return useMutation<{ id: string; orderNumber: string }, { listingId: string; quantity: number }>(
    (data) => apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(data) })
  );
}

// ============================================================================
// Commodities Hook
// ============================================================================

interface Commodity {
  id: string;
  name: string;
  category: string;
  unit: string;
  hsCode?: string;
  description?: string;
  icon?: string;
}

export function useCommodities() {
  return useApi<Commodity[]>(
    () => apiFetch('/api/commodities'),
    []
  );
}

interface CreateCommodityParams {
  name: string;
  category: string;
  unit: string;
  hsCode?: string;
  description?: string;
  icon?: string;
}

export function useCreateCommodity() {
  return useMutation<Commodity, CreateCommodityParams>(
    (data) => apiFetch('/api/commodities', { method: 'POST', body: JSON.stringify(data) })
  );
}

// ============================================================================
// Tokenization Hooks
// ============================================================================

interface Token {
  id: string;
  asset: string;
  value: string;
  tokens: string;
  status: string;
  blockchain: string;
}

interface TokenListResponse {
  data: Token[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function useTokens(params?: { page?: number; status?: string }) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString();

  return useApi<TokenListResponse>(
    () => apiFetch(`/api/tokenization${queryString ? `?${queryString}` : ''}`),
    [params?.page, params?.status]
  );
}

export function useMintToken() {
  return useMutation<Token, { listingId: string; tokenType?: string }>(
    (data) => apiFetch('/api/tokenization', { method: 'POST', body: JSON.stringify(data) })
  );
}

// ============================================================================
// Validation Hooks
// ============================================================================

interface Validation {
  id: string;
  validationId: string;
  type: string;
  assetName: string;
  producer?: { name: string };
  priority: string;
  status: string;
  eta?: string;
}

interface ValidationListResponse {
  data: Validation[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function useValidations(params?: { page?: number; status?: string; type?: string }) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString();

  return useApi<ValidationListResponse>(
    () => apiFetch(`/api/validations${queryString ? `?${queryString}` : ''}`),
    [params?.page, params?.status, params?.type]
  );
}

export function useCreateValidation() {
  return useMutation<Validation, Record<string, unknown>>(
    (data) => apiFetch('/api/validations', { method: 'POST', body: JSON.stringify(data) })
  );
}

export function useUpdateValidation() {
  return useMutation<Validation, { id: string; status?: string; results?: Record<string, unknown> }>(
    (data) => apiFetch(`/api/validations/${data.id}`, { method: 'PATCH', body: JSON.stringify(data) })
  );
}

// ============================================================================
// Insurance Hooks
// ============================================================================

interface InsurancePolicy {
  id: string;
  type: string;
  asset: string;
  coverage: string;
  premium: string;
  provider: string;
  status: string;
}

interface InsuranceListResponse {
  data: InsurancePolicy[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function useInsurancePolicies(params?: { page?: number; status?: string; type?: string }) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString();

  return useApi<InsuranceListResponse>(
    () => apiFetch(`/api/insurance${queryString ? `?${queryString}` : ''}`),
    [params?.page, params?.status, params?.type]
  );
}

export function useCreateInsurancePolicy() {
  return useMutation<InsurancePolicy, Record<string, unknown>>(
    (data) => apiFetch('/api/insurance', { method: 'POST', body: JSON.stringify(data) })
  );
}

export function useGetInsuranceQuote() {
  return useMutation<{ quoteId: string; premium: number; annualPremium: number }, { type: string; coverageAmount: number; durationMonths?: number }>(
    (data) => apiFetch('/api/insurance/quote', { method: 'POST', body: JSON.stringify(data) })
  );
}

// ============================================================================
// Hedging Hooks
// ============================================================================

interface HedgePosition {
  id: string;
  commodity: string;
  type: string;
  qty: string;
  strike: string;
  expiry: string;
  pnl: string;
  status: string;
  exchange: string;
}

interface HedgeListResponse {
  data: HedgePosition[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function useHedgePositions(params?: { page?: number; status?: string }) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString();

  return useApi<HedgeListResponse>(
    () => apiFetch(`/api/hedging${queryString ? `?${queryString}` : ''}`),
    [params?.page, params?.status]
  );
}

export function useCreateHedgePosition() {
  return useMutation<HedgePosition, Record<string, unknown>>(
    (data) => apiFetch('/api/hedging', { method: 'POST', body: JSON.stringify(data) })
  );
}

// ============================================================================
// Logistics Hooks
// ============================================================================

interface Shipment {
  id: string;
  cargo: string;
  origin: string;
  dest: string;
  vessel: string;
  status: string;
  eta: string;
}

interface ShipmentListResponse {
  data: Shipment[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function useShipments(params?: { page?: number; status?: string }) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString();

  return useApi<ShipmentListResponse>(
    () => apiFetch(`/api/logistics${queryString ? `?${queryString}` : ''}`),
    [params?.page, params?.status]
  );
}

export function useCreateShipment() {
  return useMutation<Shipment, Record<string, unknown>>(
    (data) => apiFetch('/api/logistics', { method: 'POST', body: JSON.stringify(data) })
  );
}

// ============================================================================
// Notifications Hooks
// ============================================================================

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationListResponse {
  data: Notification[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  unreadCount: number;
}

export function useNotifications(params?: { page?: number; unread?: boolean }) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  ).toString();

  return useApi<NotificationListResponse>(
    () => apiFetch(`/api/notifications${queryString ? `?${queryString}` : ''}`),
    [params?.page, params?.unread]
  );
}

export function useMarkNotificationsRead() {
  return useMutation<{ marked: boolean }, { ids?: string[]; markAll?: boolean }>(
    (data) => apiFetch('/api/notifications', { method: 'PATCH', body: JSON.stringify(data) })
  );
}

// ============================================================================
// Analytics Hook
// ============================================================================

interface AnalyticsOverview {
  overview: {
    producers: { total: number; verified: number };
    listings: { total: number; active: number };
    orders: { total: number; completed: number };
    tokens: { total: number; minted: number };
    insurance: { activePolicies: number };
    hedging: { openPositions: number };
    logistics: { activeShipments: number };
    revenue: number;
  };
  aiInsights: Array<{
    title: string;
    insight: string;
    confidence: number;
    type: string;
  }>;
  riskMetrics: {
    regions: Array<{
      region: string;
      weather: string;
      market: string;
      supply: string;
      logistics: string;
    }>;
    portfolioMetrics: {
      var: number;
      beta: number;
      sharpeRatio: number;
    };
  };
}

export function useAnalytics(type: string = 'overview') {
  return useApi<AnalyticsOverview>(
    () => apiFetch(`/api/analytics?type=${type}`),
    [type]
  );
}

// ============================================================================
// Settings Hook
// ============================================================================

interface UserSettings {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  settings: Record<string, unknown>;
  tenant: { name: string; country: string };
}

export function useSettings() {
  return useApi<UserSettings>(
    () => apiFetch('/api/settings'),
    []
  );
}

export function useUpdateSettings() {
  return useMutation<UserSettings, { name?: string; phone?: string; currentPassword?: string; newPassword?: string; settings?: Record<string, unknown> }>(
    (data) => apiFetch('/api/settings', { method: 'PATCH', body: JSON.stringify(data) })
  );
}

// ============================================================================
// Authentication Hook
// ============================================================================

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await apiFetch<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        setUser(response.data.user);
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0';
    setUser(null);
  };

  return { user, isAuthenticated: !!user, loading, login, logout };
}
