import { supabase } from "@/lib/supabase";
import { User, Session, AuthError } from "@supabase/supabase-js";

export interface SignUpData {
  email: string;
  password: string;
  userData?: {
    first_name?: string;
    last_name?: string;
    company?: string;
  };
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse<T = any> {
  data: T | null;
  error: AuthError | null;
  success: boolean;
  message?: string;
}

export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  static async signUp({
    email,
    password,
    userData,
  }: SignUpData): Promise<AuthResponse<{ user: User; session: Session }>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        return {
          data: null,
          error,
          success: false,
          message: this.getErrorMessage(error),
        };
      }

      return {
        data: {
          user: data.user!,
          session: data.session!,
        },
        error: null,
        success: true,
        message:
          "Account created successfully. Please check your email to verify your account.",
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
        success: false,
        message: "An unexpected error occurred during sign up.",
      };
    }
  }

  /**
   * Sign in a user with email and password
   */
  static async signIn({
    email,
    password,
  }: SignInData): Promise<AuthResponse<{ user: User; session: Session }>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          data: null,
          error,
          success: false,
          message: this.getErrorMessage(error),
        };
      }

      return {
        data: {
          user: data.user!,
          session: data.session!,
        },
        error: null,
        success: true,
        message: "Successfully signed in.",
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
        success: false,
        message: "An unexpected error occurred during sign in.",
      };
    }
  }

  static async signInWithGoogle(): Promise<any> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) {
        return {
          data: null,
          error,
          success: false,
          message: this.getErrorMessage(error),
        };
      }

      return {
        data,
        error: null,
        success: true,
        message: "Successfully signed in with Google.",
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
        success: false,
        message: "An unexpected error occurred during Google sign in.",
      };
    }
  }

  static async signInWithFacebook(): Promise<any> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
      });

      if (error) {
        return {
          data: null,
          error,
          success: false,
          message: this.getErrorMessage(error),
        };
      }

      return {
        data,
        error: null,
        success: true,
        message: "Successfully signed in with Facebook.",
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
        success: false,
        message: "An unexpected error occurred during Facebook sign in.",
      };
    }
  }


  /**
   * Sign out the current user
   */
  static async signOut(): Promise<AuthResponse<null>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          data: null,
          error,
          success: false,
          message: this.getErrorMessage(error),
        };
      }

      return {
        data: null,
        error: null,
        success: true,
        message: "Successfully signed out.",
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
        success: false,
        message: "An unexpected error occurred during sign out.",
      };
    }
  }

  /**
   * Get the current user
   */
  static async getCurrentUser(): Promise<AuthResponse<{ user: User }>> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        return {
          data: null,
          error,
          success: false,
          message: this.getErrorMessage(error),
        };
      }

      return {
        data: { user: user! },
        error: null,
        success: true,
        message: "User retrieved successfully.",
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
        success: false,
        message: "An unexpected error occurred while getting user.",
      };
    }
  }

  /**
   * Get the current session
   */
  static async getCurrentSession(): Promise<
    AuthResponse<{ session: Session }>
  > {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        return {
          data: null,
          error,
          success: false,
          message: this.getErrorMessage(error),
        };
      }

      return {
        data: { session: session! },
        error: null,
        success: true,
        message: "Session retrieved successfully.",
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
        success: false,
        message: "An unexpected error occurred while getting session.",
      };
    }
  }

  /**
   * Listen to authentication state changes
   */
  static onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Get user-friendly error message from AuthError
   */
  private static getErrorMessage(error: AuthError): string {
    switch (error.message) {
      case "Invalid login credentials":
        return "Invalid email or password. Please check your credentials and try again.";
      case "Email not confirmed":
        return "Please check your email and click the confirmation link before signing in.";
      case "User already registered":
        return "An account with this email already exists. Please sign in instead.";
      case "Password should be at least 6 characters":
        return "Password must be at least 6 characters long.";
      case "Unable to validate email address: invalid format":
        return "Please enter a valid email address.";
      case "Signup is disabled":
        return "Account creation is currently disabled. Please contact support.";
      case "Email rate limit exceeded":
        return "Too many requests. Please wait a moment before trying again.";
      default:
        return (
          error.message || "An unexpected error occurred. Please try again."
        );
    }
  }
}
