import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PrivacyScreen: React.FC = () => {
  const router = useRouter();
  
  // Estados
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showAppInfoModal, setShowAppInfoModal] = useState<boolean>(false);

  // Ocultar el header del navegador
{/*
  useLayoutEffect(() => {
    if (router && typeof router.setOptions === 'function') {
      router.setOptions({
        headerShown: false,
      });
    }
  }, [router]);
  /*/}
  // Componente de Modal Burbuja
  const BubbleModal: React.FC<{
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    iconName: string;
    iconColor: string;
  }> = ({ visible, onClose, title, children, iconName, iconColor }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.bubbleContainer}>
              {/* Flecha apuntando hacia arriba */}
              <View style={styles.bubbleArrow} />
              
              {/* Contenido de la burbuja */}
              <View style={styles.bubbleContent}>
                {/* Header del modal */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalIconContainer}>
                    <Ionicons name={iconName as any} size={24} color={iconColor} />
                  </View>
                  <Text style={styles.modalTitle}>{title}</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                {/* Contenido */}
                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                  {children}
                </ScrollView>
                
                {/* Footer con botón */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.okButton} onPress={onClose}>
                    <Text style={styles.okButtonText}>Entendido</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header simple */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacidad</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        
        {/* Información */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <TouchableOpacity 
            style={styles.infoButton} 
            onPress={() => setShowPrivacyModal(true)}
          >
            <Ionicons name="document-text-outline" size={24} color="#4CAF50" />
            <Text style={styles.infoButtonText}>Política de privacidad</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.infoButton} 
            onPress={() => setShowAppInfoModal(true)}
          >
            <Ionicons name="information-circle-outline" size={24} color="#2196F3" />
            <Text style={styles.infoButtonText}>Acerca de Study Vault</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Mensaje tranquilizador */}
        <View style={styles.messageContainer}>
          <Ionicons name="shield-checkmark" size={32} color="#4CAF50" />
          <Text style={styles.messageTitle}>Tu privacidad es importante</Text>
          <Text style={styles.messageText}>
            Solo usamos la información necesaria para que Study Vault funcione bien. 
            Puedes cambiar estos ajustes cuando quieras.
          </Text>
        </View>

      </ScrollView>

      {/* Modal de Política de Privacidad */}
      <BubbleModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Política de Privacidad"
        iconName="shield-checkmark"
        iconColor="#4CAF50"
      >
        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>🛡️ Cómo cuidamos tus datos</Text>
          <Text style={styles.contentText}>
            Tu información es súper importante para nosotros. Solo recopilamos lo mínimo necesario para que la app funcione de maravilla.
          </Text>
        </View>
        
        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>📱 Qué información usamos</Text>
          <Text style={styles.contentText}>
            • Tu perfil básico (nombre, foto){'\n'}
            • Preferencias de la app{'\n'}
            • Datos de uso para mejorar la experiencia
          </Text>
        </View>
        
        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>🤝 Nuestras promesas</Text>
          <Text style={styles.contentText}>
            • Nunca vendemos tu información{'\n'}
            • Solo compartimos lo esencial con servicios confiables{'\n'}
            • Puedes eliminar tus datos cuando quieras{'\n'}
            • Siempre te avisamos si algo cambia
          </Text>
        </View>
      </BubbleModal>

      {/* Modal de Acerca de la App */}
      <BubbleModal
        visible={showAppInfoModal}
        onClose={() => setShowAppInfoModal(false)}
        title="Acerca de Study Vault"
        iconName="heart"
        iconColor="#E91E63"
      >
        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>✨ ¿Qué hace Study Vault?</Text>
          <Text style={styles.contentText}>
            Study Vault está diseñada para revolucionar tu experiencia de estudio. Te ayudamos a organizar, guardar y acceder a todos tus materiales académicos de forma inteligente y eficiente.
          </Text>
        </View>
        
        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>💡 ¿Por qué la creamos?</Text>
          <Text style={styles.contentText}>
            Queríamos crear la herramienta de estudio definitiva que realmente transformara la forma en que los estudiantes organizan y acceden a su conocimiento. Después de muchas tazas de café y noches programando, Study Vault nació.
          </Text>
        </View>
        
        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>🚀 Dato curioso</Text>
          <Text style={styles.contentText}>
            El nombre "Study Vault" surgió porque queríamos que fuera como una bóveda segura para todo tu conocimiento. ¡Un lugar donde tus estudios estén protegidos y organizados como un tesoro!
          </Text>
        </View>
        
        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>❤️ Gracias por usar Study Vault</Text>
          <Text style={styles.contentText}>
            Cada vez que abres Study Vault, nos haces felices. Tu feedback nos ayuda a mejorar la experiencia de estudio cada día.
          </Text>
        </View>
      </BubbleModal>

    </SafeAreaView>
  );
};

export default PrivacyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
    flex: 1,
  },
  messageContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Estilos del Modal Burbuja
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bubbleContainer: {
    maxWidth: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    alignItems: 'center',
  },
  bubbleArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    marginBottom: -1,
    zIndex: 1,
  },
  bubbleContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    minWidth: screenWidth * 0.8,
    maxWidth: screenWidth * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    maxHeight: screenHeight * 0.5,
    paddingHorizontal: 20,
  },
  modalFooter: {
    padding: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  okButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  okButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contentSection: {
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});