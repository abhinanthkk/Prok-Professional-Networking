# Post List Component

A comprehensive, performance-optimized post listing component with modern UI and advanced features.

## Features

### 🎨 Modern Card-Based Layout
- Responsive design that works on all screen sizes
- Clean, modern card layout with hover effects
- Professional typography and spacing
- Visual indicators for post status (private/public, category)

### 🔄 Infinite Scroll
- Seamless pagination using Intersection Observer API
- Automatic loading of more posts as user scrolls
- Optimized performance with proper cleanup

### 🔍 Advanced Filtering & Search
- **Search**: Real-time search with 500ms debouncing
- **Category Filter**: Filter by post categories
- **Visibility Filter**: Filter by public/private posts
- **Tag Filter**: Multi-select tag filtering
- **Sort Options**: Sort by date, likes, comments, or updates

### ⚡ Performance Optimizations
- **Request Debouncing**: 500ms delay for search and filter inputs
- **Lazy Loading**: Images load only when in viewport
- **React.memo**: Optimized component re-renders
- **useMemo**: Efficient state management
- **Error Boundaries**: Comprehensive error handling

### 🖼️ Lazy Image Loading
- Images load only when they enter the viewport
- Smooth fade-in transitions
- Placeholder images while loading
- Error handling for failed image loads

### 🎯 Custom Hooks
- `useDebounce`: Debounces input values for performance
- `useInfiniteScroll`: Handles infinite scroll logic
- `useLazyImage`: Manages lazy image loading

### 🧩 Reusable Components
- `LazyImage`: Optimized image component
- `LoadingSpinner`: Loading state indicator
- `EmptyState`: Empty state with actions
- `ErrorBoundary`: Error handling component
- `PostCard`: Individual post card component

## Usage

```tsx
import PostList from './components/posts/PostList';

function App() {
  return (
    <ErrorBoundary>
      <PostList />
    </ErrorBoundary>
  );
}
```

## API Integration

The component integrates with the posts API and supports:

- Pagination with configurable page size
- Search by content, title, or tags
- Category filtering
- Visibility filtering (public/private)
- Tag-based filtering
- Multiple sorting options

## Performance Features

1. **Debounced Search**: Prevents excessive API calls during typing
2. **Lazy Loading**: Images load only when needed
3. **Memoized Components**: Prevents unnecessary re-renders
4. **Efficient State Management**: Uses useMemo for expensive calculations
5. **Intersection Observer**: Efficient infinite scroll implementation

## Error Handling

- Network error handling with retry functionality
- Image loading error handling
- Empty states for different scenarios
- Error boundaries for component-level error handling

## Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- High contrast design
- Responsive design for all devices

## Customization

The component is highly customizable through:

- CSS classes for styling
- Configurable filter options
- Customizable empty states
- Flexible API integration
- Extensible hook system

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- React Router DOM
- Custom hooks (useDebounce, useInfiniteScroll, useLazyImage) 