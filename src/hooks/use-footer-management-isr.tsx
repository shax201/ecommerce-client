"use client";

import React, { useMemo, useCallback, useRef } from "react";
import { getFooterISR, ContentResponse } from "@/actions/content";

interface FooterManagementISRProps {
  footerData?: any;
}

export function useFooterManagementISR({
  footerData,
}: FooterManagementISRProps) {
  const [footer, setFooter] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(!footerData);
  const [error, setError] = React.useState<string | null>(null);

  // Use ref to track if we've already processed the footerData
  const processedFooterRef = useRef<string | null>(null);

  // Memoize footerData to detect actual changes
  const footerDataKey = useMemo(() => {
    return footerData ? JSON.stringify(footerData) : null;
  }, [footerData]);

  // Use server-side data if available, otherwise fetch client-side
  React.useEffect(() => {
    // Skip if we've already processed this exact data
    if (processedFooterRef.current === footerDataKey) {
      return;
    }

    if (footerData) {
      // Use ISR data if available
      setFooter(footerData);
      setLoading(false);
      setError(null);
      processedFooterRef.current = footerDataKey;
    } else {
      // Fallback to client-side fetching if no ISR data
      loadFooter();
    }
  }, [footerDataKey]);

  const loadFooter = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: ContentResponse = await getFooterISR();

      if (response.success && response.data) {
        setFooter(response.data);
      } else {
        setFooter(null);
        setError(response.message || "Failed to load footer");
      }
    } catch (err) {
      console.error("Error fetching footer:", err);
      setError("Failed to load footer");
      setFooter(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const dataSource = useMemo(() => {
    return {
      footerFromServer: !!footerData,
      footerFromClient: !footerData,
    };
  }, [footerData]);

  const refresh = useCallback(() => {
    if (footerData) {
      // Reset processed ref to allow re-processing server data
      processedFooterRef.current = null;
      setFooter(footerData);
      setLoading(false);
      setError(null);
    } else {
      loadFooter();
    }
  }, [footerData, loadFooter]);

  return {
    footer,
    loading,
    error,
    dataSource,
    // Performance metrics
    performanceMetrics: {
      hasServerData: !!footerData,
      dataCompleteness: {
        hasFooter: !!footer,
        hasCopyright: !!footer?.copyright,
        hasDescription: !!footer?.description,
        hasSections: footer?.sections?.length > 0,
      },
    },
    // Actions
    refresh,
    loadFooter,
  };
}

// Helper function to determine if footer management should use ISR data
export function shouldUseFooterManagementISRData(
  props: FooterManagementISRProps
): boolean {
  return !!props.footerData;
}

// Helper function to get footer management performance metrics
export function getFooterManagementPerformanceMetrics(
  props: FooterManagementISRProps
) {
  return {
    hasServerData: shouldUseFooterManagementISRData(props),
    missingServerData: {
      footer: !props.footerData,
    },
    dataCompleteness: {
      hasFooterData: !!props.footerData,
      hasCopyright: !!props.footerData?.copyright,
      hasDescription: !!props.footerData?.description,
      hasSections: (props.footerData?.sections?.length ?? 0) > 0,
    },
  };
}
