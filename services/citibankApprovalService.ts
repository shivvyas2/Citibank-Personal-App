/**
 * Citibank Business Credit Card Approval Likelihood Calculator
 * Implements comprehensive underwriting rules and scoring for all Citibank business cards
 */

export interface PersonalCreditData {
  ficoScore?: number;
  experianFico8?: number;
  equifaxFico?: number;
  transUnionFico?: number;
  utilization?: number;
  recentHardInquiries90Days?: number;
  pastCitibankRelationship?: boolean;
  citibank524Count?: number;
  citibank230Count?: number;
  citibankBusiness130Count?: number;
  existingCitibankCreditLimit?: number;
  currentCitibankUtilization?: number;
  bureauUnfrozen?: {
    experian?: boolean;
    equifax?: boolean;
    transUnion?: boolean;
  };
}

export interface BusinessCreditData {
  intelliscore?: number;
  businessAgeMonths?: number;
  businessAnnualRevenue?: number;
  monthlyRevenueConsistency?: boolean;
  businessType?: 'LLC' | 'Corp' | 'Sole Prop';
  einVerified?: boolean;
  addressMatch?: boolean;
  kycPass?: boolean;
  naicsIndustryRiskTier?: 'Low' | 'Medium' | 'High';
  businessProfitability?: boolean;
  depositRelationshipWithCitibank?: boolean;
  paymentBehavior?: {
    overdrafts?: number;
    nsf?: number;
    avgDailyBalance?: number;
  };
}

export interface SpendProfile {
  projectedSpend6Months?: number;
  canMeetSUBRequirement?: boolean;
  travelSpendProfile?: 'Low' | 'Med' | 'High';
  advertisingSpendProfile?: 'Low' | 'Med' | 'High';
}

export interface CitibankCardProfile {
  cardName: string;
  difficultyRating: 'Easy' | 'Medium' | 'Hard';
  minPersonalFico?: number;
  minBusinessRevenue?: number;
  minBusinessAge?: number;
  expectedApprovalCLRange?: { min: number; max: number };
  subDifficultyIndex?: number;
  rewardCategoryAlignment?: string[];
  underwriterToleranceLevel?: 'High' | 'Medium' | 'Low';
}

export interface ApprovalLikelihoodResult {
  recommendation: 'Strongly Recommended' | 'Viable with Conditions' | 'Not Recommended' | 'Declined by Rule';
  likelihoodScore: number; // 0-100
  reasoning: string[];
  stage1Blocked: boolean;
  blockedReasons: string[];
  riskFactors: string[];
  positiveFactors: string[];
  cardSpecificDetails?: {
    expectedApprovalLimit?: { min: number; max: number };
    subFeasibility?: boolean;
    spendFitScore?: number;
  };
}

/**
 * Normalize values to 0-1 scale
 */
function normalizeValue(value: number, min: number, max: number): number {
  if (value < min) return 0;
  if (value > max) return 1;
  return (value - min) / (max - min);
}

/**
 * Normalize FICO score (300-850 → 0-1)
 */
function normalizeFico(fico: number): number {
  return normalizeValue(fico, 300, 850);
}

/**
 * Normalize Intelliscore (0-100 → 0-1)
 */
function normalizeIntelliscore(score: number): number {
  return normalizeValue(score, 0, 100);
}

/**
 * Normalize business age (optimal at 24 months)
 */
function normalizeBusinessAge(ageMonths: number): number {
  if (ageMonths >= 24) return 1;
  if (ageMonths <= 0) return 0;
  return ageMonths / 24;
}

/**
 * Normalize utilization (lower is better, <30% = 1.0)
 */
function normalizeUtilization(util: number): number {
  if (util <= 0) return 1;
  if (util >= 100) return 0;
  // Optimal at 0-30%, then decreases
  if (util <= 30) return 1;
  return 1 - ((util - 30) / 70);
}

/**
 * Stage 1: Hard Fail Conditions
 */
