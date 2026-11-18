/** CONTROLADOR · Formulario de inicio de sesión y recuperación de contraseña. */
import { useState } from 'react';
import { authErrorMessage, login, resetPassword } from '../models';

export function useLoginController() {
  const [mode, setMode] = useState('login'); // 'login' | 'reset'
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError('');
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setNotice('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return setError('Escribe tu correo.');
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        // El AuthController detecta la sesión y cambia de pantalla.
      } else {
        await resetPassword(form.email);
        setNotice('Si el correo está registrado, te llegará un enlace para crear una nueva contraseña.');
      }
    } catch (err) {
      setError(mode === 'login' ? authErrorMessage(err) : 'No pudimos enviar el correo. Revisa la dirección.');
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    form,
    setField,
    showPassword,
    togglePassword: () => setShowPassword((s) => !s),
    loading,
    error,
    notice,
    submit,
    switchMode,
  };
}
