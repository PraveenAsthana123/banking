// Folder Structure based on 5_Star_UseCases directory
// Matches the actual folder hierarchy

export const folderStructure = [
  {
    id: 'A',
    code: 'A',
    name: 'Core Business & Revenue',
    icon: 'trending-up',
    color: '#10b981',
    path: 'A_Core_Business_and_Revenue',
    subdepartments: [
      { id: '01', name: 'Retail Banking & Digital Channels', path: '01_Retail_Banking_Digital_Channels', icon: 'smartphone', useCases: 5 },
      { id: '02', name: 'Corporate Banking', path: '02_Corporate_Banking', icon: 'building', useCases: 5 },
      { id: '03', name: 'Wealth Management', path: '03_Wealth_Management', icon: 'briefcase', useCases: 5 },
      { id: '04', name: 'Payments & Cards', path: '04_Payments_and_Cards', icon: 'credit-card', useCases: 5 },
      { id: '05', name: 'Lending (Retail & SME)', path: '05_Lending_Retail_and_SME', icon: 'dollar', useCases: 5 },
    ]
  },
  {
    id: 'B',
    code: 'B',
    name: 'Risk, Fraud & Financial Crime',
    icon: 'shield',
    color: '#ef4444',
    path: 'B_Risk_Fraud_and_Financial_Crime',
    subdepartments: [
      { id: '01', name: 'Fraud Management', path: '01_Fraud_Management', icon: 'alert-triangle', useCases: 5 },
      { id: '02', name: 'Credit Risk & Lending', path: '02_Credit_Risk_Lending', icon: 'credit-card', useCases: 5 },
      { id: '03', name: 'AML & Financial Crime', path: '03_AML_Financial_Crime', icon: 'search', useCases: 5 },
      { id: '04', name: 'Collections & Recovery', path: '04_Collections_Recovery', icon: 'phone', useCases: 5 },
      { id: '10', name: 'Model Risk Management', path: '10_Model_Risk_Management', icon: 'clipboard-check', useCases: 3 },
    ]
  },
  {
    id: 'C',
    code: 'C',
    name: 'Operations & Cost Optimization',
    icon: 'cog',
    color: '#f59e0b',
    path: 'C_Operations_and_Cost_Optimization',
    subdepartments: [
      { id: '05', name: 'Contact Center', path: '05_Contact_Center', icon: 'headphones', useCases: 5 },
      { id: '06', name: 'Branch Operations', path: '06_Branch_Operations', icon: 'building', useCases: 5 },
      { id: '07', name: 'ATM & Cash Operations', path: '07_ATM_Cash_Operations', icon: 'credit-card-2', useCases: 5 },
      { id: '12', name: 'Workforce & HR Management', path: '12_Workforce_HR_Management', icon: 'users', useCases: 3 },
      { id: '15', name: 'Dispute & Chargeback', path: '15_Dispute_and_Chargeback_Operations', icon: 'alert-circle', useCases: 3 },
    ]
  },
  {
    id: 'D',
    code: 'D',
    name: 'Data Governance & Platform',
    icon: 'database',
    color: '#3b82f6',
    path: 'D_Data_Governance_and_Platform',
    subdepartments: [
      { id: '13', name: 'Data & AI Governance', path: '13_Data_AI_Governance', icon: 'governance', useCases: 3 },
      { id: '16', name: 'Data Governance & Quality', path: '16_Data_Governance_and_Quality', icon: 'check-circle', useCases: 3 },
      { id: '17', name: 'Enterprise Analytics & BI', path: '17_Enterprise_Analytics_BI', icon: 'analytics', useCases: 3 },
      { id: '18', name: 'Responsible AI Governance', path: '18_Responsible_AI_Governance', icon: 'shield', useCases: 3 },
      { id: '20', name: 'AI FinOps & Cost Governance', path: '20_AI_FinOps_Cost_Governance', icon: 'dollar', useCases: 3 },
    ]
  },
  {
    id: 'E',
    code: 'E',
    name: 'Technology, IT & Resilience',
    icon: 'cpu',
    color: '#8b5cf6',
    path: 'E_Technology_IT_and_Resilience',
    subdepartments: [
      { id: '21', name: 'IT Operations & AIOps', path: '21_IT_Operations_AIOps', icon: 'server', useCases: 3 },
      { id: '22', name: 'Enterprise Architecture', path: '22_Enterprise_Architecture', icon: 'layers', useCases: 3 },
      { id: '23', name: 'Cybersecurity', path: '23_Cybersecurity', icon: 'lock', useCases: 3 },
      { id: '24', name: 'Identity & Access Management', path: '24_Identity_and_Access_Management', icon: 'user-check', useCases: 3 },
      { id: '25', name: 'Cloud & Infrastructure Ops', path: '25_Cloud_and_Infrastructure_Ops', icon: 'cloud', useCases: 3 },
    ]
  },
  {
    id: 'F',
    code: 'F',
    name: 'ESG, Regulatory & Strategic',
    icon: 'globe',
    color: '#059669',
    path: 'F_ESG_Regulatory_and_Strategic',
    subdepartments: [
      { id: '26', name: 'ESG Reporting & Disclosure', path: '26_ESG_Reporting_and_Disclosure', icon: 'file', useCases: 3 },
      { id: '27', name: 'Climate Risk Management', path: '27_Climate_Risk_Management', icon: 'thermometer', useCases: 3 },
      { id: '28', name: 'Green & Sustainable Finance', path: '28_Green_Sustainable_Finance', icon: 'leaf', useCases: 3 },
      { id: '29', name: 'ESG Data Governance', path: '29_ESG_Data_Governance_and_Assurance', icon: 'database', useCases: 3 },
      { id: '30', name: 'Carbon Accounting', path: '30_Carbon_Accounting', icon: 'pie-chart', useCases: 3 },
    ]
  },
  {
    id: 'G',
    code: 'G',
    name: 'Executive & Enterprise Decisioning',
    icon: 'briefcase',
    color: '#7c3aed',
    path: 'G_Executive_and_Enterprise_Decisioning',
    subdepartments: [
      { id: '08', name: 'Treasury & Finance', path: '08_Treasury_Finance', icon: 'landmark', useCases: 5 },
      { id: '14', name: 'Strategy & Transformation', path: '14_Strategy_Transformation_Office', icon: 'target', useCases: 3 },
      { id: '31', name: 'Strategy & Board Office', path: '31_Strategy_and_Board_Office', icon: 'briefcase', useCases: 3 },
      { id: '32', name: 'Treasury', path: '32_Treasury', icon: 'landmark', useCases: 3 },
      { id: '33', name: 'Finance & FP&A', path: '33_Finance_FPA', icon: 'calculator', useCases: 3 },
      { id: '34', name: 'Enterprise Risk Management', path: '34_Enterprise_Risk_Management', icon: 'shield', useCases: 3 },
      { id: '35', name: 'Transformation Office', path: '35_Transformation_Office', icon: 'zap', useCases: 3 },
    ]
  }
];

