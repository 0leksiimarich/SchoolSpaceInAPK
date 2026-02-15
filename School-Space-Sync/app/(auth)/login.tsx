import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/invalid-email': return 'Невірний формат email';
      case 'auth/user-not-found': return 'Користувача з таким email не знайдено';
      case 'auth/wrong-password': return 'Невірний пароль';
      case 'auth/invalid-credential': return 'Невірний email або пароль';
      case 'auth/too-many-requests': return 'Забагато спроб. Спробуйте пізніше';
      case 'auth/user-disabled': return 'Акаунт заблоковано';
      case 'auth/network-request-failed': return 'Помилка мережі. Перевірте інтернет-з\'єднання';
      default: return 'Помилка входу. Спробуйте ще раз';
    }
  };

  const handleLogin = async () => {
    setError('');
    setSuccess('');
    if (!email.trim() || !password.trim()) {
      setError('Заповніть усі поля');
      return;
    }
    setLoading(true);
    try {
      console.log('Attempting login with:', email.trim());
      await signIn(email.trim(), password);
      console.log('Login successful');
    } catch (e: any) {
      console.log('Login error:', e.code, e.message);
      setError(getErrorMessage(e.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');
    if (!email.trim()) {
      setError('Введіть email для відновлення пароля');
      return;
    }
    try {
      await resetPassword(email.trim());
      setSuccess('Лист для зміни пароля надіслано!');
    } catch (e: any) {
      setError(getErrorMessage(e.code || ''));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="school" size={40} color={Colors.accent} />
          </View>
          <Text style={styles.logoText}>SchoolSpace</Text>
          <Text style={styles.subtitle}>Соціальна мережа для школярів</Text>
        </View>

        <View style={styles.form}>
          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {!!success && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text style={styles.successText}>{success}</Text>
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Пароль"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.loginBtn, pressed && styles.btnPressed, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Увійти</Text>
            )}
          </Pressable>

          <Pressable onPress={handleResetPassword}>
            <Text style={styles.forgotText}>Забули пароль?</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Немає акаунта?</Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkText}>Зареєструватися</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: Colors.accent,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  form: {
    gap: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 89, 89, 0.15)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 89, 89, 0.3)',
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  successText: {
    color: Colors.success,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 14,
  },
  eyeBtn: {
    padding: 4,
  },
  loginBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  forgotText: {
    color: Colors.accent,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 'auto',
    paddingTop: 32,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  linkText: {
    color: Colors.accent,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
