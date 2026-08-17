export interface Event {
  eventId: string;
  title: string;
  description: string;
  date: string;
  capacity: number;
  deadline: string;
  status: "active" | "cancelled" | "completed";
  location?: string;
}

export interface Registration {
  registrationId: string;
  eventId: string;
  email: string;
  name: string;
  registeredAt: string;
  attended: boolean;
  motivation: string;
  phone: string;
  year: string;
  section: string;
  branch: string;
  domain?: string;
  rollNumber: string;
  projects?: string;
  linkedin?: string;
  tryhackme?: string;
  hackthebox?: string;
  otherComments?: string;
}

export interface Member {
  email: string;
  name: string;
  role: "member" | "admin" | "super_admin";
  visible: boolean;
  displayOrder: number;
}

export interface GDResult {
  registrationId: string;
  name: string;
  rollNumber: string;
  branch: string;
  domain: string;
  gdTeam: string;
  assignedSupervisors: string;
  commScore: number;
  knowledgeScore: number;
  confidenceScore: number;
  realtimeScore: number;
  attackScore: number;
  totalScore: number;
  supervisorComments: string;
  stageStatus: string;
}

export interface Round2ShortlistCandidate {
  registrationId: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  domain: string;
  gdScore: number;
  supervisorComments: string;
  shortlistedAt: string;
}

