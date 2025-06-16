import { useCallback, useEffect, useMemo, useState } from 'react';
import { NotFoundError, QueryOptions } from '../../lib/database/repositories/base.repository';
import { CourseRepository } from '../../lib/database/repositories/CourseRepository';
import { Course } from '../../lib/database/schemas/course.schema';
import { useAuth } from '../../lib/hooks/useAuth';

export type CourseFormData = Omit<Course, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  const [archivedCourses, setArchivedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentSemester, setCurrentSemester] = useState<string>('2025-1'); // Default to current semester
    const { user } = useAuth();
  const courseRepo = useMemo(() => new CourseRepository(), []);

  // Fetch all courses for the current user
  const fetchCourses = useCallback(async (options?: QueryOptions) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filters = { user_id: user.id, ...options?.filters };
      const allCourses = await courseRepo.getAll({ 
        ...options,
        filters,
        sort: options?.sort || { field: 'name', direction: 'ASC' }
      });
      
      setCourses(allCourses);
      
      // Also update the active and archived courses
      const active = allCourses.filter(course => course.is_active);
      const archived = allCourses.filter(course => !course.is_active);
      
      setActiveCourses(active);
      setArchivedCourses(archived);
      
      return allCourses;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching courses');      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id, courseRepo]);
  
  // Fetch courses by semester
  const fetchCoursesBySemester = useCallback(async (semester: string) => {
    if (!user?.id) return [];
    
    try {
      return await courseRepo.getBySemester(user.id, semester);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching courses by semester');      return [];
    }
  }, [user?.id, courseRepo]);
  
  // Create a new course
  const createCourse = useCallback(async (courseData: CourseFormData) => {
    if (!user?.id) return null;
    
    setError(null);
    
    try {
      const newCourse = await courseRepo.create({
        ...courseData,
        user_id: user.id,
      });
      
      // Update the courses list
      setCourses(prev => [...prev, newCourse]);
      if (newCourse.is_active) {
        setActiveCourses(prev => [...prev, newCourse]);
      } else {
        setArchivedCourses(prev => [...prev, newCourse]);
      }
      
      return newCourse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating course');      return null;
    }
  }, [user?.id, courseRepo]);
  
  // Update an existing course
  const updateCourse = useCallback(async (courseId: string, updates: Partial<CourseFormData>) => {
    setError(null);
    
    try {
      const updatedCourse = await courseRepo.update(courseId, updates);
      
      // Update the courses list
      setCourses(prev => 
        prev.map(course => course.id === courseId ? updatedCourse : course)
      );
      
      // Update active/archived lists if is_active changed
      if ('is_active' in updates) {
        if (updates.is_active) {
          // Moving from archived to active
          setArchivedCourses(prev => prev.filter(course => course.id !== courseId));
          setActiveCourses(prev => [...prev, updatedCourse]);
        } else {
          // Moving from active to archived
          setActiveCourses(prev => prev.filter(course => course.id !== courseId));
          setArchivedCourses(prev => [...prev, updatedCourse]);
        }
      } else {
        // Just update the appropriate list
        if (updatedCourse.is_active) {
          setActiveCourses(prev => 
            prev.map(course => course.id === courseId ? updatedCourse : course)
          );
        } else {
          setArchivedCourses(prev => 
            prev.map(course => course.id === courseId ? updatedCourse : course)
          );
        }
      }
      
      // Update selected course if it's the one being edited
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(updatedCourse);
      }
      
      return updatedCourse;
    } catch (err) {
      if (err instanceof NotFoundError) {
        setError(`Course not found: ${courseId}`);
      } else {
        setError(err instanceof Error ? err.message : 'Error updating course');
      }      return null;
    }
  }, [selectedCourse, courseRepo]);
  
  // Delete a course
  const deleteCourse = useCallback(async (courseId: string) => {
    setError(null);
    
    try {
      await courseRepo.delete(courseId);
      
      // Remove from all lists
      setCourses(prev => prev.filter(course => course.id !== courseId));
      setActiveCourses(prev => prev.filter(course => course.id !== courseId));
      setArchivedCourses(prev => prev.filter(course => course.id !== courseId));
      
      // Clear selected course if it was the deleted one
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
      }
      
      return true;
    } catch (err) {
      if (err instanceof NotFoundError) {
        setError(`Course not found: ${courseId}`);
      } else {
        setError(err instanceof Error ? err.message : 'Error deleting course');
      }      return false;
    }
  }, [selectedCourse, courseRepo]);
  
  // Archive a course
  const archiveCourse = useCallback(async (courseId: string) => {
    return updateCourse(courseId, { is_active: false });
  }, [updateCourse]);
  
  // Activate a course
  const activateCourse = useCallback(async (courseId: string) => {
    return updateCourse(courseId, { is_active: true });
  }, [updateCourse]);
  
  // Update a course's grade
  const updateCourseGrade = useCallback(async (courseId: string, grade: number) => {
    return updateCourse(courseId, { current_grade: grade });
  }, [updateCourse]);
  
  // Get a course by ID
  const getCourseById = useCallback(async (courseId: string) => {
    setError(null);
    
    try {
      const course = await courseRepo.getById(courseId);
      return course;
    } catch (err) {      setError(err instanceof Error ? err.message : `Error getting course: ${courseId}`);
      return null;
    }
  }, [courseRepo]);
  
  // Select a course (sets the selectedCourse state)
  const selectCourse = useCallback(async (courseId: string | null) => {
    if (courseId === null) {
      setSelectedCourse(null);
      return null;
    }
    
    const course = await getCourseById(courseId);
    setSelectedCourse(course);
    return course;
  }, [getCourseById]);
  
  // Change current semester
  const changeSemester = useCallback((semester: string) => {
    setCurrentSemester(semester);
    // Optionally fetch courses for this semester
    return fetchCoursesBySemester(semester);
  }, [fetchCoursesBySemester]);
  
  // Load courses on initial render and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchCourses();
    }
  }, [user?.id, fetchCourses]);
  
  return {
    // Data
    courses,
    activeCourses,
    archivedCourses,
    selectedCourse,
    currentSemester,
    loading,
    error,
    
    // Actions
    fetchCourses,
    fetchCoursesBySemester,
    createCourse,
    updateCourse,
    deleteCourse,
    archiveCourse,
    activateCourse,
    updateCourseGrade,
    getCourseById,
    selectCourse,
    changeSemester
  };
}