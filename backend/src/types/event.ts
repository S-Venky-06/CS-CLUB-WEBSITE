export interface Event {
  eventId: string;
  title: string;
  description: string;
  date: string;
  capacity: number;
  deadline: string;
  status: "active" | "cancelled" | "completed";
  location?: string;
  price: number;
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
  paymentStatus?: string;
  utrNumber?: string;
  screenshotUrl?: string;
}

export interface Member {
  email: string;
  name: string;
  role: "member" | "admin" | "super_admin";
  visible: boolean;
  displayOrder: number;
}



