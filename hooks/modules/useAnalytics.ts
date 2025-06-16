import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../lib/hooks/useAuth';
import { useCalendar } from './useCalendar';
import { useCourses } from './useCourses';
import { useNotes } from './useNotes';
import { useTasks } from './useTasks';

// Analytics data types
export interface GradeAnalytics {
  courseId: string;
  courseName: string;
  currentGrade: number | null;
  targetGrade: number | null;
  gradeProgress: number; // percentage towards target
  taskCount: number;
  completedTaskCount: number;
  upcomingAssignments: number;
}

export interface ProductivityAnalytics {
  dailyStudyTime: number[]; // hours per day for last 7 days
  totalStudyTimeWeek: number; // hours
  totalStudyTimeMonth: number; // hours
  mostProductiveDay: string; // day of week
  mostProductiveTimeOfDay: string; // morning, afternoon, evening, night
  averageSessionLength: number; // minutes
  streakDays: number; // consecutive days with activity
}

export interface CourseEngagement {
  courseId: string;
  courseName: string;
  studyTimeHours: number;
  notesCount: number;
  averageGrade: number | null;
  completionPercentage: number;
  lastActivity: string | null; // ISO date string
}

export interface StudyStats {
  totalCourses: number;
  activeCourses: number;
  totalTasks: number;
  completedTasks: number;
  upcomingDeadlines: number;
  totalNotes: number;
  totalStudyTimeHours: number;
  averageGrade: number | null;
  gpaEquivalent: number | null;
}

