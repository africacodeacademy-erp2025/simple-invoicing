import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PricingPlans from "@/components/PricingPlans";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "react-router-dom";

export default function Billing() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id ?? null);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get("checkout") === "success") {
      toast({
        title: "Subscription updated!",
        description: "Your plan has been successfully updated.",
      });
    }
    if (query.get("checkout") === "cancel") {
      toast({
        title: "Checkout canceled",
        description: "Your checkout session has been canceled.",
        variant: "destructive",
      });
    }
  }, [location.search, toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground mt-2">Manage your subscription and plan.</p>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Plan</div>
              <div className="font-medium capitalize">{profile?.plan || "free"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Status</div>
              <div className="font-medium">{profile?.subscription_status || "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Renews</div>
              <div className="font-medium">{profile?.current_period_end ? new Date(profile.current_period_end).toLocaleString() : "—"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Choose a Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <PricingPlans />
        </CardContent>
      </Card>
    </div>
  );
}
