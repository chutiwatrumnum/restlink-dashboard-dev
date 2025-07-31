import { useState, useCallback, useEffect, useRef } from 'react';
import { apiWithRetry } from './apiExamples';
import { useLocation } from 'react-router-dom';

// Custom hook สำหรับจัดการ API calls
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = useCallback(async (apiFunction: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiWithRetry(apiFunction);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการเรียก API';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, callApi };
};

// Custom hook สำหรับจัดการ timeout และ retry
export const useApiWithTimeout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const callApiWithTimeout = useCallback(async (
    apiFunction: () => Promise<any>,
    timeoutMs: number = 30000,
    maxRetries: number = 3
  ) => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
    
    try {
      const result = await apiWithRetry(
        async () => {
          return Promise.race([
            apiFunction(),
            new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error(`Request timeout after ${timeoutMs}ms`));
              }, timeoutMs);
            })
          ]);
        },
        maxRetries
      );
      return result;
    } catch (err: any) {
      const errorMessage = err.message.includes('timeout') 
        ? `การเชื่อมต่อใช้เวลานานเกินไป (${timeoutMs/1000} วินาที)`
        : err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการเรียก API';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, retryCount, callApiWithTimeout };
}; 

// Custom hook สำหรับจับการเปลี่ยน route
export const useRouteChange = (callback: (pathname: string, previousPathname?: string) => void) => {
  const location = useLocation();
  const previousPathnameRef = useRef<string>();

  useEffect(() => {
    const currentPathname = location.pathname;
    const previousPathname = previousPathnameRef.current;

    // เรียก callback function เมื่อ route เปลี่ยน
    if (previousPathname !== currentPathname) {
      callback(currentPathname, previousPathname);
    }

    // เก็บ pathname ปัจจุบันสำหรับครั้งถัดไป
    previousPathnameRef.current = currentPathname;
  }, [location.pathname, callback]);

  return location;
};

// Custom hook สำหรับจับการเปลี่ยน route แบบ advanced
export const useRouteChangeAdvanced = (options: {
  onRouteChange?: (pathname: string, previousPathname?: string) => void;
  onEnter?: (pathname: string) => void;
  onLeave?: (pathname: string) => void;
  excludePaths?: string[];
}) => {
  const location = useLocation();
  const previousPathnameRef = useRef<string>();
  const { onRouteChange, onEnter, onLeave, excludePaths = [] } = options;

  useEffect(() => {
    const currentPathname = location.pathname;
    const previousPathname = previousPathnameRef.current;

    // ตรวจสอบว่า path ปัจจุบันอยู่ใน excludePaths หรือไม่
    const isExcluded = excludePaths.some(path => currentPathname.includes(path));

    if (!isExcluded && previousPathname !== currentPathname) {
      // เรียก onLeave สำหรับ path เก่า
      if (previousPathname && onLeave) {
        onLeave(previousPathname);
      }

      // เรียก onEnter สำหรับ path ใหม่
      if (onEnter) {
        onEnter(currentPathname);
      }

      // เรียก onRouteChange
      if (onRouteChange) {
        onRouteChange(currentPathname, previousPathname);
      }
    }

    previousPathnameRef.current = currentPathname;
  }, [location.pathname, onRouteChange, onEnter, onLeave, excludePaths]);

  return location;
};

// Hook สำหรับ track page views
export const usePageTracking = (trackingFunction: (pathname: string) => void) => {
  const location = useLocation();

  useEffect(() => {
    trackingFunction(location.pathname);
  }, [location.pathname, trackingFunction]);

  return location;
}; 