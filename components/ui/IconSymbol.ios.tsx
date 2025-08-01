import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

// Mapeo de nombres de iconos para iOS SF Symbols
const IOS_ICON_MAPPING: Record<string, string> = {
  // Navigation icons
  "house.fill": "house.fill",
  "book.closed.fill": "book.closed.fill",
  checklist: "checklist",
  "note.text": "note.text",
  calendar: "calendar",
  "person.crop.circle": "person.crop.circle",
  "person.crop.circle.fill": "person.crop.circle.fill",
  "gearshape.fill": "gearshape.fill",
  
  // Stats icons
  "clock.fill": "clock.fill",
  "calendar.badge.checkmark": "calendar.badge.checkmark",

  // Action icons
  "rectangle.portrait.and.arrow.right": "rectangle.portrait.and.arrow.right",
  lightbulb: "lightbulb",
  star: "star",
  "star.fill": "star.fill",

  // Additional common icons
  plus: "plus",
  "plus.circle": "plus.circle",
  "plus.circle.fill": "plus.circle.fill",
  checkmark: "checkmark",
  "checkmark.circle": "checkmark.circle",
  "checkmark.circle.fill": "checkmark.circle.fill",
  xmark: "xmark",
  "xmark.circle": "xmark.circle",
  "xmark.circle.fill": "xmark.circle.fill",
  
  // Task status icons
  clock: "clock",
  "exclamationmark.triangle": "exclamationmark.triangle",
  gear: "gear",
  magnifyingglass: "magnifyingglass",
  bell: "bell",
  "bell.fill": "bell.fill",
  envelope: "envelope",
  "envelope.fill": "envelope.fill",
  folder: "folder",
  "folder.fill": "folder.fill",
  trash: "trash",
  "trash.fill": "trash.fill",
  pencil: "pencil",
  camera: "camera",
  "camera.fill": "camera.fill",
  photo: "photo",
  "photo.fill": "photo.fill",
  heart: "heart",
  "heart.fill": "heart.fill",
  "arrow.right": "arrow.right",
  "arrow.left": "arrow.left",
  "arrow.up": "arrow.up",
  "arrow.down": "arrow.down",
  "chevron.up": "chevron.up",
  "chevron.down": "chevron.down",
  "chevron.left": "chevron.left",
  "chevron.right": "chevron.right",

  // StudyVault specific icons
  book: "book",
  "book.fill": "book.fill",
  graduationcap: "graduationcap",
  "graduationcap.fill": "graduationcap.fill",
  "doc.text": "doc.text",
  "doc.text.fill": "doc.text.fill",
  "chart.bar": "chart.bar",
  "chart.bar.fill": "chart.bar.fill",
  timer: "timer",
  bookmark: "bookmark",
  "bookmark.fill": "bookmark.fill",
  flag: "flag",
  "flag.fill": "flag.fill",

  // Icono de racha
  flame: "flame",

  // New icons for course detail
  bolt: "bolt",
  "arrow.clockwise": "arrow.clockwise",
  
  // Restoration and refresh icons
  "arrow.clockwise.circle": "arrow.clockwise.circle",
  "arrow.clockwise.circle.fill": "arrow.clockwise.circle.fill",
  "arrow.triangle.2.circlepath": "arrow.triangle.2.circlepath",
  "arrow.triangle.2.circlepath.circle": "arrow.triangle.2.circlepath.circle",
  "arrow.triangle.2.circlepath.circle.fill": "arrow.triangle.2.circlepath.circle.fill",
  "repeat": "repeat",
  "repeat.circle": "repeat.circle",
  "repeat.circle.fill": "repeat.circle.fill",
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: string;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  // Obtener el nombre del icono mapeado o usar el original si no existe
  const iconName = IOS_ICON_MAPPING[name] || name;
  
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={iconName as SymbolViewProps['name']}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
