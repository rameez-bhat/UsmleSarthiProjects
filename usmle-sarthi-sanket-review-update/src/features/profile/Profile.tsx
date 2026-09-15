import Select from 'react-select';

import {
  countryData
} from '../../apis/countryData';

import {
  medicalSchoolOptions
} from '../../apis/MedicalSchools';


const countries = Array
  .from(
    new Set(
      (countryData || [])
        .map(
          (x: any) =>
            x?.label ||
            x?.value ||
            ''
        )
        .filter(Boolean)
    )
  )
  .sort();


const countryOptions = countries.map(
  (country: any) => ({
    value: country,
    label: country
  })
);


const usceOptions = [
  'Hands-on elective',
  'Externship',
  'Sub-internship',
  'Observership',
  'Inpatient',
  'Outpatient',
  'Research',
  'Tele-rotation',
  'Other'
].map(
  item => ({
    value: item,
    label: item
  })
);


const visaOptions = [
  'No visa sponsorship needed',
  'US citizen',
  'Green card',
  'H-4 EAD',
  'J-1',
  'H-1B',
  'F-1 OPT',
  'Other'
].map(
  item => ({
    value: item,
    label: item
  })
);


const step1Options = [
  'Pass',
  'Fail',
  'Not taken'
].map(
  item => ({
    value: item,
    label: item
  })
);


const step3Options = [
  {
    value: 'passed',
    label: 'Passed'
  },
  {
    value: 'failed',
    label: 'Failed'
  },
  {
    value: 'not taken',
    label: 'Not taken'
  },
  {
    value: 'pending',
    label: 'Pending'
  }
];


const ecfmgOptions = [
  'Certified',
  'Not certified',
  'Pending'
].map(
  item => ({
    value: item,
    label: item
  })
);


const specialtyUsceOptions = [
  'Strong',
  'Adequate',
  'Limited',
  'None'
].map(
  item => ({
    value: item,
    label: item
  })
);


const researchLevels: any = {
  '1':
    'Level 1 — Minimal: no meaningful research activity or only brief exposure.',

  '2':
    'Level 2 — Limited: participation without substantial completed scholarly output.',

  '3':
    'Level 3 — Developing: meaningful project work with poster/abstract/case report or manuscript in progress.',

  '4':
    'Level 4 — Strong: substantive completed output(s) and sustained research involvement.',

  '5':
    'Level 5 — Advanced: multiple substantive outputs, ownership/leadership, or extensive academic work.'
};


const researchOptions = Object
  .entries(researchLevels)
  .map(
    ([value, text]: any) => ({
      value,
      label: text.split(':')[0]
    })
  );


/*
 * Reusable react-select styling.
 *
 * This deliberately uses CSS variables so the select
 * continues to work with the application's themes.
 */
