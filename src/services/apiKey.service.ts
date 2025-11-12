import { supabase } from "@/lib/supabase";
import { ErrorService } from "./error.service";

export interface ApiKeyServiceResponse {
  success: boolean;
  data?: {
    apiKey: string;
    record: any;
  };
  message: string;
  error?: string;
}

export class ApiKeyService {
  /**
   * Create a new API key for a user
   */
  static async createApiKey(
    userId: string,
    keyName: string
  ): Promise<ApiKeyServiceResponse> {
    try {
      // Generate a random API key
      const apiKey = `ecp_${crypto.randomUUID().replace(/-/g, "")}`;

      // Hash the API key for secure storage
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedKey = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Save the hashed key to the database
      const { data: record, error } = await supabase
        .from("api_keys")
        .insert({
          user_id: userId,
          key_name: keyName,
          hashed_key: hashedKey,
        })
        .select()
        .single();

      if (error) {
        ErrorService.logError("ApiKeyService.createApiKey", error);
        return {
          success: false,
          message: "Failed to create API key",
          error: error.message,
        };
      }

      return {
        success: true,
        data: { apiKey, record },
        message: "API key created successfully",
      };
    } catch (error) {
      ErrorService.logError("ApiKeyService.createApiKey", error);
      return {
        success: false,
        message: "An unexpected error occurred while creating the API key",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
