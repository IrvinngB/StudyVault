// Fallback for using MaterialIcons on Android and web.
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import type { SymbolViewProps, SymbolWeight } from "expo-symbols"
import type { ComponentProps } from "react"
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native"

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>
type IconSymbolName = keyof typeof MAPPING

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Existing mappings
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",

  // Navigation icons
  "book.closed.fill": "menu-book",
  checklist: "checklist",
  "note.text": "note",
  calendar: "calendar-today",
  "person.crop.circle": "account-circle",
  "person.crop.circle.fill": "account-circle",

  // Stats icons
  "clock.fill": "schedule",
  "calendar.badge.checkmark": "event-available",

  // Action icons
  "rectangle.portrait.and.arrow.right": "logout",
  lightbulb: "lightbulb",
  star: "star",

  // Additional common icons
  plus: "add",
  "plus.circle": "add-circle",
  "plus.circle.fill": "add-circle",
  checkmark: "check",
  "checkmark.circle": "check-circle",
  "checkmark.circle.fill": "check-circle",
  xmark: "close",
  "xmark.circle": "cancel",
  "xmark.circle.fill": "cancel",
  gear: "settings",
  gearshape: "settings",
  "gearshape.fill": "settings",
  magnifyingglass: "search",
  bell: "notifications",
  "bell.fill": "notifications",
  envelope: "email",
  "envelope.fill": "email",
  folder: "folder",
  "folder.fill": "folder",
  trash: "delete",
  "trash.fill": "delete",
  pencil: "edit",
  camera: "camera-alt",
  "camera.fill": "camera-alt",
  photo: "photo",
  "photo.fill": "photo",
  heart: "favorite-border",
  "heart.fill": "favorite",
  "arrow.right": "arrow-forward",
  "arrow.left": "arrow-back",
  "arrow.up": "arrow-upward",
  "arrow.down": "arrow-downward",
  "chevron.up": "keyboard-arrow-up",
  "chevron.down": "keyboard-arrow-down",
  "chevron.left": "keyboard-arrow-left",

  // StudyVault specific icons
  book: "book",
  "book.fill": "book",
  graduationcap: "school",
  "graduationcap.fill": "school",
  "doc.text": "description",
  "doc.text.fill": "description",
  "chart.bar": "bar-chart",
  "chart.bar.fill": "bar-chart",
  clock: "access-time",
  timer: "timer",
  bookmark: "bookmark-border",
  "bookmark.fill": "bookmark",
  flag: "flag",
  "flag.fill": "flag",

  // New icons for course detail
  bolt: "flash-on",
  "arrow.clockwise": "refresh",
} as IconMapping

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName
  size?: number
  color: string | OpaqueColorValue
  style?: StyleProp<TextStyle>
  weight?: SymbolWeight
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />
}