function checkHardFailConditions(
  personal: PersonalCreditData,
  business: BusinessCreditData
): { blocked: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // 5/24 Rule
  if (personal.citibank524Count !== undefined && personal.citibank524Count >= 5) {
    reasons.push('5/24 Rule: 5 or more new personal cards in last 24 months');
  }

  // 2/30 Rule
  if (personal.citibank230Count !== undefined && personal.citibank230Count >= 2) {
    reasons.push('2/30 Rule: 2 or more Citibank cards approved in last 30 days');
  }

  // 1/30 Business Rule
  if (personal.citibankBusiness130Count !== undefined && personal.citibankBusiness130Count >= 1) {
    reasons.push('1/30 Business Rule: Citibank business card approved in last 30 days');
  }

  // Experian frozen
  if (personal.bureauUnfrozen?.experian === false) {
    reasons.push('Experian bureau is frozen - must be unfrozen for Citibank pull');
  }

  // Business too new
  if (business.businessAgeMonths !== undefined && business.businessAgeMonths < 3) {
    reasons.push('Business age less than 3 months');
  }

  // No revenue and no projections
  if (
    (!business.businessAnnualRevenue || business.businessAnnualRevenue === 0) &&
    !business.monthlyRevenueConsistency
  ) {
    reasons.push('No business revenue and no revenue consistency');
  }

  // Address/KYC fail
  if (business.addressMatch === false || business.kycPass === false) {
    reasons.push('Address match or KYC verification failed');
  }

  return {
    blocked: reasons.length > 0,
    reasons,
  };
}

/**
 * Calculate weighted approval likelihood score
 */
function calculateLikelihoodScore(
  personal: PersonalCreditData,
  business: BusinessCreditData,
  spend: SpendProfile,
  cardProfile?: CitibankCardProfile
): number {
  let score = 0;

  // Personal credit profile (30%)
  const personalScore = calculatePersonalScore(personal);
  score += personalScore * 0.30;

  // Business credit profile (20%)
  const businessScore = calculateBusinessScore(business);
  score += businessScore * 0.20;

  // Citibank relationship/utilization (20%)
  const citibankScore = calculateCitibankRelationshipScore(personal);
  score += citibankScore * 0.20;

  // Cash flow & revenue (15%)
  const revenueScore = calculateRevenueScore(business);
  score += revenueScore * 0.15;

  // Inquiry/risk factors (10%)
  const riskScore = calculateRiskScore(personal, business);
  score += riskScore * 0.10;

  // Spend suitability (5%)
  const spendScore = calculateSpendFitScore(spend, cardProfile);
  score += spendScore * 0.05;

  return Math.round(score * 100);
}

function calculatePersonalScore(personal: PersonalCreditData): number {
  let score = 0;
  let factors = 0;

  // FICO Score (primary)
  if (personal.ficoScore) {
    score += normalizeFico(personal.ficoScore);
    factors++;
  } else if (personal.experianFico8) {
    score += normalizeFico(personal.experianFico8);
    factors++;
  }

  // Utilization
  if (personal.utilization !== undefined) {
    score += normalizeUtilization(personal.utilization);
    factors++;
  }

  // Past Citibank relationship
  if (personal.pastCitibankRelationship) {
    score += 0.2; // Bonus for existing relationship
  }

  return factors > 0 ? score / factors : 0.5; // Default to neutral if no data
}

function calculateBusinessScore(business: BusinessCreditData): number {
  let score = 0;
  let factors = 0;

  // Intelliscore
  if (business.intelliscore !== undefined) {
    score += normalizeIntelliscore(business.intelliscore);
    factors++;
  }

  // Business age
  if (business.businessAgeMonths !== undefined) {
    score += normalizeBusinessAge(business.businessAgeMonths);
    factors++;
  }

  // Business type (LLC/Corp preferred)
  if (business.businessType === 'LLC' || business.businessType === 'Corp') {
    score += 0.2;
  } else if (business.businessType === 'Sole Prop') {
    score += 0.1;
  }

  // EIN verified
  if (business.einVerified) {
    score += 0.15;
  }

  // Revenue consistency
  if (business.monthlyRevenueConsistency) {
    score += 0.15;
  }

  // Deposit relationship
  if (business.depositRelationshipWithCitibank) {
    score += 0.1;
  }

  return Math.min(score, 1.0);
}

