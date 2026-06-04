# AI Fintech Platform Builder

An elegant, AI-powered payment page generator that lets small business owners and freelancers create Razorpay payment pages using natural language prompts in English, Hindi, or Marathi.

## 🚀 Features

### Core Capabilities
- **AI Prompt Parser** - Convert natural language to payment page configurations (English/Hindi/Marathi)
- **Razorpay Integration** - One-time and subscription/recurring billing support
- **Invoice Generation** - Auto-generated PDF invoices after successful payments
- **Tiered Pricing** - Free, Starter (₹19/month), and Pro (₹99/month) plans with usage limits
- **Customer Database** - Track all transactions and customer information
- **Multilingual UI** - Full support for English, Hindi, and Marathi with language toggle
- **Premium Dashboard** - Analytics, transaction history, and payment page management

### Technical Highlights
- **Backend**: Node.js + Express + tRPC with full type safety
- **Frontend**: React 19 + Tailwind CSS 4 with elegant design system
- **Database**: MySQL/TiDB with Drizzle ORM
- **AI**: LLM-powered multilingual prompt parsing
- **Payments**: Razorpay API with webhook verification
- **Testing**: 141+ unit tests with comprehensive coverage

## 📋 Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

## 📦 Requirements

- Node.js 22.13.0 or higher
- pnpm 10.4.1 or higher
- MySQL 8.0+ or TiDB
- Razorpay Account (for payment processing)
- Manus Account (for LLM and storage)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/intrepreneur21-arch/Fintech-repo.git
cd Fintech-repo
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) section for details.

### 4. Database Setup

Create your database and run migrations:

```bash
# Generate migrations (if schema changed)
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate
```

Or manually execute the migration SQL:

```bash
mysql -u your_user -p your_database < drizzle/0001_freezing_chamber.sql
```

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/fintech_db

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Manus OAuth
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars

# LLM & Storage (Manus Built-in APIs)
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_key

# Owner Info
OWNER_OPEN_ID=your_owner_open_id
OWNER_NAME=Your Name

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# App Info
VITE_APP_TITLE=Payment Builder AI
VITE_APP_LOGO=https://your-logo-url.png
```

## 🗄️ Database Setup

### Schema Overview

The application uses the following tables:

#### `users`
- User account information
- Plan tier tracking (free, starter, pro)
- Razorpay customer ID mapping

#### `paymentPages`
- Payment page configurations
- Product details (name, description, amount)
- Billing type (one-time or recurring)
- Contact field requirements (email, phone)
- Unique slug for public access

#### `transactions`
- Payment transaction records
- Status tracking (pending, success, failed)
- Razorpay payment and order IDs
- Customer and payment page references

#### `customers`
- Customer contact information
- Email and phone numbers
- Associated user and payment page

#### `invoices`
- Generated invoice records
- PDF storage references
- Invoice metadata

#### `usageTracking`
- Monthly usage statistics
- Pages created and transactions processed
- Plan tier enforcement data

### Running Migrations

```bash
# Apply all pending migrations
pnpm drizzle-kit migrate

# Or manually with MySQL
mysql -u root -p fintech_db < drizzle/0001_freezing_chamber.sql
```

## 🚀 Running the Application

### Development Mode

```bash
# Start development server with hot reload
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/trpc

### Production Build

