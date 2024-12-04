import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      auth: {
        login: 'Login',
        register: 'Register',
        email: 'Email Address',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        loginButton: 'Sign In',
        registerButton: 'Sign Up',
        loginError: 'Failed to log in',
        registrationError: 'Failed to register',
        passwordMismatch: 'Passwords do not match'
      },
      chat: {
        newChat: 'New Chat',
        send: 'Send',
        typing: 'Chatbot is typing...',
        placeholder: 'Type your message here...',
        saveChat: 'Save Chat',
        deleteChat: 'Delete Chat',
        savedChats: 'Saved Chats'
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
