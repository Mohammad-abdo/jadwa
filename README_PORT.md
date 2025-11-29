# Frontend Port Configuration

## Default Port
The frontend now runs on port **5173** (Vite's default) instead of 3000.

## Change Port

### Option 1: Environment Variable (Recommended)
Create a `.env` file in the `marketpro` directory:

```env
VITE_PORT=3000
```

Or any other port you prefer.

### Option 2: Edit vite.config.js
Edit `marketpro/vite.config.js` and change the port number:

```javascript
server: {
  port: 3000, // Change this number
  open: true,
  host: true,
},
```

## Common Ports
- **5173** - Vite default (current)
- **3000** - Common React development port
- **3001** - Alternative if 3000 is busy
- **8080** - Alternative web server port

## Note
After changing the port, restart the development server:
```bash
npm run dev
```

