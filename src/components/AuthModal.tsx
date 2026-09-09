import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Cloud,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ExternalLink,
  Settings2,
  Loader2,
} from 'lucide-react';
import {
  isFirebaseConfigured,
  getFirebaseConfig,
  saveFirebaseConfig,
  removeFirebaseConfig,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  formatFirebaseError,
} from '../api/firebase';
import type { FirebaseAppConfig } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isConfigured, setIsConfigured] = useState(() => isFirebaseConfigured());
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showConfigEditor, setShowConfigEditor] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual config paste
  const [rawConfigInput, setRawConfigInput] = useState('');
  const [configError, setConfigError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Заполните email и пароль');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = () => {
    setConfigError(null);
    try {
      let text = rawConfigInput.trim();
      if (!text) {
        setConfigError('Пожалуйста, вставьте конфигурацию Firebase');
        return;
      }

      // Try extract json or object syntax: const firebaseConfig = { ... };
      if (text.includes('{') && text.includes('}')) {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        text = text.substring(start, end + 1);
      }

      // If it's standard JS object with unquoted keys, format to json
      const normalizedJson = text
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
        .replace(/'/g, '"')
        .replace(/,\s*}/g, '}');

      const parsed = JSON.parse(normalizedJson);

      if (!parsed.apiKey || !parsed.projectId) {
        setConfigError('Конфигурация должна содержать хотя бы apiKey и projectId');
        return;
      }

      const config: FirebaseAppConfig = {
        apiKey: String(parsed.apiKey),
        authDomain: String(parsed.authDomain || `${parsed.projectId}.firebaseapp.com`),
        projectId: String(parsed.projectId),
        storageBucket: parsed.storageBucket ? String(parsed.storageBucket) : undefined,
        messagingSenderId: parsed.messagingSenderId ? String(parsed.messagingSenderId) : undefined,
        appId: String(parsed.appId || ''),
      };

      saveFirebaseConfig(config);
      setIsConfigured(true);
      setShowConfigEditor(false);
    } catch (err) {
      setConfigError('Не удалось распознать формат конфига. Убедитесь, что это корректный JSON или объект firebaseConfig.');
    }
  };

  const currentConfig = getFirebaseConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md bg-slate-900/95 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl text-slate-100 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-snug">
                {showConfigEditor
                  ? 'Настройка Firebase'
                  : mode === 'login'
                  ? 'Вход в аккаунт'
                  : 'Регистрация'}
              </h2>
              <p className="text-xs text-slate-400">
                {showConfigEditor
                  ? 'Подключение облачной базы'
                  : 'Синхронизация между компьютером и телефоном'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Main Content */}
        {!isConfigured || showConfigEditor ? (
          /* Firebase Configuration Setup View */
          <div className="mt-5 space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
                <KeyRound className="w-4 h-4" />
                <span>Подключение проекта Firebase</span>
              </div>
              <p>
                Создайте бесплатный проект на{' '}
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-white inline-flex items-center gap-1"
                >
                  console.firebase.google.com <ExternalLink className="w-3 h-3" />
                </a>
                , добавьте Web App и скопируйте объект <code className="text-indigo-200 font-mono">firebaseConfig</code>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Вставьте конфиг Firebase (JSON или JS объект)
              </label>
              <textarea
                value={rawConfigInput}
                onChange={(e) => setRawConfigInput(e.target.value)}
                placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "my-project.firebaseapp.com",\n  projectId: "my-project",\n  appId: "1:123..."\n};`}
                rows={7}
                className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition resize-none"
              />
            </div>

            {configError && (
              <p className="text-xs text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> {configError}
              </p>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={handleSaveConfig}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Сохранить и подключить
              </button>
              {isConfigured && (
                <button
                  onClick={() => setShowConfigEditor(false)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition"
                >
                  Отмена
                </button>
              )}
            </div>

            {currentConfig && (
              <div className="pt-2 text-center">
                <button
                  onClick={removeFirebaseConfig}
                  className="text-xs text-red-400/80 hover:text-red-400 transition underline"
                >
                  Сбросить текущую конфигурацию
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Normal Auth (Google / Email) View */
          <div className="mt-5 space-y-4">
            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 text-sm font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              Войти через Google
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider">
                или через Email
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Электронная почта
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" /> Войти
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Зарегистрироваться
                  </>
                )}
              </button>
            </form>

            {/* Mode Switcher */}
            <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
              {mode === 'login' ? (
                <>
                  <span>Еще нет аккаунта?</span>
                  <button
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-medium transition"
                  >
                    Зарегистрироваться
                  </button>
                </>
              ) : (
                <>
                  <span>Уже зарегистрированы?</span>
                  <button
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-medium transition"
                  >
                    Войти в аккаунт
                  </button>
                </>
              )}
            </div>

            {/* Config link */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate max-w-[200px]">
                Проект: {currentConfig?.projectId || 'активен'}
              </span>
              <button
                onClick={() => setShowConfigEditor(true)}
                className="hover:text-slate-300 transition flex items-center gap-1"
              >
                <Settings2 className="w-3 h-3" /> Настройки БД
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
