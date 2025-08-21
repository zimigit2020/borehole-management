# Borehole Management Android App

## Overview
Native Android application for borehole surveying with offline-first architecture. Built with Kotlin, Room database, and Retrofit.

## Features
- User authentication with JWT
- View assigned jobs
- GPS location capture with accuracy validation
- Survey form with offline storage
- Photo capture for resistivity graphs
- Automatic background sync when online
- Conflict resolution for offline data

## Architecture
```
MVVM + Repository Pattern + Clean Architecture

UI Layer (Activities/Fragments)
    ↓
ViewModel Layer
    ↓
Repository Layer
    ↓
Data Sources (Local/Remote)
```

## Tech Stack
- **Language**: Kotlin
- **UI**: Material Design 3, View Binding
- **Database**: Room (SQLite)
- **Networking**: Retrofit + OkHttp
- **DI**: Hilt
- **Async**: Coroutines + Flow
- **Background**: WorkManager
- **Location**: Google Play Services

## Project Structure
```
app/
├── data/
│   ├── local/          # Room database
│   │   ├── dao/
│   │   ├── entity/
│   │   └── BoreholeDatabase.kt
│   ├── remote/         # API interfaces
│   │   └── api/
│   └── model/          # Data models
├── di/                 # Dependency injection
├── repository/         # Repository pattern
├── ui/                 # Activities & Fragments
│   ├── auth/
│   ├── jobs/
│   └── survey/
├── utils/              # Utilities
└── work/              # Background workers
```

## Setup

### Prerequisites
- Android Studio Hedgehog or newer
- Android SDK 24+
- Kotlin 1.9+

### Configuration
1. Update `BASE_URL` in `build.gradle.kts`:
   ```kotlin
   buildConfigField("String", "BASE_URL", "\"http://your-api.com/api/v1/\"")
   ```

2. Enable location permissions in device settings

### Build & Run
```bash
# Debug build
./gradlew assembleDebug

# Release build
./gradlew assembleRelease

# Install on device
./gradlew installDebug
```

## Offline Sync Strategy

1. **Data Storage**: All data saved to Room database first
2. **Sync Queue**: Unsynced items tracked with `syncStatus`
3. **Background Sync**: WorkManager runs every 15 minutes
4. **Conflict Resolution**: Server as source of truth
5. **Retry Logic**: Exponential backoff for failed syncs

## Key Components

### Authentication
- JWT token stored in SharedPreferences
- Auto-refresh on 401 responses
- Biometric authentication support (optional)

### Job Management
- Jobs cached locally from API
- Filter by status and assignment
- Real-time updates via Flow

### Survey Capture
- GPS coordinates with accuracy validation
- Photo capture with EXIF data
- Form validation before submission
- Offline queue for sync

### Background Sync
```kotlin
class SyncWorker : CoroutineWorker() {
    override suspend fun doWork(): Result {
        // 1. Check network connectivity
        // 2. Get unsynced surveys
        // 3. Upload to server
        // 4. Handle conflicts
        // 5. Update local database
    }
}
```

## Testing
```bash
# Unit tests
./gradlew test

# Instrumented tests
./gradlew connectedAndroidTest
```

## Security
- API keys in BuildConfig (not in source)
- Certificate pinning for production
- Encrypted SharedPreferences
- ProGuard rules for release builds

## Performance
- Image compression before upload
- Pagination for large lists
- Lazy loading with Paging 3
- Memory leak prevention with LeakCanary

## Release Checklist
- [ ] Update version code/name
- [ ] Set production API URL
- [ ] Enable ProGuard
- [ ] Generate signed APK
- [ ] Test on multiple devices
- [ ] Submit to Play Store