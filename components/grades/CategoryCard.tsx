import { TouchableOpacity, View } from "react-native";
import { ThemedCard, ThemedText } from "../ui/ThemedComponents";
import { useTheme } from '@/hooks/useTheme';

interface GradeItem {
  name: string;
  date: string;
  description: string;
  score: number;
  total: number;
}

interface GradeSectionProps {
  sectionTitle: string;
  weight: number; // porcentaje del total del curso
  evaluations: GradeItem[];
}

function GradeSectionCard({ sectionTitle, weight, evaluations }: GradeSectionProps) {
  const { theme } = useTheme();

  const earnedScore = evaluations.length
    ? evaluations.reduce((sum, evalItem) => sum + (evalItem.score / evalItem.total) * 100, 0) / evaluations.length
    : 0;

  return (
    <ThemedCard variant="outlined" padding="medium" style={{ marginBottom: theme.spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedText variant="h2">{sectionTitle}</ThemedText>
        <ThemedText variant="caption">{weight}% del total</ThemedText>
      </View>

      <ThemedText variant="caption" style={{ marginTop: 4, color: theme.colors.secondary }}>
        Ganado: {earnedScore.toFixed(1)}% / {weight}%
      </ThemedText>

      {/* Lista de evaluaciones */}
      {evaluations.map((item, idx) => (
        <View key={idx} style={{
          borderTopWidth: idx === 0 ? 0 : 1,
          borderColor: theme.colors.border,
          paddingVertical: theme.spacing.sm
        }}>
          <ThemedText variant="h3">{item.name} ({item.date})</ThemedText>
          <ThemedText variant="caption">{item.description}</ThemedText>
          <ThemedText variant="caption" style={{ marginTop: 4, fontWeight: 'bold' }}>
            {item.score}/{item.total} ({((item.score / item.total) * 100).toFixed(1)}%)
          </ThemedText>
        </View>
      ))}

      {/* Botón Agregar Evaluación */}
      <TouchableOpacity onPress={() => console.log('Agregar evaluación')} style={{
        marginTop: theme.spacing.md,
        padding: 8,
        borderWidth: 1,
        borderRadius: theme.borderRadius.sm,
        alignItems: 'center'
      }}>
        <ThemedText style={{ color: theme.colors.primary }}>+ Agregar evaluación</ThemedText>
      </TouchableOpacity>
    </ThemedCard>
  );
}
