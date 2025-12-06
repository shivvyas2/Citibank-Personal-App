import { IconSymbol } from '@/components/ui/icon-symbol';
import CitiLogo from '@/components/citi-logo';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSidebar } from '@/contexts/SidebarContext';

export default function AccountsScreen() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'credit'>('deposit');
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

      {/* Date and Time */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>as of Dec 04, 2025 at 1:55 PM ET</Text>
      </View>

      {/* Tab Selection */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'deposit' && styles.tabActive]}
          onPress={() => setActiveTab('deposit')}>
          <Text style={[styles.tabText, activeTab === 'deposit' && styles.tabTextActive]}>
            Deposit Accounts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'credit' && styles.tabActive]}
          onPress={() => setActiveTab('credit')}>
          <Text style={[styles.tabText, activeTab === 'credit' && styles.tabTextActive]}>
            Credit Accounts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'deposit' ? (
          <>
            {/* Checking Account Summary */}
            <View style={styles.accountSummaryCard}>
              <View style={styles.accountSummaryHeader}>
                <View style={styles.accountIcon}>
                  <IconSymbol name="building.2.fill" size={24} color="white" />
                </View>
                <View style={styles.accountSummaryText}>
                  <Text style={styles.accountSummaryTitle}>Checking Account(s)</Text>
                  <Text style={styles.accountSummarySubtitle}>3 accounts</Text>
                </View>
                <Text style={styles.accountSummaryAmount}>$2,599.46</Text>
              </View>
            </View>

            {/* Deposit Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Deposit Summary(USD)</Text>
                <Text style={styles.summarySubtitle}>3 Accounts</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Start Day Ledger</Text>
                <Text style={styles.summaryValue}>$2,790.95</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Start Day Available</Text>
                <Text style={styles.summaryValue}>$2,599.46</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Current Ledger</Text>
                <Text style={styles.summaryValue}>$2,599.46</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowLast]}>
                <Text style={styles.summaryLabel}>Current Available</Text>
                <Text style={styles.summaryValue}>$2,599.46</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Credit Account Summary */}
            <View style={styles.accountSummaryCard}>
              <View style={styles.accountSummaryHeader}>
                <View style={[styles.accountIcon, { backgroundColor: '#E31837' }]}>
                  <IconSymbol name="creditcard.fill" size={24} color="white" />
                </View>
                <View style={styles.accountSummaryText}>
                  <Text style={styles.accountSummaryTitle}>Credit Account(s)</Text>
                  <Text style={styles.accountSummarySubtitle}>2 accounts</Text>
                </View>
                <Text style={styles.accountSummaryAmount}>$12,450.00</Text>
              </View>
            </View>

            {/* Credit Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Credit Summary(USD)</Text>
                <Text style={styles.summarySubtitle}>2 Accounts</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Credit Limit</Text>
                <Text style={styles.summaryValue}>$50,000.00</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Available Credit</Text>
                <Text style={styles.summaryValue}>$37,550.00</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Payoff Amount</Text>
                <Text style={styles.summaryValue}>$12,450.00</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowLast]}>
                <Text style={styles.summaryLabel}>Total Minimum Payment Due</Text>
                <Text style={styles.summaryValue}>$250.00</Text>
              </View>
            </View>

            {/* Individual Credit Accounts */}
            <View style={styles.accountsList}>
              <View style={styles.creditAccountCard}>
                <View style={styles.creditAccountHeader}>
                  <View style={styles.creditAccountInfo}>
                    <Text style={styles.creditAccountName}>CitiBusiness® AAdvantage® Platinum Select®</Text>
                    <Text style={styles.creditAccountNumber}>**** 4567</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color="#666" />
                </View>
                <View style={styles.creditAccountDetails}>
                  <View style={styles.creditAccountRow}>
                    <Text style={styles.creditAccountLabel}>Credit Limit</Text>
                    <Text style={styles.creditAccountValue}>$30,000.00</Text>
                  </View>
                  <View style={styles.creditAccountRow}>
                    <Text style={styles.creditAccountLabel}>Available Credit</Text>
                    <Text style={styles.creditAccountValue}>$22,500.00</Text>
                  </View>
                  <View style={styles.creditAccountRow}>
                    <Text style={styles.creditAccountLabel}>Current Balance</Text>
                    <Text style={[styles.creditAccountValue, styles.creditAccountBalance]}>$7,500.00</Text>
                  </View>
                  <View style={styles.creditAccountRow}>
                    <Text style={styles.creditAccountLabel}>Minimum Payment Due</Text>
                    <Text style={styles.creditAccountValue}>$150.00</Text>
                  </View>
                  <View style={[styles.creditAccountRow, styles.creditAccountRowLast]}>
                    <Text style={styles.creditAccountLabel}>Payment Due Date</Text>
                    <Text style={styles.creditAccountValue}>Jan 15, 2026</Text>
                  </View>
                </View>
              </View>

              <View style={styles.creditAccountCard}>
                <View style={styles.creditAccountHeader}>
                  <View style={styles.creditAccountInfo}>
                    <Text style={styles.creditAccountName}>CitiBusiness® / AAdvantage® Executive</Text>
                    <Text style={styles.creditAccountNumber}>**** 7890</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color="#666" />
                </View>
                <View style={styles.creditAccountDetails}>
                  <View style={styles.creditAccountRow}>
                    <Text style={styles.creditAccountLabel}>Credit Limit</Text>
                    <Text style={styles.creditAccountValue}>$20,000.00</Text>
                  </View>
                  <View style={styles.creditAccountRow}>
                    <Text style={styles.creditAccountLabel}>Available Credit</Text>
                    <Text style={styles.creditAccountValue}>$15,050.00</Text>
                  </View>
                  <View style={styles.creditAccountRow}>
                    <Text style={styles.creditAccountLabel}>Current Balance</Text>
                    <Text style={[styles.creditAccountValue, styles.creditAccountBalance]}>$4,950.00</Text>
                  </View>
                  <View style={styles.creditAccountRow}>
                    <Text style={styles.creditAccountLabel}>Minimum Payment Due</Text>
                    <Text style={styles.creditAccountValue}>$100.00</Text>
                  </View>
                  <View style={[styles.creditAccountRow, styles.creditAccountRowLast]}>
                    <Text style={styles.creditAccountLabel}>Payment Due Date</Text>
                    <Text style={styles.creditAccountValue}>Jan 20, 2026</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  menuButton: {
    padding: 8,
    marginLeft: -8,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
    marginRight: -8,
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
  dateContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '400',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabActive: {
    borderBottomColor: '#0066CC',
  },
  tabText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#0066CC',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  accountSummaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  accountSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accountSummaryText: {
    flex: 1,
  },
  accountSummaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  accountSummarySubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  accountSummaryAmount: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '400',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '400',
  },
  accountsList: {
    gap: 16,
  },
  creditAccountCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  creditAccountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  creditAccountInfo: {
    flex: 1,
  },
  creditAccountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  creditAccountNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  creditAccountDetails: {
    gap: 0,
  },
  creditAccountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  creditAccountRowLast: {
    borderBottomWidth: 0,
  },
  creditAccountLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  creditAccountValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  creditAccountBalance: {
    color: '#E31837',
  },
});

