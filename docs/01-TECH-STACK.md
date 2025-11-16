# Tech Stack & Setup Guide

## 🛠️ Complete Technology Stack

### Frontend Framework

**React 18.2**
- Component-based architecture
- Fast rendering with Virtual DOM
- Huge ecosystem of libraries
- Excellent TypeScript support
- Strong community & resources

**Why React?**
- Industry standard (easy to hire developers)
- Rich ecosystem (thousands of libraries)
- Great performance with modern hooks
- Excellent developer experience
- Claude Code expertise with React

### Language

**TypeScript 5.0**
- Type safety (catch bugs before runtime)
- Better IDE autocomplete
- Self-documenting code
- Easier refactoring
- Industry best practice for large apps

**Why TypeScript?**
- Prevents common JavaScript bugs
- Makes Claude Code more effective
- Easier to maintain as app grows
- Better collaboration if you hire developers

### Build Tool

**Vite 4.3**
- Lightning-fast hot module replacement (HMR)
- Optimized production builds
- Built-in TypeScript support
- Modern ES modules
- Much faster than Create React App

**Why Vite?**
- Instant dev server start (<1 second)
- Sub-100ms HMR (changes appear instantly)
- Optimized builds (smaller bundles)
- Better developer experience

---

## 🎨 Styling & UI

### CSS Framework

**Tailwind CSS 3.3**
- Utility-first CSS
- No naming conflicts
- Small production bundle (purges unused styles)
- Rapid development
- Consistent design system

**Configuration:**
```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          purple: {
            500: '#A855F7',
            600: '#9333EA',
            700: '#7E22CE',
            800: '#6B21A8',
          },
          pink: {
            500: '#EC4899',
            600: '#DB2777',
            700: '#BE185D',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

### Icon Library

**Lucide React**
- 1000+ beautiful icons
- Lightweight (tree-shakeable)
- Consistent design
- Easy to use

```tsx
import { Dumbbell, TrendingUp, Users } from 'lucide-react'
```

---

## 🗄️ Backend & Database

### Backend as a Service

**Supabase** (Open-source Firebase alternative)

**Features we use:**
- PostgreSQL database (relational)
- Authentication (email, social login)
- Real-time subscriptions
- Storage (exercise videos, avatars)
- Row Level Security (RLS)
- Auto-generated REST APIs
- Auto-generated TypeScript types

**Why Supabase?**
- Free tier is generous
- Scales easily (pay as you grow)
- Open source (not locked in)
- Excellent developer experience
- Built-in auth & storage
- Real-time updates

**Setup:**
```bash
npm install @supabase/supabase-js
```

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Database Schema

**Tables:**
- `users` - User profiles & preferences
- `programs` - Workout programs
- `workout_days` - Days in a program
- `exercises` - Exercise library
- `workout_logs` - Completed workouts
- `sets` - Individual set data
- `achievements` - User achievements
- `friendships` - Friend connections
- `subscriptions` - Stripe subscription data

**Migration Strategy:**
- Use Supabase migrations
- Version controlled SQL files
- Easy rollback if needed

---

## 🎯 State Management

**Zustand 4.3**
- Simple & lightweight (1kb)
- No boilerplate (unlike Redux)
- TypeScript-first
- React hooks-based
- Easy to test

**Why Zustand over Redux?**
- 90% less code
- No context providers needed
- No actions/reducers boilerplate
- Just as powerful
- Easier to learn

**Example Store:**
```typescript
// src/store/workout-store.ts
import { create } from 'zustand'

