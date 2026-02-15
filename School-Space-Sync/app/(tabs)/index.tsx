import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, RefreshControl, Image, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

const ADMIN_UID = "v5DxqguPUjTi1vtgtzgjZyyrlUf2";

interface Post {
  id: string;
  uid: string;
  name: string;
  authorAv: string;
  text: string;
  image?: string;
  createdAt: any;
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const items: Post[] = [];
      snap.forEach((s) => {
        items.push({ id: s.id, ...s.data() } as Post);
      });
      setPosts(items);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.warn('Posts load error:', error.code);
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  }, [user]);

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

  const onRefresh = () => {
    setRefreshing(true);
  };

  const canDelete = (postUid: string) => {
    return user?.uid === postUid || user?.uid === ADMIN_UID;
  };

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

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.authorAv || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={styles.avatar} />
        <View style={styles.postHeaderText}>
          <Text style={styles.postAuthor}>{item.name}</Text>
          <Text style={styles.postTime}>{formatDate(item.createdAt)}</Text>
        </View>
        {canDelete(item.uid) && (
          <Pressable onPress={() => handleDelete(item.id)} hitSlop={10}>
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
          </Pressable>
        )}
      </View>
      {!!item.text && <Text style={styles.postText}>{item.text}</Text>}
      {!!item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />
      )}
    </View>
  );

  if (!user) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SchoolSpace</Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/create-post');
          }}
          hitSlop={10}
        >
          <Ionicons name="add-circle" size={28} color={Colors.accent} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>Поки що немає постів</Text>
          <Text style={styles.emptySubtext}>Будь першим!</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
          }
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.accent,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  postCard: {
    backgroundColor: Colors.panel,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.panelLight,
  },
  postHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  postAuthor: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  postTime: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 1,
  },
  postText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.text,
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: Colors.panelLight,
  },
});
