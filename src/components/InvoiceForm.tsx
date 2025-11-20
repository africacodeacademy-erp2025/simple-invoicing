import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Upload, Sparkles, UserPlus, ArrowLeft, ArrowRight } from "lucide-react";
import { InvoiceData, LineItem, currencies } from "@/types/invoice";
import { toast } from "@/hooks/use-toast";
import { ClientService, Client } from "@/services/client.service";
import { UserProfile } from "@/services/profile.service";
import { AIController } from "@/controllers/ai.controller";

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  onUpdateInvoiceData: (data: InvoiceData) => void;
  userId?: string | null;
  profile?: UserProfile | null;
}

// Helper function to calculate next invoice date
const getNextInvoiceDate = (currentDate: string, interval: string): string => {
  const date = new Date(currentDate);

  switch (interval) {
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      return currentDate;
  }

  return date.toISOString().split("T")[0];
};

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoiceData,
  onUpdateInvoiceData,
  userId,
  profile,
}) => {
  const steps = [
    "AI Generator",
    "From & To",
    "Invoice Details",
    "Line Items",
    "Payment Info",
    "Summary",
  ];
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const handleLogoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please upload an image smaller than 2MB",
            variant: "destructive",
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          setLogoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        onUpdateInvoiceData({
          ...invoiceData,
          businessInfo: {
            ...invoiceData.businessInfo,
            logo: file,
          },
        });
      }
    },
    [invoiceData, onUpdateInvoiceData]
  );

  const addLineItem = useCallback(() => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    };

    onUpdateInvoiceData({
      ...invoiceData,
      lineItems: [...invoiceData.lineItems, newItem],
    });
  }, [invoiceData, onUpdateInvoiceData]);

  const updateLineItem = useCallback(
    (id: string, field: keyof LineItem, value: string | number) => {
      const updatedItems = invoiceData.lineItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      });

      onUpdateInvoiceData({
        ...invoiceData,
        lineItems: updatedItems,
      });
    },
    [invoiceData, onUpdateInvoiceData]
  );

  const removeLineItem = useCallback(
    (id: string) => {
      const updatedItems = invoiceData.lineItems.filter(
        (item) => item.id !== id
      );
      onUpdateInvoiceData({
        ...invoiceData,
        lineItems: updatedItems,
      });
    },
    [invoiceData, onUpdateInvoiceData]
  );

  const selectedCurrency = currencies.find(
    (c) => c.code === invoiceData.currency
  );

  const formatNumberForInput = (value: number) =>
    (typeof value === "number" && !isNaN(value)
      ? value
      : 0
    ).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatAmountDisplay = (amount: number) => {
    const value = typeof amount === "number" && !isNaN(amount) ? amount : 0;
    return `${selectedCurrency?.symbol || "$"}${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Keep a preview URL in state and initialize it from invoiceData or profile
  useEffect(() => {
    const logo = invoiceData.businessInfo.logo;
    if (logo) {
      if (typeof logo === "string") {
        setLogoPreview(logo);
      } else if (logo instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => setLogoPreview(e.target?.result as string);
        reader.readAsDataURL(logo);
      } else {
        setLogoPreview(null);
      }
    } else if (profile?.logo_url) {
      setLogoPreview(profile.logo_url);
    } else {
      setLogoPreview(null);
    }
  }, [invoiceData.businessInfo.logo, profile?.logo_url]);

  const goToStep = (i: number) => setCurrentStep(i);

  const nextStep = () => {
    // Basic per-step validation before moving forward
    if (currentStep === 0) {
      if (!invoiceData.businessInfo.name || !invoiceData.clientInfo.name) {
        toast({ title: "Missing fields", description: "Please fill business and client name before continuing.", variant: "destructive" });
        return;
      }
    }

    if (currentStep === 1) {
      if (!invoiceData.invoiceNumber || !invoiceData.date || !invoiceData.dueDate) {
        toast({ title: "Missing fields", description: "Please fill invoice number and dates.", variant: "destructive" });
        return;
      }
    }

    if (currentStep === 2) {
      if (!invoiceData.lineItems || invoiceData.lineItems.length === 0) {
        toast({ title: "No items", description: "Add at least one line item before continuing.", variant: "destructive" });
        return;
      }
    }

    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  // Check if profile is complete (has essential business information)
  const isProfileComplete =
    profile &&
    profile.business_name &&
    profile.email &&
    profile.phone &&
    profile.address;

  // Check if profile has a logo
  const hasProfileLogo = profile && profile.logo_url;

  // Fetch clients when component mounts or userId changes
  useEffect(() => {
    const fetchClients = async () => {
      if (!userId) return;

      setClientsLoading(true);
      try {
        const response = await ClientService.getClients(userId);
        if (response.success && Array.isArray(response.data)) {
          setClients(response.data);
        } else {
          toast({
            title: "Error",
            description: response.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Error",
          description: "Failed to fetch clients",
          variant: "destructive",
        });
      } finally {
        setClientsLoading(false);
      }
    };

    fetchClients();
  }, [userId]);

  // Handle client selection
  const handleClientSelect = useCallback(
    (clientId: string) => {
      setSelectedClientId(clientId);
      const selectedClient = clients.find((client) => client.id === clientId);

      if (selectedClient) {
        onUpdateInvoiceData({
          ...invoiceData,
          clientInfo: {
            name: selectedClient.name,
            email: selectedClient.email,
            address: selectedClient.address || "",
          },
        });
      }
    },
    [clients, invoiceData, onUpdateInvoiceData]
  );

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Missing Description",
        description: "Please describe your invoice details.",
        variant: "destructive",
      });
      return;
    }

    setAiGenerating(true);
    try {
      const response = await AIController.generateInvoiceFromDescription({
        prompt: aiPrompt,
        businessName: profile?.business_name,
        businessEmail: profile?.email,
        businessPhone: profile?.phone,
        businessAddress: profile?.address,
      });

      if (response.success && response.data) {
        // Reset the invoice data with AI-generated content (replace existing data)
        const newInvoiceData: InvoiceData = {
          ...invoiceData,
          businessInfo: {
            name: response.data.businessInfo.name,
            email: response.data.businessInfo.email,
            phone: response.data.businessInfo.phone,
            address: response.data.businessInfo.address,
            logo: invoiceData.businessInfo.logo, // Keep existing logo
          },
          clientInfo: {
            name: response.data.clientInfo.name,
            email: response.data.clientInfo.email,
            address: response.data.clientInfo.address,
          },
          lineItems: response.data.lineItems, // Replace all line items with new ones
          invoiceNumber: response.data.invoiceDetails.invoiceNumber,
          date: response.data.invoiceDetails.issueDate,
          dueDate: response.data.invoiceDetails.dueDate,
          currency: response.data.invoiceDetails.currency,
          taxRate: response.data.invoiceDetails.taxRate,
          discountRate: response.data.invoiceDetails.discountRate,
          notes: response.data.invoiceDetails.notes,
        };

        onUpdateInvoiceData(newInvoiceData);

        toast({
          title: "AI Invoice Generated!",
          description: `Generated ${response.data.lineItems.length} line items and filled invoice details.`,
        });

        // Keep the prompt so user can edit and regenerate
      } else {
        toast({
          title: "Generation Failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating AI invoice:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stepper navigation */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {steps.map((label, i) => (
            <Button
              key={i}
              type="button"
              onClick={() => goToStep(i)}
              variant={currentStep === i ? "default" : "ghost"}
              size="sm"
              className={
                currentStep === i
                  ? "font-semibold shadow-md border border-primary"
                  : "font-normal text-muted-foreground"
              }
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      {/* Step 0: AI Invoice Generator */}
      {currentStep === 0 && (
        <Card className={`shadow-soft border-primary/20 bg-gradient-to-br from-primary/5 to-transparent transition-all duration-500 ${aiGenerating ? "ring-2 ring-primary/30 shadow-lg scale-[1.02]" : ""}`}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-3">
              <div className="relative">
                <Sparkles className={`h-5 w-5 text-primary transition-all duration-300 ${aiGenerating ? "animate-pulse" : ""}`} />
                {aiGenerating && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
                )}
              </div>
              <span className={aiGenerating ? "animate-pulse" : ""}>AI Invoice Generator</span>
              {aiGenerating && (
                <div className="flex items-center gap-1 ml-auto">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aiPrompt" className="flex items-center gap-2">
                Describe your invoice
                {aiGenerating && (
                  <span className="text-xs text-primary font-medium animate-pulse">AI is analyzing...</span>
                )}
              </Label>
              <div className="relative">
                <Textarea
                  id="aiPrompt"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Example: Create an invoice for web design services for Acme Corp. 3 pages at $500 each, logo design for $300, 10% tax, due in 30 days. Client is John Smith at john@acme.com, 123 Business St, New York..."
                  className={`min-h-[100px] transition-all duration-300 ${aiGenerating ? "ring-2 ring-primary/20 bg-primary/5" : ""}`}
                  disabled={aiGenerating}
                />
                {aiGenerating && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleAIGenerate}
              disabled={!aiPrompt.trim() || aiGenerating}
              className={`w-full transition-all duration-300 ${aiGenerating ? "bg-primary/80 cursor-not-allowed" : "bg-primary-gradient hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"}`}
            >
              {aiGenerating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
                    <div className="absolute inset-0 animate-ping rounded-full h-4 w-4 border border-primary/30" />
                  </div>
                  <span className="animate-pulse">AI is working...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Invoice with AI</span>
                </div>
              )}
            </Button>

            {aiGenerating && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="font-medium">AI is processing your request...</span>
                </div>
                <div className="mt-2 text-xs text-primary/70">This may take a few moments while we generate your professional invoice.</div>
              </div>
            )}

            <div className={`text-xs text-muted-foreground transition-opacity duration-300 ${aiGenerating ? "opacity-50" : "opacity-100"}`}>
              <p className="font-medium mb-1">💡 Tips for better results:</p>
              <ul className="space-y-1 ml-4">
                <li>• Mention client name</li>
                <li>• Describe services/products with quantities and rates</li>
                <li>• Include tax rates, discounts, and payment terms</li>
                <li>• Specify currency if not USD</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Business Information</CardTitle>
          {isProfileComplete && (
            <p className="text-sm text-muted-foreground">
              Your business information is complete. You can change the logo below.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo">Company Logo</Label>
            <div className="flex items-center gap-4">
              <div className="relative flex items-center gap-2">
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
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </Button>
                {logoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setLogoPreview(null);
                      onUpdateInvoiceData({
                        ...invoiceData,
                        businessInfo: { ...invoiceData.businessInfo, logo: null },
                      });
                    }}
                    className="text-sm"
                  >
                    Remove
                  </Button>
                )}
              </div>
              {logoPreview && (
                <div className="w-16 h-16 rounded-lg overflow-hidden border shadow-soft">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain bg-background"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Business Information Fields - Only show if profile is incomplete */}
          {!isProfileComplete && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={invoiceData.businessInfo.name}
                  onChange={(e) =>
                    onUpdateInvoiceData({
                      ...invoiceData,
                      businessInfo: {
                        ...invoiceData.businessInfo,
                        name: e.target.value,
                      },
                    })
                  }
                  placeholder="Your Business Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessEmail">Email</Label>
                <Input
                  id="businessEmail"
                  type="email"
                  value={invoiceData.businessInfo.email}
                  onChange={(e) =>
                    onUpdateInvoiceData({
                      ...invoiceData,
                      businessInfo: {
                        ...invoiceData.businessInfo,
                        email: e.target.value,
                      },
                    })
                  }
                  placeholder="business@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessPhone">Phone</Label>
                <Input
                  id="businessPhone"
                  value={invoiceData.businessInfo.phone}
                  onChange={(e) =>
                    onUpdateInvoiceData({
                      ...invoiceData,
                      businessInfo: {
                        ...invoiceData.businessInfo,
                        phone: e.target.value,
                      },
                    })
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">Address</Label>
                <Textarea
                  id="businessAddress"
                  value={invoiceData.businessInfo.address}
                  onChange={(e) =>
                    onUpdateInvoiceData({
                      ...invoiceData,
                      businessInfo: {
                        ...invoiceData.businessInfo,
                        address: e.target.value,
                      },
                    })
                  }
                  placeholder="123 Business St, City, State 12345"
                  className="min-h-[80px]"
                />
              </div>
            </div>
          )}
        </CardContent>
        </Card>
      )}

      {currentStep === 0 && (
      <>
      {/* Client Information */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientSelect">Select Client</Label>
            <Select
              value={selectedClientId}
              onValueChange={handleClientSelect}
              disabled={clientsLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    clientsLoading
                      ? "Loading clients..."
                      : clients.length === 0
                      ? "No clients found. Add clients first."
                      : "Choose a client"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id!}>
                    <div className="flex flex-col">
                      <span className="font-medium">{client.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {client.email}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {clients.length === 0 && !clientsLoading && (
              <p className="text-sm text-muted-foreground">
                No clients found.{" "}
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => window.open("/app/clients", "_blank")}
                  className="p-0 h-auto text-primary"
                >
                  Add your first client
                </Button>
              </p>
            )}
          </div>

          {/* Display selected client info */}
          {selectedClientId && (
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                Selected Client Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="text-sm font-medium">
                    {invoiceData.clientInfo.name}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm">{invoiceData.clientInfo.email}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs text-muted-foreground">
                    Address
                  </Label>
                  <p className="text-sm whitespace-pre-line">
                    {invoiceData.clientInfo.address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Manual client entry option */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Don't see your client? You can still enter details manually below
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={invoiceData.clientInfo.name}
                onChange={(e) =>
                  onUpdateInvoiceData({
                    ...invoiceData,
                    clientInfo: {
                      ...invoiceData.clientInfo,
                      name: e.target.value,
                    },
                  })
                }
                placeholder="Client Name or Company"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={invoiceData.clientInfo.email}
                onChange={(e) =>
                  onUpdateInvoiceData({
                    ...invoiceData,
                    clientInfo: {
                      ...invoiceData.clientInfo,
                      email: e.target.value,
                    },
                  })
                }
                placeholder="client@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientAddress">Client Address</Label>
            <Textarea
              id="clientAddress"
              value={invoiceData.clientInfo.address}
              onChange={(e) =>
                onUpdateInvoiceData({
                  ...invoiceData,
                  clientInfo: {
                    ...invoiceData.clientInfo,
                    address: e.target.value,
                  },
                })
              }
              placeholder="123 Client St, City, State 12345"
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>
      </>
      )}

      {currentStep === 1 && (
      <>
      {/* Invoice Details */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={(e) =>
                  onUpdateInvoiceData({
                    ...invoiceData,
                    invoiceNumber: e.target.value,
                  })
                }
                placeholder="INV-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Issue Date</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceData.date}
                onChange={(e) =>
                  onUpdateInvoiceData({
                    ...invoiceData,
                    date: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) =>
                  onUpdateInvoiceData({
                    ...invoiceData,
                    dueDate: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={invoiceData.currency}
              onValueChange={(value) =>
                onUpdateInvoiceData({
                  ...invoiceData,
                  currency: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>

      </Card>

      {/* Recurring Invoice */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Recurring Invoice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="isRecurring">Recurring Invoice</Label>
              <p className="text-sm text-muted-foreground">
                Enable if this invoice will be sent regularly
              </p>
            </div>
            <Switch
              id="isRecurring"
              checked={invoiceData.isRecurring}
              onCheckedChange={(checked) =>
                onUpdateInvoiceData({
                  ...invoiceData,
                  isRecurring: checked,
                })
              }
            />
          </div>

          {invoiceData.isRecurring && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recurringInterval">Recurring Interval</Label>
                <Select
                  value={invoiceData.recurringInterval}
                  onValueChange={(
                    value: "weekly" | "monthly" | "quarterly" | "yearly"
                  ) =>
                    onUpdateInvoiceData({
                      ...invoiceData,
                      recurringInterval: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">
                      Next Invoice Date
                    </p>
                    <p className="text-sm text-blue-700">
                      {getNextInvoiceDate(
                        invoiceData.date,
                        invoiceData.recurringInterval
                      )}
                    </p>
                    <p className="text-xs text-blue-600">
                      This invoice will be automatically generated and sent on
                      this date
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </>
      )}

      {/* Line Items */}
      {currentStep === 2 && (
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Line Items</CardTitle>
          <Button onClick={addLineItem} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoiceData.lineItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items added yet. Click "Add Item" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoiceData.lineItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg"
                >
                  <div className="md:col-span-4 space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, "description", e.target.value)
                      }
                      placeholder="Service or product description"
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(
                          item.id,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="text-center"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Rate ({selectedCurrency?.symbol})</Label>
                    <Input
                      type="text"
                      value={formatNumberForInput(item.rate)}
                      onChange={(e) => {
                        // remove any non-numeric characters except dot and minus
                        const raw = e.target.value.replace(/[^0-9.\-]/g, "");
                        const parsed = parseFloat(raw);
                        updateLineItem(item.id, "rate", Number.isNaN(parsed) ? 0 : parsed);
                      }}
                    />
                  </div>

                  <div className="md:col-span-3 space-y-2">
                    <Label>Amount</Label>
                    <div className="h-9 px-3 py-2 bg-muted rounded-md flex items-center text-sm overflow-hidden">
                      <span className="truncate">{formatAmountDisplay(item.amount)}</span>
                    </div>
                  </div>

                  <div className="md:col-span-1 flex items-center justify-center">
                    <Button
                      onClick={() => removeLineItem(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {currentStep === 3 && (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Payment Information:</CardTitle>
          <p className="text-sm text-muted-foreground">
            This information will be included in your invoices for international
            client payments. If you provide any banking information, the
            relevant fields become required.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name:</Label>
              <Input
                id="bankName"
                value={invoiceData.bankingInfo.bankName}
                onChange={(e) =>
                  onUpdateInvoiceData({
                    ...invoiceData,
                    bankingInfo: {
                      ...invoiceData.bankingInfo,
                      bankName: e.target.value,
                    },
                  })
                }
                placeholder="Bank Name"
              />
              {!invoiceData.bankingInfo.bankName && (
                <p className="text-xs text-red-500">Must be at least 1 character</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name:</Label>
              <Input
                id="accountName"
                value={invoiceData.bankingInfo.accountName}
                onChange={(e) =>
                  onUpdateInvoiceData({
                    ...invoiceData,
                    bankingInfo: {
                      ...invoiceData.bankingInfo,
                      accountName: e.target.value,
                    },
                  })
                }
                placeholder="Account Name"
              />
              {!invoiceData.bankingInfo.accountName && (
                <p className="text-xs text-red-500">Must be at least 1 character</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="accountNumber">Account Number:</Label>
              <Input
                id="accountNumber"
                value={invoiceData.bankingInfo.accountNumber}
                onChange={(e) =>
                  onUpdateInvoiceData({
                    ...invoiceData,
                    bankingInfo: {
                      ...invoiceData.bankingInfo,
                      accountNumber: e.target.value,
                    },
                  })
                }
                placeholder="Account Number"
              />
              {!invoiceData.bankingInfo.accountNumber && (
                <p className="text-xs text-red-500">Must be at least 1 character</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="swiftCode">SWIFT Code</Label>
              <Input
                id="swiftCode"
                value={invoiceData.bankingInfo.swiftCode}
                onChange={(e) =>
                  onUpdateInvoiceData({
                    ...invoiceData,
                    bankingInfo: {
                      ...invoiceData.bankingInfo,
                      swiftCode: e.target.value,
                    },
                  })
                }
                placeholder="BOFAUS3N"
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">8-11 character code for international wire transfers</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban">IBAN (International)</Label>
              <Input
                id="iban"
                value={invoiceData.bankingInfo.iban}
                onChange={(e) =>
                  onUpdateInvoiceData({
                    ...invoiceData,
                    bankingInfo: {
                      ...invoiceData.bankingInfo,
                      iban: e.target.value,
                    },
                  })
                }
                placeholder="GB29 NWBK 6016 1331 9268 19"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {currentStep === 4 && (
      <>
      {/* Tax & Discount */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Tax & Discount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={invoiceData.taxRate}
                onChange={(e) =>
                  onUpdateInvoiceData({
                    ...invoiceData,
                    taxRate: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountRate">Discount (%)</Label>
              <Input
                id="discountRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={invoiceData.discountRate}
                onChange={(e) =>
                  onUpdateInvoiceData({
                    ...invoiceData,
                    discountRate: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={invoiceData.notes}
              onChange={(e) =>
                onUpdateInvoiceData({
                  ...invoiceData,
                  notes: e.target.value,
                })
              }
              placeholder="Thank you for your business!"
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>
      </>
      )}

      <div className="flex items-center justify-end gap-3 mt-4">
        <Button variant="outline" onClick={prevStep} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button onClick={nextStep} className="flex items-center gap-2 bg-primary">
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

    </div>
  );
};
