import React from 'react';
import type { DiabetesType, Language } from '../../types';
import type { T1DTheme } from '../../lib/t1d-ui';
import { resolveWorkspaceNav } from '../../lib/workspace-content';
import { workspaceNavTypeClass } from '../../lib/diabetes-type-theme';
import { WORKSPACE_SECTION_ORDER, type WorkspaceSectionId } from '../../content/workspace-nav-copy';

export type WorkspaceSidebarProps = {
  active: WorkspaceSectionId;
  onSelect: (section: WorkspaceSectionId) => void;
  theme: T1DTheme;
  lang: Language;
  diabetesType?: DiabetesType;
  isRTL?: boolean;
  horizontal?: boolean;
};

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  active,
  onSelect,
  theme,
  lang,
  diabetesType = 'type1',
  isRTL = false,
  horizontal = false,
}) => {
  const nav = resolveWorkspaceNav(lang, diabetesType);
  const tone = theme === 'dark' ? 't1d-workspace-nav--dark' : 't1d-workspace-nav--light';

  return (
    <nav
      className={`t1d-workspace-nav ${tone} ${workspaceNavTypeClass(diabetesType)} ${horizontal ? 't1d-workspace-nav--horizontal' : ''} ${isRTL ? 't1d-workspace-nav--rtl' : ''}`}
      aria-label={lang === 'ru' ? 'Разделы' : 'Sections'}
    >
      <div className="t1d-workspace-nav__list">
        {WORKSPACE_SECTION_ORDER.map((sectionId) => {
          const selected = active === sectionId;
          const item = nav[sectionId];
          return (
            <button
              key={sectionId}
              type="button"
              aria-current={selected ? 'page' : undefined}
              onClick={() => onSelect(sectionId)}
              className={`t1d-workspace-nav__item ${selected ? 't1d-workspace-nav__item--active' : ''}`}
            >
              <span className="t1d-workspace-nav__text">
                <span className="t1d-workspace-nav__label">{item.label}</span>
                <span className="t1d-workspace-nav__hint">{item.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
