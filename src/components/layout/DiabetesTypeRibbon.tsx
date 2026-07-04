import React from 'react';
import type { DiabetesType, Language } from '../../types';
import type { T1DTheme } from '../../lib/t1d-ui';
import { DIABETES_TYPE_COPY, diabetesTypeKey } from '../../content/diabetes-type-copy';
import { DIABETES_TYPE_VISUAL_COPY } from '../../content/diabetes-type-visual-copy';
import { MEMBER_PATH_COPY } from '../../content/member-path-copy';

type DiabetesTypeRibbonProps = {
  lang: Language;
  theme: T1DTheme;
  diabetesType: DiabetesType;
  isRTL?: boolean;
};

export const DiabetesTypeRibbon: React.FC<DiabetesTypeRibbonProps> = ({
  lang,
  theme,
  diabetesType,
  isRTL = false,
}) => {
  const typeCopy = DIABETES_TYPE_COPY[lang][diabetesTypeKey(diabetesType)];
  const visualCopy = DIABETES_TYPE_VISUAL_COPY[lang];
  const pathBadge = MEMBER_PATH_COPY[lang].badge[diabetesType];

  return (
    <div
      className={`t1d-type-ribbon t1d-type-ribbon--${diabetesType} ${theme === 'dark' ? 't1d-type-ribbon--dark' : 't1d-type-ribbon--light'} ${isRTL ? 't1d-type-ribbon--rtl' : ''}`}
      role="status"
      aria-label={`${typeCopy.label}. ${visualCopy.ribbonTag[diabetesType]}`}
    >
      <div className={`t1d-container flex flex-wrap items-center justify-between gap-3 py-2.5 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
        <div className={`flex flex-wrap items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className={`t1d-type-ribbon__badge t1d-type-ribbon__badge--${diabetesType}`}>{typeCopy.label}</span>
          <span className="t1d-type-ribbon__path">{pathBadge}</span>
        </div>
        <p className="t1d-type-ribbon__tag">{visualCopy.ribbonTag[diabetesType]}</p>
      </div>
    </div>
  );
};
