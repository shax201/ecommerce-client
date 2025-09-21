"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  useGetNavbarQuery,
} from "@/lib/features/navbar";
import {
  useGetActiveDynamicMenusQuery as useGetDynamicMenusQuery,
} from "@/lib/features/dynamic-menus";
import {
  useGetActiveLogosByTypeQuery,
} from "@/lib/features/logos";
import {
  setNavbarData,
  setMenus,
  setLogo,
  setLoading,
  setMenuLoading,
  setLogoLoading,
  setError,
  setMenuError,
  setLogoError,
  clearErrors,
  setDataSource,
  initializeWithServerData,
  selectNavbarData,
  selectMenus,
  selectLogo,
  selectIsLoading,
  selectIsMenuLoading,
  selectIsLogoLoading,
  selectError,
  selectMenuError,
  selectLogoError,
  selectDataSource,
} from "@/lib/features/navbar";
import { getNavbarISR, getActiveDynamicMenusISR, getActiveLogoISR } from "@/actions/content";

interface NavbarReduxProps {
  dynamicMenus?: any[];
  logo?: any | null;
  navbarData?: any;
}

interface NavbarReduxReturn {
  // Data
  navbarData: any;
  menus: any[];
  logo: any | null;
  
  // Loading states
  isLoading: boolean;
  isMenuLoading: boolean;
  isLogoLoading: boolean;
  
  // Error states
  error: string | null;
  menuError: string | null;
  logoError: string | null;
  
  // Data source info
  dataSource: {
    navbarFromServer: boolean;
    navbarFromClient: boolean;
    menusFromServer: boolean;
    menusFromClient: boolean;
    logoFromServer: boolean;
    logoFromClient: boolean;
  };
  
  // Actions
  refreshNavbar: () => void;
  refreshMenus: () => void;
  refreshLogo: () => void;
  clearAllErrors: () => void;
  
  // Performance metrics
  performanceMetrics: {
    hasServerData: boolean;
    dataCompleteness: {
      hasNavbar: boolean;
      hasMenus: boolean;
      hasLogo: boolean;
    };
  };
}

