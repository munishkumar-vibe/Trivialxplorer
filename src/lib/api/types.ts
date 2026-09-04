// Matches the backend's ApiResponse utility shape
export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T | null;
}

// Matches User.model.js toPublicJSON()
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  dob: string;
  isEmailVerified: boolean;
  role: "user" | "admin";
  createdAt: string;
}

export interface SigninData {
  userAccessToken: string;
  user: PublicUser;
}

export interface SignupData {
  user: PublicUser;
}

export interface MeData {
  user: PublicUser;
}

// Request body types (mirror the backend validators)
export interface SigninPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}
