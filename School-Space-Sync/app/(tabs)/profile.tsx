import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

interface Post {
  id: string;
  uid: string;
  name: string;
  authorAv: string;
  text: string;
  image?: string;
  createdAt: any;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile, signOut } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const items: Post[] = [];
      snap.forEach((s) => {
        const data = s.data();
        if (data.uid === user.uid) {
          items.push({ id: s.id, ...data } as Post);
        }
      });
      setPosts(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleLogout = () => {
    Alert.alert('Вихід', 'Ви впевнені, що хочете вийти?', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Вийти',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleDelete = useCallback(async (postId: string) => {
    Alert.alert('Видалити пост?', 'Цю дію не можна скасувати', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Видалити',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'posts', postId));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (e) {
            Alert.alert('Помилка', 'Не вдалося видалити пост');
          }
        },
      },
    ]);
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'щойно';
    if (minutes < 60) return `${minutes} хв`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} год`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} дн`;
    return date.toLocaleDateString('uk-UA');
  };

  if (!user) return null;

  const renderHeader = () => (
    <View style={styles.profileSection}>
      <View style={styles.profileTop}>
        <Image
          source={{ uri: profile?.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
          style={styles.profileAvatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.displayName || 'Завантаження...'}</Text>
          <Text style={styles.profileDetail}>
            {[profile?.school, profile?.class ? `${profile.class} клас` : null].filter(Boolean).join(', ')}
          </Text>
          {!!profile?.city && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.profileCity}>{profile.city}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{posts.length}</Text>
          <Text style={styles.statLabel}>Постів</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.7 }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
        <Text style={styles.logoutText}>Вийти</Text>
      </Pressable>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Мої пости</Text>
    </View>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postTime}>{formatDate(item.createdAt)}</Text>
        <Pressable onPress={() => handleDelete(item.id)} hitSlop={10}>
          <Ionicons name="trash-outline" size={16} color={Colors.danger} />
        </Pressable>
      </View>
      {!!item.text && <Text style={styles.postText}>{item.text}</Text>}
      {!!item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Профіль</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="edit-3" size={36} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>У вас ще немає постів</Text>
            </View>
          }
          contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    paddingBottom: 8,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.panelLight,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  profileDetail: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  profileCity: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statItem: {
    backgroundColor: Colors.panel,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.accent,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  postCard: {
    backgroundColor: Colors.panel,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postTime: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  postText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.text,
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: Colors.panelLight,
  },
});
