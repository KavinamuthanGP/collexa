export type UserRole = 'student' | 'admin';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  department?: string;
  year?: string;
}

export type ParticipationType = 'solo' | 'team';
export type RegistrationFeeType = 'free' | 'paid';

export interface CampusEvent {
  id: string;
  title: string;
  date: string;
  category: EventCategory;
  description: string;
  location?: string;
  organizer?: string;
  imageUrl?: string;
  club?: string;
  createdBy: string;
  createdAt: string;
  participationType?: ParticipationType;
  maxTeamSize?: number;
  registrationFeeType?: RegistrationFeeType;
  feeAmount?: number;
}

export type EventCategory = 'Academic' | 'Sports' | 'Cultural' | 'Tech' | 'Social' | 'Workshop';

export const EVENT_CATEGORIES: EventCategory[] = ['Academic', 'Sports', 'Cultural', 'Tech', 'Social', 'Workshop'];

export interface Team {
  id: string;
  name: string;
  description: string;
  members: string[];
  createdBy: string;
}

export interface MatchInsight {
  score: number;
  message: string;
}

export interface RegistrationParticipant {
  name: string;
  email: string;
  college: string;
  department: string;
  role: 'leader' | 'member';
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  name: string;
  email: string;
  department: string;
  /** Legacy registrations only; not collected in the new registration flow. */
  year?: string;
  college?: string;
  participants?: RegistrationParticipant[];
  registeredAt: string;
}

export type NewEventRegistration = Omit<EventRegistration, 'id' | 'registeredAt' | 'year'>;

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'update' | 'announcement';
  read: boolean;
  createdAt: string;
  eventId?: string;
}
