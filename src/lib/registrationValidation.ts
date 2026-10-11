import type { CampusEvent, RegistrationParticipant } from '@/types';
import { resolveEventConfig } from '@/lib/eventParticipation';

export interface ParticipantInput {
  name: string;
  email: string;
  college: string;
  department: string;
}

export interface AdminEventParticipationInput {
  participationType: 'solo' | 'team';
  maxTeamSize: number;
  registrationFeeType: 'free' | 'paid';
  feeAmount: number;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateAdminEventParticipation = (
  input: AdminEventParticipationInput,
): string | null => {
  if (input.participationType === 'team') {
    if (!Number.isInteger(input.maxTeamSize) || input.maxTeamSize < 1 || input.maxTeamSize > 5) {
      return 'Maximum team size must be between 1 and 5.';
    }
  }

  if (input.registrationFeeType === 'paid') {
    if (!Number.isFinite(input.feeAmount) || input.feeAmount <= 0) {
      return 'Enter a registration fee greater than 0.';
    }
  }

  return null;
};

export const validateParticipant = (participant: ParticipantInput, label: string): string | null => {
  if (!participant.name.trim()) {
    return `${label}: full name is required.`;
  }
  if (!participant.email.trim() || !EMAIL_PATTERN.test(participant.email.trim())) {
    return `${label}: a valid email is required.`;
  }
  if (!participant.college.trim()) {
    return `${label}: college is required.`;
  }
  if (!participant.department.trim()) {
    return `${label}: department is required.`;
  }
  return null;
};

export const validateRegistrationSubmit = (
  event: CampusEvent,
  leader: ParticipantInput,
  teammates: ParticipantInput[],
): string | null => {
  const config = resolveEventConfig(event);
  const leaderLabel = config.participationType === 'team' ? 'Team leader' : 'Participant';

  const leaderError = validateParticipant(leader, leaderLabel);
  if (leaderError) {
    return leaderError;
  }

  if (config.participationType === 'solo') {
    if (teammates.length > 0) {
      return 'Solo events do not allow teammates.';
    }
    return null;
  }

  for (let i = 0; i < teammates.length; i++) {
    const teammateError = validateParticipant(teammates[i], `Teammate ${i + 1}`);
    if (teammateError) {
      return teammateError;
    }
  }

  const total = 1 + teammates.length;
  if (total > config.maxTeamSize) {
    return `This event allows up to ${config.maxTeamSize} participants.`;
  }

  return null;
};

export const buildTeamParticipants = (
  leader: ParticipantInput,
  teammates: ParticipantInput[],
): RegistrationParticipant[] => [
  {
    name: leader.name.trim(),
    email: leader.email.trim(),
    college: leader.college.trim(),
    department: leader.department.trim(),
    role: 'leader',
  },
  ...teammates.map((member) => ({
    name: member.name.trim(),
    email: member.email.trim(),
    college: member.college.trim(),
    department: member.department.trim(),
    role: 'member' as const,
  })),
];
