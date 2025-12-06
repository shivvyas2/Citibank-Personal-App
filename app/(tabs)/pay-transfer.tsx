import { IconSymbol } from '@/components/ui/icon-symbol';
import CitiLogo from '@/components/citi-logo';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSidebar } from '@/contexts/SidebarContext';

export default function PaymentsScreen() {
  const { openSidebar } = useSidebar();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
          <IconSymbol name="line.3.horizontal" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <CitiLogo />
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

      {/* Main Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Internal Transfer */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentCardTitle}>Internal Transfer</Text>
          <TouchableOpacity style={styles.paymentOption}>
            <Text style={styles.paymentOptionText}>Initiate</Text>
            <IconSymbol name="chevron.right" size={20} color="#0066CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentOption}>
            <Text style={styles.paymentOptionText}>Transaction Details</Text>
            <IconSymbol name="chevron.right" size={20} color="#0066CC" />
          </TouchableOpacity>
        </View>

        {/* Wires */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentCardTitle}>Wires</Text>
          <TouchableOpacity style={styles.paymentOption}>
            <Text style={styles.paymentOptionText}>Initiate</Text>
            <IconSymbol name="chevron.right" size={20} color="#0066CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentOption}>
            <Text style={styles.paymentOptionText}>Transaction Details</Text>
            <IconSymbol name="chevron.right" size={20} color="#0066CC" />
          </TouchableOpacity>
        </View>

        {/* Bill Payments */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentCardTitle}>Bill Payments</Text>
          <TouchableOpacity style={styles.paymentOption}>
            <Text style={styles.paymentOptionText}>Initiate</Text>
            <IconSymbol name="chevron.right" size={20} color="#0066CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentOption}>
            <Text style={styles.paymentOptionText}>Transaction Details</Text>
            <IconSymbol name="chevron.right" size={20} color="#0066CC" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
});
