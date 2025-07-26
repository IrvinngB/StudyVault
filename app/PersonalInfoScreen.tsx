import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface PersonalInfo {
  fullName: string;
  email: string;
  timeZone: string;
}

const PersonalInformationScreen: React.FC = () => {
  const router = useRouter();
  
  // Estados para los campos del formulario
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: 'Nombre Apellido',
    email: 'correo.estudiante@email.com',
    timeZone: 'America/Panama (UTC-5)',
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);

 {/* // Ocultar el header del navegador
  useLayoutEffect(() => {
    if (router && typeof router.setOptions === 'function') {
      router.setOptions({
        headerShown: false,
      });
    }
  }, [router]);
  */}

  // Función para actualizar los campos
  const updateField = (field: keyof PersonalInfo, value: string): void => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para guardar cambios
  const handleSave = (): void => {
    Alert.alert(
      "Información actualizada",
      "Tus datos personales han sido guardados correctamente.",
      [{ text: "OK", onPress: () => setIsEditing(false) }]
    );
  };

  // Función para cancelar edición
  const handleCancel = (): void => {
    setIsEditing(false);
    // Aquí podrías restaurar los valores originales si quisieras
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con título y botón de editar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Información Personal</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons 
            name={isEditing ? "close" : "create-outline"} 
            size={24} 
            color="#1976D2" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {personalInfo.fullName.charAt(0)}
            </Text>
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Cambiar foto</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Information Fields */}
        <View style={styles.infoContainer}>
          
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="person-outline" size={20} color="#1976D2" />
              </View>
              <Text style={styles.fieldLabel}>Nombre completo</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={personalInfo.fullName}
                onChangeText={(value) => updateField('fullName', value)}
                placeholder="Ingresa tu nombre completo"
              />
            ) : (
              <Text style={styles.fieldValue}>{personalInfo.fullName}</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="mail-outline" size={20} color="#F57C00" />
              </View>
              <Text style={styles.fieldLabel}>Correo electrónico</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={personalInfo.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder="correo@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.fieldValue}>{personalInfo.email}</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E8' }]}>
                <Ionicons name="time-outline" size={20} color="#388E3C" />
              </View>
              <Text style={styles.fieldLabel}>Zona horaria</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={personalInfo.timeZone}
                onChangeText={(value) => updateField('timeZone', value)}
                placeholder="America/Panama (UTC-5)"
              />
            ) : (
              <Text style={styles.fieldValue}>{personalInfo.timeZone}</Text>
            )}
          </View>

        </View>

        {/* Botones de acción cuando está editando */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalInformationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  editButton: {
    padding: 8,
  },
  placeholder: {
    width: 40, 
  },
  scrollView: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#7C4DFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
  },
  changePhotoText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  fieldContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  fieldValue: {
    fontSize: 16,
    color: '#212121',
    marginLeft: 44,
  },
  textInput: {
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 44,
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});