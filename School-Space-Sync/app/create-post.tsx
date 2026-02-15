import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';

export default function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
      base64: true,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        setImageUri(`data:image/jpeg;base64,${asset.base64}`);
      } else {
        setImageUri(asset.uri);
      }
    }
  };

  const handlePublish = async () => {
    if (!text.trim() && !imageUri) {
      Alert.alert('Помилка', 'Напишіть щось або додайте фото');
      return;
    }

    if (!user || !profile) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        uid: profile.uid,
        name: profile.displayName,
        authorAv: profile.photoURL,
        text: text.trim(),
        image: imageUri || null,
        createdAt: serverTimestamp(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: any) {
      Alert.alert('Помилка', 'Не вдалося опублікувати пост');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Новий пост</Text>
        <Pressable
          onPress={handlePublish}
          disabled={loading || (!text.trim() && !imageUri)}
          style={({ pressed }) => [
            styles.publishBtn,
            pressed && { opacity: 0.7 },
            (loading || (!text.trim() && !imageUri)) && { opacity: 0.4 },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.publishBtnText}>Опублікувати</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.authorRow}>
          <Image
            source={{ uri: profile?.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
            style={styles.avatar}
          />
          <Text style={styles.authorName}>{profile?.displayName}</Text>
        </View>

        <TextInput
          style={styles.textInput}
          placeholder="Що нового?"
          placeholderTextColor={Colors.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
          autoFocus
          textAlignVertical="top"
        />

        {imageUri && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            <Pressable
              style={styles.removeImageBtn}
              onPress={() => setImageUri(null)}
            >
              <Ionicons name="close-circle" size={28} color={Colors.danger} />
            </Pressable>
          </View>
        )}
      </View>

      <View style={[styles.toolbar, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          onPress={pickImage}
          style={({ pressed }) => [styles.toolbarBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="camera-outline" size={24} color={Colors.accent} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.panel,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  publishBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  publishBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.panelLight,
  },
  authorName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginLeft: 12,
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.text,
    flex: 1,
    minHeight: 100,
  },
  imagePreview: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.panelLight,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  toolbarBtn: {
    padding: 8,
  },
});
