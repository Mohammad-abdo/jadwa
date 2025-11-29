# Jadwa Consulting Platform

A complete bilingual (Arabic/English) UI/UX interface for Jadwa Consulting Platform, an economic and administrative consulting system.

## Features

### Public Website
- **Home Page**: Hero section, services, consultants, reports, testimonials, partners
- **Inner Pages**: About, Services, Consultants, Reports, Blog, Contact
- **Bilingual Support**: Full Arabic/English language switching
- **Responsive Design**: Mobile and desktop optimized

### Client Dashboard
- Personalized home dashboard
- Consultation booking system
- Previous consultations management
- Chat/Video session interface
- Profile settings

### Consultant Dashboard
- Session management
- Earnings tracking
- Profile management
- Availability calendar

### Admin Dashboard
- Complete platform management
- Client and consultant management
- Session and payment tracking
- CMS for content management
- Platform settings and integrations

## Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool
- **Ant Design 5** - UI Component Library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Routing
- **Day.js** - Date handling

## Color Scheme

- **Olive Green**: Primary brand color (#7a8c66)
- **Turquoise**: Secondary accent color (#14b8a6)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── public/          # Public website components
│   ├── client/          # Client dashboard components
│   ├── consultant/      # Consultant dashboard components
│   └── admin/           # Admin dashboard components
├── pages/
│   ├── public/          # Public pages
│   ├── client/          # Client dashboard pages
│   ├── consultant/      # Consultant dashboard pages
│   └── admin/           # Admin dashboard pages
├── contexts/
│   └── LanguageContext.jsx  # Bilingual language context
├── App.jsx              # Main app component with routing
└── main.jsx            # Entry point
```

## Language Support

The platform supports both Arabic (RTL) and English (LTR) languages. Language preference is stored in localStorage and can be toggled from the header.

## Routes

### Public Routes
- `/` - Home page
- `/about` - About page
- `/services` - Services page
- `/consultants` - Consultants page
- `/reports` - Reports page
- `/blog` - Blog page
- `/contact` - Contact page
- `/login` - Login page

### Client Routes
- `/client` - Client dashboard home
- `/client/bookings` - Book consultation
- `/client/consultations` - My consultations
- `/client/chat/:sessionId?` - Chat interface
- `/client/profile` - Profile settings

### Consultant Routes
- `/consultant` - Consultant dashboard home
- `/consultant/sessions` - Sessions management
- `/consultant/profile` - Profile settings
- `/consultant/earnings` - Earnings tracking

### Admin Routes
- `/admin` - Admin dashboard overview
- `/admin/clients` - Client management
- `/admin/consultants` - Consultant management
- `/admin/sessions` - Session management
- `/admin/payments` - Payment management
- `/admin/cms` - Content management
- `/admin/settings` - Platform settings

## Development Notes

- All components use Ant Design for consistent UI
- Tailwind CSS for custom styling and responsive design
- RTL support is handled automatically based on language selection
- Color theme uses olive green and turquoise throughout

## Next Steps

1. Connect to backend API
2. Implement authentication
3. Add real-time chat functionality
4. Integrate payment gateways
5. Add video call integration (Zoom/Twilio)
6. Implement charts and analytics
7. Add form validation
8. Implement file uploads

## License

Private - All rights reserved
