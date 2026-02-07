import React from 'react';
import type { ReactNode } from 'react';
import type { Feature } from '@/shared/types';
import { useCanAccess } from '@/features/entitlements/EntitlementContext';

interface FeatureGateProps {
  /** The feature required to see the children. */
  feature: Feature;

  /**
   * What to render when the user lacks access.
   * - Omit: renders nothing (hides the feature silently)
   * - ReactNode: renders that node (e.g., an upgrade prompt)
   * - 'disabled': renders children but passes `disabled` context
   */
  fallback?: ReactNode;

  children: ReactNode;
}

/**
 * Conditionally render UI based on feature entitlements.
 *
 * Usage:
 *
 *   // Hide feature entirely
 *   <FeatureGate feature="analytics_advanced">
 *     <AdvancedAnalytics />
 *   </FeatureGate>
 *
 *   // Show upgrade prompt when locked
 *   <FeatureGate feature="workout_export" fallback={<UpgradePrompt feature="workout_export" />}>
 *     <ExportButton />
 *   </FeatureGate>
 */
export function FeatureGate({ feature, fallback, children }: FeatureGateProps) {
  const hasAccess = useCanAccess(feature);

  if (hasAccess) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;
  return null;
}
