import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { AuthController } from "@/controllers/auth.controller";
import { ProfileService } from "@/services/profile.service"; // Import ProfileService
import { useProfile } from "@/hooks/useProfile"; // Import useProfile
import ApiKeyManager from "@/components/ApiKeyManager";

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { profile, profileLoading, refetchProfile } = useProfile(user?.id || null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState(profile?.default_currency || "USD");

  // Update selectedCurrency when profile loads or changes
  React.useEffect(() => {
    if (profile && profile.default_currency) {
      setSelectedCurrency(profile.default_currency);
    }
  }, [profile]);

  const handleCurrencyChange = async (value: string) => {
    setSelectedCurrency(value);
    if (!user?.id) {
      toast({ title: "Error", description: "User not logged in.", variant: "destructive" });
      return;
    }

    try {
      const response = await ProfileService.updateProfile(user.id, { default_currency: value });
      if (response.success) {
        toast({ title: "Success", description: "Default currency updated." });
        refetchProfile(); // Re-fetch profile to update context
      } else {
        toast({ title: "Error", description: response.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update default currency.", variant: "destructive" });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await AuthController.updateUserPassword(newPassword);
      if (response.success) {
        toast({ title: "Success", description: response.message });
        setNewPassword("");
        setConfirmNewPassword("");
        setShowChangePasswordDialog(false);
        signOut(); // Log out after password change for security
      } else {
        toast({ title: "Error", description: response.message, variant: "destructive" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const response = await AuthController.deleteUser();
      if (response.success) {
        toast({ title: "Success", description: response.message });
        signOut(); // Log out after deletion
      } else {
        toast({ title: "Error", description: response.message, variant: "destructive" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* General Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="default-currency">Default Currency</Label>
            <Select value={selectedCurrency} onValueChange={handleCurrencyChange} disabled={profileLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - United States Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="BWP">BWP - Botswana Pula</SelectItem>
                {/* Add more currencies as needed */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email-settings">Email Address</Label>
            <Input id="email-settings" type="email" defaultValue={user?.email || "user@example.com"} disabled />
          </div>
          <div>
            <Label htmlFor="password-settings">Password</Label>
            <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Change Password</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your new password. You will be logged out after changing your password.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowChangePasswordDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Separator />
          <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteAccountDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeletingAccount}>
                  {isDeletingAccount ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting...
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* API Key Management */}
      <ApiKeyManager />
    </div>
  );
};

export default Settings;
