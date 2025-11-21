# Browser Visibility Fix

## Problem

When users switched away from the browser to other apps and returned, dynamic content stopped loading. Only static elements (header, footer, titles) would render, but data-driven content failed to load.

### Root Cause

1. **No visibility detection** - The app didn't detect when users returned to the tab
2. **No session refresh** - Supabase auth sessions weren't refreshed on return
3. **No data reload triggers** - Pages didn't know they needed to reload data

Mobile browsers aggressively suspend inactive tabs to save battery and memory. When suspended:
- JavaScript execution pauses
- Network connections can drop
- Auth tokens may need refreshing

## Solution

Implemented comprehensive browser visibility handling:

### 1. Page Visibility Hook (`src/hooks/usePageVisibility.ts`)

Custom React hook that detects when the browser tab becomes visible or hidden:

```typescript
import { usePageVisibility } from '@/hooks/usePageVisibility'

// In component:
usePageVisibility(() => {
  // Called when tab becomes visible
  console.log('Tab is visible, refresh data')
})
```

**Features:**
- Uses `document.visibilitychange` event
- Fallback to `window.focus` event
- Callbacks for both visible and hidden states
- Automatic cleanup

### 2. Session Refresh (`src/stores/authStore.ts`)

Added `refreshSession()` method to auth store:

```typescript
refreshSession: async () => {
  // Re-validates user session
  // Refreshes user profile data
  // Auto-logs out if session expired
}
```

**Called automatically** when tab becomes visible at the app level.

### 3. App-Level Integration (`src/App.tsx`)

```typescript
usePageVisibility(() => {
  refreshSession() // Refresh auth on every tab visibility change
})
```

This ensures the auth session is always fresh when users return.

### 4. Page-Level Data Reload

Updated key pages to reload data on visibility:

**Home Page (`src/pages/Home.tsx`):**
```typescript
const loadDashboardData = useCallback(async () => {
  // Load dashboard data
}, [userProfile])

usePageVisibility(() => {
  loadDashboardData() // Reload on visibility
})
```

**Progress Page (`src/pages/Progress.tsx`):**
```typescript
const loadInitialData = useCallback(async () => {
  // Load progress data
}, [userProfile])

usePageVisibility(() => {
  loadInitialData() // Reload on visibility
})
```

## Implementation Pattern

To add visibility handling to any page:

```typescript
import { useCallback } from 'react'
import { usePageVisibility } from '@/hooks/usePageVisibility'

export function YourPage() {
  // Convert data loading to useCallback
  const loadData = useCallback(async () => {
    if (!userProfile) return
    if (isInitializing.current) return // Guard against double loading

    try {
      isInitializing.current = true
      // Your data loading logic
    } finally {
      isInitializing.current = false
    }
  }, [userProfile])

  // Load on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Reload when tab becomes visible
  usePageVisibility(() => {
    loadData()
  })
}
```

## Key Changes

### Before:
- Data loaded only once on component mount
- No detection of tab switching
- Stale data after app switching
- No session validation on return

### After:
- Session refreshed when tab becomes visible
- Data reloaded automatically on return
- Protection against double-loading with refs
- Graceful handling of expired sessions

## Testing

To test the fix:

1. **Login to the app**
2. **Navigate to Home or Progress page**
3. **Switch to another app** (wait 30+ seconds)
4. **Return to the browser tab**
5. **Verify:**
   - Console shows "Tab became visible"
   - Console shows "Refreshing session"
   - Console shows "Loading data"
   - Dynamic content loads successfully

## Performance Considerations

- **Debouncing**: Not needed - visibility events are infrequent
- **Loading guards**: `isInitializing.current` prevents concurrent loads
- **Minimal overhead**: Only triggers on actual visibility changes
- **Network efficient**: Uses Promise.all() for parallel fetching

## Pages Updated

- ✅ `src/App.tsx` - Session refresh
- ✅ `src/pages/Home.tsx` - Dashboard reload
- ✅ `src/pages/Progress.tsx` - Progress data reload

## Future Improvements

Consider adding to:
- `src/pages/Library.tsx`
- `src/pages/Profile.tsx`
- `src/pages/Community.tsx`
- Any other data-heavy pages

## Browser Compatibility

The Page Visibility API is supported in:
- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari 7+
- ✅ iOS Safari 7+
- ✅ Chrome for Android
- ✅ All modern mobile browsers

## Related Files

- `src/hooks/usePageVisibility.ts` - Visibility detection hook
- `src/stores/authStore.ts` - Session refresh logic
- `src/App.tsx` - App-level visibility handling
- `src/pages/Home.tsx` - Example implementation
- `src/pages/Progress.tsx` - Example implementation

## References

- [Page Visibility API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [Supabase Auth - Session Management](https://supabase.com/docs/guides/auth/sessions)
