import { randomBytes } from 'node:crypto';

export const provisionDefaultHouseholdForUser = async ({
  user,
  diabetesType,
  readHouseholds,
  persistHouseholdRecord,
  updateUser,
  normalizeDiabetesType,
  defaultSafetyPreferences,
  createDefaultSafetyState,
  generateInviteCode,
}) => {
  if (!user?.id || user.householdId) {
    return user;
  }

  const type = normalizeDiabetesType(diabetesType);
  const fullName = String(user.fullName || user.email?.split('@')[0] || 'Member').trim() || 'Member';
  const isType2 = type === 'type2';
  const childName = isType2 && user.role === 'adult' ? fullName : (isType2 ? 'Member' : 'Child');
  const primaryParent = user.role === 'parent' ? fullName : fullName;
  const caregiverName = user.role === 'caregiver' ? fullName : 'Support';
  const householdName = isType2 ? `${fullName} Circle` : `${childName} Support Circle`;
  const nightWindow = '10:00 PM - 7:00 AM';
  const childAgeBand = isType2 ? 'adult' : '8-12';
  const initialSafetyState = createDefaultSafetyState({ primaryParent, caregiverName });

  const nextHousehold = {
    id: randomBytes(10).toString('hex'),
    householdName,
    childName,
    childAgeBand,
    primaryParent,
    caregiverName,
    nightWindow,
    diabetesType: type,
    inviteCode: generateInviteCode(),
    members: [{
      id: user.id,
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: 'active',
    }],
    safetyPreferences: defaultSafetyPreferences(type),
    safetyState: initialSafetyState,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const households = await readHouseholds();
  await persistHouseholdRecord(households, nextHousehold);
  return updateUser(user.id, { householdId: nextHousehold.id });
};
