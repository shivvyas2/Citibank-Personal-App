/**
 * All 11 Citibank Business Credit Cards with their profiles
 * Used for recommendations and approval likelihood calculations
 */

import { CitibankCardProfile } from '@/services/citibankApprovalService';

export interface CitibankBusinessCard {
  id: string;
  cardId?: string; // Optional cardId for tracking (defaults to id if not provided)
  cardName: string;
  cardImage?: string;
  difficultyRating: 'Easy' | 'Medium' | 'Hard';
  minPersonalFico?: number;
  minBusinessRevenue?: number;
  minBusinessAge?: number;
  expectedApprovalCLRange?: { min: number; max: number };
  subDifficultyIndex?: number;
  rewardCategoryAlignment?: string[];
  underwriterToleranceLevel?: 'High' | 'Medium' | 'Low';
  bonusOffer?: {
    amount: string;
    condition: string;
  };
  benefits?: string[];
  reason?: string;
  suggestedUsage?: string;
  applyUrl?: string;
  detailsUrl?: string; // URL to the card's detail page on Citibank website
  fitScore?: number;
}

export const CITIBANK_BUSINESS_CARDS: CitibankBusinessCard[] = [
  {
    id: 'citibank-ink-business-cash',
    cardId: 'citibank-ink-business-cash',
    cardName: 'Citibank Business Cash',
    difficultyRating: 'Easy',
    minPersonalFico: 680,
    minBusinessRevenue: 0,
    minBusinessAge: 0,
    expectedApprovalCLRange: { min: 5000, max: 50000 },
    subDifficultyIndex: 3,
    rewardCategoryAlignment: ['Office Supplies', 'Internet', 'Cable', 'Phone Services'],
    underwriterToleranceLevel: 'High',
    bonusOffer: {
      amount: 'Earn $750',
      condition: 'After spending $6,000 in first 3 months'
    },
    benefits: [
      '5% cash back on office supplies and internet/cable/phone services',
      '2% cash back on gas stations and restaurants',
      '1% cash back on all other purchases',
      'No annual fee',
      'Employee cards at no additional cost'
    ],
    reason: 'Best for businesses with high office supply and utility spending. Easy approval with no annual fee.',
    suggestedUsage: 'Use for office supplies, internet, cable, and phone bills to maximize 5% cash back. Great starter business card.',
    fitScore: 0.85,
  },
  {
    id: 'citibank-ink-business-unlimited',
    cardId: 'citibank-ink-business-unlimited',
    cardName: 'Citibank Business Unlimited',
    difficultyRating: 'Easy',
    minPersonalFico: 680,
    minBusinessRevenue: 0,
    minBusinessAge: 0,
    expectedApprovalCLRange: { min: 5000, max: 50000 },
    subDifficultyIndex: 3,
    rewardCategoryAlignment: ['All Categories'],
    underwriterToleranceLevel: 'High',
    bonusOffer: {
      amount: 'Earn $750',
      condition: 'After spending $6,000 in first 3 months'
    },
    benefits: [
      '1.5% cash back on all purchases',
      'No annual fee',
      'Simple flat-rate rewards',
      'Employee cards at no additional cost',
      'Purchase protection and extended warranty'
    ],
    reason: 'Perfect for businesses that want simple, flat-rate rewards on all spending. No category tracking needed.',
    suggestedUsage: 'Use for all business expenses to earn consistent 1.5% cash back. Ideal for businesses with varied spending.',
    fitScore: 0.80,
  },
  {
    id: 'citibank-ink-business-preferred',
    cardId: 'citibank-ink-business-preferred',
    cardName: 'Citibank Business Preferred',
    difficultyRating: 'Medium',
    minPersonalFico: 720,
    minBusinessRevenue: 50000,
    minBusinessAge: 6,
    expectedApprovalCLRange: { min: 10000, max: 100000 },
    subDifficultyIndex: 5,
    rewardCategoryAlignment: ['Travel', 'Shipping', 'Internet', 'Advertising'],
    underwriterToleranceLevel: 'Medium',
    bonusOffer: {
      amount: 'Earn 100,000 points',
      condition: 'After spending $8,000 in first 3 months'
    },
    benefits: [
      '3X points on travel, shipping, internet, cable, phone, and advertising',
      '1X points on all other purchases',
      'Points worth 25% more when redeemed for travel',
      'Employee cards at no additional cost',
      'Travel and purchase protection'
    ],
    reason: 'Best for businesses with high travel and advertising spend. Premium rewards with flexible redemption.',
    suggestedUsage: 'Maximize 3X points on travel, shipping, and advertising. Redeem points for travel to get 25% bonus value.',
    fitScore: 0.90,
  },
  {
    id: 'citibank-ink-business-premier',
    cardId: 'citibank-ink-business-premier',
    cardName: 'Citibank Business Premier',
    difficultyRating: 'Medium',
    minPersonalFico: 700,
    minBusinessRevenue: 100000,
    minBusinessAge: 12,
    expectedApprovalCLRange: { min: 15000, max: 100000 },
    subDifficultyIndex: 4,
    rewardCategoryAlignment: ['All Categories', 'Travel', 'Dining'],
    underwriterToleranceLevel: 'Medium',
    bonusOffer: {
      amount: 'Earn $1,000',
      condition: 'After spending $10,000 in first 3 months'
    },
    benefits: [
      '2.5% cash back on all purchases',
      '5% cash back on travel purchased through Citibank',
      'No foreign transaction fees',
      'Employee cards at no additional cost',
      'Cell phone protection'
    ],
    reason: 'Premium business card with high flat-rate rewards. Best for businesses with consistent high spending.',
    suggestedUsage: 'Use for all business expenses to earn 2.5% cash back. Book travel through Citibank for 5% cash back.',
    fitScore: 0.75,
  },
  {
    id: 'citibank-sapphire-reserve-business',
    cardId: 'citibank-sapphire-reserve-business',
    cardName: 'Citibank Sapphire Reserve Business',
    difficultyRating: 'Hard',
    minPersonalFico: 750,
    minBusinessRevenue: 200000,
    minBusinessAge: 24,
    expectedApprovalCLRange: { min: 20000, max: 150000 },
    subDifficultyIndex: 7,
    rewardCategoryAlignment: ['Travel', 'Dining', 'Advertising'],
    underwriterToleranceLevel: 'Low',
    bonusOffer: {
      amount: 'Earn 100,000 points',
      condition: 'After spending $30,000 in first 6 months'
    },
    benefits: [
      '8X points on travel and dining',
      '3X points on advertising',
      '1X points on all other purchases',
      'Points worth 50% more when redeemed for travel',
      '$300 annual travel credit',
      'Priority Pass Select membership',
      'Global Entry/TSA PreCheck credit'
    ],
    reason: 'Premium travel rewards card for high-spending businesses. Excellent for businesses with significant travel and dining expenses.',
    suggestedUsage: 'Maximize 8X points on travel and dining. Use for advertising to earn 3X points. Redeem for travel to get 50% bonus value.',
    fitScore: 0.95,
  },
  {
    id: 'citibank-ink-business-flex',
    cardId: 'citibank-ink-business-flex',
    cardName: 'Citibank Business Flex',
    difficultyRating: 'Easy',
    minPersonalFico: 680,
    minBusinessRevenue: 0,
    minBusinessAge: 0,
    expectedApprovalCLRange: { min: 5000, max: 50000 },
    subDifficultyIndex: 3,
    rewardCategoryAlignment: ['Office Supplies', 'Internet', 'Cable', 'Phone', 'Travel', 'Gas'],
    underwriterToleranceLevel: 'High',
    bonusOffer: {
      amount: 'Earn $750',
      condition: 'After spending $6,000 in first 3 months'
    },
    benefits: [
      '5% cash back on office supplies, internet, cable, phone (up to $25,000/year)',
      '2% cash back on gas stations and restaurants (up to $25,000/year)',
      '1% cash back on all other purchases',
      'No annual fee',
      'Employee cards at no additional cost'
    ],
    reason: 'Flexible rewards card with rotating 5% categories. Great for businesses with varied spending patterns.',
    suggestedUsage: 'Maximize 5% categories each quarter. Use for office supplies and utilities year-round.',
    fitScore: 0.82,
  },
  {
    id: 'citibank-ink-business-platinum',
    cardId: 'citibank-ink-business-platinum',
    cardName: 'Citibank Business Platinum',
    difficultyRating: 'Easy',
    minPersonalFico: 650,
    minBusinessRevenue: 0,
    minBusinessAge: 0,
    expectedApprovalCLRange: { min: 3000, max: 25000 },
    subDifficultyIndex: 2,
    rewardCategoryAlignment: ['All Categories'],
    underwriterToleranceLevel: 'High',
    bonusOffer: {
      amount: 'Earn $500',
      condition: 'After spending $5,000 in first 3 months'
    },
    benefits: [
      '1% cash back on all purchases',
      'No annual fee',
      'Employee cards at no additional cost',
      'Purchase protection',
      'Extended warranty'
    ],
    reason: 'Simple business card with straightforward rewards. Easiest Citibank business card to get approved for.',
    suggestedUsage: 'Use for all business expenses. Simple 1% cash back with no category tracking needed.',
    fitScore: 0.70,
  },
  {
    id: 'citibank-ink-business-premier-plus',
    cardId: 'citibank-ink-business-premier-plus',
    cardName: 'Citibank Business Premier Plus',
    difficultyRating: 'Medium',
    minPersonalFico: 720,
    minBusinessRevenue: 150000,
    minBusinessAge: 18,
    expectedApprovalCLRange: { min: 20000, max: 100000 },
    subDifficultyIndex: 6,
    rewardCategoryAlignment: ['Travel', 'Dining', 'All Categories'],
    underwriterToleranceLevel: 'Medium',
    bonusOffer: {
      amount: 'Earn 120,000 points',
      condition: 'After spending $15,000 in first 3 months'
    },
    benefits: [
      '3X points on travel and dining',
      '2X points on all other purchases',
      'Points worth 30% more when redeemed for travel',
      'Airport lounge access',
      'Travel insurance',
      'No foreign transaction fees'
    ],
    reason: 'Premium rewards card with strong travel benefits. Best for businesses with significant travel and dining spend.',
    suggestedUsage: 'Maximize 3X points on travel and dining. Use for all other expenses to earn 2X points.',
    fitScore: 0.88,
  },
  {
    id: 'citibank-ink-business-travel',
    cardId: 'citibank-ink-business-travel',
    cardName: 'Citibank Business Travel',
    difficultyRating: 'Medium',
    minPersonalFico: 700,
    minBusinessRevenue: 75000,
    minBusinessAge: 12,
    expectedApprovalCLRange: { min: 10000, max: 75000 },
    subDifficultyIndex: 5,
    rewardCategoryAlignment: ['Travel', 'Dining', 'Gas'],
    underwriterToleranceLevel: 'Medium',
    bonusOffer: {
      amount: 'Earn 80,000 points',
      condition: 'After spending $8,000 in first 3 months'
    },
    benefits: [
      '4X points on travel and dining',
      '2X points on gas stations',
      '1X points on all other purchases',
      'Points worth 20% more when redeemed for travel',
      'Travel protection',
      'No foreign transaction fees'
    ],
    reason: 'Travel-focused business card with strong rewards on travel and dining. Great for businesses that travel frequently.',
    suggestedUsage: 'Use for all travel and dining expenses to earn 4X points. Redeem for travel to maximize value.',
    fitScore: 0.85,
  },
  {
    id: 'citibank-ink-business-rewards',
    cardId: 'citibank-ink-business-rewards',
    cardName: 'Citibank Business Rewards',
    difficultyRating: 'Easy',
    minPersonalFico: 680,
    minBusinessRevenue: 0,
    minBusinessAge: 0,
    expectedApprovalCLRange: { min: 5000, max: 50000 },
    subDifficultyIndex: 3,
    rewardCategoryAlignment: ['Office Supplies', 'Internet', 'Cable', 'Phone', 'Gas', 'Restaurants'],
    underwriterToleranceLevel: 'High',
    bonusOffer: {
      amount: 'Earn $500',
      condition: 'After spending $3,000 in first 3 months'
    },
    benefits: [
      '5% cash back on office supplies, internet, cable, phone',
      '2% cash back on gas stations and restaurants',
      '1% cash back on all other purchases',
      'No annual fee',
      'Employee cards at no additional cost'
    ],
    reason: 'Solid rewards card with bonus categories. Good for businesses with office supply and utility expenses.',
    suggestedUsage: 'Maximize 5% cash back on office supplies and utilities. Use for gas and restaurants to earn 2%.',
    fitScore: 0.78,
  },
  {
    id: 'citibank-ink-business-elite',
    cardId: 'citibank-ink-business-elite',
    cardName: 'Citibank Business Elite',
    difficultyRating: 'Hard',
    minPersonalFico: 760,
    minBusinessRevenue: 500000,
    minBusinessAge: 36,
    expectedApprovalCLRange: { min: 50000, max: 250000 },
    subDifficultyIndex: 9,
    rewardCategoryAlignment: ['Travel', 'Dining', 'Advertising', 'All Categories'],
    underwriterToleranceLevel: 'Low',
    bonusOffer: {
      amount: 'Earn 150,000 points',
      condition: 'After spending $50,000 in first 6 months'
    },
    benefits: [
      '10X points on travel and dining',
      '5X points on advertising',
      '2X points on all other purchases',
      'Points worth 60% more when redeemed for travel',
      '$500 annual travel credit',
      'Complimentary airport lounge access',
      'Concierge service',
      'Travel insurance and protection'
    ],
    reason: 'Ultra-premium business card for high-net-worth businesses. Highest rewards but most difficult to obtain.',
    suggestedUsage: 'Maximize 10X points on travel and dining. Use for advertising to earn 5X points. Best for businesses with very high spending.',
    fitScore: 0.98,
  },
  {
    id: 'costco-anywhere-visa-citi',
    cardId: 'costco-anywhere-visa-citi',
    cardName: 'Costco Anywhere Visa® Card by Citi',
    // cardImage will be provided by getCardImageSource function
    difficultyRating: 'Easy',
    minPersonalFico: 680,
    minBusinessRevenue: 0,
    minBusinessAge: 0,
    expectedApprovalCLRange: { min: 5000, max: 50000 },
    subDifficultyIndex: 3,
    rewardCategoryAlignment: ['Gas', 'Restaurants', 'Travel', 'Costco'],
    underwriterToleranceLevel: 'High',
    bonusOffer: {
      amount: 'No sign-up bonus',
      condition: 'Earn cash back on every purchase'
    },
    benefits: [
      '5% cash back on gas at Costco and 4% on other eligible gas and EV charging (first $7,000/year, then 1%)',
      '3% cash back on restaurants and eligible travel worldwide',
      '2% cash back on all other purchases from Costco and Costco.com',
      '1% cash back on all other purchases',
      'No annual fee',
      'Exclusively for Costco members',
      'Annual reward certificate redeemable at Costco warehouses'
    ],
    reason: 'Perfect for Costco members who want to maximize cash back on gas, restaurants, and travel. Great rewards structure with no annual fee.',
    suggestedUsage: 'Use for gas purchases at Costco (5% cash back) and other gas stations (4% cash back up to $7,000/year). Maximize 3% cash back on restaurants and travel. Use for all Costco purchases to earn 2% cash back.',
    fitScore: 0.85,
    applyUrl: 'https://www.citi.com/credit-cards/costco',
    detailsUrl: 'https://www.citi.com/credit-cards/costco',
  },
  {
    id: 'costco-anywhere-visa-business-citi',
    cardId: 'costco-anywhere-visa-business-citi',
    cardName: 'Costco Anywhere Visa® Business Card by Citi',
    // cardImage will be provided by getCardImageSource function
    difficultyRating: 'Easy',
    minPersonalFico: 680,
    minBusinessRevenue: 0,
    minBusinessAge: 0,
    expectedApprovalCLRange: { min: 5000, max: 50000 },
    subDifficultyIndex: 3,
    rewardCategoryAlignment: ['Gas', 'Restaurants', 'Travel', 'Costco'],
    underwriterToleranceLevel: 'High',
    bonusOffer: {
      amount: 'No sign-up bonus',
      condition: 'Earn cash back rewards for your business on every purchase'
    },
    benefits: [
      '5% cash back on gas at Costco and 4% on other eligible gas and EV charging (first $7,000/year, then 1%)',
      '3% cash back on restaurants and eligible travel, including Costco Travel',
      '2% cash back on all other purchases from Costco and Costco.com',
      '1% cash back on all other purchases',
      'No annual fee',
      'Exclusively for Costco members',
      'Annual credit card reward certificate in February billing statements',
      'Redeemable for cash or merchandise at US Costco Warehouses'
    ],
    reason: 'The only business credit card designed exclusively for Costco members. Earn cash back rewards for your business on purchases anywhere Visa is accepted.',
    suggestedUsage: 'Use for business gas purchases at Costco (5% cash back) and other gas stations (4% cash back up to $7,000/year). Maximize 3% cash back on business restaurants and travel expenses. Use for all Costco business purchases to earn 2% cash back.',
    fitScore: 0.88,
    applyUrl: 'https://www.citi.com/credit-cards/costco-business',
    detailsUrl: 'https://www.citi.com/credit-cards/costco-business',
  },
];

