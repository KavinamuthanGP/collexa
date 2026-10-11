import type { CampusEvent, EventRegistration, RegistrationParticipant } from '@/types';

export type ParticipationType = 'solo' | 'team';
export type RegistrationFeeType = 'free' | 'paid';

export interface ResolvedEventConfig {
  participationType: ParticipationType;
  maxTeamSize: number;
  registrationFeeType: RegistrationFeeType;
  feeAmount: number;
}

export const resolveEventConfig = (event: CampusEvent): ResolvedEventConfig => {
  const participationType = event.participationType ?? 'solo';
  const registrationFeeType = event.registrationFeeType ?? 'free';

  return {
    participationType,
    maxTeamSize: participationType === 'team' ? clampTeamMax(event.maxTeamSize ?? 1) : 1,
    registrationFeeType,
    feeAmount: registrationFeeType === 'paid' ? Math.max(0, event.feeAmount ?? 0) : 0,
  };
};

const clampTeamMax = (value: number) => Math.min(5, Math.max(1, Math.floor(value)));

export const formatEventParticipationSummary = (event: CampusEvent): string => {
  const config = resolveEventConfig(event);
  const parts: string[] = [];

  if (config.participationType === 'team') {
    parts.push('Team', `Up to ${config.maxTeamSize} members`);
  } else {
    parts.push('Solo');
  }

  if (config.registrationFeeType === 'paid' && config.feeAmount > 0) {
    parts.push(`₹${config.feeAmount}`);
  } else {
    parts.push('Free');
  }

  return parts.join(' · ');
};

export const getRegistrationParticipants = (reg: EventRegistration): RegistrationParticipant[] => {
  if (reg.participants && reg.participants.length > 0) {
    return reg.participants;
  }

  return [
    {
      name: reg.name,
      email: reg.email,
      college: reg.college ?? '',
      department: reg.department,
      role: 'leader',
    },
  ];
};

export const formatLegacyRegistrationDetails = (reg: EventRegistration): string => {
  const parts = [reg.email, reg.department];
  if (reg.college) {
    parts.splice(1, 0, reg.college);
  }
  if (reg.year) {
    parts.push(`Year ${reg.year}`);
  }
  return parts.filter(Boolean).join(' · ');
};
