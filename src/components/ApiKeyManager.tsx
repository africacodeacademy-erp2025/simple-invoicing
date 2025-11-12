import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiKeyService } from "@/services/apiKey.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ApiKeyManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [keyName, setKeyName] = useState("");
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateApiKey = async () => {
    if (!user || !keyName.trim()) {
      toast({
        title: "Error",
        description: "Key name is required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setNewApiKey(null);

    const response = await ApiKeyService.createApiKey(user.id, keyName.trim());

    setLoading(false);

    if (response.success && response.data) {
      setNewApiKey(response.data.apiKey);
      setKeyName("");
      toast({
        title: "Success",
        description: "API key created successfully. Make sure to copy it now; you won't be able to see it again.",
      });
    } else {
      toast({
        title: "Error",
        description: response.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey);
      toast({
        title: "Copied!",
        description: "API key copied to clipboard.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Create a new API key to access your account programmatically.</p>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter a name for your key"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleCreateApiKey} disabled={loading}>
              {loading ? "Creating..." : "Create New Key"}
            </Button>
          </div>
          {newApiKey && (
            <div className="p-4 mt-4 bg-gray-100 rounded-md">
              <h3 className="font-bold">New API Key Generated</h3>
              <p className="text-sm text-red-600">
                Please copy this key and store it securely. You will not be able to see it again.
              </p>
              <div className="flex items-center justify-between mt-2">
                <code className="text-sm font-mono bg-gray-200 p-2 rounded">{newApiKey}</code>
                <Button onClick={copyToClipboard} size="sm">
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyManager;
