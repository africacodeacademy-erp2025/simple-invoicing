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
import { Plus, Trash2, Upload, Sparkles, UserPlus } from "lucide-react";
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
      {/* AI Invoice Generator */}
      <Card
        className={`shadow-soft border-primary/20 bg-gradient-to-br from-primary/5 to-transparent transition-all duration-500 ${
          aiGenerating ? "ring-2 ring-primary/30 shadow-lg scale-[1.02]" : ""
        }`}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-3">
            <div className="relative">
              <Sparkles
                className={`h-5 w-5 text-primary transition-all duration-300 ${
                  aiGenerating ? "animate-pulse" : ""
                }`}
              />
              {aiGenerating && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
              )}
            </div>
            <span className={aiGenerating ? "animate-pulse" : ""}>
              AI Invoice Generator
            </span>
            {aiGenerating && (
              <div className="flex items-center gap-1 ml-auto">
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aiPrompt" className="flex items-center gap-2">
              Describe your invoice
              {aiGenerating && (
                <span className="text-xs text-primary font-medium animate-pulse">
                  AI is analyzing...
                </span>
              )}
            </Label>
            <div className="relative">
              <Textarea
                id="aiPrompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Example: Create an invoice for web design services for Acme Corp. 3 pages at $500 each, logo design for $300, 10% tax, due in 30 days. Client is John Smith at john@acme.com, 123 Business St, New York..."
                className={`min-h-[100px] transition-all duration-300 ${
                  aiGenerating ? "ring-2 ring-primary/20 bg-primary/5" : ""
                }`}
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
            className={`w-full transition-all duration-300 ${
              aiGenerating
                ? "bg-primary/80 cursor-not-allowed"
                : "bg-primary-gradient hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            }`}
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
                <span className="font-medium">
                  AI is processing your request...
                </span>
              </div>
              <div className="mt-2 text-xs text-primary/70">
                This may take a few moments while we generate your professional
                invoice.
              </div>
            </div>
          )}

          <div
            className={`text-xs text-muted-foreground transition-opacity duration-300 ${
              aiGenerating ? "opacity-50" : "opacity-100"
            }`}
          >
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

      {/* Business Information - Only show if profile is incomplete or no logo */}
      {(!isProfileComplete || !hasProfileLogo) && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {isProfileComplete ? "Company Logo" : "Business Information"}
            </CardTitle>
            {isProfileComplete && (
              <p className="text-sm text-muted-foreground">
                Your business information is complete. You can only update your
                logo here.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Upload - Always show if no profile logo */}
            {!hasProfileLogo && (
              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo</Label>
                <div className="flex items-center gap-4">
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
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Logo
                    </Button>
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
            )}

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
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
            <div className="space-y-2 md:col-span-2">
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
                className="min-h-[60px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectValue placeholder="Select a currency" />
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

      {/* Line Items */}
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
              {invoiceData.lineItems.map((item, index) => (
                <div key={item.id} className="p-3 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Item {index + 1}</Label>
                    <Button
                      onClick={() => removeLineItem(item.id)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`description-${item.id}`}>Description</Label>
                    <Textarea
                      id={`description-${item.id}`}
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, "description", e.target.value)
                      }
                      placeholder="Service or product description"
                      className="min-h-[40px]"
                      rows={1}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                      <Input
                        id={`quantity-${item.id}`}
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
                    <div className="space-y-2">
                      <Label htmlFor={`rate-${item.id}`}>Rate</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">
                          {selectedCurrency?.symbol}
                        </span>
                        <Input
                          id={`rate-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            updateLineItem(
                              item.id,
                              "rate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="pl-7"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <div className="h-9 px-3 py-2 bg-muted rounded-md flex items-center text-sm overflow-hidden">
                        <span className="truncate">
                          {selectedCurrency?.symbol}
                          {item.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
              className="min-h-[60px]"
            />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">
                Account Number
                {(invoiceData.bankingInfo.bankName ||
                  invoiceData.bankingInfo.accountNumber ||
                  invoiceData.bankingInfo.swiftCode) && (
                  <span className="text-red-500"> *</span>
                )}
              </Label>
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
                placeholder="1234567890"
              />
              {(invoiceData.bankingInfo.bankName ||
                invoiceData.bankingInfo.accountNumber ||
                invoiceData.bankingInfo.swiftCode) && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Required when providing banking information
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="swiftCode">
                SWIFT Code
                {(invoiceData.bankingInfo.bankName ||
                  invoiceData.bankingInfo.accountNumber ||
                  invoiceData.bankingInfo.swiftCode) && (
                  <span className="text-red-500"> *</span>
                )}
              </Label>
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
              <p className="text-xs text-muted-foreground">
                8-11 character code for international wire transfers
              </p>
              {(invoiceData.bankingInfo.bankName ||
                invoiceData.bankingInfo.accountNumber ||
                invoiceData.bankingInfo.swiftCode) && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Required when providing banking information
                </p>
              )}
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
    </div>
  );
};
