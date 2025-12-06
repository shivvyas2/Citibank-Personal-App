export interface MockBusiness {
  id: string;
  userId: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId: string | null;
  empCount: number;
  legalStruct: string;
  yearFounded: number;
  ownerFname: string;
  ownerLname: string;
  ownerMname: string | null;
  ownerTitle: string;
  createdAt: string;
  businessCode?: string;
}

export interface MockUserProfile {
  id: string;
  clerkId?: string;
  email: string;
  password?: string;
  phoneNum?: string;
  status: string;
  subscription: string;
  userFname: string;
  userLname: string;
  verified: boolean;
  alertsEnabled: boolean;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
  business: MockBusiness[];
}

export const mockBusinessData: MockBusiness = {
  id: 'a444a595-2f55-4106-bbff-9fb6111623f6',
  userId: '843a3be0-f57e-435f-941a-dbe0334119d3',
  name: 'BlueRidge Quantum Analytics LLC',
  streetAddress: '742 Pine Vista Drive',
  city: 'Boulder',
  state: 'CO',
  zipCode: '80302',
  country: 'USA',
  taxId: '12-3456789',
  empCount: 54,
  legalStruct: 'LLC',
  yearFounded: 2014,
  ownerFname: 'Xander',
  ownerLname: 'Rowland',
  ownerMname: 'K.',
  ownerTitle: 'Founder',
  createdAt: '2025-11-13T15:19:21.555Z',
  businessCode: '6000007',
};

export const mockUserProfile: MockUserProfile = {
  id: '843a3be0-f57e-435f-941a-dbe0334119d3',
  clerkId: 'usr_f3a9b8d1-92f4-4f43-9a82-0c7ea82014c5',
  email: 'xanderrowland876@radiant-flow.org',
  phoneNum: '+13035578219',
  status: 'ACTIVE',
  subscription: 'YEAR',
  userFname: 'Xander',
  userLname: 'Rowland',
  verified: true,
  alertsEnabled: false,
  customerId: 'cus_TPs3iJWtt4ee3r',
  createdAt: '2025-11-13T15:19:20.985Z',
  updatedAt: '2025-11-13T15:19:21.457Z',
  business: [mockBusinessData],
};

export const getMockBusinessCode = (): string => {
  return mockBusinessData.businessCode || '6000007';
};

export const getMockUserId = (): string => {
  return '0*7';
};

