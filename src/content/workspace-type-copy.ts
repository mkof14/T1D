import type { Language } from '../types';

type RoleFocus = { title: string; body: string; points: [string, string, string] };

export interface WorkspaceTypeCopy {
  roleFocus: {
    adult: RoleFocus;
    parent: RoleFocus;
  };
  preferenceExplainer: string;
  failStates: {
    dayHint: string;
    nightHint: string;
  };
}

export const WORKSPACE_TYPE_COPY: Record<Language, WorkspaceTypeCopy> = {
  en: {
    roleFocus: {
      adult: {
        title: 'Adult T2D Safety View',
        body: 'This view keeps glucose highs, lows, and recovery clear without overload.',
        points: ['Watch highs and lows together', 'Respond with one clear action', 'Stay in recovery watch until stable'],
      },
      parent: {
        title: 'Partner Support View',
        body: 'The partner view balances low-glucose urgency with earlier attention to high readings.',
        points: ['Notice highs as well as lows', 'Confirm who is responding', 'Keep recovery covered'],
      },
    },
    preferenceExplainer: 'Type 2 defaults stay gentler by day and watch highs earlier. Adjust if your clinician recommends tighter lows.',
    failStates: {
      dayHint: 'Day mode stays lighter and watches highs earlier for type 2.',
      nightHint: 'Night mode stays balanced — not as tight on lows as type 1.',
    },
  },
  ru: {
    roleFocus: {
      adult: {
        title: 'Экран Взрослого С T2D',
        body: 'Этот экран держит высокие и низкие значения и восстановление понятными без перегруза.',
        points: ['Следить и за высокими, и за низкими', 'Отвечать одним ясным действием', 'Оставаться под наблюдением до стабилизации'],
      },
      parent: {
        title: 'Экран Партнёра При T2D',
        body: 'Экран партнёра сочетает срочность при низкой глюкозе с более ранним вниманием к высоким значениям.',
        points: ['Замечать и высокие, и низкие значения', 'Подтверждать, кто отвечает', 'Доводить восстановление до конца'],
      },
    },
    preferenceExplainer: 'Для типа 2 по умолчанию день мягче, а высокие значения отслеживаются раньше. Можно ужесточить, если так рекомендует врач.',
    failStates: {
      dayHint: 'Дневной режим мягче и раньше замечает высокие значения при типе 2.',
      nightHint: 'Ночной режим сбалансирован — не такой жёсткий к низким, как при типе 1.',
    },
  },
  uk: {
    roleFocus: {
      adult: {
        title: 'Екран Дорослого З T2D',
        body: 'Цей екран тримає високі та низькі значення і відновлення зрозумілими без перевантаження.',
        points: ['Стежити і за високими, і за низькими', 'Відповідати однією ясною дією', 'Залишатися під наглядом до стабілізації'],
      },
      parent: {
        title: 'Екран Батька При T2D',
        body: 'Екран батька поєднує терміновість низької глюкози з ранішою увагою до високих значень.',
        points: ['Помічати і високі, і низькі значення', 'Підтверджувати, хто відповідає', 'Доводити відновлення до кінця'],
      },
    },
    preferenceExplainer: 'Для типу 2 день за замовчуванням м’якший, а високі значення відстежуються раніше. Можна посилити, якщо так радить лікар.',
    failStates: {
      dayHint: 'Денний режим м’якший і раніше помічає високі значення при типі 2.',
      nightHint: 'Нічний режим збалансований — не такий жорсткий до низьких, як при типі 1.',
    },
  },
  es: {
    roleFocus: {
      adult: {
        title: 'Vista De Seguridad T2D',
        body: 'Esta vista mantiene claros los valores altos, bajos y la recuperación sin sobrecarga.',
        points: ['Vigilar altos y bajos', 'Responder con una acción clara', 'Permanecer en observación hasta estabilizar'],
      },
      parent: {
        title: 'Vista Parental T2D',
        body: 'La vista parental equilibra la urgencia de la hipoglucemia con atención temprana a lecturas altas.',
        points: ['Notar altos y bajos', 'Confirmar quién responde', 'Mantener la recuperación cubierta'],
      },
    },
    preferenceExplainer: 'Los valores predeterminados para tipo 2 son más suaves de día y vigilan altos antes. Ajústalos si tu clínico recomienda más control de bajos.',
    failStates: {
      dayHint: 'El modo diurno es más ligero y vigila altos antes en tipo 2.',
      nightHint: 'El modo nocturno está equilibrado — menos estricto con bajos que en tipo 1.',
    },
  },
  fr: {
    roleFocus: {
      adult: {
        title: 'Vue Sécurité T2D',
        body: 'Cette vue garde les hauts, les bas et la reprise clairs sans surcharge.',
        points: ['Surveiller hauts et bas', 'Répondre par une action claire', 'Rester en observation jusqu’à stabilisation'],
      },
      parent: {
        title: 'Vue Parent T2D',
        body: 'La vue parent équilibre l’urgence de l’hypoglycémie et l’attention plus précoce aux hautes valeurs.',
        points: ['Repérer hauts et bas', 'Confirmer qui répond', 'Garder la reprise couverte'],
      },
    },
    preferenceExplainer: 'Les réglages type 2 restent plus doux le jour et surveillent les hauts plus tôt. Ajustez si votre clinicien recommande des bas plus serrés.',
    failStates: {
      dayHint: 'Le mode jour reste plus léger et surveille les hauts plus tôt pour le type 2.',
      nightHint: 'Le mode nuit reste équilibré — moins strict sur les bas que pour le type 1.',
    },
  },
  de: {
    roleFocus: {
      adult: {
        title: 'T2D-Sicherheitsansicht',
        body: 'Diese Ansicht hält hohe und niedrige Werte sowie Erholung klar, ohne zu überladen.',
        points: ['Hohe und niedrige Werte beobachten', 'Mit einer klaren Aktion reagieren', 'In Beobachtung bleiben bis stabil'],
      },
      parent: {
        title: 'Elternansicht T2D',
        body: 'Die Elternansicht balanciert Hypoglykämie-Dringlichkeit mit früherer Aufmerksamkeit für hohe Werte.',
        points: ['Hohe und niedrige Werte bemerken', 'Bestätigen, wer reagiert', 'Erholung abdecken'],
      },
    },
    preferenceExplainer: 'Typ-2-Standards sind tagsüber sanfter und beobachten hohe Werte früher. Anpassen, wenn Ihr Arzt engere Untergrenzen empfiehlt.',
    failStates: {
      dayHint: 'Der Tagmodus bleibt leichter und beobachtet hohe Werte früher bei Typ 2.',
      nightHint: 'Der Nachtmodus bleibt ausgewogen — weniger streng bei Tiefwerten als bei Typ 1.',
    },
  },
  zh: {
    roleFocus: {
      adult: {
        title: 'T2D 成人安全视图',
        body: '此视图让高值、低值和恢复都保持清晰，不会过载。',
        points: ['同时关注高值和低值', '用一个明确动作回应', '稳定前保持恢复观察'],
      },
      parent: {
        title: 'T2D 家长安全视图',
        body: '家长视图在低血糖紧急性与更早关注高读数之间取得平衡。',
        points: ['注意高值和低值', '确认谁在响应', '保持恢复覆盖'],
      },
    },
    preferenceExplainer: '2 型默认白天更轻、更早关注高值。若临床建议更严格控制低值，可再调整。',
    failStates: {
      dayHint: '2 型白天模式更轻，并更早关注高值。',
      nightHint: '夜间模式保持平衡——对低值不如 1 型那么紧。',
    },
  },
  ja: {
    roleFocus: {
      adult: {
        title: 'T2D 成人向け安全ビュー',
        body: '高値・低値・回復を過負荷なくはっきり保つ画面です。',
        points: ['高値と低値の両方を見る', '一つの明確な行動で対応', '安定するまで回復見守りを続ける'],
      },
      parent: {
        title: 'T2D 保護者ビュー',
        body: '保護者ビューは低血糖の緊急さと高値への早い注意のバランスを取ります。',
        points: ['高値と低値の両方に気づく', '誰が対応しているか確認', '回復を最後までカバー'],
      },
    },
    preferenceExplainer: '2 型の既定は昼をやわらかく、高値を早めに見ます。低値をより厳しくする必要があれば調整してください。',
    failStates: {
      dayHint: '2 型の昼モードは軽めで、高値を早めに見ます。',
      nightHint: '夜モードはバランス型 — 1 型ほど低値に厳しくありません。',
    },
  },
  pt: {
    roleFocus: {
      adult: {
        title: 'Visão De Segurança T2D',
        body: 'Esta visão mantém altos, baixos e recuperação claros sem sobrecarga.',
        points: ['Observar altos e baixos', 'Responder com uma ação clara', 'Permanecer em observação até estabilizar'],
      },
      parent: {
        title: 'Visão Parental T2D',
        body: 'A visão parental equilibra urgência de hipoglicemia com atenção mais cedo a leituras altas.',
        points: ['Notar altos e baixos', 'Confirmar quem responde', 'Manter a recuperação coberta'],
      },
    },
    preferenceExplainer: 'Padrões do tipo 2 são mais suaves de dia e vigiam altos mais cedo. Ajuste se o clínico recomendar baixos mais apertados.',
    failStates: {
      dayHint: 'O modo diurno fica mais leve e vigia altos mais cedo no tipo 2.',
      nightHint: 'O modo noturno fica equilibrado — menos rígido com baixos que no tipo 1.',
    },
  },
  he: {
    roleFocus: {
      adult: {
        title: 'תצוגת בטיחות T2D',
        body: 'תצוגה זו שומרת על ערכים גבוהים, נמוכים והתאוששות ברורים בלי עומס.',
        points: ['לעקוב גם אחרי גבוהים וגם נמוכים', 'להגיב בפעולה אחת ברורה', 'להישאר במעקב עד יציבות'],
      },
      parent: {
        title: 'תצוגת הורה T2D',
        body: 'תצוגת ההורה מאזנת דחיפות של סוכר נמוך עם תשומת לב מוקדמת יותר לערכים גבוהים.',
        points: ['לשים לב גם לגבוהים וגם לנמוכים', 'לאשר מי מגיב', 'לשמור על כיסוי ההתאוששות'],
      },
    },
    preferenceExplainer: 'ברירות המחדל לסוג 2 רכות יותר ביום ועוקבות אחרי גבוהים מוקדם יותר. ניתן להדק אם הרופא ממליץ.',
    failStates: {
      dayHint: 'מצב יום נשאר קל יותר ועוקב אחרי גבוהים מוקדם יותר בסוג 2.',
      nightHint: 'מצב לילה מאוזן — פחות הדוק לנמוכים מאשר בסוג 1.',
    },
  },
  ar: {
    roleFocus: {
      adult: {
        title: 'عرض الأمان T2D',
        body: 'يعرض هذا الشاشة القراءات العالية والمنخفضة والتعافي بوضوح دون إرهاق.',
        points: ['مراقبة العالي والمنخفض معًا', 'الاستجابة بخطوة واحدة واضحة', 'البقاء تحت المراقبة حتى الاستقرار'],
      },
      parent: {
        title: 'عرض ولي الأمر T2D',
        body: 'يوازن عرض ولي الأمر بين إلحاح انخفاض السكر والانتباه المبكر للقراءات العالية.',
        points: ['ملاحظة العالي والمنخفض', 'تأكيد من يستجيب', 'إبقاء التعافي مغطى'],
      },
    },
    preferenceExplainer: 'إعدادات النوع 2 أخف نهارًا وتراقب العالي مبكرًا. عدّلها إذا أوصى الطبيب بمراقبة أدق للمنخفض.',
    failStates: {
      dayHint: 'وضع النهار أخف ويراقب العالي مبكرًا في النوع 2.',
      nightHint: 'وضع الليل متوازن — أقل صرامة مع المنخفض من النوع 1.',
    },
  },
};
