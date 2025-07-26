import {
  ThemedCard,
  ThemedText,
  ThemedButton
} from '@/components/ui/ThemedComponents';
import { ClassData } from '@/database/services/courseService';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';

interface CourseCardProps {
  course: ClassData;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    if (course.id) {
      router.push(`/courses/${course.id}` as any);
    } else {
      Alert.alert(
        'Error',
        'No se puede acceder a los detalles de este curso.',
        [{ text: 'OK' }]
      );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return '';
    }
  };

  if (!course || !course.name) {
    return null;
  }

  const courseName = String(course.name || '');
  const courseCode = course.code ? String(course.code) : '';
  const courseSemester = course.semester ? String(course.semester) : '';
  const courseCredits = course.credits ? String(course.credits) : '';
  const courseInstructor = course.instructor ? String(course.instructor) : '';
  const courseDescription = course.description ? String(course.description) : '';

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <ThemedCard 
        variant="elevated" 
        padding="medium" 
        style={{ marginBottom: theme.spacing.md }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Color indicator */}
          <View
            style={{
              width: 50,
              height: 50,
              backgroundColor: course.color || theme.colors.primary,
              borderRadius: theme.borderRadius.md,
              marginRight: theme.spacing.md,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: course.color || theme.colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <ThemedText 
              variant="h2" 
              style={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: 18
              }}
            >
              {courseName.charAt(0).toUpperCase()}
            </ThemedText>
          </View>

          {/* Course Info */}
          <View style={{ flex: 1 }}>
            <ThemedText 
              variant="h2" 
              style={{ 
                color: theme.colors.primary,
                marginBottom: theme.spacing.xs,
                fontWeight: '600'
              }}
            >
              {courseName}
            </ThemedText>
            
            {/* Course details row */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              marginBottom: theme.spacing.xs
            }}>
              {courseCode && (
                <View style={{
                  backgroundColor: theme.colors.surfaceLight || `${theme.colors.primary}10`,
                  paddingHorizontal: theme.spacing.xs,
                  paddingVertical: 2,
                  borderRadius: theme.borderRadius.xs,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: theme.spacing.xs,
                  marginBottom: theme.spacing.xs
                }}>
                  <Ionicons name="document-text" size={12} color={theme.colors.textSecondary || theme.colors.secondary} />
                  <ThemedText 
                    variant="caption" 
                    style={{ 
                      color: theme.colors.secondary,
                      marginLeft: 4
                    }}
                  >
                    {courseCode}
                  </ThemedText>
                </View>
              )}
              
              {courseSemester && (
                <View style={{
                  backgroundColor: theme.colors.surfaceLight || `${theme.colors.primary}10`,
                  paddingHorizontal: theme.spacing.xs,
                  paddingVertical: 2,
                  borderRadius: theme.borderRadius.xs,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: theme.spacing.xs,
                  marginBottom: theme.spacing.xs
                }}>
                  <Ionicons name="calendar" size={12} color={theme.colors.textSecondary || theme.colors.secondary} />
                  <ThemedText 
                    variant="caption" 
                    style={{ 
                      color: theme.colors.secondary,
                      marginLeft: 4
                    }}
                  >
                    {courseSemester}
                  </ThemedText>
                </View>
              )}

              {courseCredits && (
                <View style={{
                  backgroundColor: theme.colors.surfaceLight || `${theme.colors.primary}10`,
                  paddingHorizontal: theme.spacing.xs,
                  paddingVertical: 2,
                  borderRadius: theme.borderRadius.xs,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: theme.spacing.xs,
                  marginBottom: theme.spacing.xs
                }}>
                  <Ionicons name="star" size={12} color={theme.colors.textSecondary || theme.colors.secondary} />
                  <ThemedText 
                    variant="caption" 
                    style={{ 
                      color: theme.colors.secondary,
                      marginLeft: 4
                    }}
                  >
                    {courseCredits} créditos
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Instructor and status */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {courseInstructor && (
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  flex: 1,
                  marginRight: theme.spacing.sm
                }}>
                  <Ionicons name="person" size={14} color={theme.colors.textSecondary || theme.colors.secondary} />
                  <ThemedText 
                    variant="caption" 
                    numberOfLines={1}
                    style={{ 
                      color: theme.colors.secondary,
                      marginLeft: 4
                    }}
                  >
                    {courseInstructor}
                  </ThemedText>
                </View>
              )}

              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center'
              }}>
                {/* Status indicator */}
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: course.is_active ? (theme.colors.success || '#4CAF50') : (theme.colors.warning || '#FFC107'),
                    marginRight: theme.spacing.xs
                  }}
                />
                
                {/* Date info */}
                {course.updated_at && formatDate(course.updated_at) && (
                  <ThemedText 
                    variant="caption" 
                    style={{ color: theme.colors.secondary }}
                  >
                    {formatDate(course.updated_at)}
                  </ThemedText>
                )}
              </View>
            </View>
          </View>

          {/* Arrow indicator */}
          <View style={{ 
            marginLeft: theme.spacing.sm,
            opacity: 0.5 
          }}>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
          </View>
        </View>

        {/* Description preview */}
        {courseDescription && courseDescription.length > 0 && (
          <View style={{ 
            marginTop: theme.spacing.sm,
            paddingTop: theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border || theme.colors.secondary + '20'
          }}>
            <ThemedText 
              variant="caption" 
              numberOfLines={2}
              style={{ 
                color: theme.colors.secondary,
                lineHeight: 16 
              }}
            >
              {courseDescription}
            </ThemedText>
          </View>
        )}

        {/* 👉 Botón para ver calificaciones */}
        <ThemedButton
          title="Ver calificaciones"
          variant="outline"
          onPress={() => {
            if (course.id) {
              router.push(`/grades/${course.id}` as any);
            } else {
              Alert.alert('Error', 'No se puede acceder a las calificaciones.');
            }
          }}
          style={{ marginTop: theme.spacing.md }}
        />
      </ThemedCard>
    </TouchableOpacity>
  );
}
