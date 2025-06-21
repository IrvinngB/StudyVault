/**
 * Utilidad para generar UUIDs compatible con React Native
 */

import uuid from 'react-native-uuid';

/**
 * Genera un UUID v4 compatible con React Native
 */
export const generateUUID = (): string => {
  return uuid.v4() as string;
};

/**
 * Genera un UUID simple para casos donde no se requiere cryptographic strength
 */
export const generateSimpleId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Valida si una cadena es un UUID válido
 */
export const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Genera un ID único basado en timestamp para casos simples
 */
export const generateTimestampId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
