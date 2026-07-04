import type { DiabetesType } from '../types';

export const SIGNUP_DIABETES_TYPE_KEY = 't1d_signup_diabetes_type';

export const isDiabetesType = (value: string | null | undefined): value is DiabetesType =>
  value === 'type1' || value === 'type2';

export const parseDiabetesTypeParam = (search: string): DiabetesType | null => {
  const type = new URLSearchParams(search).get('type');
  return isDiabetesType(type) ? type : null;
};

export const readSignupDiabetesType = (): DiabetesType | null => {
  if (typeof window === 'undefined') return null;
  const fromUrl = parseDiabetesTypeParam(window.location.search);
  if (fromUrl) {
    window.localStorage.setItem(SIGNUP_DIABETES_TYPE_KEY, fromUrl);
    return fromUrl;
  }
  const stored = window.localStorage.getItem(SIGNUP_DIABETES_TYPE_KEY);
  return isDiabetesType(stored) ? stored : null;
};

export const setSignupDiabetesType = (type: DiabetesType) => {
  window.localStorage.setItem(SIGNUP_DIABETES_TYPE_KEY, type);
};

export const clearSignupDiabetesType = () => {
  window.localStorage.removeItem(SIGNUP_DIABETES_TYPE_KEY);
};

export const signupPathForType = (type: DiabetesType | null) =>
  type ? `/create-account?type=${type}` : '/create-account';

export const typeQuery = (type: DiabetesType | null) =>
  type ? `?type=${type}` : '';

export const accessPathForType = (type: DiabetesType | null) =>
  `/access${typeQuery(type)}`;

export const setupPathForType = (type: DiabetesType | null) =>
  `/household-setup${typeQuery(type)}`;

export const workspacePathForType = (type: DiabetesType | null) =>
  `/workspace${typeQuery(type)}`;

export const memberPathForRoute = (
  route: 'signin' | 'signup' | 'setup' | 'workspace',
  type: DiabetesType | null,
) => {
  if (route === 'signin') return accessPathForType(type);
  if (route === 'signup') return signupPathForType(type);
  if (route === 'setup') return setupPathForType(type);
  return workspacePathForType(type);
};

export const syncSignupTypeFromLocation = () => {
  readSignupDiabetesType();
};
