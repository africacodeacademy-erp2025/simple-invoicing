## Stripe Subscriptions

Environment variables required in `.env.local`:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SITE_URL=http://localhost:5173

# Stripe Price IDs
VITE_STRIPE_PRICE_PRO_MONTHLY=price_...
VITE_STRIPE_PRICE_BUSINESS_MONTHLY=price_...
VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
# Optional yearly prices
VITE_STRIPE_PRICE_PRO_YEARLY=price_...
VITE_STRIPE_PRICE_BUSINESS_YEARLY=price_...
VITE_STRIPE_PRICE_ENTERPRISE_YEARLY=price_...
```

Edge Functions used:

- `create-stripe-session`: creates a Checkout Session for subscriptions given a `priceId`.
- `stripe-webhook`: processes subscription lifecycle events to update `user_profiles` with `plan`, `subscription_status`, and `current_period_end`.

Frontend:

- `src/components/PricingPlans.tsx` renders plan cards and starts checkout.
- `src/pages/Templates.tsx` checks `profile.plan` to gate premium templates and link to upgrade.


# Simple Invoicing

A modern, AI-powered invoice management application for freelancers and small businesses. Create professional invoices quickly, generate them from natural language, and export as PDF. Includes client management, multi-currency, banking info, and customizable templates.

---

## Features

- **AI Invoice Generation**: Describe your invoice in plain English and let AI fill out all details and line items.
- **Stepper-based Invoice Form**: Multi-step form for business info, client info, invoice details, line items, payment/banking info, and summary.
- **Live Invoice Preview**: See your invoice update in real time as you edit.
- **Customizable Templates**: Choose from multiple professional invoice templates.
- **Client Management**: Select existing clients or enter new ones.
- **Multi-Currency Support**: Choose any currency for your invoice.
- **Banking & Payment Info**: Add bank name, account name, account number, SWIFT, IBAN, and more.
- **PDF Export**: Download your invoice as a PDF (client-side, no server required).
- **Recurring Invoices**: Enable recurring billing with interval selection.
- **Authentication & Profiles**: Secure login, business profile, and settings.
- **Responsive Design**: Works on desktop, tablet, and mobile.

---

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui, Tailwind CSS
- **State Management**: React Context, Custom Hooks
- **PDF Generation**: jsPDF, html2canvas
- **AI**: OpenAI GPT-4/3.5 Turbo (via API)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe (subscriptions, upgrades)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project
- OpenAI API key

### Installation

```bash
git clone <repository-url>
cd simple-invoicing
npm install
```

### Environment Setup

Create a `.env.local` file and add:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_OPENAI_MODEL=gpt-4o-mini
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

---

## Running the App

### Development

```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173)

### Production

```bash
npm run build
npm run preview
```

---

## Usage Guide

### Creating an Invoice

1. **Sign up** or **sign in**
2. **Set up your business profile**
3. **Add/select a client**
4. **Fill out invoice details** (number, dates, currency)
5. **Add line items** (description, quantity, rate)
6. **Enter payment/banking info**
7. **Review summary and notes**
8. **Preview invoice** (live preview on right)
9. **Export as PDF**

### AI Invoice Generation

Use the AI generator at the top of the invoice form. Example prompts:

- "Create an invoice for web design services for Acme Corp. 3 pages at $500 each, logo design for $300, 10% tax, due in 30 days. Client is John Smith at john@acme.com, 123 Business St, New York."
- "Invoice for consulting services, 25 hours at $200/hour, 5% discount, BWP currency."
- "Monthly retainer for marketing services, $2500, recurring monthly."

---

## Project Structure

```
src/
  components/      # UI components (InvoiceForm, InvoicePreview, TemplateSelector, etc.)
  pages/           # App pages (CreateInvoice, EditInvoice, Dashboard, etc.)
  services/        # API and business logic
  controllers/     # Request controllers
  hooks/           # Custom React hooks
  types/           # TypeScript types
  utils/           # Utility functions
  lib/             # External library configs
```

---

## Database Setup

See `supabase/fresh_seed.sql` for schema, and `supabase/sample_data_seed.sql` for demo data. Update user IDs in sample data before running.

---

## Stripe & Subscriptions

Environment variables for Stripe:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SITE_URL=http://localhost:5173
VITE_STRIPE_PRICE_PRO_MONTHLY=price_...
VITE_STRIPE_PRICE_BUSINESS_MONTHLY=price_...
VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
VITE_STRIPE_PRICE_PRO_YEARLY=price_...
VITE_STRIPE_PRICE_BUSINESS_YEARLY=price_...
VITE_STRIPE_PRICE_ENTERPRISE_YEARLY=price_...
```

Edge Functions:
- `create-stripe-session`: creates Stripe Checkout session
- `stripe-webhook`: handles subscription events

---

## Development Notes

- Uses Vite for fast dev/build
- All invoice logic is client-side (no server required for PDF)
- AI features require OpenAI API key (see security note)
- Stripe integration for paid plans
- Responsive and accessible UI

---

## Security Note

OpenAI API is called from the browser. For production, use a backend proxy to keep your API key secure.

---

## License

MIT