function calculateCitibankRelationshipScore(personal: PersonalCreditData): number {
  let score = 0.5; // Base score

  // Existing relationship
  if (personal.pastCitibankRelationship) {
    score += 0.2;
  }

  // Citibank utilization (lower is better)
  if (personal.currentCitibankUtilization !== undefined) {
    score += normalizeUtilization(personal.currentCitibankUtilization) * 0.3;
  }

  // Exposure ratio (lower is better, but some exposure is good)
  if (personal.existingCitibankCreditLimit && personal.existingCitibankCreditLimit > 0) {
    score += 0.1; // Having some exposure is positive
  }

  return Math.min(score, 1.0);
}

function calculateRevenueScore(business: BusinessCreditData): number {
  let score = 0;

  // Annual revenue (normalize, higher is better)
  if (business.businessAnnualRevenue) {
    // Scale: $0-$1M = 0-1, but cap at $500K for optimal
    const revenueScore = Math.min(business.businessAnnualRevenue / 500000, 1);
    score += revenueScore * 0.6;
  }

  // Revenue consistency
  if (business.monthlyRevenueConsistency) {
    score += 0.3;
  }

  // Profitability
  if (business.businessProfitability) {
    score += 0.1;
  }

  return Math.min(score, 1.0);
}

function calculateRiskScore(
  personal: PersonalCreditData,
  business: BusinessCreditData
): number {
  let score = 1.0; // Start at perfect, deduct for risks

  // Recent inquiries (penalty)
  if (personal.recentHardInquiries90Days) {
    const inquiryPenalty = Math.min(personal.recentHardInquiries90Days * 0.1, 0.5);
    score -= inquiryPenalty;
  }

  // Industry risk
  if (business.naicsIndustryRiskTier === 'High') {
    score -= 0.2;
  } else if (business.naicsIndustryRiskTier === 'Medium') {
    score -= 0.1;
  }

  // Payment behavior issues
  if (business.paymentBehavior) {
    if (business.paymentBehavior.overdrafts && business.paymentBehavior.overdrafts > 3) {
      score -= 0.15;
    }
    if (business.paymentBehavior.nsf && business.paymentBehavior.nsf > 0) {
      score -= 0.1;
    }
  }

  return Math.max(score, 0);
}

function calculateSpendFitScore(
  spend: SpendProfile,
  cardProfile?: CitibankCardProfile
): number {
  let score = 0.5; // Base score

  // Travel spend
  if (spend.travelSpendProfile === 'High') {
    score += 0.2;
  } else if (spend.travelSpendProfile === 'Med') {
    score += 0.1;
  }

  // Advertising spend
  if (spend.advertisingSpendProfile === 'High') {
    score += 0.2;
  } else if (spend.advertisingSpendProfile === 'Med') {
    score += 0.1;
  }

  // SUB feasibility
  if (spend.canMeetSUBRequirement) {
    score += 0.1;
  }

  return Math.min(score, 1.0);
}

/**
 * Generate reasoning and factors
 */
