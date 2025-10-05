# Frontend Architecture Documentation

## Overview

The MISP DDoS Automation web application is built with React 18 and TypeScript, following modern best practices and patterns for scalable, maintainable frontend development.

## Technology Stack

### Core
- **React 18.3+** - UI library with concurrent features
- **TypeScript 5.9+** - Type safety and enhanced developer experience
- **Vite 7.1+** - Fast build tool and dev server

### UI Framework
- **Material-UI (MUI) v7** - Comprehensive React component library
- **Emotion** - CSS-in-JS styling solution
- **MUI Icons** - Icon library

### State Management
- **React Query (@tanstack/react-query)** - Server state management and caching
- **Zustand** - Lightweight client state management for auth

### Forms & Validation
- **React Hook Form** - Performant form handling
- **Yup** - Schema validation
- **@hookform/resolvers** - Yup integration with React Hook Form

### File Upload
- **React Dropzone** - Drag & drop file upload

### Testing
- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - DOM matchers
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM implementation for Node.js

## Architecture Patterns

### Component Organization

```
src/
├── components/
│   ├── common/          # Shared UI components
│   ├── upload/          # File upload features
│   ├── events/          # Event management
│   └── auth/            # Authentication
├── hooks/               # Custom React hooks
├── services/            # API and business logic
├── types/               # TypeScript definitions
└── test/                # Test files
```

### Key Design Decisions

#### 1. Component Structure
- **Functional components** with hooks (no class components)
- **TypeScript interfaces** for all component props
- **Material-UI components** for consistent UI
- **Compound components** for complex UI patterns

#### 2. State Management Strategy
- **Server state**: React Query for API data, caching, and synchronization
- **Client state**: Zustand for authentication state
- **Component state**: useState and useReducer for local state
- **Form state**: React Hook Form for form handling

#### 3. API Integration
- **Centralized API client** with token management
- **Type-safe API methods** with TypeScript
- **Automatic retry** and error handling
- **Request cancellation** support

#### 4. Authentication Flow
- **JWT token-based** authentication
- **Persistent sessions** via localStorage
- **Protected routes** with ProtectedRoute component
- **Automatic token refresh** capability

#### 5. File Upload Architecture
- **Client-side validation** before upload
- **Progress tracking** with polling
- **Error handling** with detailed messages
- **Drag & drop** and click-to-select support

## Component Details

### Common Components

#### ErrorBoundary
- Catches React errors in component tree
- Displays user-friendly error messages
- Provides retry functionality
- Logs errors for debugging

#### Header
- App-wide navigation header
- User profile display
- Logout functionality
- Responsive design

#### Navigation
- Side navigation drawer
- Route-based menu items
- Icon + text navigation
- Collapsible on mobile

### Upload Components

#### FileUpload
- Drag & drop zone with react-dropzone
- File type and size validation
- Visual feedback for valid/invalid files
- Upload button with progress indicator

#### ProgressTracker
- Real-time progress updates via polling
- Success/failure statistics
- Error list display
- Cancel functionality

#### ValidationResults
- Tabular error display
- Severity indicators (error/warning)
- Line number and field references
- Filtering and sorting

### Event Components

#### EventList
- Paginated event table
- Sortable columns
- Filtering capabilities
- Row actions (view, delete)

#### EventDetail
- Modal dialog display
- Comprehensive event information
- Copy-to-clipboard functionality
- Formatted data presentation

#### EventForm
- Multi-step form validation
- IP address and port validation
- Attack type selection
- Real-time validation feedback

### Auth Components

#### LoginForm
- Username/password authentication
- Form validation
- Password visibility toggle
- Error message display

#### ProtectedRoute
- Route-level authentication guard
- Automatic authentication check
- Redirect to login if unauthenticated
- Loading state handling

## Custom Hooks

### useAuth
- Authentication state management
- Login/logout functionality
- Token storage and retrieval
- Session persistence

### useFileUpload
- File upload mutation
- Progress tracking
- Error handling
- Upload cancellation

### useEventManagement
- Event CRUD operations
- List pagination
- Filtering and sorting
- Cache invalidation

## Services Layer

### api.ts
- Centralized API client
- Token injection
- Request/response interceptors
- Error handling

### auth.ts
- Authentication API calls
- Token management
- Session storage
- User profile retrieval

### validation.ts
- Client-side validation schemas
- Input sanitization
- Type guards
- Validation utilities

## Type System

### Type Definitions
- **auth.ts**: User, LoginCredentials, AuthState, AuthResponse
- **upload.ts**: FileUploadProps, JobStatus, ProcessingResult
- **events.ts**: DDoSEvent, EventFilters, PaginatedEvents

### Type Safety Benefits
- Compile-time error detection
- IntelliSense support
- Refactoring safety
- Self-documenting code

## Testing Strategy

### Test Coverage
- **Unit tests**: Individual functions and utilities
- **Component tests**: User interactions and rendering
- **Integration tests**: Component combinations
- **Validation tests**: Input validation and sanitization

### Test Patterns
- Arrange-Act-Assert pattern
- Mock external dependencies
- Test user interactions
- Accessibility testing

## Security Features

### Input Validation
- Client-side validation for UX
- Server-side validation for security
- SQL injection prevention
- XSS prevention

### Authentication
- Secure token storage
- Token expiration handling
- HTTPS enforcement
- CSRF protection

### File Upload Security
- File type validation
- File size limits
- Content validation
- Path traversal prevention

## Accessibility (WCAG 2.1)

### Features
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus management

### Testing
- Automated accessibility testing
- Manual keyboard navigation testing
- Screen reader testing
- Color contrast validation

## Performance Optimization

### Code Splitting
- Route-based code splitting
- Lazy loading components
- Dynamic imports

### Caching Strategy
- React Query cache configuration
- Stale-while-revalidate pattern
- Cache invalidation

### Bundle Optimization
- Tree shaking
- Minification
- Asset optimization

## Development Workflow

### Local Development
```bash
npm install    # Install dependencies
npm run dev    # Start dev server
npm test       # Run tests
npm run lint   # Lint code
npm run build  # Build for production
```

### Code Quality
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Git hooks with husky

## Future Enhancements

### Planned Features
1. **WebSocket support** for real-time updates
2. **Offline mode** with service workers
3. **Advanced filtering** with saved queries
4. **Export functionality** for reports
5. **Dark mode** theme support
6. **Internationalization** (i18n)
7. **Advanced analytics** dashboard
8. **Mobile app** with React Native

### Technical Debt
- Add E2E tests with Playwright
- Implement comprehensive error tracking
- Add performance monitoring
- Improve test coverage to 90%+

## Contributing Guidelines

### Code Style
- Use functional components
- Follow TypeScript conventions
- Write self-documenting code
- Add JSDoc comments for complex logic

### Component Guidelines
- Keep components focused and small
- Extract reusable logic to hooks
- Use TypeScript for all props
- Write tests for all components

### Testing Requirements
- Minimum 80% code coverage
- Test user interactions
- Test error states
- Test accessibility

## Troubleshooting

### Common Issues

#### Build Errors
- Clear node_modules and reinstall
- Check TypeScript errors
- Verify environment variables

#### Runtime Errors
- Check browser console
- Verify API endpoint configuration
- Check authentication token

#### Test Failures
- Clear test cache
- Update test snapshots
- Check mock data

## Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material-UI Docs](https://mui.com/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Vitest Documentation](https://vitest.dev/)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Bundle Analyzer](https://www.npmjs.com/package/vite-plugin-bundle-visualizer)
