/**
 * Citibank Personal Credit Cards
 * Used for recommendations and offers in the consumer app
 */

export interface CitibankPersonalCard {
  id: string;
  cardId?: string;
  cardName: string;
  cardImage?: string;
  tagline?: string;
  bonusOffer?: {
    amount: string;
    condition: string;
  };
  rewards?: {
    primary?: string;
    secondary?: string;
    description?: string;
  };
  benefits?: string[];
  features?: string[];
  annualFee?: string;
  introAPR?: string;
  regularAPR?: string;
  reason?: string;
  suggestedUsage?: string;
  applyUrl?: string;
  detailsUrl?: string;
  fitScore?: number;
  difficultyRating?: 'Easy' | 'Medium' | 'Hard';
  minPersonalFico?: number;
}

export const CITIBANK_PERSONAL_CARDS: CitibankPersonalCard[] = [
  {
    id: 'citi-strata-elite',
    cardId: 'citi-strata-elite',
    cardName: 'Citi Strata Elite',
    cardImage: require('@/assets/cards/card1.png'),
    tagline: 'Unlock Nearly $1500 in value',
    bonusOffer: {
      amount: 'Earn 100,000 Bonus Points',
      condition: 'Earn 100,000 ThankYou® bonus points after spending $6,000 within 3 months of account opening, redeemable for $1,000 in gift cards or travel rewards at thankyou.com.'
    },
    rewards: {
      primary: '12X | 6X Points',
      description: 'Earn 12 points per $1 spent on Hotels, Car Rentals, and Attractions booked on cititravel.com. Earn 6 points per $1 spent on Air Travel booked on cititravel.com, and earn 6 points per $1 spent at Restaurants, including Restaurant Delivery Services, with Citi NightsSM every Friday and Saturday from 6 PM to 6 AM ET. Earn 3x points on Restaurants any other time.'
    },
    benefits: [
      'Up to $300 Annual Hotel Benefit - Each calendar year, enjoy up to $300 off a hotel stay of two nights or more when booked through cititravel.com.',
      'Limited Time Offer'
    ],
    features: [
      '12X points on Hotels, Car Rentals, and Attractions via cititravel.com',
      '6X points on Air Travel via cititravel.com',
      '6X points at Restaurants (Friday-Saturday 6 PM - 6 AM ET)',
      '3X points at Restaurants (other times)',
      '$300 annual hotel benefit'
    ],
    reason: 'The Citi Strata Elite card offers exceptional value with 100,000 bonus points worth $1,000, plus 12X points on travel bookings and 6X points on dining. Perfect for frequent travelers and food enthusiasts.',
    suggestedUsage: 'Use this card for all travel bookings through cititravel.com to maximize your 12X points. Take advantage of Citi Nights for dining on weekends to earn 6X points. Book hotels through cititravel.com to use your $300 annual benefit.',
    difficultyRating: 'Hard',
    minPersonalFico: 720,
    applyUrl: 'https://www.citi.com/credit-cards/citi-strata-elite',
    detailsUrl: 'https://www.citi.com/credit-cards/citi-strata-elite'
  },
  {
    id: 'citi-strata',
    cardId: 'citi-strata',
    cardName: 'Citi Strata',
    cardImage: require('@/assets/cards/card2.png'),
    tagline: 'Earn rewards on life\'s essentials',
    bonusOffer: {
      amount: 'Earn 30,000 Bonus Points',
      condition: 'Earn 30,000 ThankYou® bonus points after spending $1,000 within 3 months of account opening, redeemable for $300 in gift cards or travel rewards at thankyou.com.'
    },
    rewards: {
      primary: '5X | 3X Points',
      description: 'Earn 5 points per $1 spent on Hotels, Car Rentals, and Attractions booked on cititravel.com. Earn 3 points per $1 spent at Supermarkets, on Select Transit, at Gas & EV Charging Stations, and on an eligible Self-Select Category of your choice.'
    },
    benefits: [
      'Save with a Low Intro APR - 0% Intro APR for 15 months on purchases and balance transfers from date of account opening; after that, the variable APR will be 18.74% — 28.74% based on your creditworthiness.',
      'Cash back fast'
    ],
    features: [
      '5X points on Hotels, Car Rentals, and Attractions via cititravel.com',
      '3X points at Supermarkets',
      '3X points on Select Transit',
      '3X points at Gas & EV Charging Stations',
      '3X points on Self-Select Category',
      '0% Intro APR for 15 months'
    ],
    reason: 'The Citi Strata card offers great rewards on everyday essentials like groceries, gas, and transit, plus travel bookings. With a low intro APR, it\'s perfect for those looking to earn rewards while managing purchases.',
    suggestedUsage: 'Use this card for all grocery shopping, gas station purchases, and transit to earn 3X points. Book travel through cititravel.com for 5X points. Take advantage of the 0% intro APR for large purchases.',
    difficultyRating: 'Medium',
    minPersonalFico: 680,
    applyUrl: 'https://www.citi.com/credit-cards/citi-strata',
    detailsUrl: 'https://www.citi.com/credit-cards/citi-strata'
  },
  {
    id: 'citi-double-cash',
    cardId: 'citi-double-cash',
    cardName: 'Citi Double Cash® Card',
    cardImage: require('@/assets/cards/card3.png'),
    tagline: 'Earn cash back on purchases everywhere',
    bonusOffer: {
      amount: 'Earn $200 cash back',
      condition: 'Earn $200 cash back bonus after spending $1,500 on purchases in the first 6 months of account opening.'
    },
    rewards: {
      primary: 'Earn 2% cash back',
      description: 'Earn 1% cash back on purchases and 1% as you pay for your purchases, with no caps on earning, no category enrollment, or annual fee. Plus: Earn 5% total cash back on hotels, car rentals, and attractions when booked with Citi Travel.'
    },
    benefits: [
      'Low Intro APR on balance transfers for 18 months - 0% for 18 months from date of account opening for balance transfers only; after that, the variable APR will be 17.74% to 27.74%, based on your creditworthiness.',
      'Best for balance transfers'
    ],
    features: [
      '2% cash back on all purchases (1% when you buy, 1% when you pay)',
      'No annual fee',
      'No caps on earning',
      'No category enrollment required',
      '5% cash back on travel booked with Citi Travel',
      '0% Intro APR on balance transfers for 18 months'
    ],
    reason: 'The Citi Double Cash card offers simple, straightforward cash back with no annual fee. Earn 2% on everything - 1% when you buy and 1% when you pay. Perfect for those who want cash back without tracking categories.',
    suggestedUsage: 'Use this card for all purchases to earn consistent 2% cash back. Book travel through Citi Travel to earn 5% cash back. Take advantage of the 0% intro APR for balance transfers.',
    difficultyRating: 'Easy',
    minPersonalFico: 670,
    applyUrl: 'https://www.citi.com/credit-cards/citi-double-cash',
    detailsUrl: 'https://www.citi.com/credit-cards/citi-double-cash'
  },
  {
    id: 'citi-diamond-preferred',
    cardId: 'citi-diamond-preferred',
    cardName: 'Citi® Diamond Preferred® Card',
    cardImage: require('@/assets/cards/card4.png'),
    tagline: 'Transfer your balance and save with our low intro APR offer',
    bonusOffer: {
      amount: 'Low Intro APR for 21 months on balance transfers',
      condition: 'Enjoy 0% Intro APR on balance transfers for 21 months from date of account opening for balance transfers completed in first 4 months; after that, the variable APR will be 16.74% — 27.49%, based on your creditworthiness. All transfers must be completed within 4 months of account opening.'
    },
    rewards: {
      primary: 'Low Intro APR for 12 months on purchases',
      description: 'Enjoy 0% Intro APR on purchases for 12 months from date of account opening; after that, the variable APR will be 16.74% — 27.49%, based on your creditworthiness.'
    },
    benefits: [
      '$0 Annual Fee - Enjoy all the benefits of a low intro APR card, with no annual fee.',
      'See more details'
    ],
    features: [
      '0% Intro APR on balance transfers for 21 months',
      '0% Intro APR on purchases for 12 months',
      'No annual fee',
      'Balance transfers must be completed within 4 months'
    ],
    reason: 'The Citi Diamond Preferred card is ideal for those looking to consolidate debt or make large purchases with a low intro APR. With 21 months of 0% APR on balance transfers and no annual fee, it\'s perfect for managing existing debt.',
    suggestedUsage: 'Use this card to transfer high-interest balances and save on interest. Complete all balance transfers within the first 4 months to take advantage of the 21-month intro APR. Use for large purchases during the 12-month intro period.',
    difficultyRating: 'Easy',
    minPersonalFico: 650,
    applyUrl: 'https://www.citi.com/credit-cards/citi-diamond-preferred',
    detailsUrl: 'https://www.citi.com/credit-cards/citi-diamond-preferred'
  },
  {
    id: 'citi-strata-premier',
    cardId: 'citi-strata-premier',
    cardName: 'Citi Strata Premier® Card',
    cardImage: require('@/assets/cards/card5.png'),
    tagline: 'Take your moment higher',
    bonusOffer: {
      amount: 'Earn 60,000 bonus points',
      condition: 'Earn 60,000 ThankYou® bonus points after spending $4,000 within 3 months of account opening, redeemable for $600 in gift cards or travel rewards at thankyou.com.'
    },
    rewards: {
      primary: '10X | 3X Points',
      description: 'Earn 10 points per $1 spent on Hotels, Car Rentals, and Attractions booked on CitiTravel.com. Earn 3 points per $1 spent on Air Travel and Other Hotel purchases, Restaurants, Supermarkets, and Gas and EV Charging Stations.'
    },
    benefits: [
      '$100 Annual Hotel Benefit - Once per calendar year, enjoy $100 off a single hotel stay of $500 or more (excluding taxes and fees) when booked through CitiTravel.com or 1-833-737-1288. Benefit applied instantly at time of booking.',
      'Earn bonus points'
    ],
    features: [
      '10X points on Hotels, Car Rentals, and Attractions via CitiTravel.com',
      '3X points on Air Travel',
      '3X points at Restaurants',
      '3X points at Supermarkets',
      '3X points at Gas & EV Charging Stations',
      '$100 annual hotel benefit'
    ],
    reason: 'The Citi Strata Premier card offers excellent travel rewards with 10X points on travel bookings and 3X points on dining, groceries, and gas. With 60,000 bonus points worth $600, it\'s perfect for frequent travelers.',
    suggestedUsage: 'Book all travel through CitiTravel.com to maximize your 10X points. Use this card for dining, groceries, and gas to earn 3X points. Take advantage of the $100 annual hotel benefit when booking stays of $500 or more.',
    difficultyRating: 'Medium',
    minPersonalFico: 690,
    applyUrl: 'https://www.citi.com/credit-cards/citi-strata-premier',
    detailsUrl: 'https://www.citi.com/credit-cards/citi-strata-premier'
  }
];

