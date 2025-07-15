import { ThemedText, ThemedView } from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const daysSpanish = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

type Event = {
  id: string;
  type: 'tarea' | 'parcial' | 'clase';
  title: string;
  description?: string;
  date: string; // formato 'YYYY-MM-DD'
};

const sampleEvents: Event[] = [
  { id: '1', type: 'tarea', title: 'Leer capítulo 4', description: 'Matemáticas - Álgebra', date: '2025-07-15' },
  { id: '2', type: 'parcial', title: 'Parcial de Física', description: 'Temas: Cinemática y Dinámica', date: '2025-07-15' },
  { id: '3', type: 'clase', title: 'Clase de Historia', description: 'Tema: Revolución Francesa', date: '2025-07-16' },
];

// Formatear fecha a 'YYYY-MM-DD'
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Formatear fecha larga con día y mes en español
const formatDateLong = (date: Date) => {
  const dayName = daysSpanish[date.getDay()];
  const dayNumber = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${dayNumber} de ${monthName} de ${year}`;
};

// Obtener días del mes
const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export default function CalendarScreen() {
  const { theme } = useTheme();

  const today = new Date();

  // Estado mes y año seleccionados
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // Día seleccionado (Date)
  const [selectedDay, setSelectedDay] = useState(today);

  // Obtener días del mes
  const daysInMonth = getDaysInMonth(year, month);

  // Filtrar eventos para el día seleccionado
  const eventsForSelectedDay = sampleEvents.filter(
    (event) => event.date === formatDate(selectedDay)
  );

  // Ref para FlatList de días
  const flatListRef = useRef<FlatList<Date>>(null);

  // Scroll al día seleccionado cada vez que cambian mes, año o día seleccionado
  useEffect(() => {
    if (!flatListRef.current) return;
    const index = daysInMonth.findIndex(d => formatDate(d) === formatDate(selectedDay));
    if (index >= 0) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  }, [month, year, selectedDay]);

  // Cambiar mes (prev / next)
  const changeMonth = (increment: number) => {
    let newMonth = month + increment;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
    // Al cambiar mes, seleccionamos primer día del nuevo mes
    setSelectedDay(new Date(newYear, newMonth, 1));
  };

  // Render día en scroll horizontal
  const renderDay = ({ item }: { item: Date }) => {
    const isSelected = formatDate(item) === formatDate(selectedDay);
    return (
      <TouchableOpacity
        onPress={() => setSelectedDay(item)}
        style={[
          styles.dayContainer,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceLight,
          },
        ]}
      >
        <ThemedText
          variant="h3"
          style={{ color: isSelected ? theme.colors.surface : theme.colors.text }}
        >
          {item.getDate()}
        </ThemedText>
        <ThemedText
          variant="body"
          style={{ color: isSelected ? theme.colors.surface : theme.colors.textMuted, fontSize: 12, marginTop: 2 }}
        >
          {daysSpanish[item.getDay()].substring(0, 3)}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  // Render evento
  const renderEventItem = ({ item }: { item: Event }) => {
    let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'document-text-outline';
    let iconColor = theme.colors.primary;

    switch (item.type) {
      case 'tarea':
        iconName = 'checkmark-circle-outline';
        iconColor = theme.colors.accent;
        break;
      case 'parcial':
        iconName = 'clipboard-outline';
        iconColor = theme.colors.error;
        break;
      case 'clase':
        iconName = 'school-outline';
        iconColor = theme.colors.primary;
        break;
    }

    return (
      <View style={[styles.eventItem, { borderColor: theme.colors.primary }]}>
        <Ionicons name={iconName} size={24} color={iconColor} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <ThemedText variant="h3" style={{ color: theme.colors.text }}>
            {item.title}
          </ThemedText>
          {item.description ? (
            <ThemedText variant="body" style={{ color: theme.colors.secondary }}>
              {item.description}
            </ThemedText>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <ThemedView variant="background" style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header mes con botones */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
            <Ionicons name="chevron-back-outline" size={28} color={theme.colors.primary} />
          </TouchableOpacity>

          <ThemedText variant="h1" style={{ color: theme.colors.primary }}>
            {months[month]} {year}
          </ThemedText>

          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowButton}>
            <Ionicons name="chevron-forward-outline" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Scroll horizontal días */}
        <FlatList
          ref={flatListRef}
          horizontal
          data={daysInMonth}
          keyExtractor={(item) => item.toISOString()}
          renderItem={renderDay}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8, marginBottom: 24 }}
          getItemLayout={(_, index) => ({
            length: 52,
            offset: 52 * index,
            index,
          })}
          initialScrollIndex={selectedDay.getDate() - 1}
        />

        {/* Eventos */}
        <ThemedText variant="h2" style={{ marginBottom: 12 }}>
          Eventos del día {formatDateLong(selectedDay)}
        </ThemedText>

        {eventsForSelectedDay.length === 0 ? (
          <ThemedText variant="body" style={{ color: theme.colors.secondary }}>
            No tienes eventos para este día.
          </ThemedText>
        ) : (
          <FlatList
            data={eventsForSelectedDay}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // deshabilitar scroll interno para evitar conflictos con ScrollView padre
            contentContainerStyle={{ paddingBottom: 48 }}
          />
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  arrowButton: {
    padding: 4,
  },
  dayContainer: {
    width: 52,
    height: 64,
    marginHorizontal: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventItem: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
});
