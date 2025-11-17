// Version information for the Pod Grading System
export const VERSION = '2.1.0';
export const BUILD_DATE = new Date().toISOString().split('T')[0];
export const RELEASE_NAME = 'Tab Navigation & State Persistence Fixes';

// Version history
export const VERSION_HISTORY = [
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
