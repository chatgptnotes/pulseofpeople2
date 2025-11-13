/**
 * Onboarding System
 * Guided tours for new users based on their role
 */

export interface OnboardingStep {
  id: string;
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
  highlight?: boolean;
  disableBeacon?: boolean;
}

export interface OnboardingTour {
  id: string;
  name: string;
  role?: string;
  steps: OnboardingStep[];
  autoStart?: boolean;
  showSkipButton?: boolean;
  persistent?: boolean;
}

export interface OnboardingProgress {
  userId: string;
  completedTours: string[];
  skippedTours: string[];
  currentTour?: string;
  currentStep?: number;
  lastUpdated: string;
}

// Tour definitions by role
export const ONBOARDING_TOURS: Record<string, OnboardingTour> = {
  // Super Admin Onboarding
  superAdminTour: {
    id: 'super-admin-tour',
    name: 'Super Admin Platform Tour',
    role: 'super_admin',
    autoStart: true,
    showSkipButton: true,
    steps: [
      {
        id: 'welcome',
        target: 'body',
        title: 'Welcome to Pulse of People',
        content: 'Welcome to the Super Admin dashboard! Let me show you around the platform management features.',
        placement: 'center',
      },
      {
        id: 'dashboard',
        target: '[data-tour="super-admin-dashboard"]',
        title: 'Platform Dashboard',
        content: 'This is your platform overview where you can monitor all tenants, revenue, and system health.',
        placement: 'right',
        highlight: true,
      },
      {
        id: 'admins',
        target: '[data-tour="admin-management"]',
        title: 'Admin Management',
        content: 'Create and manage organization administrators who will manage their own tenants.',
        placement: 'right',
        highlight: true,
      },
      {
        id: 'tenants',
        target: '[data-tour="tenant-registry"]',
        title: 'Tenant Registry',
        content: 'View and monitor all tenants across the platform. Check their health status and resource usage.',
        placement: 'right',
        highlight: true,
      },
      {
        id: 'provisioning',
        target: '[data-tour="provisioning"]',
        title: 'Tenant Provisioning',
        content: 'Create new tenants with our automated provisioning wizard. Set up subdomain, configure settings, and invite admins.',
        placement: 'right',
        highlight: true,
      },
      {
        id: 'complete',
        target: 'body',
        title: 'You\'re All Set!',
        content: 'You\'re ready to manage the platform. You can always access this tour again from the help menu.',
        placement: 'center',
      },
    ],
  },

  // Admin Onboarding
  adminTour: {
    id: 'admin-tour',
    name: 'Organization Admin Tour',
    role: 'admin',
    autoStart: true,
    showSkipButton: true,
    steps: [
      {
        id: 'welcome',
        target: 'body',
        title: 'Welcome to Your Organization',
        content: 'Welcome! Let me show you how to manage your organization and tenants.',
        placement: 'center',
      },
      {
        id: 'org-dashboard',
        target: '[data-tour="org-dashboard"]',
        title: 'Organization Dashboard',
        content: 'This is your organization overview. Monitor all your tenants, users, and resource usage here.',
        placement: 'right',
        highlight: true,
      },
      {
        id: 'tenant-management',
        target: '[data-tour="tenant-management"]',
        title: 'Tenant Management',
        content: 'Create and manage multiple tenants (campaigns or projects) for your organization.',
        placement: 'right',
        highlight: true,
      },
      {
        id: 'user-management',
        target: '[data-tour="user-management"]',
        title: 'User Management',
        content: 'Invite team members and assign them to specific tenants with appropriate permissions.',
        placement: 'right',
        highlight: true,
      },
      {
        id: 'complete',
        target: 'body',
        title: 'Ready to Get Started!',
        content: 'You\'re all set! Create your first tenant to start your campaign.',
        placement: 'center',
      },
    ],
  },

  // User Onboarding
  userTour: {
    id: 'user-tour',
    name: 'User Dashboard Tour',
    role: 'user',
    autoStart: true,
    showSkipButton: true,
    steps: [
      {
        id: 'welcome',
        target: 'body',
        title: 'Welcome to Pulse of People',
        content: 'Welcome! Let me show you the main features of the platform.',
        placement: 'center',
      },
      {
        id: 'dashboard',
        target: '[data-tour="dashboard"]',
        title: 'Dashboard',
        content: 'Your main dashboard shows real-time voter sentiment, analytics, and key metrics.',
        placement: 'right',
        highlight: true,
      },
      {
        id: 'voter-database',
        target: '[data-tour="voter-database"]',
        title: 'Voter Database',
        content: 'Access and manage your voter database with advanced search and filtering.',
        placement: 'right',
        highlight: true,
      },
      {
        id: 'analytics',
        target: '[data-tour="analytics"]',
        title: 'Analytics',
        content: 'View detailed analytics, trends, and insights about voter sentiment.',
        placement: 'right',
        highlight: true,
      },
      {
        id: 'field-workers',
        target: '[data-tour="field-workers"]',
        title: 'Field Workers',
        content: 'Manage your field team, track their activities, and monitor data collection.',
        placement: 'right',
        highlight: true,
      },
      {
        id: 'reports',
        target: '[data-tour="reports"]',
        title: 'Reports',
        content: 'Generate and export custom reports for your campaigns.',
        placement: 'right',
        highlight: true,
      },
      {
        id: 'complete',
        target: 'body',
        title: 'You\'re Ready!',
        content: 'Start exploring the platform. You can access help anytime from the menu.',
        placement: 'center',
      },
    ],
  },

  // Feature-specific tours
  voterDatabaseTour: {
    id: 'voter-database-tour',
    name: 'Voter Database Deep Dive',
    showSkipButton: true,
    steps: [
      {
        id: 'search',
        target: '[data-tour="voter-search"]',
        title: 'Smart Search',
        content: 'Use our powerful search to find voters by name, location, booth number, or any custom field.',
        placement: 'bottom',
        highlight: true,
      },
      {
        id: 'filters',
        target: '[data-tour="voter-filters"]',
        title: 'Advanced Filters',
        content: 'Apply multiple filters to segment your voter database effectively.',
        placement: 'left',
        highlight: true,
      },
      {
        id: 'bulk-actions',
        target: '[data-tour="bulk-actions"]',
        title: 'Bulk Actions',
        content: 'Perform bulk operations on multiple voters at once - assign field workers, add tags, or export data.',
        placement: 'top',
        highlight: true,
      },
      {
        id: 'export',
        target: '[data-tour="export"]',
        title: 'Data Export',
        content: 'Export your data in multiple formats (CSV, Excel, PDF) with custom column selection.',
        placement: 'left',
        highlight: true,
      },
    ],
  },
};