export function useNavbarRedux({
  dynamicMenus,
  logo,
  navbarData,
}: NavbarReduxProps = {}): NavbarReduxReturn {
  const dispatch = useDispatch();
  
  // Redux selectors
  const reduxNavbarData = useSelector(selectNavbarData);
  const reduxMenus = useSelector(selectMenus);
  const reduxLogo = useSelector(selectLogo);
  const reduxIsLoading = useSelector(selectIsLoading);
  const reduxIsMenuLoading = useSelector(selectIsMenuLoading);
  const reduxIsLogoLoading = useSelector(selectIsLogoLoading);
  const reduxError = useSelector(selectError);
  const reduxMenuError = useSelector(selectMenuError);
  const reduxLogoError = useSelector(selectLogoError);
  const reduxDataSource = useSelector(selectDataSource);

  // RTK Query hooks for client-side fetching
  const {
    data: navbarQueryData,
    isLoading: navbarQueryLoading,
    error: navbarQueryError,
    refetch: refetchNavbar,
  } = useGetNavbarQuery(undefined, {
    skip: navbarData !== undefined, // Skip if server data is provided
  });

  const {
    data: dynamicMenusQueryData,
    isLoading: dynamicMenusQueryLoading,
    error: dynamicMenusQueryError,
    refetch: refetchDynamicMenus,
  } = useGetDynamicMenusQuery(undefined, {
    skip: dynamicMenus !== undefined, // Skip if server data is provided
  });

  const {
    data: logoQueryData,
    isLoading: logoQueryLoading,
    error: logoQueryError,
    refetch: refetchLogo,
  } = useGetActiveLogosByTypeQuery("main", {
    skip: logo !== undefined, // Skip if server data is provided
  });

  // Initialize with server data if provided
  useEffect(() => {
    if (navbarData || dynamicMenus || logo) {
      dispatch(
        initializeWithServerData({
          navbarData: navbarData || null,
          menus: dynamicMenus || [],
          logo: logo || null,
        })
      );
    }
  }, [navbarData, dynamicMenus, logo, dispatch]);

  // Handle client-side data fetching
  useEffect(() => {
    if (!navbarData && navbarQueryData) {
      dispatch(setNavbarData(navbarQueryData.data));
      dispatch(setDataSource({ navbarFromClient: true }));
    }
  }, [navbarData, navbarQueryData, dispatch]);

  useEffect(() => {
    if (!dynamicMenus && dynamicMenusQueryData?.data) {
      dispatch(setMenus(dynamicMenusQueryData.data));
      dispatch(setDataSource({ menusFromClient: true }));
    }
  }, [dynamicMenus, dynamicMenusQueryData, dispatch]);

  useEffect(() => {
    if (!logo && logoQueryData?.data) {
      const logoData = Array.isArray(logoQueryData.data) 
        ? logoQueryData.data[0] 
        : logoQueryData.data;
      if (logoData) {
        dispatch(setLogo({
          url: logoData.url,
          altText: logoData.altText,
          name: logoData.name,
        }));
        dispatch(setDataSource({ logoFromClient: true }));
      }
    }
  }, [logo, logoQueryData, dispatch]);

  // Handle loading states
  useEffect(() => {
    dispatch(setLoading(navbarQueryLoading));
  }, [navbarQueryLoading, dispatch]);

  useEffect(() => {
    dispatch(setMenuLoading(dynamicMenusQueryLoading));
  }, [dynamicMenusQueryLoading, dispatch]);

  useEffect(() => {
    dispatch(setLogoLoading(logoQueryLoading));
  }, [logoQueryLoading, dispatch]);

  // Handle errors
  useEffect(() => {
    if (navbarQueryError) {
      dispatch(setError("Failed to load navbar data"));
    }
  }, [navbarQueryError, dispatch]);

  useEffect(() => {
    if (dynamicMenusQueryError) {
      dispatch(setMenuError("Failed to load menu data"));
    }
  }, [dynamicMenusQueryError, dispatch]);

  useEffect(() => {
    if (logoQueryError) {
      dispatch(setLogoError("Failed to load logo data"));
    }
  }, [logoQueryError, dispatch]);

  // Memoized data
  const finalNavbarData = useMemo(() => {
    return navbarData || reduxNavbarData;
  }, [navbarData, reduxNavbarData]);

  const finalMenus = useMemo(() => {
    return dynamicMenus || reduxMenus;
  }, [dynamicMenus, reduxMenus]);

  const finalLogo = useMemo(() => {
    return logo || reduxLogo;
  }, [logo, reduxLogo]);

  // Memoized loading state
  const finalIsLoading = useMemo(() => {
    return reduxIsLoading || reduxIsMenuLoading || reduxIsLogoLoading;
  }, [reduxIsLoading, reduxIsMenuLoading, reduxIsLogoLoading]);

  // Memoized error state
  const finalError = useMemo(() => {
    return reduxError || reduxMenuError || reduxLogoError;
  }, [reduxError, reduxMenuError, reduxLogoError]);

  // Memoized data source
  const finalDataSource = useMemo(() => {
    return {
      navbarFromServer: navbarData !== undefined,
      navbarFromClient: navbarData === undefined && !!reduxNavbarData,
      menusFromServer: dynamicMenus !== undefined,
      menusFromClient: dynamicMenus === undefined && reduxMenus.length > 0,
      logoFromServer: logo !== undefined,
      logoFromClient: logo === undefined && !!reduxLogo,
    };
  }, [navbarData, dynamicMenus, logo, reduxNavbarData, reduxMenus, reduxLogo]);

  // Actions
  const refreshNavbar = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearErrors());
      
      const response = await getNavbarISR();
      if (response.success && response.data) {
        dispatch(setNavbarData(response.data));
        dispatch(setDataSource({ navbarFromClient: true }));
      } else {
        dispatch(setError("Failed to refresh navbar data"));
      }
    } catch (error) {
      dispatch(setError("Failed to refresh navbar data"));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const refreshMenus = useCallback(async () => {
    try {
      dispatch(setMenuLoading(true));
      dispatch(clearErrors());
      
      const response = await getActiveDynamicMenusISR();
      if (response.success && response.data) {
        dispatch(setMenus(response.data));
        dispatch(setDataSource({ menusFromClient: true }));
      } else {
        dispatch(setMenuError("Failed to refresh menu data"));
      }
    } catch (error) {
      dispatch(setMenuError("Failed to refresh menu data"));
    } finally {
      dispatch(setMenuLoading(false));
    }
  }, [dispatch]);

  const refreshLogo = useCallback(async () => {
    try {
      dispatch(setLogoLoading(true));
      dispatch(clearErrors());
      
      const response = await getActiveLogoISR();
      if (response.success && response.data) {
        dispatch(setLogo({
          url: response.data.url,
          altText: response.data.altText,
          name: response.data.name,
        }));
        dispatch(setDataSource({ logoFromClient: true }));
      } else {
        dispatch(setLogoError("Failed to refresh logo data"));
      }
    } catch (error) {
      dispatch(setLogoError("Failed to refresh logo data"));
    } finally {
      dispatch(setLogoLoading(false));
    }
  }, [dispatch]);

  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    return {
      hasServerData: finalDataSource.navbarFromServer || 
                    finalDataSource.menusFromServer || 
                    finalDataSource.logoFromServer,
      dataCompleteness: {
        hasNavbar: !!finalNavbarData,
        hasMenus: finalMenus.length > 0,
        hasLogo: !!finalLogo,
      },
    };
  }, [finalDataSource, finalNavbarData, finalMenus, finalLogo]);

  return {
    // Data
    navbarData: finalNavbarData,
    menus: finalMenus,
    logo: finalLogo,
    
    // Loading states
    isLoading: finalIsLoading,
    isMenuLoading: reduxIsMenuLoading,
    isLogoLoading: reduxIsLogoLoading,
    
    // Error states
    error: finalError,
    menuError: reduxMenuError,
    logoError: reduxLogoError,
    
    // Data source info
    dataSource: finalDataSource,
    
    // Actions
    refreshNavbar,
    refreshMenus,
    refreshLogo,
    clearAllErrors,
    
    // Performance metrics
    performanceMetrics,
  };
}
