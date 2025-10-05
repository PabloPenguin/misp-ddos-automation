# MISP DDoS Automation - Web Application Architecture

## Overview
The web application provides a user-friendly interface for uploading and processing DDoS event data, designed to complement the CLI tool and enable broader organizational adoption.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Query + Zustand
- **File Upload**: React Dropzone
- **Forms**: React Hook Form + Yup validation
- **Styling**: Emotion + CSS-in-JS
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Authentication**: JWT tokens + OAuth2
- **File Processing**: Celery + Redis queue
- **Database**: PostgreSQL (event logs, user sessions)
- **API Documentation**: OpenAPI/Swagger
- **Testing**: pytest + httpx

### Infrastructure
- **Hosting**: GitHub Pages (Frontend) + Heroku/Railway (Backend)
- **CI/CD**: GitHub Actions
- **File Storage**: AWS S3 or GitHub LFS
- **Monitoring**: Sentry error tracking
- **Security**: OWASP compliance

## Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React SPA     │    │   FastAPI API    │    │   MISP Instance │
│   (GitHub Pages)│◄──►│   (Backend)      │◄──►│   (Tailscale)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌──────────────────┐
         │              │   Redis Queue    │
         │              │   (Celery)       │
         │              └──────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   File Storage  │    │   PostgreSQL     │
│   (S3/GH LFS)   │    │   (Logs/Users)   │
└─────────────────┘    └──────────────────┘
```

## Security Architecture

### Authentication & Authorization
```python
# JWT-based authentication with role-based access
class UserRole(Enum):
    ANALYST = "analyst"      # Can create events
    ADMIN = "admin"          # Can manage users
    VIEWER = "viewer"        # Read-only access

class SecurityMiddleware:
    - Rate limiting (100 req/minute per user)
    - CORS policy (specific origins only)
    - Input validation and sanitization
    - File type and size validation
    - Malware scanning integration
```

### Data Flow Security
1. **Frontend Validation**: Client-side validation (UX only)
2. **Backend Validation**: Server-side validation (security boundary)
3. **File Quarantine**: Uploaded files quarantined until scanned
4. **Processing Queue**: Async processing with monitoring
5. **MISP Integration**: Secure API calls to MISP instance

## API Design

### Core Endpoints

```python
# Authentication
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me

# File Upload & Processing
POST /api/upload/csv          # Upload CSV file
POST /api/upload/json         # Upload JSON file
GET  /api/upload/{job_id}     # Check processing status
DELETE /api/upload/{job_id}   # Cancel processing

# Event Management
GET  /api/events              # List events with pagination
GET  /api/events/{event_id}   # Get specific event
POST /api/events              # Create single event (interactive)
DELETE /api/events/{event_id} # Delete event (admin only)

# System
GET  /api/health              # Health check
GET  /api/misp/status         # MISP connection status
POST /api/misp/test           # Test MISP connectivity
```

### Request/Response Models

```python
class FileUploadRequest(BaseModel):
    file: UploadFile
    options: ProcessingOptions = Field(default_factory=ProcessingOptions)

class ProcessingOptions(BaseModel):
    dry_run: bool = False
    batch_size: int = Field(default=50, ge=1, le=100)
    skip_validation: bool = False

class UploadResponse(BaseModel):
    job_id: str
    status: JobStatus
    total_events: int
    estimated_duration: int  # seconds

class JobStatus(BaseModel):
    status: Literal["pending", "processing", "completed", "failed"]
    progress: int  # 0-100
    processed_events: int
    successful_events: int
    failed_events: int
    errors: List[ValidationError] = []
    started_at: datetime
    completed_at: Optional[datetime] = None
```

## Frontend Components

### Main Application Structure
```typescript
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── ErrorBoundary.tsx
│   ├── upload/
│   │   ├── FileUpload.tsx
│   │   ├── ProgressTracker.tsx
│   │   └── ValidationResults.tsx
│   ├── events/
│   │   ├── EventList.tsx
│   │   ├── EventDetail.tsx
│   │   └── EventForm.tsx
│   └── auth/
│       ├── LoginForm.tsx
│       └── ProtectedRoute.tsx
├── hooks/
│   ├── useFileUpload.ts
│   ├── useEventManagement.ts
│   └── useAuth.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── validation.ts
└── types/
    ├── events.ts
    ├── upload.ts
    └── auth.ts
