import React, { forwardRef } from 'react';
import { InvoiceData } from '@/types/invoice';
import { InvoiceTemplate } from '@/types/templates';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { CorporateTemplate } from './templates/CorporateTemplate';
import { XeroTemplate } from './templates/XeroTemplate';

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
  template: InvoiceTemplate;
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ invoiceData, template }, ref) => {
    const renderTemplate = () => {
      switch (template) {
        case InvoiceTemplate.MODERN:
          return <ModernTemplate invoiceData={invoiceData} ref={ref} />;
        case InvoiceTemplate.CLASSIC:
          return <ClassicTemplate invoiceData={invoiceData} ref={ref} />;
        case InvoiceTemplate.MINIMAL:
          return <MinimalTemplate invoiceData={invoiceData} ref={ref} />;
        case InvoiceTemplate.CREATIVE:
          return <CreativeTemplate invoiceData={invoiceData} ref={ref} />;
        case InvoiceTemplate.CORPORATE:
          return <CorporateTemplate invoiceData={invoiceData} ref={ref} />;
        case InvoiceTemplate.XERO:
          return <XeroTemplate invoiceData={invoiceData} ref={ref} />;
        default:
          return <ModernTemplate invoiceData={invoiceData} ref={ref} />;
      }
    };

    return renderTemplate();
  }
);

InvoicePreview.displayName = 'InvoicePreview';