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

export interface TeamMember {
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  branch: string;
  section: string;
}

export interface Registration {
  registrationId: string;
  eventId: string;
  email: string;
  name: string;
  registeredAt: string;
  phone: string;
  year: string;
  section: string;
  branch: string;
  rollNumber: string;
  otherComments?: string;
  attendedMembers: string[];
  paymentStatus?: string;
  transactionId?: string;
  teamSize: number;
  teamMembers?: TeamMember[];
  emailStatus?: string;
}

export interface Member {
  email: string;
  name: string;
  role: "member" | "admin" | "super_admin";
  visible: boolean;
  displayOrder: number;
}



