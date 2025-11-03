import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            Please read our terms of service carefully before proceeding.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 p-4 pr-6">
          <div className="text-sm text-muted-foreground">
            <p className="mb-4">
              Welcome to our invoicing application. By using our service, you agree to these terms of service.
            </p>
            <h2 className="text-lg font-bold mb-2 text-foreground">1. Your Account</h2>
            <p className="mb-4">
              You are responsible for maintaining the security of your account and password. The Company cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
            </p>
            <h2 className="text-lg font-bold mb-2 text-foreground">2. Content</h2>
            <p className="mb-4">
              You are responsible for all content posted and activity that occurs under your account.
            </p>
            <h2 className="text-lg font-bold mb-2 text-foreground">3. Changes</h2>
            <p className="mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
            </p>
            <h2 className="text-lg font-bold mb-2 text-foreground">4. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <h2 className="text-lg font-bold mb-2 text-foreground">5. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law provisions.
            </p>
            <h2 className="text-lg font-bold mb-2 text-foreground">6. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at support@example.com.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfServiceModal;
