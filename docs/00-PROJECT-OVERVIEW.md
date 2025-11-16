# Fit Track App - Project Overview

## 🎯 Vision

A universal fitness tracking web app that empowers users to create, track, and optimize their fitness journey regardless of their workout style.

### Who Is This For?

**Perfect for people who:**
- Follow YouTube workout programs and need tracking
- Create their own custom training plans
- Switch between different fitness disciplines
- Want detailed progress analytics
- Need flexible workout tracking that adapts to their needs

### What Makes It Different?

Unlike rigid fitness apps that force you into predefined templates, Fit Track App gives you complete freedom:
- Create programs for ANY fitness discipline
- Track ANY metrics you choose per exercise
- Build your own progression strategies
- Share and discover community programs
- Track progress with meaningful analytics

---

## 🏗️ Key Features

### 1. **Universal Program Creation**
- Create custom programs with any structure
- Support for all workout styles:
  - Gym training (bodybuilding, powerlifting, Olympic lifting)
  - Calisthenics & bodyweight training
  - Cardio programs (running, cycling, swimming)
  - Yoga & flexibility routines
  - CrossFit, circuit training, HIIT
  - Sports-specific training
  - And anything else you can imagine!

### 2. **Intelligent Workout Tracking**
- Flexible metric tracking per exercise:
  - Weight & reps (strength training)
  - Time & distance (cardio)
  - Hold duration (isometrics, planks)
  - Perceived exertion (RPE)
  - Custom metrics you define
- Rest timer with custom intervals
- Automatic set history pre-filling
- Notes & feedback per workout

### 3. **Smart Progressive Overload**
- Detects when you're ready to progress
- Suggests weight/rep increases based on performance
- Presents options, never forces changes
- User maintains full control of progression
- Science-backed conditional formulas

### 4. **Comprehensive Progress Analytics**
- Exercise-specific progress charts
- Personal record tracking
- Volume & intensity trends
- Strength curves over time
- Workout consistency metrics
- Achievement milestones

### 5. **Workout & Exercise Libraries**
- Browse curated programs by goal
- Filter by:
  - Fitness goal (build muscle, lose weight, gain strength, etc.)
  - Experience level (beginner, intermediate, advanced)
  - Equipment available
  - Time commitment
  - Training style
- Searchable exercise library with:
  - Video demonstrations
  - Form cues & tips
  - Muscle groups targeted
  - Equipment needed

### 6. **Community & Gamification**
- Fair XP system based on achievements, not raw numbers
- Weekly/monthly/all-time leaderboards
- Friend system with activity feeds
- Workout streaks & consistency tracking
- Achievement badges & milestones
- Celebration screens for PRs and milestones

### 7. **Flexible Subscription Model**

#### Free Tier:
- 1 active program
- Unlimited workouts
- Basic progress tracking
- Exercise library access
- Mobile-optimized PWA

#### Premium Tier ($8.99/month):
- Unlimited active programs
- Advanced analytics & charts
- Full workout library access
- Community features (friends, leaderboards)
- Priority support
- Early access to new features

**Philosophy:** Free tier is genuinely useful, not a trial. When users hit limits, data is archived (read-only), never deleted.

---

## 💻 Technical Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite (fast, modern)
- **Styling:** Tailwind CSS (utility-first)
- **State Management:** Zustand (lightweight, simple)
- **Routing:** React Router 6
- **Forms:** React Hook Form
- **Charts:** Recharts
- **Icons:** Lucide React
- **Dates:** date-fns

### Backend & Services
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (email, social login)
- **Storage:** Supabase Storage (exercise videos, user avatars)
- **Real-time:** Supabase Realtime (live updates)
- **Payments:** Stripe (subscriptions)
- **Email:** SendGrid (transactional emails)

### Deployment
- **Platform:** Vercel
- **Type:** Progressive Web App (PWA)
- **CI/CD:** Automatic deployment via GitHub integration
- **Domain:** TBD

### Development Tools
- **Version Control:** Git + GitHub
- **AI Assistant:** Claude Code (development partner)
- **Code Quality:** ESLint + Prettier
- **Testing:** Vitest + React Testing Library (Phase 2)

---

## 🎨 Design System

