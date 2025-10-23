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
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);

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

          const recurringCount = invoices.filter((inv) => inv.is_recurring).length;
          const oneTimeCount = invoices.filter((inv) => !inv.is_recurring).length;

          setStats({
            totalInvoices: invoices.length,
            recurringInvoices: recurringCount,
            oneTimeInvoices: oneTimeCount,
            totalClients: clients.length,
          });

          const recent = invoices
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
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
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground text-base">
            Welcome back! Here's your business overview.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Link to="/app/create-invoice">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={<FileText className="h-4 w-4 text-primary" />}
          description="All invoices created"
          isLoading={isLoading}
        />
        <StatCard
          title="Recurring Invoices"
          value={stats.recurringInvoices}
          icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
          description="Automated billing"
          isLoading={isLoading}
        />
        <StatCard
          title="One-time Invoices"
          value={stats.oneTimeInvoices}
          icon={<FileText className="h-4 w-4 text-purple-500" />}
          description="Single transactions"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Clients"
          value={stats.totalClients}
          icon={<Users className="h-4 w-4 text-info" />}
          description="Total clients"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Invoices Card */}
        <Card className="xl:col-span-2 border shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Invoices
              </div>
              <Link to="/app/invoices">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading...
              </div>
            ) : recentInvoices.length === 0 ? (
              <div className="p-6 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold">No invoices yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first invoice to get started
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {recentInvoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    to={`/app/view-invoice/${invoice.id}`}
                    className="block px-4 py-3 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm group-hover:text-primary">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.client}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {invoice.currency} {invoice.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {invoice.date}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <QuickActionButton
              to="/app/create-invoice"
              icon={<Plus className="h-4 w-4 text-primary" />}
              label="Create New Invoice"
            />
            <QuickActionButton
              to="/app/clients"
              icon={<Users className="h-4 w-4 text-info" />}
              label="Manage Clients"
            />
            <QuickActionButton
              to="/app/templates"
              icon={<Layout className="h-4 w-4 text-success" />}
              label="Templates"
            />
            <QuickActionButton
              to="/app/profile"
              icon={<User className="h-4 w-4 text-warning" />}
              label="Update Profile"
            />

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                 <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold text-base">AI Invoice Generator</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Describe your invoice and let our AI generate it automatically.
              </p>
              <Link to="/app/create-invoice">
                <Button size="sm" className="w-full">
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

// Helper components for cleaner structure

const StatCard = ({ title, value, icon, description, isLoading }) => (
  <Card className="border shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : value}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const QuickActionButton = ({ to, icon, label }) => (
  <Link to={to} className="block">
    <Button variant="outline" className="w-full justify-start h-10">
      <div className="mr-2">{icon}</div>
      {label}
    </Button>
  </Link>
);