interface WorkoutState {
  currentExercise: number
  restTimerActive: boolean
  startRest: (seconds: number) => void
  completeSet: (setData: SetData) => void
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  currentExercise: 0,
  restTimerActive: false,
  startRest: (seconds) => set({ restTimerActive: true }),
  completeSet: (setData) => {
    // Logic here
  }
}))
```

---

## 🧭 Routing

**React Router 6.11**
- Client-side routing
- Nested routes
- URL parameters
- Protected routes
- Scroll restoration

**Route Structure:**
```
/                       → Home Dashboard
/workout/:id            → Workout Execution
/workout/:id/complete   → Completion Screen
/program/create         → Program Builder
/program/:id            → Program Detail
/library/workouts       → Workout Library
/library/exercises      → Exercise Library
/progress               → Progress Dashboard
/history                → Workout History
/community              → Community Hub
/community/leaderboard  → Leaderboard
/profile                → User Profile
/settings               → Settings
```

---

## 📊 Data Visualization

**Recharts**
- React-native charting library
- Responsive charts
- Beautiful out of the box
- Customizable
- TypeScript support

**Charts we'll use:**
- Line charts (progress over time)
- Bar charts (volume by workout)
- Area charts (strength curves)
- Pie charts (muscle group distribution)

```tsx
import { LineChart, Line, XAxis, YAxis } from 'recharts'
```

---

## 💳 Payments

**Stripe**
- Industry standard payment processing
- Subscription management
- Secure (PCI compliant)
- Global support
- Great documentation

**Products:**
- Stripe Checkout (hosted payment page)
- Stripe Customer Portal (manage subscription)
- Stripe Webhooks (handle events)

**Pricing:**
- 2.9% + $0.30 per transaction
- No monthly fee
- Only pay when you earn

**Setup:**
```bash
npm install @stripe/stripe-js
```

---

## 🚀 Deployment & Hosting

### Hosting Platform

**Vercel**
- Zero-config deployment
- Auto-deploy from GitHub
- Global CDN
- Free SSL certificates
- Built-in analytics
- Preview deployments

**Why Vercel?**
- Made by creators of Next.js
- Best React/Vite support
- Automatic HTTPS
- Free tier is generous
- Scales automatically

**Deployment:**
```bash
git push origin main  # Auto-deploys!
```

### Domain

**Options:**
- Namecheap (~$12/year for .com)
- Google Domains
- Cloudflare Registrar

**Free Alternative:**
- Use `your-app.vercel.app` (free subdomain)

---

## 📱 Progressive Web App (PWA)

**Features:**
- Install to home screen
- Offline capability
- Push notifications
- App-like experience
- No app store needed

**Tools:**
- `vite-plugin-pwa`
- Service Worker
- Manifest.json

**Why PWA First?**
- No App Store review (launch instantly)
- No Apple 30% revenue share (keep 100%)
- Works on iOS AND Android
- Cheaper to develop ($0 vs $5,000+)
- Easier to update (no review delay)

---

## 🧰 Development Tools

### Package Manager

**npm** (comes with Node.js)
- Standard package manager
- Huge package registry
- Fast installs
- Lock file for reproducibility

### Version Control

**Git + GitHub**
- Code versioning
- Collaboration
- Backup
- CI/CD integration

### Code Editor

**VS Code** (recommended)
- Free & powerful
- Excellent TypeScript support
- Great extensions
- Integrated terminal

**Essential Extensions:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens
- Error Lens

### Code Quality

**ESLint**
- Catches bugs
- Enforces code style
- TypeScript rules

**Prettier**
- Auto-format code
- Consistent style
- Saves time

---

## 📦 Full Package List

### Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.0",
    "@supabase/supabase-js": "^2.21.0",
    "zustand": "^4.3.7",
    "react-hook-form": "^7.43.9",
    "recharts": "^2.6.2",
    "lucide-react": "^0.244.0",
    "date-fns": "^2.30.0",
    "@stripe/stripe-js": "^1.54.0",
    "clsx": "^1.2.1",
    "tailwind-merge": "^1.12.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.37",
    "@types/react-dom": "^18.0.11",
    "@typescript-eslint/eslint-plugin": "^5.59.0",
    "@typescript-eslint/parser": "^5.59.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.38.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.3.4",
    "postcss": "^8.4.23",
    "prettier": "^2.8.8",
    "prettier-plugin-tailwindcss": "^0.3.0",
    "tailwindcss": "^3.3.2",
    "typescript": "^5.0.2",
    "vite": "^4.3.9",
    "vite-plugin-pwa": "^0.16.4"
  }
}
```

---

## 🔐 Environment Variables

### Development (`.env.local`)
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Production (Vercel Environment Variables)
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**Important:**
- Never commit `.env.local` to Git
- Add to `.gitignore`
- Use different keys for dev/prod
- Prefix with `VITE_` for client-side access

---

## 📁 Project Structure

