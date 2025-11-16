# 🤖 Claude Code Quick Start Guide

## What is Claude Code?

Claude Code is an AI-powered coding assistant that works directly in your terminal. Think of it as having an expert developer pair programming with you - but this developer has read all your wireframes, understands your vision, and can write code matching your designs exactly.

---

## ✅ Prerequisites Checklist

Before starting with Claude Code, make sure you have:

- [ ] **All wireframes uploaded to GitHub**
  - Located in: `docs/wireframes/`
  - All 20 HTML files should be there

- [ ] **Documentation files created**
  - `docs/00-PROJECT-OVERVIEW.md`
  - `docs/01-TECH-STACK.md`
  - `README.md` with basic project info

- [ ] **Supabase project ready**
  - Project URL copied
  - Anon key copied
  - Service role key copied (for migrations)

- [ ] **Vercel connected**
  - Repository connected to Vercel
  - Environment variables set
  - Auto-deploy configured

- [ ] **Repository cloned locally**
  ```bash
  git clone https://github.com/YOUR-USERNAME/fit-track-app.git
  cd fit-track-app
  ```

- [ ] **Claude Code installed**
  ```bash
  # Installation varies by platform
  # Follow official Claude Code installation guide
  ```

---

## 🚀 Starting Your First Claude Code Session

### Step 1: Open Terminal in Project Directory

```bash
cd fit-track-app
```

### Step 2: Start Claude Code

```bash
claude-code
```

### Step 3: Give Claude Code Context

**IMPORTANT:** The first message you send sets the entire context for your session. Be comprehensive!

Copy and paste this prompt (customize with your details):

```
Hi Claude! I'm building "Fit Track App" - a fitness tracking web application.

=== PROJECT CONTEXT ===

Please start by reading these files to understand the project:

1. docs/00-PROJECT-OVERVIEW.md - Complete project vision & features
2. docs/01-TECH-STACK.md - Technology choices & setup
3. All 20 HTML wireframes in docs/wireframes/ - Complete UI designs

KEY INFORMATION:
- This is a universal fitness tracking app for ANY workout style
- Users create custom programs OR use pre-made ones
- Flexible tracking (users choose which metrics to track)
- Smart progressive overload with user choice (never forced)
- 2-tier pricing: Free (1 program) vs Premium ($8.99/month unlimited)
- Progressive Web App (PWA) - no app stores

DESIGN SYSTEM:
- Purple/pink gradient theme (#9333EA to #EC4899)
- Mobile-first responsive design
- Clean, modern UI
- Consistent component patterns in wireframes

TECH STACK:
- React 18 + TypeScript + Vite
- Tailwind CSS (utility-first styling)
- Supabase (database + auth + storage)
- Zustand (state management)
- Stripe (payments)
- Vercel (hosting)

=== TASK ===

Let's initialize this project properly. Please:

1. Set up a React + TypeScript + Vite project with proper configuration
2. Install and configure Tailwind CSS matching the colors from wireframes
3. Set up the folder structure following best practices
4. Create the base component library (Button, Card, Input, Modal, etc.)
5. Configure Supabase client
6. Set up React Router with all routes

Before you start coding, can you confirm you can access and read:
- The PROJECT-OVERVIEW.md file
- The wireframe files
- Any other docs in the repository

Once confirmed, let's begin with the project initialization.
```

---

## 📝 How to Work with Claude Code

### Communication Pattern

Claude Code works best with clear, specific requests:

#### ❌ Bad Request:
"Make the app"

#### ✅ Good Request:
"Create the Home Dashboard page matching wireframe-home-dashboard.html. Include:
- Header with user greeting and level
- Current streak card
- Active programs card with workout cards
- Bottom navigation
Use Tailwind classes and match the purple/pink gradient exactly."

---

### Iterative Development Workflow

**Think in features, not files:**

```
Session 1: Project Setup
→ "Initialize project with all configs"
→ Review output
→ "Looks good! Let's move to components"

Session 2: Component Library
→ "Create Button component matching wireframe styles"
→ Review
→ "Perfect! Now create Card component"
→ Review
→ "Great! Now Modal component"

Session 3: First Page
→ "Build Home Dashboard page using the components we created"
→ Review
→ "The workout cards need more spacing. Let's adjust"
→ Review
→ "Perfect! Let's commit this"
```

