import {
  AuthService,
  SignUpData,
  SignInData,
  AuthResponse,
} from "@/services/auth.service";
import { User, Session } from "@supabase/supabase-js";

export interface AuthControllerResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export class AuthController {
  /**
   * Handle user sign up
   */
  static async signUp(
    signUpData: SignUpData
  ): Promise<AuthControllerResponse<{ user: User; session: Session }>> {
    try {
      // Validate input data
      const validation = this.validateSignUpData(signUpData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          error: "VALIDATION_ERROR",
        };
      }

      // Call service
      const response = await AuthService.signUp(signUpData);

      if (!response.success) {
        return {
          success: false,
          message: response.message || "Sign up failed",
          error: response.error?.message,
        };
      }

      return {
        success: true,
        data: response.data!,
        message: response.message!,
      };
    } catch (error) {
      console.error("AuthController.signUp error:", error);
      return {
        success: false,
        message: "An unexpected error occurred during sign up",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Handle user sign in
   */
  static async signIn(
    signInData: SignInData
  ): Promise<AuthControllerResponse<{ user: User; session: Session }>> {
    try {
      // Validate input data
      const validation = this.validateSignInData(signInData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          error: "VALIDATION_ERROR",
        };
      }

      // Call service
      const response = await AuthService.signIn(signInData);

      if (!response.success) {
        return {
          success: false,
          message: response.message || "Sign in failed",
          error: response.error?.message,
        };
      }

      return {
        success: true,
        data: response.data!,
        message: response.message!,
      };
    } catch (error) {
      console.error("AuthController.signIn error:", error);
      return {
        success: false,
        message: "An unexpected error occurred during sign in",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async signInWithGoogle(): Promise<any> {
    try {
      const response = await AuthService.signInWithGoogle();
      if (!response.success) {
        return {
          success: false,
          message: response.message || "Sign in with Google failed",
          error: response.error?.message,
        };
      }
      return {
        success: true,
        data: response.data,
        message: "Successfully signed in with Google",
      };
    } catch (error) {
      console.error("AuthController.signInWithGoogle error:", error);
      return {
        success: false,
        message: "An unexpected error occurred during Google sign in",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async signInWithFacebook(): Promise<any> {
    try {
      const response = await AuthService.signInWithFacebook();
      if (!response.success) {
        return {
          success: false,
          message: response.message || "Sign in with Facebook failed",
          error: response.error?.message,
        };
      }
      return {
        success: true,
        data: response.data,
        message: "Successfully signed in with Facebook",
      };
    } catch (error) {
      console.error("AuthController.signInWithFacebook error:", error);
      return {
        success: false,
        message: "An unexpected error occurred during Facebook sign in",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }


  /**
   * Handle user sign out
   */
  static async signOut(): Promise<AuthControllerResponse<null>> {
    try {
      // Call service
      const response = await AuthService.signOut();

      if (!response.success) {
        return {
          success: false,
          message: response.message || "Sign out failed",
          error: response.error?.message,
        };
      }

      return {
        success: true,
        data: null,
        message: response.message!,
      };
    } catch (error) {
      console.error("AuthController.signOut error:", error);
      return {
        success: false,
        message: "An unexpected error occurred during sign out",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<
    AuthControllerResponse<{ user: User }>
  > {
    try {
      const response = await AuthService.getCurrentUser();

      if (!response.success) {
        return {
          success: false,
          message: response.message || "Failed to get current user",
          error: response.error?.message,
        };
      }

      return {
        success: true,
        data: response.data!,
        message: response.message!,
      };
    } catch (error) {
      console.error("AuthController.getCurrentUser error:", error);
      return {
        success: false,
        message: "An unexpected error occurred while getting current user",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update user password
   */
  static async updateUserPassword(password: string): Promise<AuthControllerResponse<null>> {
    try {
      const response = await AuthService.updateUserPassword(password);
      if (!response.success) {
        return {
          success: false,
          message: response.message || "Failed to update password",
          error: response.error?.message,
        };
      }
      return {
        success: true,
        data: null,
        message: response.message!,
      };
    } catch (error) {
      console.error("AuthController.updateUserPassword error:", error);
      return {
        success: false,
        message: "An unexpected error occurred during password update",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete user account
   */
  static async deleteUser(): Promise<AuthControllerResponse<null>> {
    try {
      const response = await AuthService.deleteUser();
      if (!response.success) {
        return {
          success: false,
          message: response.message || "Failed to delete account",
          error: response.error?.message,
        };
      }
      return {
        success: true,
        data: null,
        message: response.message!,
      };
    } catch (error) {
      console.error("AuthController.deleteUser error:", error);
      return {
        success: false,
        message: "An unexpected error occurred during account deletion",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get current session
   */
  static async getCurrentSession(): Promise<
    AuthControllerResponse<{ session: Session }>
  > {
    try {
      const response = await AuthService.getCurrentSession();

      if (!response.success) {
        return {
          success: false,
          message: response.message || "Failed to get current session",
          error: response.error?.message,
        };
      }

      return {
        success: true,
        data: response.data!,
        message: response.message!,
      };
    } catch (error) {
      console.error("AuthController.getCurrentSession error:", error);
      return {
        success: false,
        message: "An unexpected error occurred while getting current session",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Validate sign up data
   */
  private static validateSignUpData(data: SignUpData): {
    isValid: boolean;
    message: string;
  } {
    if (!data.email || !data.password) {
      return {
        isValid: false,
        message: "Email and password are required",
      };
    }

    if (!this.isValidEmail(data.email)) {
      return {
        isValid: false,
        message: "Please enter a valid email address",
      };
    }

    if (data.password.length < 6) {
      return {
        isValid: false,
        message: "Password must be at least 6 characters long",
      };
    }

    if (
      data.userData?.first_name &&
      data.userData.first_name.trim().length === 0
    ) {
      return {
        isValid: false,
        message: "First name cannot be empty",
      };
    }

    if (
      data.userData?.last_name &&
      data.userData.last_name.trim().length === 0
    ) {
      return {
        isValid: false,
        message: "Last name cannot be empty",
      };
    }

    return {
      isValid: true,
      message: "Validation passed",
    };
  }

  /**
   * Validate sign in data
   */
  private static validateSignInData(data: SignInData): {
    isValid: boolean;
    message: string;
  } {
    if (!data.email || !data.password) {
      return {
        isValid: false,
        message: "Email and password are required",
      };
    }

    if (!this.isValidEmail(data.email)) {
      return {
        isValid: false,
        message: "Please enter a valid email address",
      };
    }

    return {
      isValid: true,
      message: "Validation passed",
    };
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