const selectStyles: any = {

  control: (
    base: any,
    state: any
  ) => ({
    ...base,

    minHeight: '42px',

    backgroundColor:
      'var(--input-bg, var(--card, #ffffff))',

    borderColor:
      state.isFocused
        ? 'var(--primary, #2563eb)'
        : 'var(--border, #d1d5db)',

    color:
      'var(--foreground, #111827)',

    boxShadow:
      state.isFocused
        ? '0 0 0 1px var(--primary, #2563eb)'
        : 'none',

    cursor: 'pointer',

    '&:hover': {
      borderColor:
        'var(--primary, #2563eb)'
    }
  }),


  valueContainer: (
    base: any
  ) => ({
    ...base,

    padding:
      '6px 10px'
  }),


  input: (
    base: any
  ) => ({
    ...base,

    color:
      'var(--foreground, #111827)'
  }),


  singleValue: (
    base: any
  ) => ({
    ...base,

    color:
      'var(--foreground, #111827)'
  }),


  placeholder: (
    base: any
  ) => ({
    ...base,

    color:
      'var(--muted-foreground, #6b7280)'
  }),


  menu: (
    base: any
  ) => ({
    ...base,

    zIndex: 100,

    backgroundColor:
      'var(--card, #ffffff)',

    border:
      '1px solid var(--border, #d1d5db)',

    overflow: 'hidden'
  }),


  menuPortal: (
    base: any
  ) => ({
    ...base,

    zIndex: 9999
  }),


  option: (
    base: any,
    state: any
  ) => ({
    ...base,

    cursor: 'pointer',

    backgroundColor:
      state.isSelected
        ? 'var(--primary, #2563eb)'
        : state.isFocused
          ? 'var(--muted, #f3f4f6)'
          : 'var(--card, #ffffff)',

    color:
      state.isSelected
        ? 'var(--primary-foreground, #ffffff)'
        : 'var(--foreground, #111827)'
  }),


  multiValue: (
    base: any
  ) => ({
    ...base,

    backgroundColor:
      'var(--muted, #f3f4f6)'
  }),


  multiValueLabel: (
    base: any
  ) => ({
    ...base,

    color:
      'var(--foreground, #111827)'
  }),


  multiValueRemove: (
    base: any
  ) => ({
    ...base,

    color:
      'var(--muted-foreground, #6b7280)',

    cursor: 'pointer',

    ':hover': {
      backgroundColor:
        'var(--destructive, #dc2626)',

      color:
        '#ffffff'
    }
  })
};


function findOption(
  options: any[],
  value: any
) {

  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }


  return (
    options.find(
      option =>
        String(option.value) ===
        String(value)
    ) ||
    {
      value,
      label: String(value)
    }
  );
}


