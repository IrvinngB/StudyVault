import type { ClassData } from '@/database/services';
import { classService } from '@/database/services';
import { useCallback, useEffect, useState } from 'react';

export interface UseClassesReturn {
  // State
  classes: ClassData[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchClasses: () => Promise<void>;
  getClassById: (id: string) => ClassData | undefined;
  getClassByName: (name: string) => ClassData | undefined;
  
  // Utility
  clearError: () => void;
  refetch: () => Promise<void>;
}

export const useClasses = (): UseClassesReturn => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedClasses = await classService.getAllClasses();
      setClasses(fetchedClasses.filter(cls => cls.is_active)); // Solo clases activas
    } catch (err: any) {
      setError(err.message || 'Error al cargar las clases');
    } finally {
      setLoading(false);
    }
  }, []);

  const getClassById = useCallback((id: string): ClassData | undefined => {
    return classes.find(cls => cls.id === id);
  }, [classes]);

  const getClassByName = useCallback((name: string): ClassData | undefined => {
    return classes.find(cls => cls.name.toLowerCase().includes(name.toLowerCase()));
  }, [classes]);

  const refetch = useCallback(async () => {
    await fetchClasses();
  }, [fetchClasses]);

  // Load classes on mount
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return {
    // State
    classes,
    loading,
    error,
    
    // Actions
    fetchClasses,
    getClassById,
    getClassByName,
    
    // Utility
    clearError,
    refetch,
  };
};
