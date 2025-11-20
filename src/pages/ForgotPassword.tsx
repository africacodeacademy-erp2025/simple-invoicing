import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/services/auth.service";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await AuthService.requestPasswordReset(email);
      if (!res.success) {
        toast({ title: "Password Reset Error", description: res.message || "Failed to send reset email. Please try again.", variant: "destructive" });
        return;
      }

      toast({ title: "Email sent", description: res.message || "If an account exists for that email, a reset link has been sent." });
      // optionally navigate back to sign in after a short delay
      setTimeout(() => navigate("/signin"), 1200);
    } catch (err) {
      toast({ title: "Password Reset Error", description: err instanceof Error ? err.message : "An unexpected error occurred during password reset. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <p className="text-sm text-muted-foreground">Enter your account email and we'll send a reset link.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
              </div>

              <Button type="submit" className="w-full h-11 bg-primary-gradient" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>

              <div className="text-center text-sm">
                <a className="text-primary hover:underline" onClick={() => navigate('/signin')}>Back to sign in</a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
