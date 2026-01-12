# PremedProfiles

A comprehensive web application designed to help pre-medical students navigate their journey to medical school through successful applicant profiles, application guidance, and premium resources.

## 🎯 Overview

PremedProfiles provides pre-medical students with:

- **Real applicant profiles** from students who were accepted to medical schools
- **Application guidance** including personal statement templates and activity descriptions
- **Premium resources** like cold email templates, CV templates, and MCAT study schedules
- **Medical school database** with acceptance statistics and student profiles

## 🚀 Features

### Core Features

- **Applicant Profile Database**: Browse profiles of successful medical school applicants
- **Medical School Explorer**: Search and filter medical schools with acceptance data
- **Interactive Profile Cards**: Detailed breakdown of GPA, MCAT, activities, and reflections
- **School-specific Profiles**: View which students were accepted to specific medical schools

### Premium Features (Cheatsheet+)

- ✅ Cold email templates for research opportunities
- ✅ Professional CV template optimized for medical school applications
- ✅ Pre-med summer program database
- ✅ MCAT-optimized course schedules and study plans

### Application Resources

- 📝 Personal statement writing guide
- 📝 Activity section description templates
- 📝 Letter of recommendation email templates
- 📝 General application strategy guides

### User Management

- 🔐 Firebase Authentication with email verification
- 💳 Stripe payment integration for subscriptions
- 👤 User profile management with payment methods and addresses
- 📊 Order history and subscription management

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks and functional components
- **React Router DOM 7** - Client-side routing
- **Sass/SCSS** - Styling with variables and mixins
- **Responsive Design** - Mobile-first approach

### Backend & Services

- **Firebase**
  - Authentication (email/password, email verification)
  - Firestore (user profiles, orders, subscriptions)
  - Storage (file uploads)
- **Stripe** - Payment processing and subscription management
- **Google Docs API** - Embedded document viewing

### Development Tools

- **Create React App** - Development environment
- **ESLint** - Code linting
- **Git** - Version control

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/                    # Authentication components
│   │   ├── AuthModal.js         # Login/signup modal
│   │   ├── ProtectedRoute.js    # Route protection
│   │   ├── PlanBasedRoute.js    # Subscription-based routing
│   │   └── PaymentVerifiedRoute.js
│   ├── layout/                  # Layout components
│   │   ├── Navbar/              # Navigation bar
│   │   └── Footer/              # Footer component
│   ├── sections/                # Page sections
│   │   ├── Hero/                # Landing page hero
│   │   ├── ProfileCard/         # Applicant profile cards
│   │   └── ...
│   ├── payment/                 # Payment components
│   │   ├── StripeWrapper.js     # Stripe integration
│   │   ├── PricingCards.js      # Subscription plans
│   │   └── SavedPaymentMethods.js
│   └── common/                  # Reusable components
├── pages/
│   ├── Home/                    # Landing page
│   ├── Profile/                 # Main dashboard
│   ├── Checkout/                # Payment flow
│   ├── Account/                 # User account management
│   ├── Admin/                   # Admin panel
│   └── ApplicationCheatsheet/   # Application resources
├── services/                    # API services
│   ├── paymentService.js        # Payment processing
│   ├── userService.js           # User data management
│   └── api.js                   # External API calls
├── utils/                       # Utility functions
│   ├── profilesData.js          # Profile data processing
│   └── countries.js             # Country data
├── contexts/                    # React contexts
│   └── AuthContext.js           # Authentication state
├── firebase/                    # Firebase configuration
│   ├── config.js                # Firebase setup
│   └── authService.js           # Authentication services
└── styles/                      # Global styles
    ├── main.scss                # Main stylesheet
    ├── variables.scss           # SCSS variables
    └── mixins.scss              # SCSS mixins
```

## 🏗️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project
- Stripe account

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd premedcheatsheet-new
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase**

   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Add your configuration to `.env`

4. **Set up Stripe**

   - Create a Stripe account
   - Get your publishable key
   - Add to `.env` file

5. **Start development server**
   ```bash
   npm start
   ```

## 🗄️ Database Schema

### Firestore Collections

#### Users Collection (`users`)

```javascript
{
  uid: "user_id",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  emailVerified: true,
  paymentVerified: true,
  createdAt: "2025-01-01T00:00:00.000Z",
  subscriptions: [
    {
      plan: "cheatsheet-plus",
      startDate: "2025-01-01T00:00:00.000Z",
      endDate: "2026-01-01T00:00:00.000Z",
      active: true,
      orderId: "order_123"
    }
  ],
  orders: [
    {
      orderId: "order_123",
      plan: "cheatsheet-plus",
      planName: "The Cheatsheet+",
      amount: 29.99,
      status: "completed",
      createdAt: "2025-01-01T00:00:00.000Z"
    }
  ],
  paymentMethods: [
    {
      id: "pm_123",
      cardType: "visa",
      lastFourDigits: "4242",
      expiryDate: "12/25",
      cardholderName: "John Doe",
      isDefault: true
    }
  ],
  addresses: [
    {
      id: "addr_123",
      name: "John Doe",
      line1: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "United States",
      isDefault: true
    }
  ]
}
```

#### Orders Collection (`orders`)

```javascript
{
  orderId: "order_123",
  userId: "user_id",
  amount: 29.99,
  plan: "cheatsheet-plus",
  status: "completed",
  paymentMethodId: "pm_stripe_123",
  createdAt: "2025-01-01T00:00:00.000Z",
  completedAt: "2025-01-01T00:00:00.000Z"
}
```

## 💳 Subscription Plans

| Plan                        | Price  | Features                        |
| --------------------------- | ------ | ------------------------------- |
| **The Cheatsheet**          | $14.99 | Applicant profiles access       |
| **The Cheatsheet+**         | $29.99 | Profiles + premium resources    |
| **Application Cheatsheet**  | $19.99 | Application writing guides      |
| **Application Cheatsheet+** | $34.99 | Complete access to all features |

## 🔐 Authentication Flow

1. **Guest Access**: 24-hour trial access
2. **Registration**: Data collection (account created after payment)
3. **Email Verification**: Required for full access
4. **Payment**: Stripe integration with saved payment methods
5. **Subscription Management**: Plan-based route protection

## 🚦 Route Protection

- **Public Routes**: Home, About, Pricing
- **Payment Verified**: Requires active subscription
- **Plan-Based**: Different content based on subscription level
- **Admin Routes**: Admin panel access control

## 🎨 Styling System

- **SCSS Architecture**: Variables, mixins, and modular styles
- **Responsive Design**: Mobile-first approach
- **Design System**: Consistent spacing, typography, and colors
- **Component Styles**: Co-located SCSS files

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Setup

- Configure production environment variables
- Set up Firebase hosting or your preferred hosting service
- Configure domain and SSL certificates

## 📊 Analytics & Monitoring

- Firebase Analytics integration
- Error tracking and monitoring
- Performance monitoring with Web Vitals

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Email: staff@premedcheatsheet.com
- Website: [premedcheatsheet.com](https://premedcheatsheet.com)

## 🔄 Recent Updates

- ✅ Fixed duplicate order creation bug
- ✅ Implemented proper payment flow (account creation after payment)
- ✅ Added plan-based route protection
- ✅ Enhanced subscription management
- ✅ Improved mobile responsiveness
- ✅ Added email verification system

---

**Built with ❤️ for pre-medical students pursuing their dreams of becoming physicians.**
