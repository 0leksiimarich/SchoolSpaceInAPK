import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [school, setSchool] = useState('');
  const [classNum, setClassNum] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !password2) {
      Alert.alert('Помилка', 'Заповніть усі обов\'язкові поля');
      return;
    }
    if (password !== password2) {
      Alert.alert('Помилка', 'Паролі не збігаються');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Помилка', 'Пароль має бути мінімум 6 символів');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim(), city.trim(), school.trim(), classNum.trim());
    } catch (e: any) {
      Alert.alert('Помилка реєстрації', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Створити акаунт</Text>
        <Text style={styles.subtitle}>Приєднуйся до SchoolSpace</Text>

        <View style={styles.form}>
          <InputField icon="person-outline" placeholder="Ім'я та Прізвище *" value={name} onChangeText={setName} />
          <InputField icon="location-outline" placeholder="Місто" value={city} onChangeText={setCity} />
          <InputField icon="business-outline" placeholder="Школа" value={school} onChangeText={setSchool} />
          <InputField icon="school-outline" placeholder="Клас" value={classNum} onChangeText={setClassNum} keyboardType="default" />
          <InputField icon="mail-outline" placeholder="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <InputField icon="lock-closed-outline" placeholder="Пароль *" value={password} onChangeText={setPassword} secureTextEntry />
          <InputField icon="lock-closed-outline" placeholder="Підтвердіть пароль *" value={password2} onChangeText={setPassword2} secureTextEntry />

          <Pressable
            style={({ pressed }) => [styles.regBtn, pressed && styles.btnPressed, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.regBtnText}>Зареєструватися</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize }: {
  icon: any;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  return (
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={20} color={Colors.textSecondary} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
    </View>
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
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  form: {
    gap: 14,
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
  regBtn: {
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
  regBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
