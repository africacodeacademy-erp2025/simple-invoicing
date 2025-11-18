
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
  const [showPaywall, setShowPaywall] = useState(false);
  const { profile } = usePlanAccess();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        title: "Failed to load clients",
        description: "An error occurred while fetching client data.",
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

  const handleAddClient = async () => {
    if (!user?.id) return;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user?.id) return;

    setIsSubmitting(true);
    try {
      let response;
      if (editingClient) {
        response = await ClientController.updateClient(
          editingClient.id!,
          user.id,
          formData
        );
      } else {
        response = await ProtectedClientController.createClient(user.id, formData);
      }

      if (response.success) {
        toast({
          title: editingClient ? "Client Updated" : "Client Added",
          description: `Client info has been ${
            editingClient ? "updated" : "added"
          }.`,
        });
        await loadClients();
        setIsDialogOpen(false);
      } else {
        if (response.code === "LIMIT_REACHED") {
          setShowPaywall(true);
        }
        toast({
          title: "Error",
          description: response.error || response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "Failed to save client",
        description: response.error || response.message || "An error occurred while saving client data.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!user?.id) return;

    try {
      const response = await ClientController.deleteClient(clientId, user.id);
      if (response.success) {
        toast({
          title: "Client Deleted",
          description: "Client has been deleted.",
          variant: "destructive",
        });
        await loadClients();
      } else {
        toast({
          title: "Failed to save client",
          description: response.error || response.message || "An error occurred while saving client data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Failed to delete client",
        description: "An error occurred while deleting client data.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Clients
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage your client information and contact details.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {clients.length} / 50 clients
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddClient}
              className="bg-primary hover:opacity-90 shadow-lg w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            {/* Dialog Content remains the same as before */}
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  {editingClient ? (<Edit className="h-5 w-5 text-primary" />) : (<User className="h-5 w-5 text-primary" />)}
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold">
                    {editingClient ? "Edit Client" : "Add New Client"}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {editingClient ? "Update client information" : "Enter client details to get started"}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <Separator className="my-4" />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-sm text-foreground">Client Information</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Client Name <span className="text-red-500">*</span></Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Enter client or company name" className={formErrors.name ? "border-red-500" : ""} disabled={isSubmitting}/>
                  {formErrors.name && (<div className="flex items-center gap-1 text-sm text-red-600"><AlertCircle className="h-3 w-3" /><span>{formErrors.name}</span></div>)}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="client@company.com" className={formErrors.email ? "border-red-500" : ""} disabled={isSubmitting}/>
                  {formErrors.email && (<div className="flex items-center gap-1 text-sm text-red-600"><AlertCircle className="h-3 w-3" /><span>{formErrors.email}</span></div>)}
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                 <div className="flex items-center gap-2 mb-3"><MapPin className="h-4 w-4 text-primary" /><h3 className="font-medium text-sm text-foreground">Address Information</h3></div>
                 <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                  <Textarea id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} placeholder="Enter full address" className="min-h-[80px] resize-none" disabled={isSubmitting}/>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" className="bg-primary hover:opacity-90 min-w-[100px]" disabled={isSubmitting}>
                  {isSubmitting ? (<Loader2 className="h-4 w-4 animate-spin" />) : (editingClient ? "Update" : "Add")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10"
        />
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading clients...</span>
          </div>
        ) : filteredClients.length === 0 ? (
           <div className="text-center py-12 text-muted-foreground">
             <p className="font-medium">{searchTerm ? "No Clients Found" : "No Clients Yet"}</p>
             <p className="text-sm mt-1">{searchTerm ? "Try a different search term." : "Click 'Add Client' to get started."}</p>
           </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredClients.length)} of{' '}{filteredClients.length} client(s)
            </div>
            {/* Mobile View - Cards */}
            <div className="grid gap-4 md:hidden">
              {paginatedClients.map((client) => (
                <Card key={client.id} className="shadow-sm">
                  <CardContent className="p-4 flex justify-between items-start">
                    <div className="space-y-1.5 flex-grow">
                      <p className="font-semibold text-base">{client.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 mr-2" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      {client.address && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-2" />
                          <span className="truncate">{client.address}</span>
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClient(client)} className="cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClient(client.id!)} className="cursor-pointer text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block rounded-lg border overflow-hidden">
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
                    {paginatedClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.address || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClient(client)} className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteClient(client.id!)} className="cursor-pointer text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center pt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}/>
                    </PaginationItem>
                    <PaginationItem>
                        <span className="text-sm font-medium px-3">Page {currentPage} of {totalPages}</span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}/>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="Additional Clients"
        requiredPlan="pro"
        description={"Upgrade to add more clients."}
      />
    </div>
  );
}