export function useAnalytics() {
  const { user } = useAuth();
  const { courses, activeCourses } = useCourses();
  const { tasks, pendingTasks, completedTasks } = useTasks();
  const { notes } = useNotes();
  const { events } = useCalendar();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Analytics state
  const [studyStats, setStudyStats] = useState<StudyStats | null>(null);
  const [gradesAnalytics, setGradesAnalytics] = useState<GradeAnalytics[]>([]);
  const [productivityAnalytics, setProductivityAnalytics] = useState<ProductivityAnalytics | null>(null);
  const [courseEngagement, setCourseEngagement] = useState<CourseEngagement[]>([]);
  
  // Calculate overall study statistics
  const calculateStudyStats = useCallback(() => {
    if (!courses.length) return null;

    const totalCourses = courses.length;
    const activeCourseCount = activeCourses.length;
    const totalTasksCount = tasks.length;
    const completedTasksCount = completedTasks.length;
    
    // Count upcoming deadlines (tasks due in the next 7 days)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    const upcomingDeadlinesCount = pendingTasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= now && dueDate <= nextWeek;
    }).length;
    
    // Calculate average grade across all courses with grades
    const coursesWithGrades = courses.filter(course => course.current_grade !== null && course.current_grade !== undefined);
    const totalGradePoints = coursesWithGrades.reduce((sum, course) => sum + (course.current_grade || 0), 0);
    const averageGrade = coursesWithGrades.length > 0 ? totalGradePoints / coursesWithGrades.length : null;
    
    // Calculate GPA equivalent (simplified conversion)
    const gpaEquivalent = averageGrade !== null ? (averageGrade / 20) * 4 : null; // Assuming 100-point scale to 4.0 GPA
    
    // Mock study time for now (would come from a real tracking system)
    const totalStudyTimeHours = 42; // Example value
    
    const stats: StudyStats = {
      totalCourses,
      activeCourses: activeCourseCount,
      totalTasks: totalTasksCount,
      completedTasks: completedTasksCount,
      upcomingDeadlines: upcomingDeadlinesCount,
      totalNotes: notes.length,
      totalStudyTimeHours,
      averageGrade,
      gpaEquivalent
    };
    
    setStudyStats(stats);
    return stats;
  }, [courses, activeCourses, tasks, pendingTasks, completedTasks, notes]);
  
  // Calculate grades analytics per course
  const calculateGradesAnalytics = useCallback(() => {
    const gradeStats: GradeAnalytics[] = courses.map(course => {
      // Find tasks for this course
      const courseTasks = tasks.filter(task => task.course_id === course.id);
      const completedCourseTasks = courseTasks.filter(task => task.status === 'completed');
      
      // Find upcoming assignments
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      
      const upcomingAssignments = courseTasks.filter(task => {
        if (task.status !== 'pending' || !task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate >= now && dueDate <= nextWeek;
      }).length;
      
      // Calculate grade progress
      const currentGrade = course.current_grade || 0;
      const targetGrade = course.target_grade || 100;
      const gradeProgress = targetGrade > 0 ? (currentGrade / targetGrade) * 100 : 0;
        return {
        courseId: course.id,
        courseName: course.name,
        currentGrade: course.current_grade || null,
        targetGrade: course.target_grade || null,
        gradeProgress: Math.min(gradeProgress, 100), // Cap at 100%
        taskCount: courseTasks.length,
        completedTaskCount: completedCourseTasks.length,
        upcomingAssignments
      };
    });
    
    setGradesAnalytics(gradeStats);
    return gradeStats;
  }, [courses, tasks]);
  
  // Calculate productivity analytics
  const calculateProductivityAnalytics = useCallback(() => {
    // Mock data for productivity analytics
    // In a real implementation, this would be calculated from actual study sessions
    
    const dailyStudyTime = [2.5, 3.0, 1.5, 4.0, 3.5, 2.0, 3.0]; // Last 7 days
    const totalStudyTimeWeek = dailyStudyTime.reduce((sum, hours) => sum + hours, 0);
    const totalStudyTimeMonth = totalStudyTimeWeek * 4; // Simplified estimate
    
    const mockProductivity: ProductivityAnalytics = {
      dailyStudyTime,
      totalStudyTimeWeek,
      totalStudyTimeMonth,
      mostProductiveDay: 'Wednesday',
      mostProductiveTimeOfDay: 'Evening',
      averageSessionLength: 45, // minutes
      streakDays: 12
    };
    
    setProductivityAnalytics(mockProductivity);
    return mockProductivity;
  }, []);
  
  // Calculate course engagement metrics
  const calculateCourseEngagement = useCallback(() => {
    const engagement: CourseEngagement[] = courses.map(course => {
      // Find notes for this course
      const courseNotes = notes.filter(note => note.course_id === course.id);
      
      // Find tasks for this course
      const courseTasks = tasks.filter(task => task.course_id === course.id);
      const completedCourseTasks = courseTasks.filter(task => task.status === 'completed');
      
      // Calculate completion percentage
      const completionPercentage = courseTasks.length > 0 
        ? (completedCourseTasks.length / courseTasks.length) * 100 
        : 0;
      
      // Find most recent activity (note or task)
      let lastActivityDate: string | null = null;
      
      if (courseNotes.length > 0) {
        const latestNoteDate = new Date(Math.max(...courseNotes.map(n => new Date(n.updated_at).getTime())));
        lastActivityDate = latestNoteDate.toISOString();
      }
      
      if (courseTasks.length > 0) {
        const latestTaskDate = new Date(Math.max(...courseTasks.map(t => new Date(t.updated_at).getTime())));
        
        if (!lastActivityDate || new Date(lastActivityDate) < latestTaskDate) {
          lastActivityDate = latestTaskDate.toISOString();
        }
      }
      
      // Mock study time for this course (would come from a real tracking system)
      // This would be calculated from calendar events or dedicated tracking
      const studyTimeHours = Math.floor(Math.random() * 30) + 5; // Random value between 5-35 hours
        return {
        courseId: course.id,
        courseName: course.name,
        studyTimeHours,
        notesCount: courseNotes.length,
        averageGrade: course.current_grade || null,
        completionPercentage,
        lastActivity: lastActivityDate
      };
    });
    
    setCourseEngagement(engagement);
    return engagement;
  }, [courses, notes, tasks]);
  
  // Generate insights based on available data
  const generateInsights = useCallback(() => {
    if (!studyStats || !productivityAnalytics || gradesAnalytics.length === 0) {
      return [];
    }
    
    const insights: string[] = [];
    
    // Completion rate insights
    if (studyStats.totalTasks > 0) {
      const completionRate = (studyStats.completedTasks / studyStats.totalTasks) * 100;
      if (completionRate < 40) {
        insights.push('Your task completion rate is low. Consider breaking tasks into smaller, more manageable pieces.');
      } else if (completionRate > 80) {
        insights.push('Great job keeping up with your tasks! Your completion rate is excellent.');
      }
    }
    
    // Grade insights
    const lowGradeCourses = gradesAnalytics.filter(c => c.currentGrade !== null && c.currentGrade < 70);
    if (lowGradeCourses.length > 0) {
      insights.push(`Consider focusing more on ${lowGradeCourses.length} courses with grades below 70%.`);
    }
    
    // Productivity insights
    const totalStudyTime = productivityAnalytics.totalStudyTimeWeek;
    if (studyStats.activeCourses > 0) {
      const avgStudyTimePerCourse = totalStudyTime / studyStats.activeCourses;
      if (avgStudyTimePerCourse < 3) {
        insights.push('You might benefit from dedicating more study time to each course this week.');
      }
    }
    
    // Streak insights
    if (productivityAnalytics.streakDays > 7) {
      insights.push(`Impressive study streak of ${productivityAnalytics.streakDays} days! Keep it up!`);
    }
    
    // Upcoming deadlines insights
    if (studyStats.upcomingDeadlines > 3) {
      insights.push(`You have ${studyStats.upcomingDeadlines} upcoming deadlines in the next 7 days. Plan your time carefully.`);
    }
    
    return insights;
  }, [studyStats, productivityAnalytics, gradesAnalytics]);
  
  // Calculate all analytics
  const calculateAllAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      calculateStudyStats();
      calculateGradesAnalytics();
      calculateProductivityAnalytics();
      calculateCourseEngagement();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error calculating analytics');
    } finally {
      setLoading(false);
    }
  }, [calculateStudyStats, calculateGradesAnalytics, calculateProductivityAnalytics, calculateCourseEngagement]);
  
  // Update analytics when data changes
  useEffect(() => {
    if (user?.id && courses.length > 0) {
      calculateAllAnalytics();
    }
  }, [user?.id, courses, tasks, notes, events, calculateAllAnalytics]);
  
  return {
    // Data
    studyStats,
    gradesAnalytics,
    productivityAnalytics,
    courseEngagement,
    loading,
    error,
    
    // Actions
    calculateAllAnalytics,
    generateInsights
  };
}
