# Setup Guide

This guide walks you through setting up the TumiPay PayIn application for development.

## Prerequisites

- **Node.js**: v18+ (recommended v20)
- **npm**: v9+ or yarn
- **Xcode**: For iOS development (macOS only)
- **Android Studio**: For Android development

## Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd tumipay-payin
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- React Native & Expo
- React Navigation
- State management (Zustand)
- HTTP client (Axios)
- TypeScript & type definitions
- Development tools (ESLint, Prettier)

### 3. Environment Setup

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# API Configuration
REACT_APP_API_URL=https://api.tumipay.com/v1
REACT_APP_USE_MOCK_API=true    # Use 'false' to connect to real API

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_CRASH_REPORTING=false

# Debug
REACT_APP_DEBUG_MODE=false
```

## Development

### Start the Development Server

#### With Mock Data (Recommended for testing)
```bash
npm start
```

The app will run with `REACT_APP_USE_MOCK_API=true`, using sample PayIn data.

#### With Real API
```bash
export REACT_APP_USE_MOCK_API=false
npm start
```

### Run on iOS
```bash
npm run ios
```

**Requirements**: macOS with Xcode

### Run on Android
```bash
npm run android
```

**Requirements**: Android Studio with Android SDK

### Run on Web (Development)
```bash
npm run web
```

Opens at `http://localhost:19000`

## Project Structure

```
tumipay-payin/
├── src/
│   ├── features/payin/           # PayIn feature module
│   │   ├── domain/               # Business logic
│   │   ├── application/          # Use cases
│   │   ├── infrastructure/       # API & HTTP
│   │   └── presentation/         # UI (screens, components, store)
│   ├── shared/                   # Shared utilities & components
│   └── navigation/               # App navigation
├── App.tsx                       # Main app component
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── .eslintrc.json               # ESLint config
├── .prettierrc.json             # Prettier config
└── README.md                    # Project docs
```

## Code Quality

### Format Code
```bash
npx prettier --write .
```

### Run Linter
```bash
npm run lint
```

### Fix Linting Issues
```bash
npx eslint . --fix
```

## Testing

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Watch Mode
```bash
npm test -- --watch
```

## Building for Production

### iOS Build
```bash
eas build --platform ios
```

### Android Build
```bash
eas build --platform android
```

### Web Build
```bash
npm run web:build
```

**Note**: Requires EAS CLI setup and valid Apple/Google credentials.

## Debugging

### Enable Debug Mode
Edit `.env.local`:
```env
REACT_APP_DEBUG_MODE=true
```

### React DevTools
1. Download React Native Debugger
2. Run: `npm start`
3. Press `d` in the terminal to open debugger

### Network Inspection
- Use React Native Debugger's Network tab
- Monitor HTTP requests/responses
- Check error handling

### Console Logging
```typescript
// Recommended approach
console.log('Debug:', variable);  // For development only
```

## Common Issues

### Issue: Dependencies Not Found
**Solution**:
```bash
npm install
npx expo prebuild --clean
```

### Issue: Metro Bundler Error
**Solution**:
```bash
npm start -- --clear
```

### Issue: Port Already in Use
**Solution**:
```bash
# Kill the existing process
lsof -ti:8081 | xargs kill -9

# Or use a different port
npm start -- --port 8082
```

### Issue: iOS Build Fails
**Solution**:
```bash
cd ios
pod install --repo-update
cd ..
npm run ios
```

### Issue: Android Build Fails
**Solution**:
```bash
./gradlew clean
npm run android
```

### Issue: Type Errors
**Solution**:
```bash
# Check TypeScript
npx tsc --noEmit

# Clear cache
npm start -- --clear
```

## Using Mock API vs Real API

### Mock API (Development)
- No backend required
- Instant responses
- Pre-loaded sample data
- Great for UI development

```typescript
// Automatically used when REACT_APP_USE_MOCK_API=true
const repository = new PayInMockAdapter();
```

### Real API (Production)
- Requires backend server
- Actual data
- Real error scenarios
- Performance testing

```typescript
// Used when REACT_APP_USE_MOCK_API=false
const repository = new PayInApiAdapter();
```

### Switch Implementations
No code changes needed! Configuration handles it automatically in `usePayInStore.ts`.

## VS Code Extensions (Recommended)

```
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Thunder Client (REST testing)
- React Native Tools
- TypeScript Vue Plugin
```

## Troubleshooting

### Check Node Version
```bash
node --version  # Should be v18 or higher
npm --version   # Should be v9 or higher
```

### Check Expo CLI
```bash
npm list expo
npx expo --version
```

### Clear All Cache
```bash
rm -rf node_modules
rm package-lock.json
npm install
npm start -- --clear
```

### Reset Simulator (iOS)
```bash
xcrun simctl erase all
```

### Reset Emulator (Android)
```bash
cd ~/Library/Android/sdk
./tools/bin/avdmanager list avd
./tools/bin/avdmanager delete avd -n <avd-name>
```

## Next Steps

1. **Explore the Code**: Check out the folder structure and understand the architecture
2. **Run the App**: Start with mock data to see the UI
3. **Read Documentation**: 
   - [README.md](./README.md) - Project overview
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture details
   - [TESTING.md](./TESTING.md) - Testing guide
4. **Make Changes**: Try modifying components and see hot reload in action
5. **Connect to Backend**: Update `.env.local` to use real API

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org/docs/getting-started/)
- [Zustand](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Axios Documentation](https://axios-http.com)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the documentation files
3. Check React Native Expo logs: `npm start`
4. Search GitHub issues

---

**Last Updated**: April 2026  
**Version**: 1.0.0
