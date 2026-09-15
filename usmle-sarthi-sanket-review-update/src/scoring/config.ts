export const ALGORITHM_VERSION = 'v1.0';


/* =========================================================
   QUESTION DEFINITIONS
========================================================= */

export const questions: any[] = [
  [
    'E1',
    'Eligibility',
    'Visa/work authorization',
    'Based on the program’s current policy, does it sponsor or accept the visa or work authorization you will use?',
    'Always'
  ],

  [
    'E2',
    'Eligibility',
    'Year of graduation',
    'Does your year of graduation meet the program’s stated graduation-year requirement?',
    'Always'
  ],

  [
    'E3A',
    'Eligibility',
    'Exam score minimums',
    'Do your USMLE/COMLEX scores meet the program’s stated minimum-score requirements?',
    'Always'
  ],

  [
    'E3B',
    'Eligibility',
    'Exam attempts',
    'Does your USMLE/COMLEX attempt history meet the program’s stated attempt policy?',
    'Always'
  ],

  [
    'E4',
    'Eligibility',
    'Other requirements',
    'Do you meet all other published application requirements for this program?',
    'Always'
  ],

  [
    'E5',
    'Eligibility',
    'Override',
    'If there is a mismatch, is there a documented override?',
    'Any E1:E4 = NOT_ALIGNED'
  ],

  [
    'Q1',
    'Quantitative fit',
    'IMG receptivity',
    'How receptive is this program to an IMG of your applicant type?',
    'Eligibility resolved'
  ],

  [
    'Q2',
    'Quantitative fit',
    'Step 2 CK fit',
    "Where does your Step 2 CK score fall within the program's interview distribution?",
    'Eligibility resolved'
  ],

  [
    'Q3',
    'Quantitative fit',
    'Signal responsiveness',
    'How strongly does this program respond to the signal tier you are considering?',
    'Eligibility resolved'
  ],

  [
    'Q4',
    'Quantitative fit',
    'Interview selectivity',
    'What percentage of applicants does the program invite, relative to Internal Medicine norms?',
    'Eligibility resolved'
  ],

  [
    'Q5',
    'Quantitative fit',
    'Application trend',
    "What is the program's recent application-volume trend?",
    'Eligibility resolved'
  ],

  [
    'S1',
    'Historical applicant evidence',
    'Comparable interviews',
    'Based on Sarthi or another reliable source, how similar are applicants who previously interviewed here to your profile?',
    'Eligibility resolved'
  ],

  [
    'S2',
    'Historical applicant evidence',
    'Comparable matches',
    'Based on Sarthi or another reliable source, how similar are applicants who previously matched here to your profile?',
    'Eligibility resolved'
  ],

  [
    'R1',
    'Relationship and visibility',
    'Program experience',
    'What is your strongest clinical rotation or substantive research relationship with this program?',
    'Eligibility resolved'
  ],

  [
    'R2',
    'Relationship and visibility',
    'Internal advocate',
    'What is your strongest internal advocate or connection?',
    'Eligibility resolved'
  ],

  [
    'R3',
    'Relationship and visibility',
    'Outreach outcome',
    'What is your strongest meaningful outreach outcome?',
    'Eligibility resolved'
  ],

  [
    'A1',
    'Broader alignment',
    'School familiarity',
    'Is your medical school or medical-school country represented among current residents?',
    'Eligibility resolved'
  ],

  [
    'A2',
    'Broader alignment',
    'Academic/research fit',
    "How well does your academic and research profile align with this program's type and emphasis?",
    'Eligibility resolved'
  ],

  [
    'A3',
    'Broader alignment',
    'Geographic alignment',
    'How does this program align with your ERAS geographic preferences and credible ties?',
    'Eligibility resolved'
  ],

  [
    'A4',
    'Broader alignment',
    'Specialty alignment',
    'How strong is your Internal Medicine-specific alignment?',
    'Eligibility resolved'
  ],

  [
    'P1',
    'Context',
    'Prior history',
    'Have you previously applied to or interviewed at this program?',
    'Eligibility resolved'
  ]

].map(
  ([
    question_code,
    section,
    component,
    prompt,
    display_condition
  ]) => ({
    question_code,
    section,
    component,
    prompt,

    response_type: 'single',

    required:
      question_code === 'E5'
        ? 'Conditional'
        : 'Yes',

    display_condition,

    scope: 'Program-level'
  })
);


