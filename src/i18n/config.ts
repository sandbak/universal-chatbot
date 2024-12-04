import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      auth: {
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        logout: 'Logout',
        no_account: "Don't have an account? Sign Up",
        have_account: 'Already have an account? Sign In',
        login_success: 'Successfully logged in!',
        login_error: 'Failed to log in',
        register_success: 'Successfully registered!',
        register_error: 'Failed to register',
        logout_success: 'Successfully logged out!',
        logout_error: 'Failed to log out'
      },
      chat: {
        placeholder: 'Type your message...',
        send: 'Send',
        clear: 'Clear',
        history: 'History',
        save: 'Save',
        save_success: 'Chat saved successfully!',
        save_error: 'Failed to save chat',
        load_success: 'Chat loaded successfully!',
        load_error: 'Failed to load chat',
        delete_success: 'Chat deleted successfully!',
        delete_error: 'Failed to delete chat',
        no_history: 'No saved chats found',
        loading: 'Loading...'
      }
    }
  },
  es: {
    translation: {
      auth: {
        login: 'Iniciar Sesión',
        register: 'Registrarse',
        email: 'Correo Electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña',
        loginButton: 'Entrar',
        registerButton: 'Registrarse',
        loginError: 'Error al iniciar sesión',
        registrationError: 'Error al registrarse',
        passwordMismatch: 'Las contraseñas no coinciden'
      },
      chat: {
        newChat: 'Nuevo Chat',
        send: 'Enviar',
        typing: 'El chatbot está escribiendo...',
        placeholder: 'Escribe tu mensaje aquí...',
        saveChat: 'Guardar Chat',
        deleteChat: 'Eliminar Chat',
        savedChats: 'Chats Guardados'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
