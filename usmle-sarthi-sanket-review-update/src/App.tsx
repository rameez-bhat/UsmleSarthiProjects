import { useEffect, useState } from 'react';

import {
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';

import { auth, db } from './lib/firebase';

import {
  publicConfig
} from './scoring/config';

import {
  calculateProgram
} from './scoring/scoring';

import Shell from './components/layout/Shell';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import Profile from './features/profile/Profile';
import ProgramSelection from './features/programs/ProgramSelection';
import { getProgramName, getProgramCity, getProgramState } from './features/programs/programUtils';
import AnswerChoice from './features/assessment/AnswerChoice';
import Assessment from './features/assessment/Assessment';
import Result from './features/results/Result';
import Portfolio from './features/portfolio/Portfolio';
import FinalizePlan from './features/finalize/FinalizePlan';

import { blankProfile, mapLegacyProfileToSignaling } from './utils/profile';
import { getCachedPrograms, setCachedPrograms, getTimestampNumber } from './services/programCache';

export default function App() {

  const [user, setUser] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [screen, setScreen] =
    useState('dashboard');


  const [assessments, setAssessments] =
    useState<any[]>([]);

  const [assessment, setAssessment] =
    useState<any>(null);

  const [profile, setProfile] =
    useState<any>({
      ...blankProfile
    });


  const [programs, setPrograms] =
    useState<any[]>([]);

  const [programLoading, setProgramLoading] =
    useState(false);

  const [selected, setSelected] =
    useState<any[]>([]);

  const [activeProgram, setActiveProgram] =
    useState<any>(null);


 const [config] = useState<any>(
  () => publicConfig()
);

  const [answers, setAnswers] =
    useState<any>({});

  const [override, setOverride] =
    useState<any>({
      note: '',
      date: '',
      reason_code: ''
    });

  const [result, setResult] =
    useState<any>(null);

  const [sharedAnswersLoaded, setSharedAnswersLoaded] =
    useState(false);

  const [answerMode, setAnswerMode] =
    useState<'new' | 'shared' | 'program'>('new');

  const [message, setMessage] =
    useState('');


  /*
   * Specialty -> Sarthi Program PId
   *
   * Verify these values against your Program collection /
   * ProgramService if necessary.
   */
  const getSpecialtyPId = (
    specialty: string
  ) => {

    const map: any = {

      'Internal Medicine': '1',

      'Family Medicine': '2',

      'Pediatrics': '3',

      'Psychiatry': '4',

      'Neurology': '5',

      'Pathology': '7'

    };

    return map[specialty] || '';
  };


  /*
   * Load program reference list from existing Sarthi Firestore data.
   *
   * Cache order:
   * 1. memory
   * 2. IndexedDB
   * 3. Firestore
   *
   * HospitalProgramInfo is joined to Hospital using HId. Hospital.PIds is
   * an array, so the Hospital query uses array-contains for the selected PId.
   */
  const loadReferencePrograms = async (
    specialty: string,
    forceRefresh = false
  ) => {
    setProgramLoading(true);
    setMessage('');

    try {
      const pid =
        getSpecialtyPId(specialty);

      if (!pid) {
        setPrograms([]);
        setMessage(
          `No PId configured for ${specialty}.`
        );
        return;
      }

      /*
       * Use cached fully joined data first.
       */
      if (!forceRefresh) {
        const cached =
          await getCachedPrograms(
            String(pid)
          );

        if (cached) {
          setPrograms(cached);
          return;
        }
      }

      setPrograms([]);

      console.log(
        `Program cache miss for PId ${pid}; loading Firestore...`
      );

      /*
       * Load verified program records.
       */
      const programQuery = query(
        collection(
          db,
          'HospitalProgramInfo'
        ),
        where(
          'Verified',
          '==',
          'Yes'
        ),
        where(
          'PId',
          '==',
          pid
        )
      );

      const programSnapshot =
        await getDocs(programQuery);

      const latestByProgram: any = {};

      programSnapshot.docs.forEach(
        (document: any) => {
          const data: any =
            document.data();

          if (
            typeof data.Frieda === 'undefined' ||
            data.Frieda === null ||
            String(data.Frieda).trim() === '' ||
            Number(data.Frieda) === -149
          ) {
            return;
          }

          const key =
            `${String(data.Frieda)}_${String(data.PId)}`;

          const existing =
            latestByProgram[key];

          if (
            !existing ||
            getTimestampNumber(
              data.TimeStamp
            ) >
              getTimestampNumber(
                existing.TimeStamp
              )
          ) {
            latestByProgram[key] = {
              ...data,
              id: key,
              program_id: key,
              HPInfoId: document.id,
              Frieda: data.Frieda,
              PId: data.PId,
              HId:
                data.HId !== undefined &&
                data.HId !== null
                  ? String(data.HId)
                  : ''
            };
          }
        }
      );

      let list: any[] =
        Object.values(
          latestByProgram
        );

      const residencyExplorerPrograms = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '7'
      ];

      if (
        residencyExplorerPrograms.includes(
          String(pid)
        )
      ) {
        list = list.filter(
          (program: any) =>
            Number(
              program.DisplayProgram
            ) === 1
        );
      }

      /*
       * Load hospitals for this PId once.
       *
       * Hospital fields:
       * HId  -> string
       * PIds -> array of program IDs
       */
      const hospitalQuery = query(
        collection(
          db,
          'Hospital'
        ),
        where(
          'PIds',
          'array-contains',
          String(pid)
        )
      );

      const hospitalSnapshot =
        await getDocs(hospitalQuery);

      const hospitalMap: any = {};

      hospitalSnapshot.docs.forEach(
        (hospitalDocument: any) => {
          const hospital: any =
            hospitalDocument.data();

          if (
            hospital.HId === undefined ||
            hospital.HId === null
          ) {
            return;
          }

          hospitalMap[
            String(hospital.HId)
          ] = {
            ...hospital,
            documentId:
              hospitalDocument.id
          };
        }
      );

      /*
       * Join the corresponding Hospital document onto each program.
       */
      list = list.map(
        (program: any) => {
          const hospitalId =
            program.HId !== undefined &&
            program.HId !== null
              ? String(program.HId)
              : '';

          const hospital =
            hospitalMap[hospitalId] ||
            null;

          return {
            ...program,
            hospital,

            HName:
              hospital?.HName ||
              hospital?.HospitalName ||
              program.HName ||
              program.HospitalName ||
              '',

            HospitalName:
              hospital?.HospitalName ||
              hospital?.HName ||
              program.HospitalName ||
              program.HName ||
              '',

            City:
              hospital?.City ||
              hospital?.city ||
              program.City ||
              program.city ||
              '',

            State:
              hospital?.State ||
              hospital?.state ||
              program.State ||
              program.state ||
              '',

            Address:
              hospital?.Address ||
              hospital?.address ||
              program.Address ||
              program.address ||
              ''
          };
        }
      );

      list.sort(
        (a: any, b: any) =>
          getTimestampNumber(
            b.TimeStamp
          ) -
          getTimestampNumber(
            a.TimeStamp
          )
      );

      /*
       * Persist the fully joined result in IndexedDB.
       */
      await setCachedPrograms(
        String(pid),
        list
      );

      setPrograms(list);

      console.log(
        `Loaded ${list.length} programs from Firestore and cached PId ${pid}.`
      );

      const unmatched =
        list.filter(
          (program: any) =>
            !program.hospital
        );

      if (unmatched.length) {
        console.warn(
          `${unmatched.length} programs had no matching Hospital document.`,
          unmatched
        );
      }

      if (list.length === 0) {
        setMessage(
          `No verified programs found for ${specialty}.`
        );
      }

    } catch (e: any) {
      console.error(
        'Program load error:',
        e
      );

      setPrograms([]);

      if (
        e?.code === 'permission-denied'
      ) {
        setMessage(
          'Firestore permission denied while loading the Sarthi reference program list.'
        );
        return;
      }

      setMessage(
        e?.message ||
        'Unable to load the Sarthi reference program list.'
      );

    } finally {
      setProgramLoading(false);
    }
  };


  /*
   * Firebase authentication listener.
   */
 useEffect(() => {
  return onAuthStateChanged(
    auth,
    user => {
      setUser(user);
      setLoading(false);
    }
  );
}, []);


  /*
   * Load assessments.
   */
  useEffect(
    () => {

      if (!user) {
        return;
      }


      const q =
        query(

          collection(
            db,
            'assessments'
          ),

          where(
            'user_id',
            '==',
            user.uid
          )

        );


      return onSnapshot(
        q,
        snapshot => {

          const list =
            snapshot.docs.map(
              d => ({
                id: d.id,
                ...d.data()
              })
            );


          setAssessments(
            list
          );

        }
      );

    },
    [user]
  );


  /*
   * Load reference programs
   * whenever specialty changes.
   */
  useEffect(
    () => {

      if (!user) {
        return;
      }


      if (
        !profile.specialty
      ) {
        return;
      }


      loadReferencePrograms(
        profile.specialty
      );

    },
    [
      user,
      profile.specialty
    ]
  );


  if (loading) {

    return (
      <Shell>
        <div className="card">
          Loading…
        </div>
      </Shell>
    );

  }


  if (!user) {

    return (
      <Login />
    );

  }


  /*
   * Load the Signaling-owned applicant profile.
   *
   * Priority:
   * 1. signaling_profiles/{uid}
   * 2. legacy Users collection (bootstrap only)
   *
   * The legacy Users document is NEVER updated from this application.
   */
  const loadApplicantProfile =
    async (
      specialty: string,
      season = 2027
    ) => {
      if (!user) {
        return;
      }

      try {
        const signalingRef =
          doc(
            db,
            'signaling_profiles',
            user.uid
          );

        const signalingSnapshot =
          await getDoc(signalingRef);

        if (signalingSnapshot.exists()) {
          const saved: any =
            signalingSnapshot.data();

          setProfile({
            ...blankProfile,
            ...saved,
            specialty,
            match_season:
              season ||
              saved.match_season ||
              2027,
            profile_source: 'signaling'
          });

          return;
        }

        const legacyQuery =
          query(
            collection(db, 'Users'),
            where('uid', '==', user.uid)
          );

        const legacySnapshot =
          await getDocs(legacyQuery);

        if (!legacySnapshot.empty) {
          const legacy: any =
            legacySnapshot.docs[0].data();

          const imported =
            mapLegacyProfileToSignaling(
              legacy
            );

          setProfile({
            ...imported,
            specialty,
            match_season:
              season ||
              imported.match_season ||
              2027
          });

          return;
        }

        setProfile({
          ...blankProfile,
          specialty,
          match_season: season || 2027
        });

      } catch (e: any) {
        console.error(
          'Profile bootstrap error:',
          e
        );

        setProfile({
          ...blankProfile,
          specialty,
          match_season: season || 2027
        });

        setMessage(
          e?.message ||
          'Unable to load applicant profile.'
        );
      }
    };


  const loadSelectedPrograms =
    async (assessmentId: string) => {
      const snapshot =
        await getDocs(
          collection(
            db,
            'assessments',
            assessmentId,
            'programs'
          )
        );

      const active = snapshot.docs
        .map((document: any) => ({
          id: document.id,
          ...document.data()
        }))
        .filter(
          (item: any) =>
            !item.deleted_at
        );

      /*
       * Backward compatibility for program rows created
       * before has_result was stored on the program document.
       */
      const hydrated =
        await Promise.all(
          active.map(
            async (item: any) => {
              try {
                const resultSnapshot =
                  await getDoc(
                    doc(
                      db,
                      'assessments',
                      assessmentId,
                      'programs',
                      item.program_id || item.id,
                      'result',
                      'current'
                    )
                  );

                if (resultSnapshot.exists()) {
                  const savedResult:any = resultSnapshot.data();
                  const derivedStatus = savedResult?.final_priority
                    ? 'ASSESSED'
                    : savedResult?.eligibility?.status === 'RESEARCH_REQUIRED'
                      ? 'RESEARCH_NEEDED'
                      : savedResult?.eligibility?.status === 'NOT_ALIGNED'
                        ? 'ELIGIBILITY_MISMATCH'
                        : item.status || 'IN_PROGRESS';
                  return {
                    ...item,
                    has_result: Boolean(savedResult?.final_priority),
                    status: derivedStatus,
                    eligibility_status: savedResult?.eligibility?.status || item.eligibility_status || '',
                    result: savedResult
                  };
                }
              } catch (_) {
                // Keep the program usable even if result hydration fails.
              }

              return item;
            }
          )
        );

      setSelected(hydrated);
      return hydrated;
    };


  const loadSharedAnswers =
    async (assessmentId: string) => {
      try {
        const snapshot =
          await getDoc(
            doc(
              db,
              'assessments',
              assessmentId,
              'answers',
              'current'
            )
          );

        if (!snapshot.exists()) {
          setSharedAnswersLoaded(false);
          return null;
        }

        const data: any =
          snapshot.data();

        const savedAnswers =
          data.answers || {};

        setSharedAnswersLoaded(
          Object.keys(savedAnswers).length > 0
        );

        return {
          answers: savedAnswers,
          override:
            data.override || {
              note: '',
              date: '',
              reason_code: ''
            }
        };

      } catch (e) {
        console.warn(
          'Unable to load shared assessment answers:',
          e
        );

        setSharedAnswersLoaded(false);
        return null;
      }
    };


  const loadProgramAnswers =
    async (
      assessmentId: string,
      programId: string
    ) => {
      try {
        const snapshot =
          await getDoc(
            doc(
              db,
              'assessments',
              assessmentId,
              'programs',
              programId,
              'answers',
              'current'
            )
          );

        if (!snapshot.exists()) {
          return null;
        }

        const data: any =
          snapshot.data();

        return {
          answers: data.answers || {},
          override:
            data.override || {
              note: '',
              date: '',
              reason_code: ''
            }
        };

      } catch (e) {
        console.warn(
          'Unable to load program answers:',
          e
        );

        return null;
      }
    };


  /*
   * Create assessment.
   */
  const createAssessment =
    async (specialty: string) => {
      setMessage('');

      const cleanSpecialty =
        String(specialty || '').trim();

      if (!cleanSpecialty) {
        setMessage(
          'Please select a specialty.'
        );
        return;
      }

      const duplicateInState =
        assessments.some(
          (item: any) =>
            String(item.specialty || '') ===
            cleanSpecialty
        );

      if (duplicateInState) {
        setMessage(
          `You already have an assessment for ${cleanSpecialty}. Please resume the existing assessment.`
        );
        return;
      }

      try {
        /*
         * Re-check Firestore so a duplicate cannot be created
         * just because the dashboard snapshot has not refreshed yet.
         * We intentionally query only user_id and filter specialty
         * client-side to avoid requiring a composite index.
         */
        const existingSnapshot =
          await getDocs(
            query(
              collection(db, 'assessments'),
              where('user_id', '==', user.uid)
            )
          );

        const duplicate =
          existingSnapshot.docs.some(
            (document: any) =>
              String(
                document.data()?.specialty || ''
              ) === cleanSpecialty
          );

        if (duplicate) {
          setMessage(
            `You already have an assessment for ${cleanSpecialty}. Please resume the existing assessment.`
          );
          return;
        }

        const newAssessment: any = {
          user_id: user.uid,
          specialty: cleanSpecialty,
          season: 2027,
          status: 'DRAFT',
          algorithm_version: 'v1.0',
          specialty_config_version: 'v1.0',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };

        const ref =
          await addDoc(
            collection(
              db,
              'assessments'
            ),
            newAssessment
          );

        const currentAssessment = {
          ...newAssessment,
          id: ref.id
        };

        setAssessment(
          currentAssessment
        );

        setSelected([]);
        setActiveProgram(null);
        setAnswers({});
        setResult(null);
        setSharedAnswersLoaded(false);
        setAnswerMode('new');

        await loadApplicantProfile(
          cleanSpecialty,
          2027
        );

        setScreen('profile');

      } catch (e: any) {
        console.error(
          'Create assessment error:',
          e
        );

        setMessage(
          e?.message ||
          'Unable to create assessment.'
        );
      }
    };


  /*
   * Resume assessment.
   */
  const resume =
    async (a: any) => {
      setMessage('');

      try {
        setAssessment(a);
        setActiveProgram(null);
        setResult(null);

        await loadApplicantProfile(
          a.specialty || 'Internal Medicine',
          a.season || 2027
        );

        await loadSelectedPrograms(
          a.id
        );

        const shared =
          await loadSharedAnswers(
            a.id
          );

        if (shared) {
          setAnswers(shared.answers);
          setOverride(shared.override);
          setAnswerMode('shared');
        } else {
          setAnswers({});
          setOverride({
            note: '',
            date: '',
            reason_code: ''
          });
          setAnswerMode('new');
        }

        setScreen('profile');

      } catch (e: any) {
        console.error(
          'Resume assessment error:',
          e
        );

        setMessage(
          e?.message ||
          'Unable to resume assessment.'
        );
      }
    };


  /*
   * Save applicant profile.
   */
  const saveProfile =
    async () => {
      if (!assessment) {
        return;
      }

      setMessage('');

      try {
        const profileToSave: any = {
          ...profile,
          specialty:
            assessment.specialty ||
            profile.specialty,
          profile_source: 'signaling',
          updated_at: serverTimestamp()
        };

        /*
         * Main Signaling-owned profile.
         * New specialty assessments read from this document instead
         * of going back to the legacy Users collection.
         */
        await setDoc(
          doc(
            db,
            'signaling_profiles',
            user.uid
          ),
          profileToSave,
          {
            merge: true
          }
        );

        /*
         * Keep an assessment snapshot for audit/history.
         */
        await setDoc(
          doc(
            db,
            'assessments',
            assessment.id,
            'profile',
            'current'
          ),
          {
            ...profileToSave,
            profile_confirmed_at:
              serverTimestamp()
          },
          {
            merge: true
          }
        );

        await updateDoc(
          doc(
            db,
            'assessments',
            assessment.id
          ),
          {
            specialty:
              assessment.specialty ||
              profile.specialty,
            season:
              Number(
                profile.match_season
              ),
            updated_at:
              serverTimestamp()
          }
        );

        setProfile(
          (current: any) => ({
            ...current,
            specialty:
              assessment.specialty ||
              current.specialty,
            profile_source: 'signaling'
          })
        );

        await loadReferencePrograms(
          assessment.specialty ||
          profile.specialty
        );

        await loadSelectedPrograms(
          assessment.id
        );

        setScreen('programs');

      } catch (e: any) {
        console.error(
          'Save profile error:',
          e
        );

        setMessage(
          e?.message ||
          'Unable to save applicant profile.'
        );
      }
    };


  /*
   * Add a program.
   */
  const addProgram =
    async (p: any) => {

      setMessage('');


      if (!assessment) {

        setMessage(
          'Please create or resume an assessment first.'
        );

        return;
      }


      if (
        selected.length >= 50
      ) {

        setMessage(
          'Maximum 50 programs allowed.'
        );

        return;
      }


      const programId =
        `${String(
          p.Frieda
        )}_${String(
          p.PId
        )}`;


      const alreadySelected =
        selected.some(
          (x: any) =>
            x.program_id ===
            programId
        );


      if (
        alreadySelected
      ) {
        return;
      }


      const programName =
        getProgramName(p);


      const city =
        getProgramCity(p);


      const state =
        getProgramState(p);


      let existingHasResult = false;
      let existingStatus = 'ADDED';
      try {
        const existingResultSnapshot = await getDoc(doc(db,'assessments',assessment.id,'programs',programId,'result','current'));
        if (existingResultSnapshot.exists()) {
          const oldResult:any = existingResultSnapshot.data();
          existingHasResult = Boolean(oldResult?.final_priority);
          existingStatus = existingHasResult ? 'ASSESSED' : oldResult?.eligibility?.status === 'RESEARCH_REQUIRED' ? 'RESEARCH_NEEDED' : oldResult?.eligibility?.status === 'NOT_ALIGNED' ? 'ELIGIBILITY_MISMATCH' : 'IN_PROGRESS';
        }
      } catch (_) { existingHasResult = false; }


      const item: any = {

        program_id:
          programId,

        Frieda:
          p.Frieda || '',

        PId:
          p.PId || '',

        HId:
          p.HId || '',

        HPInfoId:
          p.HPInfoId || '',

        program_name:
          programName,

        city,

        state,

        source_updated_at:
          p.TimeStamp ||
          p.source_updated_at ||
          '',

        deleted_at:
          null,

        has_result:
          existingHasResult,

        status: existingStatus

      };


      try {

        await setDoc(

          doc(
            db,
            'assessments',
            assessment.id,
            'programs',
            programId
          ),

          item,

          {
            merge: true
          }

        );


        setSelected((current:any[]) => [...current,item]);
        await setDoc(doc(db,'assessments',assessment.id), { selected_count:selected.length+1, workspace_status:'IN_PROGRESS', updated_at:serverTimestamp() }, { merge:true });


      } catch (e: any) {

        console.error(
          'Add program error:',
          e
        );


        setMessage(
          e?.message ||
          'Unable to add program.'
        );

      }

    };


  /*
   * Open selected program.
   */
  const openProgram =
    async (p: any) => {
      if (!assessment) {
        return;
      }

      setActiveProgram(p);
      setResult(null);
      setMessage('');

      try {
        if (p.forceEdit) {
          const saved = await loadProgramAnswers(assessment.id, p.program_id);
          if (saved) { setAnswers(saved.answers); setOverride(saved.override); setAnswerMode('program'); }
          setScreen('assessment');
          return;
        }

        if (p.has_result) {
          const resultSnapshot =
            await getDoc(
              doc(
                db,
                'assessments',
                assessment.id,
                'programs',
                p.program_id,
                'result',
                'current'
              )
            );

          if (resultSnapshot.exists()) {
            setResult(
              resultSnapshot.data()
            );
            setScreen('result');
            return;
          }
        }

        const programSaved =
          await loadProgramAnswers(
            assessment.id,
            p.program_id
          );

        if (programSaved) {
          setAnswers(
            programSaved.answers
          );
          setOverride(
            programSaved.override
          );
          setAnswerMode('program');
          setScreen('answer-choice');
          return;
        }

        const shared =
          await loadSharedAnswers(
            assessment.id
          );

        if (shared) {
          setAnswers(
            shared.answers
          );
          setOverride(
            shared.override
          );
          setAnswerMode('shared');
          setScreen('answer-choice');
          return;
        }

        setAnswers({});
        setOverride({
          note: '',
          date: '',
          reason_code: ''
        });
        setAnswerMode('new');
        setScreen('assessment');

      } catch (e: any) {
        console.error(
          'Open program error:',
          e
        );

        setMessage(
          e?.message ||
          'Unable to open program.'
        );
      }
    };


  const viewProgramResult =
    async (p: any) => {
      if (!assessment) {
        return;
      }

      setActiveProgram(p);
      setMessage('');

      try {
        const snapshot =
          await getDoc(
            doc(
              db,
              'assessments',
              assessment.id,
              'programs',
              p.program_id,
              'result',
              'current'
            )
          );

        if (!snapshot.exists()) {
          setMessage(
            'Saved result was not found for this program.'
          );
          return;
        }

        const savedAnswers =
          await loadProgramAnswers(
            assessment.id,
            p.program_id
          );

        if (savedAnswers) {
          setAnswers(savedAnswers.answers);
          setOverride(savedAnswers.override);
          setAnswerMode('program');
        } else {
          const shared =
            await loadSharedAnswers(
              assessment.id
            );

          if (shared) {
            setAnswers(shared.answers);
            setOverride(shared.override);
            setAnswerMode('shared');
          }
        }

        setResult(
          snapshot.data()
        );
        setScreen('result');

      } catch (e: any) {
        console.error(
          'Result load error:',
          e
        );

        setMessage(
          e?.message ||
          'Unable to load saved result.'
        );
      }
    };


  const removeProgram = async (p:any) => {
      if (!assessment) return;
      if ((p.has_result || p.status === 'IN_PROGRESS' || p.status === 'RESEARCH_NEEDED') && !window.confirm('This program has saved work. Remove it from the active workspace? The record will be soft-deleted and can be restored later.')) return;
      setMessage('');

      try {
        await setDoc(
          doc(
            db,
            'assessments',
            assessment.id,
            'programs',
            p.program_id
          ),
          {
            deleted_at:
              serverTimestamp(),
            updated_at:
              serverTimestamp()
          },
          {
            merge: true
          }
        );

        const remaining = selected.filter((item:any)=>item.program_id!==p.program_id);
        setSelected(remaining);
        await setDoc(doc(db,'assessments',assessment.id), { selected_count:remaining.length, assessed_count:remaining.filter((x:any)=>x.status==='ASSESSED'||x.has_result).length, updated_at:serverTimestamp() }, { merge:true });

        if (
          activeProgram?.program_id ===
          p.program_id
        ) {
          setActiveProgram(null);
          setResult(null);
        }

      } catch (e: any) {
        console.error(
          'Remove program error:',
          e
        );

        setMessage(
          e?.message ||
          'Unable to remove program.'
        );
      }
    };


  const setAnswer = (questionCode: string, answerCode: any) => {
    setAnswers((current: any) => {
      const next = { ...current, [questionCode]: answerCode };
      if (assessment && activeProgram) {
        setDoc(doc(db,'assessments',assessment.id,'programs',activeProgram.program_id,'answers','current'), { answers: next, override, updated_at: serverTimestamp() }, { merge:true }).catch(console.warn);
        if (!activeProgram.has_result) {
          setDoc(doc(db,'assessments',assessment.id,'programs',activeProgram.program_id), { status:'IN_PROGRESS', updated_at:serverTimestamp() }, { merge:true }).catch(console.warn);
          setSelected((items:any[]) => items.map((item:any)=>item.program_id===activeProgram.program_id ? {...item,status:'IN_PROGRESS'} : item));
          setActiveProgram((item:any)=>item ? {...item,status:'IN_PROGRESS'} : item);
        }
      }
      return next;
    });
  };


  /*
   * Calculate program result.
   */
 const calculate = async () => {
  setMessage('');

  if (!assessment) {
    setMessage(
      'Assessment is missing.'
    );
    return;
  }

  if (!activeProgram) {
    setMessage(
      'Program is missing.'
    );
    return;
  }

  try {
    const data: any =
      calculateProgram({
        answers,
        override
      });

    console.log(
      'Calculated result:',
      data
    );

    /*
     * Save answers for this specific program.
     */
    await setDoc(
      doc(
        db,
        'assessments',
        assessment.id,
        'programs',
        activeProgram.program_id,
        'answers',
        'current'
      ),
      {
        answers,
        override,
        updated_at:
          serverTimestamp()
      },
      {
        merge: true
      }
    );

    /*
     * The first completed questionnaire becomes the reusable
     * assessment-level answer set. Later programs start from it.
     * Program-specific edits do not overwrite the shared baseline.
     */
    if (!sharedAnswersLoaded) {
      await setDoc(
        doc(
          db,
          'assessments',
          assessment.id,
          'answers',
          'current'
        ),
        {
          answers,
          override,
          created_from_program_id:
            activeProgram.program_id,
          updated_at:
            serverTimestamp()
        },
        {
          merge: true
        }
      );

      setSharedAnswersLoaded(true);
    }

    await setDoc(
      doc(
        db,
        'assessments',
        assessment.id,
        'programs',
        activeProgram.program_id,
        'result',
        'current'
      ),
      {
        ...data,
        calculated_at:
          serverTimestamp()
      },
      {
        merge: true
      }
    );

    const workspaceStatus = data.eligibility?.status === 'RESEARCH_REQUIRED'
      ? 'RESEARCH_NEEDED'
      : data.eligibility?.status === 'NOT_ALIGNED'
        ? (answers.E5 && answers.E5 !== 'NO_OVERRIDE' ? 'OVERRIDE_REQUIRED' : 'ELIGIBILITY_MISMATCH')
        : data.final_priority ? 'ASSESSED' : 'IN_PROGRESS';
    const hasCompletedResult = workspaceStatus === 'ASSESSED';

    await setDoc(doc(db,'assessments',assessment.id,'programs',activeProgram.program_id), {
      has_result: hasCompletedResult,
      status: workspaceStatus,
      eligibility_status: data.eligibility?.status || '',
      assessed_at: hasCompletedResult ? serverTimestamp() : null,
      updated_at: serverTimestamp()
    }, { merge:true });

    const updatedProgram = {
      ...activeProgram,
      has_result: hasCompletedResult,
      status: workspaceStatus,
      eligibility_status: data.eligibility?.status || '',
      result: data
    };

    setActiveProgram(
      updatedProgram
    );

    setSelected(
      (current: any[]) =>
        current.map(
          (item: any) =>
            item.program_id ===
            activeProgram.program_id
              ? {
                  ...item,
                  has_result: hasCompletedResult,
                  status: workspaceStatus,
                  eligibility_status: data.eligibility?.status || '',
                  result: data
                }
              : item
        )
    );

    const refreshed = selected.map((item:any)=> item.program_id===activeProgram.program_id ? updatedProgram : item);
    const assessedCount = refreshed.filter((item:any)=>item.status==='ASSESSED' || item.has_result).length;
    await setDoc(doc(db,'assessments',assessment.id), {
      selected_count: refreshed.length,
      assessed_count: assessedCount,
      workspace_status: assessedCount && assessedCount===refreshed.length ? 'ASSESSED' : 'IN_PROGRESS',
      updated_at: serverTimestamp()
    }, { merge:true });

    setResult(data);
    setScreen('result');

  } catch (e: any) {
    console.error(
      'Calculation failed:',
      e
    );

    setMessage(
      e?.message ||
      'Calculation failed.'
    );
  }
};


  const archiveAssessment = async (a:any) => {
    if (!window.confirm(`Archive the ${a.specialty} assessment?`)) return;
    await setDoc(doc(db,'assessments',a.id), { archived_at:serverTimestamp(), updated_at:serverTimestamp() }, { merge:true });
  };

  const editProgramFromPortfolio = async (p:any) => openProgram({...p, forceEdit:true});

  return (
    <Shell
      user={user}
      onLogout={() =>
        signOut(auth)
      }
    >
      {screen === 'dashboard' && (
        <Dashboard
          assessments={assessments}
          createAssessment={createAssessment}
          resume={resume}
          archiveAssessment={archiveAssessment}
          message={message}
        />
      )}

      {screen === 'profile' && (
        <Profile
          profile={profile}
          setProfile={setProfile}
          onContinue={saveProfile}
          onBack={() =>
            setScreen('dashboard')
          }
          message={message}
        />
      )}

      {screen === 'programs' && (
        <ProgramSelection
          programs={programs}
          programLoading={programLoading}
          selected={selected}
          addProgram={addProgram}
          openProgram={openProgram}
          viewProgramResult={viewProgramResult}
          removeProgram={removeProgram}
          message={message}
          specialty={profile.specialty}
          onCompare={() => setScreen('portfolio')}
          onBackToAssessments={() => setScreen('dashboard')}
        />
      )}


      {screen === 'answer-choice' && (
        <AnswerChoice
          program={activeProgram}
          answerMode={answerMode}
          onEdit={() =>
            setScreen('assessment')
          }
          onCalculate={calculate}
          onBack={() =>
            setScreen('programs')
          }
          message={message}
        />
      )}

      {screen === 'assessment' && (
        <Assessment
          config={config}
          answers={answers}
          setAnswer={setAnswer}
          override={override}
          setOverride={setOverride}
          program={activeProgram}
          onCalculate={calculate}
          onBack={() =>
            setScreen('programs')
          }
          message={message}
        />
      )}

      {screen === 'result' && (
        <Result
          result={result}
          program={activeProgram}
          onBack={() =>
            setScreen('programs')
          }
          onEdit={() => openProgram({...activeProgram, forceEdit:true})}
          onCompare={() => setScreen('portfolio')}
          canCompare={selected.filter((p:any)=>p.status==='ASSESSED'||p.has_result).length >= 2}
        />
      )}

      {screen === 'portfolio' && (
        <Portfolio
          programs={selected}
          onBack={() => setScreen('programs')}
          onView={viewProgramResult}
          onEdit={editProgramFromPortfolio}
          onFinalize={() => setScreen('finalize')}
        />
      )}

      {screen === 'finalize' && (
        <FinalizePlan
          assessment={assessment}
          programs={selected}
          onBack={() => setScreen('portfolio')}
        />
      )}
    </Shell>
  );
}


/*
 * Login
 */
