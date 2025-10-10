import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  Eye,
  Star,
  Sparkles,
  FileText,
  FileSpreadsheet,
  FileImage,
  Loader2,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { TemplateController } from "@/controllers/template.controller";
import { InvoiceTemplate } from "@/services/template.service";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { BillingService } from "@/services/billing.service";

export default function Templates() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id ?? null);
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] =
    useState<InvoiceTemplate | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Determine access by plan from profile
  const plan = (profile?.plan || "free").toLowerCase();
  const isProUser = ["pro", "business", "enterprise"].includes(plan);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await TemplateController.getTemplates();
      if (response.success) {
        setTemplates(response.data as InvoiceTemplate[]);
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      template.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "all",
    ...Array.from(new Set(templates.map((t) => t.category))),
  ];

  const handleDownload = async (
    template: InvoiceTemplate,
    format: "pdf" | "word" | "excel"
  ) => {
    if (template.isPremium && !isProUser) {
      setIsUpgradeModalOpen(true);
      return;
    }

    setIsDownloading(true);
    try {
      const response = await TemplateController.downloadTemplate(
        template.id,
        format
      );
      if (response.success) {
        toast({
          title: "Download Started",
          description: response.message,
        });
        setIsDownloadModalOpen(false);
      } else {
        toast({
          title: "Download Failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error downloading template:", error);
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const openDownloadModal = (template: InvoiceTemplate) => {
    if (template.isPremium && !isProUser) {
      setSelectedTemplate(template);
      setIsUpgradeModalOpen(true);
    } else {
      setSelectedTemplate(template);
      setIsDownloadModalOpen(true);
    }
  };

  const openPreviewModal = (template: InvoiceTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FileImage className="h-4 w-4" />;
      case "word":
        return <FileText className="h-4 w-4" />;
      case "excel":
        return <FileSpreadsheet className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const renderTemplatePreview = (template: InvoiceTemplate) => {
    // Placeholder preview
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-400">
        <FileText className="h-10 w-10" />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading templates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Invoice Templates</h2>
          <p className="text-muted-foreground text-sm">
            Browse and download invoice templates for your business.
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48"
          />
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={`shadow-soft hover:shadow-lg transition-shadow duration-200 ${
              template.isPremium ? "border-primary/50" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {template.name}
                    {template.isPremium && (
                      <Badge variant="premium">
                        <Star className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </CardTitle>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {template.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="aspect-[3/2] bg-white rounded-lg border-2 border-muted-foreground/25 overflow-hidden shadow-sm relative">
                {template.isPremium && !isProUser && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                )}
                {renderTemplatePreview(template)}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>

              <div className="flex gap-2 pt-2">
                <Button
                  variant={template.isPremium && !isProUser ? "secondary" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => openDownloadModal(template)}
                >
                  {template.isPremium && !isProUser ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Upgrade to Download
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-3"
                  onClick={() => openPreviewModal(template)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upgrade Modal */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Upgrade to Pro
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <h3 className="font-medium text-lg">
              Unlock the "{selectedTemplate?.name}" Template
            </h3>
            <p className="text-muted-foreground mt-2">
              This template is part of our Pro plan. Pay to unlock this and other premium templates, plus get access to all pro features.
            </p>
            <Button
              className="mt-4 w-full"
              onClick={() =>
                BillingService.startCheckout(
                  import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || ""
                )
              }
            >
              Upgrade to Pro
            </Button>
            <Button
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => setIsUpgradeModalOpen(false)}
            >
              Maybe Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}