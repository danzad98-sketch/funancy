/**
 * Central UI text strings, keyed by short codes.
 *
 * Every tutorial / onboarding popup pulls its text from here. When
 * the user sends the Excel with finalized copy, swap the values in
 * this file (one place). Components only ever call `t('code')` —
 * no hardcoded Hebrew elsewhere in the tutorial layer.
 *
 * Codes used by the PRD ("user flow part 1"):
 *   tutorial_* — Part A tutorial popups
 *   stage1_*   — Part B mission flow popups
 *   inflection_1 / inflection_2 — explicitly requested by the PRD
 *   inflation_milk / inflation_basket — educational visual captions
 */

export const STRINGS: Record<string, string> = {
  // ===== Stage 1 — Onboarding tutorial (PRD v2 codes: onboarding_*) =====
  onboarding_welcome:      'ברוך הבא ל-Funancy! 🎉',
  onboarding_producer:     'לחץ על התנור כדי לייצר אייטמים ⚡ ייצר 4 אייטמים',
  onboarding_merge:        'גרור אייטמים זהים כדי לאחד אותם',
  onboarding_order:        'השלם את ההזמנה כדי להרוויח מטבעות 💰',
  onboarding_sell:         'לחץ על SELL כדי למכור',
  onboarding_coins:        'כאן רואים את המטבעות שלך 💰',
  onboarding_meta_nav:     'פתח את המטרות 🎯',
  onboarding_meta_item:    'לחץ לשדרוג ✨',
  onboarding_progress_bar: 'שדרג את כל החפצים לרמה המקסימלית 🏆',

  // Generic button labels (used by Stage 1 + Stage 2).
  onboarding_btn_continue: 'המשך',
  onboarding_btn_go:       'עבור',
  onboarding_btn_got_it:   'הבנתי',
  btn_next:                'הבא',
  btn_back_to_work:        'חזור לעבודה',
  btn_back_to_finance:     'חזור לניהול כספים',
  btn_show_me:             'תראה את זה בעצמך',
  btn_next_stage:          'לשלב הבא',

  // ===== Stage 2 — Time, inflation, interest, compound interest =====

  // Mission 1 — earn coins. Number must match STAGE2_MISSION1_TARGET in stage1Steps.ts (250).
  stage2_mission1_intro:    'משימה ראשונה: הרווח 250 מטבעות 💰',
  stage2_mission1_intro_btn:'עבור לעבודה',
  stage2_mission1_complete: 'המשימה הושלמה! 🎉 +2 מאיצי זמן',
  stage2_mission1_complete_btn: 'עבור למטרות',

  // 2.1 — first time booster
  timespeeder_intro:        'יש לך מאיץ זמן ⏳ לחץ עליו וראה מה קורה למחירים',

  // 2.2 — inflation explanation
  inflection_1:             'אינפלציה: עם השנים, אותו מוצר עולה יותר. הכסף שלך בארנק שווה פחות, גם אם המספר נשאר אותו דבר.',
  inflection_milk:          'באמת קרה: ב-2010 קרטון חלב עלה כ-5₪. ב-2024 כ-7₪. אותו מוצר — יותר כסף.',
  inflection_basket:        'עם 100₪ בשנת 2005 קנית סל קניות שלם. היום? בקושי חצי ממנו.',
  inflection_2:             'הזמן ממשיך לרוץ — לחץ שוב על מאיץ הזמן.',
  inflection_2_finance_btn: 'עבור לניהול כספים',

  // 2.3 — Deposit unlock (with inflation-link popup BEFORE the deposit explanation)
  deposit_inflation_link:   'איך מגנים על הכסף מהאינפלציה? התשובה הראשונה — תוכנית חיסכון פשוטה: הפיקדון הבנקאי.',
  deposit_intro:            'פיקדון בנקאי: שמים בבנק לזמן מוגדר, והבנק משלם ריבית בתמורה. הריבית מפצה על האינפלציה ושומרת על ערך הכסף.',

  // Mission 2 — deposit coins.
  // Number must match STAGE2_MISSION2_TARGET in stage1Steps.ts (200).
  stage2_mission2_intro:    'משימה: הפקד 200 מטבעות בפיקדון הבנקאי 🏛️',
  stage2_mission2_complete: 'המשימה הושלמה! 🎉 +1 מאיץ זמן',

  // 2.4 — interest + inflation hedge
  interest_intro:           'עכשיו נראה את הריבית בפעולה — לחץ על מאיץ הזמן.',
  interest_1:               'הפיקדון גדל. הריבית שהבנק שילם גדולה מהאינפלציה — הכסף שלך שמר על ערכו האמיתי.',
  interest_inflation_hedge: 'כסף בתוכנית החיסכון (פיקדון) שומר על ערכו.',
  interest_hedge_conclusion:'כסף שיושב בארנק — נשחק. כסף בפיקדון — שורד את האינפלציה.',

  // 2.5 — Meta Goal live demo
  meta_hedge_demo:          'הריבית כיסתה בדיוק את עליית המחיר — הכסף שלך לא נשחק 🛡️',

  // Mission 3 — earn more coins (see STAGE2_MISSION3_TARGET below).
  stage2_mission3_intro:    'ככל שתפקיד יותר — הריבית תעבוד קשה יותר בשבילך',
  // Number must match STAGE2_MISSION3_TARGET in stage1Steps.ts (200).
  stage2_mission3_intro_target: 'הרוויח עוד 200 מטבעות',
  stage2_mission3_intro_btn: 'חזור לעבוד',
  stage2_mission3_complete: 'המשימה הושלמה! 🎉',
  stage2_mission3_complete_btn: 'חזור לניהול כספים',

  // 2.6 — additional deposit + compound interest
  deposit_more_intro:       'הפקד את הכסף החדש שהרווחת — ותראה מה קורה עכשיו',
  compound_intro:           'לחץ שוב על מאיץ הזמן — הפעם תראה משהו אחר',
  compound_1:               'ריבית על ריבית — זה הפלא של ריבית דריבית ✨ הריבית הפעם מחושבת על הסכום הגדול.',
  compound_visual:          'ריבית רגילה מול ריבית דריבית — לאורך השנים',
  compound_2:               'כסף בארנק — איבד ערך מהאינפלציה ❌. כסף בפיקדון — גדל בזכות ריבית דריבית ✅',

  // 2.7 — stage complete
  stage2_complete:          'כל הכבוד! 🏆 השלמת את שלב 2 וקיבלת +50 אנרגיה ⚡',

  // No-speeder shake message
  no_speeder_msg:           'אין לך מאיצי זמן — השלם משימות כדי לקבל עוד ⏳',

  // Mission-reminder widget captions (shown above the mission text when
  // the player taps the floating ↗ badge).
  mission_reminder_caption_1: 'שלב 2 — משימה 1 מתוך 3',
  mission_reminder_caption_2: 'שלב 2 — משימה 2 מתוך 3',
  mission_reminder_caption_3: 'שלב 2 — משימה 3 מתוך 3',
  mission_reminder_aria:      'הצג משימה נוכחית',

  // ===== Stage openers — same template across all 5 stages =====
  stage1_opener_title:       'ברוך הבא ל-Funancy',
  stage1_opener_body:        'כאן לומדים לנהל כסף — לאט, בלי לחץ, עם הרבה תרגול. נתחיל בהיכרות עם המשחק.',
  stage1_opener_cta:         'בוא נתחיל',

  stage2_opener_title:       'הגנה על הכסף',
  stage2_opener_body:        'הכסף בארנק שלך נשחק עם הזמן — בלי שתשים לב.\nבשלב הזה נלמד איך מגנים עליו.',
  stage2_opener_cta:         'בוא נראה',

  stage3_opener_title:       'הרגלי חיסכון',
  stage3_opener_body:        'חיסכון אמיתי לא קורה לפי החלטות חודשיות.\nהוא קורה כשהוא רץ ברקע — אוטומטית, בלי שתחשוב על זה.',
  stage3_opener_cta:         'בוא נראה את זה בפעולה',

  stage4_opener_title:       'שוק ההון',
  stage4_opener_body:        'כאן הכסף יכול לצמוח הרבה — אבל גם ליפול.\nהכל תלוי בזמן ובסיכון.',
  stage4_opener_cta:         'בוא נכיר',

  stage5_opener_title:       'טווח קצר וטווח ארוך',
  stage5_opener_body:        'לכל מטרה — כלי משלה.\nהכסף שאתה צריך מחר לא יושב באותו מקום ככסף שאתה צריך עוד 20 שנה.',
  stage5_opener_cta:         'נסיים את המסע',

  // ===== Stage 3 — Standing-order savings habit (PRD User_flow_3) =====

  // 3.1 — Standing-order intro + setup
  intro_order_standing:      'הוראת קבע: 50% מכל מכירה עוברים אוטומטית לפיקדון. מי שמחכה לסוף החודש כדי לחסוך — בדרך כלל לא מגיע אליו. הוראת קבע עושה את זה בשבילך.',
  intro_order_standing_btn:  'הגדר הוראת קבע',
  setup_order_standing:      'הוראת הקבע מוגדרת: 50% מכל מכירה עוברים אוטומטית לפיקדון.',
  setup_order_standing_btn:  'אשר',
  setup_order_confirmation:  'הוראת הקבע פעילה ✓',

  // Mission 1 — complete orders
  // Number must match STAGE3_MISSION1_ORDERS in stage3Steps.ts (5).
  stage3_mission1_intro:     'משימה ראשונה: השלם 5 הזמנות בלוח העבודה',
  stage3_mission1_tagline:   'עכשיו תראה את הוראת הקבע עובדת',
  stage3_mission1_intro_btn: 'עבור לעבודה',
  stage3_mission1_complete:  'המשימה הושלמה! חזית את הפיצול עובד 5 פעמים. החיסכון נכנס לבד.',
  stage3_mission1_complete_btn: 'עבור לניהול כספים',

  // 3.2 — Standing order in action
  result_order_standing:     'זה נכנס לבד — בלי שהחלטת, בלי שזכרת. ככה נראה הרגל.',
  result_order_standing_btn: 'המשך',
  result_order_to_goals_btn: 'עבור למטרות',

  // First Temptation — Sale 1 (10% off)
  sale_1_notification:       '🔥 מבצע מוגבל! 10% הנחה על כל האייטמים — לזמן קצר בלבד!',

  // Mission 2 — complete more orders
  // Number must match STAGE3_MISSION2_ORDERS in stage3Steps.ts (8).
  stage3_mission2_intro:     'משימה: השלם עוד 8 הזמנות',
  stage3_mission2_intro_btn: 'חזור לעבוד',
  stage3_mission2_complete:  'המשימה הושלמה! הוראת הקבע ממשיכה לעבוד ברקע.',
  stage3_mission2_complete_btn: 'עבור לניהול כספים',

  // 3.3 — Time booster: see growth
  intro_growth_savings:      'ראה מה קרה לחיסכון שלך בזמן שעבדת.',
  intro_growth_savings_btn:  'המשך',
  visual_habit_savings:      'כל הזמנה שהשלמת — חצי ממנה עבד בשבילך בצד. זה ההרגל.',
  visual_habit_savings_btn:  'הבנתי',
  visual_habit_to_goals_btn: 'עבור למטרות',

  // Second Temptation — Sale 2
  sale_2_notification:       '⭐ מבצע נדיר! 10% הנחה — הפעם לא יחזור!',

  // Mission 3 — complete more orders
  // Number must match STAGE3_MISSION3_ORDERS in stage3Steps.ts (10).
  stage3_mission3_intro:     'משימה: השלם עוד 10 הזמנות',
  stage3_mission3_intro_btn: 'חזור לעבוד',
  stage3_mission3_complete:  'המשימה הושלמה! חזור לניהול כספים — ננתח את התנהגותך.',
  stage3_mission3_complete_btn: 'עבור לניהול כספים',

  // 3.4 — Final lesson branches (runtime [SAVED] / [SPENT] / [MISSING] interpolation)
  savings_lesson_disciplined:
    'הוראת הקבע חסכה לך [SAVED] מטבעות אוטומטית לאורך השלב — בלי מאמץ, בלי שהחלטת.\nובגלל שלא נכנעת למבצעים — יש לך בדיוק מה שצריך כדי להשלים את המטרות.',
  savings_lesson_partial:
    'הוראת הקבע חסכה לך [SAVED] מטבעות אוטומטית.\nאבל הוצאת [SPENT] על מבצע — ועכשיו חסרים לך עוד [MISSING].\nהנחה של 10% נשמעת כדאית, אבל הכסף שנשאר בפיקדון הרוויח [INTEREST]% ריבית בינתיים.',
  savings_lesson_spent:
    'הוראת הקבע עשתה את עבודתה — אבל הוצאת [SPENT] על שני המבצעים.\nתצטרך לעבוד קצת יותר כדי להשלים.\nבפעם הבאה — תן לחיסכון לעבוד בשקט.',
  savings_lesson_disciplined_btn: 'עבור למטרות',
  savings_lesson_makeup_btn:      'חזור לעבוד',

  // Makeup missions (only inserted if player spent during sales)
  stage3_makeup_mission:      'משימת השלמה: השלם עוד [TARGET] הזמנות',
  stage3_makeup_mission_full: 'משימת השלמה גדולה: השלם עוד [TARGET] הזמנות',
  stage3_makeup_complete:     'השלמת את היעד! חזור למטרות.',
  stage3_makeup_complete_btn: 'עבור למטרות',

  // 3.5 — Stage complete
  stage3_complete:           'כל הכבוד! 🏆 השלמת את שלב 3 וקיבלת +75 אנרגיה ⚡ ו-+3 מאיצי זמן ⏳',

  // Sale UI
  sale_active_banner:        '⏳ מבצע פעיל — 10% הנחה',
  sale_ended_toast:          'המבצע הסתיים',

  // Standing-order UI labels
  standing_order_label:      'הוראת קבע פעילה',
  standing_order_rate:       '50% מכל מכירה → פיקדון',

  // Stage 3 mission-reminder widget captions (new: 3 missions, not 5)
  mission_reminder_caption_s3_1: 'שלב 3 — משימה 1 מתוך 3',
  mission_reminder_caption_s3_2: 'שלב 3 — משימה 2 מתוך 3',
  mission_reminder_caption_s3_3: 'שלב 3 — משימה 3 מתוך 3',
  mission_reminder_caption_s3_makeup: 'שלב 3 — משימת השלמה',

  // Buttons
  btn_understood2:           'הבנתי',

  // ===== Stage 4 — Stock market (S&P 500) =====
  intro_stock:              'מניה היא בעלות חלקית בחברה. כשהחברה גדלה — גדל גם הערך של המניה שלך. כשהיא צונחת — גם המניה יורדת.',
  intro_index:              'מדד — סל שמחבר מניות של הרבה חברות יחד. אם חברה אחת קורסת, שאר החברות בסל ממשיכות. זה פיזור הסיכון שלך.',
  intro_sp500:              'מדד S&P 500 — סל של 500 החברות הגדולות בארה״ב. כשאתה משקיע במדד — אתה משקיע ב-500 חברות בבת אחת.',
  btn_invest:               'בוא נשקיע',

  // Mission 1 — earn coins.
  // Number must match STAGE4_MISSION1_TARGET in stage4Steps.ts (350).
  stage4_mission1_intro:    'משימה ראשונה: הרווח 350 מטבעות להשקעה 💰',
  stage4_mission1_intro_btn:'עבור לעבודה',
  stage4_mission1_complete: 'המשימה הושלמה! 🎉 +2 מאיצי זמן',
  stage4_mission1_complete_btn: 'עבור לניהול כספים',

  // Mission 2 — invest in S&P 500.
  // Number must match STAGE4_MISSION2_TARGET in stage4Steps.ts (350).
  stage4_mission2_intro:    'משימה: השקע 350 מטבעות ב-S&P 500 📈',

  // 4.2 first booster — growth (framed as "good period" example)
  intro_growth_sp500:       'שוק ההון מורכב מעליות וירידות. לחץ על מאיץ הזמן ותראה דוגמה.',
  result_growth_sp500:      'ההשקעה גדלה ב-[GROWTH]% 📈 זאת דוגמה לתקופה טובה — לא תמיד זה ככה.',

  // 4.3 second booster — scripted volatility / drop lesson
  intro_volatility:         'לחץ שוב.',
  lesson_volatility:        'ירידה כזאת היא הפסד אמיתי. מי שמוכר בפאניקה — מקבע את ההפסד. מי שמחזיק לטווח ארוך — מחכה להתאוששות, ובדרך כלל מקבל אותה.',

  // 4.4 risk spectrum
  spectrum_risk:            'אין השקעה מושלמת — יש השקעה שמתאימה למטרה שלך ולרמת הסיכון שאתה מוכן לקחת',
  spectrum_risk_deposit_label:    'פיקדון בנקאי',
  spectrum_risk_deposit_risk:     'סיכון נמוך',
  spectrum_risk_deposit_return:   'תשואה נמוכה וצפויה',
  spectrum_risk_deposit_use:      'שמירה על ערך',
  spectrum_risk_mm_label:         'קרן כספית',
  spectrum_risk_mm_risk:          'סיכון בינוני נמוך',
  spectrum_risk_mm_return:        'תשואה בינונית',
  spectrum_risk_mm_use:           'חיסכון יציב',
  spectrum_risk_sp500_label:      'S&P 500',
  spectrum_risk_sp500_risk:       'סיכון בינוני',
  spectrum_risk_sp500_return:     'תשואה גבוהה יותר, לא מובטחת',
  spectrum_risk_sp500_use:        'צמיחה לאורך זמן',
  stage4_to_goals_btn:      'עבור למטרות',
  spectrum_risk_btn:        'הבנתי',

  // Stage complete
  stage4_complete:          'כל הכבוד! 🏆 השלמת את שלב 4 וקיבלת +100 אנרגיה ⚡ ו-+5 מאיצי זמן ⏳',

  // Stage 4 mission-reminder captions
  mission_reminder_caption_s4_1: 'שלב 4 — משימה 1 מתוך 2',
  mission_reminder_caption_s4_2: 'שלב 4 — משימה 2 מתוך 2',

  // ===== Stage 5 — Short-term vs long-term (קופת גמל להשקעה) =====

  // 5.1 — Provident Fund intro (now 2 screens, bonus screen removed)
  intro_provident:           'קופת גמל להשקעה — אפיק חיסכון לטווח ארוך. תשואה גבוהה יותר, אבל הכסף נעול לתקופה. בזכות זה הוא צומח.',
  lock_provident:            'הכסף נעול ל-2 לחיצות מאיץ זמן. הנעילה מגינה על החיסכון מפיתויים — וזה מה שמאפשר לו לצמוח בלי הפרעה.',
  bonus_provident:           '', // deprecated — Screen C removed per spec

  // Mission 1
  // Number must match STAGE5_MISSION1_TARGET in stage5Steps.ts (500).
  stage5_mission1_intro:     'משימה ראשונה: הרווח 500 מטבעות 💰',
  stage5_mission1_intro_btn: 'עבור לעבודה',
  stage5_mission1_complete:  'המשימה הושלמה! 🎉 +2 מאיצי זמן',
  stage5_mission1_complete_btn: 'עבור לניהול כספים',

  // 5.2 — Allocation decision (player must split across instruments)
  decision_allocation:       'פצל את הכסף בין הכלים: חלק לטווח קצר (פיקדון), חלק לטווח בינוני (S&P 500), חלק לטווח ארוך (קופת גמל). אם אין מספיק — חזור לעבוד.',
  decision_allocation_btn:   'המשך',
  decision_allocation_hint:  'דרושה הפקדה ב-2 כלים לפחות כדי להמשיך',

  // 5.3 — First booster (parallel growth, line graph)
  intro_timespeeder_1_stage5:'קדם את הזמן ותראה איך כל כלי גדל בקצב שלו',
  lesson_growth_three:       'כל כלי גדל בקצב שלו: הפיקדון יציב ואיטי. המדד תנודתי, אבל בממוצע עולה. קופת הגמל גדלה הכי הרבה — אבל הכסף היה נעול.',
  lesson_growth_three_btn:   'עבור למטרות',

  // Camera event (forced liquidity moment on /goals)
  event_urgency:             '📸 אתה בחופשה והמצלמה נשברה — תיקון עולה 60 מטבעות. בלי תיקון, הזיכרונות מהחופשה יעלמו.',
  event_urgency_pay_btn:     'שלם תיקון',
  event_urgency_ignore_btn:  'התעלם',
  event_camera_fixed:        '📸 המצלמה תוקנה! 😊',
  event_camera_broken_caption:'מצלמה שבורה — לא היה כסף נזיל בזמן',

  // 5.4 — Second booster + unlock + lessons
  intro_unlock_provident:    'הגיע הזמן לראות מה עשתה קופת הגמל — לחץ על מאיץ הזמן ⏳',
  provident_unlocked:        'קופת הגמל נפתחה! 🔓',
  lesson_timeframe_1:        'לאורך זמן — קופת הגמל ניצחה. אבל בדרך לא יכולת לגעת בכסף.',
  lesson_timeframe_2:        'אין כלי טוב או רע — יש כלי שמתאים למתי שתצטרך את הכסף.',
  lesson_timeframe_2_btn:    'הבנתי',
  stage5_to_goals_btn:       'עבור למטרות',

  // Timeframe rule labels (used in LessonTimeframe2Screen)
  timeframe_short:           'עד שנה',
  timeframe_short_tool:      '🏦 פיקדון בנקאי',
  timeframe_mid:             '1–5 שנים',
  timeframe_mid_tool:        '📈 S&P 500',
  timeframe_long:            '5+ שנים',
  timeframe_long_tool:       '🔒 קופת גמל',

  // Stage 5 complete — END of intro journey
  stage5_complete:           'סיימת את Funancy! 🏆 עכשיו אתה יודע לא רק להרוויח, אלא גם לנהל.',
  btn_finish:                'סיום',

  // Mission-reminder widget caption
  mission_reminder_caption_s5_1: 'שלב 5 — משימה 1 מתוך 1',

  // Level-indicator widget — short stage labels (header chip + tooltip)
  stage_label_1: 'שלב 1 — הדרכה',
  stage_label_2: 'שלב 2 — אינפלציה וריבית',
  stage_label_3: 'שלב 3 — חיסכון והרגלים',
  stage_label_4: 'שלב 4 — שוק ההון',
  stage_label_5: 'שלב 5 — טווח קצר וטווח ארוך',
  stage_label_short_1: 'שלב 1',
  stage_label_short_2: 'שלב 2',
  stage_label_short_3: 'שלב 3',
  stage_label_short_4: 'שלב 4',
  stage_label_short_5: 'שלב 5',
};

/** Get a string by code. Falls back to the code itself if missing
 *  (so a missing key is loud, not silent). */
export function t(code: string): string {
  return STRINGS[code] ?? code;
}