// AI Categories (7 types) - matches folder structure
export const aiCategories = [
  { id: '1', name: 'Business AI', path: '1_Business_AI', icon: 'briefcase', color: '#3b82f6' },
  { id: '2', name: 'Decision Intelligence AI', path: '2_Decision_Intelligence_AI', icon: 'brain', color: '#10b981' },
  { id: '3', name: 'Analytic AI', path: '3_Analytic_AI', icon: 'analytics', color: '#f59e0b' },
  { id: '4', name: 'Transactional Assistive AI', path: '4_Transactional_Assistive_AI', icon: 'zap', color: '#ef4444' },
  { id: '5', name: 'Operational AI', path: '5_Operational_AI', icon: 'cog', color: '#8b5cf6' },
  { id: '6', name: 'Autonomous AI', path: '6_Autonomous_AI', icon: 'cpu', color: '#0891b2' },
  { id: '7', name: 'Governance Control AI', path: '7_Governance_Control_AI', icon: 'shield', color: '#dc2626' },
];

// Value Drivers (5 types) - matches folder structure
export const valueDrivers = [
  { id: 'A', name: 'Revenue Growth', path: 'Revenue_Growth', icon: 'trending-up', color: '#10b981' },
  { id: 'B', name: 'Cost Reduction / OPEX', path: 'Cost_Reduction_OPEX_Optimization', icon: 'dollar', color: '#ef4444' },
  { id: 'C', name: 'Productivity & Speed', path: 'Productivity_Speed', icon: 'zap', color: '#f59e0b' },
  { id: 'D', name: 'Decision Intelligence', path: 'Decision_Intelligence', icon: 'brain', color: '#3b82f6' },
  { id: 'E', name: 'Visibility & Governance', path: 'Visibility_Control_Governance', icon: 'eye', color: '#8b5cf6' },
];

// Helper function to get department by ID
export const getDepartmentById = (groupId, deptId) => {
  const group = folderStructure.find(g => g.id === groupId);
  if (!group) return null;
  return group.subdepartments.find(d => d.id === deptId);
};

// Helper function to get group by ID
export const getGroupById = (groupId) => {
  return folderStructure.find(g => g.id === groupId);
};

// Get total use cases count
export const getTotalUseCases = () => {
  return folderStructure.reduce((total, group) => {
    return total + group.subdepartments.reduce((groupTotal, dept) => groupTotal + dept.useCases, 0);
  }, 0);
};

// Get total departments count
export const getTotalDepartments = () => {
  return folderStructure.reduce((total, group) => total + group.subdepartments.length, 0);
};
