# Error Handling

This app includes a comprehensive error boundary that catches and handles various error types with user-friendly messages and recovery options.

## Error Types Handled

### 1. **API Quota Exceeded**
- **Trigger**: When you hit the Gemini API rate limit (429 error)
- **Message**: Prompts user to wait or upgrade their API plan
- **Solution**: Link to Google Cloud Console for quota management

### 2. **API Key Missing or Invalid**
- **Trigger**: When `VITE_GEMINI_API_KEY` is not set or is incorrect
- **Message**: Guides user to set up `.env.local` with valid key
- **Solution**: Link to get Gemini API key

### 3. **API Error**
- **Trigger**: General API failures (bad requests, server errors)
- **Message**: Suggests checking internet and trying again
- **Solution**: Reload button to retry

### 4. **Network Error**
- **Trigger**: No internet connection or network timeout
- **Message**: Asks user to check their internet connection
- **Solution**: Reload and retry

### 5. **Unknown Errors**
- **Trigger**: Any unexpected error
- **Message**: Generic error message with details
- **Solution**: Go to home or reload

## Error Boundary Features

- **Global Error Catching**: Wraps the entire app to catch sync and async errors
- **Error Recovery**: "Back to Home" button resets the app state
- **Reload Option**: "Reload Page" button for page refresh
- **Helpful Links**: Quick links to API key setup and documentation
- **Error Details**: Shows error message in development for debugging

## How It Works

1. **ErrorBoundary.tsx**: React error boundary component that catches render errors and promise rejections
2. **Service Layer**: `geminiService.ts` throws specific error messages based on error type
3. **App Layer**: `App.tsx` catches service errors and lets them bubble to the error boundary
4. **User Layer**: Error boundary displays friendly UI and provides recovery options

## Setup

### Adding Environment Variables

Create `.env.local` in your project root:

```
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
```

**Do NOT commit `.env.local`** — it's ignored in `.gitignore`

### Get Your API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key
4. Paste into `.env.local`

## Testing Error Scenarios

### Test Missing API Key
- Clear `VITE_GEMINI_API_KEY` from `.env.local`
- Try to submit a prompt
- Should show "API Key Missing or Invalid" error

### Test Network Error
- Disconnect internet or use DevTools throttling
- Try to submit a prompt
- Should show "Network Error"

### Test Quota Error
- Make multiple requests until quota is hit
- Should show "API Quota Exceeded" error

## Error Recovery

All errors provide two options:
1. **Back to Home**: Clears app state and returns to hero page
2. **Reload Page**: Full page refresh to reset everything

Both options allow users to start fresh.