**Key Principle:** Build → Review → Adjust → Commit → Repeat

---

## 🎯 Essential Commands & Phrases

### When Starting a New Feature:
```
"Let's work on [feature name]. First, show me what components we'll need."
```

### When Referencing Wireframes:
```
"Look at wireframe-[name].html and build the [component] matching that design exactly."
```

### When You Don't Understand:
```
"Can you explain why you structured it this way?"
"What does this code do?"
"Is there a simpler way to do this?"
```

### When Something Isn't Right:
```
"The spacing doesn't match the wireframe. Let's adjust."
"This color isn't right. It should be the purple gradient from Tailwind config."
"The mobile view is broken. Let's fix the responsive design."
```

### When You Want to Review:
```
"Before we continue, let me test this locally."
"Show me what we've built so far."
"What files have we created/modified?"
```

### When Ready to Move On:
```
"This looks good! Let's commit and move to the next feature."
```

---

## 🗓️ Recommended Week-by-Week Plan

### Week 1: Foundation
```
Day 1-2: Project Setup
"Initialize project with React + TypeScript + Vite + Tailwind"
"Set up folder structure and base configs"
"Install all dependencies"

Day 3-4: Component Library
"Create Button component"
"Create Card component"
"Create Input component"
"Create Modal component"
"Create Loading states"

Day 5: Authentication
"Set up Supabase auth"
"Create login/signup pages"
"Add protected route logic"

Weekend: Test & Review
- Make sure everything works
- Review code quality
- Commit everything to Git
```

### Week 2-3: Core Pages
```
"Build Home Dashboard matching wireframe-home-dashboard.html"
"Build Workout Execution page matching wireframe-workout-execution.html"
"Build Exercise Card component matching wireframe-exercise-card.html"
"Add Rest Timer functionality"
"Create Progression/Regression modals"
```

### Week 4-5: Program Creation
```
"Build Unified Program Creation page with 3-tab interface"
"Implement tab switching"
"Add exercise selection from library"
"Create workout day builder"
"Add calendar scheduler"
```

### Week 6-7: Libraries & Progress
```
"Build Exercise Library with search and filters"
"Build Workout Library with program browsing"
"Create Program Detail page"
"Build Progress Dashboard with charts"
"Add Workout History page"
```

### Week 8-9: Community & Gamification
```
"Build Community Hub"
"Add Friends List functionality"
"Create Leaderboard with tabs"
"Implement XP system"
"Add Achievement tracking"
```

### Week 10-11: Polish
```
"Integrate Stripe for subscriptions"
"Add PWA configuration"
"Optimize performance"
"Fix all bugs"
"Add loading states everywhere"
```

### Week 12: Launch Prep
```
"Final testing"
"Deploy to Vercel"
"Create launch materials"
"Go live! 🚀"
```

---

## 💡 Pro Tips

### 1. Reference Wireframes Explicitly
```
✅ "Look at wireframe-workout-execution.html, line 120-180. Build that Exercise Card component."
❌ "Make an exercise card."
```

### 2. Break Down Complex Features
```
✅ "The Workout Execution page has multiple parts. Let's build:
    1. Exercise Card first
    2. Then Rest Timer
    3. Then Set Logging
    4. Then assemble them together"
    
❌ "Build the entire workout execution page."
```

### 3. Test Frequently
```bash
# Start dev server often to test
npm run dev

# Check in browser: http://localhost:5173
```

### 4. Commit After Each Working Feature
```bash
git add .
git commit -m "Add Exercise Card component"
git push origin main
```

### 5. Ask for Code Reviews
```
"Review the WorkoutExecution component. Are there:
- Performance issues?
- Better patterns I should use?
- Accessibility problems?
- Security concerns?"
```

### 6. Request Explanations
```
"I don't understand how this useEffect works. Can you explain it step by step?"
```

### 7. Use Specific Tailwind Classes
```
✅ "Use bg-gradient-to-r from-purple-600 to-pink-500"
❌ "Make it purple and pink"
```