function generateReasoning(
  personal: PersonalCreditData,
  business: BusinessCreditData,
  spend: SpendProfile,
  likelihoodScore: number,
  blockedReasons: string[]
): {
  reasoning: string[];
  riskFactors: string[];
  positiveFactors: string[];
} {
  const reasoning: string[] = [];
  const riskFactors: string[] = [];
  const positiveFactors: string[] = [];

  // 5/24 status
  if (personal.citibank524Count !== undefined) {
    if (personal.citibank524Count < 5) {
      positiveFactors.push(`Under 5/24 (${personal.citibank524Count}/24)`);
      reasoning.push(`Under 5/24 rule with ${personal.citibank524Count} new cards in last 24 months`);
    } else {
      riskFactors.push(`At 5/24 limit (${personal.citibank524Count}/24)`);
    }
  }

  // FICO score
  const fico = personal.ficoScore || personal.experianFico8;
  if (fico) {
    if (fico >= 720) {
      positiveFactors.push(`Excellent FICO score (${fico})`);
      reasoning.push(`Strong personal credit with FICO score of ${fico}`);
    } else if (fico >= 680) {
      positiveFactors.push(`Good FICO score (${fico})`);
      reasoning.push(`Good personal credit with FICO score of ${fico}`);
    } else {
      riskFactors.push(`FICO score below ideal range (${fico})`);
    }
  }

  // Business scores
  if (business.intelliscore !== undefined) {
    if (business.intelliscore >= 70) {
      positiveFactors.push(`Strong Intelliscore (${business.intelliscore})`);
      reasoning.push(`Low business risk with Intelliscore of ${business.intelliscore}`);
    } else if (business.intelliscore < 40) {
      riskFactors.push(`Low Intelliscore (${business.intelliscore})`);
    }
  }

  // Business age
  if (business.businessAgeMonths !== undefined) {
    if (business.businessAgeMonths >= 24) {
      positiveFactors.push(`Established business (${business.businessAgeMonths} months)`);
    } else if (business.businessAgeMonths < 12) {
      riskFactors.push(`New business (${business.businessAgeMonths} months old)`);
    }
  }

  // Revenue
  if (business.businessAnnualRevenue) {
    if (business.businessAnnualRevenue >= 100000) {
      positiveFactors.push(`Strong annual revenue ($${(business.businessAnnualRevenue / 1000).toFixed(0)}K)`);
    }
  }

  // Citibank relationship
  if (personal.pastCitibankRelationship) {
    positiveFactors.push('Existing Citibank relationship');
    reasoning.push('Strong existing relationship with Citibank');
  }

  // Utilization
  if (personal.utilization !== undefined) {
    if (personal.utilization < 30) {
      positiveFactors.push(`Low utilization (${personal.utilization}%)`);
    } else if (personal.utilization > 70) {
      riskFactors.push(`High utilization (${personal.utilization}%)`);
    }
  }

  // Inquiries
  if (personal.recentHardInquiries90Days && personal.recentHardInquiries90Days > 3) {
    riskFactors.push(`High recent inquiries (${personal.recentHardInquiries90Days} in last 90 days)`);
  }

  // Spend fit
  if (spend.travelSpendProfile === 'High' || spend.advertisingSpendProfile === 'High') {
    positiveFactors.push('High spend in card reward categories');
    reasoning.push('Strong alignment with card reward categories');
  }

  // SUB feasibility
  if (spend.canMeetSUBRequirement) {
    positiveFactors.push('Can meet sign-up bonus requirement');
  }

  return { reasoning, riskFactors, positiveFactors };
}

/**
 * Main function to calculate approval likelihood
 */
export function calculateCitibankApprovalLikelihood(
  personal: PersonalCreditData,
  business: BusinessCreditData,
  spend: SpendProfile,
  cardProfile?: CitibankCardProfile
): ApprovalLikelihoodResult {
  // Stage 1: Check hard fail conditions
  const hardFail = checkHardFailConditions(personal, business);

  if (hardFail.blocked) {
    return {
      recommendation: 'Declined by Rule',
      likelihoodScore: 0,
      reasoning: ['Application would be declined due to Citibank policy violations'],
      stage1Blocked: true,
      blockedReasons: hardFail.reasons,
      riskFactors: hardFail.reasons,
      positiveFactors: [],
    };
  }

  // Stage 2: Calculate likelihood score
  let likelihoodScore = calculateLikelihoodScore(personal, business, spend, cardProfile);

  // Apply card-specific adjustments
  if (cardProfile) {
    // Check minimum requirements
    const fico = personal.ficoScore || personal.experianFico8 || 0;
    if (cardProfile.minPersonalFico && fico < cardProfile.minPersonalFico) {
      likelihoodScore -= 15;
    }

    if (cardProfile.minBusinessAge && business.businessAgeMonths && business.businessAgeMonths < cardProfile.minBusinessAge) {
      likelihoodScore -= 10;
    }

    if (cardProfile.minBusinessRevenue && business.businessAnnualRevenue && business.businessAnnualRevenue < cardProfile.minBusinessRevenue) {
      likelihoodScore -= 10;
    }

    // Difficulty rating adjustment
    if (cardProfile.difficultyRating === 'Hard') {
      likelihoodScore -= 10;
    } else if (cardProfile.difficultyRating === 'Easy') {
      likelihoodScore += 5;
    }
  }

  likelihoodScore = Math.max(0, Math.min(100, likelihoodScore));

  // Generate reasoning
  const { reasoning, riskFactors, positiveFactors } = generateReasoning(
    personal,
    business,
    spend,
    likelihoodScore,
    []
  );

  // Determine recommendation
  let recommendation: ApprovalLikelihoodResult['recommendation'];
  if (likelihoodScore >= 75) {
    recommendation = 'Strongly Recommended';
  } else if (likelihoodScore >= 55) {
    recommendation = 'Viable with Conditions';
  } else {
    recommendation = 'Not Recommended';
  }

  // Calculate expected approval limit
  const fico = personal.ficoScore || personal.experianFico8 || 0;
  const revenue = business.businessAnnualRevenue || 0;
  let expectedMin = 5000;
  let expectedMax = 25000;

  if (fico >= 750 && revenue >= 100000) {
    expectedMin = 15000;
    expectedMax = 50000;
  } else if (fico >= 720 && revenue >= 50000) {
    expectedMin = 10000;
    expectedMax = 30000;
  }

  return {
    recommendation,
    likelihoodScore,
    reasoning,
    stage1Blocked: false,
    blockedReasons: [],
    riskFactors,
    positiveFactors,
    cardSpecificDetails: {
      expectedApprovalLimit: { min: expectedMin, max: expectedMax },
      subFeasibility: spend.canMeetSUBRequirement || false,
      spendFitScore: Math.round(calculateSpendFitScore(spend, cardProfile) * 100),
    },
  };
}

