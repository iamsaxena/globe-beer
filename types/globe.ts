export type Role = "Owner" | "Admin" | "Member" | "Viewer";

export type BusinessLead = {
  name: string;
  category: string;
  address: string;
  district: string;
  state: string;
  country: string;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  linkedin_company_page?: string | null;
  google_maps_link?: string | null;
  rating?: number | null;
  review_count?: number | null;
  business_status?: string | null;
};
