# NProgress Loading Bar Implementation

This implementation provides a YouTube-style top loading bar for Next.js App Router using NProgress.

## Features

- ✅ Red progress bar color
- ✅ No spinner (removed)
- ✅ Automatic progress on route changes
- ✅ Immediate start on link clicks
- ✅ Smooth completion when pages render
- ✅ No flickering on fast transitions
- ✅ Custom Link component for clean integration
- ✅ Programmatic navigation hook

## Setup

The progress bar is automatically configured in the root layout (`app/layout.tsx`) with:
- Red color (#ef4444)
- 2px height
- Smooth animations
- No spinner

## Usage

### Using CustomLink Component

Replace `next/link` imports with `CustomLink`:

```tsx
import { CustomLink } from '@/components/CustomLink';

// Instead of:
<Link href="/dashboard">Dashboard</Link>

// Use:
<CustomLink href="/dashboard">Dashboard</CustomLink>
```

### Using Programmatic Navigation

Use `useRouterWithProgress` for programmatic navigation:

```tsx
import { useRouterWithProgress } from '@/lib/useRouterWithProgress';

function MyComponent() {
  const router = useRouterWithProgress();

  const handleNavigation = () => {
    router.push('/dashboard');
    // Progress bar starts automatically
  };

  return (
    <button onClick={handleNavigation}>
      Go to Dashboard
    </button>
  );
}
```

### Manual Progress Control

Use the `useProgressBar` hook for manual control:

```tsx
import { useProgressBar } from '@/lib/useProgressBar';

function MyComponent() {
  const { start, done, inc } = useProgressBar();

  const handleAsyncOperation = async () => {
    start();
    // Do some work...
    inc(0.5); // Increment progress
    // More work...
    done(); // Complete
  };

  return (
    <button onClick={handleAsyncOperation}>
      Start Operation
    </button>
  );
}
```

## How It Works

1. **Route Changes**: The `ProgressBar` component listens to pathname changes and completes the progress bar
2. **Link Clicks**: `CustomLink` starts the progress bar immediately on click
3. **Programmatic Navigation**: `useRouterWithProgress` starts progress on navigation methods
4. **Styling**: Custom CSS overrides NProgress default styles for red color and no spinner

## Configuration

NProgress is configured in `lib/useProgressBar.ts`:

```tsx
NProgress.configure({
  showSpinner: false,      // No spinner
  trickleSpeed: 200,       // Speed of automatic progress
  minimum: 0.08,          // Minimum progress
  easing: 'ease',         // Animation easing
  speed: 500,             // Animation speed
});
```

## Migration Guide

To migrate existing links:

1. Replace `import Link from 'next/link'` with `import { CustomLink } from '@/components/CustomLink'`
2. Replace `<Link>` with `<CustomLink>`
3. For programmatic navigation, replace `useRouter` with `useRouterWithProgress`

The API is identical, so no other changes are needed.