```

### Key Components

#### FileUpload Component
```typescript
interface FileUploadProps {
  onUploadStart: (jobId: string) => void;
  onUploadComplete: (result: ProcessingResult) => void;
  acceptedTypes: string[];
  maxFileSize: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadStart,
  onUploadComplete,
  acceptedTypes,
  maxFileSize
}) => {
  // Drag & drop functionality
  // File validation
  // Progress tracking
  // Error handling
};
```

#### ProgressTracker Component
```typescript
interface ProgressTrackerProps {
  jobId: string;
  onComplete: (result: ProcessingResult) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  jobId,
  onComplete
}) => {
  // Real-time progress updates via WebSocket/polling
  // Detailed progress breakdown
  // Error display and retry options
  // Cancel functionality
};
```

## Backend Implementation

### FastAPI Application Structure
```python
app/
├── main.py                 # FastAPI application
├── config.py              # Configuration management
├── dependencies.py         # Dependency injection
├── middleware.py           # Custom middleware
├── routers/
│   ├── auth.py            # Authentication endpoints
│   ├── upload.py          # File upload endpoints
│   ├── events.py          # Event management
│   └── system.py          # Health checks
├── services/
│   ├── auth_service.py    # Authentication logic
│   ├── file_service.py    # File processing
│   ├── misp_service.py    # MISP integration
│   └── task_service.py    # Background tasks
├── models/
│   ├── user.py            # User models
│   ├── upload.py          # Upload models
│   └── event.py           # Event models
├── tasks/
│   ├── file_processor.py  # Celery tasks
│   └── misp_sync.py       # MISP synchronization
└── utils/
    ├── security.py        # Security utilities
    ├── validation.py      # Input validation
    └── logging.py         # Structured logging
```

### Background Processing
```python
# Celery task for file processing
@celery_app.task(bind=True)
def process_file_upload(self, job_id: str, file_path: str, options: dict):
    """Process uploaded file with progress tracking."""
    try:
        # Update job status
        update_job_status(job_id, "processing", 0)
        
        # Parse file
        events = parse_file(file_path, options)
        total_events = len(events)
        
        # Process events in batches
        batch_size = options.get("batch_size", 50)
        successful = 0
        failed = 0
        
        for i in range(0, total_events, batch_size):
            batch = events[i:i + batch_size]
            
            for event in batch:
                try:
                    # Create MISP event
                    result = create_misp_event(event)
                    if result.success:
                        successful += 1
                    else:
                        failed += 1
                except Exception as e:
                    failed += 1
                    log_error(job_id, event, e)
            
            # Update progress
            progress = min(100, ((i + batch_size) / total_events) * 100)
            update_job_status(job_id, "processing", progress, successful, failed)
        
        # Mark as completed
        update_job_status(job_id, "completed", 100, successful, failed)
        
    except Exception as e:
        update_job_status(job_id, "failed", 0, 0, 0, str(e))
        raise