export default function Profile({
  profile,
  setProfile,
  onContinue,
  onBack,
  message
}: any) {

  const update = (
    key: string,
    value: any
  ) => {

    setProfile({
      ...profile,
      [key]: value
    });

  };


  /*
   * Existing data may still contain the older
   * comma-separated USCE value.
   *
   * Support both formats.
   */
  const usceValues =
    Array.isArray(
      profile.usce_types
    )
      ? profile.usce_types
      : String(
          profile.usce_types || ''
        )
          .split(',')
          .map(
            (x: string) =>
              x.trim()
          )
          .filter(Boolean);


  const selectedUsceOptions =
    usceValues.map(
      (value: string) => ({
        value,
        label: value
      })
    );


  const step3NeedsScore =
    [
      'passed',
      'failed'
    ].includes(
      String(
        profile.step3_status || ''
      ).toLowerCase()
    );


  /*
   * Medical-school list based on selected country.
   */
  const filteredMedicalSchools =
    medicalSchoolOptions
      .filter(
        (school: string) =>
          !profile.medical_school_country ||
          school.includes(
            `, ${profile.medical_school_country}`
          )
      )
      .map(
        (school: string) => ({
          value: school,
          label: school
        })
      );


  /*
   * Preserve imported/legacy medical school even
   * if it isn't found in the local list.
   */
  const currentMedicalSchool =
    profile.medical_school_name
      ? findOption(
          filteredMedicalSchools,
          profile.medical_school_name
        )
      : null;


  return (
    <>

      <div className="pageTitle">

        <div>

          <div className="eyebrow">
            STEP 1
          </div>

          <h1>
            Applicant profile
          </h1>

          <p className="muted">
            Confirm the reusable applicant-level
            information before assessing programs.
          </p>

        </div>

      </div>


      {message && (

        <div className="notice danger">
          {message}
        </div>

      )}


      {profile.imported_from_legacy && (

        <div className="notice info">

          Some fields were prefetched{' '}

          <b>
            from your Sarthi profile
          </b>.

          {' '}
          Please confirm or correct them
          before continuing.

        </div>

      )}


      <div className="card formGrid">

        {/* Specialty */}

        <div>

          <label>
            Specialty
          </label>

          <input
            value={
              profile.specialty || ''
            }
            disabled
          />

        </div>


        {/* Match season */}

        <div>

          <label>
            Match season
          </label>

          <input
            type="number"
            value={
              profile.match_season ||
              2027
            }
            onChange={
              e =>
                update(
                  'match_season',
                  e.target.value
                )
            }
          />

        </div>


        {/* Country */}

        <div>

          <label>
            Country of medical school
          </label>

          <Select
            isSearchable
            isClearable
            options={
              countryOptions
            }
            value={
              findOption(
                countryOptions,
                profile.medical_school_country
              )
            }
            onChange={
              (option: any) => {

                setProfile({
                  ...profile,

                  medical_school_country:
                    option?.value || '',

                  /*
                   * Reset school because country
                   * has changed.
                   */
                  medical_school_name: ''
                });

              }
            }
            placeholder="Search country..."
            noOptionsMessage={() =>
              'No country found'
            }
            styles={
              selectStyles
            }
            menuPortalTarget={
              typeof document !==
              'undefined'
                ? document.body
                : undefined
            }
            menuPosition="fixed"
          />

        </div>


        {/* Medical school */}

        <div>

          <label>
            Medical school
          </label>

          <Select
            isSearchable
            isClearable
            options={
              filteredMedicalSchools
            }
            value={
              currentMedicalSchool
            }
            onChange={
              (option: any) =>
                update(
                  'medical_school_name',
                  option?.value || ''
                )
            }
            placeholder={
              profile.medical_school_country
                ? 'Search medical school...'
                : 'Select country first...'
            }
            noOptionsMessage={() =>
              'No medical school found'
            }
            styles={
              selectStyles
            }
            menuPortalTarget={
              typeof document !==
              'undefined'
                ? document.body
                : undefined
            }
            menuPosition="fixed"
          />

        </div>


        {/* YOG */}

        <div>

          <label>
            Year of graduation
          </label>

          <input
            type="number"
            value={
              profile.yog || ''
            }
            onChange={
              e =>
                update(
                  'yog',
                  e.target.value
                )
            }
          />

        </div>


        {/* Visa */}

        <div>

          <label>
            Visa / work authorization
          </label>

          <Select
            isSearchable
            isClearable
            options={
              visaOptions
            }
            value={
              findOption(
                visaOptions,
                profile.visa_requirement
              )
            }
            onChange={
              (option: any) =>
                update(
                  'visa_requirement',
                  option?.value || ''
                )
            }
            placeholder="Search or select..."
            styles={
              selectStyles
            }
          />

        </div>


        {/* Step 1 status */}

        <div>

          <label>
            Step 1 status
          </label>

          <Select
            isSearchable
            options={
              step1Options
            }
            value={
              findOption(
                step1Options,
                profile.step1_status
              )
            }
            onChange={
              (option: any) =>
                update(
                  'step1_status',
                  option?.value || ''
                )
            }
            placeholder="Select status..."
            styles={
              selectStyles
            }
          />

        </div>


        {/* Step 1 attempts */}

        <div>

          <label>
            Step 1 attempts
          </label>

          <input
            type="number"
            min="0"
            value={
              profile.step1_attempts ??
              0
            }
            onChange={
              e =>
                update(
                  'step1_attempts',
                  e.target.value
                )
            }
          />

        </div>


        {/* Step 2 score */}

        <div>

          <label>
            Step 2 CK score
          </label>

          <input
            type="number"
            value={
              profile.step2_score || ''
            }
            onChange={
              e =>
                update(
                  'step2_score',
                  e.target.value
                )
            }
          />

        </div>


        {/* Step 2 attempts */}

        <div>

          <label>
            Step 2 attempts
          </label>

          <input
            type="number"
            min="0"
            value={
              profile.step2_attempts ??
              0
            }
            onChange={
              e =>
                update(
                  'step2_attempts',
                  e.target.value
                )
            }
          />

        </div>


        {/* Step 3 status */}

        <div>

          <label>
            Step 3 status
          </label>

          <Select
            isSearchable
            options={
              step3Options
            }
            value={
              findOption(
                step3Options,
                profile.step3_status ||
                  'not taken'
              )
            }
            onChange={
              (option: any) => {

                const status =
                  option?.value ||
                  'not taken';


                setProfile({
                  ...profile,

                  step3_status:
                    status,

                  /*
                   * Remove stale score if Step 3
                   * becomes pending/not taken.
                   */
                  step3_score:
                    [
                      'passed',
                      'failed'
                    ].includes(status)
                      ? profile.step3_score
                      : ''
                });

              }
            }
            placeholder="Select status..."
            styles={
              selectStyles
            }
          />

        </div>


        {/* Step 3 score */}

        <div>

          <label>
            Step 3 score
          </label>

          <input
            type="number"
            disabled={
              !step3NeedsScore
            }
            required={
              step3NeedsScore
            }
            value={
              step3NeedsScore
                ? (
                    profile.step3_score ||
                    ''
                  )
                : ''
            }
            onChange={
              e =>
                update(
                  'step3_score',
                  e.target.value
                )
            }
          />

          <small>

            {!step3NeedsScore
              ? 'Score is not required while Step 3 is not taken or pending.'
              : 'Enter the reported Step 3 score.'}

          </small>

        </div>


        {/* ECFMG */}

        <div>

          <label>
            ECFMG status
          </label>

          <Select
            isSearchable
            isClearable
            options={
              ecfmgOptions
            }
            value={
              findOption(
                ecfmgOptions,
                profile.ecfmg_status
              )
            }
            onChange={
              (option: any) =>
                update(
                  'ecfmg_status',
                  option?.value || ''
                )
            }
            placeholder="Select status..."
            styles={
              selectStyles
            }
          />

        </div>


        {/* USCE months */}

        <div>

          <label>
            USCE months
          </label>

          <input
            type="number"
            min="0"
            value={
              profile.usce_months ??
              0
            }
            onChange={
              e =>
                update(
                  'usce_months',
                  e.target.value
                )
            }
          />

        </div>


        {/* USCE types */}

        <div className="fullWidth">

          <label>
            USCE types
          </label>

          <Select
            isMulti
            isSearchable
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            options={
              usceOptions
            }
            value={
              selectedUsceOptions
            }
            onChange={
              (options: any) =>
                update(
                  'usce_types',
                  (options || []).map(
                    (option: any) =>
                      option.value
                  )
                )
            }
            placeholder="Search and select USCE types..."
            noOptionsMessage={() =>
              'No option found'
            }
            styles={
              selectStyles
            }
          />

          <small>
            You can select more than one.
          </small>

        </div>


        {/* Specialty-specific USCE */}

        <div>

          <label>
            Specialty-specific USCE level
          </label>

          <Select
            isSearchable
            isClearable
            options={
              specialtyUsceOptions
            }
            value={
              findOption(
                specialtyUsceOptions,
                profile.specialty_usce_level
              )
            }
            onChange={
              (option: any) =>
                update(
                  'specialty_usce_level',
                  option?.value || ''
                )
            }
            placeholder="Select level..."
            styles={
              selectStyles
            }
          />

          <small>
            Choose based on specialty-relevant
            clinical exposure, not total USCE alone.
          </small>

        </div>


        {/* Research level */}

        <div>

          <label>
            Research level
          </label>

          <Select
            isSearchable
            options={
              researchOptions
            }
            value={
              findOption(
                researchOptions,
                profile.research_level ||
                  '3'
              )
            }
            onChange={
              (option: any) =>
                update(
                  'research_level',
                  option?.value || '3'
                )
            }
            placeholder="Search research level..."
            styles={
              selectStyles
            }
          />

          <small>
            {
              researchLevels[
                String(
                  profile.research_level ||
                  '3'
                )
              ]
            }
          </small>

        </div>

      </div>


      <div className="actions">

        <button
          type="button"
          className="ghost"
          onClick={
            onBack
          }
        >
          Back
        </button>


        <button
          type="button"
          onClick={
            onContinue
          }
        >
          Confirm and continue
        </button>

      </div>

    </>
  );
}