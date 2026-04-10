import type { Language } from '../types';

export type LegalPage = 'trust' | 'privacy' | 'terms' | 'medical' | 'compliance';

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalPageContent = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

export const LEGAL_PAGE_ORDER: LegalPage[] = ['trust', 'privacy', 'terms', 'medical', 'compliance'];

export const LEGAL_PAGE_LABELS: Record<Language, Record<LegalPage, string>> = {
  en: { trust: 'Trust & Limits', privacy: 'Privacy Policy', terms: 'Terms Of Use', medical: 'Medical Disclaimer', compliance: 'Compliance Notice' },
  ru: { trust: 'Доверие И Границы', privacy: 'Политика Конфиденциальности', terms: 'Условия Использования', medical: 'Медицинский Дисклеймер', compliance: 'Уведомление О Комплайнс' },
  uk: { trust: 'Довіра Та Межі', privacy: 'Політика Конфіденційності', terms: 'Умови Використання', medical: 'Медичний Дисклеймер', compliance: 'Повідомлення Про Комплаєнс' },
  es: { trust: 'Confianza Y Límites', privacy: 'Política De Privacidad', terms: 'Términos De Uso', medical: 'Aviso Médico', compliance: 'Aviso De Cumplimiento' },
  fr: { trust: 'Confiance Et Limites', privacy: 'Politique De Confidentialité', terms: 'Conditions D’Utilisation', medical: 'Avertissement Médical', compliance: 'Avis De Conformité' },
  de: { trust: 'Vertrauen Und Grenzen', privacy: 'Datenschutzerklärung', terms: 'Nutzungsbedingungen', medical: 'Medizinischer Hinweis', compliance: 'Compliance-Hinweis' },
  zh: { trust: '信任与边界', privacy: '隐私政策', terms: '使用条款', medical: '医疗免责声明', compliance: '合规说明' },
  ja: { trust: '信頼と境界', privacy: 'プライバシーポリシー', terms: '利用規約', medical: '医療に関する免責', compliance: 'コンプライアンス通知' },
  pt: { trust: 'Confiança E Limites', privacy: 'Política De Privacidade', terms: 'Termos De Uso', medical: 'Aviso Médico', compliance: 'Aviso De Conformidade' },
  he: { trust: 'אמון וגבולות', privacy: 'מדיניות פרטיות', terms: 'תנאי שימוש', medical: 'הבהרה רפואית', compliance: 'הודעת תאימות' },
  ar: { trust: 'الثقة والحدود', privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام', medical: 'إخلاء مسؤولية طبية', compliance: 'إشعار الامتثال' },
};

export const LEGAL_UI_COPY: Record<Language, { copyright: string; reserved: string; classicNote: string }> = {
  en: { copyright: 'Copyright', reserved: 'All rights reserved.', classicNote: 'Clear policies, clear limits, clear responsibility.' },
  ru: { copyright: 'Копирайт', reserved: 'Все права защищены.', classicNote: 'Понятные правила, понятные границы, понятная ответственность.' },
  uk: { copyright: 'Копірайт', reserved: 'Усі права захищені.', classicNote: 'Зрозумілі правила, зрозумілі межі, зрозуміла відповідальність.' },
  es: { copyright: 'Copyright', reserved: 'Todos los derechos reservados.', classicNote: 'Políticas claras, límites claros y responsabilidad clara.' },
  fr: { copyright: 'Copyright', reserved: 'Tous droits réservés.', classicNote: 'Politiques claires, limites claires, responsabilité claire.' },
  de: { copyright: 'Copyright', reserved: 'Alle Rechte vorbehalten.', classicNote: 'Klare Regeln, klare Grenzen, klare Verantwortung.' },
  zh: { copyright: '版权', reserved: '保留所有权利。', classicNote: '规则清楚，边界清楚，责任清楚。' },
  ja: { copyright: '著作権', reserved: 'All rights reserved.', classicNote: '方針も、境界も、責任もわかりやすく。' },
  pt: { copyright: 'Copyright', reserved: 'Todos os direitos reservados.', classicNote: 'Políticas claras, limites claros, responsabilidade clara.' },
  he: { copyright: 'זכויות יוצרים', reserved: 'כל הזכויות שמורות.', classicNote: 'כללים ברורים, גבולות ברורים, אחריות ברורה.' },
  ar: { copyright: 'حقوق النشر', reserved: 'جميع الحقوق محفوظة.', classicNote: 'سياسات واضحة، حدود واضحة، ومسؤولية واضحة.' },
};

export const LEGAL_PAGE_CONTENT: Record<LegalPage, LegalPageContent> = {
  trust: {
    title: 'Trust & Limits',
    intro: 'This product is designed to help people notice change sooner, understand what matters now, and coordinate the next step with less confusion. It is not intended to replace clinical judgment, emergency services, or treatment decisions.',
    sections: [
      {
        title: 'What This Product Is For',
        paragraphs: [
          'T1D is a daily safety and support layer for families and adults living with type 1 diabetes. It helps organize signals, current status, family readiness, and recovery follow-up in one place.',
          'The product is intended to make important information easier to understand quickly. It is not intended to make medical decisions on behalf of a user or clinician.',
        ],
      },
      {
        title: 'What This Product Does Not Do',
        bullets: [
          'It does not diagnose, treat, cure, or prevent disease.',
          'It does not replace a clinician, emergency services, or a user’s own judgment.',
          'It does not guarantee that every critical event will be detected or prevented.',
          'It should not be used as the only source of information in a dangerous or urgent situation.',
        ],
      },
      {
        title: 'Reliance On Data',
        paragraphs: [
          'The product depends on incoming data quality, connectivity, account configuration, and timely human response. Delayed data, stale device signals, disconnected integrations, or account errors can reduce reliability.',
          'Users should treat device status, signal freshness, and confidence indicators as part of the product’s message. If data appears weak, delayed, or missing, the safest approach is to confirm status directly.',
        ],
      },
      {
        title: 'Emergency Situations',
        paragraphs: [
          'If a user appears to be in distress, unresponsive, severely symptomatic, or in a situation that could become immediately dangerous, seek emergency medical assistance and follow clinician guidance without waiting for the product to update.',
        ],
      },
      {
        title: 'Deployment Responsibility',
        paragraphs: [
          'Any organization that deploys this product is responsible for choosing the final legal posture, support workflow, contacts, and jurisdiction-specific compliance configuration. Production deployments should be reviewed by legal, privacy, security, and clinical stakeholders before launch.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'This Privacy Policy describes how the product handles account information, support configuration, connected device data, and operational records. Actual obligations may vary depending on who operates the deployment, where it is deployed, and whether it is offered directly to consumers or through a healthcare organization.',
    sections: [
      {
        title: 'Information We Handle',
        bullets: [
          'Account details such as name, email address, role, and sign-in state.',
          'Household setup information, including family members, backup support, and preferences.',
          'Connected device and sensor information, including CGM-related status, readings, trends, timestamps, and sync health.',
          'Operational records such as alerts, actions, delivery attempts, audit logs, and recovery summaries.',
        ],
      },
      {
        title: 'Why We Use Information',
        bullets: [
          'To show the current state and support the next step.',
          'To operate family support, backup routing, and recovery follow-up.',
          'To maintain safety logs, service health, and security monitoring.',
          'To investigate incidents, improve reliability, and meet legal obligations.',
        ],
      },
      {
        title: 'Connected Health Data',
        paragraphs: [
          'If a Dexcom or similar source is connected, the product may process health-related information such as glucose values, trend direction, timestamps, and device sync status. Access tokens and integration credentials should be stored server-side only.',
          'Production operators should limit access to health-related information to authorized users, maintain role-based controls, and define retention periods that fit their legal obligations and support model.',
        ],
      },
      {
        title: 'Sharing And Disclosure',
        paragraphs: [
          'The product is designed to show information only to the signed-in user and the family or support participants configured for that deployment. Data should not be disclosed outside the configured support model except where required by law, necessary for security response, or authorized by the user or account owner.',
          'If a deployment uses vendors or subprocessors, those relationships should be documented in the operator’s production privacy materials and agreements.',
        ],
      },
      {
        title: 'Security And Retention',
        bullets: [
          'Use role-based access and server-side credential storage.',
          'Protect health data in transit and at rest using current industry-standard safeguards.',
          'Retain only what is needed for service operation, incident review, legal duties, and user support.',
          'Delete or de-identify data when it is no longer needed for those purposes.',
        ],
      },
      {
        title: 'Privacy Requests',
        paragraphs: [
          'Production deployments should provide a clear process for access, correction, deletion, and complaint requests. If the service is offered by or for a healthcare organization, request handling may be governed by organization policies, applicable law, or contract.',
        ],
      },
      {
        title: 'Children And Family Accounts',
        paragraphs: [
          'Where a parent or guardian manages support on behalf of a child, the deployment should make clear who controls the account, who may view health-related information, and how access is revoked or transferred. Additional rules may apply in certain jurisdictions.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms Of Use',
    intro: 'These Terms of Use govern access to and use of the product. They should be reviewed and adapted by the operator before production deployment.',
    sections: [
      {
        title: 'Acceptance Of Terms',
        paragraphs: [
          'By accessing or using the product, a user agrees to the operator’s terms, privacy rules, and support model. If a user does not agree, the user should not use the service.',
        ],
      },
      {
        title: 'Eligibility And Accounts',
        bullets: [
          'Users must provide accurate account information.',
          'Users are responsible for protecting their sign-in credentials.',
          'A parent, guardian, or authorized adult may configure family support on behalf of another person where permitted by law and policy.',
        ],
      },
      {
        title: 'Permitted Use',
        bullets: [
          'Use the service only for lawful, authorized support purposes.',
          'Do not interfere with the service, misuse connected accounts, or attempt unauthorized access.',
          'Do not represent the service as a substitute for emergency or professional medical care.',
        ],
      },
      {
        title: 'Availability And Changes',
        paragraphs: [
          'The service may change, be updated, be paused, or be discontinued. Features, integrations, and legal posture may vary by deployment and over time.',
          'The operator may modify these terms, update service behavior, or suspend access where needed for security, safety, maintenance, or legal reasons.',
        ],
      },
      {
        title: 'No Medical Service Relationship',
        paragraphs: [
          'Use of the product does not create a doctor-patient relationship, emergency response relationship, or any guarantee of clinical oversight unless a separate written agreement explicitly states otherwise.',
        ],
      },
      {
        title: 'Disclaimers And Limits Of Liability',
        paragraphs: [
          'The service is provided subject to the operator’s legal terms and applicable law. Production terms should include jurisdiction-specific language on warranties, liability, indemnity, and dispute handling.',
          'Because this product processes health-related information, legal review is strongly recommended before any public or commercial deployment.',
        ],
      },
      {
        title: 'Intellectual Property',
        paragraphs: [
          'Unless otherwise stated, the product interface, code, content, design system, and product materials remain the property of the operator or applicable licensors.',
        ],
      },
    ],
  },
  medical: {
    title: 'Medical Disclaimer',
    intro: 'This product is not a medical device, not a diagnostic tool, and not a treatment system. It is a software support layer intended to help users notice change, coordinate response, and track recovery.',
    sections: [
      {
        title: 'No Diagnosis Or Treatment',
        bullets: [
          'The product does not diagnose medical conditions.',
          'The product does not prescribe or administer treatment.',
          'The product does not replace a clinician’s judgment, instructions, or monitoring.',
        ],
      },
      {
        title: 'Use With Professional Care',
        paragraphs: [
          'People living with type 1 diabetes should continue to follow their clinical care plan, device instructions, and guidance from qualified medical professionals. Product messages should be considered alongside direct observation, device status, and clinician guidance.',
        ],
      },
      {
        title: 'Emergency Instructions',
        paragraphs: [
          'If there is loss of consciousness, confusion, seizure, severe symptoms, or any situation that could become dangerous quickly, seek emergency medical help immediately and do not rely on the product as the sole source of direction.',
        ],
      },
      {
        title: 'Data And Device Limits',
        paragraphs: [
          'Messages shown by the product depend on incoming data, sync timing, device health, network conditions, and household configuration. Delays, gaps, stale data, or integration failures may affect what the product can show.',
        ],
      },
      {
        title: 'Human Responsibility',
        paragraphs: [
          'Users and families remain responsible for monitoring real-life conditions, deciding how to respond, and escalating to medical professionals or emergency services when appropriate.',
        ],
      },
    ],
  },
  compliance: {
    title: 'Compliance Notice',
    intro: 'Compliance obligations depend on deployment model, operator role, jurisdiction, contract structure, and actual product behavior in production. This page is a product-ready draft notice and not a substitute for legal review.',
    sections: [
      {
        title: 'HIPAA Scope',
        paragraphs: [
          'HIPAA applies to covered entities and business associates. Some direct-to-consumer health apps are not covered by HIPAA, while deployments operated for or on behalf of covered entities may require HIPAA-specific contracts, controls, and workflows.',
          'If a deployment receives, maintains, or transmits protected health information on behalf of a covered entity, the operator should determine whether a business associate agreement and HIPAA safeguards are required.',
        ],
      },
      {
        title: 'FTC Health Data Obligations',
        paragraphs: [
          'Health apps and related technologies that are not covered by HIPAA may still be subject to the FTC Act and the FTC Health Breach Notification Rule. That rule can require notice to affected consumers, the FTC, and in some cases the media after certain breaches involving unsecured identifiable health information.',
        ],
      },
      {
        title: 'FDA / Medical Device Boundary',
        paragraphs: [
          'Whether software is regulated as a medical device depends on intended use, claims, and functionality. Production teams should review product claims, workflows, and regulatory posture carefully before launch, especially if adding diagnostic, treatment, or automated clinical decision functions.',
        ],
      },
      {
        title: 'Security And Incident Response',
        bullets: [
          'Maintain documented access control, logging, token management, and vendor review processes.',
          'Define breach notification and incident escalation paths before launch.',
          'Review retention, deletion, and backup practices regularly.',
          'Avoid making privacy or compliance claims in marketing that operations cannot support in practice.',
        ],
      },
      {
        title: 'Regional Review',
        paragraphs: [
          'If a deployment serves users in multiple jurisdictions, additional consumer privacy, children’s privacy, and health-data rules may apply. Operators should adapt these pages and product behavior to the laws that apply where the service is offered.',
        ],
      },
    ],
  },
};
