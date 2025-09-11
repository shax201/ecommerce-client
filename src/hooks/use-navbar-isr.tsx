"use client";

import React, { useMemo, useCallback, useRef } from "react";
import { getNavbarISR, ContentResponse } from "@/actions/content";
import { useDynamicMenus, DynamicMenu } from "./use-dynamic-menus";
import { useLogo, Logo } from "./use-logo";

interface NavbarISRProps {
  dynamicMenus?: DynamicMenu[];
  logo?: Logo | null;
}

interface NavbarManagementProps {
  navbarData?: any;
}

export function useNavbarISR({ dynamicMenus, logo }: NavbarISRProps) {
  const {
    menus: hookMenus,
    loading: menusLoading,
    error: menusError,
  } = useDynamicMenus();
  const { logo: hookLogo, loading: logoLoading, error: logoError } = useLogo();

  // Memoize data sources to prevent unnecessary re-renders
  const menusData = useMemo(
    () => dynamicMenus || hookMenus,
    [dynamicMenus, hookMenus]
  );
  const logoData = useMemo(
    () => (logo !== undefined ? logo : hookLogo),
    [logo, hookLogo]
  );

  // Memoize loading state
  const isLoading = useMemo(() => {
    return (
      (dynamicMenus === undefined && menusLoading) ||
      (logo === undefined && logoLoading)
    );
  }, [dynamicMenus, logo, menusLoading, logoLoading]);

  // Memoize error state
  const hasError = useMemo(() => {
    return (
      (dynamicMenus === undefined && menusError !== null) ||
      (logo === undefined && logoError !== null)
    );
  }, [dynamicMenus, logo, menusError, logoError]);

  // Memoize data source information
  const dataSource = useMemo(() => {
    return {
      menusFromServer: dynamicMenus !== undefined,
      logoFromServer: logo !== undefined,
      menusFromHook: dynamicMenus === undefined,
      logoFromHook: logo === undefined,
    };
  }, [dynamicMenus, logo]);

  return {
    menusData,
    logoData,
    isLoading,
    hasError,
    dataSource,
  };
}

export function useNavbarManagementISR({ navbarData }: NavbarManagementProps) {
  const [navbar, setNavbar] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Use ref to track if we've already processed the navbarData
  const processedNavbarRef = useRef<string | null>(null);

  // Memoize navbarData to detect actual changes
  const navbarDataKey = useMemo(() => {
    return navbarData ? JSON.stringify(navbarData) : null;
  }, [navbarData]);

  // Use server-side data if available, otherwise fetch client-side
  React.useEffect(() => {
    // Skip if we've already processed this exact data
    if (processedNavbarRef.current === navbarDataKey) {
      return;
    }

    if (navbarData) {
      // Use server-side data
      setNavbar(navbarData);
      setLoading(false);
      setError(null);
      processedNavbarRef.current = navbarDataKey;
    } else {
      // Fallback to client-side fetching if no server data
      fetchNavbar();
    }
  }, [navbarDataKey]);

  const fetchNavbar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: ContentResponse = await getNavbarISR();

      if (response.success && response.data) {
        setNavbar(response.data);
      } else {
        setNavbar(null);
      }
    } catch (err) {
      console.error("Error fetching navbar:", err);
      setError("Failed to load navbar");
      setNavbar(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const dataSource = useMemo(() => {
    return {
      navbarFromServer: navbarData !== undefined,
      navbarFromClient: navbarData === undefined,
    };
  }, [navbarData]);

  // Memoize refresh function
  const refresh = useCallback(() => {
    if (navbarData) {
      // Reset processed ref to allow re-processing server data
      processedNavbarRef.current = null;
      setNavbar(navbarData);
      setLoading(false);
      setError(null);
    } else {
      fetchNavbar();
    }
  }, [navbarData, fetchNavbar]);

  return {
    navbar,
    loading,
    error,
    dataSource,
    // Actions
    refresh,
    // Performance metrics
    performanceMetrics: {
      hasServerData: navbarData !== undefined,
      dataCompleteness: {
        hasNavbar: navbar !== null,
        hasMenus: navbar?.menus?.length > 0,
      },
    },
  };
}

// Helper function to determine if navbar should use ISR data
export function shouldUseNavbarISRData(props: NavbarISRProps): boolean {
  return props.dynamicMenus !== undefined || props.logo !== undefined;
}

// Helper function to get navbar performance metrics
export function getNavbarPerformanceMetrics(props: NavbarISRProps) {
  return {
    hasServerData: shouldUseNavbarISRData(props),
    missingServerData: {
      dynamicMenus: props.dynamicMenus === undefined,
      logo: props.logo === undefined,
    },
    dataCompleteness: {
      hasDynamicMenus:
        props.dynamicMenus !== undefined && props.dynamicMenus !== null,
      hasLogo: props.logo !== undefined && props.logo !== null,
    },
  };
}

// Helper function to determine if navbar management should use ISR data
export function shouldUseNavbarManagementISRData(
  props: NavbarManagementProps
): boolean {
  return props.navbarData !== undefined;
}

// Helper function to get navbar management performance metrics
export function getNavbarManagementPerformanceMetrics(
  props: NavbarManagementProps
) {
  return {
    hasServerData: shouldUseNavbarManagementISRData(props),
    missingServerData: {
      navbar: props.navbarData === undefined,
    },
    dataCompleteness: {
      hasNavbarData:
        props.navbarData !== undefined && props.navbarData !== null,
      hasMenus: (props.navbarData?.menus?.length ?? 0) > 0,
    },
  };
}
