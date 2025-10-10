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

# Easy Charge Pro

A modern, AI-powered invoice management application that helps businesses create professional invoices quickly and efficiently. Generate invoices from natural language descriptions using advanced AI technology.

## Features

- **AI-Powered Invoice Generation** - Create invoices from simple text descriptions
- **Multiple Professional Templates** - Choose from modern, corporate, creative, and minimal designs
- **Client Management** - Organize and manage your client database
- **Multi-Currency Support** - Work with any currency worldwide
- **Advanced Calculations** - Automatic tax, discount, and total calculations
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Secure Authentication** - Built-in user authentication and data protection
- **PDF Export** - Generate professional PDF invoices
- **International Support** - Multi-currency support

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: OpenAI GPT-4/3.5 Turbo
- **PDF Generation**: jsPDF + html2canvas
- **State Management**: React Context + Custom Hooks

##Quick Start

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Supabase account** and project
- **OpenAI API key**

### Installation

1. **Clone the repository**:

```bash
git clone <repository-url>
cd simple invoicing
```

2. **Install dependencies**:

```bash
npm install
```

3. **Install additional packages**:

```bash
npm install openai
```

### Environment Configuration

1. **Create environment file**:

```bash
touch .env.local
```

2. **Add your configuration** to `.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_MODEL=gpt-4o-mini

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Resend Configuration (for email functionality)
VITE_RESEND_API_KEY=your_resend_api_key
```

### Getting API Keys

#### Supabase Setup

1. Visit [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon/public key**
5. Paste them in your `.env.local` file

#### OpenAI Setup

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy the key and paste it in your `.env.local` file

#### Stripe Setup

1. Visit [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up or log in to your account
3. Navigate to **Developers** → **API Keys**
4. Copy the **Publishable key** (starts with `pk_test_` or `pk_live_`)
5. Paste it in your `.env.local` file as `VITE_STRIPE_PUBLISHABLE_KEY`

#### Resend Setup (for Email Functionality)

1. Visit [Resend Dashboard](https://resend.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy the key and paste it in your `.env.local` file as `VITE_RESEND_API_KEY`

> ⚠️ **Security Note**: This application uses OpenAI API directly in the browser, which exposes your API key to users. For production use, implement a backend proxy to keep your API key secure.

### AI Model Options

Choose from different OpenAI models based on your needs:

| Model                        | Cost (per 1K tokens)            | Best For                     | Capability               |
| ---------------------------- | ------------------------------- | ---------------------------- | ------------------------ |
| **gpt-4o-mini** ⭐ (default) | $0.00015 input / $0.0006 output | Cost-effective, high quality | Most recommended         |
| **gpt-3.5-turbo-1106**       | $0.001                          | Budget-friendly              | Good quality, lower cost |
| **gpt-3.5-turbo**            | $0.002                          | Standard use                 | Reliable performance     |
| **gpt-4o**                   | $0.005 input / $0.015 output    | Complex tasks                | Highest capability       |

## Running the Application

### Development Mode

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:8080`

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage Guide

### Creating Your First Invoice

1. **Sign up** for a new account or sign in
2. **Set up your profile** with business information
3. **Add clients** to your client database
4. **Create an invoice** using one of these methods:
   - **AI Generation**: Describe your services in natural language
   - **Manual Entry**: Fill out the invoice form manually
5. **Choose a template** that matches your brand
6. **Preview and export** as PDF

### AI Invoice Generation Examples

Try these prompts to generate invoices:

- _"Create an invoice for web development services for TechStart Inc, 40 hours at $150/hour, due in 30 days, 10% tax"_
- _"Invoice for consulting services, 25 hours at $200/hour, 5% discount, BWP currency"_
- _"Monthly retainer for marketing services, $2500, recurring monthly"_

## Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Application pages
├── services/           # API services and business logic
├── controllers/        # Request controllers
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── lib/                # External library configurations
```

### Database Setup

The project includes two SQL files for database setup:

1. **`supabase/fresh_seed.sql`** - Database schema only (production-ready)
2. **`supabase/sample_data_seed.sql`** - Complete setup with schema + sample data (demo-ready)

#### Option 1: Quick Demo Setup (Recommended for Testing)

**Perfect for seeing the app in action immediately:**

1. **Go to Supabase Dashboard**:

   - Navigate to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to **SQL Editor**

2. **Run the complete setup**:

   - Copy and paste the contents of `supabase/sample_data_seed.sql`
   - Execute the script
   - **This creates the schema AND sample data in one go**

3. **Create test users** (if needed):

   - Go to Authentication → Users
   - Create users or use existing ones
   - Get user IDs: `SELECT id, email FROM auth.users;`
   - Update the sample data file with real user IDs

4. **What you get**:
   - ✅ Complete database schema with RLS
   - ✅ Sample user profiles with business info
   - ✅ Sample clients and invoices
   - ✅ Multiple templates and currencies
   - ✅ Ready to test all app features

#### Option 2: Production Setup (Clean Start)

**For production or when you want to start fresh:**

1. **Run schema only**:

   - Copy and paste the contents of `supabase/fresh_seed.sql`
   - Execute the script
   - **This creates only the database structure**

2. **What the schema creates**:

   - ✅ `user_profiles` table with RLS policies
   - ✅ `clients` table with RLS policies
   - ✅ `invoices` table with RLS policies
   - ✅ `invoice_items` table with RLS policies
   - ✅ Performance indexes and triggers
   - ✅ Complete Row Level Security

3. **Add your own data**:
   - Create users through the app
   - Add your business information
   - Create your own clients and invoices

#### Sample Data Overview

| Component          | Count | Description                                     |
| ------------------ | ----- | ----------------------------------------------- |
| **User Profiles**  | 3     | Complete business profiles with banking details |
| **Clients**        | 8     | Diverse client database across different users  |
| **Invoices**       | 5     | Mix of one-time and recurring invoices          |
| **Templates**      | 5     | Modern, corporate, creative, classic, minimal   |
| **Currencies**     | 2     | USD and GBP examples                            |
| **Business Types** | 4     | Tech, design, consulting, international         |

#### Important Notes

⚠️ **Before running the seed file**:

1. **Create users in Supabase Auth** - The seed file references specific user IDs
2. **Update user IDs** - Replace placeholder UUIDs with actual user IDs from your auth.users table
3. **Verify logo URLs** - Update logo URLs to point to actual image files
4. **Test in development** - Don't run seed data in production

#### Getting Real User IDs

To get actual user IDs for the seed file:

```sql
SELECT id, email FROM auth.users;
```

Then update the seed file with real user IDs before running it.

#### Customizing Sample Data

You can modify `supabase/sample_data_seed.sql` to:

- Add your own business information
- Include your actual clients
- Create invoices with your branding
- Test different scenarios and edge cases

#### Production Setup

For production environments:

1. **Run only the schema setup** (`supabase/fresh_seed.sql`)
2. **Skip the sample data** - Use real user data instead
3. **Verify RLS policies** - Ensure all security policies are active
4. **Test with real users** - Create actual user accounts
