# MyFinder Frontend

React + TypeScript frontend for the Local Services Finder application.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Headless UI** - Accessible UI components
- **Heroicons** - Icon library
- **React Map GL** - Map integration (ready for Mapbox)

## Project Structure

```
src/
├── components/          # Reusable components
│   └── layout/         # Layout components (Navbar, Footer, Layout)
├── pages/              # Page components
│   ├── Auth/           # Login, Register
│   ├── Dashboard/      # Provider dashboard pages
│   ├── Provider/       # Provider profile view
│   └── Organization/   # Organization pages
├── services/           # API services
│   └── api/            # API client and service modules
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
├── App.tsx             # Main app component with routing
├── main.tsx            # Application entry point
└── index.css           # Global styles with Tailwind

## Installation

```bash
npm install
```

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_MAPBOX_TOKEN=your_mapbox_access_token_here
```

## State Management

### Zustand Stores

#### Auth Store (`stores/authStore.ts`)
Manages authentication state and user data:
- `user` - Current user object
- `accessToken` - JWT access token
- `isAuthenticated` - Authentication status
- `login()` - Login function
- `register()` - Registration function
- `logout()` - Logout function

#### Search Store (`stores/searchStore.ts`)
Manages search state and results:
- `providers` - Search results
- `filters` - Current search filters
- `userLocation` - User's current location
- `searchProviders()` - Execute search
- `setFilters()` - Update filters
- `getNearbyProviders()` - Get nearby providers

## API Services

### API Client (`services/api/client.ts`)
Axios instance with:
- Base URL configuration
- Request interceptors (adds auth token)
- Response interceptors (handles token refresh)
- Automatic retry on 401 errors

### Auth API (`services/api/auth.ts`)
- `authApi.register()` - User registration
- `authApi.login()` - User login
- `authApi.getMe()` - Get current user
- `authApi.refreshToken()` - Refresh access token

### Search API (`services/api/search.ts`)
- `searchApi.searchProviders()` - Advanced search
- `searchApi.getNearbyProviders()` - Nearby search

## Routing

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/search` - Search page
- `/provider/:id` - Provider profile
- `/organization/:id` - Organization view

### Protected Routes (require authentication)
- `/dashboard` - Provider dashboard
  - `/dashboard/profile` - Profile management
  - `/dashboard/services` - Service management
  - `/dashboard/analytics` - Analytics view
- `/organization/create` - Create organization

## Components Architecture

### Layout Components
- **Layout** - Main layout wrapper with Navbar and Footer
- **Navbar** - Navigation bar with auth status
- **Footer** - Site footer

### Page Components
- **Home** - Landing page with hero and search
- **Login/Register** - Authentication pages
- **Search** - Advanced search with filters (placeholder)
- **ProviderProfile** - Provider details view (placeholder)
- **Dashboard** - Provider dashboard with nested routes
- **DashboardProfile** - Profile management (placeholder)
- **DashboardServices** - Service management (placeholder)
- **DashboardAnalytics** - Analytics view (placeholder)

## TypeScript Types

All types are defined in `src/types/index.ts`:

- `User` - User account data
- `Provider` - Provider profile data
- `Service` - Service listing data
- `Category` - Service category
- `Organization` - Organization data
- `Group` - Group data
- `Review` - Review data
- `SearchParams` - Search parameters
- `SearchResponse` - Search results with pagination

## Styling

### Tailwind CSS
Custom utility classes defined in `src/index.css`:

- `.btn` - Base button styles
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.input` - Form input styles
- `.card` - Card container

### Color Palette
Primary colors (blue):
- 50-950 shades available
- Primary: `primary-600` (#2563eb)

## Development Workflow

1. **API Integration**
   - API services are in `src/services/api/`
   - Add new service modules as needed
   - Update TypeScript types in `src/types/`

2. **State Management**
   - Create new Zustand stores in `src/stores/`
   - Keep stores focused on specific domains
   - Use persist middleware for data that should survive page refreshes

3. **Component Development**
   - Reusable components go in `src/components/`
   - Page components go in `src/pages/`
   - Use TypeScript for props and state

4. **Routing**
   - Add new routes in `src/App.tsx`
   - Use `ProtectedRoute` wrapper for auth-required routes

## Next Steps for Implementation

### High Priority
1. **Search Page** - Implement full search UI
   - Filter sidebar with all search parameters
   - Provider results grid/list
   - Map view with markers
   - Pagination controls

2. **Provider Profile Page** - Complete provider view
   - Header with provider info and stats
   - Services list
   - Reviews section
   - Media gallery
   - Location map
   - Contact buttons

3. **Dashboard Pages** - Complete provider dashboard
   - Profile form with location picker
   - Services CRUD interface
   - Analytics charts and metrics

4. **Map Integration** - Add Mapbox
   - Install: `npm install react-map-gl mapbox-gl`
   - Create MapView component
   - Add provider markers
   - User location and radius circle

### Medium Priority
5. **Organization Management**
   - Create organization form
   - Organization details page
   - Group management UI
   - Member management

6. **Review System**
   - Review form
   - Review list with ratings
   - Review moderation (for admins)

### Nice to Have
7. **Advanced Features**
   - Image upload preview
   - Autocomplete for locations
   - Skeleton loaders
   - Toast notifications
   - Dark mode

## Performance Optimization

- **Code Splitting** - Routes are lazy loaded
- **Image Optimization** - Use next-gen formats (WebP)
- **Bundle Size** - Vite automatically optimizes
- **Caching** - API responses can be cached in Zustand stores

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

## Contributing

When adding new features:
1. Create TypeScript types first
2. Create API service function
3. Create or update Zustand store
4. Build UI components
5. Add routing if needed

## Troubleshooting

### API Connection Issues
- Verify `VITE_API_URL` in `.env`
- Check backend is running
- Check CORS settings in backend

### Authentication Issues
- Clear localStorage and retry
- Check JWT tokens in dev tools
- Verify backend JWT configuration

### Build Issues
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear Vite cache: `rm -rf node_modules/.vite`

## License

MIT