/* =========================================================
   PROGRAM-SPECIFIC QUESTIONS

   Student-facing wording lives here.

   This is intentionally separate from scoring codes.
========================================================= */

export const programSpecificQuestions: any[] = [

  {
    code: 'Q1',

    component: 'IMG receptivity',

    prompt:
      'How receptive is this program to an IMG of your applicant type?',

    options: [
      'Very strong',
      'Strong',
      'Moderate',
      'Low',
      'Negligible',
      'Source N/A'
    ]
  },


  {
    code: 'Q2',

    component: 'Step 2 CK fit',

    prompt:
      "Where does your Step 2 CK score fall within the program's interview distribution?",

    options: [
      '75th percentile or higher',
      'Median–74th',
      '25th–49th',
      '10th–24th',
      'Below 10th',
      'Source N/A'
    ]
  },


  {
    code: 'Q3',

    component: 'Signal responsiveness',

    prompt:
      'How strongly does this program respond to the signal tier you are considering?',

    options: [
      'Substantial signal lift',
      'Moderate signal lift',
      'Small signal lift',
      'Little or no lift',
      'Program does not use signals',
      'Source N/A'
    ]
  },


  {
    code: 'Q4',

    component: 'Interview selectivity',

    prompt:
      'What percentage of applicants does the program invite, relative to Internal Medicine norms?',

    options: [
      'Relatively high invited percentage',
      'Moderate invited percentage',
      'Low invited percentage',
      'Very low invited percentage',
      'Source N/A'
    ]
  },


  {
    code: 'Q5',

    component: 'Application trend',

    prompt:
      "What is the program's recent application-volume trend?",

    options: [
      'Declining',
      'Stable',
      'Increasing',
      'Sharply increasing',
      'Source N/A'
    ]
  },


  {
    code: 'S1',

    component: 'Comparable interviews',

    prompt:
      'Based on Sarthi or another reliable source, how similar are applicants who previously interviewed here to your profile?',

    options: [
      'Multiple close recent profiles',
      'One close recent profile',
      'Partial similarity',
      'Profiles materially stronger/different',
      'Profiles too incomplete',
      'No comparable information available'
    ]
  },


  {
    code: 'S2',

    component: 'Comparable matches',

    prompt:
      'Based on Sarthi or another reliable source, how similar are applicants who previously matched here to your profile?',

    options: [
      'Multiple close recent matches',
      'One close recent match',
      'Partial similarity',
      'Matched profiles materially different',
      'Profiles too incomplete',
      'No comparable information available'
    ]
  },


  {
    code: 'R1',

    component: 'Program experience',

    prompt:
      'What is your strongest clinical rotation or substantive research relationship with this program?',

    options: [
      'Direct program work with leadership/core faculty',
      'Program/primary hospital work without leadership exposure',
      'Same health system',
      'Affiliated site or physician/researcher',
      'Same region only',
      'No relationship'
    ]
  },


  {
    code: 'R2',

    component: 'Internal advocate',

    prompt:
      'What is your strongest internal advocate or connection?',

    options: [
      'Decision-maker explicitly advocating',
      'Core faculty/credible leader advocating',
      'Resident/connection with leadership access and agreed advocacy',
      'Knows applicant; no advocacy',
      'Superficial connection',
      'No connection'
    ]
  },


  {
    code: 'R3',

    component: 'Outreach outcome',

    prompt:
      'What is your strongest meaningful outreach outcome?',

    options: [
      'Explicitly encouraged to signal',
      'Explicitly encouraged to apply',
      'Favorable PD/APD/faculty response',
      'Favorable coordinator response',
      'Brief interaction or open house',
      'Sent/no response or no outreach'
    ]
  },


  {
    code: 'A1',

    component: 'School familiarity',

    prompt:
      'Is your medical school or medical-school country represented among current residents?',

    options: [
      'Exact medical school represented',
      'Same-country schools represented',
      'Neither shown or unknown'
    ]
  },


  {
    code: 'A2',

    component: 'Academic/research fit',

    prompt:
      "How well does your academic and research profile align with this program's type and emphasis?",

    options: [
      'Strong alignment',
      'Reasonable alignment',
      'Mixed or uncertain',
      'Clear mismatch'
    ]
  },


  {
    code: 'A3',

    component: 'Geographic alignment',

    prompt:
      'How does this program align with your ERAS geographic preferences and credible ties?',

    options: [
      'Aligned ERAS geography plus credible tie',
      'Aligned ERAS geography',
      'No preference / neutral',
      'Not aligned'
    ]
  },


  {
    code: 'A4',

    component: 'Specialty alignment',

    prompt:
      'How strong is your Internal Medicine-specific alignment?',

    options: [
      'Strong specialty-specific alignment',
      'Adequate',
      'Limited',
      'Weak or contradictory'
    ]
  },


  {
    code: 'P1',

    component: 'Prior history',

    prompt:
      'Have you previously applied to or interviewed at this program?',

    options: [
      'Previously interviewed',
      'Previously applied only',
      'Neither'
    ]
  }

];


