
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Calendar,
  Loader2,
  MoreVertical,
  CircleDollarSign,
  FileWarning,
  FileCheck2,
  FileClock
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { InvoiceController } from "@/controllers/invoice.controller";
import { SavedInvoice } from "@/services/invoice.service";
import { format, parseISO, isPast } from 'date-fns';

type InvoiceStatus = "Paid" | "Sent" | "Overdue" | "Draft";


const getStatus = (invoice: SavedInvoice): InvoiceStatus => {
  // Assuming 'invoice_status' is the correct property name based on common conventions and potential type mismatches.
  if (invoice.invoice_status === 'paid') return 'Paid';
  if (isPast(parseISO(invoice.due_date)) && invoice.invoice_status !== 'paid') return 'Overdue';
  if (invoice.invoice_status === 'sent') return 'Sent';
  return 'Draft';
};


export default function Invoices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  useEffect(() => {
    const loadInvoices = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const response = await InvoiceController.getInvoices(user.id);
        if (response.success && response.data) {
          setInvoices(response.data as SavedInvoice[]);
        } else {
          toast({ title: "Error", description: response.message || "Failed to load invoices.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Error loading invoices:", error);
        toast({ title: "Error", description: "Failed to load invoices. Please try again.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    loadInvoices();
  }, [user?.id]);

  const filteredInvoices = useMemo(() => {
    return invoices
      .map(invoice => ({ ...invoice, calculatedStatus: getStatus(invoice) }))
      .filter((invoice) => {
        const matchesSearch =
          invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || invoice.calculatedStatus.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [invoices, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const response = await InvoiceController.deleteInvoice(invoiceId);
      if (response.success) {
        setInvoices((prev) => prev.filter((invoice) => invoice.id !== invoiceId));
        toast({ title: "Invoice Deleted", description: "Invoice has been deleted." });
      } else {
          toast({ title: "Error", description: response.message || "Failed to load invoices.", variant: "destructive" });
        }
      } catch (error) {
      toast({ title: "Error", description: "Failed to delete invoice", variant: "destructive" });
    }
  };
  
  const StatusInfo = {
    Paid: { icon: FileCheck2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    Overdue: { icon: FileWarning, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    Sent: { icon: FileClock, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    Draft: { icon: Edit, color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
  };


  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage and track all your invoices.
          </p>
        </div>
        <Link to="/app/create-invoice" className="w-full sm:w-auto">
          <Button className="bg-primary hover:opacity-90 w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{invoices.length}</div>
              <p className="text-sm text-muted-foreground">Total Invoices</p>
            </CardContent>
          </Card>
          {Object.entries(StatusInfo).map(([status, {color, icon: Icon}]) => (
             <Card key={status}>
                <CardContent className="p-4">
                  <div className={`text-2xl font-bold ${color}`}>{filteredInvoices.filter(inv => inv.calculatedStatus === status).length}</div>
                  <p className="text-sm text-muted-foreground">{status}</p>
                </CardContent>
            </Card>
          ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice # or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
             <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading invoices...</span>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="font-medium">No Invoices Found</p>
            <p className="text-sm mt-1">{searchTerm || statusFilter !== 'all' ? "Try adjusting your search or filters." : "Click 'Create Invoice' to get started."}</p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="grid gap-4 md:hidden">
              {paginatedInvoices.map((invoice) => {
                  const status = invoice.calculatedStatus;
                  const {icon: Icon, color, bgColor} = StatusInfo[status];
                  return (
                    <Card key={invoice.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                           <div className="font-bold text-lg">{invoice.invoice_number}</div>
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/app/view-invoice/${invoice.id}`)}><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/app/edit-invoice/${invoice.id}`)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">{invoice.client_name}</p>
                            <p className="font-semibold text-base">{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(invoice.total)}</p>
                            <div className="flex items-center justify-between text-xs">
                               <div className={`inline-flex items-center gap-1.5 py-1 px-2 rounded-full text-xs font-medium ${bgColor} ${color}`}>
                                  <Icon className="h-3 w-3" />
                                  {status}
                               </div>
                               <p>Due: {format(parseISO(invoice.due_date), 'MMM d, yyyy')}</p>
                            </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
              })}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.map((invoice) => {
                      const status = invoice.calculatedStatus;
                      const {icon: Icon, color} = StatusInfo[status];
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>{invoice.client_name}</TableCell>
                          <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(invoice.total)}</TableCell>
                          <TableCell>{format(parseISO(invoice.issue_date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{format(parseISO(invoice.due_date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-2 ${color}`}>
                                <Icon className="h-4 w-4" />
                                <span className="font-medium">{status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/app/view-invoice/${invoice.id}`)}><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate(`/app/edit-invoice/${invoice.id}`)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
               <div className="flex items-center justify-center pt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem><PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 ? true : false}/></PaginationItem>
                    <PaginationItem><span className="text-sm font-medium px-3">Page {currentPage} of {totalPages}</span></PaginationItem>
                    <PaginationItem><PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages ? true : false}/></PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
