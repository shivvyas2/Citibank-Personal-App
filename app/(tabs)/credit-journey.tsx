import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { getAllCitibankBusinessCards, getCardApplyUrl, getCardDetailsUrl, getCardImageSource, type CitibankBusinessCard } from '@/data/citibankBusinessCards';
import { useCreditProfile } from '@/hooks/useCreditProfile';
import {
    calculateCitibankApprovalLikelihood,
    extractApprovalData,
    type CitibankCardProfile
} from '@/services/citibankApprovalService';
import { trackCardApplication } from '@/services/profileService';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Linking, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling functions with reduced scaling factor for better UI
const scale = (size: number): number => {
  const baseWidth = 375; // iPhone X/11/12/13 standard width
  const scaleFactor = SCREEN_WIDTH / baseWidth;
  // Apply 0.8 multiplier to make things smaller
  return size * Math.min(scaleFactor * 0.8, 1.0); // Cap at 1.0x to prevent excessive scaling
};

const scaleFont = (size: number): number => {
  const baseWidth = 375;
  const scaleFactor = SCREEN_WIDTH / baseWidth;
  const scaled = size * Math.min(scaleFactor * 0.8, 1.0);
  // Ensure minimum readable font size
  return Math.max(scaled, size * 0.8);
};

const scaleVertical = (size: number): number => {
  const baseHeight = 812; // iPhone X/11/12/13 standard height
  const scaleFactor = SCREEN_HEIGHT / baseHeight;
  // Apply 0.8 multiplier to make things smaller
  return size * Math.min(scaleFactor * 0.8, 1.0); // Cap at 1.0x to prevent excessive scaling
};

// Determine if device is small
const isSmallDevice = SCREEN_WIDTH < 375;
const isLargeDevice = SCREEN_WIDTH >= 414;

