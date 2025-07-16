import { TouchableOpacity, View, Alert } from "react-native";
import { ThemedCard, ThemedText } from "../ui/ThemedComponents";
import { useTheme } from '@/hooks/useTheme';
import { GradeData } from "@/database/services/gradesService";
import { router } from 'expo-router';


interface GradeCardProps {
  grade: GradeData;
}




export default function CategoryCard({grade}: GradeCardProps) {
  const {theme} = useTheme();

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



}