/* =========================================================
   ANSWER SCORE BUILDER
========================================================= */

const r = (
  q: string,
  a: string,
  label: string,
  points: number | null,
  max: number,
  effect: string = 'SCORE',
  missing: number = 0,
  pos: string = '',
  neg: string = '',
  warn: string = ''
) => ({
  question_code: q,
  answer_code: a,
  answer_label: label,
  points,
  component_max: max,
  effect,
  confidence_missing: missing,
  positive_reason: pos,
  negative_reason: neg,
  warning_text: warn
});


/* =========================================================
   ANSWER SCORES
========================================================= */

export const answerScores: any[] = [

  /* -------------------------------------------------------
     ELIGIBILITY
  ------------------------------------------------------- */

  r(
    'E1',
    'ALIGNED',
    'Yes — I checked and I meet this requirement',
    null,
    0,
    'ALIGNED'
  ),

  r(
    'E1',
    'NOT_ALIGNED',
    'No — I checked and I do not meet this requirement',
    null,
    0,
    'NOT_ALIGNED'
  ),

  r(
    'E1',
    'NOT_VERIFIED',
    'Not sure — I have not confirmed this requirement',
    null,
    0,
    'NOT_VERIFIED',
    1
  ),

  r(
    'E1',
    'SOURCE_NA',
    'Information unavailable — no reliable source states the requirement',
    null,
    0,
    'SOURCE_NA',
    1
  ),


  r(
    'E2',
    'ALIGNED',
    'Yes — I checked and I meet this requirement',
    null,
    0,
    'ALIGNED'
  ),

  r(
    'E2',
    'NOT_ALIGNED',
    'No — I checked and I do not meet this requirement',
    null,
    0,
    'NOT_ALIGNED'
  ),

  r(
    'E2',
    'NOT_VERIFIED',
    'Not sure — I have not confirmed this requirement',
    null,
    0,
    'NOT_VERIFIED',
    1
  ),

  r(
    'E2',
    'SOURCE_NA',
    'Information unavailable — no reliable source states the requirement',
    null,
    0,
    'SOURCE_NA',
    1
  ),


  r(
    'E3A',
    'ALIGNED',
    'Yes — I checked and I meet this requirement',
    null,
    0,
    'ALIGNED'
  ),

  r(
    'E3A',
    'NOT_ALIGNED',
    'No — I checked and I do not meet this requirement',
    null,
    0,
    'NOT_ALIGNED'
  ),

  r(
    'E3A',
    'NOT_VERIFIED',
    'Not sure — I have not confirmed this requirement',
    null,
    0,
    'NOT_VERIFIED',
    1
  ),

  r(
    'E3A',
    'SOURCE_NA',
    'Information unavailable — no reliable source states the requirement',
    null,
    0,
    'SOURCE_NA',
    1
  ),


  r(
    'E3B',
    'ALIGNED',
    'Yes — I checked and I meet this requirement',
    null,
    0,
    'ALIGNED'
  ),

  r(
    'E3B',
    'NOT_ALIGNED',
    'No — I checked and I do not meet this requirement',
    null,
    0,
    'NOT_ALIGNED'
  ),

  r(
    'E3B',
    'NOT_VERIFIED',
    'Not sure — I have not confirmed this requirement',
    null,
    0,
    'NOT_VERIFIED',
    1
  ),

  r(
    'E3B',
    'SOURCE_NA',
    'Information unavailable — no reliable source states the requirement',
    null,
    0,
    'SOURCE_NA',
    1
  ),


  r(
    'E4',
    'ALIGNED',
    'Yes — I checked and I meet this requirement',
    null,
    0,
    'ALIGNED'
  ),

  r(
    'E4',
    'NOT_ALIGNED',
    'No — I checked and I do not meet this requirement',
    null,
    0,
    'NOT_ALIGNED'
  ),

  r(
    'E4',
    'NOT_VERIFIED',
    'Not sure — I have not confirmed this requirement',
    null,
    0,
    'NOT_VERIFIED',
    1
  ),

  r(
    'E4',
    'SOURCE_NA',
    'Information unavailable — no reliable source states the requirement',
    null,
    0,
    'SOURCE_NA',
    1
  ),


  /* E5 */

  r(
    'E5',
    'NO_OVERRIDE',
    'No override',
    null,
    0,
    'NO_OVERRIDE'
  ),

  r(
    'E5',
    'PROGRAM_CONFIRMED_EXCEPTION',
    'Program confirmed exception',
    null,
    0,
    'OVERRIDE',
    0,
    'Documented exception permits consideration',
    'Mismatch remains visible',
    'Override does not add points'
  ),

  r(
    'E5',
    'PD_APD_ENCOURAGEMENT',
    'PD/APD encouragement',
    null,
    0,
    'OVERRIDE',
    0,
    'Documented exception permits consideration',
    'Mismatch remains visible',
    'Override does not add points'
  ),

  r(
    'E5',
    'FAVORABLE_ROTATION',
    'Favorable program rotation',
    null,
    0,
    'OVERRIDE',
    0,
    'Documented exception permits consideration',
    'Mismatch remains visible',
    'Override does not add points'
  ),

  r(
    'E5',
    'INTERNAL_ADVOCATE',
    'Credible internal advocate',
    null,
    0,
    'OVERRIDE',
    0,
    'Documented exception permits consideration',
    'Mismatch remains visible',
    'Override does not add points'
  ),

  r(
    'E5',
    'OTHER',
    'Other documented exception',
    null,
    0,
    'OVERRIDE',
    0,
    'Documented exception permits consideration',
    'Mismatch remains visible',
    'Override does not add points'
  ),


  /* -------------------------------------------------------
     Q1 — IMG receptivity
     MAX 10
  ------------------------------------------------------- */

  r(
    'Q1',
    'VERY_STRONG',
    'Very strong',
    10,
    10,
    'SCORE',
    0,
    'Strong IMG receptivity'
  ),

  r(
    'Q1',
    'STRONG',
    'Strong',
    8,
    10,
    'SCORE',
    0,
    'Good IMG receptivity'
  ),

  r(
    'Q1',
    'MODERATE',
    'Moderate',
    5,
    10,
    'SCORE',
    0,
    'Moderate IMG receptivity'
  ),

  r(
    'Q1',
    'LOW',
    'Low',
    2,
    10,
    'SCORE',
    0,
    '',
    'Weak IMG history'
  ),

  r(
    'Q1',
    'NEGLIGIBLE',
    'Negligible',
    0,
    10,
    'SCORE',
    0,
    '',
    'Weak IMG history'
  ),

  r(
    'Q1',
    'SOURCE_NA',
    'Source N/A',
    5,
    10,
    'SCORE',
    1,
    '',
    '',
    'IMG evidence unavailable'
  ),


  /* -------------------------------------------------------
     Q2 — Step 2 CK fit
     MAX 12
  ------------------------------------------------------- */

  r(
    'Q2',
    'P75_PLUS',
    '75th percentile or higher',
    12,
    12,
    'SCORE',
    0,
    'Strong Step 2 fit'
  ),

  r(
    'Q2',
    'P50_74',
    'Median–74th',
    10,
    12,
    'SCORE',
    0,
    'Strong Step 2 fit'
  ),

  r(
    'Q2',
    'P25_49',
    '25th–49th',
    7,
    12
  ),

  r(
    'Q2',
    'P10_24',
    '10th–24th',
    4,
    12,
    'SCORE',
    0,
    '',
    'Step 2 is below typical interview range'
  ),

  r(
    'Q2',
    'BELOW_P10',
    'Below 10th',
    1,
    12,
    'SCORE',
    0,
    '',
    'Step 2 is below typical interview range'
  ),

  r(
    'Q2',
    'SOURCE_NA',
    'Source N/A',
    6,
    12,
    'SCORE',
    1,
    '',
    '',
    'Score distribution unavailable'
  ),


  /* -------------------------------------------------------
     Q3 — Signal responsiveness
     MAX 8
  ------------------------------------------------------- */

  r(
    'Q3',
    'SUBSTANTIAL',
    'Substantial signal lift',
    8,
    8,
    'SCORE',
    0,
    'Program responds strongly to signals'
  ),

  r(
    'Q3',
    'MODERATE',
    'Moderate signal lift',
    6,
    8,
    'SCORE',
    0,
    'Program responds strongly to signals'
  ),

  r(
    'Q3',
    'SMALL',
    'Small signal lift',
    3,
    8
  ),

  r(
    'Q3',
    'LITTLE_NONE',
    'Little or no lift',
    1,
    8,
    'SCORE',
    0,
    '',
    'Signal has limited demonstrated value'
  ),

  r(
    'Q3',
    'DOES_NOT_USE',
    'Program does not use signals',
    0,
    8,
    'SCORE',
    0,
    '',
    'Signal has limited demonstrated value',
    'Normally apply without a signal'
  ),

  r(
    'Q3',
    'SOURCE_NA',
    'Source N/A',
    4,
    8,
    'SCORE',
    1,
    '',
    '',
    'Signal behavior unavailable'
  ),


  /* -------------------------------------------------------
     Q4 — Interview selectivity
     MAX 5
  ------------------------------------------------------- */

  r(
    'Q4',
    'HIGH',
    'Relatively high invited percentage',
    5,
    5,
    'SCORE',
    0,
    'Favorable overall interview selectivity'
  ),

  r(
    'Q4',
    'MODERATE',
    'Moderate invited percentage',
    4,
    5,
    'SCORE',
    0,
    'Favorable overall interview selectivity'
  ),

  r(
    'Q4',
    'LOW',
    'Low invited percentage',
    2,
    5,
    'SCORE',
    0,
    '',
    'Program is highly selective'
  ),

  r(
    'Q4',
    'VERY_LOW',
    'Very low invited percentage',
    1,
    5,
    'SCORE',
    0,
    '',
    'Program is highly selective'
  ),

  r(
    'Q4',
    'SOURCE_NA',
    'Source N/A',
    3,
    5,
    'SCORE',
    1,
    '',
    '',
    'Invitation rate unavailable'
  ),


  /* -------------------------------------------------------
     Q5 — Application trend
     MAX 3
  ------------------------------------------------------- */

  r(
    'Q5',
    'DECLINING',
    'Declining',
    3,
    3,
    'SCORE',
    0,
    'Application volume is declining'
  ),

  r(
    'Q5',
    'STABLE',
    'Stable',
    2,
    3
  ),

  r(
    'Q5',
    'INCREASING',
    'Increasing',
    1,
    3,
    'SCORE',
    0,
    '',
    'Application competition is increasing'
  ),

  r(
    'Q5',
    'SHARPLY_INCREASING',
    'Sharply increasing',
    0,
    3,
    'SCORE',
    0,
    '',
    'Application competition is increasing'
  ),

  r(
    'Q5',
    'SOURCE_NA',
    'Source N/A',
    1.5,
    3,
    'SCORE',
    1,
    '',
    '',
    'Application trend unavailable'
  ),


  /* -------------------------------------------------------
     S1 — Comparable interviews
     MAX 12
  ------------------------------------------------------- */

  r(
    'S1',
    'MULTIPLE_CLOSE',
    'Multiple close recent profiles',
    12,
    12,
    'SCORE',
    0,
    'Comparable applicants received interviews'
  ),

  r(
    'S1',
    'ONE_CLOSE',
    'One close recent profile',
    10,
    12,
    'SCORE',
    0,
    'Comparable applicants received interviews'
  ),

  r(
    'S1',
    'PARTIAL',
    'Partial similarity',
    6,
    12
  ),

  r(
    'S1',
    'MATERIALLY_DIFFERENT',
    'Profiles materially stronger/different',
    2,
    12,
    'SCORE',
    0,
    '',
    'Available interview profiles are materially different'
  ),

  r(
    'S1',
    'TOO_INCOMPLETE',
    'Profiles too incomplete',
    5,
    12,
    'SCORE',
    1
  ),

  r(
    'S1',
    'NO_DATA',
    'No comparable information available',
    6,
    12,
    'SCORE',
    1,
    '',
    '',
    'No reliable comparable-profile information found; neutral treatment'
  ),


  /* -------------------------------------------------------
     S2 — Comparable matches
     MAX 6
  ------------------------------------------------------- */

  r(
    'S2',
    'MULTIPLE_CLOSE',
    'Multiple close recent matches',
    6,
    6,
    'SCORE',
    0,
    'Comparable applicants matched here'
  ),

  r(
    'S2',
    'ONE_CLOSE',
    'One close recent match',
    5,
    6,
    'SCORE',
    0,
    'Comparable applicants matched here'
  ),

  r(
    'S2',
    'PARTIAL',
    'Partial similarity',
    3,
    6
  ),

  r(
    'S2',
    'MATERIALLY_DIFFERENT',
    'Matched profiles materially different',
    1,
    6,
    'SCORE',
    0,
    '',
    'Available matched profiles are materially different'
  ),

  r(
    'S2',
    'TOO_INCOMPLETE',
    'Profiles too incomplete',
    2.5,
    6,
    'SCORE',
    1
  ),

  r(
    'S2',
    'NO_DATA',
    'No comparable information available',
    3,
    6,
    'SCORE',
    1,
    '',
    '',
    'No reliable comparable-profile information found; neutral treatment'
  ),


  /* -------------------------------------------------------
     R1 — Program experience
     MAX 12
  ------------------------------------------------------- */

  r(
    'R1',
    'DIRECT_LEADERSHIP',
    'Direct program work with leadership/core faculty',
    12,
    12,
    'SCORE',
    0,
    'Strong direct program exposure'
  ),

  r(
    'R1',
    'PROGRAM_NO_LEADERSHIP',
    'Program/primary hospital work without leadership exposure',
    9,
    12,
    'SCORE',
    0,
    'Strong direct program exposure'
  ),

  r(
    'R1',
    'SAME_SYSTEM',
    'Same health system',
    6,
    12
  ),

  r(
    'R1',
    'AFFILIATED',
    'Affiliated site or physician/researcher',
    3,
    12
  ),

  r(
    'R1',
    'SAME_REGION',
    'Same region only',
    1,
    12,
    'SCORE',
    0,
    '',
    'No meaningful program-specific relationship identified'
  ),

  r(
    'R1',
    'NONE',
    'No relationship',
    0,
    12,
    'SCORE',
    0,
    '',
    'No meaningful program-specific relationship identified'
  ),


  /* -------------------------------------------------------
     R2 — Internal advocate
     MAX 10
  ------------------------------------------------------- */

  r(
    'R2',
    'DECISION_MAKER',
    'Decision-maker explicitly advocating',
    10,
    10,
    'SCORE',
    0,
    'Strong internal advocate'
  ),

  r(
    'R2',
    'CORE_FACULTY',
    'Core faculty/credible leader advocating',
    8,
    10,
    'SCORE',
    0,
    'Strong internal advocate'
  ),

  r(
    'R2',
    'RESIDENT_ACCESS',
    'Resident/connection with leadership access and agreed advocacy',
    6,
    10
  ),

  r(
    'R2',
    'KNOWS_NO_ADVOCACY',
    'Knows applicant; no advocacy',
    2,
    10
  ),

  r(
    'R2',
    'SUPERFICIAL',
    'Superficial connection',
    1,
    10,
    'SCORE',
    0,
    '',
    'No meaningful internal advocate'
  ),

  r(
    'R2',
    'NONE',
    'No connection',
    0,
    10,
    'SCORE',
    0,
    '',
    'No meaningful internal advocate'
  ),


  /* -------------------------------------------------------
     R3 — Outreach outcome
     MAX 6
  ------------------------------------------------------- */

  r(
    'R3',
    'ENCOURAGED_SIGNAL',
    'Explicitly encouraged to signal',
    6,
    6,
    'SCORE',
    0,
    'Meaningful positive program engagement'
  ),

  r(
    'R3',
    'ENCOURAGED_APPLY',
    'Explicitly encouraged to apply',
    5,
    6,
    'SCORE',
    0,
    'Meaningful positive program engagement'
  ),

  r(
    'R3',
    'FAVORABLE_LEADERSHIP',
    'Favorable PD/APD/faculty response',
    4,
    6,
    'SCORE',
    0,
    'Meaningful positive program engagement'
  ),

  r(
    'R3',
    'COORDINATOR_RESPONSE',
    'Favorable coordinator response',
    2,
    6
  ),

  r(
    'R3',
    'BRIEF_INTERACTION',
    'Brief interaction or open house',
    1,
    6
  ),

  r(
    'R3',
    'NO_RESPONSE_NONE',
    'Sent/no response or no outreach',
    0,
    6,
    'SCORE',
    0,
    '',
    'No meaningful outreach response'
  ),


  /* -------------------------------------------------------
     A1 — School familiarity
     MAX 4
  ------------------------------------------------------- */

  r(
    'A1',
    'EXACT_SCHOOL',
    'Exact medical school represented',
    4,
    4,
    'SCORE',
    0,
    "Program is familiar with applicant's medical school"
  ),

  r(
    'A1',
    'SAME_COUNTRY',
    'Same-country schools represented',
    2,
    4
  ),

  r(
    'A1',
    'NEITHER_UNKNOWN',
    'Neither shown or unknown',
    0,
    4
  ),


  /* -------------------------------------------------------
     A2 — Academic/research fit
     MAX 6
  ------------------------------------------------------- */

  r(
    'A2',
    'STRONG',
    'Strong alignment',
    6,
    6,
    'SCORE',
    0,
    'Academic profile aligns with program type'
  ),

  r(
    'A2',
    'REASONABLE',
    'Reasonable alignment',
    4,
    6
  ),

  r(
    'A2',
    'MIXED',
    'Mixed or uncertain',
    2,
    6
  ),

  r(
    'A2',
    'MISMATCH',
    'Clear mismatch',
    0,
    6,
    'SCORE',
    0,
    '',
    'Academic/program-type mismatch'
  ),


  /* -------------------------------------------------------
     A3 — Geography
     MAX 3
  ------------------------------------------------------- */

  r(
    'A3',
    'ALIGNED_TIE',
    'Aligned ERAS geography plus credible tie',
    3,
    3,
    'SCORE',
    0,
    'Strong geographic alignment'
  ),

  r(
    'A3',
    'ALIGNED',
    'Aligned ERAS geography',
    2,
    3
  ),

  r(
    'A3',
    'NO_PREFERENCE',
    'No preference / neutral',
    1,
    3
  ),

  r(
    'A3',
    'NOT_ALIGNED',
    'Not aligned',
    0,
    3
  ),


  /* -------------------------------------------------------
     A4 — Specialty alignment
     MAX 3
  ------------------------------------------------------- */

  r(
    'A4',
    'STRONG',
    'Strong specialty-specific alignment',
    3,
    3,
    'SCORE',
    0,
    'Strong specialty-specific profile'
  ),

  r(
    'A4',
    'ADEQUATE',
    'Adequate',
    2,
    3
  ),

  r(
    'A4',
    'LIMITED',
    'Limited',
    1,
    3
  ),

  r(
    'A4',
    'WEAK',
    'Weak or contradictory',
    0,
    3,
    'SCORE',
    0,
    '',
    'Weak specialty-specific alignment'
  ),


  /* -------------------------------------------------------
     P1 — Prior history

     Informational only
  ------------------------------------------------------- */

  r(
    'P1',
    'PRIOR_INTERVIEW',
    'Previously interviewed',
    0,
    0,
    'INFO'
  ),

  r(
    'P1',
    'PRIOR_APPLICATION',
    'Previously applied only',
    0,
    0,
    'INFO'
  ),

  r(
    'P1',
    'NEITHER',
    'Neither',
    0,
    0,
    'INFO'
  )

];