/**
 * Get onboarding progress from storage
 */
export function getOnboardingProgress(userId: string): OnboardingProgress {
  const key = `onboarding_progress_${userId}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse onboarding progress:', error);
    }
  }

  return {
    userId,
    completedTours: [],
    skippedTours: [],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Save onboarding progress to storage
 */
export function saveOnboardingProgress(progress: OnboardingProgress): void {
  const key = `onboarding_progress_${progress.userId}`;
  progress.lastUpdated = new Date().toISOString();
  localStorage.setItem(key, JSON.stringify(progress));
}

/**
 * Mark tour as completed
 */
export function completeTour(userId: string, tourId: string): void {
  const progress = getOnboardingProgress(userId);

  if (!progress.completedTours.includes(tourId)) {
    progress.completedTours.push(tourId);
  }

  // Remove from skipped if it was there
  progress.skippedTours = progress.skippedTours.filter((id) => id !== tourId);

  // Clear current tour
  if (progress.currentTour === tourId) {
    progress.currentTour = undefined;
    progress.currentStep = undefined;
  }

  saveOnboardingProgress(progress);
}

/**
 * Mark tour as skipped
 */
export function skipTour(userId: string, tourId: string): void {
  const progress = getOnboardingProgress(userId);

  if (!progress.skippedTours.includes(tourId)) {
    progress.skippedTours.push(tourId);
  }

  // Clear current tour
  if (progress.currentTour === tourId) {
    progress.currentTour = undefined;
    progress.currentStep = undefined;
  }

  saveOnboardingProgress(progress);
}

/**
 * Reset tour progress (restart tour)
 */
export function resetTour(userId: string, tourId: string): void {
  const progress = getOnboardingProgress(userId);

  progress.completedTours = progress.completedTours.filter((id) => id !== tourId);
  progress.skippedTours = progress.skippedTours.filter((id) => id !== tourId);

  if (progress.currentTour === tourId) {
    progress.currentTour = undefined;
    progress.currentStep = undefined;
  }

  saveOnboardingProgress(progress);
}

/**
 * Check if tour is completed
 */
export function isTourCompleted(userId: string, tourId: string): boolean {
  const progress = getOnboardingProgress(userId);
  return progress.completedTours.includes(tourId);
}

/**
 * Check if tour is skipped
 */
export function isTourSkipped(userId: string, tourId: string): boolean {
  const progress = getOnboardingProgress(userId);
  return progress.skippedTours.includes(tourId);
}

/**
 * Get tours for user role
 */
export function getToursForRole(role: string): OnboardingTour[] {
  return Object.values(ONBOARDING_TOURS).filter(
    (tour) => !tour.role || tour.role === role
  );
}

/**
 * Get active tour for user
 */
export function getActiveTour(userId: string): OnboardingTour | null {
  const progress = getOnboardingProgress(userId);

  if (!progress.currentTour) {
    return null;
  }

  return ONBOARDING_TOURS[progress.currentTour] || null;
}

/**
 * Start a tour
 */
export function startTour(userId: string, tourId: string): void {
  const progress = getOnboardingProgress(userId);

  progress.currentTour = tourId;
  progress.currentStep = 0;

  saveOnboardingProgress(progress);
}

/**
 * Update current step
 */
export function updateTourStep(userId: string, step: number): void {
  const progress = getOnboardingProgress(userId);

  if (progress.currentTour) {
    progress.currentStep = step;
    saveOnboardingProgress(progress);
  }
}

/**
 * Get pending tours for user (not completed or skipped)
 */
export function getPendingTours(userId: string, role: string): OnboardingTour[] {
  const progress = getOnboardingProgress(userId);
  const roleTours = getToursForRole(role);

  return roleTours.filter(
    (tour) =>
      !progress.completedTours.includes(tour.id) &&
      !progress.skippedTours.includes(tour.id)
  );
}

/**
 * Check if user should see onboarding
 */
export function shouldShowOnboarding(userId: string, role: string): boolean {
  const pendingTours = getPendingTours(userId, role);
  return pendingTours.some((tour) => tour.autoStart);
}

export default {
  ONBOARDING_TOURS,
  getOnboardingProgress,
  saveOnboardingProgress,
  completeTour,
  skipTour,
  resetTour,
  isTourCompleted,
  isTourSkipped,
  getToursForRole,
  getActiveTour,
  startTour,
  updateTourStep,
  getPendingTours,
  shouldShowOnboarding,
};
