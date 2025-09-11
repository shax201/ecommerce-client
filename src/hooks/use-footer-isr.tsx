"use client";

import { useMemo } from "react";
import { useFooterData } from "@/components/layout/Footer/useFooterData";

interface FooterISRProps {
  footerData?: any;
  clientLogos?: any[];
}

export function useFooterISR({ footerData, clientLogos }: FooterISRProps) {
  const { footerData: hookFooterData, isLoading, error } = useFooterData();

  // Use server-side data if available, otherwise use hook data
  const footerDataFinal = useMemo(() => {
    return footerData || hookFooterData;
  }, [footerData, hookFooterData]);

  const isLoadingFinal = useMemo(() => {
    // Only show loading if we don't have server data and hook is loading
    return footerData === undefined && isLoading;
  }, [footerData, isLoading]);

  const hasError = useMemo(() => {
    return !footerData && error;
  }, [footerData, error]);

  const dataSource = useMemo(() => {
    return {
      footerFromServer: footerData !== undefined,
      clientLogosFromServer: clientLogos !== undefined,
      footerFromHook: footerData === undefined,
      clientLogosFromProps: clientLogos !== undefined,
    };
  }, [footerData, clientLogos]);

  return {
    footerData: footerDataFinal,
    clientLogos,
    isLoading: isLoadingFinal,
    hasError,
    dataSource,
    // Raw hook data for debugging
    rawHookData: {
      footerData: hookFooterData,
      isLoading,
      error,
    },
  };
}

// Helper function to determine if footer should use ISR data
export function shouldUseFooterISRData(props: FooterISRProps): boolean {
  return props.footerData !== undefined || props.clientLogos !== undefined;
}

// Helper function to get footer performance metrics
export function getFooterPerformanceMetrics(props: FooterISRProps) {
  return {
    hasServerData: shouldUseFooterISRData(props),
    missingServerData: {
      footer: props.footerData === undefined,
      clientLogos: props.clientLogos === undefined,
    },
    dataCompleteness: {
      hasFooterData:
        props.footerData !== undefined && props.footerData !== null,
      hasClientLogos: (props.clientLogos?.length ?? 0) > 0,
    },
  };
}