/**
 * Get all Citibank business cards
 */
export function getAllCitibankBusinessCards(): CitibankBusinessCard[] {
  return CITIBANK_BUSINESS_CARDS;
}

/**
 * Get card by ID
 */
export function getCitibankBusinessCardById(id: string): CitibankBusinessCard | undefined {
  return CITIBANK_BUSINESS_CARDS.find(card => card.id === id);
}

/**
 * Get cards by difficulty rating
 */
export function getCitibankBusinessCardsByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): CitibankBusinessCard[] {
  return CITIBANK_BUSINESS_CARDS.filter(card => card.difficultyRating === difficulty);
}

/**
 * Get card image source for a given card ID
 * Maps each card to a specific image from available assets
 */
export function getCardImageSource(cardId: string, index: number): any {
  // Map specific cards to specific images for better visual variety
  const cardImageMap: { [key: string]: number } = {
    'citibank-ink-business-cash': 1,
    'citibank-ink-business-unlimited': 2,
    'citibank-ink-business-preferred': 3,
    'citibank-ink-business-premier': 4,
    'citibank-sapphire-reserve-business': 5,
    'citibank-ink-business-flex': 1, // Reuse card1 for similar cards
    'citibank-ink-business-platinum': 2,
    'citibank-ink-business-premier-plus': 3,
    'citibank-ink-business-travel': 4,
    'citibank-ink-business-rewards': 5,
    'citibank-ink-business-elite': 1, // Premium card gets card1
    'costco-anywhere-visa-citi': 1,
    'costco-anywhere-visa-business-citi': 1,
  };

  const imageIndex = cardImageMap[cardId] || ((index % 5) + 1);
  
  // Use citi.png for all card images
  return require('@/assets/citi.png');
}

