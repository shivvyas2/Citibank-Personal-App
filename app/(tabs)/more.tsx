import { IconSymbol } from '@/components/ui/icon-symbol';
import CitiLogo from '@/components/citi-logo';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSidebar } from '@/contexts/SidebarContext';

export default function ProfileScreen() {
  const { openSidebar } = useSidebar();
  const router = useRouter();

  const menuItems = [
    { icon: 'person.circle', title: 'Personal Information', action: () => {} },
    { icon: 'lock', title: 'Security Settings', action: () => {} },
    { icon: 'bell', title: 'Notifications', action: () => {} },
    { icon: 'creditcard', title: 'Cards & Accounts', action: () => {} },
    { icon: 'doc.text', title: 'Statements & Documents', action: () => {} },
    { icon: 'questionmark.circle', title: 'Help & Support', action: () => {} },
    { icon: 'gearshape', title: 'Settings', action: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
          <IconSymbol name="line.3.horizontal" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <CitiLogo size={20} color="#0066CC" />
        </View>
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <IconSymbol name="envelope" size={20} color="#0066CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <IconSymbol name="bell" size={20} color="#000" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <IconSymbol name="person.fill" size={40} color="#0066CC" />
          </View>
        </View>
        <Text style={styles.profileName}>John Doe</Text>
        <Text style={styles.profileEmail}>john.doe@example.com</Text>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.action}>
            <View style={styles.menuItemLeft}>
              <IconSymbol name={item.icon as any} size={24} color="#0066CC" />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color="#999" />
          </TouchableOpacity>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => {
            // Handle sign out
            router.replace('/login');
          }}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  menuButton: {
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  profileHeader: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F4FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
  },
  signOutButton: {
    margin: 16,
    marginTop: 24,
    backgroundColor: '#0066CC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
