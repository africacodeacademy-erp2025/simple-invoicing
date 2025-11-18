
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
import { Upload, Save, User, Building2, Camera, Loader2, Settings, Banknote } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileController } from "@/controllers/profile.controller";
import { useProfile } from "@/hooks/useProfile";
import * as currencyCodes from "currency-codes";
import currencySymbolMap from "currency-symbol-map";

const POPULAR_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"];
const CURRENCIES = [
  ...POPULAR_CURRENCIES.map((code) => ({
    code,
    name: currencyCodes.code(code)?.currency,
    symbol: currencySymbolMap(code) || code,
  })),
  ...currencyCodes.codes().filter(c => !POPULAR_CURRENCIES.includes(c)).map((code) => ({
    code,
    name: currencyCodes.code(code)?.currency,
    symbol: currencySymbolMap(code) || code,
  })),
].filter(c => c.name);

export default function Profile() {
  const { user } = useAuth();
  const { profile, profileLoading, refreshProfile } = useProfile(user?.id || null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    businessName: "", email: "", phone: "", website: "", address: "", logoUrl: "",
    defaultCurrency: "USD", defaultTaxRate: 10, invoicePrefix: "INV",
    bankName: "", accountNumber: "", swiftCode: "", iban: "",
  });

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
      setLogoPreview(profile.logo_url);
    }
  }, [profile]);

  const handleLogoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      return toast({ title: "File too large", description: "Please upload an image smaller than 2MB", variant: "destructive" });
    }

    try {
      const response = await ProfileController.uploadLogo(user.id, file);
      if (response.success) {
        const url = response.data?.logo_url || null;
        setLogoPreview(url);
        setProfileData(prev => ({ ...prev, logoUrl: url || "" }));
        toast({ title: "Success", description: "Logo uploaded successfully" });
      } else {
      toast({ title: "Error", description: response.message || "Failed to upload logo. Please try again.", variant: "destructive" });
    }
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload logo", variant: "destructive" });
    }
  }, [user?.id]);

  const handleInputChange = (field: string, value: string | number) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const response = await ProfileController.saveProfile(user.id, {
        business_name: profileData.businessName, email: profileData.email, phone: profileData.phone,
        website: profileData.website, address: profileData.address, logo_url: profileData.logoUrl,
        default_currency: profileData.defaultCurrency, default_tax_rate: profileData.defaultTaxRate, 
        invoice_prefix: profileData.invoicePrefix, bank_name: profileData.bankName,
        account_number: profileData.accountNumber, swift_code: profileData.swiftCode, iban: profileData.iban,
      });

      if (response.success) {
        toast({ title: "Success", description: "Profile saved successfully" });
        await refreshProfile();
      } else {
        toast({ title: "Error", description: response.message || "An unexpected error occurred while saving profile.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save profile. Please check your input and try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (profileLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Business Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage your business information and invoice settings.</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Business Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary"/>Business Information</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2"><Label htmlFor="businessName">Business Name</Label><Input id="businessName" value={profileData.businessName} onChange={(e) => handleInputChange("businessName", e.target.value)} placeholder="Your Company"/></div>
                <div className="space-y-2"><Label htmlFor="email">Business Email</Label><Input id="email" type="email" value={profileData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="contact@yourcompany.com"/></div>
                <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" value={profileData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} placeholder="+1 234 567 890"/></div>
                <div className="space-y-2"><Label htmlFor="website">Website</Label><Input id="website" value={profileData.website} onChange={(e) => handleInputChange("website", e.target.value)} placeholder="https://yourcompany.com"/></div>
              </div>
              <div className="space-y-2"><Label htmlFor="address">Business Address</Label><Textarea id="address" value={profileData.address} onChange={(e) => handleInputChange("address", e.target.value)} placeholder="123 Main St, Anytown, USA"/></div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary"/>Invoice Settings</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Currency</Label>
                  <Select value={profileData.defaultCurrency} onValueChange={(v) => handleInputChange("defaultCurrency", v)}>
                    <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.symbol} - {c.code}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="defaultTaxRate">Tax Rate (%)</Label><Input id="defaultTaxRate" type="number" min="0" max="100" value={profileData.defaultTaxRate} onChange={(e) => handleInputChange("defaultTaxRate", e.target.valueAsNumber)} placeholder="0"/></div>
              <div className="space-y-2"><Label htmlFor="invoicePrefix">Invoice Prefix</Label><Input id="invoicePrefix" value={profileData.invoicePrefix} onChange={(e) => handleInputChange("invoicePrefix", e.target.value)} placeholder="INV-"/></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Banknote className="h-5 w-5 text-primary"/>Banking Information</CardTitle>
                <p className="text-sm text-muted-foreground">Optional bank details for your invoices.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2"><Label htmlFor="bankName">Bank Name</Label><Input id="bankName" value={profileData.bankName} onChange={(e) => handleInputChange("bankName", e.target.value)} placeholder="Global Bank"/></div>
                <div className="space-y-2"><Label htmlFor="accountNumber">Account Number</Label><Input id="accountNumber" value={profileData.accountNumber} onChange={(e) => handleInputChange("accountNumber", e.target.value)} placeholder="1234567890"/></div>
                <div className="space-y-2"><Label htmlFor="swiftCode">SWIFT Code</Label><Input id="swiftCode" value={profileData.swiftCode} onChange={(e) => handleInputChange("swiftCode", e.target.value.toUpperCase())} placeholder="GB12ABCD1234567890"/></div>
                <div className="space-y-2"><Label htmlFor="iban">IBAN</Label><Input id="iban" value={profileData.iban} onChange={(e) => handleInputChange("iban", e.target.value)} placeholder="US123456789..."/></div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Logo & Save */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5 text-primary"/>Business Logo</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="w-32 h-32 mx-auto bg-muted rounded-full flex items-center justify-center border-2 border-dashed overflow-hidden">
                {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover"/> : <Building2 className="h-10 w-10 text-muted-foreground"/>}
              </div>
              <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only"/>
              <Button asChild variant="outline">
                 <label htmlFor="logo-upload" className="cursor-pointer w-full"><Upload className="h-4 w-4 mr-2"/>Choose Logo</label>
              </Button>
              <p className="text-xs text-muted-foreground">Max 2MB, JPG/PNG.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Save Changes</CardTitle></CardHeader>
            <CardContent>
              <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2"/>}
                {isSaving ? "Saving..." : "Save All Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
