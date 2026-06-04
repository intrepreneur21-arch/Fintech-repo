# AI Fintech Platform Builder - TODO

## Core Features

### 1. AI Prompt Parser
- [x] Implement multilingual NLP parser (English/Hindi/Marathi)
- [x] Extract product name, amount, contact fields, billing type from prompts
- [x] Support keywords: "monthly", "subscription", "recurring" for billing type detection
- [x] Handle currency symbol (₹) and amount parsing
- [x] Vitest coverage for parser with sample prompts in all languages

### 2. Razorpay Integration
- [x] Set up Razorpay API keys and environment configuration
- [x] Implement one-time payment checkout flow
- [x] Implement subscription/recurring payment flow
- [x] Build payment webhook handler for transaction tracking
- [x] Handle payment success/failure callbacks
- [x] Vitest coverage for Razorpay integration

### 3. Payment Page Generator
- [ ] Dynamic Razorpay checkout page generation based on parsed prompt
- [ ] Customer input fields (phone/email as specified)
- [ ] Support for product image/description display
- [ ] Responsive design for mobile and desktop
- [ ] Vitest coverage for page generation logic

### 4. Invoice System
- [x] Auto-generate invoice after successful payment
- [x] PDF export functionality
- [x] In-app invoice viewer
- [x] Invoice template with business details
- [ ] Email invoice delivery (optional)
- [x] Vitest coverage for invoice generation

### 5. Customer Database
- [ ] Store customer contact information
- [ ] Track transaction records per customer
- [ ] Store payment status and metadata
- [ ] Link customers to user accounts
- [ ] Vitest coverage for database operations

### 6. Tiered Plan System
- [x] Free plan: 1 page, 10 transactions/month
- [x] Starter plan (₹19/month): 5 pages, 500 transactions/month
- [x] Pro plan (₹99/month): Unlimited pages and transactions
- [x] Plan enforcement and limit checking
- [x] Usage tracking and analytics
- [x] Vitest coverage for plan enforcement

### 7. Dashboard
- [x] Payment pages list with status
- [x] Transaction history with filters
- [x] Usage statistics and charts
- [x] Plan tier display and upgrade options
- [x] Create new payment page button
- [ ] Vitest coverage for dashboard logic

### 8. Multilingual Support
- [ ] English language strings
- [ ] Hindi language strings
- [ ] Marathi language strings
- [ ] Language toggle in header/settings
- [ ] Persist language preference
- [ ] Vitest coverage for i18n

## Database Schema

- [x] Users table (extended with plan info)
- [x] Payment pages table
- [x] Transactions table
- [x] Customers table
- [x] Invoices table
- [x] Usage tracking table

## UI/UX Components

- [ ] Elegant color palette and typography system
- [ ] Language toggle component
- [ ] Prompt input interface with AI suggestions
- [ ] Payment page preview
- [ ] Dashboard layout
- [ ] Transaction list with filters
- [ ] Invoice viewer modal
- [ ] Plan selector/upgrade modal
- [ ] Loading states and error handling
- [ ] Toast notifications

## Design System

- [x] Define color palette (premium/elegant theme)
- [x] Typography scale and font selection
- [x] Spacing and sizing system
- [x] Shadow and border radius tokens
- [x] Animation guidelines
- [x] Component library documentation

## Testing

- [x] Unit tests for prompt parser
- [x] Unit tests for currency parsing
- [ ] Unit tests for Razorpay integration
- [ ] Unit tests for invoice generation
- [ ] Unit tests for plan enforcement
- [ ] Integration tests for payment flow
- [ ] E2E tests for core user journeys

## Deployment & Configuration

- [ ] Environment variables setup (Razorpay keys, etc.)
- [ ] Database migrations
- [ ] Webhook configuration
- [ ] CORS and security headers
- [ ] Rate limiting
- [ ] Error logging and monitoring

## Completed Features

(None yet - items will be marked [x] as completed)
