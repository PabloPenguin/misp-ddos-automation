# MISP DDoS Automation - Web Application

React-based web application for managing DDoS events in MISP with a user-friendly interface.

## Features

- **File Upload**: Drag & drop CSV/JSON file upload with validation
- **Real-time Progress**: Live tracking of file processing
- **Event Management**: View, create, and manage DDoS events
- **User Authentication**: Secure JWT-based authentication
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: WCAG 2.1 compliant

## Technology Stack

- **React 18** with TypeScript
- **Material-UI (MUI) v5** for UI components
- **React Query** for data fetching and caching
- **Zustand** for state management
- **React Hook Form** for form handling
- **Yup** for validation
- **React Dropzone** for file upload
- **Vite** for build tooling
- **Vitest** for unit testing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see `/backend` directory)

### Installation

```bash
cd webapp
npm install
```

### Configuration

Copy the `.env.template` file to `.env` and configure:

```bash
cp .env.template .env
```

Edit `.env`:
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_ENABLE_AUTH=true
VITE_ENABLE_FILE_UPLOAD=true
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Testing

Run unit tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Linting

Lint the code:

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared components
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── ErrorBoundary.tsx
│   ├── upload/          # File upload components
│   │   ├── FileUpload.tsx
│   │   ├── ProgressTracker.tsx
│   │   └── ValidationResults.tsx
│   ├── events/          # Event management components
│   │   ├── EventList.tsx
│   │   ├── EventDetail.tsx
│   │   └── EventForm.tsx
│   └── auth/            # Authentication components
│       ├── LoginForm.tsx
│       └── ProtectedRoute.tsx
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useFileUpload.ts
│   └── useEventManagement.ts
├── services/            # API and utility services
│   ├── api.ts
│   ├── auth.ts
│   └── validation.ts
├── types/               # TypeScript type definitions
│   ├── auth.ts
│   ├── upload.ts
│   └── events.ts
├── test/                # Test files
│   ├── components/
│   ├── services/
│   └── setup.ts
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## Key Components

### FileUpload
Provides drag & drop file upload with validation:
- Accepts CSV and JSON files
- File size validation (max 100MB)
- File type validation
- Error handling

### ProgressTracker
Real-time progress tracking for file processing:
- Live progress updates
- Success/failure counts
- Error details
- Cancel functionality

### EventList
Display and manage DDoS events:
- Paginated event list
- Filtering and sorting
- Event details view
- Delete functionality

### EventForm
Create or edit DDoS events:
- Form validation with Yup
- IP address validation
- Port number validation
- Attack type selection

## Security Features

- Input validation and sanitization
- File size and type validation
- JWT token authentication
- CSRF protection
- XSS prevention
- Secure API communication

## Accessibility

The application follows WCAG 2.1 guidelines:
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - see LICENSE file for details
