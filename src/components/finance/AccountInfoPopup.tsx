'use client';

import { useState } from 'react';
import type { AccountType } from '@/types/finance';

/**
 * Info popup — explains what each investment platform is, in casual-game
 * friendly Hebrew. Approved copy from PRD 2.3.
 */
const COPY: Partial<Record<AccountType, { title: string; body: string }>> = {
  deposit: {
    title: 'פיקדון בנקאי',
    body:
      'כסף שאתה שם בבנק לזמן קצוב, והבנק משלם לך ריבית בטוחה אבל קטנה. ' +
      'זו הדרך הכי בטוחה להגן על הכסף שלך מהאינפלציה.',
  },
  index_fund: {
    title: 'קרן כספית',
    body:
      'קרן שמשקיעה בנכסים סולידיים ועדיין נותנת תשואה גבוהה יותר מהפיקדון. ' +
      'סיכון נמוך, תשואה בינונית, גישה לכסף שלך מתי שתרצה.',
  },
  provident: {
    title: 'קופת גמל להשקעה',
    body:
      'השקעה לטווח ארוך עם הטבת מס: הרווח הצפוי גדול יותר, אבל הסיכון גם גדול. ' +
      'נכון לכסף שאתה לא צריך השנה.',
  },
  single_stock: {
    title: 'S&P 500',
    body:
      'סל של 500 החברות הגדולות בארה״ב. תנודתי בטווח הקצר — ' +
      'אבל לאורך זמן השוק נוטה לעלות. מתאים לצמיחה לטווח ארוך.',
  },
};

interface Props {
  accountType: AccountType;
}

export default function AccountInfoPopup({ accountType }: Props) {
  const [open, setOpen] = useState(false);
  const copy = COPY[accountType];
  if (!copy) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={`מידע על ${copy.title}`}
        className="mk-info-btn"
      >
        i
      </button>

      {open && (
        <div
          className="mk-info-overlay"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="mk-info-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mk-info-title">{copy.title}</div>
            <div className="mk-info-body">{copy.body}</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mk-info-close"
            >
              הבנתי
            </button>
          </div>
        </div>
      )}
    </>
  );
}
