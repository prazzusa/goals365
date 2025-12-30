# GoalSync (Goals365) - End-to-End Feature Prompts

This document contains comprehensive feature prompts for AI tools to understand and refine the GoalSync application. Each prompt describes a complete feature workflow from user perspective to technical implementation.

---

## 1. USER AUTHENTICATION & ONBOARDING FLOW

### Prompt:
"Build a complete user authentication and onboarding system for a goal-tracking application. The system should:

**Authentication Flow:**
- Provide email/password authentication with Supabase Auth
- Support sign up, sign in, forgot password, and reset password flows
- Store user metadata (full_name, email) in Supabase profiles table
- Implement protected routes that redirect unauthenticated users to /auth
- Show loading states during authentication checks

**Onboarding Flow (4 Steps):**
1. **Step 1 - Category Selection**: User selects 1-3 life categories (Personal Growth, Professional Growth, Fitness & Wellness). Free tier limited to 1 category, premium allows all 3. Show info badge when limit reached.
2. **Step 2 - Experience Level**: User selects experience level (Beginner, Intermediate, Advanced) with descriptions and icons
3. **Step 3 - Time Commitment**: User selects daily time available (10 min, 15 min, 30 min, 60+ min) with descriptions
4. **Step 4 - Motivation Style**: User selects coaching style (Gentle, Structured, Challenging) with emoji icons

**Onboarding Logic:**
- Save progress to `onboarding_progress` table with step tracking
- Determine user archetype based on selections (Explorer, Builder, Rebalancer, Achiever, Harmonizer)
- Save preferences to `user_preferences` table (categories, experience_level, daily_time, motivation_style, archetype)
- Create starter daily goals based on selected categories and experience level (1-2 goals per category)
- Show welcome reveal screen with archetype, user name, and goals created count
- Redirect to dashboard after completion

**Technical Requirements:**
- Use React Router for navigation
- Implement progress dots indicator (4 steps)
- Use framer-motion for smooth transitions between steps
- Store onboarding state in Supabase with RLS policies
- Handle errors gracefully with toast notifications"

---

## 2. QUARTERLY PLANNING FLOW (4 Steps)

### Prompt:
"Create a comprehensive quarterly planning system that breaks down annual goals into actionable quarterly, monthly, and weekly plans.

