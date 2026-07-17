export interface Event {
  eventId: string;
  title: string;
  description: string;
  date: string;
  capacity: number;
  deadline: string;
  status: "active" | "cancelled" | "completed";
}

export interface Registration {
  registrationId: string;
  eventId: string;
  email: string;
  name: string;
  registeredAt: string;
  attended: boolean;
  motivation: string;
}

export interface Member {
  email: string;
  name: string;
  role: "member" | "admin" | "super_admin";
  visible: boolean;
  displayOrder: number;
}
