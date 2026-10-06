import React, {

  useEffect,

  useMemo,

  useState

} from "react";

import dayjs from "dayjs";

import {

  Box,

  Button,

  Typography,

  Grid,

  Paper,

  TableContainer,

  Table,

  TableHead,

  InputLabel,

  TableRow,

  TableCell,

  TableBody,

  TextField,

  MenuItem,

  Checkbox,

  ListItemText

} from "@mui/material";

import { DatePicker } from "antd";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import {
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  writeBatch
} from "firebase/firestore";

import { db } from "../../firebase";

import { useLoading } from "../../layout/LoadingContext";

const { RangePicker } = DatePicker;

const dateFormat = "MM/DD/YYYY";

let MatchPlanLists = {};

const UserDetails = () => {

  const { showLoading, hideLoading } = useLoading();

  /*

  |--------------------------------------------------------------------------

  | STATE

  |--------------------------------------------------------------------------

  */

  const [

    MatchPlanListObject,

    setMatchPlanListObject

  ] = useState({});

  const [

    data,

    setData

  ] = useState([]);

  const [

    sortConfig,

    setSortConfig

  ] = useState({

    key: "EnrollmentDate",

    direction: "ascending"

  });

  const [

    filters,

    setFilters

  ] = useState({});

  /*

  |--------------------------------------------------------------------------

  | YEAR OPTIONS

  |--------------------------------------------------------------------------

  */

  const currentYear =

    new Date().getFullYear();

  const startYear =

    currentYear - 7;

  const yearOptions =

    Array.from(

      { length: 20 },

      (_, i) => startYear + i

    );

  const validYearOptionsTo =

    yearOptions.filter(

      year =>

        !filters.SeasonFrom ||

        year >= filters.SeasonFrom

    );

  /*

  |--------------------------------------------------------------------------

  | UNIVERSAL DATE PARSER

  |--------------------------------------------------------------------------

  |

  | Supports:

  |

  | 1. Dayjs

  | 2. JS Date

  | 3. Firestore Timestamp

  | 4. { seconds, nanoseconds }

  | 5. { _seconds, _nanoseconds }

  | 6. String date

  |

  |--------------------------------------------------------------------------

  */

  const toDayjs = value => {

    if (

      value === null ||

      value === undefined ||

      value === ""

    ) {

      return null;

    }

    /*

     * Already Dayjs

     */

    if (

      dayjs.isDayjs(value)

    ) {

      return value.isValid()

        ? value

        : null;

    }

    /*

     * Firebase Timestamp

     */

    if (

      typeof value?.toDate ===

      "function"

    ) {

      const converted =

        dayjs(

          value.toDate()

        );

      return converted.isValid()

        ? converted

        : null;

    }

    /*

     * Serialized Timestamp:

     *

     * {

     *   seconds: 1784952000,

     *   nanoseconds: 0

     * }

     */

    if (

      typeof value ===

        "object" &&

      value?.seconds !==

        undefined &&

      value?.seconds !==

        null

    ) {

      const milliseconds =

        Number(

          value.seconds

        ) *

          1000 +

        Math.floor(

          Number(

            value.nanoseconds ||

              0

          ) / 1000000

        );

      const converted =

        dayjs(

          milliseconds

        );

      return converted.isValid()

        ? converted

        : null;

    }

    /*

     * Alternate serialized Timestamp:

     *

     * {

     *   _seconds: ...,

     *   _nanoseconds: ...

     * }

     */

    if (

      typeof value ===

        "object" &&

      value?._seconds !==

        undefined &&

      value?._seconds !==

        null

    ) {

      const milliseconds =

        Number(

          value._seconds

        ) *

          1000 +

        Math.floor(

          Number(

            value._nanoseconds ||

              0

          ) / 1000000

        );

      const converted =

        dayjs(

          milliseconds

        );

      return converted.isValid()

        ? converted

        : null;

    }

    /*

     * JavaScript Date

     */

    if (

      value instanceof Date

    ) {

      const converted =

        dayjs(value);

      return converted.isValid()

        ? converted

        : null;

    }

    /*

     * String date

     *

     * Example:

     *

     * Wed, 17 Jun 2026 04:00:00 GMT

     */

    if (

      typeof value ===

      "string"

    ) {

      const trimmed =

        value.trim();

      if (!trimmed) {

        return null;

      }

      const converted =

        dayjs(trimmed);

      return converted.isValid()

        ? converted

        : null;

    }

    /*

     * Final fallback

     */

    const converted =

      dayjs(value);

    return converted.isValid()

      ? converted

      : null;

  };

  /*

  |--------------------------------------------------------------------------

  | GET ACTUAL MEETING DATE

  |--------------------------------------------------------------------------

  |

  | New records:

  |

  | Relation.MeetingDate

  |

  | Older records may only contain:

  |

  | Relation.CompletionDate

  |

  | Therefore:

  |

  | MeetingDate first

  | CompletionDate fallback

  |

  |--------------------------------------------------------------------------

  */

  const getMeetingDate =

    meeting => {

      const mentorMeeting =

        meeting

          ?.MeetingWithPhysicianMentor;

      /*

       * Only completed meetings

       */

      if (

        mentorMeeting?.Value !==

        "Completed"

      ) {

        return null;

      }

      const relation =

        mentorMeeting

          ?.Relation;

      if (!relation) {

        return null;

      }

      /*

       * IMPORTANT:

       *

       * Prefer MeetingDate.

       *

       * CompletionDate is only

       * fallback for older records.

       */

      const rawDate =

        relation?.MeetingDate ??

        relation?.CompletionDate ??

        null;

      if (!rawDate) {

        return null;

      }

      return toDayjs(

        rawDate

      );

    };

  /*

  |--------------------------------------------------------------------------

  | GET MEETING DATE KEY

  |--------------------------------------------------------------------------

  */

  const getMeetingDateKey =

    meeting => {

      const date =

        getMeetingDate(

          meeting

        );

        

      if (!date) {

        return null;

      }

      return date.format(

        "YYYY-MM-DD"

      );

    };

  /*

  |--------------------------------------------------------------------------

  | RANGE PICKER VALUE

  |--------------------------------------------------------------------------

  */

  const meetingDateValue =

    useMemo(() => {

      if (

        !Array.isArray(

          filters?.meetingsDate

        ) ||

        filters

          .meetingsDate

          .length !== 2

      ) {

        return null;

      }

      const start =

        toDayjs(

          filters

            .meetingsDate[0]

        );

      const end =

        toDayjs(

          filters

            .meetingsDate[1]

        );

      if (

        !start ||

        !end

      ) {

        return null;

      }

      return [

        start,

        end

      ];

    }, [

      filters?.meetingsDate

    ]);

  /*

  |--------------------------------------------------------------------------

  | INITIAL LOAD

  |--------------------------------------------------------------------------

  */

  useEffect(() => {

    initializePage();

  }, []);

  /*

  |--------------------------------------------------------------------------

  | INITIALIZE

  |--------------------------------------------------------------------------

  */

  /*
  |--------------------------------------------------------------------------
  | ONE-TIME / SAFE MEETING DATE MIGRATION
  |--------------------------------------------------------------------------
  |
  | Converts ONLY string date values to Firestore Timestamp.
  | Existing Timestamp values are left untouched.
  |
  | Fields checked in every Meeting<number> that exists:
  |
  | 1. MeetingWithPhysicianMentor.Relation.CompletionDate
  | 2. MeetingWithPhysicianMentor.Relation.MeetingDate
  | 3. MeetingNextNotifyDate
  |
  | This is safe to leave enabled because after a value becomes a Timestamp,
  | typeof value !== "string", so it will not be written again.
  |--------------------------------------------------------------------------
  */

  const migrateMeetingStringDatesToTimestamp = async () => {
    const userServicesRef = collection(db, "UserServices");
    const snapshot = await getDocs(userServicesRef);

    let scannedUsers = 0;
    let updatedUsers = 0;
    let convertedFields = 0;
    let invalidFields = 0;

    // Firestore batches allow up to 500 writes. Keep some room below that.
    const MAX_BATCH_WRITES = 450;
    let batch = writeBatch(db);
    let batchWriteCount = 0;

    const commitBatchIfNeeded = async force => {
      if (batchWriteCount === 0) return;

      if (force || batchWriteCount >= MAX_BATCH_WRITES) {
        await batch.commit();
        batch = writeBatch(db);
        batchWriteCount = 0;
      }
    };

    for (const docSnap of snapshot.docs) {
      scannedUsers++;

      const userData = docSnap.data();
      const meetings = userData?.Match?.Platinum?.Meetings;

      if (!meetings || typeof meetings !== "object") {
        continue;
      }

      const updates = {};

      const meetingKeys = Object.keys(meetings)
        .filter(key => /^Meeting\d+$/.test(key))
        .sort(
          (a, b) =>
            Number(a.replace("Meeting", "")) -
            Number(b.replace("Meeting", ""))
        );

      const addTimestampUpdate = (
        fieldPath,
        value,
        meetingKey,
        fieldName
      ) => {
        // IMPORTANT: only migrate strings.
        // Existing Firestore Timestamp / Date / object values are untouched.
        if (typeof value !== "string") {
          return;
        }

        const trimmed = value.trim();

        if (!trimmed) {
          return;
        }

        const parsedDate = new Date(trimmed);

        if (Number.isNaN(parsedDate.getTime())) {
          invalidFields++;

          console.warn(
            "Invalid meeting date - not converted:",
            {
              userId: docSnap.id,
              meeting: meetingKey,
              field: fieldName,
              value
            }
          );

          return;
        }

        updates[fieldPath] = Timestamp.fromDate(parsedDate);
        convertedFields++;
      };

      meetingKeys.forEach(meetingKey => {
        const meeting = meetings?.[meetingKey];

        if (!meeting || typeof meeting !== "object") {
          return;
        }

        const relation =
          meeting
            ?.MeetingWithPhysicianMentor
            ?.Relation;

        addTimestampUpdate(
          `Match.Platinum.Meetings.${meetingKey}.MeetingWithPhysicianMentor.Relation.CompletionDate`,
          relation?.CompletionDate,
          meetingKey,
          "CompletionDate"
        );

        addTimestampUpdate(
          `Match.Platinum.Meetings.${meetingKey}.MeetingWithPhysicianMentor.Relation.MeetingDate`,
          relation?.MeetingDate,
          meetingKey,
          "MeetingDate"
        );

        addTimestampUpdate(
          `Match.Platinum.Meetings.${meetingKey}.MeetingNextNotifyDate`,
          meeting?.MeetingNextNotifyDate,
          meetingKey,
          "MeetingNextNotifyDate"
        );
      });

      if (Object.keys(updates).length > 0) {
        batch.update(
          doc(db, "UserServices", docSnap.id),
          updates
        );

        batchWriteCount++;
        updatedUsers++;

        console.log(
          "Meeting dates scheduled for conversion:",
          docSnap.id,
          updates
        );

        await commitBatchIfNeeded(false);
      }
    }

    await commitBatchIfNeeded(true);

    console.log("Meeting date migration completed:", {
      scannedUsers,
      updatedUsers,
      convertedFields,
      invalidFields
    });

    return {
      scannedUsers,
      updatedUsers,
      convertedFields,
      invalidFields
    };
  };

  const initializePage = async () => {
    showLoading();
    try {
      /*
       * First normalize old meeting string dates.
       *
       * This must run before the meeting-date Firestore queries because
       * Firestore Timestamp range queries will not match old string values.
       */
      //await migrateMeetingStringDatesToTimestamp();

      const matchPlansSnapshot = await getDocs(
        query(collection(db, "MatchPlans"), where("Type", "==", "Match"))
      );
      const matchPlanList = matchPlansSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      const obj = {};
      matchPlanList.forEach(item => { obj[item.id] = item; });
      setMatchPlanListObject(obj);
      MatchPlanLists = obj;

      let savedFilters = {};
      const savedFilterSnapshot = await getDoc(
        doc(db, "SavedFilters", "listofallmatchmentor")
      );
      if (savedFilterSnapshot.exists()) {
        savedFilters = { id: savedFilterSnapshot.id, ...savedFilterSnapshot.data() };
        if (Array.isArray(savedFilters.meetingsDate) && savedFilters.meetingsDate.length === 2) {
          const start = toDayjs(savedFilters.meetingsDate[0]);
          const end = toDayjs(savedFilters.meetingsDate[1]);
          savedFilters.meetingsDate = start && end
            ? [start.startOf("day"), end.endOf("day")]
            : null;
        }
      }
      setFilters(savedFilters);
      await loadData(savedFilters, false);
    } catch (error) {
      console.error("initializePage error:", error);
      setData([]);
    } finally {
      hideLoading();
    }
  };

  /*

  |--------------------------------------------------------------------------

  | BUILD FIRESTORE CONDITIONS

  |--------------------------------------------------------------------------

  */

  const mergeUserProfiles = async serviceUsers => {
    if (!serviceUsers.length) return [];

    const usersSnapshot = await getDocs(collection(db, "Users"));
    const profileMap = new Map();

    usersSnapshot.docs.forEach(docSnap => {
      const profile = { id: docSnap.id, ...docSnap.data() };
      [docSnap.id, profile?.uid, profile?.UserId, profile?.userId]
        .filter(Boolean)
        .forEach(key => profileMap.set(String(key), profile));
    });

    return serviceUsers.map(serviceUser => {
      let profile = serviceUser?.profile || null;
      if (!profile) {
        const keys = [serviceUser?.uid, serviceUser?.UserId, serviceUser?.userId, serviceUser?.id].filter(Boolean);
        for (const key of keys) {
          if (profileMap.has(String(key))) {
            profile = profileMap.get(String(key));
            break;
          }
        }
      }
      return { ...serviceUser, profile: profile || {} };
    });
  };

  const getUsersDirectlyFromFirestore = async activeFilters => {
    const userServicesRef = collection(db, "UserServices");
    const plans = activeFilters?.Plan
      ? (Array.isArray(activeFilters.Plan) ? activeFilters.Plan : [activeFilters.Plan])
      : [];
    const planConstraints = [];

    if (plans.length === 1) {
      planConstraints.push(where("Match.Plan.Name", "==", plans[0]));
    } else if (plans.length > 1) {
      planConstraints.push(where("Match.Plan.Name", "in", plans.slice(0, 30)));
    }

    const hasMeetingDateFilter =
      Array.isArray(activeFilters?.meetingsDate) &&
      activeFilters.meetingsDate.length === 2;

    if (!hasMeetingDateFilter) {
      const constraints = [...planConstraints];
      if (!constraints.length) constraints.push(where("Match.Notes", "!=", "Rameez"));
      const snapshot = await getDocs(query(userServicesRef, ...constraints));
      return mergeUserProfiles(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
    }

    const start = toDayjs(activeFilters.meetingsDate[0]);
    const end = toDayjs(activeFilters.meetingsDate[1]);
    if (!start || !end) return [];

    const startTimestamp = Timestamp.fromDate(start.startOf("day").toDate());
    const endTimestamp = Timestamp.fromDate(end.endOf("day").toDate());

    const requests = Array.from({ length: 7 }, (_, meetingIndex) => {
      const basePath = `Match.Platinum.Meetings.Meeting${meetingIndex}.MeetingWithPhysicianMentor`;
      const meetingDatePath = `${basePath}.Relation.MeetingDate`;
      return getDocs(query(
        userServicesRef,
        ...planConstraints,
        where(meetingDatePath, ">=", startTimestamp),
        where(meetingDatePath, "<=", endTimestamp)
      )).then(snapshot => ({ meetingIndex, snapshot }));
    });

    const queryResults = await Promise.all(requests);
    const matchedUsers = new Map();

    queryResults.forEach(({ meetingIndex, snapshot }) => {
      snapshot.docs.forEach(docSnap => {
        const rawUser = { id: docSnap.id, ...docSnap.data() };
        const meeting = rawUser?.Match?.Platinum?.Meetings?.[`Meeting${meetingIndex}`];
        if (meeting?.MeetingWithPhysicianMentor?.Value !== "Completed") return;

        const existing = matchedUsers.get(docSnap.id);
        if (existing) {
          existing.MatchedMeetingIndexes.push(meetingIndex);
        } else {
          matchedUsers.set(docSnap.id, { ...rawUser, MatchedMeetingIndexes: [meetingIndex] });
        }
      });
    });

    const serviceUsers = Array.from(matchedUsers.values());
    console.log("MEETING RANGE:", { start: startTimestamp.toDate(), end: endTimestamp.toDate() });
    console.log("MATCHED USERS:", serviceUsers.length);
    return mergeUserProfiles(serviceUsers);
  };

  /*

  |--------------------------------------------------------------------------

  | PREPARE FILTER FOR SAVING

  |--------------------------------------------------------------------------

  */

  const prepareFiltersForSave =

    activeFilters => {

      const filtersToSave =

        {

          ...activeFilters

        };

      if (

        Array.isArray(

          activeFilters

            ?.meetingsDate

        ) &&

        activeFilters

          .meetingsDate

          .length === 2

      ) {

        const start =

          toDayjs(

            activeFilters

              .meetingsDate[0]

          );

        const end =

          toDayjs(

            activeFilters

              .meetingsDate[1]

          );

        if (

          start &&

          end

        ) {

          filtersToSave

            .meetingsDate = [

            Timestamp.fromDate(

              start

                .startOf(

                  "day"

                )

                .toDate()

            ),

            Timestamp.fromDate(

              end

                .endOf(

                  "day"

                )

                .toDate()

            )

          ];

        } else {

          filtersToSave

            .meetingsDate =

            null;

        }

      }

      return filtersToSave;

    };

  /*

  |--------------------------------------------------------------------------

  | APPLY FILTER

  |--------------------------------------------------------------------------

  */

  const FilterData =

    async () => {

      showLoading();

      try {

        console.log(

          "UI FILTERS:",

          filters

        );

        const filtersToSave =

          prepareFiltersForSave(

            filters

          );

        console.log(

          "FILTERS TO SAVE:",

          filtersToSave

        );

        await setDoc(
        doc(db, "SavedFilters", "listofallmatchmentor"),
        { ...filtersToSave, filtertype: "listofallmatchmentor" },
        { merge: true }
      );

        /*

         * IMPORTANT:

         *

         * Load with current UI

         * filters, not filtersToSave.

         */

        await loadData(

          filters,

          false

        );

      } catch (error) {

        console.error(

          "FilterData error:",

          error

        );

      } finally {

        hideLoading();

      }

    };

  /*

  |--------------------------------------------------------------------------

  | PROCESS USER MEETINGS

  |--------------------------------------------------------------------------

  */

  const processUserWithoutNotes = user => {
    const meetingsSource = user?.Match?.Platinum?.Meetings || {};
    const meetings = Array.isArray(meetingsSource)
      ? meetingsSource
      : Object.keys(meetingsSource)
          .filter(key => /^Meeting\d+$/.test(key))
          .sort((a, b) => Number(a.replace("Meeting", "")) - Number(b.replace("Meeting", "")))
          .map(key => meetingsSource[key]);

    let totalMentorMeetings = 0;
    let lastMeetingDate = null;
    meetings.forEach(meeting => {
      const meetingDate = getMeetingDateKey(meeting);
      if (!meetingDate) return;
      totalMentorMeetings++;
      if (!lastMeetingDate || meetingDate > lastMeetingDate) lastMeetingDate = meetingDate;
    });

    return {
      ...user,
      NotesCount: {},
      TotalNotes: 0,
      TotalMentorMeetings: totalMentorMeetings,
      LastMentorMeetingDate: lastMeetingDate
    };
  };

  /*

  |--------------------------------------------------------------------------

  | LOAD DATA

  |--------------------------------------------------------------------------

  */

  const loadData = async (activeFilters = {}, manageLoader = true) => {
    if (manageLoader) showLoading();
    try {
      const users = await getUsersDirectlyFromFirestore(activeFilters);
      console.log("TOTAL USERS LOADED:", users.length);
      setData(users.map(processUserWithoutNotes));
    } catch (error) {
      console.error("loadData error:", error);
      setData([]);
    } finally {
      if (manageLoader) hideLoading();
    }
  };

  /*

  |--------------------------------------------------------------------------

  | CLEAR FILTER

  |--------------------------------------------------------------------------

  */

  const clearFilter =

    async key => {

      const updatedFilters =

        {

          ...filters,

          [key]: null

        };

      setFilters(

        updatedFilters

      );

      showLoading();

      try {

        const filtersToSave =

          prepareFiltersForSave(

            updatedFilters

          );

        await setDoc(
        doc(db, "SavedFilters", "listofallmatchmentor"),
        { ...filtersToSave, filtertype: "listofallmatchmentor" },
        { merge: true }
      );

        await loadData(

          updatedFilters,

          false

        );

      } catch (error) {

        console.error(

          "clearFilter error:",

          error

        );

      } finally {

        hideLoading();

      }

    };

  /*

  |--------------------------------------------------------------------------

  | RESET SINGLE FILTER

  |--------------------------------------------------------------------------

  */

  const resetSingleFilter =

    async key => {

      const updatedFilters =

        {

          ...filters,

          [key]: null

        };

      if (

        key === "status"

      ) {

        updatedFilters.status =

          "";

      }

      setFilters(

        updatedFilters

      );

      showLoading();

      try {

        const filtersToSave =

          prepareFiltersForSave(

            updatedFilters

          );

        await setDoc(
        doc(db, "SavedFilters", "listofallmatchmentor"),
        { ...filtersToSave, filtertype: "listofallmatchmentor" },
        { merge: true }
      );

        await loadData(

          updatedFilters,

          false

        );

      } catch (error) {

        console.error(

          "resetSingleFilter error:",

          error

        );

      } finally {

        hideLoading();

      }

    };

  /*

  |--------------------------------------------------------------------------

  | FORMAT SEASON

  |--------------------------------------------------------------------------

  */

  const formatSeason =

    season => {

      if (

        !season ||

        isNaN(

          Number(season)

        )

      ) {

        return season;

      }

      const numericSeason =

        Number(season);

      return (

        `Match Season ${numericSeason} ` +

        `(Sept ${numericSeason - 1})`

      );

    };

  /*

  |--------------------------------------------------------------------------

  | PAYMENT HELPERS

  |--------------------------------------------------------------------------

  */

  const getLatestPaymentDate =

    user => {

      const payments =

        user?.Match

          ?.Payments ||

        {};

      const dates =

        Object.values(

          payments

        )

          .map(

            p => {

              const date =

                toDayjs(

                  p?.PaymentDate

                );

              return date

                ? date.valueOf()

                : null;

            }

          )

          .filter(

            value =>

              value !== null

          );

      if (

        !dates.length

      ) {

        return null;

      }

      return Math.max(

        ...dates

      );

    };

  const getTotalPaymentAmount =

    user => {

      const payments =

        user?.Match

          ?.Payments ||

        {};

      const total =

        Object.values(

          payments

        ).reduce(

          (

            sum,

            payment

          ) =>

            sum +

            (

              Number(

                payment?.Amount

              ) ||

              0

            ),

          0

        );

      return (

        Math.round(

          (

            total +

            Number.EPSILON

          ) *

            100

        ) /

        100

      );

    };

  /*

  |--------------------------------------------------------------------------

  | SORTING

  |--------------------------------------------------------------------------

  */

  const requestSort =

    key => {

      let direction =

        "ascending";

      if (

        sortConfig.key ===

          key &&

        sortConfig.direction ===

          "ascending"

      ) {

        direction =

          "descending";

      }

      setSortConfig({

        key,

        direction

      });

    };

  const sortedData =

    useMemo(() => {

      const sortable = [

        ...data

      ];

      sortable.sort(

        (a, b) => {

          let aVal;

          let bVal;

          switch (

            sortConfig.key

          ) {

            case "EnrollmentDate":

              aVal =

                toDayjs(

                  a?.Match

                    ?.EnrollmentDate

                )?.valueOf() ||

                0;

              bVal =

                toDayjs(

                  b?.Match

                    ?.EnrollmentDate

                )?.valueOf() ||

                0;

              break;

            case "Season":

              aVal =

                a?.Match

                  ?.Season ||

                0;

              bVal =

                b?.Match

                  ?.Season ||

                0;

              break;

            case "PaymentDate":

              aVal =

                getLatestPaymentDate(

                  a

                ) ||

                0;

              bVal =

                getLatestPaymentDate(

                  b

                ) ||

                0;

              break;

            case "PaymentAmount":

              aVal =

                getTotalPaymentAmount(

                  a

                );

              bVal =

                getTotalPaymentAmount(

                  b

                );

              break;

            case "Notes":

              aVal =

                a?.TotalNotes ||

                0;

              bVal =

                b?.TotalNotes ||

                0;

              break;

            case "MentorMeetings":

              aVal =

                a

                  ?.TotalMentorMeetings ||

                0;

              bVal =

                b

                  ?.TotalMentorMeetings ||

                0;

              break;

            case "email":

              aVal =

                a?.profile

                  ?.email ||

                "";

              bVal =

                b?.profile

                  ?.email ||

                "";

              break;

            case "StudentUniqueId":

              aVal =

                a?.profile

                  ?.StudentUniqueId ||

                "";

              bVal =

                b?.profile

                  ?.StudentUniqueId ||

                "";

              break;

            case "displayName":

              aVal =

                a?.profile

                  ?.displayName ||

                "";

              bVal =

                b?.profile

                  ?.displayName ||

                "";

              break;

            case "Plan":

              aVal =

                a?.Match

                  ?.Plan

                  ?.Relation

                  ?.Value ||

                MatchPlanLists?.[

                  a?.Match

                    ?.Plan

                    ?.Name

                ]?.Name ||

                "";

              bVal =

                b?.Match

                  ?.Plan

                  ?.Relation

                  ?.Value ||

                MatchPlanLists?.[

                  b?.Match

                    ?.Plan

                    ?.Name

                ]?.Name ||

                "";

              break;

            case "Status":

              aVal =

                a?.Match

                  ?.Status

                  ?.Relation

                  ?.Value ||

                a?.Match

                  ?.Status

                  ?.Name ||

                "";

              bVal =

                b?.Match

                  ?.Status

                  ?.Relation

                  ?.Value ||

                b?.Match

                  ?.Status

                  ?.Name ||

                "";

              break;

            default:

              aVal =

                a?.profile

                  ?.displayName ||

                "";

              bVal =

                b?.profile

                  ?.displayName ||

                "";

          }

          if (

            typeof aVal ===

            "string"

          ) {

            aVal =

              aVal.toLowerCase();

          }

          if (

            typeof bVal ===

            "string"

          ) {

            bVal =

              bVal.toLowerCase();

          }

          if (

            aVal < bVal

          ) {

            return sortConfig.direction ===

              "ascending"

              ? -1

              : 1;

          }

          if (

            aVal > bVal

          ) {

            return sortConfig.direction ===

              "ascending"

              ? 1

              : -1;

          }

          return 0;

        }

      );

      return sortable;

    }, [

      data,

      sortConfig

    ]);

  /*

  |--------------------------------------------------------------------------

  | FORMAT GENERAL DATE

  |--------------------------------------------------------------------------

  */

  const convertDate =

    value => {

      if (!value) {

        return "";

      }

      /*

       * getLatestPaymentDate

       * returns milliseconds.

       */

      if (

        typeof value ===

        "number"

      ) {

        const date =

          dayjs(value);

        return date.isValid()

          ? date.format(

              "MM-DD-YYYY"

            )

          : "";

      }

      const date =

        toDayjs(value);

      return date

        ? date.format(

            "MM-DD-YYYY"

          )

        : "";

    };

  /*

  |--------------------------------------------------------------------------

  | FORMAT MEETING DATE

  |--------------------------------------------------------------------------

  |

  | LastMentorMeetingDate is already:

  |

  | YYYY-MM-DD

  |

  | Do NOT convert it to JS Date.

  |

  |--------------------------------------------------------------------------

  */

  const formatMeetingDate =

    value => {

      if (!value) {

        return "-";

      }

      const parts =

        String(value)

          .split("-");

      if (

        parts.length !== 3

      ) {

        return value;

      }

      const [

        year,

        month,

        day

      ] = parts;

      return (

        `${month}/${day}/${year}`

      );

    };

  /*

  |--------------------------------------------------------------------------

  | RENDER

  |--------------------------------------------------------------------------

  */

  return (

    <Box p={3}>

      <Paper

        sx={{

          p: 3,

          mb: 4

        }}

      >

        <Typography

          variant="h6"

          mb={2}

        >

          Filters

        </Typography>

        <Grid

          container

          spacing={2}

        >

          {/* PLAN */}

          <Grid

            item

            xs={12}

            md={3}

          >

            <TextField

              select

              fullWidth

              label="Plan"

              value={

                Array.isArray(

                  filters.Plan

                )

                  ? filters.Plan

                  : filters.Plan

                  ? [

                      filters.Plan

                    ]

                  : []

              }

              onChange={

                e =>

                  setFilters(

                    prev => ({

                      ...prev,

                      Plan:

                        e.target

                          .value

                    })

                  )

              }

              SelectProps={{

                multiple:

                  true,

                renderValue:

                  selected =>

                    (

                      Array.isArray(

                        selected

                      )

                        ? selected

                        : [

                            selected

                          ]

                    )

                      .map(

                        pid => {

                          if (

                            pid ===

                            "Custom"

                          ) {

                            return "Custom";

                          }

                          const plan =

                            Object.values(

                              MatchPlanListObject ||

                                {}

                            ).find(

                              p =>

                                p.Pid ===

                                pid

                            );

                          return (

                            plan?.Name ||

                            pid

                          );

                        }

                      )

                      .join(", ")

              }}

            >

              {Object.entries(

                MatchPlanListObject ||

                  {}

              ).map(

                ([

                  key,

                  value

                ]) => (

                  <MenuItem

                    key={

                      key

                    }

                    value={

                      value.Pid

                    }

                  >

                    <Checkbox

                      checked={

                        (

                          Array.isArray(

                            filters.Plan

                          )

                            ? filters.Plan

                            : filters.Plan

                            ? [

                                filters.Plan

                              ]

                            : []

                        ).indexOf(

                          value.Pid

                        ) >

                        -1

                      }

                    />

                    <ListItemText

                      primary={

                        value.Name

                      }

                    />

                  </MenuItem>

                )

              )}

              <MenuItem

                value="Custom"

              >

                <Checkbox

                  checked={

                    (

                      Array.isArray(

                        filters.Plan

                      )

                        ? filters.Plan

                        : filters.Plan

                        ? [

                            filters.Plan

                          ]

                        : []

                    ).indexOf(

                      "Custom"

                    ) >

                    -1

                  }

                />

                <ListItemText

                  primary="Custom"

                />

              </MenuItem>

            </TextField>

            {(Array.isArray(

              filters.Plan

            )

              ? filters.Plan

                  .length > 0

              : !!filters.Plan) && (

              <Button

                size="small"

                color="error"

                onClick={() =>

                  resetSingleFilter(

                    "Plan"

                  )

                }

              >

                Clear

              </Button>

            )}

          </Grid>

          {/* MEETING DATE */}

          <Grid

            item

            xs={12}

            md={6}

          >

            <InputLabel>

              Meeting Date

            </InputLabel>

            <RangePicker

              style={{

                width:

                  "100%"

              }}

              name="MeetingDate"

              value={

                meetingDateValue

              }

              format={

                dateFormat

              }

              onChange={

                dates => {

                  if (

                    !dates ||

                    dates.length !==

                      2

                  ) {

                    setFilters(

                      prev => ({

                        ...prev,

                        meetingsDate:

                          null

                      })

                    );

                    return;

                  }

                  /*

                   * Keep Dayjs in

                   * React state.

                   */

                  setFilters(

                    prev => ({

                      ...prev,

                      meetingsDate:

                        [

                          dates[0]

                            .startOf(

                              "day"

                            ),

                          dates[1]

                            .endOf(

                              "day"

                            )

                        ]

                    })

                  );

                }

              }

              allowClear={

                false

              }

            />

            {filters

              ?.meetingsDate && (

              <Button

                size="small"

                color="error"

                onClick={() =>

                  clearFilter(

                    "meetingsDate"

                  )

                }

                sx={{

                  mt: 1

                }}

              >

                Clear

              </Button>

            )}

          </Grid>

          {/* APPLY */}

          <Grid

            item

            xs={12}

          >

            <Button

              variant="contained"

              onClick={

                FilterData

              }

            >

              Apply Filters

            </Button>

          </Grid>

        </Grid>

      </Paper>

      {/* TOTAL */}

      <Typography

        variant="h6"

        mb={2}

      >

        Match Users Total ={" "}

        {sortedData.length}

      </Typography>

      {/* TABLE */}

      <TableContainer

        component={Paper}

      >

        <Table>

          <TableHead>

            <TableRow>

              <TableCell

                onClick={() =>

                  requestSort(

                    "StudentUniqueId"

                  )

                }

              >

                Student ID{" "}

                {sortConfig.key ===

                  "StudentUniqueId" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "email"

                  )

                }

              >

                Email{" "}

                {sortConfig.key ===

                  "email" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "displayName"

                  )

                }

              >

                Name{" "}

                {sortConfig.key ===

                  "displayName" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "EnrollmentDate"

                  )

                }

              >

                Enrollment Date{" "}

                {sortConfig.key ===

                  "EnrollmentDate" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "Plan"

                  )

                }

              >

                Plan{" "}

                {sortConfig.key ===

                  "Plan" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "Status"

                  )

                }

              >

                Status{" "}

                {sortConfig.key ===

                  "Status" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "Season"

                  )

                }

              >

                Match Season{" "}

                {sortConfig.key ===

                  "Season" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "PaymentDate"

                  )

                }

              >

                Latest Payment Date{" "}

                {sortConfig.key ===

                  "PaymentDate" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "Notes"

                  )

                }

                sx={{

                  whiteSpace:

                    "nowrap",

                  width: "1%"

                }}

              >

                Notes{" "}

                {sortConfig.key ===

                  "Notes" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon

                          fontSize="small"

                        />

                      )

                      : (

                        <ArrowDownwardIcon

                          fontSize="small"

                        />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "MentorMeetings"

                  )

                }

                sx={{

                  whiteSpace:

                    "nowrap",

                  width: "1%"

                }}

              >

                Mentor Meetings{" "}

                {sortConfig.key ===

                  "MentorMeetings" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon

                          fontSize="small"

                        />

                      )

                      : (

                        <ArrowDownwardIcon

                          fontSize="small"

                        />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "PaymentAmount"

                  )

                }

              >

                Total Payment Amount{" "}

                {sortConfig.key ===

                  "PaymentAmount" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {sortedData.map(

              (

                user,

                index

              ) => (

                <TableRow

                  key={

                    user?.uid ||

                    index

                  }

                >

                  <TableCell>

                    S

                    {

                      user

                        ?.profile

                        ?.StudentUniqueId

                    }

                  </TableCell>

                  <TableCell>

                    <a

                      href={`/admin/userdetails/${user?.profile?.uid}`}

                      target="_blank"

                      rel="noreferrer"

                      style={{

                        padding:

                          "2px 20px",

                        backgroundColor:

                          "#af4cab",

                        marginBottom:

                          "3px",

                        marginRight:

                          "3px",

                        color:

                          "white",

                        textDecoration:

                          "none",

                        borderRadius:

                          "5px",

                        display:

                          "inline-block",

                        fontWeight:

                          "bold"

                      }}

                    >

                      {

                        user

                          ?.profile

                          ?.email

                      }

                    </a>

                  </TableCell>

                  <TableCell>

                    {

                      user

                        ?.profile

                        ?.displayName

                    }

                  </TableCell>

                  <TableCell>

                    {convertDate(

                      user

                        ?.Match

                        ?.EnrollmentDate

                    )}

                  </TableCell>

                  <TableCell>

                    {

                      user

                        ?.Match

                        ?.Plan

                        ?.Relation

                        ?.Value ||

                      MatchPlanLists?.[

                        user

                          ?.Match

                          ?.Plan

                          ?.Name

                      ]?.Name

                    }

                  </TableCell>

                  <TableCell>

                    {

                      user

                        ?.Match

                        ?.Status

                        ?.Relation

                        ?.Value ||

                      user

                        ?.Match

                        ?.Status

                        ?.Name

                    }

                  </TableCell>

                  <TableCell>

                    {formatSeason(

                      user

                        ?.Match

                        ?.Season

                    )}

                  </TableCell>

                  <TableCell>

                    {convertDate(

                      getLatestPaymentDate(

                        user

                      )

                    )}

                  </TableCell>

                  {/* NOTES */}

                  <TableCell

                    sx={{

                      whiteSpace:

                        "nowrap",

                      width:

                        "1%",

                      verticalAlign:

                        "top"

                    }}

                  >

                    {user?.NotesCount

                      ? Object.entries(

                          user.NotesCount

                        )

                          .sort(

                            (

                              a,

                              b

                            ) =>

                              b[1]

                                .Count -

                              a[1]

                                .Count

                          )

                          .map(

                            ([

                              email,

                              info

                            ]) => (

                              <div

                                key={

                                  email

                                }

                                style={{

                                  marginBottom:

                                    6

                                }}

                              >

                                <strong>

                                  {email}

                                </strong>

                                : (

                                {

                                  info.Count

                                }

                                )

                                <br />

                                {info.NoteDate

                                  ? convertDate(

                                      info.NoteDate

                                    )

                                  : "-"}

                              </div>

                            )

                          )

                      : "-"}

                  </TableCell>

                  {/* MENTOR MEETINGS */}

                  <TableCell

                    sx={{

                      whiteSpace:

                        "nowrap",

                      width:

                        "1%",

                      verticalAlign:

                        "top"

                    }}

                  >

                    {user

                      ?.TotalMentorMeetings

                      ? (

                        <>

                          <strong>

                            {

                              user

                                ?.Match

                                ?.Platinum

                                ?.AssignedMentor

                                ?.label

                            }

                            (

                            {

                              user.TotalMentorMeetings

                            }

                            )

                          </strong>

                          <br />

                          {formatMeetingDate(

                            user

                              .LastMentorMeetingDate

                          )}

                        </>

                      )

                      : "-"}

                  </TableCell>

                  <TableCell>

                    ₹{" "}

                    {getTotalPaymentAmount(

                      user

                    )}

                  </TableCell>

                </TableRow>

              )

            )}

          </TableBody>

        </Table>

      </TableContainer>

    </Box>

  );

};

export default UserDetails;