/* =========================================================
   COMPONENT SCORING

   APPLICATION FIT MAX = 58
   SIGNAL VALUE MAX    = 42
========================================================= */

export const componentMap: any = {

  Q1: {
    max: 10,
    fit: 1,
    signal: 0
  },

  Q2: {
    max: 12,
    fit: 1,
    signal: 0
  },

  Q3: {
    max: 8,
    fit: 0,
    signal: 1
  },

  Q4: {
    max: 5,
    fit: 1,
    signal: 0
  },

  Q5: {
    max: 3,
    fit: 0,
    signal: 1
  },


  S1: {
    max: 12,
    fit: 1,
    signal: 0
  },

  S2: {
    max: 6,
    fit: 1,
    signal: 0
  },


  R1: {
    max: 12,
    fit: 0,
    signal: 1
  },

  R2: {
    max: 10,
    fit: 0,
    signal: 1
  },

  R3: {
    max: 6,
    fit: 0,
    signal: 1
  },


  A1: {
    max: 4,
    fit: 1,
    signal: 0
  },

  A2: {
    max: 6,
    fit: 1,
    signal: 0
  },

  A3: {
    max: 3,
    fit: 0,
    signal: 1
  },

  A4: {
    max: 3,
    fit: 1,
    signal: 0
  }

};


