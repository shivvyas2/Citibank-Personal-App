import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import CitiLogo from '@/components/citi-logo';
import { useCreditProfile } from '@/hooks/useCreditProfile';

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'myCiti' | 'banking' | 'creditCards' | 'loans' | 'invest'>('myCiti');
  const { experianData, isLoading: creditLoading } = useCreditProfile();

  // Get credit score data
  const creditScoreData = useMemo(() => {
    const intelliscore = experianData?.data?.scoreInformation?.commercialScore?.score;
    const fsrScore = experianData?.data?.scoreInformation?.fsrScore?.score;
    const personalScore = experianData?.creditScore || experianData?.score;
    
    if (intelliscore) {
      return {
        score: intelliscore,
        scoreType: 'Intelliscore v2',
        maxScore: 100,
        category: intelliscore >= 76 ? 'Excellent' : intelliscore >= 51 ? 'Good' : intelliscore >= 26 ? 'Fair' : 'Poor',
      };
    } else if (fsrScore) {
      return {
        score: fsrScore,
        scoreType: 'FSR Score',
        maxScore: 100,
        category: fsrScore >= 76 ? 'Excellent' : fsrScore >= 51 ? 'Good' : fsrScore >= 26 ? 'Fair' : 'Poor',
      };
    } else if (personalScore && personalScore >= 300 && personalScore <= 850) {
      return {
        score: personalScore,
        scoreType: 'VantageScore® 3.0',
        maxScore: 850,
        category: personalScore >= 750 ? 'Excellent' : personalScore >= 700 ? 'Good' : personalScore >= 650 ? 'Fair' : 'Poor',
      };
    }
    
    return {
      score: 72,
      scoreType: 'Intelliscore v2',
      maxScore: 100,
      category: 'Good',
    };
  }, [experianData]);

  const merchantOffers = [
    { name: 'Turo', amount: '$25 Back', daysLeft: '27d', logo: '🚗' },
    { name: 'Quicken', amount: '10% Back', daysLeft: '86d', logo: '💼', isNew: true },
    { name: 'DIRECTV', amount: '$40 Back', daysLeft: '27d', logo: '📺' },
  ];

  const transactions = [
    { description: 'DEEPAK KUDES : Zelle Debit PAY ID:...', amount: '-$25.00', date: 'Dec 03, 2025' },
    { description: 'Instant Payment Debit Dec 03 18:26p...', amount: '-$50.00', date: 'Dec 03, 2025' },
    { description: 'CAPITAL ONE MOBILE PMT CA0353...', amount: '-$100.00', date: 'Dec 03, 2025' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0066CC" translucent={false} />
      
      {/* Blue Header with Welcome */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
            <CitiLogo size={28} color="white" />
        </View>
          <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
              <IconSymbol name="creditcard" size={20} color="white" />
              <View style={styles.iconBadge}>
                <IconSymbol name="plus" size={12} color="#0066CC" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
              <IconSymbol name="magnifyingglass" size={20} color="white" />
          </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.welcomeText}>Welcome</Text>
      </View>

      {/* Horizontal Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'myCiti' && styles.tabActive]}
            onPress={() => setActiveTab('myCiti')}>
            <Text style={[styles.tabText, activeTab === 'myCiti' && styles.tabTextActive]}>My Citi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'banking' && styles.tabActive]}
            onPress={() => setActiveTab('banking')}>
            <Text style={[styles.tabText, activeTab === 'banking' && styles.tabTextActive]}>Banking</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'creditCards' && styles.tabActive]}
            onPress={() => setActiveTab('creditCards')}>
            <Text style={[styles.tabText, activeTab === 'creditCards' && styles.tabTextActive]}>Credit Cards</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'loans' && styles.tabActive]}
            onPress={() => setActiveTab('loans')}>
            <Text style={[styles.tabText, activeTab === 'loans' && styles.tabTextActive]}>Loans</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'invest' && styles.tabActive]}
            onPress={() => setActiveTab('invest')}>
            <Text style={[styles.tabText, activeTab === 'invest' && styles.tabTextActive]}>Invest</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'myCiti' && (
          <>
            {/* Checking Account Card */}
            <View style={styles.checkingCardWrapper}>
              <LinearGradient
                colors={['#2a8de4', '#0066CC', '#0055b0', '#004a9e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                locations={[0, 0.4, 0.7, 1]}
                style={styles.checkingCard}>
                {/* Pattern overlay for subtle texture */}
                <View style={styles.patternOverlay} />
                <View style={styles.checkingHeader}>
                  <Text style={styles.checkingLabel}>CHECKING</Text>
                  <IconSymbol name="chevron.up" size={16} color="white" />
                </View>
                <View style={styles.checkingBody}>
                  <Text style={styles.checkingAccountName}>Checking - 777</Text>
                  <Text style={styles.checkingBalance}>$100.51</Text>
                  <Text style={styles.checkingAvailable}>Available Now</Text>
                </View>
                <Text style={styles.checkingFooter}>CHECKING</Text>
              </LinearGradient>
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionButton}>
                <IconSymbol name="ellipsis" size={20} color="#0066CC" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <Text style={styles.quickActionText}>Statements</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <Text style={styles.quickActionText}>Zelle®</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <Text style={styles.quickActionText}>Pay & Tran</Text>
              </TouchableOpacity>
            </View>

            {/* Lumiq Credit Journey Card */}
            <TouchableOpacity 
              style={styles.lumiqJourneyCard}
              onPress={() => router.push('/(tabs)/credit-journey')}>
              <LinearGradient
                colors={['#0066CC', '#0055b0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.lumiqJourneyGradient}>
                <View style={styles.lumiqJourneyHeader}>
                  <View style={styles.lumiqJourneyTitleContainer}>
                    <Text style={styles.lumiqJourneyTitle}>Consumer Credit Journey</Text>
                    <Text style={styles.lumiqJourneySubtitle}>Powered By Lumiq AI</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color="white" />
                </View>
                <View style={styles.lumiqJourneyContent}>
                  <Text style={styles.lumiqGaugeScore}>740</Text>
                  <Text style={styles.lumiqGaugeLabel}>VantageScore <Text style={styles.lumiqGaugeProvider}>Experian™</Text></Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Explore Products & Offers */}
            <TouchableOpacity style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>Explore Products & Offers</Text>
              <IconSymbol name="chevron.right" size={18} color="#0066CC" />
            </TouchableOpacity>

            {/* Service Tiles Grid */}
            <View style={styles.serviceGrid}>
              <TouchableOpacity style={styles.serviceTile}>
                <IconSymbol name="creditcard.fill" size={32} color="white" />
                <Text style={styles.serviceTileText}>Credit Cards</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.serviceTile}>
                <IconSymbol name="doc.text.fill" size={32} color="white" />
                <Text style={styles.serviceTileText}>Banking</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.serviceTile}>
                <IconSymbol name="dollarsign.circle.fill" size={32} color="white" />
                <Text style={styles.serviceTileText}>Lending</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.serviceTile}>
                <IconSymbol name="chart.line.uptrend.xyaxis" size={32} color="white" />
                <Text style={styles.serviceTileText}>Investing</Text>
              </TouchableOpacity>
            </View>

            {/* Merchant Offers Section */}
            <View style={styles.merchantSection}>
              <View style={styles.merchantHeader}>
                <Text style={styles.merchantTitle}>Save with Merchant Offers</Text>
                <TouchableOpacity>
                  <IconSymbol name="questionmark.circle" size={18} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.merchantCardInfo}>
                <Text style={styles.merchantCardText}>Citibank® Debit Card - 5142</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All {'>'}</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.merchantOffers}>
                {merchantOffers.map((offer, index) => (
                  <View key={index} style={styles.merchantOfferCard}>
                    {offer.isNew && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>New</Text>
                      </View>
                    )}
                    <Text style={styles.merchantLogo}>{offer.logo}</Text>
                    <Text style={styles.merchantName}>{offer.name}</Text>
                    <Text style={styles.merchantAmount}>{offer.amount}</Text>
                    <View style={styles.merchantFooter}>
                      <Text style={styles.merchantDays}>{offer.daysLeft} left</Text>
                      <TouchableOpacity style={styles.addButton}>
                        <IconSymbol name="plus" size={16} color="#0066CC" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Credit Card Options Card */}
            <View style={styles.creditCardOptionsCard}>
              <TouchableOpacity style={styles.closeButton}>
                <IconSymbol name="xmark" size={20} color="white" />
              </TouchableOpacity>
              <View style={styles.creditCardOptionsHeader}>
                <IconSymbol name="creditcard.fill" size={32} color="white" />
                <Text style={styles.creditCardOptionsTitle}>Your Credit Card Options</Text>
              </View>
              <Text style={styles.creditCardOptionsDescription}>
                Explore Citi credit card offerings, pre-approved based on your credit score.
              </Text>
              <View style={styles.creditCardOptionsList}>
                <TouchableOpacity style={styles.creditCardOptionItem}>
                  <Text style={styles.creditCardOptionText}>0% Intro APR Cards</Text>
                  <IconSymbol name="chevron.right" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.creditCardOptionItem}>
                  <Text style={styles.creditCardOptionText}>Balance Transfer Cards</Text>
                  <IconSymbol name="chevron.right" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.creditCardOptionItem}>
                  <Text style={styles.creditCardOptionText}>Cash Back Cards</Text>
                  <IconSymbol name="chevron.right" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.creditCardOptionItem}>
                  <Text style={styles.creditCardOptionText}>Rewards Cards</Text>
                  <IconSymbol name="chevron.right" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.creditCardOptionItem}>
                  <Text style={styles.creditCardOptionText}>Travel Cards</Text>
                  <IconSymbol name="chevron.right" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {activeTab === 'banking' && (
          <View style={styles.tabContent}>
            {/* Checking Account Card */}
            <View style={styles.checkingCardWrapper}>
              <LinearGradient
                colors={['#2a8de4', '#0066CC', '#0055b0', '#004a9e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                locations={[0, 0.4, 0.7, 1]}
                style={styles.checkingCard}>
                <View style={styles.checkingHeader}>
                  <Text style={styles.checkingAccountNameBanking}>Checking-4777</Text>
                  <TouchableOpacity style={styles.accountInfoButton}>
                    <Text style={styles.accountInfoButtonText}>Account Info</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.checkingBody}>
                  <Text style={styles.checkingBalance}>$100.51</Text>
                  <Text style={styles.checkingAvailable}>Available Now</Text>
                </View>
                <View style={styles.checkingFooterRow}>
                  <Text style={styles.checkingOnDeposit}>On Deposit: $100.51</Text>
                  <Text style={styles.checkingFooter}>CHECKING</Text>
                </View>
              </LinearGradient>
        </View>

            {/* Action Buttons */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionButton}>
                <IconSymbol name="ellipsis" size={20} color="#0066CC" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <Text style={styles.quickActionText}>Lock Card</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <Text style={styles.quickActionText}>Statements</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <Text style={styles.quickActionText}>Zelle®</Text>
              </TouchableOpacity>
          </View>
          </View>
        )}

        {activeTab === 'creditCards' && (
          <View style={styles.tabContent}>
            {/* Explore Products & Offers Button */}
            <TouchableOpacity style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>Explore Products & Offers</Text>
              <IconSymbol name="chevron.right" size={18} color="#0066CC" />
        </TouchableOpacity>

            {/* Lumiq Credit Journey Card */}
            <TouchableOpacity 
              style={styles.lumiqJourneyCard}
              onPress={() => router.push('/(tabs)/credit-journey')}>
              <LinearGradient
                colors={['#0066CC', '#0055b0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.lumiqJourneyGradient}>
                <View style={styles.lumiqJourneyHeader}>
                  <View style={styles.lumiqJourneyTitleContainer}>
                    <Text style={styles.lumiqJourneyTitle}>Consumer Credit Journey</Text>
                    <Text style={styles.lumiqJourneySubtitle}>Powered By Lumiq AI</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color="white" />
                </View>
                <View style={styles.lumiqJourneyContent}>
                  <Text style={styles.lumiqGaugeScore}>740</Text>
                  <Text style={styles.lumiqGaugeLabel}>VantageScore <Text style={styles.lumiqGaugeProvider}>Experian™</Text></Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Credit Card Options Card */}
            <View style={styles.creditCardOptionsCard}>
              <TouchableOpacity style={styles.closeButton}>
                <IconSymbol name="xmark" size={20} color="white" />
              </TouchableOpacity>
              <View style={styles.creditCardOptionsHeader}>
                <IconSymbol name="creditcard.fill" size={32} color="white" />
                <Text style={styles.creditCardOptionsTitle}>Your Credit Card Options</Text>
              </View>
              <Text style={styles.creditCardOptionsDescription}>
                Explore Citi credit card offerings, pre-approved based on your credit score.
              </Text>
              <View style={styles.creditCardOptionsList}>
                <TouchableOpacity style={styles.creditCardOptionItem}>
                  <Text style={styles.creditCardOptionText}>0% Intro APR Cards</Text>
                  <IconSymbol name="chevron.right" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.creditCardOptionItem}>
                  <Text style={styles.creditCardOptionText}>Balance Transfer Cards</Text>
                  <IconSymbol name="chevron.right" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.creditCardOptionItem}>
                  <Text style={styles.creditCardOptionText}>Cash Back Cards</Text>
                  <IconSymbol name="chevron.right" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.creditCardOptionItem}>
                  <Text style={styles.creditCardOptionText}>Rewards Cards</Text>
                  <IconSymbol name="chevron.right" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.creditCardOptionItem}>
                  <Text style={styles.creditCardOptionText}>Travel Cards</Text>
                  <IconSymbol name="chevron.right" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Service Tiles Grid */}
            <View style={styles.serviceGridThree}>
              <TouchableOpacity style={styles.serviceTileThree}>
                <IconSymbol name="doc.text.fill" size={32} color="white" />
                <Text style={styles.serviceTileText}>Banking</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.serviceTileThree}>
                <IconSymbol name="dollarsign.circle.fill" size={32} color="white" />
                <Text style={styles.serviceTileText}>Lending</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.serviceTileThree}>
                <IconSymbol name="chart.line.uptrend.xyaxis" size={32} color="white" />
                <Text style={styles.serviceTileText}>Investing</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'loans' && (
          <View style={styles.tabContent}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>No active loans at this time.</Text>
            </View>

            {/* Lumiq Credit Journey Card */}
            <TouchableOpacity 
              style={styles.lumiqJourneyCard}
              onPress={() => router.push('/(tabs)/credit-journey')}>
              <LinearGradient
                colors={['#0066CC', '#0055b0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.lumiqJourneyGradient}>
                <View style={styles.lumiqJourneyHeader}>
                  <View style={styles.lumiqJourneyTitleContainer}>
                    <Text style={styles.lumiqJourneyTitle}>Consumer Credit Journey</Text>
                    <Text style={styles.lumiqJourneySubtitle}>Powered By Lumiq AI</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color="white" />
                </View>
                <View style={styles.lumiqJourneyContent}>
                  <Text style={styles.lumiqGaugeScore}>740</Text>
                  <Text style={styles.lumiqGaugeLabel}>VantageScore <Text style={styles.lumiqGaugeProvider}>Experian™</Text></Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loanInfoCard}>
              <Text style={styles.loanInfoText}>Explore loan options based on your credit profile.</Text>
            </View>

            <TouchableOpacity style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>Explore Loan Options</Text>
              <IconSymbol name="chevron.right" size={18} color="#0066CC" />
            </TouchableOpacity>
            <View style={styles.serviceGridThree}>
              <TouchableOpacity style={styles.serviceTileThree}>
                <IconSymbol name="dollarsign.circle.fill" size={32} color="white" />
                <Text style={styles.serviceTileText}>Personal Loans</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.serviceTileThree}>
                <IconSymbol name="creditcard.fill" size={32} color="white" />
                <Text style={styles.serviceTileText}>Auto Loans</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.serviceTileThree}>
                <IconSymbol name="building.2.fill" size={32} color="white" />
                <Text style={styles.serviceTileText}>Home Loans</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  header: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    backgroundColor: '#0066CC',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: 'white',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tabTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  checkingCardWrapper: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkingCard: {
    borderRadius: 16,
    padding: 20,
    minHeight: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'transparent',
    // Subtle pattern effect using multiple gradients
  },
  checkingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 1,
  },
  checkingBody: {
    flex: 1,
    justifyContent: 'center',
  },
  checkingAccountName: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
  },
  checkingBalance: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  checkingAvailable: {
    fontSize: 14,
    color: 'white',
  },
  checkingFooter: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 1,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0066CC',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6F4FE',
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0066CC',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  serviceTile: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: '#0066CC',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  serviceGridThree: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
    justifyContent: 'space-between',
  },
  serviceTileThree: {
    flex: 1,
    minHeight: 120,
    backgroundColor: '#0066CC',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  serviceTileText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginTop: 12,
  },
  merchantSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  merchantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  merchantTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  merchantCardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  merchantCardText: {
    fontSize: 14,
    color: '#666',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  merchantOffers: {
    marginTop: 8,
  },
  merchantOfferCard: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#9B59B6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  merchantLogo: {
    fontSize: 32,
    marginBottom: 8,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  merchantAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
    marginBottom: 12,
  },
  merchantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  merchantDays: {
    fontSize: 12,
    color: '#666',
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  emptyCardText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  creditCardOptionsCard: {
    backgroundColor: '#0066CC',
    borderRadius: 16,
    padding: 28,
    paddingTop: 32,
    marginHorizontal: 16,
    marginBottom: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditCardOptionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
    paddingRight: 40,
  },
  creditCardOptionsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  creditCardOptionsDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
    marginTop: 8,
    lineHeight: 22,
    paddingRight: 8,
  },
  creditCardOptionsList: {
    gap: 12,
  },
  creditCardOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  creditCardOptionText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  checkingAccountNameBanking: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  accountInfoButton: {
    backgroundColor: '#E6F4FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  accountInfoButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066CC',
  },
  checkingFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  checkingOnDeposit: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  transactionsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  transactionsList: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E31837',
  },
  lumiqJourneyCard: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lumiqJourneyGradient: {
    borderRadius: 16,
    padding: 28,
    paddingTop: 32,
    minHeight: 180,
  },
  lumiqJourneyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  lumiqJourneyTitleContainer: {
    flex: 1,
  },
  lumiqJourneyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  lumiqJourneySubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  lumiqJourneyContent: {
    marginTop: 12,
    alignItems: 'center',
  },
  lumiqGaugeScore: {
    fontSize: 56,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
  },
  lumiqGaugeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  lumiqGaugeProvider: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loanInfoCard: {
    backgroundColor: '#E6F4FE',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B3D9F2',
  },
  loanInfoText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
    textAlign: 'center',
  },
});

