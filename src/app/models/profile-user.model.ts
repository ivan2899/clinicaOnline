export interface ProfileUser {
  first_name: string;
  last_name: string;
  email: string;
  age: number;
  dni: number;
  first_photo_url: string | null;
  role: string;
  is_active: boolean;
  status: string | null;
}