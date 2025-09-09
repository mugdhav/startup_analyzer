
export interface DataSource {
  name: string;
  url: string;
}

export interface AnalysisItem {
  score: number;
  summary: string;
  pros: string[];
  cons: string[];
  sources: DataSource[];
}

export interface CompanyEvaluation {
  companyName: string;
  logoUrl: string;
  industry: string;
  fundingStatus: string;
  overallScore: number;
  founderAnalysis: AnalysisItem;
  marketAnalysis: AnalysisItem;
  technicalAnalysis: AnalysisItem;
  competitorAnalysis: AnalysisItem;
}