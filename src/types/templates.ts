export enum InvoiceTemplate {
  MODERN = 'modern',
  CLASSIC = 'classic', 
  MINIMAL = 'minimal',
  CREATIVE = 'creative',
  CORPORATE = 'corporate'
}

export interface TemplateInfo {
  id: InvoiceTemplate;
  name: string;
  description?: string; // Made optional as not all templates might have it
  preview: string;
  isPremium: boolean; // Added isPremium property
  index: number; // Added index property for ordering and limits
}
