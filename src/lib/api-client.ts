// SRGG Marketplace - Frontend API Client
// Provides typed API methods for connecting frontend to backend

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | undefined>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl || '';
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return this.token || localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {}, params } = options;

    // Build URL with query params
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const token = this.getToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'REQUEST_FAILED',
            message: data.message || 'Request failed',
          },
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  // ============================================================================
  // Authentication
  // ============================================================================

  async login(email: string, password: string) {
    const response = await this.request<{ user: unknown; token: string }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
    }

    return response;
  }

  async logout() {
    this.setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // ============================================================================
  // Producers
  // ============================================================================

  async getProducers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
  }) {
    return this.request<unknown[]>('/api/producers', { params });
  }

  async getProducer(id: string) {
    return this.request<unknown>(`/api/producers/${id}`);
  }

  async createProducer(data: {
    fullName: string;
    email: string;
    phone: string;
    country: string;
    region: string;
    city: string;
    idType: string;
    idNumber: string;
    producerType: string;
    commodities: string[];
    parcels?: Array<{
      name?: string;
      size: number;
      unit?: string;
      location?: string;
    }>;
  }) {
    return this.request<unknown>('/api/producers', {
      method: 'POST',
      body: data,
    });
  }

  async updateProducer(id: string, data: Record<string, unknown>) {
    return this.request<unknown>(`/api/producers/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async verifyProducer(id: string, status: 'VERIFIED' | 'REJECTED') {
    return this.request<unknown>(`/api/producers/${id}`, {
      method: 'PATCH',
      body: { verificationStatus: status },
    });
  }

  // ============================================================================
  // Listings
  // ============================================================================

  async getListings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    commodityId?: string;
    producerId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }) {
    return this.request<unknown[]>('/api/listings', { params });
  }

  async getListing(id: string) {
    return this.request<unknown>(`/api/listings/${id}`);
  }

  async createListing(data: {
    commodityId: string;
    title: string;
    description?: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    currency?: string;
    location?: Record<string, unknown>;
    images?: string[];
    status?: string;
  }) {
    return this.request<unknown>('/api/listings', {
      method: 'POST',
      body: data,
    });
  }

  async updateListing(id: string, data: Record<string, unknown>) {
    return this.request<unknown>(`/api/listings/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async updateListingStatus(id: string, status: string) {
    return this.request<unknown>(`/api/listings/${id}`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async deleteListing(id: string) {
    return this.request<void>(`/api/listings/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // Orders
  // ============================================================================

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return this.request<unknown[]>('/api/orders', { params });
  }

  async getOrder(id: string) {
    return this.request<unknown>(`/api/orders/${id}`);
  }

  async createOrder(data: {
    listingId: string;
    quantity: number;
    shippingAddress?: Record<string, unknown>;
    notes?: string;
  }) {
    return this.request<unknown>('/api/orders', {
      method: 'POST',
      body: data,
    });
  }

  async updateOrder(id: string, data: Record<string, unknown>) {
    return this.request<unknown>(`/api/orders/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async performOrderAction(id: string, action: 'confirm' | 'ship' | 'deliver' | 'cancel') {
    return this.request<unknown>(`/api/orders/${id}`, {
      method: 'PATCH',
      body: { action },
    });
  }

  async deleteOrder(id: string) {
    return this.request<void>(`/api/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // Payments
  // ============================================================================

  async getPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
    orderId?: string;
  }) {
    return this.request<unknown[]>('/api/payments', { params });
  }

  async createPayment(data: {
    orderId: string;
    amount: number;
    currency?: string;
    method: 'CARD' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CRYPTO' | 'ESCROW';
    metadata?: Record<string, unknown>;
  }) {
    return this.request<unknown>('/api/payments', {
      method: 'POST',
      body: data,
    });
  }

  // ============================================================================
  // Commodities
  // ============================================================================

  async getCommodities() {
    return this.request<unknown[]>('/api/commodities');
  }

  // ============================================================================
  // Tokenization
  // ============================================================================

  async tokenizeListing(listingId: string, tokenType: 'NFT' | 'FUNGIBLE' = 'NFT') {
    return this.request<unknown>('/api/tokenization', {
      method: 'POST',
      body: { listingId, tokenType },
    });
  }

  // ============================================================================
  // Insurance
  // ============================================================================

  async getInsurancePolicies(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    return this.request<unknown[]>('/api/insurance', { params });
  }

  async createInsurancePolicy(data: {
    type: string;
    assetId: string;
    assetType: string;
    coverageAmount: number;
    currency?: string;
    startDate: string;
    endDate: string;
  }) {
    return this.request<unknown>('/api/insurance', {
      method: 'POST',
      body: data,
    });
  }

  // ============================================================================
  // Hedging
  // ============================================================================

  async getHedgePositions(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    return this.request<unknown[]>('/api/hedging', { params });
  }

  async createHedgePosition(data: {
    type: string;
    commodity: string;
    quantity: number;
    unit: string;
    strikePrice: number;
    currency?: string;
    expiryDate: string;
    direction: 'LONG' | 'SHORT';
  }) {
    return this.request<unknown>('/api/hedging', {
      method: 'POST',
      body: data,
    });
  }

  // ============================================================================
  // Dashboard / Analytics
  // ============================================================================

  async getDashboardStats() {
    return this.request<{
      producers: { total: number; verified: number; pending: number };
      listings: { total: number; active: number; value: number };
      orders: { total: number; pending: number; completed: number; revenue: number };
      tokens: { total: number; minted: number };
    }>('/api/dashboard/stats');
  }

  // ============================================================================
  // Health Check
  // ============================================================================

  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/api/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };
export type { ApiResponse, RequestOptions };
