// Database Test Hook - StudyVault V1.0
// Hook para probar que la base de datos funciona correctamente

import { RepositoryFactory } from '@/lib/database/repositories';
import { getDatabaseStats } from '@/lib/database/utils';
import { useEffect, useState } from 'react';

export function useDatabaseTest() {
  const [isReady, setIsReady] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testDatabase = async () => {
      try {
        console.log('🧪 Probando base de datos...');
        
        // Test 1: Get database stats
        const dbStats = await getDatabaseStats();
        console.log('📊 Estadísticas de BD:', dbStats);
        setStats(dbStats);

        // Test 2: Try creating a test user
        const userRepo = RepositoryFactory.getUserRepository();
        const userCount = await userRepo.count();
        console.log('👥 Usuarios en BD:', userCount);

        // Test 3: If no users, create a test user
        if (userCount === 0) {
          console.log('👤 Creando usuario de prueba...');
          const testUser = await userRepo.create({
            name: "Usuario de Prueba",
            email: "test@studyvault.com",
            preferences: {
              theme: 'system',
              notifications_enabled: true,
              default_reminder_time: 15,
              study_goal_hours_per_day: 4,
              first_day_of_week: 1
            }
          });
          console.log('✅ Usuario creado:', testUser);
        }

        // Test 4: Get all users
        const users = await userRepo.getAll();
        console.log('👥 Todos los usuarios:', users);

        setIsReady(true);
        console.log('🎉 ¡Todas las pruebas de BD pasaron!');
      } catch (err) {
        console.error('❌ Error en pruebas de BD:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };

    // Solo correr las pruebas después de un pequeño delay
    const timer = setTimeout(testDatabase, 1000);
    return () => clearTimeout(timer);
  }, []);

  return {
    isReady,
    stats,
    error
  };
}
