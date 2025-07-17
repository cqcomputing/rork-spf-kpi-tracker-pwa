# Stadium KPI Tracker

## Development Setup

If you're seeing the ERR_NGROK_3200 error, try these steps:

### Option 1: Restart the development server
```bash
# Stop the current server (Ctrl+C)
# Then restart with:
npm run start
```

### Option 2: Try web development mode
```bash
npm run start-web
```

### Option 3: Clear tunnel cache and restart
```bash
# Kill any existing processes
pkill -f "rork start"
pkill -f "ngrok"

# Restart the development server
npm run start
```

### Option 4: Use local development (if tunnel issues persist)
If ngrok continues to have issues, you can modify the start script to run locally:

```json
{
  "scripts": {
    "start-local": "bunx rork start -p jiklmvojfgzjlni4zxmnm",
    "start-web-local": "bunx rork start -p jiklmvojfgzjlni4zxmnm --web"
  }
}
```

## Troubleshooting

- The ngrok tunnel can sometimes disconnect due to network issues
- Free ngrok accounts have session limits that may cause disconnections
- Restarting the development server usually resolves tunnel issues
- For persistent issues, try the local development options above

## Login Credentials
- Sales Rep: username "clayton", PIN "1234"
- Admin: username "admin", PIN "0000"