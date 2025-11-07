export interface Resource {
  id?: number;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface ResourceFilters {
  name?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'archived';
  created_at?: string; // Format: YYYY-MM-DD
  search?: string;
}

export interface CreateResourceDTO {
  name: string;
  description: string;
  category: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface UpdateResourceDTO {
  name?: string;
  description?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'archived';
}
