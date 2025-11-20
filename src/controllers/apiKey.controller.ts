import { ApiKeyService } from "@/services/apiKey.service";
import { Request, Response } from "express";

export class ApiKeyController {
  /**
   * Create a new API key
   */
  static async createApiKey(req: Request, res: Response) {
    try {
      const { userId, keyName } = req.body;

      if (!userId || !keyName) {
        return res
          .status(400)
          .json({ success: false, message: "User ID and key name are required" });
      }

      const response = await ApiKeyService.createApiKey(userId, keyName);

      if (!response.success) {
        return res
          .status(500)
          .json({ success: false, message: response.message, error: response.error });
      }

      return res.status(201).json(response);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
