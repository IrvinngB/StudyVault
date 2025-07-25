import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Linking,
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

const HelpSupportScreen: React.FC = () => {
  const router = useRouter();
  
  // Estados para los modales
  const [showFAQModal, setShowFAQModal] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [showTutorialModal, setShowTutorialModal] = useState<boolean>(false);

  {/* Ocultar el header del navegador
  useLayoutEffect(() => {
    if (router && typeof router.setOptions === 'function') {
      router.setOptions({
        headerShown: false,
      });
    }
  }, [router]);
*/}
  
  const openEmail = () => {
    Linking.openURL('mailto:soporte@studyvault.com?subject=Ayuda con Study Vault');
  };
{/* Función para abrir ChatGPT */}
  const openChatGPT = () => {
    Linking.openURL('https://chatgpt.com');
  };
{/* Función para abrir WhatsApp */}
  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/50766658059?text=Hola, necesito ayuda con Study Vault');
  };

  // Componente de Modal Burbuja (reutilizado)
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
              <View style={styles.bubbleArrow} />
              <View style={styles.bubbleContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIconContainer}>
                    <Ionicons name={iconName as any} size={24} color={iconColor} />
                  </View>
                  <Text style={styles.modalTitle}>{title}</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                  {children}
                </ScrollView>
                
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ayuda y Soporte</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        
        {/* Sección de Ayuda Rápida */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ayuda Rápida</Text>
          
          <TouchableOpacity 
            style={styles.helpButton} 
            onPress={() => setShowFAQModal(true)}
          >
            <Ionicons name="help-circle-outline" size={24} color="#4CAF50" />
            <Text style={styles.helpButtonText}>Preguntas Frecuentes</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.helpButton} 
            onPress={() => setShowTutorialModal(true)}
          >
            <Ionicons name="play-circle-outline" size={24} color="#2196F3" />
            <Text style={styles.helpButtonText}>Tutorial de uso</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Sección de Contacto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contáctanos</Text>
          
          <TouchableOpacity 
            style={styles.helpButton} 
            onPress={() => setShowContactModal(true)}
            >
            <Ionicons name="chatbubble-outline" size={24} color="#FF9800" />
            <Text style={styles.helpButtonText}>Opciones de contacto</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

        {/* Botones de enlace directo a ChatGPT*/}
          <TouchableOpacity 
            style={styles.helpButton} 
            onPress={openChatGPT}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#E91E63" />
            <Text style={styles.helpButtonText}>Consultar con IA</Text>
            <Ionicons name="open-outline" size={16} color="#999" />
          </TouchableOpacity>
         
         {/* Botones de enlace directo a WhatsApp*/}
          <TouchableOpacity 
            style={styles.helpButton} 
            onPress={openWhatsApp}
          >
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <Text style={styles.helpButtonText}>Chat por WhatsApp</Text>
            <Ionicons name="open-outline" size={16} color="#999" />
          </TouchableOpacity>
        </View>

 
        {/*Mensaje de apoyo abajo de la pantalla*/}
        <View style={styles.messageContainer}>
          <Ionicons name="heart" size={32} color="#E91E63" />
          <Text style={styles.messageTitle}>Estamos aquí para ayudarte</Text>
          <Text style={styles.messageText}>
            ¿Tienes alguna duda o problema? No te preocupes, nuestro equipo está listo para ayudarte a sacar el máximo provecho de Study Vault.
          </Text>
        </View>

      </ScrollView>

      {/* Modal de FAQ */}
      <BubbleModal
        visible={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        title="Preguntas Frecuentes"
        iconName="help-circle"
        iconColor="#4CAF50"
      >
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>❓ ¿Cómo organizo mis materiales de estudio?</Text>
          <Text style={styles.faqAnswer}>
            Puedes crear carpetas por materia y subcarpetas por temas. También usa etiquetas para encontrar contenido rápidamente.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>🔒 ¿Mis documentos están seguros?</Text>
          <Text style={styles.faqAnswer}>
            ¡Absolutamente! Todos tus archivos se guardan de forma segura y encriptada. Solo tú tienes acceso a tu contenido.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>📱 ¿Puedo acceder desde cualquier dispositivo?</Text>
          <Text style={styles.faqAnswer}>
            Sí, tus materiales se sincronizan automáticamente entre todos tus dispositivos. Estudia donde quieras, cuando quieras.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>💾 ¿Qué tipos de archivos puedo subir?</Text>
          <Text style={styles.faqAnswer}>
            Study Vault acepta PDFs, imágenes, documentos de Word, presentaciones, audios y más. ¡Prácticamente cualquier material de estudio!
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>🔍 ¿Cómo busco contenido específico?</Text>
          <Text style={styles.faqAnswer}>
            Usa la barra de búsqueda en la parte superior. Puedes buscar por nombre de archivo, etiquetas o incluso texto dentro de los documentos.
          </Text>
        </View>
      </BubbleModal>

      {/* Modal de Tutorial */}
      <BubbleModal
        visible={showTutorialModal}
        onClose={() => setShowTutorialModal(false)}
        title="Tutorial de Uso"
        iconName="school"
        iconColor="#2196F3"
      >
        <View style={styles.tutorialStep}>
          <Text style={styles.stepNumber}>1️⃣</Text>
          <Text style={styles.stepTitle}>Crea tu primera carpeta</Text>
          <Text style={styles.stepDescription}>
            Toca el botón "+" y selecciona "Nueva carpeta". Dale un nombre relacionado con tu materia favorita.
          </Text>
        </View>
        
        <View style={styles.tutorialStep}>
          <Text style={styles.stepNumber}>2️⃣</Text>
          <Text style={styles.stepTitle}>Sube tus materiales</Text>
          <Text style={styles.stepDescription}>
            Dentro de la carpeta, toca "+" nuevamente y selecciona "Subir archivo". Puedes elegir desde tu galería o cámara.
          </Text>
        </View>
        
        <View style={styles.tutorialStep}>
          <Text style={styles.stepNumber}>3️⃣</Text>
          <Text style={styles.stepTitle}>Organiza con etiquetas</Text>
          <Text style={styles.stepDescription}>
            Añade etiquetas como "examen", "tarea" o "importante" para encontrar todo más fácilmente después.
          </Text>
        </View>
        
        <View style={styles.tutorialStep}>
          <Text style={styles.stepNumber}>4️⃣</Text>
          <Text style={styles.stepTitle}>Busca y estudia</Text>
          <Text style={styles.stepDescription}>
            Usa la búsqueda para encontrar cualquier material al instante. ¡Tu biblioteca de conocimiento está lista!
          </Text>
        </View>
      </BubbleModal>

      {/* Modal de Contacto */}
      <BubbleModal
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Opciones de Contacto"
        iconName="chatbubbles"
        iconColor="#FF9800"
      >
        <View style={styles.contactOption}>
          <View style={styles.contactHeader}>
            <Ionicons name="mail" size={24} color="#4CAF50" />
            <Text style={styles.contactTitle}>Email de Soporte</Text>
          </View>
          <Text style={styles.contactDescription}>
            Para consultas detalladas o reportes de bugs. Te respondemos en menos de 24 horas.
          </Text>
          <Text style={styles.contactInfo}>soporte@studyvault.com</Text>
        </View>
        
        <View style={styles.contactOption}>
          <View style={styles.contactHeader}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#E91E63" />
            <Text style={styles.contactTitle}>Consulta con IA</Text>
          </View>
          <Text style={styles.contactDescription}>
            ¿Necesitas ayuda inmediata? Consulta con ChatGPT para resolver dudas rápidamente las 24 horas.
          </Text>
          <Text style={styles.contactInfo}>chatgpt.com</Text>
        </View>
        
        <View style={styles.contactOption}>
          <View style={styles.contactHeader}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <Text style={styles.contactTitle}>WhatsApp</Text>
          </View>
          <Text style={styles.contactDescription}>
            Para ayuda inmediata y respuestas rápidas. Disponible de lunes a viernes de 9am a 6pm.
          </Text>
          <Text style={styles.contactInfo}>+507 6665-8059</Text>
        </View>
        
        <View style={styles.contactOption}>
          <View style={styles.contactHeader}>
            <Ionicons name="time" size={24} color="#FF9800" />
            <Text style={styles.contactTitle}>Horarios de Atención</Text>
          </View>
          <Text style={styles.contactDescription}>
            Lunes a Viernes: 9:00 AM - 6:00 PM{'\n'}
            Sábados: 10:00 AM - 2:00 PM{'\n'}
            Domingos: Solo emergencias
          </Text>
        </View>
      </BubbleModal>

    </SafeAreaView>
  );
};

export default HelpSupportScreen;

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
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  helpButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
    flex: 1,
  },
  messageContainer: {
    backgroundColor: '#fff5f5',
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
  
  // Estilos del Modal Burbuja (reutilizados)
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
  
  // Estilos específicos para FAQ
  faqItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Estilos para Tutorial
  tutorialStep: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepNumber: {
    fontSize: 20,
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Estilos para Contacto
  contactOption: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
});