/**
 * Get all Citibank personal credit cards
 */
export function getAllCitibankPersonalCards(): CitibankPersonalCard[] {
  return CITIBANK_PERSONAL_CARDS;
}

/**
 * Get a personal card by ID
 */
export function getPersonalCardById(id: string): CitibankPersonalCard | undefined {
  return CITIBANK_PERSONAL_CARDS.find(card => card.id === id || card.cardId === id);
}

/**
 * Get card image source for personal cards
 */
export function getPersonalCardImageSource(cardId: string, index: number): any {
  const card = getPersonalCardById(cardId);
  if (card?.cardImage) {
    return card.cardImage;
  }
  
  // Fallback to numbered images
  const imageMap: { [key: number]: any } = {
    0: require('@/assets/cards/card1.png'),
    1: require('@/assets/cards/card2.png'),
    2: require('@/assets/cards/card3.png'),
    3: require('@/assets/cards/card4.png'),
    4: require('@/assets/cards/card5.png'),
  };
  
  return imageMap[index % 5] || require('@/assets/cards/card1.png');
}

/**
 * Get card apply URL
 */
export function getPersonalCardApplyUrl(cardId: string, cardName?: string): string {
  const card = getPersonalCardById(cardId);
  if (card?.applyUrl) {
    return card.applyUrl;
  }
  
  // Default fallback URL
  return 'https://www.citi.com/credit-cards';
}

/**
 * Get card details URL
 */
export function getPersonalCardDetailsUrl(cardId: string, cardName?: string): string {
  const card = getPersonalCardById(cardId);
  if (card?.detailsUrl) {
    return card.detailsUrl;
  }
  
  // Default fallback URL
  return 'https://www.citi.com/credit-cards';
}