export default function CreditJourneyScreen() {
  const [activeTab, setActiveTab] = useState('credit');
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [activeScoreType, setActiveScoreType] = useState('fsr');
  const [accountType, setAccountType] = useState<'personal' | 'business'>('business');
  const bottomSheetRef = useRef<BottomSheet>(null);
  // Responsive snap points based on screen size
  const snapPoints = useMemo(() => {
    if (isSmallDevice) {
      return ['60%', '75%'];
    } else if (isLargeDevice) {
      return ['50%', '60%'];
    }
    return ['55%', '65%'];
  }, []);
  const alertsSnapPoints = useMemo(() => {
    if (isSmallDevice) {
      return ['75%', '90%'];
    } else if (isLargeDevice) {
      return ['65%', '80%'];
    }
    return ['70%', '85%'];
  }, []);
  const offersSnapPoints = useMemo(() => {
    if (isSmallDevice) {
      return ['60%', '75%'];
    } else if (isLargeDevice) {
      return ['50%', '60%'];
    }
    return ['55%', '65%'];
  }, []);
  
  // Fetch credit profile and recommendations from API
  const { profile, experianData, recommendations, businessId, isLoading, error, refresh } = useCreditProfile();
  const { getToken } = useAuth();
  
  // Collapsible cards state
  const [expandedCards, setExpandedCards] = useState<{[key: string]: boolean}>({
    scoreChanges: true,
    creditUtilization: false,
    paymentHealth: false,
    industryPayment: false,
    riskFactors: false,
    businessObligations: false,
  });

  const toggleCard = (cardKey: keyof typeof expandedCards) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  // Function to clean markdown formatting from text
  const cleanMarkdownText = (text: string): string => {
    if (!text) return '';
    
    let cleaned = text;
    
    // Remove markdown numbered lists (1., 2., 3., etc.) at start of lines
    cleaned = cleaned.replace(/^\d+\.\s+/gm, '');
    
    // Remove markdown bullet points (-, *, •) at start of lines
    cleaned = cleaned.replace(/^[-*•]\s+/gm, '');
    
    // Remove markdown headers (# ## ###)
    cleaned = cleaned.replace(/^#+\s+/gm, '');
    
    // Remove markdown bold markers (**text**)
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
    
    // Remove markdown italic markers (*text* or _text_)
    cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
    cleaned = cleaned.replace(/_(.*?)_/g, '$1');
    
    // Remove markdown links but keep text [text](url) -> text
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    
    // Remove markdown code blocks
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
    
    // Normalize line breaks - preserve paragraph breaks (double newlines)
    // Replace 3+ newlines with double newline
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Clean up multiple spaces (but preserve single spaces)
    cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');
    
    // Trim whitespace from each line but preserve line structure
    cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');
    
    // Final trim
    cleaned = cleaned.trim();
    
    return cleaned;
  };

  // Helper function to get and increment application count
  const getAndIncrementApplicationCount = async (): Promise<number> => {
    try {
      const storageKey = `application_count_${businessId || 'default'}`;
      const currentCountStr = await AsyncStorage.getItem(storageKey);
      const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;
      const newCount = currentCount + 1;
      await AsyncStorage.setItem(storageKey, newCount.toString());
      return newCount;
    } catch (error) {
      return 1; // Return 1 as fallback if storage fails
    }
  };

  const handleApplyNow = async (cardId?: string, applyUrl?: string) => {
    // Default Citibank application URL if no specific URL provided
    const defaultUrl = 'https://www.citi.com/credit-cards/business';
    const url = applyUrl || defaultUrl;
    
    // Track the application for API recommendations (UUID cardIds)
    // API endpoint: POST /recommendations/{businessId}/applications
    // Payload: { cardId: string, status: "APPLIED", notes: string, metadata: {} }
    const isUUID = cardId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cardId);
    
    if (isUUID && businessId) {
      try {
        const token = await getToken();
        if (token) {
          // Get and increment application count
          const applicationCount = await getAndIncrementApplicationCount();
          
          // Call API to track application: POST /recommendations/{businessId}/applications
          // Status is always "APPLIED" for recommendations
          // Include application count in metadata
          await trackCardApplication(token, businessId, cardId, '', {
            applicationCount,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        // Continue to open URL even if tracking fails
      }
    }
    
    // Open the application URL
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    }
  };

  // Properly destructure all Experian data
  const experianDataDestructured = useMemo(() => {
    // Log the raw experianData to debug
    console.log('🔍 Raw experianData:', {
      hasExperianData: !!experianData,
      hasData: !!experianData?.data,
      topLevelScore: experianData?.score,
      topLevelCreditScore: experianData?.creditScore,
      dataKeys: experianData?.data ? Object.keys(experianData.data) : [],
      scoreInformation: experianData?.data?.scoreInformation,
    });
    
    if (!experianData?.data) {
      console.warn('⚠️ No experianData.data found');
      return null;
    }
    
    const data = experianData.data;
    
    console.log('📊 Extracting score information:', {
      hasScoreInformation: !!data.scoreInformation,
      commercialScore: data.scoreInformation?.commercialScore,
      fsrScore: data.scoreInformation?.fsrScore,
      allScoreInfoKeys: data.scoreInformation ? Object.keys(data.scoreInformation) : [],
    });
    
    return {
      // Score Information
      scoreInformation: {
        commercialScore: data.scoreInformation?.commercialScore || null,
        fsrScore: data.scoreInformation?.fsrScore || null,
        commercialScoreFactors: data.scoreInformation?.commercialScoreFactors || [],
        fsrScoreFactors: data.scoreInformation?.fsrScoreFactors || [],
        commercialScoreTrends: data.scoreInformation?.commercialScoreTrends || [],
        fsrScoreTrends: data.scoreInformation?.fsrScoreTrends || [],
      },
      
      // Expanded Credit Summary - all fields
      expandedCreditSummary: {
        activeTradelineCount: data.expandedCreditSummary?.activeTradelineCount || 0,
        allTradelineBalance: data.expandedCreditSummary?.allTradelineBalance || 0,
        allTradelineCount: data.expandedCreditSummary?.allTradelineCount || 0,
        averageBalance5Quarters: data.expandedCreditSummary?.averageBalance5Quarters || 0,
        bankruptcyIndicator: data.expandedCreditSummary?.bankruptcyIndicator || false,
        collectionBalance: data.expandedCreditSummary?.collectionBalance || 0,
        collectionCount: data.expandedCreditSummary?.collectionCount || 0,
        commercialFraudRiskIndicatorCount: data.expandedCreditSummary?.commercialFraudRiskIndicatorCount || 0,
        currentAccountBalance: data.expandedCreditSummary?.currentAccountBalance || 0,
        currentDbt: data.expandedCreditSummary?.currentDbt || 0,
        currentTradelineCount: data.expandedCreditSummary?.currentTradelineCount || 0,
        highBalance6Months: data.expandedCreditSummary?.highBalance6Months || 0,
        highestDbt5Quarters: data.expandedCreditSummary?.highestDbt5Quarters || 0,
        highestDbt6Months: data.expandedCreditSummary?.highestDbt6Months || 0,
        judgmentCount: data.expandedCreditSummary?.judgmentCount || 0,
        judgmentIndicator: data.expandedCreditSummary?.judgmentIndicator || false,
        legalBalance: data.expandedCreditSummary?.legalBalance || 0,
        lowBalance6Months: data.expandedCreditSummary?.lowBalance6Months || 0,
        monthlyAverageDbt: data.expandedCreditSummary?.monthlyAverageDbt || 0,
        mostRecentCollectionDate: data.expandedCreditSummary?.mostRecentCollectionDate || null,
        mostRecentJudgmentDate: data.expandedCreditSummary?.mostRecentJudgmentDate || null,
        mostRecentTaxLienDate: data.expandedCreditSummary?.mostRecentTaxLienDate || null,
        mostRecentUccDate: data.expandedCreditSummary?.mostRecentUccDate || null,
        ofacMatchWarning: data.expandedCreditSummary?.ofacMatchWarning || null,
        oldestCollectionDate: data.expandedCreditSummary?.oldestCollectionDate || null,
        oldestJudgmentDate: data.expandedCreditSummary?.oldestJudgmentDate || null,
        oldestTaxLienDate: data.expandedCreditSummary?.oldestTaxLienDate || null,
        oldestUccDate: data.expandedCreditSummary?.oldestUccDate || null,
        openCollectionBalance: data.expandedCreditSummary?.openCollectionBalance || 0,
        openCollectionCount: data.expandedCreditSummary?.openCollectionCount || 0,
        singleHighCredit: data.expandedCreditSummary?.singleHighCredit || 0,
        taxLienCount: data.expandedCreditSummary?.taxLienCount || 0,
        taxLienIndicator: data.expandedCreditSummary?.taxLienIndicator || false,
        tradeCollectionBalance: data.expandedCreditSummary?.tradeCollectionBalance || 0,
        tradeCollectionCount: data.expandedCreditSummary?.tradeCollectionCount || 0,
        uccDerogatoryCount: data.expandedCreditSummary?.uccDerogatoryCount || 0,
        uccFilings: data.expandedCreditSummary?.uccFilings || 0,
        victimStatementIndicator: data.expandedCreditSummary?.victimStatementIndicator || false,
      },
      
      // Arrays
      tradePaymentExperiences: Array.isArray(data.tradePaymentExperiences) ? data.tradePaymentExperiences : [],
      additionalPaymentExperiences: Array.isArray(data.additionalPaymentExperiences) ? data.additionalPaymentExperiences : [],
      collectionsDetail: Array.isArray(data.collectionsDetail) ? data.collectionsDetail : [],
      inquiries: Array.isArray(data.inquiries) ? data.inquiries : [],
      monthlyPaymentTrends: Array.isArray(data.monthlyPaymentTrends) ? data.monthlyPaymentTrends : [],
      quarterlyPaymentTrends: Array.isArray(data.quarterlyPaymentTrends) ? data.quarterlyPaymentTrends : [],
      
      // Industry Payment Trends
      industryPaymentTrends: {
        sic: data.industryPaymentTrends?.sic || null,
        trends: Array.isArray(data.industryPaymentTrends?.trends) ? data.industryPaymentTrends.trends : [],
      },
      
      // Payment Totals
      paymentTotals: {
        additionalTradelines: data.paymentTotals?.additionalTradelines || {},
        combinedTradelines: data.paymentTotals?.combinedTradelines || {},
        continuouslyReportedTradelines: data.paymentTotals?.continuouslyReportedTradelines || {},
        newlyReportedTradelines: data.paymentTotals?.newlyReportedTradelines || {},
        tradelines: data.paymentTotals?.tradelines || {},
      },
    };
  }, [experianData]);

  // Personal credit score data (FICO/VantageScore 3.0 - 300-850 range)
  const personalScoreData = useMemo(() => {
    // Try to get personal credit score from experianData
    // Check multiple possible locations in the response
    const personalScore = 
      experianData?.creditScore || 
      experianData?.score || 
      experianData?.data?.creditScore ||
      experianData?.data?.score ||
      null;
    
    console.log('🔍 Personal Score Extraction:', {
      experianDataCreditScore: experianData?.creditScore,
      experianDataScore: experianData?.score,
      dataCreditScore: experianData?.data?.creditScore,
      dataScore: experianData?.data?.score,
      finalPersonalScore: personalScore,
    });
    
    // If we have a score in the 300-850 range, use it
    if (personalScore && personalScore >= 300 && personalScore <= 850) {
      return {
        score: personalScore,
        scoreType: 'VantageScore® 3.0',
        provider: 'Experian™',
        change: 0, // Could be calculated from trends if available
        changeDirection: 'up' as 'up' | 'down',
      };
    }
    
    // Fallback: Use a sample personal credit score (720 - Good score)
    const fallbackData = {
      score: 720,
      scoreType: 'VantageScore® 3.0',
      provider: 'Experian™',
      change: 0,
      changeDirection: 'up' as 'up' | 'down',
    };
    
    return fallbackData;
  }, [experianData, accountType]);

  // Use API data or fallback to placeholder data
  const businessInsights = useMemo(() => {
    if (experianDataDestructured) {
      const scoreInfo = experianDataDestructured.scoreInformation;
      const creditSummary = experianDataDestructured.expandedCreditSummary;
      
      const fsrScore = scoreInfo.fsrScore?.score;
      const commercialScore = scoreInfo.commercialScore?.score;
      const finalScore = fsrScore || commercialScore || 35;
      
      console.log('🔍 Business Score Extraction:', {
        hasScoreInfo: !!scoreInfo,
        fsrScore,
        commercialScore,
        finalScore,
        scoreInfoKeys: scoreInfo ? Object.keys(scoreInfo) : [],
      });
      
      return {
        utilizationPercent: creditSummary.currentAccountBalance && creditSummary.allTradelineBalance
          ? Math.round((creditSummary.currentAccountBalance / creditSummary.allTradelineBalance) * 100)
          : 42,
        tradelines: creditSummary.activeTradelineCount || creditSummary.allTradelineCount || 12,
        paymentIndex: creditSummary.currentDbt ? 100 - (creditSummary.currentDbt * 2) : 68,
        collections: creditSummary.collectionCount || creditSummary.openCollectionCount || 1,
        industryRisk: creditSummary.currentDbt && creditSummary.currentDbt > 20 ? 'High' : creditSummary.currentDbt && creditSummary.currentDbt > 10 ? 'Medium' : 'Low',
        inquiries30d: experianDataDestructured.inquiries?.filter((inq: any) => {
          const date = new Date(inq.date || inq.inquiryDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return date >= thirtyDaysAgo;
        }).length || 2,
        score: finalScore,
        businessId: businessId,
      };
    }
    // Fallback placeholder data
    return {
      utilizationPercent: 42,
      tradelines: 12,
      paymentIndex: 68,
      collections: 1,
      industryRisk: 'Medium',
      inquiries30d: 2,
      score: 35,
      businessId: businessId,
    };
  }, [experianDataDestructured, businessId]);

  // Credit utilization data from API or fallback
  const utilizationData = useMemo(() => {
    if (experianDataDestructured) {
      const summary = experianDataDestructured.expandedCreditSummary;
      // Use API totalHighCredit, but fallback to 50000 if 0 or invalid to ensure proper percentage calculation
      const apiTotalHighCredit = summary.singleHighCredit || summary.allTradelineBalance || 0;
      const totalHighCredit = apiTotalHighCredit > 0 ? apiTotalHighCredit : 50000;
      
      // Extract account utilizations from tradePaymentExperiences if available
      let accountUtilizations: any[] = [];
      if (experianDataDestructured.tradePaymentExperiences && experianDataDestructured.tradePaymentExperiences.length > 0) {
        accountUtilizations = experianDataDestructured.tradePaymentExperiences
          .slice(0, 5)
          .map((trade: any) => {
            const balance = trade.currentBalance || trade.balance || 0;
            const limit = trade.highCredit || trade.creditLimit || balance || 1;
            return {
              category: trade.tradeName || trade.accountName || 'Account',
              balance: balance,
              limit: limit,
              utilization: limit > 0 ? Math.round((balance / limit) * 100) : 0,
            };
          });
      }
      
      const newTotalBalance = 15000;
      // Calculate utilization percentage: (balance / limit) * 100
      const newOverallUtilization = Math.round((newTotalBalance / totalHighCredit) * 100);
      
      return {
        overallUtilization: Math.min(newOverallUtilization, 100),
        totalHighCredit,
        totalBalance: newTotalBalance,
        accountsWithCredit: summary.activeTradelineCount || summary.currentTradelineCount || 0,
        accountUtilizations: accountUtilizations.length > 0 ? accountUtilizations : [
          { category: 'Total', balance: 15000, limit: totalHighCredit, utilization: newOverallUtilization },
        ],
      };
    }
    // Fallback dummy data
    return {
      overallUtilization: 30,
      totalHighCredit: 50000,
      totalBalance: 15000,
      accountsWithCredit: 3,
      accountUtilizations: [
        { category: 'Retail', balance: 8000, limit: 15000, utilization: 53 },
        { category: 'Services', balance: 7000, limit: 20000, utilization: 35 },
        { category: 'Manufacturing', balance: 6000, limit: 15000, utilization: 40 },
      ],
    };
  }, [experianDataDestructured]);

  const tradePaymentData = useMemo(() => {
    if (experianDataDestructured) {
      const summary = experianDataDestructured.expandedCreditSummary;
      const trades = experianDataDestructured.tradePaymentExperiences || [];
      
      // Calculate on-time payment rate from tradePaymentExperiences
      let onTimeCount = 0;
      let totalTrades = 0;
      let totalDbt = 0;
      const dbtRanges = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
      
      trades.forEach((trade: any) => {
        if (trade.status || trade.accountStatus) {
          totalTrades++;
          const dbt = trade.dbt || trade.daysBeyondTerms || trade.currentDbt || 0;
          totalDbt += dbt;
          
          if (dbt <= 30) {
            onTimeCount++;
            dbtRanges['0-30'] += trade.currentBalance || trade.balance || 0;
          } else if (dbt <= 60) {
            dbtRanges['31-60'] += trade.currentBalance || trade.balance || 0;
          } else if (dbt <= 90) {
            dbtRanges['61-90'] += trade.currentBalance || trade.balance || 0;
          } else {
            dbtRanges['90+'] += trade.currentBalance || trade.balance || 0;
          }
        }
      });
      
      const onTimePaymentRate = totalTrades > 0 ? Math.round((onTimeCount / totalTrades) * 100) : 92;
      const averageDaysBeyondTerms = totalTrades > 0 ? Math.round(totalDbt / totalTrades) : summary.monthlyAverageDbt || 12;
      
      return {
        activeTradesCount: 2,
        closedTradesCount: (summary.allTradelineCount || 0) - (summary.activeTradelineCount || 0),
        totalTradeBalance: 15000,
        onTimePaymentRate,
        averageDaysBeyondTerms,
        dbtDistribution: [
          { name: '0-30 days', population: dbtRanges['0-30'] || 15000, color: '#34C759' },
          { name: '31-60 days', population: 0, color: '#FF9500' },
          { name: '61-90 days', population: 0, color: '#FF4444' },
          { name: '90+ days', population: 0, color: '#8E8E93' },
        ],
      };
    }
    // Fallback dummy data
    return {
      activeTradesCount: 2,
      closedTradesCount: 2,
      totalTradeBalance: 15000,
      onTimePaymentRate: 92,
      averageDaysBeyondTerms: 12,
      dbtDistribution: [
        { name: '0-30 days', population: 15000, color: '#34C759' },
        { name: '31-60 days', population: 0, color: '#FF9500' },
        { name: '61-90 days', population: 0, color: '#E31837' },
        { name: '90+ days', population: 0, color: '#8E8E93' },
      ],
    };
  }, [experianDataDestructured]);

  const industryPaymentData = useMemo(() => {
    if (experianDataDestructured?.industryPaymentTrends?.trends) {
      const trends = experianDataDestructured.industryPaymentTrends.trends;
      const industries = trends.map((trend: any) => {
        const sic = trend.sic || trend.industryCode || '';
        const industryName = trend.industryName || trend.name || `Industry ${sic}`;
        const balance = trend.totalBalance || trend.balance || 0;
        const onTimeRate = trend.onTimeRate || trend.paymentRate || (trend.currentDbt && trend.currentDbt <= 30 ? 95 : 85);
        
        return {
          name: industryName,
          balance,
          onTimeRate: Math.round(onTimeRate),
        };
      });
      
      if (industries.length > 0) {
        return { industries };
      }
    }
    // Fallback dummy data
    return {
      industries: [
        { name: 'Retail', balance: 12000, onTimeRate: 95 },
        { name: 'Services', balance: 6000, onTimeRate: 88 },
        { name: 'Manufacturing', balance: 3000, onTimeRate: 92 },
      ],
    };
  }, [experianDataDestructured]);

  const riskHighlightsData = useMemo(() => {
    if (experianDataDestructured) {
      const summary = experianDataDestructured.expandedCreditSummary;
      const collectionsDetail = experianDataDestructured.collectionsDetail || [];
      
      // Calculate total collection amount
      const totalCollectionAmount = collectionsDetail.reduce((sum: number, collection: any) => {
        return sum + (collection.amount || collection.balance || 0);
      }, 0) || summary.collectionBalance || summary.openCollectionBalance || 0;
      
      // Find severely past due accounts (DBT > 90)
      const severelyPastDue = (experianDataDestructured.tradePaymentExperiences || []).filter((trade: any) => {
        const dbt = trade.dbt || trade.daysBeyondTerms || trade.currentDbt || 0;
        return dbt > 90;
      });
      
      return {
        collectionAccounts: {
          count: summary.collectionCount || summary.openCollectionCount || collectionsDetail.length || 0,
          totalAmount: totalCollectionAmount,
        },
        severelyPastDueAccounts: {
          count: severelyPastDue.length,
          totalBalance: severelyPastDue.reduce((sum: number, trade: any) => {
            return sum + (trade.currentBalance || trade.balance || 0);
          }, 0),
        },
      };
    }
    // Fallback dummy data
    return {
      collectionAccounts: { count: 1, totalAmount: 5000 },
      severelyPastDueAccounts: { count: 0, totalBalance: 0 },
    };
  }, [experianDataDestructured]);

  const inquiriesData = useMemo(() => {
    if (experianDataDestructured?.inquiries && experianDataDestructured.inquiries.length > 0) {
      const inquiries = experianDataDestructured.inquiries;
      const total = inquiries.length;
      
      // Count recent inquiries (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recent = inquiries.filter((inq: any) => {
        const date = new Date(inq.date || inq.inquiryDate || inq.reportDate);
        return date >= thirtyDaysAgo;
      }).length;
      
      // Determine impact
      let impact = 'Low';
      if (recent >= 5) impact = 'High';
      else if (recent >= 3) impact = 'Medium';
      
      // Group by month for last 6 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const byMonthMap: { [key: string]: number } = {};
      inquiries.forEach((inq: any) => {
        const date = new Date(inq.date || inq.inquiryDate || inq.reportDate);
        if (date >= sixMonthsAgo) {
          const monthKey = `${months[date.getMonth()]}`;
          byMonthMap[monthKey] = (byMonthMap[monthKey] || 0) + 1;
        }
      });
      
      // Create array for last 6 months
      const byMonth = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = months[date.getMonth()];
        byMonth.push({ month: monthName, count: byMonthMap[monthName] || 0 });
      }
      
      return {
        total,
        recent,
        impact,
        byMonth,
      };
    }
    // Fallback dummy data
    return {
      total: 5,
      recent: 2,
      impact: 'Low',
      byMonth: [
        { month: 'Jun', count: 0 },
        { month: 'Jul', count: 1 },
        { month: 'Aug', count: 0 },
        { month: 'Sep', count: 1 },
        { month: 'Oct', count: 1 },
        { month: 'Nov', count: 0 },
      ],
    };
  }, [experianDataDestructured]);

  const obligationsData = useMemo(() => {
    if (experianDataDestructured) {
      const trades = experianDataDestructured.tradePaymentExperiences || [];
      const summary = experianDataDestructured.expandedCreditSummary;
      
      // Map trade payment experiences to account format
      const accounts = trades
        .filter((trade: any) => trade.status !== 'Closed' && trade.accountStatus !== 'Closed')
        .slice(0, 10)
        .map((trade: any) => ({
          name: trade.tradeName || trade.accountName || trade.creditorName || 'Account',
          current: trade.currentBalance || trade.balance || 0,
          limit: trade.highCredit || trade.creditLimit || trade.currentBalance || 0,
          status: trade.status || trade.accountStatus || 'Active',
        }));
      
      // Calculate recommended limit (typically 2-3x current high credit)
      const recommendedLimit = summary.singleHighCredit 
        ? Math.round(summary.singleHighCredit * 2.5)
        : summary.allTradelineBalance 
          ? Math.round(summary.allTradelineBalance * 1.5)
          : 50000;
      
      return {
        accounts: accounts.length > 0 ? accounts : [
          { name: 'Total Accounts', current: summary.currentAccountBalance || 0, limit: summary.allTradelineBalance || 0, status: 'Active' },
        ],
        recommendedLimit,
        totalBalance: summary.currentAccountBalance || summary.allTradelineBalance || 0,
      };
    }
    // Fallback dummy data
    return {
      accounts: [
        { name: 'Retail Account', current: 8000, limit: 15000, status: 'Active' },
        { name: 'Services Account', current: 7000, limit: 20000, status: 'Active' },
        { name: 'Manufacturing Account', current: 6000, limit: 15000, status: 'Active' },
      ],
      recommendedLimit: 50000,
      totalBalance: 21000,
    };
  }, [experianData]);

  // Experian business score risk category helper
  // FSR Score: Higher score = Lower risk (0-100 scale)
  const getFSRRiskCategory = (score: number): string => {
    if (score >= 76) return 'Minimal Risk';
    if (score >= 51) return 'Low Risk';
    if (score >= 26) return 'Moderate Risk';
    if (score >= 11) return 'High Risk';
    return 'Very High Risk';
  };

  const getIntelliscoreRiskCategory = (score: number): string => {
    // Intelliscore: Lower score = higher risk, Higher score = lower risk
    // Inverse scale compared to FSR for display purposes
    if (score >= 76) return 'Low Risk';
    if (score >= 51) return 'Moderate Risk';
    if (score >= 26) return 'High Risk';
    if (score >= 11) return 'Very High Risk';
    return 'Minimal Risk';
  };

  // Personal credit score category (VantageScore/FICO - 300-850 range)
  const getPersonalScoreCategory = (score: number): string => {
    if (score >= 750) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    if (score >= 600) return 'Poor';
    return 'Very Poor';
  };

  const CreditScoreGauge = ({ score = 35, category = 'Moderate Risk', change = 5, scoreType = 'FSR Score', provider = 'Experian', maxScore = 100, changeDirection = 'up' as 'up' | 'down' }) => {
    const getRiskCategoryColor = (cat: string): string => {
      // Personal score colors (300-850 range) - Using Citibank colors
      if (maxScore === 850) {
        if (cat.includes('Excellent') || cat.includes('Good')) return '#34C759';
        if (cat.includes('Fair')) return '#FF9500';
        return '#E31837'; // Poor or Very Poor - Citibank red
      }
      // Business score colors (0-100 range) - Using Citibank colors
      if (cat.includes('Minimal') || cat.includes('Low')) return '#34C759';
      if (cat.includes('Moderate')) return '#FF9500';
      return '#E31837'; // Citibank red
    };

    return (
    <View style={styles.gaugeContainer} pointerEvents="box-none">
      <Svg width={400} height={220} viewBox="0 0 400 220">
        {/* Shadow arc (subtle outer glow) */}
        <Path
          d="M 80 180 A 120 120 0 0 1 320 180"
          stroke="#000000"
          strokeOpacity="0.12"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
        />
        {/* Track arc (unfilled outline visible under progress) */}
        <Path
          d="M 80 180 A 120 120 0 0 1 320 180"
          stroke="#0D1B69"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
        {/* Progress arc (filled portion) */}
        <Path
          d="M 80 180 A 120 120 0 0 1 320 180"
          stroke={getRiskCategoryColor(category)}
          strokeWidth="12"
          fill="none"
          strokeDasharray="377"
          strokeDashoffset={maxScore === 850 
            ? `${377 * (1 - (score - 300) / 550)}` // For 300-850 range: (616-300)/550 = 0.575
            : `${377 * (1 - score / maxScore)}`} // For 0-100 range
          strokeLinecap="round"
        />
        {/* Unfilled outline is preserved by the track arc above. */}
      </Svg>
      
      <View style={styles.scoreInfo} pointerEvents="none">
        <Text style={styles.scoreCategory}>{category}</Text>
        <Text style={styles.scoreValue}>{score}</Text>
        {change !== 0 && (
        <View style={styles.scoreChange}>
            <IconSymbol 
              name={changeDirection === 'down' ? "arrow.down" : "arrow.up"} 
              size={20} 
              color={changeDirection === 'down' ? "#E31837" : "#34C759"} 
            />
            <Text style={[styles.scoreChangeText, changeDirection === 'down' && { color: '#E31837' }]}>
              {changeDirection === 'down' ? '-' : '+'}{Math.abs(change)} points
            </Text>
        </View>
        )}
        {change === 0 && (
          <Text style={styles.noChangeText}>No Change</Text>
        )}
      </View>
      
      <View style={styles.scoreFooter} pointerEvents="none">
        <Text style={styles.scoreProvider}>{scoreType} • {provider}</Text>
        <TouchableOpacity>
          <IconSymbol name="questionmark.circle" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0066CC" />
      
      {/* Header */}
      <View style={styles.header}>
        
        <Text style={styles.headerTitle}>Credit Journey</Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <IconSymbol name="bell" size={24} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Personal/Business Toggle */}
      <View style={styles.accountTypeContainer}>
        <View style={styles.segmentControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              accountType === 'personal' && styles.segmentButtonActive
            ]}
            onPress={() => {
              setAccountType('personal');
            }}
          >
            <Text style={[
              styles.segmentButtonText,
              accountType === 'personal' && styles.segmentButtonTextActive
            ]}>
              Personal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              accountType === 'business' && styles.segmentButtonActive
            ]}
            onPress={() => setAccountType('business')}
          >
            <Text style={[
              styles.segmentButtonText,
              accountType === 'business' && styles.segmentButtonTextActive
            ]}>
              Business
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'credit' && styles.activeTab]}
          onPress={() => setActiveTab('credit')}
        >
          <Text style={[styles.tabText, activeTab === 'credit' && styles.activeTabText]}>
            Credit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'alerts' && styles.activeTab]}
          onPress={() => setActiveTab('alerts')}
        >
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.activeTabText]}>
            Alerts
          </Text>
          <View style={styles.alertBadge}>
            <Text style={styles.alertCount}>3</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'offers' && styles.activeTab]}
          onPress={() => setActiveTab('offers')}
        >
          <Text style={[styles.tabText, activeTab === 'offers' && styles.activeTabText]}>
            Offers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'credit' && (
        <View style={styles.creditContent}>
          {/* Top (non-scrollable) */}
          <View style={styles.scoreSection}>
            <View style={styles.scoreHeader}>
              <View style={styles.scoreHeaderLeft}>
                {(() => {
                  // Format date - use current date or date from data
                  const currentDate = new Date();
                  const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear().toString().slice(-2)}`;
                  
                  if (accountType === 'business' && profile?.data?.business?.[0]?.name) {
                    return (
                      <View>
                        <Text style={styles.businessName}>
                          {profile.data.business[0].name}
                        </Text>
                        <Text style={styles.scoreDate}>as of {formattedDate}</Text>
                      </View>
                    );
                  }
                  return (
                    <Text style={styles.scoreDate}>As of {formattedDate}</Text>
                  );
                })()}
              </View>
              <TouchableOpacity>
                <Text style={styles.scoreHistory}>See score history {'>'}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Score Type Tabs - Only show for Business */}
            {accountType === 'business' && (
            <View style={styles.scoreTypeTabsContainer}>
              <TouchableOpacity 
                style={[styles.scoreTypeTab, activeScoreType === 'fsr' && styles.activeScoreTypeTab]}
                onPress={() => setActiveScoreType('fsr')}
              >
                <Text style={[styles.scoreTypeTabText, activeScoreType === 'fsr' && styles.activeScoreTypeTabText]}>
                  FSR Score
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.scoreTypeTab, activeScoreType === 'intelliscore' && styles.activeScoreTypeTab]}
                onPress={() => setActiveScoreType('intelliscore')}
              >
                <Text style={[styles.scoreTypeTabText, activeScoreType === 'intelliscore' && styles.activeScoreTypeTabText]}>
                  Intelliscore
                </Text>
              </TouchableOpacity>
            </View>
            )}
            
            {/* Display selected meter */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066CC" />
                <Text style={styles.loadingText}>Loading credit score...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity onPress={refresh} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : accountType === 'personal' ? (
              // Personal Credit Score (VantageScore 3.0 / FICO - 300-850 range)
              <CreditScoreGauge 
                score={personalScoreData.score}
                category={getPersonalScoreCategory(personalScoreData.score)}
                change={personalScoreData.change}
                changeDirection={personalScoreData.changeDirection}
                scoreType={personalScoreData.scoreType}
                provider={personalScoreData.provider}
                maxScore={850}
              />
            ) : activeScoreType === 'fsr' ? (
              // Business FSR Score
              <CreditScoreGauge 
                score={businessInsights.score || 35}
                category={getFSRRiskCategory(businessInsights.score || 35)}
                change={5}
                scoreType="FSR Score"
                provider="Experian"
                maxScore={100}
              />
            ) : (
              // Business Intelliscore
              <CreditScoreGauge 
                score={experianDataDestructured?.scoreInformation?.commercialScore?.score || experianDataDestructured?.scoreInformation?.fsrScore?.score || 65}
                category={getIntelliscoreRiskCategory(experianDataDestructured?.scoreInformation?.commercialScore?.score || experianDataDestructured?.scoreInformation?.fsrScore?.score || 65)}
                change={8}
                scoreType="Intelliscore v2"
                provider="Experian"
                maxScore={100}
              />
            )}
          </View>

          {/* Bottom (sheet) */}
          <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            backgroundStyle={styles.sheetBg}
            handleIndicatorStyle={styles.sheetHandle}
            enablePanDownToClose={false}
            bottomInset={-40}
          >
            <BottomSheetScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
              <View style={styles.breakdownCard}>
            <View style={styles.breakdownTabsContainer}>
              <View style={styles.segmentedTabs}>
                <TouchableOpacity 
                  style={[styles.segmentTab, activeSubTab === 'overview' && styles.activeSegmentTab]}
                  onPress={() => setActiveSubTab('overview')}
                >
                  <Text style={[styles.segmentTabText, activeSubTab === 'overview' && styles.activeSegmentTabText]}>Overview</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.segmentTab, activeSubTab === 'breakdown' && styles.activeSegmentTab]}
                  onPress={() => setActiveSubTab('breakdown')}
                >
                  <Text style={[styles.segmentTabText, activeSubTab === 'breakdown' && styles.activeSegmentTabText]}>Score breakdown</Text>
                </TouchableOpacity>
              </View>
            </View>

            {activeSubTab === 'overview' && (
              <View style={styles.overviewContent}>
                {/* Why your score changed */}
                <TouchableOpacity 
                  style={styles.sectionHeader}
                  onPress={() => toggleCard('scoreChanges')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionTitle}>Why your score changed</Text>
                  <View style={styles.headerRightActions}>
                    <TouchableOpacity>
                      <IconSymbol name="questionmark.circle" size={16} color="#0066CC" />
                    </TouchableOpacity>
                    <IconSymbol 
                      name="chevron.down" 
                      size={20} 
                      color="#666666" 
                      style={[styles.chevronIcon, expandedCards.scoreChanges && styles.chevronExpanded]} 
                    />
                  </View>
                </TouchableOpacity>
                
                {expandedCards.scoreChanges && (
                  <>
                    <View style={styles.changeList}>
                      <View style={styles.changeItem}>
                        <Text style={styles.changeDescription}>
                          Credit usage increased on your revolving accounts opened in the last year
                        </Text>
                        <View style={styles.changeImpact}>
                          <IconSymbol name="arrow.up" size={14} color="#34C759" />
                          <Text style={styles.changePoints}>+4 points</Text>
                        </View>
                      </View>
                      
                      <View style={styles.changeItem}>
                        <Text style={styles.changeDescription}>
                          Card account balances increased
                        </Text>
                        <View style={styles.changeImpact}>
                          <IconSymbol name="arrow.up" size={14} color="#34C759" />
                          <Text style={styles.changePoints}>+2 points</Text>
                        </View>
                      </View>
                      
                      <View style={styles.changeItem}>
                        <Text style={styles.changeDescription}>
                          Credit usage increased on your accounts
                        </Text>
                        <View style={styles.changeImpact}>
                          <IconSymbol name="arrow.up" size={14} color="#34C759" />
                          <Text style={styles.changePoints}>+1 point</Text>
                        </View>
                      </View>
                    </View>
                    
                  </>
                )}

                {/* Credit Utilization Card */}
                <View style={styles.modernCard}>
                  <TouchableOpacity 
                    style={styles.cardHeaderWithInfo}
                    onPress={() => toggleCard('creditUtilization')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modernCardTitle}>Credit Utilization</Text>
                    <View style={styles.headerRightActions}>
                      <TouchableOpacity>
                        <IconSymbol name="questionmark.circle" size={16} color="#0066CC" />
                      </TouchableOpacity>
                      <IconSymbol 
                        name="chevron.down" 
                        size={20} 
                        color="#666666" 
                        style={[styles.chevronIcon, expandedCards.creditUtilization && styles.chevronExpanded]} 
                      />
                    </View>
                  </TouchableOpacity>
                  
                  {expandedCards.creditUtilization && (
                  <>
                  
                  <View style={styles.utilizationMainRow}>
                    <Text style={[styles.utilizationPercentage, { color: utilizationData.overallUtilization > 80 ? '#E31837' : utilizationData.overallUtilization > 30 ? '#FF9500' : '#0066CC' }]}>
                      {utilizationData.overallUtilization}%
                    </Text>
                    <View style={styles.utilizationBarContainer}>
                      <View style={styles.usageBar}>
                        <View style={[styles.usageBarFill, { 
                          width: `${Math.min(utilizationData.overallUtilization, 100)}%`,
                          backgroundColor: '#0066CC'
                        }]} />
                      </View>
                      <Text style={styles.utilizationRecommendationText}>
                        {utilizationData.overallUtilization <= 30 ? "You're in a good range." : 'Aim for <30% utilization.'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.utilizationStatsGrid}>
                    <View style={styles.utilizationStatItem}>
                      <Text style={styles.utilizationStatLabel}>Total High Credit</Text>
                      <Text style={styles.utilizationStatValue}>${utilizationData.totalHighCredit.toLocaleString()}</Text>
                    </View>
                    <View style={styles.utilizationStatItem}>
                      <Text style={styles.utilizationStatLabel}>Total Balance</Text>
                      <Text style={styles.utilizationStatValue}>${utilizationData.totalBalance.toLocaleString()}</Text>
                    </View>
                    <View style={styles.utilizationStatItemFull}>
                      <Text style={styles.utilizationStatLabel}>Accounts with Credit</Text>
                      <Text style={styles.utilizationStatValue}>{utilizationData.accountsWithCredit}</Text>
                    </View>
                  </View>

                  {utilizationData.accountUtilizations.length > 0 && (
                    <View style={styles.topUtilizationAccounts}>
                      <Text style={styles.subSectionTitle}>Top Accounts by Utilization</Text>
                      {utilizationData.accountUtilizations.map((account, index) => (
                        <View key={index} style={styles.accountRow}>
                          <View>
                            <Text style={styles.accountCategoryText}>{account.category}</Text>
                            <Text style={styles.accountBalanceText}>
                              ${account.balance.toLocaleString()} / ${account.limit.toLocaleString()}
                            </Text>
                          </View>
                          <Text style={[styles.accountUtilizationText, { color: '#0066CC' }]}>
                            {account.utilization}%
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                  </>
                  )}
                </View>

                {/* Payment Health Card */}
                <View style={styles.modernCard}>
                  <TouchableOpacity 
                    style={styles.cardHeaderWithInfo}
                    onPress={() => toggleCard('paymentHealth')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modernCardTitle}>Payment Health</Text>
                    <View style={styles.headerRightActions}>
                      <TouchableOpacity>
                        <IconSymbol name="questionmark.circle" size={16} color="#0066CC" />
                      </TouchableOpacity>
                      <IconSymbol 
                        name="chevron.down" 
                        size={20} 
                        color="#666666" 
                        style={[styles.chevronIcon, expandedCards.paymentHealth && styles.chevronExpanded]} 
                      />
                    </View>
                  </TouchableOpacity>
                  
                  {expandedCards.paymentHealth && (
                  <>

                  <View style={styles.utilizationStatsGrid}>
                    <View style={styles.utilizationStatItem}>
                      <Text style={styles.utilizationStatLabel}>Active Tradelines</Text>
                      <Text style={styles.utilizationStatValue}>{tradePaymentData.activeTradesCount}</Text>
                    </View>
                    <View style={styles.utilizationStatItem}>
                      <Text style={styles.utilizationStatLabel}>On-Time Rate</Text>
                      <Text style={styles.utilizationStatValue}>{tradePaymentData.onTimePaymentRate}%</Text>
                    </View>
                    <View style={styles.utilizationStatItem}>
                      <Text style={styles.utilizationStatLabel}>Total Balance</Text>
                      <Text style={styles.utilizationStatValue}>${tradePaymentData.totalTradeBalance.toLocaleString()}</Text>
                    </View>
                    <View style={styles.utilizationStatItem}>
                      <Text style={styles.utilizationStatLabel}>Avg Days Beyond Terms</Text>
                      <Text style={styles.utilizationStatValue}>{tradePaymentData.averageDaysBeyondTerms}</Text>
                    </View>
                  </View>

                  <View style={styles.paymentDistributionSection}>
                    <Text style={styles.subSectionTitle}>Payment Distribution by Days Beyond Terms</Text>
                    <View style={styles.distributionBars}>
                      {tradePaymentData.dbtDistribution.map((item, index) => {
                        const total = tradePaymentData.dbtDistribution.reduce((sum, d) => sum + d.population, 0);
                        const percentage = total > 0 ? (item.population / total) * 100 : 0;
                        return (
                          <View key={index} style={styles.distributionBarItem}>
                            <View style={styles.distributionBarWrapper}>
                              <View style={[styles.distributionBarFill, { 
                                width: `${percentage}%`,
                                backgroundColor: item.color
                              }]} />
                            </View>
                            <Text style={styles.distributionBarLabel}>{item.name}</Text>
                            <Text style={styles.distributionBarValue}>${item.population.toLocaleString()}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                  </>
                  )}
                </View>

                {/* Industry Payment Card */}
                <View style={styles.modernCard}>
                  <TouchableOpacity 
                    style={styles.cardHeaderWithInfo}
                    onPress={() => toggleCard('industryPayment')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modernCardTitle}>Industry Payment Performance</Text>
                    <View style={styles.headerRightActions}>
                      <TouchableOpacity>
                        <IconSymbol name="questionmark.circle" size={16} color="#0066CC" />
                      </TouchableOpacity>
                      <IconSymbol 
                        name="chevron.down" 
                        size={20} 
                        color="#666666" 
                        style={[styles.chevronIcon, expandedCards.industryPayment && styles.chevronExpanded]} 
                      />
                    </View>
                  </TouchableOpacity>
                  
                  {expandedCards.industryPayment && (
                  <>

                  {industryPaymentData.industries.length > 0 ? (
                    industryPaymentData.industries.map((industry, index) => (
                      <View key={index} style={styles.industryItem}>
                        <View style={styles.industryInfo}>
                          <Text style={styles.industryName}>{industry.name}</Text>
                          <Text style={styles.industryBalance}>${industry.balance.toLocaleString()}</Text>
                        </View>
                        <Text style={styles.industryOnTimeRate}>{industry.onTimeRate}% on-time</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noDataText}>No industry payment data available</Text>
                  )}
                  </>
                  )}
                </View>

                {/* Credit Health & Risk Factors */}
                <View style={styles.modernCard}>
                  <TouchableOpacity 
                    style={styles.cardHeaderWithInfo}
                    onPress={() => toggleCard('riskFactors')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modernCardTitle}>Credit Health & Risk Factors</Text>
                    <IconSymbol 
                      name="chevron.down" 
                      size={20} 
                      color="#666666" 
                      style={[styles.chevronIcon, expandedCards.riskFactors && styles.chevronExpanded]} 
                    />
                  </TouchableOpacity>
                  
                  {expandedCards.riskFactors && (
                  <>
                  <Text style={styles.subSectionTitle}>Key Risk Indicators</Text>

                  <View style={styles.keyFactorsGrid}>
                    <View style={styles.keyFactorItem}>
                      <IconSymbol 
                        name="exclamationmark.triangle.fill" 
                        size={24} 
                        color={riskHighlightsData.collectionAccounts.count > 0 ? '#E31837' : '#34C759'} 
                      />
                      <Text style={styles.keyFactorName}>Collections</Text>
                      <Text style={styles.keyFactorValue}>
                        {riskHighlightsData.collectionAccounts.count} ($
                        {riskHighlightsData.collectionAccounts.totalAmount.toLocaleString()})
                      </Text>
                      <View style={[styles.statusBadge, riskHighlightsData.collectionAccounts.count > 0 ? styles.badgeWarn : styles.badgeOk]}>
                        <Text style={styles.statusBadgeText}>
                          {riskHighlightsData.collectionAccounts.count > 0 ? 'Needs Attention' : 'Good'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.keyFactorItem}>
                      <IconSymbol 
                        name="clock.fill" 
                        size={24} 
                        color={riskHighlightsData.severelyPastDueAccounts.count > 0 ? '#E31837' : '#34C759'} 
                      />
                      <Text style={styles.keyFactorName}>91+ Days Past Due</Text>
                      <Text style={styles.keyFactorValue}>
                        {riskHighlightsData.severelyPastDueAccounts.count} ($
                        {riskHighlightsData.severelyPastDueAccounts.totalBalance.toLocaleString()})
                      </Text>
                      <View style={[styles.statusBadge, riskHighlightsData.severelyPastDueAccounts.count > 0 ? styles.badgeWarn : styles.badgeOk]}>
                        <Text style={styles.statusBadgeText}>
                          {riskHighlightsData.severelyPastDueAccounts.count > 0 ? 'Needs Attention' : 'Good'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.keyFactorItem}>
                      <IconSymbol 
                        name="doc.text.fill" 
                        size={24} 
                        color={tradePaymentData.activeTradesCount > 0 ? '#34C759' : '#8E8E93'} 
                      />
                      <Text style={styles.keyFactorName}>Active Tradelines</Text>
                      <Text style={styles.keyFactorValue}>{tradePaymentData.activeTradesCount}</Text>
                      <View style={[styles.statusBadge, tradePaymentData.activeTradesCount > 0 ? styles.badgeOk : { backgroundColor: '#8E8E93' }]}>
                        <Text style={styles.statusBadgeText}>
                          {tradePaymentData.activeTradesCount > 0 ? 'Good' : 'Insufficient Data'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.keyFactorItem}>
                      <IconSymbol name="chart.bar.fill" size={24} color="#0066CC" />
                      <Text style={styles.keyFactorName}>Industry Risk</Text>
                      <Text style={styles.keyFactorValue}>{businessInsights.industryRisk}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: businessInsights.industryRisk === 'High' ? '#E31837' : businessInsights.industryRisk === 'Low' ? '#34C759' : '#FF9500' }]}>
                        <Text style={styles.statusBadgeText}>{businessInsights.industryRisk}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardHeaderWithInfo}>
                    <Text style={styles.subSectionTitle}>Credit Inquiries</Text>
                    <TouchableOpacity>
                      <IconSymbol name="questionmark.circle" size={16} color="#0066CC" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inquiriesSummaryRow}>
                    <View style={styles.inquiryStat}>
                      <Text style={styles.inquiryStatLabel}>Total</Text>
                      <Text style={styles.inquiryStatValue}>{inquiriesData.total}</Text>
                    </View>
                    <View style={styles.inquiryStat}>
                      <Text style={styles.inquiryStatLabel}>Recent (30 days)</Text>
                      <Text style={styles.inquiryStatValue}>{inquiriesData.recent}</Text>
                    </View>
                    <View style={styles.inquiryStat}>
                      <Text style={styles.inquiryStatLabel}>Impact</Text>
                      <View style={[styles.statusBadge, inquiriesData.impact === 'Low' ? styles.badgeOk : { backgroundColor: '#FF9500' }]}>
                        <Text style={styles.statusBadgeText}>{inquiriesData.impact}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.chartLabel}>Inquiries by Month (Last 6)</Text>
                  <View style={styles.barChartContainer}>
                    {inquiriesData.byMonth.map((item, index) => (
                      <View key={index} style={styles.barColumn}>
                        <View style={styles.barWrapper}>
                          <View style={[styles.bar, { height: Math.max(item.count * 20, item.count > 0 ? 5 : 0) }]} />
                        </View>
                        <Text style={styles.barLabel}>{item.month}</Text>
                      </View>
                    ))}
                  </View>
                  </>
                  )}
                </View>

                {/* Business Obligations */}
                <View style={styles.modernCard}>
                  <TouchableOpacity 
                    style={styles.cardHeaderWithInfo}
                    onPress={() => toggleCard('businessObligations')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modernCardTitle}>Business Obligations</Text>
                    <View style={styles.headerRightActions}>
                      <TouchableOpacity>
                        <IconSymbol name="questionmark.circle" size={16} color="#0066CC" />
                      </TouchableOpacity>
                      <IconSymbol 
                        name="chevron.down" 
                        size={20} 
                        color="#666666" 
                        style={[styles.chevronIcon, expandedCards.businessObligations && styles.chevronExpanded]} 
                      />
                    </View>
                  </TouchableOpacity>
                  
                  {expandedCards.businessObligations && (
                  <>

                  <View style={styles.obligationsSummary}>
                    <Text style={styles.obligationsTotalValue}>
                      ${obligationsData.totalBalance.toLocaleString()}
                    </Text>
                    <Text style={styles.obligationsSubText}>
                      Total Balance Across {tradePaymentData.activeTradesCount} Active & {tradePaymentData.closedTradesCount} Closed Line(s)
                    </Text>
                  </View>

                  {obligationsData.recommendedLimit > 0 && (
                    <View style={styles.recommendedLimitBox}>
                      <Text style={styles.recommendedLimitLabel}>Recommended Credit Limit (Overall)</Text>
                      <Text style={styles.recommendedLimitValue}>
                        ${obligationsData.recommendedLimit.toLocaleString()}
                      </Text>
                    </View>
                  )}

                  {obligationsData.accounts.slice(0, 5).map((account, index) => {
                    const hasLimit = account.limit > 0;
                    const progressPercentage = hasLimit ? Math.min((account.current / account.limit) * 100, 100) : 0;
                    return (
                      <View key={index} style={styles.obligationAccountItem}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={styles.obligationAccountName}>{account.name}</Text>
                          <View style={[styles.accountStatusTag, account.status === 'Closed' ? styles.closedTag : styles.activeTag]}>
                            <Text style={[styles.accountStatusTagText, account.status === 'Closed' ? styles.closedTagText : styles.activeTagText]}>{account.status}</Text>
                          </View>
                        </View>
                        <View style={styles.accountDetailsRow}>
                          <View style={styles.progressBarContainer}>
                            <View
                              style={[
                                styles.progressBarFill,
                                {
                                  width: `${Math.min(progressPercentage, 100)}%`,
                                  opacity: hasLimit ? 1 : 0.2,
                                  backgroundColor: '#0066CC',
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.balanceText}>
                            ${account.current.toLocaleString()}
                            {hasLimit ? ` / $${account.limit.toLocaleString()}` : ''}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                  </>
                  )}
                </View>
              </View>
            )}

            {activeSubTab === 'breakdown' && (
              <View style={styles.breakdownContent}>
                <View style={styles.factorsHeader}>
                  <Text style={styles.factorsTitle}>Factors that impact your score</Text>
                  <Text style={styles.factorsSubtitle}>
                    See each factor for a detailed look at what goes into it and how you&apos;re doing.
                  </Text>
                </View>
                
                <View style={styles.factorsList}>
                  <TouchableOpacity style={styles.factorItem}>
                    <View style={styles.factorIcon}>
                      <IconSymbol name="calendar" size={20} color="#0066CC" />
                    </View>
                    <View style={styles.factorContent}>
                      <Text style={styles.factorName}>Payment history</Text>
                      <Text style={styles.factorImpact}>Very high impact</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={16} color="#999999" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.factorItem}>
                    <View style={styles.factorIcon}>
                      <IconSymbol name="folder" size={20} color="#0066CC" />
                    </View>
                    <View style={styles.factorContent}>
                      <Text style={styles.factorName}>Credit history</Text>
                      <Text style={styles.factorImpact}>High impact</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={16} color="#999999" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.factorItem}>
                    <View style={styles.factorIcon}>
                      <IconSymbol name="creditcard" size={20} color="#0066CC" />
                    </View>
                    <View style={styles.factorContent}>
                      <Text style={styles.factorName}>Credit usage</Text>
                      <Text style={styles.factorImpact}>High impact</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={16} color="#999999" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.factorItem}>
                    <View style={styles.factorIcon}>
                      <IconSymbol name="doc.text" size={20} color="#0066CC" />
                    </View>
                    <View style={styles.factorContent}>
                      <Text style={styles.factorName}>Total balances</Text>
                      <Text style={styles.factorImpact}>Medium impact</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={16} color="#999999" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.factorItem}>
                    <View style={styles.factorIcon}>
                      <IconSymbol name="doc.text" size={20} color="#0066CC" />
                    </View>
                    <View style={styles.factorContent}>
                      <Text style={styles.factorName}>Credit checks</Text>
                      <Text style={styles.factorImpact}>Low impact</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={16} color="#999999" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
              </View>
              <View style={{ height: scale(140) }} />
              </BottomSheetScrollView>
          </BottomSheet>
        </View>
      )}

      {activeTab === 'alerts' && (
        <View style={styles.creditContent}>
          {/* Top (non-scrollable) - Score Meter */}
          <View style={styles.scoreSection}>
            <View style={styles.scoreHeader}>
              <View style={styles.scoreHeaderLeft}>
                {(() => {
                  const currentDate = new Date();
                  const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear().toString().slice(-2)}`;
                  
                  if (accountType === 'business' && profile?.data?.business?.[0]?.name) {
                    return (
                      <View>
                        <Text style={styles.businessName}>
                          {profile.data.business[0].name}
                        </Text>
                        <Text style={styles.scoreDate}>as of {formattedDate}</Text>
                      </View>
                    );
                  }
                  return (
                    <Text style={styles.scoreDate}>As of {formattedDate}</Text>
                  );
                })()}
              </View>
              <TouchableOpacity>
                <Text style={styles.scoreHistory}>See score history {'>'}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Score Type Tabs - Only show for Business */}
            {accountType === 'business' && (
              <View style={styles.scoreTypeTabsContainer}>
                <TouchableOpacity 
                  style={[styles.scoreTypeTab, activeScoreType === 'fsr' && styles.activeScoreTypeTab]}
                  onPress={() => setActiveScoreType('fsr')}
                >
                  <Text style={[styles.scoreTypeTabText, activeScoreType === 'fsr' && styles.activeScoreTypeTabText]}>
                    FSR Score
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.scoreTypeTab, activeScoreType === 'intelliscore' && styles.activeScoreTypeTab]}
                  onPress={() => setActiveScoreType('intelliscore')}
                >
                  <Text style={[styles.scoreTypeTabText, activeScoreType === 'intelliscore' && styles.activeScoreTypeTabText]}>
                    Intelliscore
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Display selected meter */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066CC" />
                <Text style={styles.loadingText}>Loading credit score...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity onPress={refresh} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : accountType === 'personal' ? (
              <CreditScoreGauge 
                score={personalScoreData.score}
                category={getPersonalScoreCategory(personalScoreData.score)}
                change={personalScoreData.change}
                changeDirection={personalScoreData.changeDirection}
                scoreType={personalScoreData.scoreType}
                provider={personalScoreData.provider}
                maxScore={850}
              />
            ) : activeScoreType === 'fsr' ? (
              <CreditScoreGauge 
                score={businessInsights.score || 35}
                category={getFSRRiskCategory(businessInsights.score || 35)}
                change={5}
                scoreType="FSR Score"
                provider="Experian"
                maxScore={100}
              />
            ) : (
              <CreditScoreGauge 
                score={experianDataDestructured?.scoreInformation?.commercialScore?.score || experianDataDestructured?.scoreInformation?.fsrScore?.score || 65}
                category={getIntelliscoreRiskCategory(experianDataDestructured?.scoreInformation?.commercialScore?.score || experianDataDestructured?.scoreInformation?.fsrScore?.score || 65)}
                change={8}
                scoreType="Intelliscore v2"
                provider="Experian"
                maxScore={100}
              />
            )}
          </View>

          {/* Bottom (sheet) */}
        <BottomSheet
          index={0}
          snapPoints={alertsSnapPoints}
          backgroundStyle={styles.sheetBg}
          handleIndicatorStyle={styles.sheetHandle}
          enablePanDownToClose={false}
          bottomInset={-40}
            topInset={250}
        >
          <BottomSheetScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <View style={styles.alertsHeaderList}>
            <Text style={styles.alertInboxTitle}>Alert Inbox</Text>
          </View>

          {/* Alert rows list */}
          <View style={styles.alertList}>
            <View style={styles.alertRow}>
              <View style={styles.alertIconCircle}>
                <IconSymbol name="bookmark" size={18} color="#0B6BD3" />
              </View>
              <View style={styles.alertRowLeft}>
                <Text style={styles.alertRowTitle}>Address change</Text>
              </View>
              <Text style={styles.alertRowDate}>10/10/2025</Text>
            </View>
            <View style={styles.rowDivider} />

            <View style={styles.alertRow}>
              <View style={styles.alertIconCircle}>
                <IconSymbol name="creditcard" size={18} color="#0B6BD3" />
              </View>
              <View style={styles.alertRowLeft}>
                <Text style={styles.alertRowTitle}>New bank/credit card</Text>
                <Text style={styles.alertRowSubtitle}>JPMCB CARD</Text>
              </View>
              <View style={styles.unreadPill}><Text style={styles.unreadText}>Unread</Text></View>
              <Text style={styles.alertRowDate}>09/29/2025</Text>
            </View>
            <View style={styles.rowDivider} />

            <View style={styles.alertRow}>
              <View style={styles.alertIconCircle}>
                <IconSymbol name="megaphone" size={18} color="#0B6BD3" />
              </View>
              <View style={styles.alertRowLeft}>
                <Text style={styles.alertRowTitle}>New credit inquiry</Text>
                <Text style={styles.alertRowSubtitle}>JPMCB CARD SERVICES</Text>
              </View>
              <View style={styles.unreadPill}><Text style={styles.unreadText}>Unread</Text></View>
              <Text style={styles.alertRowDate}>09/28/2025</Text>
            </View>
            <View style={styles.rowDivider} />

            <View style={styles.alertRow}>
              <View style={[styles.alertIconCircle, { backgroundColor: '#FFF4F4' }]}>
                <IconSymbol name="exclamationmark.triangle" size={18} color="#E03A2F" />
              </View>
              <View style={styles.alertRowLeft}>
                <Text style={styles.alertRowTitle}>Card over limit</Text>
                <Text style={styles.alertRowSubtitle}>ZOLVE/CONTINENTAL BANK</Text>
              </View>
              <View style={styles.unreadPill}><Text style={styles.unreadText}>Unread</Text></View>
              <Text style={styles.alertRowDate}>09/21/2025</Text>
            </View>
            <View style={styles.rowDivider} />

            <View style={styles.alertRow}>
              <View style={[styles.alertIconCircle, { backgroundColor: '#FFF4F4' }]}>
                <IconSymbol name="exclamationmark.triangle" size={18} color="#E03A2F" />
              </View>
              <View style={styles.alertRowLeft}>
                <Text style={styles.alertRowTitle}>Card over limit</Text>
                <Text style={styles.alertRowSubtitle}>APPLE CARD/GS BANK USA</Text>
              </View>
              <Text style={styles.alertRowDate}>09/07/2025</Text>
            </View>
            <View style={styles.rowDivider} />

            <View style={styles.alertRow}>
              <View style={styles.alertIconCircle}>
                <IconSymbol name="megaphone" size={18} color="#0B6BD3" />
              </View>
              <View style={styles.alertRowLeft}>
                <Text style={styles.alertRowTitle}>New credit inquiry</Text>
                <Text style={styles.alertRowSubtitle}>JPMCB CARD SERVICES</Text>
              </View>
              <Text style={styles.alertRowDate}>08/28/2025</Text>
            </View>
            <View style={styles.rowDivider} />

            <View style={styles.alertRow}>
              <View style={styles.alertIconCircle}>
                <IconSymbol name="bookmark" size={18} color="#0B6BD3" />
              </View>
              <View style={styles.alertRowLeft}>
                <Text style={styles.alertRowTitle}>Address change</Text>
              </View>
              <Text style={styles.alertRowDate}>08/20/2025</Text>
            </View>
            <View style={styles.rowDivider} />

            <View style={styles.alertRow}>
              <View style={[styles.alertIconCircle, { backgroundColor: '#FFF4F4' }]}>
                <IconSymbol name="exclamationmark.triangle" size={18} color="#E03A2F" />
              </View>
              <View style={styles.alertRowLeft}>
                <Text style={styles.alertRowTitle}>Card over limit</Text>
                <Text style={styles.alertRowSubtitle}>DISCOVERC</Text>
              </View>
              <Text style={styles.alertRowDate}>08/19/2025</Text>
            </View>
          </View>
        </BottomSheetScrollView>
          </BottomSheet>
        </View>
      )}

      {activeTab === 'offers' && (
        <View style={styles.creditContent}>
          {/* Top (non-scrollable) - Score Meter */}
          <View style={styles.scoreSection}>
            <View style={styles.scoreHeader}>
              <View style={styles.scoreHeaderLeft}>
                {(() => {
                  const currentDate = new Date();
                  const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear().toString().slice(-2)}`;
                  
                  if (accountType === 'business' && profile?.data?.business?.[0]?.name) {
                    return (
                      <View>
                        <Text style={styles.businessName}>
                          {profile.data.business[0].name}
                        </Text>
                        <Text style={styles.scoreDate}>as of {formattedDate}</Text>
                      </View>
                    );
                  }
                  return (
                    <Text style={styles.scoreDate}>As of {formattedDate}</Text>
                  );
                })()}
              </View>
              <TouchableOpacity>
                <Text style={styles.scoreHistory}>See score history {'>'}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Score Type Tabs - Only show for Business */}
            {accountType === 'business' && (
              <View style={styles.scoreTypeTabsContainer}>
                <TouchableOpacity 
                  style={[styles.scoreTypeTab, activeScoreType === 'fsr' && styles.activeScoreTypeTab]}
                  onPress={() => setActiveScoreType('fsr')}
                >
                  <Text style={[styles.scoreTypeTabText, activeScoreType === 'fsr' && styles.activeScoreTypeTabText]}>
                    FSR Score
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.scoreTypeTab, activeScoreType === 'intelliscore' && styles.activeScoreTypeTab]}
                  onPress={() => setActiveScoreType('intelliscore')}
                >
                  <Text style={[styles.scoreTypeTabText, activeScoreType === 'intelliscore' && styles.activeScoreTypeTabText]}>
                    Intelliscore
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Display selected meter */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066CC" />
                <Text style={styles.loadingText}>Loading credit score...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity onPress={refresh} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : accountType === 'personal' ? (
              <CreditScoreGauge 
                score={personalScoreData.score}
                category={getPersonalScoreCategory(personalScoreData.score)}
                change={personalScoreData.change}
                changeDirection={personalScoreData.changeDirection}
                scoreType={personalScoreData.scoreType}
                provider={personalScoreData.provider}
                maxScore={850}
              />
            ) : activeScoreType === 'fsr' ? (
              <CreditScoreGauge 
                score={businessInsights.score || 35}
                category={getFSRRiskCategory(businessInsights.score || 35)}
                change={5}
                scoreType="FSR Score"
                provider="Experian"
                maxScore={100}
              />
            ) : (
              <CreditScoreGauge 
                score={experianDataDestructured?.scoreInformation?.commercialScore?.score || experianDataDestructured?.scoreInformation?.fsrScore?.score || 65}
                category={getIntelliscoreRiskCategory(experianDataDestructured?.scoreInformation?.commercialScore?.score || experianDataDestructured?.scoreInformation?.fsrScore?.score || 65)}
                change={8}
                scoreType="Intelliscore v2"
                provider="Experian"
                maxScore={100}
              />
            )}
          </View>

          {/* Bottom (sheet) */}
        <BottomSheet
            ref={bottomSheetRef}
          index={0}
          snapPoints={offersSnapPoints}
          backgroundStyle={styles.sheetBg}
          handleIndicatorStyle={styles.sheetHandle}
          enablePanDownToClose={false}
          bottomInset={-40}
        >
          <BottomSheetScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <View style={styles.offersHeader}>
            <Text style={styles.offersTitle}>Business Credit Offers</Text>
            <Text style={styles.offersSubtitle}>
              {isLoading 
                ? 'Loading recommendations...' 
                : recommendations?.recommendations?.length 
                  ? `You have ${recommendations.recommendations.length} personalized recommendations`
                  : 'You are qualified for Citibank Business cards'}
            </Text>
            {!isLoading && error && (
              <TouchableOpacity onPress={refresh} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0066CC" />
              <Text style={styles.loadingText}>Loading recommendations...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error loading recommendations: {error}</Text>
              <TouchableOpacity onPress={refresh} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* AI Recommendation Summary - Compact */}
              {(() => {
                // Filter to show only Costco cards by default
                const allCitibankCards = getAllCitibankBusinessCards().filter(card => 
                  card.id === 'costco-anywhere-visa-citi' || 
                  card.id === 'costco-anywhere-visa-business-citi'
                );
                const apiRecommendations = recommendations?.recommendations || [];
                const totalCards = apiRecommendations.length + allCitibankCards.length;
                
                return totalCards > 0 && (
                <View style={styles.aiSummaryCard}>
                  <View style={styles.aiSummaryHeader}>
                    <View style={styles.aiSummaryHeaderLeft}>
                      <IconSymbol name="sparkles" size={20} color="#0066CC" />
                      <Text style={styles.aiSummaryTitle}>
                          {apiRecommendations.length > 0 
                            ? `${apiRecommendations.length} Personalized + ${allCitibankCards.length} Available Cards`
                            : `${allCitibankCards.length} Citibank Business Cards Available`}
                      </Text>
                    </View>
                      {recommendations?.score && (
                      <View style={styles.scoreBadge}>
                          <Text style={styles.scoreText}>{recommendations.score}/100</Text>
                      </View>
                    )}
                  </View>
                </View>
                );
              })()}

              {/* Combine API recommendations with all Citibank business cards */}
              {(() => {
                // Get all Citibank business cards - filter to show only Costco cards by default
                const allCitibankCards = getAllCitibankBusinessCards().filter(card => 
                  card.id === 'costco-anywhere-visa-citi' || 
                  card.id === 'costco-anywhere-visa-business-citi'
                );
                
                // Merge API recommendations with all cards
                const apiRecommendations = recommendations?.recommendations || [];
                // API recommendations use cardId, static cards use both cardId and id - check all
                const apiCardIds = new Set(apiRecommendations.map((r: any) => r.cardId || r.id));
                
                // Helper function to match API recommendation cardName with static card
                const matchCardByName = (cardName: string): CitibankBusinessCard | undefined => {
                  if (!cardName) return undefined;
                  // Normalize card names by removing "Citibank" prefix and extra spaces
                  const normalizeName = (name: string): string => {
                    return name.toLowerCase()
                      .replace(/^citibank\s+/i, '') // Remove "Citibank" prefix
                      .trim()
                      .replace(/\s+/g, ' '); // Normalize spaces
                  };
                  
                  const normalizedApiName = normalizeName(cardName);
                  
                  return allCitibankCards.find(card => {
                    const normalizedCardName = normalizeName(card.cardName);
                    // Check for exact match after normalization
                    return normalizedCardName === normalizedApiName;
                  });
                };
                
                // Enrich API recommendations with static card data
                const enrichedRecommendations = apiRecommendations.map((rec: any) => {
                  const matchedCard = matchCardByName(rec.cardName);
                  if (matchedCard) {
                    // Merge API recommendation with static card data
                    // API data (cardId, cardName, reason, suggestedUsage, fitScore) takes precedence
                    const enriched = {
                      ...matchedCard,
                      ...rec, // API data overrides static data
                      // Preserve static card's id if API doesn't have one
                      id: rec.id || matchedCard.id,
                      // Ensure cardId is set (use API cardId if available, otherwise static cardId)
                      cardId: rec.cardId || matchedCard.cardId || matchedCard.id,
                      // Preserve API cardName
                      cardName: rec.cardName || matchedCard.cardName,
                    };
                    return enriched;
                  }
                  return rec;
                });
                
                // Add all Citibank business cards that aren't already in recommendations
                // Also check by cardName to avoid duplicates when API recommendations are enriched with static card data
                const enrichedCardNames = new Set(
                  enrichedRecommendations.map((r: any) => r.cardName?.toLowerCase().trim())
                );
                const mergedCards: (CitibankBusinessCard | any)[] = [...enrichedRecommendations];
                console.log('📋 All Citibank cards count:', allCitibankCards.length);
                console.log('📋 All Citibank card IDs:', allCitibankCards.map(c => c.id));
                
                allCitibankCards.forEach(card => {
                  // Check if card is already in API recommendations by comparing:
                  // 1. cardId/id match
                  // 2. cardName match (to catch enriched recommendations)
                  const cardIdToCheck = card.cardId || card.id;
                  const cardNameLower = card.cardName?.toLowerCase().trim();
                  const isDuplicate = 
                    apiCardIds.has(cardIdToCheck) || 
                    apiCardIds.has(card.id) ||
                    (cardNameLower && enrichedCardNames.has(cardNameLower));
                  
                  if (!isDuplicate) {
                    mergedCards.push(card);
                    console.log('✅ Added card to mergedCards:', card.cardName, 'ID:', card.id);
                  } else {
                    console.log('⚠️ Skipped duplicate card:', card.cardName, 'ID:', card.id);
                  }
                });
                
                console.log('📋 Total merged cards:', mergedCards.length);
                
                // Extract approval data once for all cards
                const approvalData = extractApprovalData(profile, experianData, recommendations);
                
                // Calculate approval scores for all cards and sort by score (highest first)
                const cardsWithScores = mergedCards.map((rec: any) => {
                  const cardProfile: CitibankCardProfile = {
                    cardName: rec.cardName || rec.name || 'Business Credit Card',
                    difficultyRating: rec.difficultyRating || 'Medium',
                    minPersonalFico: rec.minPersonalFico || 680,
                    minBusinessRevenue: rec.minBusinessRevenue,
                    minBusinessAge: rec.minBusinessAge || 6,
                    expectedApprovalCLRange: rec.expectedApprovalCLRange,
                    subDifficultyIndex: rec.subDifficultyIndex,
                    rewardCategoryAlignment: rec.rewardCategoryAlignment || [],
                    underwriterToleranceLevel: rec.underwriterToleranceLevel || 'Medium',
                  };
                  
                  const approvalResult = calculateCitibankApprovalLikelihood(
                    approvalData.personal,
                    approvalData.business,
                    approvalData.spend,
                    cardProfile
                  );
                  
                  return {
                    ...rec,
                    approvalResult,
                    approvalScore: approvalResult.likelihoodScore,
                  };
                });
                
                // Separate API recommendations from static cards
                const apiCards: any[] = [];
                const staticCards: any[] = [];
                
                console.log('📊 Total cards with scores:', cardsWithScores.length);
                console.log('📊 Card IDs:', cardsWithScores.map((c: any) => c.id || c.cardId));
                
                cardsWithScores.forEach((card: any) => {
                  // Check if it's an API recommendation (UUID cardId)
                  const isApiRecommendation = card.cardId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(card.cardId);
                  if (isApiRecommendation) {
                    apiCards.push(card);
                  } else {
                    // For static cards, filter out "Declined by Rule"
                    // Always include Costco cards
                    const isCostcoCard = card.id === 'costco-anywhere-visa-citi' || card.id === 'costco-anywhere-visa-business-citi';
                    if (isCostcoCard || card.approvalResult?.recommendation !== 'Declined by Rule') {
                      staticCards.push(card);
                      console.log('✅ Added static card:', card.cardName || card.name, 'ID:', card.id);
                    } else {
                      console.log('❌ Filtered out card:', card.cardName || card.name, 'Reason:', card.approvalResult?.recommendation);
                    }
                  }
                });
                
                console.log('📊 API cards:', apiCards.length);
                console.log('📊 Static cards:', staticCards.length);
                
                // Sort API recommendations by fitScore (descending), then by approval score
                apiCards.sort((a, b) => {
                  const aFitScore = a.fitScore || 0;
                  const bFitScore = b.fitScore || 0;
                  if (bFitScore !== aFitScore) {
                    return bFitScore - aFitScore;
                  }
                  return b.approvalScore - a.approvalScore;
                });
                
                // Sort static cards by approval score (descending), then by fitScore
                staticCards.sort((a, b) => {
                  if (b.approvalScore !== a.approvalScore) {
                    return b.approvalScore - a.approvalScore;
                  }
                  const aFitScore = a.fitScore || 0;
                  const bFitScore = b.fitScore || 0;
                  return bFitScore - aFitScore;
                });
                
                // Combine: API recommendations first, then static cards
                // Ensure Costco cards are always included
                const costcoCards = cardsWithScores.filter((card: any) => 
                  card.id === 'costco-anywhere-visa-citi' || 
                  card.id === 'costco-anywhere-visa-business-citi'
                );
                
                // Remove Costco cards from staticCards if they're already there, then add them at the end
                const staticCardsWithoutCostco = staticCards.filter((card: any) => 
                  card.id !== 'costco-anywhere-visa-citi' && 
                  card.id !== 'costco-anywhere-visa-business-citi'
                );
                
                const filteredCards = [...apiCards, ...staticCardsWithoutCostco, ...costcoCards];
                
                console.log('📊 Final filtered cards count:', filteredCards.length);
                console.log('📊 Final card names:', filteredCards.map((c: any) => c.cardName || c.name));
                
                return filteredCards.length > 0 ? (
                  filteredCards.map((rec: any, index: number) => {
                    // Use the pre-calculated approval result
                    const approvalResult = rec.approvalResult;
                    const displayFitScore = rec.fitScore || (approvalResult.likelihoodScore / 100);
                  
                  // Use cardId as key (unique UUID for API recommendations, or id for static cards)
                  // Fallback to index if neither exists
                  const uniqueKey = rec.cardId || rec.id || `card-${index}`;
                  
                  return (
                  <View key={uniqueKey} style={styles.businessOfferCard}>
                    {/* Top Recommendation Badge for highest scores */}
                    {index === 0 && approvalResult.likelihoodScore >= 75 && (
                      <View style={styles.topRecommendationBadge}>
                        <IconSymbol name="star.fill" size={16} color="#FFD700" />
                        <Text style={styles.topRecommendationText}>Top Recommendation</Text>
                      </View>
                    )}
                    
                    <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                      <Image
                        source={
                          rec.cardImage && typeof rec.cardImage === 'object' 
                            ? rec.cardImage 
                            : rec.cardImage && typeof rec.cardImage === 'string' && rec.cardImage.startsWith('http')
                            ? { uri: rec.cardImage }
                            : getCardImageSource(rec.id || rec.cardId || '', index)
                        }
                        style={styles.cardImage}
                      />
                      <View style={{flex: 1}}>
                        <View style={styles.businessCardHeader}>
                          {(rec.fitScore || displayFitScore) && (
                            <View style={styles.fitScoreBadge}>
                              <Text style={styles.fitScoreText}>{((rec.fitScore || displayFitScore) * 100).toFixed(0)}% Match</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.businessCardTitle}>{rec.cardName || rec.name || 'Business Credit Card'}</Text>
                        <Text style={styles.businessCardSubtitle}>Citibank Business Credit Card</Text>
                      </View>
                    </View>
                    
                    {/* Approval Likelihood Score - Temporarily Removed */}
                    {/* <View style={styles.approvalScoreCard}>
                      <View style={styles.approvalScoreHeader}>
                        <View style={styles.approvalScoreHeaderLeft}>
                          <IconSymbol name="chart.bar.fill" size={18} color="#0066CC" />
                          <Text style={styles.approvalScoreTitle}>Approval Likelihood</Text>
                        </View>
                        <View style={[
                          styles.approvalScoreBadge,
                          approvalResult.likelihoodScore >= 75 && { backgroundColor: '#34C759' },
                          approvalResult.likelihoodScore >= 55 && approvalResult.likelihoodScore < 75 && { backgroundColor: '#FF9500' },
                          approvalResult.likelihoodScore < 55 && { backgroundColor: '#E31837' },
                        ]}>
                          <Text style={styles.approvalScoreValue}>{approvalResult.likelihoodScore}/100</Text>
                        </View>
                      </View>
                      <View style={styles.approvalRecommendation}>
                        <Text style={[
                          styles.approvalRecommendationText,
                          approvalResult.recommendation === 'Strongly Recommended' && { color: '#34C759' },
                          approvalResult.recommendation === 'Viable with Conditions' && { color: '#FF9500' },
                          approvalResult.recommendation === 'Not Recommended' && { color: '#E31837' },
                        ]}>
                          {approvalResult.recommendation}
                        </Text>
                      </View>
                      {approvalResult.cardSpecificDetails?.expectedApprovalLimit && (
                        <Text style={styles.expectedLimitText}>
                          Expected Credit Limit: ${approvalResult.cardSpecificDetails.expectedApprovalLimit.min.toLocaleString()} - ${approvalResult.cardSpecificDetails.expectedApprovalLimit.max.toLocaleString()}
                        </Text>
                      )}
                    </View> */}

                    {/* Positive Factors - Temporarily Removed */}
                    {/* {approvalResult.positiveFactors.length > 0 && (
                      <View style={styles.factorsContainer}>
                        <Text style={styles.factorsTitle}>Positive Factors</Text>
                        {approvalResult.positiveFactors.slice(0, 3).map((factor, idx) => (
                          <View key={idx} style={styles.factorItem}>
                            <IconSymbol name="checkmark.circle.fill" size={14} color="#34C759" />
                            <Text style={styles.factorText}>{factor}</Text>
                          </View>
                        ))}
                      </View>
                    )} */}

                    {/* Risk Factors - Temporarily Removed */}
                    {/* {approvalResult.riskFactors.length > 0 && (
                      <View style={styles.factorsContainer}>
                        <Text style={styles.factorsTitle}>Risk Factors</Text>
                        {approvalResult.riskFactors.slice(0, 3).map((factor, idx) => (
                          <View key={idx} style={styles.factorItem}>
                            <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#E31837" />
                            <Text style={styles.factorText}>{factor}</Text>
                          </View>
                        ))}
                      </View>
                    )} */}
                    
                    <View style={styles.offerDetails}>
                      {/* Key Highlights - Collapsible */}
                      {rec.reason && (
                        <TouchableOpacity 
                          style={styles.collapsibleSection}
                          onPress={() => {
                            const key = `reason_${index}`;
                            setExpandedCards((prev: any) => ({
                              ...prev,
                              [key]: !prev[key],
                            }));
                          }}>
                          <View style={styles.collapsibleHeader}>
                            <View style={styles.collapsibleHeaderLeft}>
                              <IconSymbol name="lightbulb.fill" size={16} color="#0066CC" />
                              <Text style={styles.collapsibleTitle}>Why Recommended</Text>
                            </View>
                            <IconSymbol 
                              name={expandedCards[`reason_${index}` as keyof typeof expandedCards] ? 'chevron.up' : 'chevron.down'} 
                              size={16} 
                              color="#666" 
                            />
                          </View>
                          {expandedCards[`reason_${index}` as keyof typeof expandedCards] && (
                            <Text style={styles.collapsibleText} numberOfLines={0}>
                              {cleanMarkdownText(rec.reason)}
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}

                      {/* Bonus Offer - Always Visible */}
                      {rec.bonusOffer && (
                        <View style={styles.bonusRow}>
                          <View style={styles.bonusIconContainer}>
                            <IconSymbol name="gift.fill" size={20} color="#0066CC" />
                          </View>
                          <View style={styles.bonusContent}>
                            <Text style={styles.bonusAmount}>{rec.bonusOffer.amount || 'Earn $750'}</Text>
                            <Text style={styles.bonusCondition}>{rec.bonusOffer.condition || 'After qualifying purchases'}</Text>
                          </View>
                        </View>
                      )}
                      
                      {/* Top 3 Benefits Only */}
                      {rec.benefits && rec.benefits.length > 0 && (
                        <View style={styles.benefitsList}>
                          {rec.benefits.slice(0, 3).map((benefit: string, idx: number) => (
                            <View key={idx} style={styles.benefitItem}>
                              <IconSymbol name="checkmark.circle.fill" size={14} color="#34C759" />
                              <Text style={styles.benefitText}>{benefit}</Text>
                            </View>
                          ))}
                          {rec.benefits.length > 3 && (
                            <Text style={styles.moreBenefitsText}>+{rec.benefits.length - 3} more benefits</Text>
                          )}
                        </View>
                      )}

                      {/* Suggested Usage - Collapsible */}
                      {rec.suggestedUsage && (
                        <TouchableOpacity 
                          style={styles.collapsibleSection}
                          onPress={() => {
                            const key = `usage_${index}`;
                            setExpandedCards((prev: any) => ({
                              ...prev,
                              [key]: !prev[key],
                            }));
                          }}>
                          <View style={styles.collapsibleHeader}>
                            <View style={styles.collapsibleHeaderLeft}>
                              <IconSymbol name="info.circle.fill" size={16} color="#FF9500" />
                              <Text style={styles.collapsibleTitle}>Usage Tips</Text>
                            </View>
                            <IconSymbol 
                              name={expandedCards[`usage_${index}` as keyof typeof expandedCards] ? 'chevron.up' : 'chevron.down'} 
                              size={16} 
                              color="#666" 
                            />
                          </View>
                          {expandedCards[`usage_${index}` as keyof typeof expandedCards] && (
                            <Text style={styles.collapsibleText} numberOfLines={0}>
                              {cleanMarkdownText(rec.suggestedUsage)}
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity 
                        style={[
                          styles.offerButton,
                          (rec.hasApplied || rec.applicationStatus === 'APPLIED') && styles.offerButtonDisabled
                        ]}
                        disabled={rec.hasApplied || rec.applicationStatus === 'APPLIED'}
                        onPress={() => {
                          // Use cardId (preferred) or fallback to id
                          // API recommendations have cardId (UUID), static cards have cardId (string)
                          const cardId = rec.cardId || rec.id;
                          const cardName = rec.cardName || rec.name;
                          // Get card-specific application URL
                          const applyUrl = rec.applyUrl || getCardApplyUrl(cardId, cardName) || undefined;
                          handleApplyNow(cardId, applyUrl);
                        }}
                      >
                        <Text style={[
                          styles.offerButtonText,
                          (rec.hasApplied || rec.applicationStatus === 'APPLIED') && styles.offerButtonTextDisabled
                        ]}>
                          {(rec.hasApplied || rec.applicationStatus === 'APPLIED') ? 'Already Applied' : 'Apply Now'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.detailsButton}
                        onPress={async () => {
                          const detailsUrl = rec.detailsUrl || getCardDetailsUrl(rec.cardId || rec.id, rec.cardName || rec.name);
                          if (detailsUrl) {
                            const supported = await Linking.canOpenURL(detailsUrl);
                            if (supported) {
                              await Linking.openURL(detailsUrl);
                            }
                          }
                        }}
                      >
                        <Text style={styles.detailsButtonText}>Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  );
                })
                ) : null;
              })()}
              
              {/* Show message if no cards available at all */}
              {!isLoading && !error && (!recommendations?.recommendations || recommendations.recommendations.length === 0) && getAllCitibankBusinessCards().length === 0 && (
                <View style={styles.noRecommendationsContainer}>
                  <IconSymbol name="info.circle" size={48} color="#8E8E93" />
                  <Text style={styles.noRecommendationsText}>No credit cards available</Text>
                  <Text style={styles.noRecommendationsSubtext}>
                    Please check back later or contact support for assistance.
                  </Text>
                </View>
              )}
            </>
          )}
        </BottomSheetScrollView>
          </BottomSheet>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0066CC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scaleVertical(12),
    position: 'relative',
    marginBottom: scaleVertical(8),
  },
  accountTypeContainer: {
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingBottom: scaleVertical(12),
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: scale(8),
    padding: scale(4),
    width: '100%',
    maxWidth: scale(300),
  },
  segmentButton: {
    flex: 1,
    paddingVertical: scaleVertical(8),
    paddingHorizontal: scale(16),
    borderRadius: scale(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: 'white',
  },
  segmentButtonText: {
    fontSize: scaleFont(15),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  segmentButtonTextActive: {
    color: '#0066CC',
  },
  backButton: {
    padding: scale(8),
  },
  headerTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'absolute',
    left: scale(60),
    padding: scale(8),
  },
  notificationBadge: {
    position: 'absolute',
    top: scale(4),
    right: scale(4),
    backgroundColor: '#0066CC',
    borderRadius: scale(10),
    width: scale(20),
    height: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: scaleFont(12),
    fontWeight: 'bold',
  },
  moreButton: {
    padding: scale(8),
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    paddingBottom: scaleVertical(16),
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: scale(16),
    paddingVertical: scaleVertical(8),
    marginRight: scale(8),
    borderRadius: scale(20),
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  tabText: {
    color: 'white',
    fontSize: scaleFont(16),
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0066CC',
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    marginBottom: scaleVertical(12),
  },
  quickLabel: {
    color: '#666666',
    fontSize: scaleFont(14),
    opacity: 0.9,
  },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: scale(18),
    paddingHorizontal: scale(12),
    paddingVertical: scaleVertical(6),
  },
  quickPillText: {
    color: '#0066CC',
    fontSize: scaleFont(14),
    marginLeft: scale(6),
    fontWeight: '600',
  },
  quickBadge: {
    marginLeft: scale(8),
    backgroundColor: '#0066CC',
    borderRadius: scale(10),
    width: scale(20),
    height: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBadgeText: {
    color: 'white',
    fontSize: scaleFont(12),
    fontWeight: '700',
  },
  alertBadge: {
    position: 'absolute',
    top: scale(-6),
    right: scale(2),
    backgroundColor: '#0066CC',
    borderRadius: scale(8),
    width: scale(16),
    height: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  alertCount: {
    color: 'white',
    fontSize: scaleFont(10),
    fontWeight: '700',
    lineHeight: scaleFont(10),
  },
  creditContent: {
    flex: 1,
  },
  scoreSection: {
    paddingHorizontal: scale(16),
    paddingBottom: scaleVertical(48),
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleVertical(8),
  },
  scoreHeaderLeft: {
    flex: 1,
  },
  businessName: {
    color: 'white',
    fontSize: scaleFont(14),
    fontWeight: '600',
  },
  scoreDate: {
    color: 'white',
    fontSize: scaleFont(14),
  },
  scoreHistory: {
    color: '#66B3FF',
    fontSize: scaleFont(14),
  },
  gaugeContainer: {
    alignItems: 'center',
    marginTop: scaleVertical(-60),
    marginBottom: scaleVertical(16),
    paddingVertical: scaleVertical(10),
  },
  metersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(10),
    marginBottom: scaleVertical(8),
  },
  meterWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scale(5),
  },
  scoreTypeTabsContainer: {
    flexDirection: 'row',
    position: 'relative',
    zIndex: 0,
    justifyContent: 'center',
    paddingHorizontal: scale(16),
    marginBottom: scaleVertical(8),
    marginTop: scaleVertical(10),
  },
  scoreTypeTab: {
    paddingHorizontal: scale(24),
    paddingVertical: scaleVertical(10),
    marginHorizontal: scale(8),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeScoreTypeTab: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  scoreTypeTabText: {
    color: 'white',
    fontSize: scaleFont(16),
    fontWeight: '500',
  },
  activeScoreTypeTabText: {
    color: '#0066CC',
    fontWeight: '600',
  },
  scoreInfo: {
    alignItems: 'center',
    marginTop: scaleVertical(-112),
  },
  scoreCategory: {
    color: 'white',
    fontSize: scaleFont(18),
    fontWeight: '500',
    marginBottom: scaleVertical(2),
  },
  scoreValue: {
    color: 'white',
    fontSize: scaleFont(40),
    fontWeight: 'bold',
    marginBottom: scaleVertical(8),
  },
  scoreChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreChangeText: {
    color: '#34C759',
    fontSize: scaleFont(18),
    marginLeft: scale(4),
    fontWeight: '600',
  },
  noChangeText: {
    color: '#999999',
    fontSize: scaleFont(16),
    marginTop: scaleVertical(4),
    fontWeight: '500',
  },
  approvalScoreCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: scaleVertical(12),
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  approvalScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleVertical(8),
  },
  approvalScoreHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approvalScoreTitle: {
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: '#0066CC',
    marginLeft: scale(8),
  },
  approvalScoreBadge: {
    backgroundColor: '#0066CC',
    paddingHorizontal: scale(12),
    paddingVertical: scaleVertical(6),
    borderRadius: scale(16),
    minWidth: scale(70),
    alignItems: 'center',
  },
  approvalScoreValue: {
    color: 'white',
    fontSize: scaleFont(16),
    fontWeight: '700',
  },
  approvalRecommendation: {
    marginTop: scaleVertical(4),
  },
  approvalRecommendationText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#0066CC',
  },
  expectedLimitText: {
    fontSize: scaleFont(13),
    color: '#666666',
    marginTop: scaleVertical(8),
    fontWeight: '500',
  },
  factorsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: scale(8),
    padding: scale(12),
    marginBottom: scaleVertical(12),
  },
  factorsTitle: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#333333',
    marginBottom: scaleVertical(8),
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleVertical(6),
  },
  factorText: {
    fontSize: scaleFont(13),
    color: '#333333',
    marginLeft: scale(8),
    flex: 1,
  },
  topRecommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scaleVertical(6),
    marginBottom: scaleVertical(12),
    alignSelf: 'flex-start',
  },
  topRecommendationText: {
    fontSize: scaleFont(13),
    fontWeight: '700',
    color: '#B8860B',
    marginLeft: scale(6),
  },
  scoreFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scaleVertical(10),
    marginBottom: scaleVertical(64),
  },
  scoreProvider: {
    color: 'white',
    fontSize: scaleFont(14),
    marginRight: scale(8),
  },
  sheetBg: {
    backgroundColor: 'white',
    borderTopLeftRadius: scale(22),
    borderTopRightRadius: scale(22),
  },
  sheetHandle: {
    backgroundColor: '#E5E5E5',
  },
  sheetContent: {
    paddingHorizontal: scale(0),
    paddingBottom: scaleVertical(200),
  },
  breakdownCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    paddingTop: scaleVertical(12),
    paddingHorizontal: scale(16),
    paddingBottom: scaleVertical(20),
    marginTop: scaleVertical(0),
    shadowColor: '#000',
    shadowOffset: { width: scale(0), height: -1 },
    shadowOpacity: 0.06,
    shadowRadius: scale(8),
  },
  breakdownTabsContainer: {
    alignItems: 'center',
    marginBottom: scaleVertical(8),
  },
  segmentedTabs: {
    flexDirection: 'row',
    backgroundColor: '#F2F4F7',
    borderRadius: scale(24),
    padding: scale(4),
  },
  segmentTab: {
    paddingHorizontal: scale(18),
    paddingVertical: scaleVertical(8),
    borderRadius: scale(20),
  },
  activeSegmentTab: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  segmentTabText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#666666',
  },
  activeSegmentTabText: {
    color: '#0066CC',
  },
  insightsCard: {
    backgroundColor: 'white',
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: scale(16),
    marginBottom: scaleVertical(16),
  },
  insightsTitle: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#000',
    marginBottom: scaleVertical(8),
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scaleVertical(10),
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  insightLabel: {
    fontSize: scaleFont(14),
    color: '#111',
  },
  insightValue: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#0B6BD3',
  },
  insightBadge: {
    fontSize: scaleFont(12),
    paddingHorizontal: scale(8),
    paddingVertical: scaleVertical(4),
    borderRadius: scale(12),
    overflow: 'hidden',
    color: 'white',
  },
  badgeWarn: { backgroundColor: '#FF6B35' },
  badgeOk: { backgroundColor: '#34C759' },
  insightFootnote: {
    fontSize: scaleFont(12),
    color: '#6B7280',
    marginTop: scaleVertical(8),
  },
  overviewContent: {
    flex: 1,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scaleVertical(12),
    paddingVertical: scaleVertical(4),
  },
  sectionTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: '#000000',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  chevronIcon: {
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  changeList: {
    marginBottom: scaleVertical(16),
  },
  changeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scaleVertical(12),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  changeDescription: {
    flex: 1,
    fontSize: scaleFont(16),
    color: '#333333',
    marginRight: scale(16),
  },
  changeImpact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changePoints: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#34C759',
    marginLeft: scale(4),
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: scale(12),
    borderRadius: scale(8),
    borderLeftWidth: scale(4),
    borderLeftColor: '#E31837',
  },
  breakdownContent: {
    flex: 1,
    paddingTop: 0,
  },
  factorsHeader: {
    marginBottom: scaleVertical(8),
  },
  factorsSubtitle: {
    fontSize: scaleFont(14),
    color: '#666666',
    lineHeight: scaleFont(20),
  },
  factorsList: {
    flex: 1,
  },
  factorIcon: {
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    marginRight: scale(12),
  },
  factorContent: {
    flex: 1,
  },
  factorName: {
    fontSize: scaleFont(16),
    fontWeight: '500',
    color: '#000000',
    marginBottom: scaleVertical(4),
  },
  factorImpact: {
    fontSize: scaleFont(14),
    color: '#0066CC',
  },
  alertsSection: {
    backgroundColor: 'white',
  },
  alertsHeaderList: {
    paddingHorizontal: scale(16),
    paddingTop: scaleVertical(16),
    paddingBottom: scaleVertical(8),
  },
  alertInboxTitle: {
    fontSize: scaleFont(28),
    fontWeight: '800',
    color: '#000000',
  },
  alertList: {
    paddingHorizontal: scale(16),
    paddingBottom: scaleVertical(24),
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleVertical(14),
  },
  rowDivider: {
    height: scale(1),
    backgroundColor: '#EDEDED',
  },
  alertIconCircle: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#F2F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  alertRowLeft: {
    flex: 1,
  },
  alertRowTitle: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: '#111111',
  },
  alertRowSubtitle: {
    fontSize: scaleFont(13),
    color: '#8A8A8E',
    marginTop: scaleVertical(2),
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  alertRowDate: {
    fontSize: scaleFont(14),
    color: '#8A8A8E',
    marginLeft: scale(8),
  },
  unreadPill: {
    paddingHorizontal: scale(10),
    paddingVertical: scaleVertical(4),
    backgroundColor: '#E8F1FF',
    borderRadius: scale(14),
    marginRight: scale(8),
  },
  unreadText: {
    color: '#0B6BD3',
    fontSize: scaleFont(12),
    fontWeight: '700',
  },
  alertCard: {
    backgroundColor: 'white',
    marginHorizontal: scale(16),
    marginBottom: scaleVertical(16),
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleVertical(8),
  },
  alertType: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    color: '#666666',
    marginLeft: scale(8),
    textTransform: 'uppercase',
  },
  alertTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: scaleVertical(8),
  },
  alertDescription: {
    fontSize: scaleFont(14),
    color: '#333333',
    lineHeight: scaleFont(20),
    marginBottom: scaleVertical(8),
  },
  alertDate: {
    fontSize: scaleFont(12),
    color: '#666666',
  },
  offersSection: {
    backgroundColor: 'white',
  },
  offersHeader: {
    paddingHorizontal: scale(16),
    paddingTop: 16,
    paddingBottom: 12,
  },
  offersTitle: {
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: scaleVertical(8),
  },
  offersSubtitle: {
    fontSize: scaleFont(16),
    color: '#666666',
  },
  offerCard: {
    backgroundColor: 'white',
    marginHorizontal: scale(16),
    marginBottom: scaleVertical(16),
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleVertical(8),
  },
  offerType: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    color: '#666666',
    marginLeft: scale(8),
    textTransform: 'uppercase',
  },
  offerTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: scaleVertical(8),
  },
  offerDescription: {
    fontSize: scaleFont(14),
    color: '#333333',
    lineHeight: scaleFont(20),
    marginBottom: scaleVertical(16),
  },
  offerButton: {
    flex: 1,
    backgroundColor: '#0066CC',
    paddingVertical: scaleVertical(12),
    paddingHorizontal: scale(24),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  offerButtonText: {
    color: 'white',
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
  offerButtonTextDisabled: {
    color: '#666666',
  },
  qualifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    marginHorizontal: scale(16),
    marginBottom: scaleVertical(16),
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#D4E6F1',
  },
  bannerText: {
    marginLeft: scale(12),
    flex: 1,
  },
  bannerTitle: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: scaleVertical(4),
  },
  bannerSubtitle: {
    fontSize: scaleFont(13),
    color: '#4A5568',
    lineHeight: scaleFont(18),
  },
  businessOfferCard: {
    backgroundColor: 'white',
    marginHorizontal: scale(16),
    marginBottom: scaleVertical(16),
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 2,
  },
  cardImage: {
    width: scale(100),
    height: scale(65),
    borderRadius: scale(8),
    marginRight: scale(12),
    resizeMode: 'cover',
  },
  businessCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleVertical(12),
  },
  businessCardBadge: {
    fontSize: scaleFont(10),
    fontWeight: '800',
    color: '#FFB81C',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  businessCardBadgeSecondary: {
    fontSize: scaleFont(10),
    fontWeight: '800',
    color: '#0066CC',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  businessCardTitle: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: '#000000',
    marginBottom: scaleVertical(4),
  },
  businessCardSubtitle: {
    fontSize: scaleFont(14),
    color: '#666666',
    marginBottom: scaleVertical(16),
    lineHeight: scaleFont(20),
  },
  offerDetails: {
    marginBottom: scaleVertical(16),
  },
  detailRow: {
    marginBottom: scaleVertical(8),
  },
  detailLabel: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: '#333333',
  },
  bonusRow: {
    backgroundColor: '#F0F9FF',
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: scaleVertical(12),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  bonusIconContainer: {
    marginRight: scale(12),
  },
  bonusContent: {
    flex: 1,
  },
  bonusAmount: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#0066CC',
    marginBottom: scaleVertical(2),
  },
  bonusCondition: {
    fontSize: scaleFont(12),
    color: '#666666',
    lineHeight: scaleFont(16),
  },
  benefitsList: {
    marginBottom: scaleVertical(12),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleVertical(8),
  },
  benefitText: {
    fontSize: scaleFont(13),
    color: '#333333',
    marginLeft: scale(8),
    flex: 1,
    lineHeight: scaleFont(18),
  },
  lumiqInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: 1.5,
    borderColor: '#0066CC',
    marginTop: scaleVertical(12),
    shadowColor: '#0066CC',
    shadowOffset: { width: scale(0), height: scale(1) },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  lumiqText: {
    fontSize: scaleFont(13),
    color: '#0066CC',
    marginLeft: scale(10),
    flex: 1,
    fontWeight: '600',
    lineHeight: scaleFont(18),
  },
  buttonRow: {
    flexDirection: 'row',
    gap: scale(12),
  },
  detailsButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: scaleVertical(12),
    paddingHorizontal: scale(24),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    color: '#0066CC',
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
  modernCard: {
    backgroundColor: '#ffffff',
    borderRadius: scale(15),
    marginHorizontal: scale(16),
    marginTop: scaleVertical(12),
    marginBottom: scaleVertical(12),
    paddingHorizontal: scale(18),
    paddingVertical: scaleVertical(18),
    shadowColor: '#4A5568',
    shadowOffset: { width: scale(0), height: scale(6) },
    shadowOpacity: 0.07,
    shadowRadius: scale(15),
    elevation: 4,
  },
  modernCardTitle: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: scaleVertical(16),
  },
  cardHeaderWithInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleVertical(16),
    paddingVertical: scaleVertical(4),
  },
  subSectionTitle: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#334155',
    marginTop: scaleVertical(12),
    marginBottom: scaleVertical(10),
  },
  utilizationMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleVertical(16),
  },
  utilizationPercentage: {
    fontSize: scaleFont(36),
    fontWeight: 'bold',
    marginRight: scale(12),
  },
  utilizationBarContainer: {
    flex: 1,
  },
  usageBar: {
    height: scale(12),
    backgroundColor: '#e2e8f0',
    borderRadius: scale(6),
    overflow: 'hidden',
    marginBottom: scaleVertical(4),
  },
  usageBarFill: {
    height: '100%',
    borderRadius: scale(6),
  },
  utilizationRecommendationText: {
    fontSize: scaleFont(13),
    color: '#475569',
    fontWeight: '500',
  },
  utilizationStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: scaleVertical(10),
  },
  utilizationStatItem: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: scale(10),
    borderRadius: scale(8),
    marginBottom: scaleVertical(8),
  },
  utilizationStatItemFull: {
    width: '100%',
    backgroundColor: '#f8fafc',
    padding: scale(10),
    borderRadius: scale(8),
    marginBottom: scaleVertical(8),
  },
  utilizationStatLabel: {
    fontSize: scaleFont(12),
    color: '#64748b',
    marginBottom: scaleVertical(2),
  },
  utilizationStatValue: {
    fontSize: scaleFont(15),
    fontWeight: '600',
    color: '#1E293B',
  },
  topUtilizationAccounts: {
    marginTop: scaleVertical(8),
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scaleVertical(8),
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  accountCategoryText: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#32325D',
  },
  accountBalanceText: {
    fontSize: scaleFont(12),
    color: '#8898AA',
    marginTop: scaleVertical(2),
  },
  accountUtilizationText: {
    fontSize: scaleFont(15),
    fontWeight: '600',
  },
  paymentDistributionSection: {
    marginTop: scaleVertical(16),
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  distributionBars: {
    marginTop: scaleVertical(12),
  },
  distributionBarItem: {
    marginBottom: scaleVertical(12),
  },
  distributionBarWrapper: {
    height: scale(8),
    backgroundColor: '#e2e8f0',
    borderRadius: scale(4),
    overflow: 'hidden',
    marginBottom: scaleVertical(4),
  },
  distributionBarFill: {
    height: '100%',
    borderRadius: scale(4),
  },
  distributionBarLabel: {
    fontSize: scaleFont(12),
    color: '#64748b',
    marginBottom: scaleVertical(2),
  },
  distributionBarValue: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#1E293B',
  },
  industryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleVertical(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  industryInfo: {
    flex: 1,
    marginRight: scale(8),
  },
  industryName: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#334155',
  },
  industryBalance: {
    fontSize: scaleFont(12),
    color: '#64748b',
    marginTop: scaleVertical(2),
  },
  industryOnTimeRate: {
    fontSize: scaleFont(14),
    fontWeight: '600',
  },
  keyFactorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: scaleVertical(16),
  },
  keyFactorItem: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: scaleVertical(12),
    alignItems: 'center',
  },
  keyFactorName: {
    fontSize: scaleFont(13),
    fontWeight: '500',
    color: '#334155',
    marginTop: scaleVertical(8),
    marginBottom: scaleVertical(4),
    textAlign: 'center',
  },
  keyFactorValue: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: scaleVertical(8),
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scaleVertical(4),
    borderRadius: scale(12),
    overflow: 'hidden',
  },
  statusBadgeText: {
    color: 'white',
    fontSize: scaleFont(10),
    fontWeight: '600',
  },
  inquiriesSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scaleVertical(16),
  },
  inquiryStat: {
    alignItems: 'center',
  },
  inquiryStatLabel: {
    fontSize: scaleFont(12),
    color: '#64748b',
    marginBottom: scaleVertical(4),
  },
  inquiryStatValue: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#1E293B',
  },
  chartLabel: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#334155',
    marginBottom: scaleVertical(8),
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: scale(100),
    marginBottom: scaleVertical(16),
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    width: scale(20),
    height: scale(80),
    backgroundColor: '#e2e8f0',
    borderRadius: scale(4),
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    backgroundColor: '#0066CC',
    borderRadius: scale(4),
  },
  barLabel: {
    fontSize: scaleFont(11),
    color: '#64748b',
    marginTop: scaleVertical(4),
  },
  obligationsSummary: {
    marginBottom: scaleVertical(16),
  },
  obligationsTotalValue: {
    fontSize: scaleFont(28),
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: scaleVertical(4),
  },
  obligationsSubText: {
    fontSize: scaleFont(14),
    color: '#64748b',
  },
  recommendedLimitBox: {
    backgroundColor: '#f0f9ff',
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: scaleVertical(16),
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  recommendedLimitLabel: {
    fontSize: scaleFont(12),
    color: '#0369a1',
    marginBottom: scaleVertical(4),
  },
  recommendedLimitValue: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: '#0369a1',
  },
  obligationAccountItem: {
    marginBottom: scaleVertical(16),
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  obligationAccountName: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#334155',
  },
  accountStatusTag: {
    paddingHorizontal: scale(8),
    paddingVertical: scaleVertical(4),
    borderRadius: scale(4),
  },
  accountStatusTagText: {
    fontSize: scaleFont(11),
    fontWeight: '600',
  },
  activeTag: {
    backgroundColor: '#dcfce7',
  },
  activeTagText: {
    color: '#16a34a',
  },
  closedTag: {
    backgroundColor: '#f1f5f9',
  },
  closedTagText: {
    color: '#64748b',
  },
  accountDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scaleVertical(8),
  },
  progressBarContainer: {
    flex: 1,
    height: scale(8),
    backgroundColor: '#e2e8f0',
    borderRadius: scale(4),
    marginRight: scale(12),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: scale(4),
    backgroundColor: '#0066CC',
  },
  balanceText: {
    fontSize: scaleFont(13),
    fontWeight: '500',
    color: '#475569',
  },
  noDataText: {
    textAlign: 'center',
    color: '#64748b',
    fontStyle: 'italic',
    paddingVertical: scaleVertical(10),
  },
  loadingContainer: {
    padding: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: scaleVertical(16),
    fontSize: scaleFont(16),
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    padding: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: scaleFont(16),
    color: '#E31837',
    textAlign: 'center',
    marginBottom: scaleVertical(16),
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: scale(24),
    paddingVertical: scaleVertical(12),
    borderRadius: scale(8),
  },
  retryButtonText: {
    color: 'white',
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
  // AI Summary Card Styles
  aiSummaryCard: {
    backgroundColor: '#F0F9FF',
    marginHorizontal: scale(16),
    marginBottom: scaleVertical(12),
    padding: scale(14),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  aiSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiSummaryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiSummaryTitle: {
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: '#0066CC',
    marginLeft: scale(8),
  },
  scoreBadge: {
    backgroundColor: '#0066CC',
    paddingHorizontal: scale(10),
    paddingVertical: scaleVertical(4),
    borderRadius: scale(12),
  },
  scoreText: {
    color: 'white',
    fontSize: scaleFont(11),
    fontWeight: '700',
  },
  // Fit Score Badge
  fitScoreBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: scale(10),
    paddingVertical: scaleVertical(4),
    borderRadius: scale(12),
    marginLeft: scale(8),
  },
  fitScoreText: {
    color: 'white',
    fontSize: scaleFont(11),
    fontWeight: '700',
  },
  // Collapsible Sections
  collapsibleSection: {
    backgroundColor: '#F9FAFB',
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: scaleVertical(12),
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsibleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  collapsibleTitle: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: '#333333',
    marginLeft: scale(8),
  },
  collapsibleText: {
    fontSize: scaleFont(13),
    color: '#333333',
    lineHeight: scaleFont(20),
    marginTop: scaleVertical(8),
    flexWrap: 'wrap',
  },
  moreBenefitsText: {
    fontSize: scaleFont(12),
    color: '#0066CC',
    fontWeight: '600',
    marginTop: scaleVertical(4),
    marginLeft: scale(22),
  },
  // No Recommendations Container
  noRecommendationsContainer: {
    padding: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  noRecommendationsText: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: '#4A5568',
    marginTop: scaleVertical(16),
    marginBottom: scaleVertical(8),
    textAlign: 'center',
  },
  noRecommendationsSubtext: {
    fontSize: scaleFont(14),
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: scaleFont(20),
  },
});