/* =========================================================
   SPECIALTY CONFIG

   Signal counts remain intentionally unresolved.
========================================================= */

export const specialtyConfig: any[] = [

  [
    'Internal Medicine',
    'TIERED'
  ],

  [
    'Family Medicine',
    'SINGLE'
  ],

  [
    'Pediatrics',
    'SINGLE'
  ],

  [
    'Neurology',
    'SINGLE'
  ],

  [
    'Psychiatry',
    'SINGLE'
  ],

  [
    'Pathology',
    'SINGLE'
  ]

].map(
  ([specialty, signal_model]) => ({
    specialty,

    season: 2027,

    active: true,

    signal_model,

    gold_count: null,

    silver_count: null,

    general_count: null,

    launch_validation:
      'REQUIRED BEFORE LAUNCH',

    config_version:
      'v1.0'
  })
);


/* =========================================================
   SCORE THRESHOLDS
========================================================= */

export const thresholds: any = {

  FINAL_PRIORITY: [

    {
      min: 75,
      max: 100,
      code: 'STRONG_SIGNAL',
      label: 'Strong Signal Candidate'
    },

    {
      min: 60,
      max: 75,
      code: 'REASONABLE_SIGNAL',
      label: 'Reasonable Signal Candidate'
    },

    {
      min: 45,
      max: 60,
      code: 'PORTFOLIO_REACH',
      label: 'Portfolio Reach / Mentor Review'
    },

    {
      min: 0,
      max: 45,
      code: 'POOR_USE',
      label: 'Poor Use of Signal'
    }

  ],


  APPLICATION_FIT: [

    {
      min: 75,
      max: 100,
      code: 'STRONG_TARGET',
      label: 'Strong Target'
    },

    {
      min: 60,
      max: 75,
      code: 'TARGET',
      label: 'Target'
    },

    {
      min: 45,
      max: 60,
      code: 'REACH',
      label: 'Reach'
    },

    {
      min: 0,
      max: 45,
      code: 'POOR_FIT',
      label: 'Poor Fit'
    }

  ],


  SIGNAL_VALUE: [

    {
      min: 70,
      max: 100,
      code: 'HIGH',
      label: 'High'
    },

    {
      min: 45,
      max: 70,
      code: 'MODERATE',
      label: 'Moderate'
    },

    {
      min: 0,
      max: 45,
      code: 'LOW',
      label: 'Low'
    }

  ]

};