**Step 1 - Annual Vision & Goals:**
- User enters optional annual vision (textarea with voice input option)
- User creates minimum 4 annual goals with title and optional description
- Each goal has unique ID, title, and description fields
- Text inputs must be fully functional (handle placeholder goals that aren't in state yet)
- Show progress indicator (X/4+ goals completed)
- Continue button disabled until 4 goals with titles are created
- Use stable IDs for placeholder goals to prevent input remounting

**Step 2 - Quarter Assignment:**
- Drag-and-drop interface (Kanban board) with 4 quarter columns (Q1-Q4) plus Unassigned
- Each quarter shows month range (Jan-Mar, Apr-Jun, etc.)
- User drags annual goals into target quarters
- Show goal count per quarter
- Remove button (X) appears on hover for assigned goals
- 'AI Suggest Quarters' button analyzes unassigned goals and suggests optimal quarter assignments
- Continue button disabled until all goals assigned to quarters

**Step 3 - Monthly Breakdown:**
- User selects a quarter (Q1-Q4) to view goals
- For each goal in selected quarter, show 3-month breakdown suggestions
- Each month shows: month name, focus area, and 2-3 milestones
- 'AI Breakdown' button generates AI-powered monthly plans using Supabase Edge Function
- User can accept suggestions which creates quarterly goals with difficulty levels (light, balanced, stretch)
- Show accepted state with checkmark
- Continue button disabled until at least one breakdown accepted

**Step 4 - Weekly Action Plans:**
- User selects a goal from list (if multiple goals exist)
- Show 12 weeks of weekly suggestions grouped by theme (Foundation, Build, Accelerate, Complete)
- Each week shows: week number, focus area, and 3 actionable steps
- 'Generate AI Weekly Plan' button creates AI-powered weekly breakdowns
- User can accept suggestions for a goal
- Final 'Complete & Go to Dashboard' button marks planning as complete and navigates to dashboard

**Technical Requirements:**
- Save progress to `planning_progress` table (quarterly_step, quarterly_vision, selected_categories)
- Use framer-motion for animations and transitions
- Implement AI integration via Supabase Edge Function calling Lovable AI Gateway (Google Gemini)
- Handle loading states, errors, and fallbacks gracefully
- All step indicators show 'Step X of 4'"

---

## 3. AI-POWERED GOAL BREAKDOWN SYSTEM

### Prompt:
"Implement an AI-powered goal breakdown system that helps users divide high-level annual goals into quarterly, monthly, and weekly actionable plans.

**Supabase Edge Function (`breakdown-goal`):**
- Accept goal title, description, and breakdown type (quarterly, monthly, weekly, or all)
- Call Lovable AI Gateway (https://ai.gateway.lovable.dev) with Google Gemini 2.5 Flash Lite model
- System prompt instructs AI to break down goals into:
  - Quarterly: 4 quarters (Q1-Q4) with focus areas and 3 milestones each
  - Monthly: 12 months organized by quarter with focus and milestones
  - Weekly: 48 weeks (4 per month) with focus and 3 actionable steps
- Return structured JSON matching the breakdown type requested
- Handle rate limits, payment errors, and parsing errors gracefully
- Provide fallback structure if AI fails

**Integration Points:**
1. **Quarter Assignment**: Analyze goal keywords to suggest optimal quarter (Q1 for foundation/start, Q2-Q3 for build, Q4 for complete)
2. **Monthly Breakdown**: Generate contextual monthly plans based on goal type and quarter
3. **Weekly Plans**: Create detailed weekly action plans with progressive difficulty

**UI Features:**
- 'AI Suggest Quarters' button in quarter assignment step
- 'AI Breakdown' button for each goal in monthly breakdown step
- 'Generate AI Weekly Plan' button in weekly guidance step
- Loading states with spinner and 'Generating...' text
- Toast notifications for success/error states
- Fallback to pattern-matching suggestions if AI unavailable
- Show 'AI-generated' label when AI suggestions are used

**Technical Requirements:**
- Use Supabase Functions client to invoke edge function
- Store AI suggestions in component state
- Replace default suggestions when AI suggestions available
- Handle async operations with proper error boundaries"

---

## 4. DASHBOARD & MOMENTUM SCORING SYSTEM

### Prompt:
"Build a comprehensive dashboard that serves as the central hub for goal tracking with a momentum scoring system.

**Dashboard Layout:**
- Header with personalized greeting (Good morning/afternoon/evening) and user's first name
- Momentum Gauge component showing score (0-100%) with weekly change indicator
- Week Focus section showing current week's tasks with status (todo, in_progress, done)
- Month Focus section showing current month's goals with progress and priority
- Quarter Focus section showing quarterly/yearly goals with progress
- Action buttons: Set Goals, Update Goals, Track Progress
- Bottom navigation: Home (Dashboard) and Insights

**Momentum Score Calculation:**
- Calculate from 5 factors: Streak, Consistency, Effort, Recovery, Balance
- Streak: Current and longest consecutive days with completed goals
- Consistency: Percentage of days with activity in last 30 days
- Effort: Average progress score across all goals
- Recovery: Days since last missed goal
- Balance: Distribution across categories (personal, professional, fitness)
- Score ranges 0-1000, displayed as percentage (0-100%)
- Calculate weekly change (positive/negative percentage)
- Store in `momentum_scores` table with daily snapshots

**Data Fetching:**
- Fetch yearly goals from `yearly_goals` table
- Fetch monthly goals for current month/year from `monthly_goals` table
- Fetch weekly tasks for current week from `weekly_goals` table
- Calculate progress percentages dynamically
- Refresh data on component mount and after goal changes

**Interactive Features:**
- Toggle task completion status (todo ↔ done)
- Change task status (todo → in_progress → done)
- Navigate to detailed views (monthly planning, quarterly planning, insights)
- Real-time updates when tasks/goals change

**Technical Requirements:**
- Redirect to /planning if planning not completed
- Redirect to /auth if not authenticated
- Show loading states during data fetch
- Use date-fns for date calculations
- Implement optimistic UI updates"

---

## 5. MONTHLY PLANNING SYSTEM

### Prompt:
"Create a monthly planning interface that allows users to set and refine monthly objectives based on quarterly goals.

**Monthly Planning Flow:**
1. **Welcome Screen**: Show current month, allow user to select different month, or start planning
2. **Objectives Setting**: User creates monthly objectives linked to quarterly goals
   - Each objective has title, description, priority (low/medium/high)
   - Link to quarterly goal (optional)
   - Set progress tracking (0-100%)
3. **Goal Refinement**: User can refine objectives, adjust priorities, add milestones
4. **Sequencing**: User can reorder objectives by priority or drag to sequence

**Features:**
- Month selector to view/edit different months
- Create, edit, delete monthly objectives
- Link objectives to quarterly goals
- Set priority levels with visual indicators
- Track progress with progress bars
- Save to `monthly_goals` table with month, year, progress, priority, category
- Navigate to weekly planning after completion

**Technical Requirements:**
- Use Supabase for data persistence
- Implement step tracking in `planning_progress` table
- Use framer-motion for smooth transitions
- Handle month/year calculations correctly
- Show validation errors for required fields"

---

## 6. WEEKLY PLANNING & TASK MANAGEMENT

### Prompt:
"Build a weekly planning system for breaking down monthly goals into actionable weekly tasks.

**Weekly Planning Features:**
- Show current week date range (e.g., "Jan 1 - Jan 7")
- Display weekly focus area
- Create weekly tasks linked to monthly goals
- Each task has: title, effort level (S/M/L), status (todo/in_progress/done), category
- Drag-and-drop task reordering
- Task status management with visual indicators
- Link tasks to monthly goals
- Show task count and completion percentage

**Task Management:**
- Create new tasks with title and effort estimation
- Update task status (todo → in_progress → done)
- Delete tasks
- Reorder tasks by dragging
- Filter by status or category
- Show effort indicators (Small/Medium/Large) with icons

**Mid-Week Refinement:**
- Mid-week check-in option
- Reflect on what's working
- Identify blockers
- Adjust task priorities
- Update task statuses

**Technical Requirements:**
- Store in `weekly_goals` table with week_start date, effort, status, category
- Calculate week start using date-fns (startOfWeek)
- Implement drag-and-drop with HTML5 drag API
- Save task order and status changes immediately
- Show loading states during operations"

---

## 7. DAILY GOALS & CHECK-IN SYSTEM

### Prompt:
"Create a daily goals tracking system with check-in functionality for habit building.

**Daily Goals Features:**
- View today's goals by category (Personal, Professional, Fitness)
- Create new daily goals with title, category, optional notes
- Track progress with 0-5 scale (0=not started, 5=completed)
- Mark goals as completed
- Add notes/reflections to goals
- Link daily goals to weekly goals (optional)

**Daily Check-In:**
- Quick check-in interface
- Mark goals complete/incomplete
- Update progress scores
- Add daily notes
- View completion streak
- See daily insights

**Daily Dashboard:**
- Show all goals for current date
- Group by category with visual separation
- Progress indicators for each goal
- Quick actions (complete, edit, delete)
- Daily insight card with motivational message
- Completion percentage for the day

**Technical Requirements:**
- Store in `daily_goals` table with date, category, title, progress (0-5), completed boolean, notes
- Link to weekly_goal_id if applicable
- Calculate daily completion percentage
- Show streak information
- Filter by date (today, yesterday, specific date)
- Real-time updates when goals change"

---

## 8. PROGRESS INSIGHTS & ANALYTICS

### Prompt:
"Build a comprehensive progress insights page showing user's goal achievement analytics.

**Insights Dashboard:**
- Overall progress overview with charts
- Category breakdown (Personal, Professional, Fitness) with progress percentages
- Time period filters (Week, Month, Quarter, Year)
- Trend charts showing progress over time
- Completion rates by category
- Streak information (current and longest)
- Momentum score history graph

**Analytics Features:**
- Progress by category (pie/bar charts)
- Completion rate trends (line chart)
- Goal achievement timeline
- Most productive days/weeks
- Category balance visualization
- Momentum score progression

**Daily Insights:**
- Personalized insights based on user's progress
- Motivational messages
- Suggestions for improvement
- Celebration of milestones
- Store in `daily_insights` table

**Technical Requirements:**
- Use chart library (recharts or similar) for visualizations
- Aggregate data from daily_goals, weekly_goals, monthly_goals tables
- Calculate statistics (averages, trends, percentages)
- Filter by date ranges
- Show loading states during data aggregation
- Handle empty states gracefully"

---

## 9. WEEKLY REVIEW & REFLECTION

### Prompt:
"Create a weekly review system for users to reflect on their progress and plan ahead.

**Weekly Review Flow:**
1. **Progress Overview**: Show week's completion statistics, goals achieved, tasks completed
2. **What Worked**: User reflects on successes, what went well, positive patterns
3. **Challenges**: User identifies blockers, difficulties, areas for improvement
4. **Insights**: System-generated insights based on week's data
5. **Next Week Planning**: Preview of upcoming week's goals, opportunity to adjust

**Review Features:**
- Show week date range
- Display completion statistics (tasks done, goals achieved, momentum change)
- Text areas for reflection (what worked, challenges)
- AI-generated insights based on week's performance
- Option to adjust next week's goals
- Save review to database
- Navigate to weekly planning after review

**Technical Requirements:**
- Store weekly reviews in database
- Calculate week statistics from goals/tasks
- Generate insights from momentum scores and completion data
- Link reviews to specific week
- Allow editing previous reviews"

---

## 10. GOAL MANAGEMENT SYSTEM (Category-Specific)

### Prompt:
"Build category-specific goal management pages for Personal, Professional, and Fitness goals.

**Goal Management Features:**
- View all goals for selected category
- Filter by status (active, completed, archived)
- Create new goals with category-specific fields
- Edit existing goals
- Delete goals with confirmation
- Reorder goals by dragging
- View goal details and progress

**Category-Specific Features:**

**Personal Goals:**
- Standard goal fields (title, description, progress)
- Habit tracking options
- Personal growth metrics

**Professional Goals:**
- Career-related fields
- Skill development tracking
- Project milestones

**Fitness Goals:**
- Exercise logging integration
- Nutrition tracking (optional)
- Workout plan linking
- Exercise classification via AI (strength/cardio/flexibility)
- Food database integration
- Calories tracking

**Technical Requirements:**
- Store in `yearly_goals` table with category field
- Implement category filtering
- Use Supabase RLS for data security
- Handle goal relationships (yearly → monthly → weekly → daily)
- Show progress indicators
- Implement search/filter functionality"

---

## 11. PREMIUM FEATURES & SUBSCRIPTION SYSTEM

### Prompt:
"Implement a premium subscription system with feature gating and tier management.

**Premium Tiers:**
- **Free Tier**: Limited to 1 category, basic features, limited goals
- **Premium Tier**: All 3 categories, unlimited goals, advanced features, full momentum score

**Feature Gating:**
- Check premium status on relevant pages
- Show upgrade prompts when free users hit limits
- Display tier badges
- Subtle upsell prompts in UI
- Feature gates with upgrade CTAs

**Premium Features:**
- Multiple categories (Personal, Professional, Fitness)
- Unlimited goals per category
- Advanced analytics and insights
- Full momentum score calculation
- Priority support
- Export functionality

**Technical Requirements:**
- Store premium status in user profile or separate subscription table
- Use `usePremium` hook to check status throughout app
- Show upgrade modals/prompts at appropriate times
- Handle subscription management (if integrated with payment provider)
- Show tier badges in UI
- Implement feature gates with clear messaging"

---

## 12. VOICE INPUT INTEGRATION

### Prompt:
"Integrate voice input functionality for hands-free goal entry and note-taking.

**Voice Input Features:**
- Voice-to-text transcription using Web Speech API
- Microphone button in text areas
- Real-time transcription display
- Start/stop recording controls
- Error handling for microphone permissions
- Fallback to manual input if voice unavailable

**Integration Points:**
- Annual vision textarea
- Goal title/description inputs
- Daily notes/reflections
- Weekly review reflections

**Technical Requirements:**
- Use `useSpeechRecognition` hook
- Handle browser compatibility (Chrome, Safari, Edge)
- Request microphone permissions
- Show recording state (visual indicator)
- Handle errors gracefully
- Append transcribed text to existing content or replace"

---

## 13. MOMENTUM SCORE CALCULATION (Backend)

### Prompt:
"Create a Supabase Edge Function to calculate user momentum scores from goal completion data.

**Calculation Logic:**
- **Streak**: Count consecutive days with completed goals (current and longest)
- **Consistency**: Percentage of active days in last 30 days
- **Effort**: Average progress score (0-5) across all goals
- **Recovery**: Days since last missed goal (inverse calculation)
- **Balance**: Even distribution across categories (penalize if too focused on one)

**Edge Function (`calculate-momentum`):**
- Accept user_id from authenticated request
- Fetch all daily_goals for user
- Calculate each factor (0-200 points each, total 0-1000)
- Store result in `momentum_scores` table with timestamp
- Return score breakdown and weekly change
- Handle errors and edge cases (no goals, insufficient data)

**Technical Requirements:**
- Use Supabase Auth to verify user
- Implement RLS policies for data access
- Calculate daily snapshots
- Compare with previous week for change calculation
- Handle division by zero and null values
- Return structured JSON response"

---

## 14. EXERCISE CLASSIFICATION AI SYSTEM

### Prompt:
"Build an AI-powered exercise classification system for fitness goal tracking.

**Supabase Edge Function (`classify-exercise`):**
- Accept exercise name from request
- Call Lovable AI Gateway with Google Gemini model
- System prompt classifies exercise into: strength, cardio, or flexibility
- Return classification with metadata:
  - Type (strength/cardio/flexibility)
  - Requires sets (boolean)
  - Requires reps (boolean)
  - Requires duration (boolean)
  - Suggested calories per minute

**Integration:**
- Auto-classify when user enters exercise name
- Pre-fill form fields based on classification
- Show appropriate input fields (sets/reps for strength, duration for cardio/flexibility)
- Calculate calories based on duration and suggested rate

**Technical Requirements:**
- Handle AI errors gracefully with fallback defaults
- Show loading state during classification
- Store classification with exercise log
- Use in AddFitnessGoals page"

---

## 15. DATA ARCHITECTURE & RELATIONSHIPS

### Prompt:
"Design and implement a comprehensive database schema for goal tracking with proper relationships.

**Core Tables:**
1. **yearly_goals**: Annual goals with category, title, description, position
2. **monthly_goals**: Monthly objectives linked to yearly_goals, with month/year, progress, priority, category
3. **weekly_goals**: Weekly tasks linked to monthly_goals, with week_start, effort, status, category
4. **daily_goals**: Daily habits linked to weekly_goals, with date, progress (0-5), completed, notes

**Supporting Tables:**
- **profiles**: User profile data
- **onboarding_progress**: Onboarding step tracking
- **planning_progress**: Quarterly/monthly/weekly planning state
- **user_preferences**: User settings and archetype
- **momentum_scores**: Daily momentum score snapshots
- **daily_insights**: Personalized daily insights
- **exercise_logs**: Fitness exercise tracking
- **food_logs**: Nutrition tracking

**Relationships:**
- yearly_goals → monthly_goals (CASCADE delete)
- monthly_goals → weekly_goals (CASCADE delete)
- weekly_goals → daily_goals (SET NULL on delete)
- All tables linked to user_id with RLS policies

**Technical Requirements:**
- Implement Row Level Security (RLS) on all tables
- Create foreign key constraints
- Add indexes on frequently queried fields (user_id, date, category)
- Use UUIDs for primary keys
- Add created_at and updated_at timestamps
- Implement update triggers for updated_at"

---

## 16. UI/UX DESIGN SYSTEM

### Prompt:
"Create a cohesive design system for the goal tracking application with modern, accessible UI components.

**Design Principles:**
- Clean, minimal interface with focus on content
- Smooth animations using framer-motion
- Responsive design (mobile-first)
- Dark mode support
- Accessible color contrast
- Clear visual hierarchy

**Component Library (shadcn/ui):**
- Buttons with variants (default, outline, ghost, destructive)
- Input fields with validation states
- Textareas with character limits
- Cards for goal display
- Progress indicators (rings, bars, gauges)
- Toast notifications for feedback
- Modals and dialogs for confirmations
- Dropdowns and selects for choices
- Tabs for navigation
- Accordions for collapsible content

**Color System:**
- Primary color for CTAs and highlights
- Category colors: Personal (rose/pink), Professional (blue/emerald), Fitness (amber/orange)
- Status colors: Success (green), Warning (amber), Error (red)
- Muted colors for secondary text and backgrounds

**Typography:**
- Display font for headings
- System font for body text
- Clear size hierarchy (xs, sm, base, lg, xl, 2xl)
- Proper line heights and spacing

**Spacing & Layout:**
- Consistent padding and margins
- Max-width containers for readability
- Safe area insets for mobile
- Fixed bottom navigation
- Sticky headers with backdrop blur"

---

## 17. NAVIGATION & ROUTING SYSTEM

### Prompt:
"Implement a comprehensive routing system with protected routes and navigation flows.

**Route Structure:**
- `/` - Landing page (Index)
- `/pricing` - Pricing page
- `/auth` - Authentication (sign up/in)
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form
- `/onboarding` - Onboarding flow (4 steps)
- `/planning` - Quarterly planning (4 steps)
- `/monthly` - Monthly planning
- `/weekly` - Weekly planning
- `/review` - Weekly review
- `/dashboard` - Main dashboard (protected)
- `/insights` - Progress insights (protected)
- `/goals` - Goals list (protected)
- `/goals/:category` - Category-specific goals
- `/addgoals/fitness` - Add fitness goals
- `/addgoals/personal` - Add personal goals
- `/addgoals/professional` - Add professional goals

**Route Protection:**
- Redirect unauthenticated users to `/auth`
- Redirect users who haven't completed onboarding to `/onboarding`
- Redirect users who haven't completed planning to `/planning`
- Show 404 page for unknown routes

**Navigation Components:**
- Bottom navigation bar (Dashboard, Insights)
- Back buttons in multi-step flows
- Breadcrumbs for complex flows
- Progress indicators for multi-step processes

**Technical Requirements:**
- Use React Router v6
- Implement route guards with useEffect hooks
- Show loading states during auth checks
- Handle navigation state preservation
- Use Link components for internal navigation"

---

## 18. STATE MANAGEMENT & DATA FETCHING

### Prompt:
"Implement efficient state management and data fetching patterns throughout the application.

**State Management Strategy:**
- Local component state for UI state (modals, forms, selections)
- React Query for server state (goals, progress, momentum)
- Context API for global state (Auth, Premium status)
- URL state for filters and navigation

**Data Fetching:**
- Use Supabase client for all database operations
- Implement React Query for caching and refetching
- Show loading states during fetches
- Handle errors with toast notifications
- Optimistic updates for better UX

**Hooks Pattern:**
- `useAuth` - Authentication state and methods
- `useOnboarding` - Onboarding progress management
- `usePlanningProgress` - Planning flow state
- `useMomentum` - Momentum score fetching
- `usePremium` - Premium status checking
- `useGoals` - Goal CRUD operations
- `useSpeechRecognition` - Voice input

**Technical Requirements:**
- Implement proper TypeScript types for all data
- Handle loading and error states consistently
- Use React Query's cache invalidation
- Implement optimistic updates where appropriate
- Debounce search/filter inputs
- Batch related API calls"

---

## 19. ERROR HANDLING & VALIDATION

### Prompt:
"Implement comprehensive error handling and form validation throughout the application.

**Error Handling:**
- Network errors: Show user-friendly messages, retry options
- Authentication errors: Redirect to login, clear session
- Permission errors: Show upgrade prompts for premium features
- Validation errors: Show inline field errors
- AI service errors: Fallback to default suggestions, show error toast

**Form Validation:**
- Required field validation
- Email format validation
- Password strength requirements
- Goal title length limits
- Date range validation
- Progress value bounds (0-5, 0-100)

**Error Display:**
- Toast notifications for global errors
- Inline error messages for form fields
- Error boundaries for React errors
- Loading states during operations
- Success confirmations for actions

**Technical Requirements:**
- Use React Hook Form for form validation
- Implement error boundaries
- Log errors to console in development
- Show user-friendly error messages
- Provide retry mechanisms
- Handle edge cases (empty states, null values)"

---

## 20. PERFORMANCE OPTIMIZATION

### Prompt:
"Optimize application performance for fast loading and smooth interactions.

**Performance Strategies:**
- Code splitting with React.lazy for route-based splitting
- Image optimization and lazy loading
- Debounce search and filter inputs
- Memoize expensive calculations
- Virtualize long lists
- Optimize re-renders with React.memo
- Use React Query caching effectively

**Bundle Optimization:**
- Tree shaking unused code
- Minimize bundle size
- Lazy load heavy components
- Optimize third-party imports

**Runtime Performance:**
- Debounce API calls
- Batch state updates
- Use useMemo for expensive computations
- Use useCallback for stable function references
- Optimize animations with will-change CSS

**Technical Requirements:**
- Use Vite for fast builds
- Implement code splitting
- Monitor bundle size
- Use React DevTools Profiler
- Optimize database queries
- Implement pagination for large datasets"

---

## SUMMARY

This application is a comprehensive goal-tracking system (GoalSync/Goals365) that helps users:
1. Set annual goals across Personal, Professional, and Fitness categories
2. Break down goals into quarterly, monthly, weekly, and daily actionable items
3. Track progress with a momentum scoring system
4. Use AI to intelligently break down goals
5. Review and reflect on progress regularly
6. View insights and analytics

**Tech Stack:**
- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- Backend: Supabase (PostgreSQL, Auth, Edge Functions, RLS)
- AI: Lovable AI Gateway with Google Gemini 2.5 Flash Lite
- State: React Query, Context API
- Routing: React Router v6

**Key Features:**
- Multi-tier goal hierarchy (Yearly → Quarterly → Monthly → Weekly → Daily)
- AI-powered goal breakdown suggestions
- Momentum scoring algorithm
- Category-based goal organization
- Premium subscription system
- Voice input for goal entry
- Comprehensive analytics and insights
- Drag-and-drop interfaces
- Real-time progress tracking

