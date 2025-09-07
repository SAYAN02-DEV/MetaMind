# MetaMind Activity Tracking Guide

## Overview
MetaMind now includes automatic activity tracking that monitors which applications you're using and sends this data to your backend for analysis and insights.

## Features
- **Real-time Monitoring**: Tracks active applications every 5 seconds
- **Smart Categorization**: Automatically categorizes apps by type (development, productivity, browsing, etc.)
- **Offline Support**: Buffers data when offline, syncs when online
- **Privacy Protection**: Filters out MetaMind app itself to avoid self-tracking
- **Visual Interface**: Clean floating widget showing current activity and statistics

## How to Use

### 1. Start the Application
```bash
# Terminal 1: Start Backend Server
cd MetaMind-Backend
node index.js

# Terminal 2: Start Electron App
cd frontend
npm run electron-dev
```

### 2. Enable Activity Tracking
1. Log into your MetaMind account in the Electron app
2. Look for the floating "Activity Tracker" widget in the bottom-right corner
3. Click "Start Tracking" to begin monitoring

### 3. Monitor Your Activity
- **Current Activity**: See what app you're currently using
- **Session Stats**: View total activities tracked and categorization
- **Top Apps**: See which applications you use most frequently

### 4. View Data in Dashboard
- Activity data automatically syncs to your backend every 30 seconds
- View integrated analytics in your MetaMind dashboard
- Data appears alongside your existing app usage statistics

## App Categories

### Development
- VS Code, IntelliJ, Xcode, Android Studio
- Terminal, Command Prompt, PowerShell
- Vim, Emacs, Sublime Text, Atom

### Productivity  
- Microsoft Office (Word, Excel, PowerPoint)
- Notion, Obsidian, Trello
- Mail applications

### Browsing
- Chrome, Firefox, Safari, Edge
- Any browser-based applications

### Communication
- Slack, Discord, Microsoft Teams
- Zoom, Skype, video conferencing
- Email clients

### Entertainment
- Spotify, YouTube, Netflix
- VLC, media players
- Music applications

### Other
- Any applications not fitting above categories

## API Endpoints

### Activity Sync
```
POST /api/users/activities
Authorization: Bearer <token>
Content-Type: application/json

{
  "activities": [
    {
      "owner": "VS Code",
      "title": "main.js - MyProject",
      "timestamp": "2025-09-07T05:20:00.000Z",
      "duration": 5,
      "category": "development",
      "memoryUsage": 150000000
    }
  ]
}
```

### Health Check
```
GET /api/users/health
Response: { "message": "MetaMind API is healthy", "timestamp": "..." }
```

## Privacy & Security

### Data Collected
- Application name (e.g., "VS Code", "Chrome")
- Window title (e.g., "main.js - MyProject")
- Timestamp of activity
- Memory usage (optional)
- Categorization

### Data NOT Collected
- Keyboard input or keystrokes
- Screen contents or screenshots
- File contents or sensitive data
- Personal information beyond app usage

### Privacy Features
- MetaMind app excludes itself from tracking
- Data stored locally first, then synced
- All data tied to your authenticated account
- Standard JWT authentication for API calls

## Troubleshooting

### Activity Tracking Not Starting
1. Ensure you're running the Electron app (not web browser)
2. Check that backend server is running on localhost:3000
3. Verify you're logged into your MetaMind account
4. Look for error messages in the Activity Tracker widget

### Data Not Syncing
1. Check internet connection
2. Verify backend server is accessible
3. Check browser console for authentication errors
4. Data will sync automatically when connection is restored

### Performance Issues
1. Activity tracking uses minimal resources (~5-second intervals)
2. Data is buffered locally (max 50 activities)
3. Automatic sync every 30 seconds prevents large data transfers
4. You can stop tracking anytime to reduce resource usage

## Technical Details

### Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   active-win    │───▶│  Electron Main   │───▶│  React Frontend │
│   (monitors)    │    │   (IPC handlers) │    │  (UI controls)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Backend API   │◀───│ Activity Tracker │───▶│ Local Storage   │
│   (processes)   │    │   (service)      │    │   (buffers)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### File Structure
```
frontend/
├── src/
│   ├── utils/
│   │   └── activityTracker.js     # Core tracking service
│   └── components/
│       └── ActivityTracker.jsx    # UI component
├── electron.js                    # Main process with IPC handlers
├── preload.js                     # Secure API bridge
└── test-activity.js              # Testing utility

MetaMind-Backend/
└── routes/
    └── userRoutes.js             # Activity API endpoints
```

## Development

### Testing Activity Tracking
```bash
# Test active-win library directly
cd frontend
node test-activity.js

# Check current active window
# Should show: Title, Owner, PID, Category
```

### Adding New Categories
Edit the `categorizeActivity` function in `activityTracker.js`:
```javascript
// Add new category logic
if (owner.includes('newapp') || title.includes('pattern')) {
  return 'new-category';
}
```

### Customizing Sync Intervals
```javascript
// In activityTracker.js
this.syncInterval = 30000;     // Backend sync (30s)
this.trackingInterval = 5000;  // Activity check (5s)
```

## Support
For issues or questions about activity tracking:
1. Check the Activity Tracker widget for status messages
2. Review browser console for technical errors
3. Verify both frontend and backend are running
4. Test with the provided test script

The activity tracking system is designed to be lightweight, privacy-focused, and seamlessly integrated with your existing MetaMind workflow.
