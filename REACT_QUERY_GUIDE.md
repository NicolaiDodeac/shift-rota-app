# React Query Implementation Guide

## 🚀 What We've Implemented

Your project now uses **React Query (TanStack Query)** for efficient data fetching and state management. This replaces manual state management with automatic caching, background updates, and error handling.

## 📦 What's Installed

- `@tanstack/react-query` - Core React Query library
- `@tanstack/react-query-devtools` - Development tools for debugging

## 🔧 Setup

### Provider Configuration
React Query is configured in `app/providers.tsx` with:
- **Stale Time**: 5 minutes (data stays fresh for 5 minutes)
- **Retry Logic**: 3 retries with exponential backoff
- **DevTools**: Available in development mode

## 📝 How to Use

### 1. Basic Query Hook
```typescript
import { useQuery } from "@tanstack/react-query";

const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["summary"],
  queryFn: fetchSummaryData,
  staleTime: 2 * 60 * 1000, // 2 minutes
  refetchOnWindowFocus: true,
});
```

### 2. Mutation Hook
```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: confirmWeekAPI,
  onSuccess: () => {
    // Automatically refetch data after successful mutation
    queryClient.invalidateQueries({ queryKey: ["summary"] });
  },
  onError: (error) => {
    console.error("Failed to confirm week:", error);
  },
});
```

### 3. Custom Hooks (Recommended)
We've created custom hooks in `lib/hooks/`:

```typescript
// Use the custom hook
import { useSummary, useConfirmWeek } from "@/lib/hooks/useSummary";

const { data, isLoading, error } = useSummary();
const confirmWeekMutation = useConfirmWeek();
```

## 🎯 Benefits You're Getting

### ✅ Automatic Caching
- Data is cached and reused across components
- No unnecessary API calls
- Instant loading for cached data

### ✅ Background Updates
- Data refreshes automatically when you return to the tab
- Background sync keeps data fresh
- No manual refresh needed

### ✅ Error Handling
- Automatic retries for failed requests
- Built-in error states
- Graceful error recovery

### ✅ Loading States
- Automatic loading indicators
- No manual loading state management
- Optimistic updates for better UX

### ✅ DevTools
- Open React Query DevTools in your browser
- Debug queries, mutations, and cache
- Monitor performance

## 🔄 Migration from Manual State

### Before (Manual State)
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    setLoading(true);
    const res = await fetch("/api/summary");
    const data = await res.json();
    setData(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### After (React Query)
```typescript
const { data, isLoading, error } = useSummary();
// That's it! No manual state management needed.
```

## 📊 Available Hooks

### Summary Page
- `useSummary()` - Fetch summary data
- `useSettings()` - Fetch user settings
- `useConfirmWeek()` - Confirm a week
- `useUpdateWeek()` - Update a week

### Dashboard Page
- `useDashboard()` - Fetch dashboard data

## 🛠️ Creating New Hooks

### 1. Create API Function
```typescript
const fetchUserData = async (): Promise<UserData> => {
  const res = await fetch("/api/user");
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
};
```

### 2. Create Query Hook
```typescript
export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: fetchUserData,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### 3. Create Mutation Hook
```typescript
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUserAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
```

## 🎨 Best Practices

### 1. Use Custom Hooks
- Create reusable hooks in `lib/hooks/`
- Keep API logic separate from components
- Share hooks across components

### 2. Query Keys
- Use descriptive query keys: `["summary"]`, `["user", userId]`
- Include parameters in keys for dynamic queries
- Use consistent naming conventions

### 3. Stale Time
- Set appropriate stale times based on data freshness needs
- Summary data: 2-5 minutes
- Settings data: 10+ minutes
- User data: 5-10 minutes

### 4. Error Handling
- Use `onError` callbacks in mutations
- Provide user-friendly error messages
- Implement retry logic where appropriate

## 🔍 DevTools

React Query DevTools are available in development:
- Shows all queries and mutations
- Displays cache state
- Monitor performance
- Debug issues easily

## 📈 Performance Benefits

1. **Reduced API Calls**: Cached data reused
2. **Faster Loading**: Instant data for cached queries
3. **Better UX**: Background updates, optimistic updates
4. **Less Code**: No manual state management
5. **Automatic Cleanup**: Memory management handled

## 🚀 Next Steps

1. **✅ Dashboard Migration**: Completed - Dashboard now uses `useDashboard()` hook
2. **✅ Settings Migration**: Completed - Settings now uses `useSettings()` and `useUpdateSettings()` hooks
3. **Add More Hooks**: Create hooks for other API endpoints (if needed)
4. **Optimistic Updates**: Implement for better UX
5. **Error Boundaries**: Add global error handling
6. **Testing**: Add tests for custom hooks

## 🎉 Implementation Complete!

Your app now has enterprise-level data fetching with React Query! All major pages have been migrated:

- ✅ **Summary Page**: Uses `useSummary()`, `useSettings()`, `useConfirmWeek()`, `useUpdateWeek()`
- ✅ **Dashboard Page**: Uses `useDashboard()`
- ✅ **Settings Page**: Uses `useSettings()` and `useUpdateSettings()`

## 🚀 **Advanced Features Added**

### ✅ **Zustand State Management**
- **UI Store**: Manages sidebar, theme, selected week, and loading states
- **Persistent Storage**: Theme and sidebar preferences saved to localStorage
- **Global State**: Share UI state across components without prop drilling

### ✅ **Optimistic Updates**
- **Instant Feedback**: UI updates immediately when confirming/updating weeks
- **Automatic Rollback**: Changes revert if API call fails
- **Better UX**: No waiting for server response to see changes
- **Cross-Cache Updates**: Dashboard updates immediately when summary data changes
- **Smart Invalidation**: Related data is automatically refreshed

### ✅ **Error Boundaries**
- **Graceful Error Handling**: Catches and displays errors elegantly
- **Development Details**: Shows error stack traces in development
- **Recovery Options**: Try again or reload page buttons

### ✅ **Prefetching**
- **Faster Navigation**: Data loads on hover, not click
- **Smart Prefetching**: Only prefetches relevant data for each route
- **Background Loading**: Users see instant page loads

### ✅ **Sidebar Component**
- **Quick Actions**: Easy access to main features
- **Responsive Design**: Full-width on mobile, fixed width on desktop
- **Smooth Animations**: Professional slide-in/out transitions

## 🎯 **Benefits You're Now Enjoying**

- **Automatic Caching**: Data is cached and reused across components
- **Background Updates**: Data refreshes automatically when you return to the tab
- **Error Handling**: Automatic retries and graceful error recovery
- **Loading States**: Automatic loading indicators
- **DevTools**: Debug queries and mutations in development
- **Less Code**: No manual state management needed
- **Better UX**: Optimistic updates and prefetching
- **Global State**: Zustand for UI state management
- **Error Recovery**: Graceful error boundaries

Your shift rota app is now powered by React Query with enterprise-level features! 🚀
