import {
  User,
  Listing,
  PriceEstimateResponse,
  FarmVisit,
  Notification,
  ModerationStats,
  AuditLogItem,
  PanchayatItem
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('pashusetu_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async login(phone_or_email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_or_email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed. Please check credentials.');
    }
    return res.json();
  },

  async register(data: any): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed.');
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  async assistedRegister(data: any): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/assisted-register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Assisted registration failed.');
    }
    return res.json();
  },

  async getAssistedFarmers(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/auth/assisted-farmers`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Listings
  async getListings(params: Record<string, any> = {}): Promise<Listing[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v));
      }
    });

    const res = await fetch(`${API_BASE}/listings?${searchParams.toString()}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch listings');
    return res.json();
  },

  async getListing(id: number, lat?: number, lon?: number): Promise<Listing> {
    let url = `${API_BASE}/listings/${id}`;
    if (lat && lon) url += `?latitude=${lat}&longitude=${lon}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Listing not found');
    return res.json();
  },

  async createListing(data: any, target_farmer_id?: number): Promise<Listing> {
    let url = `${API_BASE}/listings`;
    if (target_farmer_id) url += `?target_farmer_id=${target_farmer_id}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create listing');
    }
    return res.json();
  },

  async updateListing(id: number, data: any): Promise<Listing> {
    const res = await fetch(`${API_BASE}/listings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update listing');
    return res.json();
  },

  async deleteListing(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/listings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete listing');
  },

  async flagListing(id: number, reason: string): Promise<any> {
    const res = await fetch(`${API_BASE}/listings/${id}/flag?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to flag listing');
    return res.json();
  },

  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('pashusetu_token');
    const res = await fetch(`${API_BASE}/listings/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload file');
    return res.json();
  },

  // Price Estimator
  async calculatePrice(data: any): Promise<PriceEstimateResponse> {
    const res = await fetch(`${API_BASE}/price-estimator/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to estimate price');
    return res.json();
  },

  async getSupportedBreeds(): Promise<Record<string, string[]>> {
    const res = await fetch(`${API_BASE}/price-estimator/supported-breeds`);
    if (!res.ok) throw new Error('Failed to load breed catalog');
    return res.json();
  },

  // Farm Visits
  async requestVisit(listing_id: number, proposed_date: string, time_slot: string, buyer_notes?: string): Promise<FarmVisit> {
    const res = await fetch(`${API_BASE}/visits`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ listing_id, proposed_date, time_slot, buyer_notes })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to request farm visit');
    }
    return res.json();
  },

  async getVisits(): Promise<FarmVisit[]> {
    const res = await fetch(`${API_BASE}/visits`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  async updateVisitStatus(id: number, status: string, seller_notes?: string): Promise<FarmVisit> {
    const res = await fetch(`${API_BASE}/visits/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, seller_notes })
    });
    if (!res.ok) throw new Error('Failed to update visit status');
    return res.json();
  },

  // Favorites
  async getFavorites(): Promise<Listing[]> {
    const res = await fetch(`${API_BASE}/favorites`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  async getFavoriteIds(): Promise<number[]> {
    const res = await fetch(`${API_BASE}/favorites/ids`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  async toggleFavorite(listingId: number): Promise<{ favorited: boolean }> {
    const res = await fetch(`${API_BASE}/favorites/${listingId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to toggle favorite');
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  async markNotificationRead(id: number): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  },

  // Moderation
  async getModerationStats(): Promise<ModerationStats> {
    const res = await fetch(`${API_BASE}/moderation/stats`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load moderation stats');
    return res.json();
  },

  async getModerationQueue(): Promise<Listing[]> {
    const res = await fetch(`${API_BASE}/moderation/queue`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  async takeModerationAction(id: number, action: string, reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/moderation/listings/${id}/action`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, reason })
    });
    if (!res.ok) throw new Error('Moderation action failed');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    const res = await fetch(`${API_BASE}/moderation/audit-logs`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  async verifyUser(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/moderation/users/${id}/verify`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('User verification failed');
    return res.json();
  },

  // Panchayats
  async getDistricts(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/panchayats/districts`);
    if (!res.ok) return [];
    return res.json();
  },

  async getPanchayats(district: string): Promise<PanchayatItem[]> {
    const res = await fetch(`${API_BASE}/panchayats/${encodeURIComponent(district)}/panchayats`);
    if (!res.ok) return [];
    return res.json();
  }
};