/**
 * Get card details URL for a given card ID or card name
 * Returns the Citibank credit card detail page URL
 */
export function getCardDetailsUrl(cardId?: string, cardName?: string): string | null {
  if (!cardId && !cardName) return null;
  
  // Map card IDs and card names to their Citibank detail page URLs
  const cardUrlMap: { [key: string]: string } = {
    // By card ID
    'citibank-ink-business-cash': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-unlimited': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-preferred': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-premier': 'https://www.citi.com/credit-cards/business',
    'citibank-sapphire-reserve-business': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-flex': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-platinum': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-premier-plus': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-travel': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-rewards': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-elite': 'https://www.citi.com/credit-cards/business',
    // By card name (normalized)
    'business cash': 'https://www.citi.com/credit-cards/business',
    'business unlimited': 'https://www.citi.com/credit-cards/business',
    'business preferred': 'https://www.citi.com/credit-cards/business',
    'business premier': 'https://www.citi.com/credit-cards/business',
    'sapphire reserve business': 'https://www.citi.com/credit-cards/business',
    'citibank sapphire reserve business': 'https://www.citi.com/credit-cards/business',
    'business flex': 'https://www.citi.com/credit-cards/business',
    'business platinum': 'https://www.citi.com/credit-cards/business',
    'business premier plus': 'https://www.citi.com/credit-cards/business',
    'business travel': 'https://www.citi.com/credit-cards/business',
    'business rewards': 'https://www.citi.com/credit-cards/business',
    'business elite': 'https://www.citi.com/credit-cards/business',
    'costco anywhere visa card by citi': 'https://www.citi.com/credit-cards/costco',
    'costco anywhere visa business card by citi': 'https://www.citi.com/credit-cards/costco-business',
    'costco-anywhere-visa-citi': 'https://www.citi.com/credit-cards/costco',
    'costco-anywhere-visa-business-citi': 'https://www.citi.com/credit-cards/costco-business',
  };
  
  // Try cardId first
  if (cardId && cardUrlMap[cardId.toLowerCase()]) {
    return cardUrlMap[cardId.toLowerCase()];
  }
  
  // Try cardName (normalized - remove "Citibank" prefix, lowercase)
  if (cardName) {
    const normalizedName = cardName.toLowerCase().replace(/^citibank\s+/i, '').trim();
    if (cardUrlMap[normalizedName]) {
      return cardUrlMap[normalizedName];
    }
  }
  
  // Default fallback URL
  return 'https://www.citi.com/credit-cards/business';
}

