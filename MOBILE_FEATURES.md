# Mobile Features Documentation

## Overview
The Climate Stories Map has been enhanced with comprehensive mobile support, optimized for both Android and iPhone devices with a preference for landscape orientation.

## Key Mobile Features

### 🔄 Landscape Mode Preference
- **Default Behavior**: App encourages landscape mode for optimal viewing experience
- **Smart Prompts**: Shows a friendly rotation prompt when device is in portrait mode
- **Developer Toggle**: Easily disable/enable landscape prompts via developer settings

### 📱 Responsive Design
- **Adaptive Layout**: Taskbar repositions based on device orientation
  - Portrait: Taskbar moves to top
  - Landscape: Taskbar stays on left side
- **Touch-Friendly**: All interactive elements meet 44px minimum touch target size
- **Optimized Typography**: Improved text sizes and spacing for mobile readability

### ⚙️ Developer Settings
- **Easy Access**: Floating gear icon in bottom-right corner
- **Landscape Toggle**: Turn on/off the landscape mode prompts
- **Persistent Settings**: Preferences saved in localStorage
- **Mobile Detection**: Only shows on mobile devices or when `?dev=true` is in URL

## Technical Implementation

### Mobile Detection
```typescript
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                 (window.innerWidth <= 768 && 'ontouchstart' in window);
```

### Orientation Management
- Uses `MobileOrientationManager` singleton class
- Listens for `orientationchange` and `resize` events
- Provides smooth transitions between orientations

### CSS Media Queries
- `@media screen and (max-width: 768px)` for mobile devices
- `@media screen and (orientation: portrait)` for portrait-specific styles
- `@media screen and (orientation: landscape)` for landscape-specific styles
- `@media (hover: none) and (pointer: coarse)` for touch devices

## Mobile Optimizations

### Performance
- Prevents overscroll bounce on iOS
- Optimizes scrolling with `-webkit-overflow-scrolling: touch`
- Reduces motion for users with `prefers-reduced-motion`

### User Experience
- Prevents zoom on input focus (iOS)
- Improves text rendering with font smoothing
- Touch-friendly map controls (44px minimum)
- Better popup interactions on touch devices

### Accessibility
- Maintains WCAG touch target guidelines
- Supports reduced motion preferences
- High contrast support for better visibility

## Usage

### For Users
1. **Automatic**: Mobile optimizations work automatically on mobile devices
2. **Landscape Prompt**: Rotate device when prompted for best experience
3. **Settings**: Use gear icon to customize landscape behavior

### For Developers
1. **Testing**: Add `?dev=true` to URL to access developer settings on desktop
2. **Toggle**: Use developer settings to test landscape prompts
3. **Customization**: Modify `MobileOrientationManager` for different behaviors

## Browser Support
- ✅ iOS Safari (12+)
- ✅ Chrome Mobile (80+)
- ✅ Firefox Mobile (68+)
- ✅ Samsung Internet (10+)
- ✅ Edge Mobile (80+)

## Files Modified/Added

### New Files
- `src/utils/mobileOrientationManager.ts` - Core orientation management
- `src/components/DeveloperSettings.tsx` - Developer settings panel
- `src/components/DeveloperSettings.css` - Developer settings styles
- `src/components/MobileOrientationPrompt.css` - Landscape prompt styles

### Enhanced Files
- `src/App.tsx` - Added mobile manager initialization
- `frontend/index.html` - Mobile meta tags and optimizations
- `src/App.css` - Mobile-specific app styles
- `src/global.css` - Global mobile improvements
- `src/components/MapWithForm.css` - Touch-friendly map controls
- `src/components/pages/PageLayout.css` - Responsive page layouts
- `src/components/Taskbar.css` - Mobile taskbar positioning

## Configuration Options

### Environment Variables
No additional environment variables required.

### LocalStorage Keys
- `forceLandscapeMode`: Boolean to control landscape prompts (default: true)
- `dontShowCreatePostInstructions`: Existing setting for post instructions

## Future Enhancements
- PWA (Progressive Web App) support
- Offline functionality
- Push notifications for story updates
- Native app wrapper considerations