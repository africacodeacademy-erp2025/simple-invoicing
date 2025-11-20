import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSetupModal({
  isOpen,
  onClose,
}: ProfileSetupModalProps) {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    // Mark the modal dismissed for this session to avoid reopening while user edits profile
    try {
      sessionStorage.setItem("profile_setup_dismissed", "true");
    } catch (e) {
      /* ignore */
    }
    navigate("/app/profile");
    onClose();
  };

  const handleMaybeLater = () => {
    try {
      sessionStorage.setItem("profile_setup_dismissed", "true");
    } catch (e) {
      /* ignore */
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-left">
            Set up your business profile to start creating professional invoices
            and manage your business information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Illustration */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">What you'll set up:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Business information and contact details
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Invoice settings and preferences
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Banking information for payments
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Company logo and branding
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button onClick={handleGoToProfile} className="w-full bg-primary-gradient hover:opacity-90">
              <Building2 className="h-4 w-4 mr-2" />
              Set Up Profile
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={handleMaybeLater} className="w-full">
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
