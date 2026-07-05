import { randomBytes } from 'node:crypto';

export const handleHouseholdRoutes = async (ctx) => {
  const {
    req,
    res,
    url,
    lang,
    sendJson,
    readBody,
    BODY_TOO_LARGE,
    findSessionUser,
    readHouseholds,
    persistHouseholdRecord,
    persistHouseholdUpdate,
    updateUser,
    joinRateLimit,
    clientIp,
    t,
    safeText,
    generateInviteCode,
    normalizeDiabetesType,
    defaultSafetyPreferences,
    createDefaultSafetyState,
    buildWorkspacePayloadForRequest,
  } = ctx;

  if (req.method === 'GET' && url.pathname === '/api/workspace') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }
    const households = await readHouseholds();
    const household = households.find((entry) => entry.id === current.user.householdId) || null;
    sendJson(res, 200, buildWorkspacePayloadForRequest(req, current.user, household));
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/household/setup') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const body = await readBody(req);
    if (!body || typeof body !== 'object') {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return true;
    }

    const householdName = safeText(body.householdName, 120);
    const childName = safeText(body.childName, 120);
    const childAgeBand = safeText(body.childAgeBand, 40);
    const primaryParent = safeText(body.primaryParent, 120);
    const caregiverName = safeText(body.caregiverName, 120);
    const nightWindow = safeText(body.nightWindow, 60);

    if (!householdName || !childName || !primaryParent || !nightWindow) {
      sendJson(res, 400, { error: 'Household name, child, parent, and night window are required' });
      return true;
    }

    const households = await readHouseholds();
    const existing = households.find((entry) => entry.id === current.user.householdId);
    const diabetesType = normalizeDiabetesType(body.diabetesType ?? existing?.diabetesType);
    const initialSafetyState = createDefaultSafetyState({ primaryParent, caregiverName });
    const existingSafetyState = existing?.safetyState || initialSafetyState;
    const nextHousehold = existing
      ? {
          ...existing,
          householdName,
          childName,
          childAgeBand,
          primaryParent,
          caregiverName,
          nightWindow,
          diabetesType,
          inviteCode: existing.inviteCode || generateInviteCode(),
          members: (() => {
            const existingMembers = Array.isArray(existing.members) ? existing.members : [];
            const nextMembers = existingMembers.filter((member) => member.userId !== current.user.id);
            nextMembers.unshift({
              id: current.user.id,
              userId: current.user.id,
              fullName: current.user.fullName,
              email: current.user.email,
              role: current.user.role,
              status: 'active',
            });
            if (caregiverName) {
              const hasCaregiverInvite = nextMembers.some((member) => member.role === 'caregiver' && member.status === 'invited');
              if (!hasCaregiverInvite) {
                nextMembers.push({
                  id: `invite-${randomBytes(4).toString('hex')}`,
                  fullName: caregiverName,
                  email: '',
                  role: 'caregiver',
                  status: 'invited',
                });
              }
            }
            return nextMembers;
          })(),
          safetyPreferences: existing.safetyPreferences || defaultSafetyPreferences(diabetesType),
          safetyState: existingSafetyState,
          updatedAt: new Date().toISOString(),
        }
      : {
          id: randomBytes(10).toString('hex'),
          householdName,
          childName,
          childAgeBand,
          primaryParent,
          caregiverName,
          nightWindow,
          diabetesType,
          inviteCode: generateInviteCode(),
          members: [
            {
              id: current.user.id,
              userId: current.user.id,
              fullName: current.user.fullName,
              email: current.user.email,
              role: current.user.role,
              status: 'active',
            },
            ...(caregiverName
              ? [{
                  id: `invite-${randomBytes(4).toString('hex')}`,
                  fullName: caregiverName,
                  email: '',
                  role: 'caregiver',
                  status: 'invited',
                }]
              : []),
          ],
          safetyPreferences: defaultSafetyPreferences(diabetesType),
          safetyState: initialSafetyState,
          createdBy: current.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    await persistHouseholdRecord(households, nextHousehold);
    await updateUser(current.user.id, { householdId: nextHousehold.id });

    sendJson(res, 200, {
      household: buildWorkspacePayloadForRequest(req, current.user, nextHousehold).household,
    });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/household/join') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const limit = await joinRateLimit(clientIp(req));
    if (!limit.allowed) {
      sendJson(res, 429, { error: t(lang, 'rateLimited') });
      return true;
    }

    const body = await readBody(req);
    if (body === BODY_TOO_LARGE) {
      sendJson(res, 413, { error: 'Request body too large' });
      return true;
    }
    if (!body || typeof body !== 'object') {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return true;
    }

    const inviteCode = safeText(body.inviteCode, 40).toUpperCase();
    if (!inviteCode) {
      sendJson(res, 400, { error: 'Invite code is required' });
      return true;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.inviteCode === inviteCode);
    if (householdIndex === -1) {
      sendJson(res, 404, { error: 'Invite code was not found' });
      return true;
    }

    const household = households[householdIndex];
    const existingMembers = Array.isArray(household.members) ? household.members : [];
    const nextMembers = existingMembers.filter((member) => member.userId !== current.user.id);
    const invitedMatchIndex = nextMembers.findIndex((member) => member.status === 'invited' && member.role === current.user.role);

    if (invitedMatchIndex >= 0) {
      nextMembers[invitedMatchIndex] = {
        ...nextMembers[invitedMatchIndex],
        id: current.user.id,
        userId: current.user.id,
        fullName: current.user.fullName,
        email: current.user.email,
        status: 'active',
      };
    } else {
      sendJson(res, 403, { error: 'No invited member slot matches your role for this household' });
      return true;
    }

    const nextHousehold = {
      ...household,
      members: nextMembers,
      updatedAt: new Date().toISOString(),
    };
    await persistHouseholdUpdate(households, householdIndex, nextHousehold);
    await updateUser(current.user.id, { householdId: nextHousehold.id });

    sendJson(res, 200, {
      household: buildWorkspacePayloadForRequest(req, current.user, nextHousehold).household,
    });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/preferences') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const body = await readBody(req);
    if (!body || typeof body !== 'object') {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return true;
    }

    const daySensitivity = ['gentle', 'balanced', 'watchful'].includes(body.daySensitivity) ? body.daySensitivity : 'balanced';
    const nightSensitivity = ['balanced', 'protective', 'urgent'].includes(body.nightSensitivity) ? body.nightSensitivity : 'protective';
    const caregiverDelaySeconds = [20, 40, 60].includes(Number(body.caregiverDelaySeconds)) ? Number(body.caregiverDelaySeconds) : 60;
    const normalizePrimaryContact = (value, household) => {
      if (!['parent', 'adult', 'caregiver'].includes(value)) return 'parent';
      if (value === 'caregiver' && !safeText(household?.caregiverName, 120)) return 'parent';
      return value;
    };
    const households = await readHouseholds();
    const currentHousehold = households.find((entry) => entry.id === current.user.householdId);
    const dayPrimaryContact = normalizePrimaryContact(body.dayPrimaryContact, currentHousehold);
    const nightPrimaryContact = normalizePrimaryContact(body.nightPrimaryContact, currentHousehold);
    const glucoseUnit = body.glucoseUnit === 'mmol/L' ? 'mmol/L' : 'mg/dL';
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return true;
    }

    const nextHousehold = {
      ...households[householdIndex],
      safetyPreferences: {
        daySensitivity,
        nightSensitivity,
        caregiverDelaySeconds,
        dayPrimaryContact,
        nightPrimaryContact,
        glucoseUnit,
      },
      updatedAt: new Date().toISOString(),
    };
    await persistHouseholdUpdate(households, householdIndex, nextHousehold);
    sendJson(res, 200, buildWorkspacePayloadForRequest(req, current.user, nextHousehold));
    return true;
  }

  return false;
};
