import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Save, User, Building2, Camera, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import PricingPlans from "@/components/PricingPlans";
import { ProfileController } from "@/controllers/profile.controller";
import { UserProfile } from "@/services/profile.service";
import { useProfile } from "@/hooks/useProfile";
import * as currencyCodes from "currency-codes";
import currencySymbolMap from "currency-symbol-map";

// Get all currencies from the package and sort them with popular ones first
const POPULAR_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "SEK",
  "NZD",
  "MXN",
  "SGD",
  "HKD",
  "NOK",
  "TRY",
  "RUB",
  "INR",
  "BRL",
  "ZAR",
  "KRW",
];

const CURRENCIES = [
  // Popular currencies first
  ...POPULAR_CURRENCIES.map((code) => {
    const currency = currencyCodes.code(code);
    return currency
      ? {
          code: currency.code,
          name: currency.currency,
          symbol: currencySymbolMap(currency.code) || currency.code,
        }
      : null;
  }).filter(Boolean),

  // All other currencies
  ...currencyCodes
    .codes()
    .filter((code) => !POPULAR_CURRENCIES.includes(code))
    .map((code) => {
      const currency = currencyCodes.code(code);
      return currency
        ? {
            code: currency.code,
            name: currency.currency,
            symbol: currencySymbolMap(currency.code) || currency.code,
          }
        : null;
    })
    .filter(Boolean),
];

export default function Profile() {
  const { user } = useAuth();
  const { profile, profileLoading, refreshProfile } = useProfile(
    user?.id || null
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    // Business Information
    businessName: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    logoUrl: "",

    // Invoice Settings
    defaultCurrency: "USD",
    defaultTaxRate: 10,
    invoicePrefix: "INV",

    // Bank Information (optional)
    bankName: "",
    accountNumber: "",
    swiftCode: "",
    iban: "",
  });

  // Update profile data when profile from hook changes
  useEffect(() => {
    if (profile) {
      setProfileData({
        businessName: profile.business_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        website: profile.website || "",
        address: profile.address || "",
        logoUrl: profile.logo_url || "",
        defaultCurrency: profile.default_currency || "USD",
        defaultTaxRate: profile.default_tax_rate || 10,
        invoicePrefix: profile.invoice_prefix || "INV",
        bankName: profile.bank_name || "",
        accountNumber: profile.account_number || "",
        swiftCode: profile.swift_code || "",
        iban: profile.iban || "",
      });

      // Set logo preview if logo exists
      if (profile.logo_url) {
        setLogoPreview(profile.logo_url);
      }
    }
  }, [profile]);

  const handleLogoUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !user?.id) return;

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await ProfileController.uploadLogo(user.id, file);
        if (response.success) {
          const logoUrl = response.data?.logo_url || null;
          setLogoPreview(logoUrl);
          setProfileData((prev) => ({
            ...prev,
            logoUrl: logoUrl || "",
          }));
          toast({
            title: "Success",
            description: "Logo uploaded successfully",
          });
        } else {
          toast({
            title: "Error",
            description: response.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error uploading logo:", error);
        toast({
          title: "Error",
          description: "Failed to upload logo",
          variant: "destructive",
        });
      }
    },
    [user?.id]
  );

  const handleInputChange = (field: string, value: string | number) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Check if any banking information is entered to determine if all banking fields are required
  const hasAnyBankingInfo =
    (profileData.bankName && profileData.bankName.trim() !== "") ||
    (profileData.accountNumber && profileData.accountNumber.trim() !== "") ||
    (profileData.swiftCode && profileData.swiftCode.trim() !== "");

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const response = await ProfileController.saveProfile(user.id, {
        business_name: profileData.businessName,
        email: profileData.email,
        phone: profileData.phone,
        website: profileData.website,
        address: profileData.address,
        logo_url: profileData.logoUrl,
        default_currency: profileData.defaultCurrency,
        default_tax_rate: profileData.defaultTaxRate,
        invoice_prefix: profileData.invoicePrefix,
        bank_name: profileData.bankName,
        account_number: profileData.accountNumber,
        swift_code: profileData.swiftCode,
        iban: profileData.iban,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Profile saved successfully",
        });
        // Refresh the profile data in the useProfile hook
        await refreshProfile();
      } else {
        if (response.errors && response.errors.length > 0) {
          const firstError = response.errors[0];
          toast({
            title: "Validation Error",
            description: `${firstError.field}: ${firstError.message}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: response.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state while profile is being loaded
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Business Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your business information and invoice settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Logo */}
        <div className="lg:col-span-1">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Business Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30 overflow-hidden">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Business logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">
                        No logo uploaded
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Upload Logo</Label>
                <div className="relative">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="sr-only"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("logo")?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Logo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: 400x400px, PNG or JPG, max 5MB
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Information */}
        <div className="lg:col-span-2">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Business Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Fields marked with <span className="text-red-500">*</span> are
                required
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    Business Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    value={profileData.businessName}
                    onChange={(e) =>
                      handleInputChange("businessName", e.target.value)
                    }
                    placeholder="Your Business Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Business Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="business@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    placeholder="https://yourbusiness.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Business Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={profileData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter your business address"
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoice Settings */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Invoice Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            These settings have default values and can be customized
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Select
                value={profileData.defaultCurrency}
                onValueChange={(value) =>
                  handleInputChange("defaultCurrency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{currency.symbol}</span>
                        <span>{currency.code}</span>
                        <span className="text-muted-foreground">
                          - {currency.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
              <Input
                id="defaultTaxRate"
                type="number"
                min="0"
                max="100"
                value={profileData.defaultTaxRate}
                onChange={(e) =>
                  handleInputChange("defaultTaxRate", e.target.value)
                }
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
              <Input
                id="invoicePrefix"
                value={profileData.invoicePrefix}
                onChange={(e) =>
                  handleInputChange("invoicePrefix", e.target.value)
                }
                placeholder="INV"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banking Information */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Banking Information
            <span className="text-sm font-normal text-muted-foreground">
              (Optional)
            </span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            This information will be included in your invoices for international
            client payments. If you provide any banking information, all three
            fields (bank name, account number, and SWIFT code) become required.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={profileData.bankName}
                onChange={(e) => handleInputChange("bankName", e.target.value)}
                placeholder="Bank Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">
                Account Number
                {hasAnyBankingInfo && <span className="text-red-500"> *</span>}
              </Label>
              <Input
                id="accountNumber"
                value={profileData.accountNumber}
                onChange={(e) =>
                  handleInputChange("accountNumber", e.target.value)
                }
                placeholder="1234567890"
              />
              {hasAnyBankingInfo && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Required when providing banking information
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="swiftCode">
                SWIFT Code
                {hasAnyBankingInfo && <span className="text-red-500"> *</span>}
              </Label>
              <Input
                id="swiftCode"
                value={profileData.swiftCode}
                onChange={(e) => handleInputChange("swiftCode", e.target.value)}
                placeholder="BOFAUS3N"
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                8-11 character code for international wire transfers
              </p>
              {hasAnyBankingInfo && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Required when providing banking information
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban">IBAN (International)</Label>
              <Input
                id="iban"
                value={profileData.iban}
                onChange={(e) => handleInputChange("iban", e.target.value)}
                placeholder="GB29 NWBK 6016 1331 9268 19"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="bg-primary-gradient hover:opacity-90"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
