// Version information for the Pod Grading System
export const VERSION = '4.2.0';
export const BUILD_DATE = new Date().toISOString().split('T')[0];
export const RELEASE_NAME = 'STEM Careers Performance Fix & Dashboard Refinement';

// Version history
export const VERSION_HISTORY = [
  {
    version: '4.2.0',
    date: '2024-11-18',
    name: 'STEM Careers Performance Fix & Dashboard Refinement',
    features: [
      'Fixed freezing issue in STEM Careers tab when typing - memoized expensive calculations',
      'Optimized component rendering to prevent recalculation on every keystroke',
      'Improved dashboard metric cards - smaller, more refined proportions',
      'Reduced card size: padding 20px/16px, minHeight 140px, font size 28px for numbers',
      'Reduced card gap from 28px to 16px for better visual balance',
      'Refined box shadows from 4px to 2px for more subtle appearance',
      'Smaller card border radius (10px) and icon sizes (20px) for refined look'
    ]
  },
  {
    version: '4.1.0',
    date: '2024-11-18',
    name: 'Pod Management Crash Fix & Dashboard Refinement',
    features: [
      'Fixed crash in Pod Management when updating pod stages without existing pod data',
      'Improved dashboard card spacing and padding for better visual separation',
      'Increased dashboard card height for improved content readability',
      'Added safety checks in state reducer to prevent undefined pod access',
      'Refined grid gap spacing for metric cards (increased from 20px to 28px)',
      'Enhanced card padding (32px top/bottom, 28px left/right) for better breathing room'
    ]
  },
  {
    version: '4.0.0',
    date: '2024-11-18',
    name: 'Enhanced Master Student List with Auto-Save & Bug Fixes',
    features: [
      'Fixed critical crash when saving changes to master student list',
      'Implemented auto-save functionality (saves after 3 seconds of inactivity)',
      'Added search/filter functionality to master student list',
      'Added sorting by First Name, Last Name, or Homeroom (ascending/descending)',
      'Visual row highlighting (yellow) to show which rows have been edited',
      'Fixed issue where names would disappear while editing',
      'Pod and role assignments now persist when changing homeroom',
      'Save before delete feature - unsaved changes are saved before deletion',
      'Improved UI with modern design and better visual feedback',
      'Added count indicators for unsaved changes',
      'Better error handling and user feedback messages'
    ]
  },
  {
    version: '3.0.0',
    date: '2024-11-18',
    name: 'Modern UI Redesign & Enhanced Dashboard',
    features: [
      'Complete redesign of user interface with modern color scheme (blue/purple gradient)',
      'Enhanced Dashboard with gradient background and improved metric cards',
      'Interactive metric cards with progress indicators and hover effects',
      'Modernized Period-by-Period status table with enhanced typography',
      'Redesigned pod cards with better visual hierarchy and member display',
      'Improved responsive design for mobile devices (768px and 480px breakpoints)',
      'Modern CSS system with variables for colors, shadows, and border radius',
      'Enhanced form styling with focus states and better contrast',
      'Smooth animations and transitions throughout the application',
      'Better accessibility with improved color contrast ratios'
    ]
  },
  {
    version: '2.2.0',
    date: '2024-11-17',
    name: 'Master Student Management & STEM Careers',
    features: [
      'Master Student List tab for bulk editing (admin-only)',
      'Edit homeroom, pod number, and roles for all students',
      'Add new students with validation',
      'Delete students (bulk or individual)',
      'STEM Careers management for each pod',
      'Import STEM Careers via CSV',
      'Peer Assessment now available to all students (not just admin)',
      'Auto-calculate period from homeroom',
      'Clear pod/roles when changing homeroom'
    ]
  },
  {
    version: '2.1.0',
    date: '2024-11-17',
    name: 'Tab Navigation & State Persistence Fixes',
    features: [
      'Fixed critical render-phase crash when switching tabs',
      'Added ErrorBoundary component for graceful error handling',
      'Form state now persists when switching between tabs',
      'Fixed Firebase subscription cleanup to prevent memory leaks',
      'Fixed state migration for old data from localStorage/Firebase',
      'Improved data validation on app load'
    ]
  },
  {
    version: '2.0.0',
    date: '2024-11-17',
    name: 'Admin Privacy & Multi-Role Support',
    features: [
      'Admin authentication for grade privacy',
      'Multi-role assignment with bonus points',
      'Firebase Realtime Database integration',
      'Anonymous authentication for security',
      'Version tracking and display'
    ]
  },
  {
    version: '1.0.0',
    date: '2024-11-16',
    name: 'Initial Release',
    features: [
      'Pod management for 107 students',
      'Peer assessment with role-specific questions',
      'Teacher grading (engagement + activity)',
      'Auto-grade calculation (60% peer + 40% teacher)',
      'Dashboard with period tracking',
      'Import/Export with CSV support',
      'Student self-evaluation forms'
    ]
  }
];

// Log version info on load
console.log(`%c Pod Grading System v${VERSION} `, 'background: #4CAF50; color: white; font-size: 16px; padding: 4px 8px; border-radius: 4px;');
console.log(`Release: ${RELEASE_NAME}`);
console.log(`Build Date: ${BUILD_DATE}`);
console.table(VERSION_HISTORY[0].features);