### 8. Think Mobile-First
```
"Build this for mobile first, then add desktop responsive classes."
```

---

## 🐛 Common Issues & Solutions

### Issue: Claude Code can't see wireframes
**Solution:**
```
"Can you see the file docs/wireframes/wireframe-home-dashboard.html?"
If no → Make sure files are pushed to GitHub
If yes → Continue building
```

### Issue: Supabase connection fails
**Solution:**
```
"Let's check the .env.local file. Here are my credentials:
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

Can you verify the supabase client setup?"
```

### Issue: Styles don't match wireframes
**Solution:**
```
"The colors in wireframe-home-dashboard.html are #9333EA and #EC4899.
Let's update tailwind.config.js to match exactly."
```

### Issue: Build fails
**Solution:**
```
"I'm getting this error: [paste error]
Can you help me fix it?"
```

### Issue: Component not rendering
**Solution:**
```
"The Exercise Card isn't showing up. Here's what I see in the browser:
[describe what you see]

Here's the component code:
[share relevant code if helpful]

Can you debug this?"
```

---

## 📚 Session Templates

### Starting a New Day
```
"Good morning! Here's what I want to work on today:
[Feature/page name]

What do we need to build for this?"
```

### Ending a Day
```
"Let's wrap up for today. Can you summarize:
1. What we built
2. What's working
3. What we should tackle tomorrow
4. Any files I should commit"
```

### Stuck on Something
```
"I'm stuck on [problem]. Here's what I've tried:
- [attempt 1]
- [attempt 2]

Can you help me think through this differently?"
```

### Code Review
```
"Before we move on, can you review the code we just wrote for:
- Best practices
- Performance
- Accessibility
- Potential bugs
- TypeScript types"
```

---

## 🎓 What You'll Learn

Even though Claude Code writes the code, you'll naturally learn:

**Week 1-2:**
- How React components work
- JSX syntax
- Props and state
- Tailwind utility classes
- TypeScript basics

**Week 3-4:**
- State management patterns
- API integration
- Async operations
- Route navigation

**Week 5-6:**
- Complex state interactions
- Form handling
- Data validation
- Real-time updates

**Week 7-8:**
- Database queries
- Authentication flows
- Authorization patterns
- User permissions

**Week 9-12:**
- Performance optimization
- Payment processing
- PWA configuration
- Deployment strategies

**By the end:** You'll understand the codebase well enough to maintain and expand it!

---

## 🎯 Goals to Keep in Mind

### Short-term (Weeks 1-4)
- Get comfortable with Claude Code workflow
- Build confidence with each working feature
- Learn to read and understand the code
- Test frequently

### Medium-term (Weeks 5-8)
- Start making small modifications yourself
- Understand the patterns being used
- Be able to debug simple issues
- Write basic components independently

### Long-term (Weeks 9-12)
- Maintain the app confidently
- Add new features with Claude Code's help
- Understand most of the codebase
- Make informed technical decisions

---

## 📞 Getting Help

**When you're stuck:**

1. **Ask Claude Code:**
   "I don't understand [concept]. Can you explain it simply?"

2. **Review Documentation:**
   - React docs
   - Tailwind docs
   - Supabase docs

3. **Check Wireframes:**
   - Look at the HTML
   - Inspect the structure
   - Check the styling

4. **Test in Browser:**
   - What's actually happening?
   - What errors in console?
   - What does the network tab show?

5. **Take a Break:**
   - Step away
   - Come back fresh
   - Often clarity comes with rest

---

## 🚀 You're Ready!

**Checklist before starting:**
- [ ] Repository cloned locally
- [ ] All wireframes in `docs/wireframes/`
- [ ] Documentation files created
- [ ] Supabase credentials ready
- [ ] Claude Code installed
- [ ] Excited to build! 💪

**First command:**
```bash
cd fit-track-app
claude-code
```

**First message to Claude Code:**
Use the comprehensive prompt from Step 3 above!

---

**Remember:** This is a marathon, not a sprint. Build steadily, learn continuously, and celebrate every working feature. You've got this! 🎉

**Happy building!** 🚀
