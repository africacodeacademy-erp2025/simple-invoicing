import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Plus,
  Edit,
  Trash2,
  Mail,
  MapPin,
  Search,
  User,
  Building2,
  Loader2,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ClientController } from "@/controllers/client.controller";
import { Client } from "@/services/client.service";
// ADD THESE IMPORTS
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { PaywallModal } from "@/components/PaywallModal";
import { ProtectedClientController } from "@/controllers/client.controller.protected";

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ADD THESE STATE VARIABLES FOR PAYWALL
  const [showPaywall, setShowPaywall] = useState(false);

  // ADD THIS: Get plan access hook
  const { effectivePlanLimits, profile } = usePlanAccess();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadClients = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await ClientController.getClients(user.id);
      if (response.success) {
        setClients(response.data as Client[]);
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadClients();
  }, [user?.id, loadClients]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Client name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Client name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // UPDATED: Check limit before opening dialog
  const handleAddClient = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add clients.",
        variant: "destructive",
      });
      return;
    }

    // CHECK IF USER CAN ADD MORE CLIENTS
    const limitCheck = await ProtectedClientController.canCreateClient(
      user.id,
      profile?.plan
    );

    if (!limitCheck.success) {
      toast({
        title: "Limit Reached",
        description: limitCheck.error,
        variant: "destructive",
      });

      if (limitCheck.code === "LIMIT_REACHED") {
        setShowPaywall(true);
      }
      return;
    }

    // If check passes, open the dialog
    setEditingClient(null);
    setFormData({ name: "", email: "", address: "" });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      address: client.address,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  // UPDATED: Use protected controller for creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingClient) {
        // Update existing client (no limit check needed for updates)
        const response = await ClientController.updateClient(
          editingClient.id!,
          user.id,
          formData
        );

        if (response.success) {
          toast({
            title: "Client Updated",
            description: "Client information has been updated successfully.",
          });
          await loadClients();
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
          return;
        }
      } else {
        // Add new client - USE PROTECTED CONTROLLER
        const response = await ProtectedClientController.createClient(
          user.id,
          formData
        );

        if (response.success) {
          toast({
            title: "Client Added",
            description: "New client has been added successfully.",
          });
          await loadClients();
        } else {
          // Handle specific error codes
          if (response.code === "LIMIT_REACHED") {
            toast({
              title: "Limit Reached",
              description: response.error,
              variant: "destructive",
            });
            setShowPaywall(true);
            return;
          } else if (response.code === "SUBSCRIPTION_EXPIRED") {
            toast({
              title: "Subscription Expired",
              description: response.error,
              variant: "destructive",
            });
            return;
          }

          // Handle validation errors
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
              description: response.error || "Failed to create client",
              variant: "destructive",
            });
          }
          return;
        }
      }

      setIsDialogOpen(false);
      setFormData({ name: "", email: "", address: "" });
      setFormErrors({});
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await ClientController.deleteClient(clientId, user.id);

      if (response.success) {
        toast({
          title: "Client Deleted",
          description: "Client has been deleted successfully.",
          variant: "destructive",
        });
        await loadClients();
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-2">
            Manage your client information and contact details.
          </p>
          {/* ADD THIS: Show current usage */}
          <p className="text-xs text-muted-foreground mt-2">
            {clients.length} / {effectivePlanLimits.maxClients === Infinity ? '∞' : effectivePlanLimits.maxClients} clients
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddClient}
              className="bg-primary-gradient hover:opacity-90 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  {editingClient ? (
                    <Edit className="h-5 w-5 text-primary" />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold">
                    {editingClient ? "Edit Client" : "Add New Client"}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {editingClient
                      ? "Update client information"
                      : "Enter client details to get started"}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <Separator className="my-4" />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-sm text-foreground">
                    Client Information
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Client Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter client or company name"
                    className={
                      formErrors.name
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }
                    disabled={isSubmitting}
                  />
                  {formErrors.name && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>{formErrors.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="client@company.com"
                    className={
                      formErrors.email
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }
                    disabled={isSubmitting}
                  />
                  {formErrors.email && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>{formErrors.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Contact Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-sm text-foreground">
                    Address Information
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Enter full address including city, state, and postal code"
                    className="min-h-[80px] resize-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                  className="min-w-[80px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-gradient hover:opacity-90 min-w-[120px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingClient ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>{editingClient ? "Update Client" : "Add Client"}</>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>
            Client List ({filteredClients.length})
            {filteredClients.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredClients.length)} of{" "}
                {filteredClients.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading clients...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchTerm
                        ? "No clients found matching your search."
                        : "No clients added yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                          {client.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {client.address || "No address"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditClient(client)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Client
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClient(client.id!)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      {/* ADD THIS: Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="Additional Clients"
        requiredPlan="pro"
        description={`You've reached your limit of ${effectivePlanLimits.maxClients} clients. Upgrade to Pro to add up to 50 clients, or Business for unlimited clients.`}
      />
    </div>
  );
}