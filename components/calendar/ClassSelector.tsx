import { ThemedText } from '@/components/ui/ThemedComponents';
import type { ClassData } from '@/database/services';
import { useClasses } from '@/hooks/useClasses';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ClassSelectorProps {
  selectedClassId?: string;
  onSelectClass: (classData: ClassData | null) => void;
  placeholder?: string;
  required?: boolean;
  style?: any;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  selectedClassId,
  onSelectClass,
  placeholder = "Seleccionar clase",
  required = false,
  style
}) => {
  const { theme } = useTheme();
  const { classes, loading, error } = useClasses();
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Debug: log para verificar estado
  React.useEffect(() => {
    console.log('ClassSelector Debug:', {
      classes: classes.length,
      loading,
      error,
      classesData: classes
    });
  }, [classes, loading, error]);

  const selectedClass = selectedClassId ? classes.find(cls => cls.id === selectedClassId) : null;

  const handleSelectClass = (classData: ClassData) => {
    onSelectClass(classData);
    setIsExpanded(false);
  };

  const handleClearSelection = () => {
    onSelectClass(null);
    setIsExpanded(false);
  };

  const renderClassItem = ({ item }: { item: ClassData }) => {
    return (
    <TouchableOpacity
      style={[
        styles.classItem,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
        }
      ]}
      onPress={() => handleSelectClass(item)}
    >
      <View style={styles.classItemContent}>
        <View style={styles.classInfo}>
          <View style={styles.classHeader}>
            <View 
              style={[
                styles.colorDot,
                { backgroundColor: item.color || theme.colors.primary }
              ]} 
            />
            <ThemedText variant="h3" style={{ 
              color: theme.colors.text, 
              flex: 1,
              fontWeight: '600',
              fontSize: 14
            }}>
              {item.name || 'Sin nombre'}
            </ThemedText>
          </View>
          
          {item.code && (
            <ThemedText variant="body" style={{ 
              color: theme.colors.textMuted, 
              fontSize: 12,
              fontWeight: '500',
              marginTop: 2
            }}>
              📚 {item.code}
            </ThemedText>
          )}
          
          {(item.description && item.description.trim()) ? (
            <ThemedText variant="body" style={{ 
              color: theme.colors.text, 
              fontSize: 11, 
              marginTop: 3,
              lineHeight: 16,
              opacity: 0.7
            }}>
              {item.description.trim()}
            </ThemedText>
          ) : (
            <ThemedText variant="body" style={{ 
              color: theme.colors.textMuted, 
              fontSize: 10, 
              marginTop: 3,
              fontStyle: 'italic'
            }}>
              Sin descripción
            </ThemedText>
          )}
          
          {item.instructor && (
            <ThemedText variant="body" style={{ 
              color: theme.colors.secondary, 
              fontSize: 12, 
              marginTop: 3,
              fontWeight: '500'
            }}>
              👨‍🏫 {item.instructor}
            </ThemedText>
          )}
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={[
          styles.selector,
          {
            backgroundColor: theme.colors.surfaceLight,
            borderColor: theme.colors.border,
          }
        ]}>
          <ThemedText variant="body" style={{ color: theme.colors.textMuted }}>
            Cargando clases...
          </ThemedText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <View style={[
          styles.selector,
          {
            backgroundColor: theme.colors.surfaceLight,
            borderColor: theme.colors.error,
          }
        ]}>
          <ThemedText variant="body" style={{ color: theme.colors.error }}>
            Error al cargar clases
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Selector principal */}
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: theme.colors.surfaceLight,
            borderColor: theme.colors.border,
          }
        ]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        {selectedClass ? (
          <View style={styles.selectedClassContent}>
            <View style={styles.selectedClassInfo}>
              <View 
                style={[
                  styles.colorDot,
                  { backgroundColor: selectedClass.color || theme.colors.primary }
                ]} 
              />
              <View style={{ flex: 1 }}>
                <ThemedText variant="body" style={{ color: theme.colors.text }}>
                  {selectedClass.name}
                </ThemedText>
                {selectedClass.code && (
                  <ThemedText variant="body" style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                    📚 {selectedClass.code}
                  </ThemedText>
                )}
                {selectedClass.description && selectedClass.description.trim() && (
                  <ThemedText 
                    variant="body" 
                    style={{ 
                      color: theme.colors.text, 
                      fontSize: 10, 
                      marginTop: 1,
                      opacity: 0.6
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {selectedClass.description.trim()}
                  </ThemedText>
                )}
              </View>
            </View>
            
            {!required && (
              <TouchableOpacity 
                onPress={handleClearSelection}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <ThemedText variant="body" style={{ color: theme.colors.textMuted }}>
            {placeholder}
          </ThemedText>
        )}
        
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={theme.colors.textMuted} 
        />
      </TouchableOpacity>

      {/* Lista expandida */}
      {isExpanded && (
        <View style={[
          styles.dropdown,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.text,
          }
        ]}>
          {classes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText variant="body" style={{ color: theme.colors.textMuted, textAlign: 'center' }}>
                {loading ? 'Cargando clases...' : 'No hay clases disponibles'}
              </ThemedText>
              {error && (
                <ThemedText variant="body" style={{ color: theme.colors.error, textAlign: 'center', marginTop: 8, fontSize: 12 }}>
                  Error: {error}
                </ThemedText>
              )}
            </View>
          ) : (
            <View style={styles.classList}>
              {classes.map((item) => (
                <View key={item.id || item.name}>
                  {renderClassItem({ item })}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  selectedClassContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedClassInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  classList: {
    maxHeight: 180,
  },
  classItem: {
    borderBottomWidth: 1,
    minHeight: 60,
  },
  classItemContent: {
    padding: 16,
    paddingVertical: 12,
  },
  classInfo: {
    flex: 1,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
