import { IconSymbol } from '@/components/ui/icon-symbol';
import CitiLogo from '@/components/citi-logo';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSidebar } from '@/contexts/SidebarContext';
import { useCreditProfile } from '@/hooks/useCreditProfile';

export default function HomeScreen() {
  const router = useRouter();
  const { openSidebar } = useSidebar();
  const { experianData, isLoading: creditLoading } = useCreditProfile();

  // Get credit score data
  const creditScoreData = useMemo(() => {
    // Try to get Intelliscore (business) or VantageScore (personal)
    const intelliscore = experianData?.data?.scoreInformation?.commercialScore?.score;
    const fsrScore = experianData?.data?.scoreInformation?.fsrScore?.score;
    const personalScore = experianData?.creditScore || experianData?.score;
    
    // Prefer Intelliscore, then FSR, then personal score
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
    
    // Default fallback - use business score (72)
    return {
      score: 72,
      scoreType: 'Intelliscore v2',
      maxScore: 100,
      category: 72 >= 76 ? 'Excellent' : 72 >= 51 ? 'Good' : 72 >= 26 ? 'Fair' : 'Poor',
    };
  }, [experianData]);

  const handleSeeLatestScore = () => {
    router.push('/(tabs)/credit-journey');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Top Header with Menu, Logo, and Notifications */}
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
            <View style={styles.messageBadge}>
              <Text style={styles.badgeText}>0</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <IconSymbol name="bell" size={20} color="#000" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* App Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.appTitle}>CitiBusiness® Online Mobile</Text>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Transactions Awaiting Approval Card */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Transactions Awaiting Approval</Text>
            <View style={styles.cardValueContainer}>
              <Text style={styles.cardValue}>0</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#0066CC" style={styles.chevron} />
          </View>
        </TouchableOpacity>

        {/* Page Indicator */}
        <View style={styles.pageIndicator}>
          <View style={styles.pageDot} />
        </View>

        {/* Deposit Accounts Card */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Deposit Accounts</Text>
            <IconSymbol name="chevron.down" size={20} color="#666" />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardLabel}>Current Available:</Text>
            <Text style={styles.cardAmount}>$2,599.46</Text>
            <Text style={styles.cardSubtext}>3 Accounts</Text>
          </View>
        </TouchableOpacity>

        {/* Credit Accounts Card */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Credit Accounts</Text>
            <IconSymbol name="chevron.down" size={20} color="#666" />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardLabel}>Payoff Amount:</Text>
            <Text style={styles.cardAmount}>$0.00</Text>
            <Text style={styles.cardSubtext}>0 Accounts</Text>
          </View>
        </TouchableOpacity>

        {/* Credit Score Card */}
        <View style={styles.creditScoreCard}>
          <Text style={styles.creditScoreTitle}>Business Credit Journey</Text>
          <Text style={styles.creditScoreSubtitle}>Powered By Lumiq AI</Text>
          <Text style={styles.creditScoreType}>{creditScoreData.scoreType}</Text>
          
          <View style={styles.creditScoreDisplay}>
            <Text style={styles.creditScoreValue}>{creditScoreData.score}</Text>
            <Text style={styles.creditScoreCategory}>{creditScoreData.category}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill,
                  { 
                    width: `${(creditScoreData.score / creditScoreData.maxScore) * 100}%`,
                    backgroundColor: '#0066CC',
                  }
                ]} 
              />
            </View>
            <View style={styles.progressBarLabels}>
              <Text style={styles.progressBarLabel}>0</Text>
              <Text style={styles.progressBarLabel}>{creditScoreData.maxScore}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.seeLatestScoreButton}
            onPress={handleSeeLatestScore}>
            <Text style={styles.seeLatestScoreButtonText}>See latest score</Text>
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
  messageBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#0066CC',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  cardValueContainer: {
    marginHorizontal: 16,
  },
  cardValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000',
  },
  chevron: {
    marginLeft: 8,
  },
  pageIndicator: {
    alignItems: 'center',
    marginVertical: 8,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066CC',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  cardBody: {
    padding: 20,
    paddingTop: 12,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  cardSubtext: {
    fontSize: 14,
    color: '#666',
  },
  creditScoreCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  creditScoreTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  creditScoreSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  creditScoreType: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  creditScoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 24,
  },
  creditScoreValue: {
    fontSize: 64,
    fontWeight: '700',
    color: '#000',
    marginRight: 12,
  },
  creditScoreCategory: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000',
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBarLabel: {
    fontSize: 12,
    color: '#999',
  },
  seeLatestScoreButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0066CC',
    backgroundColor: 'white',
  },
  seeLatestScoreButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0066CC',
  },
});
