// Database Clean Installation Test - StudyVault V1.0
// This hook tests that the database initializes correctly with the clean migration

import { healthCheck, initializeDatabase, resetDatabase } from '@/lib/database';
import { RepositoryFactory } from '@/lib/database/repositories';
import { useEffect, useState } from 'react';

export function useDatabaseCleanTest(shouldRun: boolean = false) {
  const [status, setStatus] = useState<{
    phase: string;
    isComplete: boolean;
    results: any;
    error: string | null;
  }>({
    phase: 'init',
    isComplete: false,
    results: null,
    error: null
  });

  useEffect(() => {
    if (!shouldRun) return;
    
    async function runTest() {
      try {
        // Phase 1: Reset the database to simulate clean install
        setStatus(prev => ({ ...prev, phase: 'reset' }));
        console.log('🧹 Resetting database to simulate clean install...');
        await resetDatabase();

        // Phase 2: Initialize database with clean migration
        setStatus(prev => ({ ...prev, phase: 'initialize' }));
        console.log('🚀 Initializing database...');
        await initializeDatabase();

        // Phase 3: Check database health
        setStatus(prev => ({ ...prev, phase: 'health_check' }));
        console.log('🔍 Checking database health...');
        const dbHealth = await healthCheck();
        console.log('📊 Database health:', dbHealth);        // Phase 4: Test basic operations
        setStatus(prev => ({ ...prev, phase: 'test_operations' }));
        console.log('🧪 Testing basic operations...');
        
        // Create test user
        console.log('👤 Creating test user...');
        const userRepo = RepositoryFactory.getUserRepository();
        
        const testUserData = {
          name: "Clean Test User",
          email: "clean-test@studyvault.app",
          preferences: {
            theme: 'system' as const,
            notifications_enabled: true,
            default_reminder_time: 15,
            study_goal_hours_per_day: 4,
            first_day_of_week: 1 as const
          }
        };
        
        console.log('� Test user data:', testUserData);
        
        const testUser = await userRepo.create(testUserData);
        console.log('👤 Test user created:', testUser);// Create test course
        const courseRepo = RepositoryFactory.getCourseRepository();
        const testCourse = await courseRepo.create({
          user_id: testUser.id,
          name: "Database Testing 101",
          description: "A course to test database operations",
          semester: "2025-01",
          color: "#4CAF50",
          is_active: true,
          grade_scale: "percentage"
        });
        console.log('📚 Test course created:', testCourse);

        // Get all created entities
        const allUsers = await userRepo.getAll();
        const allCourses = await courseRepo.getAll();

        // Complete test
        const results = {
          dbHealth,
          users: allUsers,
          courses: allCourses
        };

        setStatus({
          phase: 'complete',
          isComplete: true,
          results,
          error: null
        });
        console.log('✅ Clean installation test completed successfully!');
      } catch (err) {
        console.error('❌ Clean installation test failed:', err);
        setStatus(prev => ({
          ...prev,
          phase: 'error',
          isComplete: true,
          error: err instanceof Error ? err.message : 'Unknown error'
        }));
      }
    }    // Start test after a delay
    const timer = setTimeout(runTest, 1500);
    return () => clearTimeout(timer);
  }, [shouldRun]);

  return status;
}
