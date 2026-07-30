export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
}
