import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TextInput, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';

interface UserItem {
  uid: string;
  displayName: string;
  city: string;
  school?: string;
  class?: string;
  photoURL: string;
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(collection(db, 'users'), (snap) => {
      const items: UserItem[] = [];
      snap.forEach((s) => {
        items.push(s.data() as UserItem);
      });
      setUsers(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(q) ||
      u.school?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q)
    );
  });

  const renderUser = ({ item }: { item: UserItem }) => (
    <View style={styles.userCard}>
      <Image source={{ uri: item.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={styles.userDetail}>
          {[item.school, item.class ? `${item.class} клас` : null, item.city].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </View>
  );

  if (!user) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Учасники</Text>
      </View>

      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Пошук за ім'ям, школою, містом..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Ionicons name="close-circle" size={18} color={Colors.textSecondary} onPress={() => setSearchQuery('')} />
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>
            {searchQuery ? 'Нікого не знайдено' : 'Поки що немає учасників'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item.uid}
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
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.panel,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 12,
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
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  listContent: {
    padding: 16,
    gap: 8,
  },
  userCard: {
    backgroundColor: Colors.panel,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.panelLight,
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  userDetail: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
