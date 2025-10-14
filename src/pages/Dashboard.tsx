import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  TrendingUp,
  Plus,
  Eye,
  User,
  Layout,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { InvoiceController } from "@/controllers/invoice.controller";
import { ClientController } from "@/controllers/client.controller";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    recurringInvoices: 0,
    oneTimeInvoices: 0,
    totalClients: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const [invoicesResponse, clientsResponse] = await Promise.all([
          InvoiceController.getInvoices(user.id),
          ClientController.getClients(user.id),
        ]);

        if (invoicesResponse.success && clientsResponse.success) {
          const invoices = invoicesResponse.data || [];
          const clients = clientsResponse.data || [];

          const recurringCount = invoices.filter(
            (inv) => inv.is_recurring
          ).length;
          const oneTimeCount = invoices.filter(
            (inv) => !inv.is_recurring
          ).length;

          setStats({
            totalInvoices: invoices.length,
            recurringInvoices: recurringCount,
            oneTimeInvoices: oneTimeCount,
            totalClients: clients.length,
          });

          const recent = invoices
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 4)
            .map((invoice) => ({
              id: invoice.id,
              invoiceNumber: invoice.invoice_number,
              client: invoice.client_name,
              amount: invoice.total,
              currency: invoice.currency,
              date: new Date(invoice.issue_date).toLocaleDateString(),
              isRecurring: invoice.is_recurring,
            }));

          setRecentInvoices(recent);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back! Here's your business overview.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/app/create-invoice">
            <Button className="bg-primary hover:shadow-lg transition-all duration-300 hover:scale-105 shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card-gradient shadow-medium hover:shadow-large transition-all duration-300 border-0 animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoices
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                stats.totalInvoices
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              All invoices created
            </p>
          </CardContent>
        </Card>

        <Card
          className="bg-card-gradient shadow-medium hover:shadow-large transition-all duration-300 border-0 animate-scale-in"
          style={{ animationDelay: "0.1s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recurring Invoices
            </CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                stats.recurringInvoices
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Automated billing
            </p>
          </CardContent>
        </Card>

        <Card
          className="bg-card-gradient shadow-medium hover:shadow-large transition-all duration-300 border-0 animate-scale-in"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              One-time Invoices
            </CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <FileText className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                stats.oneTimeInvoices
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Single transactions
            </p>
          </CardContent>
        </Card>

        <Card
          className="bg-card-gradient shadow-medium hover:shadow-large transition-all duration-300 border-0 animate-scale-in"
          style={{ animationDelay: "0.3s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Clients
            </CardTitle>
            <div className="p-2 bg-info/10 rounded-lg">
              <Users className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                stats.totalClients
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Total clients</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 bg-card-gradient shadow-medium border-0 overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                Recent Invoices
              </div>
              <Link to="/app/invoices">
                <Button
                  variant="outline"
                  size="sm"
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Loading recent invoices...
                </p>
              </div>
            ) : recentInvoices.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No invoices yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first invoice to get started
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentInvoices.map((invoice, index) => (
                  <Link
                    key={invoice.id}
                    to={`/app/view-invoice/${invoice.id}`}
                    className="block p-4 hover:bg-muted/30 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          {invoice.isRecurring && (
                            <TrendingUp className="w-3 h-3 text-blue-500 absolute -top-1 -right-1 bg-background rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.client}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {invoice.currency} {invoice.amount.toLocaleString()}
                        </p>
                        {invoice.isRecurring && (
                          <p className="text-xs text-blue-500 font-medium">
                            Recurring
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Click to view
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card-gradient shadow-medium border-0">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Link to="/app/create-invoice" className="block group">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 shadow-sm hover:shadow-md transition-all hover:scale-105 group-hover:bg-primary/5"
                >
                  <div className="p-1 bg-primary/10 rounded mr-3">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  Create New Invoice
                </Button>
              </Link>
              <Link to="/app/clients" className="block group">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 shadow-sm hover:shadow-md transition-all hover:scale-105 group-hover:bg-info/5"
                >
                  <div className="p-1 bg-info/10 rounded mr-3">
                    <Users className="h-4 w-4 text-info" />
                  </div>
                  Manage Clients
                </Button>
              </Link>
              <Link to="/app/templates" className="block group">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 shadow-sm hover:shadow-md transition-all hover:scale-105 group-hover:bg-success/5"
                >
                  <div className="p-1 bg-success/10 rounded mr-3">
                    <Layout className="h-4 w-4 text-success" />
                  </div>
                  Templates
                </Button>
              </Link>
              <Link to="/app/profile" className="block group">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 shadow-sm hover:shadow-md transition-all hover:scale-105 group-hover:bg-warning/5"
                >
                  <div className="p-1 bg-warning/10 rounded mr-3">
                    <User className="h-4 w-4 text-warning" />
                  </div>
                  Update Profile
                </Button>
              </Link>
            </div>

            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-foreground">
                  AI Invoice Generator
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Describe your invoice and let AI generate the details
                automatically
              </p>
              <Link to="/app/create-invoice">
                <Button
                  size="sm"
                  className="w-full bg-primary hover:shadow-md transition-shadow"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Try AI Generation
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