```
fit-track-app/
├── public/                    # Static assets
│   ├── favicon.ico
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json         # PWA manifest
│   └── robots.txt
│
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   ├── features/        # Feature-specific components
│   │   │   ├── workout/
│   │   │   ├── program/
│   │   │   ├── progress/
│   │   │   └── community/
│   │   └── layout/          # Layout components
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Navigation.tsx
│   │
│   ├── pages/               # Route pages
│   │   ├── Home.tsx
│   │   ├── WorkoutExecution.tsx
│   │   ├── ProgramCreation.tsx
│   │   ├── ProgressDashboard.tsx
│   │   └── ...
│   │
│   ├── lib/                 # Utilities & helpers
│   │   ├── supabase.ts     # Supabase client
│   │   ├── stripe.ts       # Stripe utilities
│   │   └── utils.ts        # Helper functions
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useWorkout.ts
│   │   └── useTimer.ts
│   │
│   ├── store/               # Zustand stores
│   │   ├── workout-store.ts
│   │   ├── user-store.ts
│   │   └── ui-store.ts
│   │
│   ├── types/               # TypeScript types
│   │   ├── database.ts     # Supabase types
│   │   ├── models.ts       # App models
│   │   └── index.ts
│   │
│   ├── styles/              # Global styles
│   │   └── globals.css
│   │
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── router.tsx           # Route configuration
│
├── docs/                     # Documentation
│   ├── 00-PROJECT-OVERVIEW.md
│   ├── 01-TECH-STACK.md
│   ├── wireframes/          # HTML wireframes
│   └── ...
│
├── .env.local               # Environment variables (not in Git)
├── .gitignore               # Git ignore file
├── index.html               # HTML entry point
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind config
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
└── README.md                # Project README
```

---

## 🚦 Getting Started

### Prerequisites
```bash
# Node.js 18+ required
node --version  # Should be v18.x.x or higher

# npm comes with Node
npm --version   # Should be 9.x.x or higher
```

### Initial Setup
```bash
# 1. Clone repository
git clone https://github.com/YOUR-USERNAME/fit-track-app.git
cd fit-track-app

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Then edit .env.local with your actual credentials

# 4. Start development server
npm run dev

# Open http://localhost:5173
```

### Available Scripts
```bash
npm run dev      # Start dev server (hot reload)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

---

## 🎓 Learning Resources

### React & TypeScript
- [React Docs](https://react.dev) - Official React documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Learn TypeScript
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs) - Complete Tailwind reference
- [Tailwind UI](https://tailwindui.com/) - Premium components (paid)

### Supabase
- [Supabase Docs](https://supabase.com/docs) - Complete Supabase guide
- [Supabase YouTube](https://www.youtube.com/c/supabase) - Video tutorials

### Stripe
- [Stripe Docs](https://stripe.com/docs) - Payment integration guide
- [Stripe Testing](https://stripe.com/docs/testing) - Test card numbers

---

## 💰 Cost Breakdown

### Development (FREE)
- React, TypeScript, Vite: **$0**
- Tailwind CSS: **$0**
- Supabase: **$0** (free tier: 500MB database, 2GB storage)
- Vercel: **$0** (free tier: unlimited hobby projects)
- Git + GitHub: **$0** (free public repositories)

### Production (Month 1-3)
- Supabase: **$0** (likely stay in free tier)
- Vercel: **$0** (likely stay in free tier)
- Domain: **$1/month** ($12/year)
- Stripe: **$0** (only pay 2.9% + $0.30 when you make sales)

**Total: $1/month initially**

### Scaling (When You Grow)
- Supabase Pro: **$25/month** (8GB database, 100GB storage)
- Vercel Pro: **$20/month** (better performance, analytics)
- Stripe: **2.9% + $0.30 per transaction**

**Example at $1,000 MRR:**
- Supabase: $25
- Vercel: $20
- Stripe fees: ~$35 (2.9% of $1,000)
- **Total: $80/month** (92% profit margin!)

---

## 🤝 Support

**Need help?**
- Check documentation in `/docs`
- Review wireframes in `/docs/wireframes`
- Ask Claude Code for help
- Open a GitHub issue

**Have questions?**
- Email: [your-email]
- Discord: [coming soon]

---

**Last Updated:** November 2024