### Color Palette
- **Primary:** Purple gradient (#9333EA to #7E22CE)
- **Secondary:** Pink gradient (#EC4899 to #DB2777)
- **Neutrals:** Gray scale (Tailwind default)
- **Success:** Green (#10B981)
- **Warning:** Yellow (#F59E0B)
- **Error:** Red (#EF4444)

### Typography
- **Font Family:** Inter (system fallback: -apple-system, BlinkMacSystemFont)
- **Headings:** Bold, large sizes for hierarchy
- **Body:** Regular weight, 16px base
- **Small Text:** 14px for metadata

### Components
- **Buttons:** Rounded, gradient backgrounds, clear hover states
- **Cards:** White background, subtle shadow, rounded corners
- **Inputs:** Clean borders, focus states with purple ring
- **Modals:** Centered overlay, smooth animations
- **Navigation:** Fixed footer on mobile, persistent on desktop

### Principles
- **Mobile-First:** Design for phones, enhance for desktop
- **Accessibility:** WCAG 2.1 AA compliance
- **Performance:** Fast load times, smooth animations
- **Consistency:** Reusable components, consistent patterns
- **Clarity:** Clear labels, helpful tooltips, intuitive flow

---

## 📊 Database Schema Overview

### Core Tables

**users**
- User profiles & preferences
- Subscription status
- XP & level

**programs**
- Custom workout programs
- Program metadata (name, description, goals)
- Creator info
- Public/private status

**workout_days**
- Individual workout days in a program
- Exercise assignments
- Set/rep schemes
- Rest periods

**exercises**
- Exercise library entries
- Video URLs
- Instructions & form cues
- Muscle groups targeted
- Equipment needed

**workout_logs**
- Completed workout data
- Sets, reps, weight, time, etc.
- User notes & feedback
- Timestamp

**achievements**
- User achievement tracking
- XP history
- Streaks
- Personal records

**friendships**
- Friend connections
- Activity sharing

**subscriptions**
- Stripe subscription data
- Payment history
- Plan details

---

## 🗓️ Development Roadmap

### Phase 1: MVP (Weeks 1-12)
**Goal:** Launch-ready app with core features

**Weeks 1-2: Foundation**
- [ ] Project setup (React + TypeScript + Vite)
- [ ] Tailwind configuration
- [ ] Component library (buttons, cards, inputs)
- [ ] Supabase integration
- [ ] Authentication flow

**Weeks 3-4: Core Features**
- [ ] Home Dashboard
- [ ] Workout Execution page
- [ ] Exercise Card component
- [ ] Rest Timer
- [ ] Workout logging

**Weeks 5-6: Program Management**
- [ ] Unified Program Creation (3-tab interface)
- [ ] Exercise selection
- [ ] Workout day configuration
- [ ] Schedule builder

**Weeks 7-8: Libraries**
- [ ] Exercise Library (browse, search, filter)
- [ ] Workout Library (pre-made programs)
- [ ] Program Detail pages

**Weeks 9-10: Analytics**
- [ ] Progress Dashboard
- [ ] Exercise history & charts
- [ ] Personal record tracking
- [ ] Workout history

**Weeks 11-12: Community & Polish**
- [ ] Friends system
- [ ] Leaderboards
- [ ] XP & achievements
- [ ] Stripe integration
- [ ] PWA setup
- [ ] Performance optimization
- [ ] Bug fixes & testing
- [ ] **LAUNCH! 🚀**

### Phase 2: Enhancement (Weeks 13-24)
- Advanced social features
- Program marketplace
- AI-powered workout suggestions
- Nutrition tracking integration
- Wearable device integration
- Mobile app (React Native)

### Phase 3: Scaling (Month 7+)
- Team/coach features
- White-label platform for gyms
- API for third-party integrations
- Advanced analytics & reporting

---

## 🎯 Success Metrics

### User Engagement
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Workout completion rate
- Average workouts per week
- Session duration

### Business
- Free to Premium conversion rate (target: 5-10%)
- Monthly Recurring Revenue (MRR)
- Customer Lifetime Value (LTV)
- Churn rate (target: <5% monthly)

### Product
- App load time (<2 seconds)
- Time to first workout (<5 minutes for new users)
- Bug report frequency
- User satisfaction score (NPS)

---

## 🚀 Go-to-Market Strategy

### Pre-Launch (Weeks 1-12)
- Build MVP
- Create landing page
- Gather email waitlist
- Beta testing with 50 users
- Iterate based on feedback

### Launch (Week 13)
- Product Hunt launch
- Reddit fitness communities
- Instagram/TikTok content creators
- Free tier heavily promoted

### Growth (Months 4-12)
- Content marketing (blog, YouTube)
- SEO optimization
- Referral program
- Influencer partnerships
- Paid ads (targeted)

---

## 📝 User Feedback Philosophy

**We prioritize:**
1. User agency (never force changes)
2. Flexibility (support diverse needs)
3. Simplicity (complex features, simple UX)
4. Fairness (equitable XP system)
5. Privacy (user data is sacred)

**We listen to:**
- Feature requests
- Pain points
- Workflow bottlenecks
- UI/UX confusion
- Performance issues

**We measure success by:**
- User retention
- Workout consistency
- Goal achievement
- Community engagement
- User happiness

---

## 🤝 Open to Feedback

This is a living document. As we build and learn, we'll update this overview to reflect our evolving vision.

**Questions? Ideas? Concerns?**
Open a GitHub issue or join our Discord community (coming soon).

---

## 📄 License

Proprietary - All rights reserved.
This is a commercial application in development.

---

**Built with ❤️ and lots of heavy lifting. 💪**
