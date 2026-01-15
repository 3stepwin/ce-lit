# Developer Experience Improvements

## QR Code HTML Page for Expo Development

**Date Added**: 2026-01-14  
**Status**: Implemented ✅

### Problem
Terminal QR codes are hard to scan directly. Expo Go users often struggle with:
- Small terminal QR codes
- Terminal font rendering issues
- Need to manually type expo URLs

### Solution
Created `scan.html` - a local HTML page that:
- Auto-detects local IP address via WebRTC
- Generates a clean, scannable QR code using qrcode.js
- Displays the expo URL for manual entry
- Matches app aesthetic (Institutional Void theme)

### Usage
```bash
# Start Expo server
npx expo start --port 8082

# Open scan.html in browser
# File location: ./scan.html
```

### Future Enhancements
- [ ] Auto-refresh when Expo server restarts
- [ ] Support for multiple ports/projects
- [ ] Integration with custom dev dashboard
- [ ] Add connection status indicator
- [ ] Export as reusable template for other React Native projects

### Related Files
- `scan.html` - Main QR code page
- `clear_cache.js` - Cache clearing utility

---

## Other DX Improvements to Consider

### Cache Management
- ✅ `clear_cache.js` - One-command cache clearing
- [ ] Add to npm scripts: `"reset": "node clear_cache.js && npx expo start"`

### Development Scripts
- [ ] `dev-dashboard.html` - Combined logs, QR, and project info
- [ ] Hot reload status indicator
- [ ] Database connection tester

### Mobile Testing
- [ ] Device-specific build profiles
- [ ] Screenshot automation for different screen sizes
- [ ] Network request logger for debugging API calls
