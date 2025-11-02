import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>
            Please read our privacy policy carefully before proceeding.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 p-4 pr-6">
          <div className="text-sm text-muted-foreground">
            <p className="mb-4">
              Your privacy is important to us. It is our policy to respect your privacy regarding any information we may collect from you across our website.
            </p>
            <h2 className="text-lg font-bold mb-2 text-foreground">1. Information We Collect</h2>
            <p className="mb-4">
              We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.
            </p>
            <h2 className="text-lg font-bold mb-2 text-foreground">2. How We Use Your Information</h2>
            <p className="mb-4">
              We use the information we collect in various ways, including to provide, operate, and maintain our website, improve, personalize, and expand our website, and understand and analyze how you use our website.
            </p>
            <h2 className="text-lg font-bold mb-2 text-foreground">3. Security</h2>
            <p className="mb-4">
              The security of your personal information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure.
            </p>
            <h2 className="text-lg font-bold mb-2 text-foreground">4. Cookies</h2>
            <p className="mb-4">
              We use "cookies" to collect information about you and your activity across our site. A cookie is a small data file that our website stores on your computer or mobile device.
            </p>
            <h2 className="text-lg font-bold mb-2 text-foreground">5. Changes to This Policy</h2>
            <p className="mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyModal;
