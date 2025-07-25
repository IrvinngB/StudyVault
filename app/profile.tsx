import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  
  // Estados para los switches
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState<boolean>(false);

  // Función para navegar a información personal
  const navigateToPersonalInfo = (): void => {
    router.push('./PersonalInfoScreen'); // Ajusta según tu estructura
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>N</Text>
          </View>
          <Text style={styles.name}>Nombre</Text>
          <Text style={styles.email}>correo.estudiante@email.com</Text>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          {/* AQUÍ ESTÁ EL CAMBIO - Agregué onPress */}
          <TouchableOpacity style={styles.menuItem} onPress={navigateToPersonalInfo}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="person-outline" size={20} color="#1976D2" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Información de la cuenta</Text>
                <Text style={styles.menuSubtitle}>Datos personales y seguridad</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('./PrivacyScreen')}>
  <View style={styles.menuItemLeft}>
    <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
      <Ionicons name="lock-closed-outline" size={20} color="#7B1FA2" />
    </View>
    <View>
      <Text style={styles.menuTitle}>Privacidad</Text>
      <Text style={styles.menuSubtitle}>Control de datos y permisos</Text>
    </View>
  </View>
  <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
</TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E8' }]}>
                <Ionicons name="notifications-outline" size={20} color="#388E3C" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Notificaciones</Text>
                <Text style={styles.menuSubtitle}>Alertas y recordatorios</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#E0E0E0', true: '#81C784' }}
              thumbColor={notificationsEnabled ? '#4CAF50' : '#BDBDBD'}
              onValueChange={setNotificationsEnabled}
              value={notificationsEnabled}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="moon-outline" size={20} color="#F57C00" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Modo oscuro</Text>
                <Text style={styles.menuSubtitle}>Tema de la aplicación</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#E0E0E0', true: '#FFB74D' }}
              thumbColor={darkModeEnabled ? '#FF9800' : '#BDBDBD'}
              onValueChange={setDarkModeEnabled}
              value={darkModeEnabled}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('./ayuda_support')}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E1F5FE' }]}>
                <Ionicons name="help-circle-outline" size={20} color="#0288D1" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Ayuda y soporte</Text>
                <Text style={styles.menuSubtitle}>FAQ y contacto</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    padding: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7C4DFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#757575',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
});