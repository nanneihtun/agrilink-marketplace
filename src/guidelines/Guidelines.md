# AgriLink Development Guidelines

## Mobile-First Design System

AgriLink follows a mobile-first approach to ensure optimal experience across all devices, especially for Myanmar's mobile-heavy user base.

### Core Principles
* Design and code for mobile first (320px+), then enhance for larger screens
* Touch-friendly interfaces with minimum 44px touch targets
* Fast loading and offline-capable features for rural connectivity
* Clear visual hierarchy optimized for small screens

### Responsive Design Rules
* **Base styles**: Mobile-optimized (no breakpoint prefix)
* **Progressive enhancement**: Use `sm:`, `md:`, `lg:`, `xl:` breakpoints
* **Grid layouts**: Start with `grid-cols-1`, expand to `md:grid-cols-2 lg:grid-cols-3`
* **Navigation**: Compact mobile navigation, full labels on desktop

### Layout Guidelines
* Use `container mx-auto px-4` for consistent page margins
* Prefer flexbox and grid over absolute positioning
* Stack elements vertically on mobile, arrange horizontally on desktop
* Keep content readable with max-width containers (max-w-7xl, max-w-4xl, etc.)

### Component Patterns

#### Navigation
* Mobile: Icon-only buttons with `px-2` spacing
* Desktop: Full labels with icons using `mr-2`
* Hide secondary navigation on mobile, show with `hidden md:flex`

#### Modals & Overlays
* Mobile: Full-screen overlays with `fixed inset-0`
* Desktop: Centered modals with backdrop
* Chat interfaces: Full-screen mobile, side panel desktop

#### Buttons & Actions
* Minimum touch target: 44px (use `h-11` or `py-3`)
* Primary actions prominent and thumb-accessible
* Secondary actions available but not prominent

### Typography
* Base font size: 16px (never go below 14px for body text)
* Scale responsively: `text-lg md:text-xl lg:text-2xl`
* Maintain line-height for readability: `leading-relaxed`

### Spacing & Sizing
* Use consistent spacing scale: `space-y-4`, `gap-6`, etc.
* Touch-friendly spacing: minimum 8px between interactive elements
* Responsive spacing: `py-4 md:py-6 lg:py-8`

### Performance Guidelines
* Lazy load images and components when possible
* Minimize bundle size for mobile connections
* Use efficient data structures for filtering and search
* Cache data locally for offline functionality

### Accessibility Requirements
* WCAG 2.1 AA compliance
* Semantic HTML structure
* Proper heading hierarchy (h1, h2, h3)
* Alt text for all images
* Keyboard navigation support
* Screen reader compatibility

### Agricultural Context
* Use Myanmar-appropriate language and terminology
* Consider rural internet connectivity constraints
* Design for various literacy levels
* Include offline-first functionality for remote areas

## Component Guidelines

### ProductCard
* Optimized for mobile browsing
* Clear pricing and seller information
* Touch-friendly action buttons
* Responsive image sizing

### ChatInterface  
* Full-screen on mobile for focused conversation
* Side panel on desktop for multitasking
* Clear message threading
* Offline message queuing

### SearchFilters
* Collapsible on mobile to save screen space
* Easy-to-use filter chips
* Clear active filter indicators
* Quick filter reset option

### Forms
* Single-column layout on mobile
* Large touch targets for form controls
* Progressive disclosure for complex forms
* Clear validation messaging

Remember: Myanmar has high mobile usage, so mobile experience is PRIMARY, not secondary.