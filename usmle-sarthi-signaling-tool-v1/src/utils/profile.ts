const blankProfile: any = {
  specialty: 'Internal Medicine',
  match_season: 2027,

  medical_school_name: '',
  medical_school_country: '',

  yog: '',

  visa_requirement: '',

  step1_status: 'Pass',
  step1_attempts: 0,

  step2_score: '',
  step2_attempts: 1,

  step3_status: 'not taken',
  step3_score: '',

  ecfmg_status: 'pending',

  usce_months: 0,
  usce_types: '',

  specialty_usce_level: 'adequate',

  research_level: '3',

  repeat_applicant: false,

  prior_seasons_notes: '',

  profile_source: '',
  imported_from_legacy: false
};




function selectText(value: any) {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return String(
    value.label ??
    value.value ??
    value.Name ??
    value.name ??
    ''
  );
}


function getLegacyGraduationYear(value: any) {
  if (!value) {
    return '';
  }

  if (typeof value === 'number') {
    if (value > 1900 && value < 2200) {
      return String(value);
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ''
      : String(date.getFullYear());
  }

  if (typeof value === 'string') {
    const yearMatch = value.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      return yearMatch[0];
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ''
      : String(date.getFullYear());
  }

  if (typeof value?.toDate === 'function') {
    return String(value.toDate().getFullYear());
  }

  if (value?.seconds !== undefined) {
    return String(
      new Date(
        Number(value.seconds) * 1000
      ).getFullYear()
    );
  }

  return '';
}


function normalizeAttempts(value: any, fallback = 0) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed)
    ? fallback
    : parsed;
}


function legacyVisaText(value: any) {
  if (Array.isArray(value)) {
    return value
      .map(selectText)
      .filter(Boolean)
      .join(', ');
  }

  return selectText(value);
}


function legacyMedicalSchoolName(legacy: any) {
  const selected = legacy?.NameOfMedicalSchool;
  const selectedValue =
    selected?.value ??
    selected?.label ??
    selected ??
    '';

  if (String(selectedValue).toLowerCase() === 'others') {
    return String(
      legacy?.NameOfMedicalSchoolOthers ||
      ''
    );
  }

  return selectText(selected);
}


function mapLegacyProfileToSignaling(legacy: any) {
  const scoreData = legacy?.ScoreData || {};

  const step1 =
    scoreData?.Step1Score?.Selected ||
    legacy?.Step1Score?.Selected ||
    legacy?.Step1Score ||
    {};

  const step2 =
    scoreData?.Step2Score?.Selected ||
    legacy?.Step2Score?.Selected ||
    legacy?.Step2Score ||
    {};

  const step3 =
    scoreData?.Step3Score?.Selected ||
    legacy?.Step3Score?.Selected ||
    legacy?.Step3Score ||
    {};

  return {
    ...blankProfile,

    medical_school_name:
      legacyMedicalSchoolName(legacy),

    medical_school_country:
      selectText(
        legacy?.CountryOfMedicalSchool
      ),

    yog:
      getLegacyGraduationYear(
        legacy?.GraduationDate
      ),

    visa_requirement:
      legacyVisaText(
        legacy?.VisaRequirement
      ),

    step1_status:
      selectText(step1?.Name || step1) ||
      blankProfile.step1_status,

    step1_attempts:
      normalizeAttempts(
        scoreData?.Step1Attempts ??
        legacy?.Step1Attempts,
        0
      ),

    step2_score:
      step2?.Value ??
      legacy?.Step2ScoreMarks ??
      '',

    step2_attempts:
      normalizeAttempts(
        scoreData?.Step2Attempts ??
        legacy?.Step2Attempts,
        1
      ),

    step3_status:
      selectText(step3?.Name || step3) ||
      blankProfile.step3_status,

    step3_score:
      step3?.Value ??
      legacy?.Step3ScoreMarks ??
      '',

    usce_months:
      normalizeAttempts(
        legacy?.PriorUSCE,
        0
      ),

    match_season:
      legacy?.YearYouAreApplyingForResidency ||
      blankProfile.match_season,

    profile_source: 'legacy',
    imported_from_legacy: true
  };
}

export { blankProfile, mapLegacyProfileToSignaling };
