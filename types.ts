
export interface SkillGap {
  skill: string;
  current: number;
  required: number;
}

export interface RoadmapStep {
  title: string;
  duration: string;
  description: string;
  tasks: string[];
}

export interface ProjectSuggestion {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  techStack: string[];
}

export interface LearningResource {
  title: string;
  platform: string;
  type: 'Course' | 'Article' | 'Open Source' | 'Certification';
  url: string;
}

export interface ProfileOptimization {
  linkedinTips: string[];
  resumeTips: string[];
  keywords: string[];
}

export interface CareerPath {
  currentAssessment: string;
  skillsGap: SkillGap[];
  roadmap: RoadmapStep[];
  projects: ProjectSuggestion[];
  marketOutlook: string;
  learningResources: LearningResource[];
  profileOptimization: ProfileOptimization;
  vibeCheck30Day: {
    title: string;
    description: string;
    milestones: string[];
  };
  suggestedNextPaths: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: CareerPath | null;
  sources: GroundingSource[];
}

export interface ProfileInputs {
  dreamCareer: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeFile: File | null;
  resumeText: string;
}