/**
 * Get card application URL for a given card ID or card name
 * Returns the Citibank credit card application page URL
 */
export function getCardApplyUrl(cardId?: string, cardName?: string): string | null {
  if (!cardId && !cardName) return null;
  
  // Map card IDs and card names to their Citibank application URLs
  const cardApplyUrlMap: { [key: string]: string } = {
    // By card ID
    'citibank-ink-business-cash': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-unlimited': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-preferred': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-premier': 'https://www.citi.com/credit-cards/business',
    'citibank-sapphire-reserve-business': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-flex': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-platinum': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-premier-plus': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-travel': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-rewards': 'https://www.citi.com/credit-cards/business',
    'citibank-ink-business-elite': 'https://www.citi.com/credit-cards/business',
    // By card name (normalized)
    'business cash': 'https://www.citi.com/credit-cards/business',
    'business unlimited': 'https://www.citi.com/credit-cards/business',
    'business preferred': 'https://www.citi.com/credit-cards/business',
    'business premier': 'https://www.citi.com/credit-cards/business',
    'sapphire reserve business': 'https://www.citi.com/credit-cards/business',
    'citibank sapphire reserve business': 'https://www.citi.com/credit-cards/business',
    'business flex': 'https://www.citi.com/credit-cards/business',
    'business platinum': 'https://www.citi.com/credit-cards/business',
    'business premier plus': 'https://www.citi.com/credit-cards/business',
    'business travel': 'https://www.citi.com/credit-cards/business',
    'business rewards': 'https://www.citi.com/credit-cards/business',
    'business elite': 'https://www.citi.com/credit-cards/business',
    'costco anywhere visa card by citi': 'https://www.citi.com/credit-cards/costco',
    'costco anywhere visa business card by citi': 'https://www.citi.com/credit-cards/costco-business',
    'costco-anywhere-visa-citi': 'https://www.citi.com/credit-cards/costco',
    'costco-anywhere-visa-business-citi': 'https://www.citi.com/credit-cards/costco-business',
  };
  
  // Try cardId first
  if (cardId && cardApplyUrlMap[cardId.toLowerCase()]) {
    return cardApplyUrlMap[cardId.toLowerCase()];
  }
  
  // Try cardName (normalized - remove "Citibank" prefix, lowercase)
  if (cardName) {
    const normalizedName = cardName.toLowerCase().replace(/^citibank\s+/i, '').trim();
    if (cardApplyUrlMap[normalizedName]) {
      return cardApplyUrlMap[normalizedName];
    }
  }
  
  // Default fallback URL (general business credit card application)
  return 'https://www.citi.com/credit-cards/business';
}