/* =========================================================
   EXPORT COLUMNS
========================================================= */

export const exportColumns: any[] = [

  'assessment_id',

  'user_email',

  'specialty',

  'match_season',

  'program_id',

  'program_name',

  'city',

  'state',

  'source_updated_at',

  'completion_status',

  'eligibility_status',

  'application_fit_score',

  'application_fit_label',

  'signal_value_score',

  'signal_value_label',

  'final_priority_score',

  'final_priority_label',

  'recommendation_code',

  'recommended_tier',

  'confidence',

  'positive_reasons',

  'negative_reasons',

  'warnings',

  'override_reason',

  'override_note',

  'student_notes',

  'mentor_notes',

  'student_final_choice',

  'student_final_tier',

  'evaluated_at',

  'algorithm_version'

];


/* =========================================================
   PUBLIC CONFIG

   Used by UI.

   The scoring points themselves are NOT exposed here.
========================================================= */

export const publicConfig = () => ({

  algorithm_version:
    ALGORITHM_VERSION,


  questions,


  /*
   * Preferred UI structure:
   *
   * {
   *   code,
   *   component,
   *   prompt,
   *   options
   * }
   */
  programSpecificQuestions,


  /*
   * Provides the internal answer_code corresponding
   * to each visible answer label.
   *
   * Assessment.tsx uses this mapping when an option
   * is clicked.
   */
  answer_options:
    questions.reduce(
      (
        acc: any,
        q: any
      ) => {

        acc[q.question_code] =
          answerScores
            .filter(
              (x: any) =>
                x.question_code ===
                q.question_code
            )
            .map(
              (x: any) => ({
                answer_code:
                  x.answer_code,

                answer_label:
                  x.answer_label,

                effect:
                  x.effect
              })
            );

        return acc;

      },
      {}
    ),


  specialties:
    specialtyConfig.map(
      ({
        gold_count,
        silver_count,
        general_count,
        ...x
      }: any) => x
    )

});