```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

### Running Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## 📁 Project Structure

```
fintech-platform-builder/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   │   ├── Home.tsx           # Landing page
│   │   │   ├── Dashboard.tsx      # User dashboard
│   │   │   ├── CreatePaymentPage.tsx  # Payment page creator
│   │   │   └── PaymentPage.tsx    # Public checkout page
│   │   ├── components/            # Reusable components
│   │   │   ├── AppHeader.tsx      # Navigation header
│   │   │   └── LanguageToggle.tsx # Language selector
│   │   ├── contexts/              # React contexts
│   │   │   └── LanguageContext.tsx # Multilingual support
│   │   ├── lib/
│   │   │   ├── i18n.ts           # Translation strings
│   │   │   ├── utils.ts          # Utility functions
│   │   │   └── trpc.ts           # tRPC client
│   │   ├── App.tsx                # Main app component
│   │   └── index.css              # Global styles
│   └── package.json
│
├── server/                         # Node.js backend
│   ├── routers/
│   │   └── paymentPages.ts        # Payment page tRPC procedures
│   ├── promptParser.ts            # AI multilingual prompt parser
│   ├── razorpay.ts                # Razorpay integration service
│   ├── invoiceGenerator.ts        # Invoice generation engine
│   ├── planEnforcement.ts         # Tiered plan enforcement
│   ├── currencyParser.ts          # Currency amount parsing
│   ├── routers.ts                 # Main tRPC router
│   ├── _core/
│   │   ├── llm.ts                # LLM integration
│   │   └── env.ts                # Environment variables
│   ├── *.test.ts                 # Unit tests
│   └── package.json
│
├── drizzle/                        # Database
│   ├── schema.ts                  # Database schema
│   ├── 0001_freezing_chamber.sql # Migration SQL
│   └── relations.ts               # Schema relations
│
├── shared/                         # Shared code
│   └── i18n.ts                    # Server-side translations
│
├── DESIGN_SYSTEM.md               # Design guidelines
├── .env.example                   # Environment template
├── README.md                       # This file
└── todo.md                         # Feature checklist
```

## 🔌 API Documentation

### tRPC Procedures

#### Payment Pages

**Create Payment Page**
```typescript
trpc.paymentPages.create.mutate({
  prompt: "Payment page banao for Online Course, ₹5000, collect email and phone",
  language: "en" // "en" | "hi" | "mr"
})
```

**List Payment Pages**
```typescript
trpc.paymentPages.list.useQuery()
```

**Get Payment Page**
```typescript
trpc.paymentPages.get.useQuery({ pageId: 1 })
```

**Get Payment Page by Slug (Public)**
```typescript
trpc.paymentPages.getBySlug.useQuery({ slug: "online-course-1234567890" })
```

**Get Dashboard Analytics**
```typescript
trpc.paymentPages.getDashboardAnalytics.useQuery()
```

**Get Recent Transactions**
```typescript
trpc.paymentPages.getRecentTransactions.useQuery({ limit: 10 })
```

**Get Transaction History**
```typescript
trpc.paymentPages.getTransactions.useQuery({
  pageId: 1,
  limit: 20,
  offset: 0
})
```

## 🎨 Design System

The application features a premium, elegant design system:

- **Color Palette**: OKLCH-based colors with light and dark themes
- **Typography**: Sora (headings) + Inter (body)
- **Spacing**: 4px base unit with responsive scales
- **Shadows**: Premium glass morphism effects
- **Animations**: Smooth 300ms transitions

See `DESIGN_SYSTEM.md` for detailed guidelines.

## 🌍 Multilingual Support

The platform supports three languages:

- **English** (en)
- **Hindi** (hi)
- **Marathi** (mr)

Language preference is persisted to localStorage and can be toggled via the language selector in the header.

### Adding New Translations

1. Add translation keys to `shared/i18n.ts` (server)
2. Add translation keys to `client/src/lib/i18n.ts` (client)
3. Use `useLanguage().t('key')` in components

## 💳 Razorpay Integration

### Setup

1. Create a Razorpay account at https://razorpay.com
2. Get your API keys from the dashboard
3. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `.env.local`

### Payment Flow

1. User creates payment page via AI prompt
2. Customer visits public payment page (via slug)
3. Customer enters contact info and clicks "Pay"
4. Razorpay checkout modal opens
5. After successful payment:
   - Transaction is recorded
   - Invoice is auto-generated
   - Customer receives confirmation

### Webhook Verification

Razorpay webhooks are verified using HMAC-SHA256 signature verification. The webhook handler validates:
- Signature authenticity
- Payment status
- Order ID and amount

## 📊 Tiered Pricing

### Plan Limits

| Feature | Free | Starter | Pro |
|---------|------|---------|-----|
| Monthly Cost | Free | ₹19 | ₹99 |
| Payment Pages | 1 | 5 | Unlimited |
| Transactions/Month | 10 | 500 | Unlimited |
| Invoice Generation | ✓ | ✓ | ✓ |
| Multilingual Support | ✓ | ✓ | ✓ |

### Usage Tracking

Monthly usage is tracked and reset on the first day of each month. Users are notified when approaching limits.

## 🧪 Testing

The project includes comprehensive unit tests:

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/promptParser.test.ts

# Run with coverage
pnpm test --coverage
```

### Test Coverage

- **Prompt Parser**: 14 tests (multilingual NLP)
- **Currency Parser**: 37 tests (amount parsing)
- **Razorpay Integration**: 13 tests (payment flows)
- **Invoice Generator**: 34 tests (PDF generation)
- **Plan Enforcement**: 42 tests (usage limits)
- **Total**: 141+ tests

## 🚀 Deployment

### Manus Hosting

The application is optimized for Manus hosting:

```bash
# Create checkpoint before deployment
pnpm webdev-save-checkpoint

# Deploy via Manus UI
# Click "Publish" button in Management UI
```

### Self-Hosted (Docker)

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

### Environment Variables for Production

Ensure all required environment variables are set in your production environment:

```bash
DATABASE_URL
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
JWT_SECRET
BUILT_IN_FORGE_API_KEY
VITE_APP_ID
```

## 🐛 Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution**: Ensure MySQL is running and `DATABASE_URL` is correct.

### Razorpay Payment Failed

**Solution**: Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct.

### LLM Prompt Parser Error

**Solution**: Ensure `BUILT_IN_FORGE_API_KEY` is valid and has sufficient credits.

### TypeScript Compilation Error

```bash
# Clear cache and rebuild
rm -rf dist/
pnpm build
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review the DESIGN_SYSTEM.md for UI guidelines

## 🎯 Roadmap

- [ ] Email invoice delivery
- [ ] Custom branding for payment pages
- [ ] Advanced analytics and reporting
- [ ] API rate limiting
- [ ] Webhook retry logic
- [ ] Subscription management UI
- [ ] Mobile app (React Native)

---

**Built with ❤️ for small business owners and freelancers**