```

## Deployment Strategy

### GitHub Pages Deployment (Frontend)
```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend
on:
  push:
    branches: [main]
    paths: ['webapp/frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install and Build
        run: |
          cd webapp/frontend
          npm ci
          npm run build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./webapp/frontend/dist
```

### Backend Deployment
```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend
on:
  push:
    branches: [main]
    paths: ['webapp/backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway/Heroku
        run: |
          # Deploy backend with environment variables
          # Scale worker processes for Celery
          # Run database migrations
```

### Environment Configuration
```python
# Production environment variables
class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str
    
    # MISP
    MISP_URL: str
    MISP_API_KEY: str
    
    # Security
    SECRET_KEY: str
    JWT_EXPIRY: int = 3600
    
    # File Storage
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    S3_BUCKET: Optional[str] = None
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    
    class Config:
        env_file = ".env"
```

## Security Implementation

### Input Validation
```python
class FileValidator:
    MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
    ALLOWED_TYPES = {'.csv', '.json'}
    
    @staticmethod
    def validate_file(file: UploadFile) -> None:
        # Check file size
        if file.size > FileValidator.MAX_FILE_SIZE:
            raise ValidationError("File too large")
        
        # Check file extension
        if not any(file.filename.endswith(ext) for ext in FileValidator.ALLOWED_TYPES):
            raise ValidationError("Invalid file type")
        
        # Check file content (magic bytes)
        content_type = magic.from_buffer(file.file.read(1024), mime=True)
        if content_type not in ['text/csv', 'application/json', 'text/plain']:
            raise ValidationError("Invalid file content")
        
        file.file.seek(0)  # Reset file pointer
```

### Rate Limiting
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/upload/csv")
@limiter.limit("10/minute")
async def upload_csv(request: Request, file: UploadFile):
    # File upload with rate limiting
    pass
```

### CORS Configuration
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pablopenguin.github.io",  # GitHub Pages
        "http://localhost:3000",           # Development
    ],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
    allow_credentials=True,
)
```

## Monitoring & Observability

### Health Checks
```python
@app.get("/api/health")
async def health_check():
    """Comprehensive health check endpoint."""
    checks = {
        "database": await check_database(),
        "redis": await check_redis(),
        "misp": await check_misp_connection(),
        "storage": await check_file_storage(),
    }
    
    healthy = all(checks.values())
    status_code = 200 if healthy else 503
    
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "healthy" if healthy else "unhealthy",
            "checks": checks,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )
```

### Error Tracking
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,
)
```

### Structured Logging
```python
import structlog

logger = structlog.get_logger(__name__)

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    
    logger.info(
        "request_completed",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        process_time=process_time,
    )
    
    return response
```

## Testing Strategy

### Frontend Testing
```typescript
// Integration test example
describe('FileUpload Component', () => {
  test('should upload CSV file successfully', async () => {
    const mockFile = new File(['test,data'], 'test.csv', { type: 'text/csv' });
    
    render(<FileUpload onUploadStart={jest.fn()} onUploadComplete={jest.fn()} />);
    
    const dropzone = screen.getByTestId('file-dropzone');
    fireEvent.drop(dropzone, { dataTransfer: { files: [mockFile] } });
    
    await waitFor(() => {
      expect(screen.getByText('Upload successful')).toBeInTheDocument();
    });
  });
});
```

### Backend Testing
```python
# API test example
@pytest.mark.asyncio
async def test_upload_csv_endpoint():
    """Test CSV upload endpoint with security validation."""
    
    # Test valid upload
    with open("test_data.csv", "rb") as f:
        response = await client.post(
            "/api/upload/csv",
            files={"file": ("test.csv", f, "text/csv")},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "job_id" in data
    
    # Test file too large
    large_file = BytesIO(b"x" * (101 * 1024 * 1024))  # 101MB
    response = await client.post(
        "/api/upload/csv",
        files={"file": ("large.csv", large_file, "text/csv")},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    assert response.status_code == 413  # Payload too large
```

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Lazy load components
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Service worker for offline capability
- **Image Optimization**: WebP format and lazy loading

### Backend Optimization
- **Database Indexing**: Optimize queries
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis for frequently accessed data
- **Background Processing**: Celery for heavy operations

### File Processing
- **Streaming**: Process large files without loading into memory
- **Batch Processing**: Process events in configurable batches
- **Progress Tracking**: Real-time progress updates
- **Resource Limits**: CPU and memory constraints

## Future Enhancements

1. **Real-time Collaboration**: WebSocket-based live updates
2. **Advanced Analytics**: Dashboard with event statistics
3. **API Integration**: Support for more threat intelligence platforms
4. **Mobile App**: React Native mobile application
5. **Machine Learning**: Automated event classification
6. **Compliance Reporting**: Generate compliance reports
7. **Multi-tenancy**: Support for multiple organizations
8. **Advanced Search**: Elasticsearch integration

This architecture provides a solid foundation for the web application while maintaining the security-first approach established in the CLI implementation.