/**
 * Extract data from user profile and credit data
 */
export function extractApprovalData(
  profile: any,
  experianData: any,
  recommendations?: any
): {
  personal: PersonalCreditData;
  business: BusinessCreditData;
  spend: SpendProfile;
} {
  // Extract personal credit data
  const personal: PersonalCreditData = {
    ficoScore: experianData?.creditScore || experianData?.score || null,
    experianFico8: experianData?.creditScore || experianData?.score || null,
    utilization: experianData?.data?.expandedCreditSummary?.currentAccountBalance && experianData?.data?.expandedCreditSummary?.allTradelineBalance
      ? (experianData.data.expandedCreditSummary.currentAccountBalance / experianData.data.expandedCreditSummary.allTradelineBalance) * 100
      : undefined,
    recentHardInquiries90Days: experianData?.data?.inquiries?.filter((inq: any) => {
      const date = new Date(inq.date || inq.inquiryDate);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      return date >= ninetyDaysAgo;
    }).length || 0,
    pastCitibankRelationship: false, // Would need to check from profile
    citibank524Count: 0, // Would need to track from profile
    citibank230Count: 0, // Would need to track from profile
    citibankBusiness130Count: 0, // Would need to track from profile
    existingCitibankCreditLimit: 0, // Would need from profile
    currentCitibankUtilization: 0, // Would need from profile
    bureauUnfrozen: {
      experian: true, // Default to true, would need to check
      equifax: true,
      transUnion: true,
    },
  };

  // Extract business credit data
  const business: BusinessCreditData = {
    intelliscore: experianData?.data?.scoreInformation?.commercialScore?.score || 
                  experianData?.data?.scoreInformation?.fsrScore?.score || null,
    businessAgeMonths: null, // Would need from profile
    businessAnnualRevenue: null, // Would need from profile
    monthlyRevenueConsistency: null, // Would need from profile
    businessType: profile?.data?.business?.[0]?.type || null,
    einVerified: profile?.data?.business?.[0]?.einVerified || false,
    addressMatch: true, // Default, would need to verify
    kycPass: true, // Default, would need to verify
    naicsIndustryRiskTier: 'Medium', // Default
    businessProfitability: null,
    depositRelationshipWithCitibank: false,
    paymentBehavior: {
      overdrafts: 0,
      nsf: 0,
      avgDailyBalance: 0,
    },
  };

  // Extract spend profile
  const spend: SpendProfile = {
    projectedSpend6Months: null,
    canMeetSUBRequirement: false, // Default
    travelSpendProfile: 'Med', // Default
    advertisingSpendProfile: 'Med', // Default
  };

  return { personal, business, spend };
}


