import {
  doc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  limit,
  deleteDoc,
  orderBy,
  writeBatch,
  startAfter,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import pLimit from "p-limit"; // npm install p-limit

const limit1 = pLimit(10);
const Databasecollection="Usmle"
// Define your main database names for websites

// Helper function to update or create document by field
const firestoreQueries = {
Timestamp:Timestamp,

async handleUpdate(databaseName,CollectionName,docId,data) {
    try {
      //await collection(db,CollectionName).doc(docId).update(data);
       const docRef = doc(db,Databasecollection,databaseName, CollectionName, docId);
      //await updateDoc(docRef, data);
      await setDoc(docRef, data, { merge: true });
      return {
      'status':'success',
      'message':'Updated Successfully'
      };
    } catch (error) {
      return {
      'status':'error',
      'message':error
      };
    }
  },
  async updateOrCreateById(databaseName, collectionName, documentId, data) {
  try {
    // Reference to the specific document by its ID (documentId)
    const docRef = doc(db,Databasecollection, databaseName, collectionName, documentId);

    // Check if the document with the given ID exists
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      // Document exists, update it
      await setDoc(docRef, { ...data, id: documentId }, { merge: true });
      return { status: 'success', message: 'Updated Successfully' };
    } else {
      // Document does not exist, create it
      await setDoc(docRef, { ...data, id: documentId });
      return { status: 'success', message: 'Created new document successfully', docId: documentId };
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }
},
async FetchUniqueData (databaseName,mainCollectionName,uniquecolumn){
  let uniqueStates=[];
      try {
        const mainCollectionRef = collection(db,Databasecollection, databaseName,mainCollectionName); // replace 'mainCollectionName' with your collection name
        const querySnapshot = await getDocs(mainCollectionRef);
        const states = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data[uniquecolumn]) {
            states.push(data[uniquecolumn]);
          }
        });

        // Get unique states
        uniqueStates = [...new Set(states)];
        return uniqueStates;
      } catch (error) {
        return uniqueStates;
      }
    },
    async updateOrCreateByField(databaseName, collectionName, conditions, data) {
  try {
    const collectionRef = collection(db, Databasecollection, databaseName, collectionName);

    // Apply multiple conditions to the query
    let queryRef = collectionRef;
    console.log("conditions====>",conditions)
    conditions.forEach(condition => {
      queryRef = query(queryRef, where(condition.fieldName, condition.operator, condition.value));
    });

    const querySnapshot = await getDocs(queryRef);

    if (!querySnapshot.empty) {
      // Update existing documents
      await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
        const docRef = doc(db, Databasecollection, databaseName, collectionName, docSnapshot.id);
        await setDoc(docRef, { ...data, id: docSnapshot.id }, { merge: true });
      }));
      return { status: 'success', message: 'Updated Successfully', docId: querySnapshot.docs[0].id };
    } else {
      // Create a new document if none matches the query
      const newDocRef = await addDoc(collectionRef, {
        ...data,
        ...conditions.reduce((acc, cond) => ({ ...acc, [cond.fieldName]: cond.value }), {})
      });
      await setDoc(newDocRef, { id: newDocRef.id }, { merge: true });
      return { status: 'success', message: 'Created new lead successfully', docId: newDocRef.id };
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }
},
async copyCollection(databaseName,sourceCollection, targetCollection) {
  try {
    // Step 1: Fetch all documents from the source collection
    const querySnapshot = await getDocs(collection(db, Databasecollection, databaseName,sourceCollection));

    // Step 2: Iterate over each document in the source collection
    querySnapshot.forEach(async (document) => {
      const docData = document.data(); // Get document data

      // Step 3: Prepare the document for saving in the target collection
      //const convertedDataForSaving = convertRotationsArrayToMap(docData);

      // Step 4: Set the document in the target collection (same doc id)
      const targetDocRef = doc(db, Databasecollection, databaseName,targetCollection, document.id);
      await setDoc(targetDocRef, docData, { merge: true });

      console.log(`Document ${document.id} copied successfully.`);
    });

    console.log("All documents copied successfully.");
  } catch (error) {
    console.error("Error copying collection: ", error);
  }
},
async copyCollectionWithFieldAddition(databaseName, sourceCollection, targetCollection) {
  try {
    // Fetch all documents from the source collection
    const querySnapshot = await getDocs(collection(db, Databasecollection, databaseName, sourceCollection));

    // Counter for unique IDs
    let index = 1;

    // Iterate over each document
    for (const document of querySnapshot.docs) {
      const docData = document.data(); // Get document data

      // Generate uniqueid as "L1", "L2", "L3", ...
      const uniqueid = index;
      index++; // Increment for next document

      // Merge uniqueid into document data
      const updatedData = { ...docData, uniqueid };
      /*const updatedData = {
  contactsourceother: docData?.contactsourceother ?? "",
  marketingchannelsother: docData?.marketingchannelsother ?? "",
  marketingchannels: docData?.marketingchannels ?? "",
  contactsourcespecialtyother: docData?.contactsourcespecialtyother ?? "" ,
  ourresponse: docData?.ourresponse ?? "" ,
  contactsourcespecialty: docData?.ourresponse ?? "" ,
  contactsourcespecialtywebinarworkshopname: docData?.contactsourcespecialtywebinarworkshopname ?? "" ,
  contactsourceviateammembername: docData?.contactsourceviateammembername ?? "" ,
  contactsourceseventdate: docData?.contactsourceseventdate ?? "" ,
  contactsourceseventname: docData?.contactsourceseventname ?? "" ,
  contactsourcesstatusofmeeting: docData?.contactsourcesstatusofmeeting ?? "" ,
  contactsourcesstatusofmeeting: docData?.contactsourcesstatusofmeeting ?? "" ,
};*/

      // Set the document in the target collection (same doc id)
      const targetDocRef = doc(db, Databasecollection, databaseName, targetCollection, document.id);
      await setDoc(targetDocRef, updatedData, { merge: true });

      console.log(`Document ${document.id} copied successfully with uniqueid: ${uniqueid}`);
    }

    console.log("All documents copied successfully with uniqueid.");
  } catch (error) {
    console.error("Error copying collection: ", error);
  }
},
async copyCollectionWithFieldAdditionCheck(databaseName, sourceCollection, targetCollection) {
  try {
    // Fetch all documents from the source collection
    const querySnapshot = await getDocs(collection(db, Databasecollection, databaseName, sourceCollection));

    // Counter for unique IDs
    let index = 1;

    // Iterate over each document
    for (const document of querySnapshot.docs) {
      const docData = document.data(); // Get document data

      // Generate uniqueid as "L1", "L2", "L3", ...
      const uniqueid = index;
      index++; // Increment for next document

      // Reference to the target document
      const targetDocRef = doc(db, Databasecollection, databaseName, targetCollection, docData.leadid);

      // Fetch target document to check existing fields
      const targetDocSnap = await getDoc(targetDocRef);
      const targetData = targetDocSnap.exists() ? targetDocSnap.data() : {};

      // Define fields that should be added only if missing
      const fieldsToCheck = [
        "contactsourceother",
        "marketingchannelsother",
        "marketingchannels",
        "contactsourcespecialtyother",
        "ourresponse",
        "contactsourcespecialty",
        "contactsourcespecialtywebinarworkshopname",
        "contactsourceviateammembername",
        "contactsourceseventdate",
        "contactsourceseventname",
        "contactsourcesstatusofmeeting"
      ];

      // Create an object for only missing fields
      const updatedData = {};
      fieldsToCheck.forEach(field => {
        if (targetData[field] === undefined) { // Add only if missing
          updatedData[field] = docData?.[field] ?? "";
        }
      });

      // Update only if there are missing fields
      if (Object.keys(updatedData).length > 0) {
        await setDoc(targetDocRef, updatedData, { merge: true });
        console.log(`Document ${document.id} updated with missing fields.`);
      } else {
        console.log(`Document ${document.id} already has all fields, skipping update.`);
      }
    }

    console.log("All documents processed successfully.");
  } catch (error) {
    console.error("Error copying collection: ", error);
  }
},
async  copyFieldsToOtherCollection(databaseName, sourceCollection, targetCollection) {
  try {
    const sourceSnapshot = await getDocs(collection(db, Databasecollection, databaseName, sourceCollection));
    const fieldsToCheck = [
      "studentsresponse",
      "responseothers",
    ];

    let batch = writeBatch(db);
    let opCount = 0;

    const tasks = sourceSnapshot.docs.map(document => limit1(async () => {
      const docData = document.data();
      const targetRef = doc(db, Databasecollection, databaseName, targetCollection, docData.leadid);
      const targetSnap = await getDoc(targetRef);
      const targetData = targetSnap.exists() ? targetSnap.data() : {};

      const updatedData = {};
      fieldsToCheck.forEach(field => {
        if (targetData[field] === undefined) {
          if(field==="responseothers")
          {
            updatedData["studentresponseothers"] = docData?.[field] ?? "";
          }
          else
          {
             updatedData[field] = docData?.[field] ?? "";
          }

        }
      });

      if (Object.keys(updatedData).length > 0) {
        batch.set(targetRef, updatedData, { merge: true });
        opCount++;

        if (opCount === 500) {
          await batch.commit();
          batch = writeBatch(db);
          opCount = 0;
        }
      }
    }));

    await Promise.all(tasks);

    if (opCount > 0) {
      await batch.commit();
    }

    console.log("Batch update completed for all documents.");
  } catch (err) {
    console.error("Error during batched update:", err);
  }
},

async  copyLatestFieldsToOtherCollection(databaseName, sourceCollection, targetCollection) {
  try {
    //const sourceSnapshot = await getDocs(collection(db, Databasecollection, databaseName, sourceCollection));
    const sourceRef = collection(db, Databasecollection, databaseName, sourceCollection);
const q = query(sourceRef, where("studentsresponse", "!=", ""));
const sourceSnapshot = await getDocs(q);
    const fieldsToCheck = [
      "studentsresponse",
      "responseothers"
    ];

    // Group documents by leadid, keeping the one with the latest followupdate
    const grouped = new Map();

    sourceSnapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const leadid = data.leadid;
      const followupdate = data.followupdate?.toDate?.() || new Date(data.followupdate);

      if (!leadid) return;

      const existing = grouped.get(leadid);
      if (!existing || (followupdate > existing.followupdate)) {

        grouped.set(leadid, {
          docSnap,
          followupdate
        });
      }
    });

    // Convert grouped map to array for sequential processing
    const entries = Array.from(grouped.values());

    let batch = writeBatch(db);
    let opCount = 0;

    for (const entry of entries) {
      const docData = entry.docSnap.data();
      console.log("docData====>",docData)
      const targetRef = doc(db, Databasecollection, databaseName, targetCollection, docData.leadid);
      const targetSnap = await getDoc(targetRef);
      const targetData = targetSnap.exists() ? targetSnap.data() : {};

      const updatedData = {};

      fieldsToCheck.forEach(field => {
        //if (targetData[field] === undefined)
        {
         console.log("field===>",field)
          if (field === "responseothers") {
            updatedData["studentresponseothers"] = docData?.[field] ?? "";
          } else {
            console.log("field===>",field)
            updatedData[field] = docData?.[field] ?? "";
          }
        }
      });

      if (Object.keys(updatedData).length > 0) {
      console.log("updatedData===>",updatedData)
        batch.set(targetRef, updatedData, { merge: true });
        opCount++;

        // Commit batch if we hit 500 writes
        if (opCount === 500) {
          await batch.commit();
          batch = writeBatch(db); // Create a new batch
          opCount = 0;
        }
      }
    }

    // Commit remaining writes
    if (opCount > 0) {
      await batch.commit();
    }

    console.log("Batch update completed for grouped documents.");
  } catch (err) {
    console.error("Error during grouped update:", err);
  }
},
  async updateOrCreateByFieldBK(databaseName, collectionName, fieldName, operatorValue,fieldValue, data) {
    try {
      const collectionRef = collection(db,Databasecollection, databaseName, collectionName);
      const querySnapshot = await getDocs(query(collectionRef, where(fieldName, operatorValue, fieldValue)));

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnapshot) => {
          const docRef = doc(db, Databasecollection,databaseName, collectionName, docSnapshot.id);
          await setDoc(docRef, { ...data, id: docSnapshot.id }, { merge: true });
        });
        return { status: 'success', message: 'Updated Successfully' };
      } else {
        const newDocRef = await addDoc(collectionRef, {
          ...data,
          [fieldName]: fieldValue,
        });
        await setDoc(newDocRef, { id: newDocRef.id }, { merge: true });
        return { status: 'success', message: 'Created new lead successfully', docId: newDocRef.id };
      }
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  },
async  SelectWithComplexConditions(databaseName,mainCollectionName, conditionsArray, joinCollection,leftfield,rightfiled,orderByField,orderByDirection,pageSize = null ,lastDoc = null)
{
  try {
    // Step 1: Create queries for each OR clause in conditionsArray
    const queries = conditionsArray.map(orClause => {
      // Build a query for each OR clause using its AND conditions
      let orQuery = collection(db,Databasecollection, databaseName, mainCollectionName);
      orClause.forEach(andCondition => {
    	if(andCondition.condition==="contains")
    	{
    		const startPrefix = andCondition.value;
  			const endPrefix = andCondition.value + '\uf8ff';
    		 orQuery = query(orQuery, where(andCondition.name, ">=", startPrefix),where(andCondition.name, '<=', endPrefix));
    	}
    	else
    	{
    		 orQuery = query(orQuery, where(andCondition.name, andCondition.condition, andCondition.value));
    	}

      });
       if (orderByField) {
        orQuery = query(orQuery, orderBy(orderByField, orderByDirection));
      }
      if (lastDoc) {
        orQuery = query(orQuery, startAfter(lastDoc));
      }
       if (pageSize) {
        orQuery = query(orQuery, limit(pageSize));
      }
      return orQuery;
    });
    // Step 2: Execute all OR queries in parallel
    const querySnapshots = await Promise.all(queries.map(q => getDocs(q)));

    // Step 3: Collect all results from each OR query
    let finalResults = [];
    querySnapshots.forEach(snapshot => {
      snapshot.forEach(doc => {
        finalResults.push({ id: doc.id, ...doc.data() });
      });
    });

    // Step 4: Deduplicate results based on document ID
    const uniqueResults = finalResults.reduce((acc, current) => {
      if (!acc.some(doc => doc.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, []);
    let  enrichedResults = []
    // Step 5: Enrich results with profile data if available
    if(typeof joinCollection!=="undefined" && joinCollection!=="")
    {
    	 enrichedResults = await Promise.all(
      uniqueResults.map(async (result) => {
        if (result[leftfield]) {
          // Fetch profile data from the profile collection using the uid
          const joinData = await this.FetchDataFromCollection(databaseName,joinCollection, 10, rightfiled, "==", result[leftfield], null);
          // If profile data is found, attach it to the result
          if (joinData.length > 0) {
            return { ...result, joinData: joinData };
          }
        }
        return result; // Return the result even if no profile data is found
      })
    );

    }
    else
    {
    	enrichedResults = uniqueResults;
    }

  const lastVisibleDoc =
      querySnapshots.length > 0 && querySnapshots[0].docs.length > 0
        ? querySnapshots[0].docs[querySnapshots[0].docs.length - 1]
        : null;
    return {
      status: "success",
      data: enrichedResults,
      lastDoc: lastVisibleDoc, // Return the last document for the next page
    };

  } catch (error) {
    console.error("Error fetching documents: ", error);
    return { status: "fail", data: [] };
  }
},


async SelectWithComplexConditionsFF(
  databaseName,
  mainCollectionName,
  conditionsArray,
  joinCollections = [], // Array of objects { collection, leftField, rightField, conditions }
  orderByField,
  orderByDirection,
  pageSize = null,
  lastDoc = null
) {
  try {
    const queries = conditionsArray.map((andOrConditions) => {
      let queryRef = collection(db,Databasecollection, databaseName, mainCollectionName);

      andOrConditions.forEach((condition) => {
        if (condition.condition === "contains") {
          const startPrefix = condition.value;
          const endPrefix = condition.value + "\uf8ff";
          queryRef = query(queryRef, where(condition.name, ">=", startPrefix), where(condition.name, "<=", endPrefix));
        } else {
          queryRef = query(queryRef, where(condition.name, condition.condition, condition.value));
        }
      });

      if (orderByField) queryRef = query(queryRef, orderBy(orderByField, orderByDirection));
      if (lastDoc) queryRef = query(queryRef, startAfter(lastDoc));
      if (pageSize) queryRef = query(queryRef, limit(pageSize));

      return queryRef;
    });
    const TotalRecords={"leads":0,"services":0,"followups":0,'finalresult':0};

    const querySnapshots = await Promise.all(queries.map((q) => getDocs(q)));
    let  totalDocs = querySnapshots[0].size;
    TotalRecords["leads"]=totalDocs;
    let finalResults = {};
    let finalResultsFinal = {};
    let ConditionIn = {"services":[],"followups":[]};
    querySnapshots.forEach((snapshot) => {
      snapshot.forEach((doc) => {
        finalResults[doc.id] = doc.data();
        ConditionIn['services'].push(doc.id);
        ConditionIn['followups'].push(doc.id);
      });
    });

    if (joinCollections.length > 0) {
      for (const join of joinCollections) {
        let relatedIds = ConditionIn[join.collection];
        let relatedResults = {};
        while (relatedIds.length > 0) {
          const batch = relatedIds.splice(0, 30);
          let queryConstraints = [where(join.leftField, "in", batch)];
          for (const condition of join.conditions) {
            if (condition.condition === "contains") {
              const startPrefix = condition.value;
              const endPrefix = condition.value + "\uf8ff";
              queryConstraints.push(where(condition.name, ">=", startPrefix));
              queryConstraints.push(where(condition.name, "<=", endPrefix));
            } else {
              queryConstraints.push(where(condition.name, condition.condition, condition.value));
            }
          }
          let queryRef = query(collection(db, Databasecollection, databaseName, join.collection), ...queryConstraints);

          const joinSnapshot = await getDocs(queryRef);
           TotalRecords[join.collection]=TotalRecords[join.collection]+joinSnapshot.size;
           totalDocs = joinSnapshot.size;
          joinSnapshot.forEach((doc) => {
            relatedResults[doc.id] = doc.data();

            if(join.collection==="services")
            {
              if (!finalResults[doc.data()[join.rightField]][join.collection+'_Table'])
              {
                finalResults[doc.data()[join.rightField]][join.collection+'_Table'] =[];
              }

              finalResults[doc.data()[join.rightField]][join.collection+'_Table'][doc.id] = doc.data();
              finalResultsFinal[doc.data()[join.rightField]]=finalResults[doc.data()[join.rightField]];
            }
            else
            {
              if (!finalResults[doc.data()[join.rightField]][join.collection+'_Table'])
              {
                finalResults[doc.data()[join.rightField]][join.collection+'_Table'] =[];
              }

              finalResults[doc.data()[join.rightField]][join.collection+'_Table'][doc.id] = doc.data();

            }


          });
        }
      }
    }
      TotalRecords['finalresult']= Object.values(finalResultsFinal).length
    return { status: "success", data: finalResultsFinal, lastDoc: querySnapshots[0]?.docs?.slice(-1)[0] || null ,TotalRecords};
  } catch (error) {
    console.error("Error fetching documents: ", error);
    return { status: "fail", data: [] };
  }
},
async SelectSuperComplexConditions(
  databaseName,
  mainCollectionName,
  conditionsArray,
  joinCollections = [], // Array of objects { collection, leftField, rightField, conditions }
  orderByField,
  orderByDirection,
  pageSize = null,
  lastDoc = null
)
{
  try {
    const queries = conditionsArray.map((andOrConditions) => {
      let queryRef = collection(db,Databasecollection, databaseName, mainCollectionName);

      andOrConditions.forEach((condition) => {
        if (condition.condition === "contains") {
          const startPrefix = condition.value;
          const endPrefix = condition.value + "\uf8ff";
          queryRef = query(queryRef, where(condition.name, ">=", startPrefix), where(condition.name, "<=", endPrefix));
        } else {
          queryRef = query(queryRef, where(condition.name, condition.condition, condition.value));
        }
      });

      if (orderByField) queryRef = query(queryRef, orderBy(orderByField, orderByDirection));
      if (lastDoc) queryRef = query(queryRef, startAfter(lastDoc));
      if (pageSize) queryRef = query(queryRef, limit(pageSize));

      return queryRef;
    });
    const TotalRecords={"leads":0,"services":0,"followups":0,'finalresult':0};

    const querySnapshots = await Promise.all(queries.map((q) => getDocs(q)));
    let  totalDocs = querySnapshots[0].size;
    TotalRecords["leads"]=totalDocs;
    let finalResults = {};
    let finalResultsFinal = {};
    let ConditionIn = {"services":[],"followups":[]};
    querySnapshots.forEach((snapshot) => {
      snapshot.forEach((doc) => {
        finalResults[doc.id] = doc.data();
        ConditionIn['services'].push(doc.id);
        ConditionIn['followups'].push(doc.id);
      });
    });

    if (joinCollections.length > 0) {
      for (const join of joinCollections) {
        let relatedIds = ConditionIn[join.collection];
        let relatedResults = {};
        while (relatedIds.length > 0) {
          const batch = relatedIds.splice(0, 30);
          let queryConstraints = [where(join.leftField, "in", batch)];
          for (const condition of join.conditions) {
            if (condition.condition === "contains") {
              const startPrefix = condition.value;
              const endPrefix = condition.value + "\uf8ff";
              queryConstraints.push(where(condition.name, ">=", startPrefix));
              queryConstraints.push(where(condition.name, "<=", endPrefix));
            } else {
              queryConstraints.push(where(condition.name, condition.condition, condition.value));
            }
          }
          if (typeof join?.sortBy!="undefined")
          {
            if (join?.sortBy!="")
            {
              queryConstraints.push(orderBy(join.sortBy, join.sortDir));
            }
          }
          let queryRef = query(collection(db, Databasecollection, databaseName, join.collection), ...queryConstraints);

          const joinSnapshot = await getDocs(queryRef);
           TotalRecords[join.collection]=TotalRecords[join.collection]+joinSnapshot.size;
           totalDocs = joinSnapshot.size;
          joinSnapshot.forEach((doc) => {
            relatedResults[doc.id] = doc.data();

            if(join.collection==="services")
            {
              if (!finalResults[doc.data()[join.rightField]][join.collection+"_"+"Table"])
              {
                finalResults[doc.data()[join.rightField]][join.collection+"_"+"Table"] =[];
              }

              finalResults[doc.data()[join.rightField]][join.collection+"_"+"Table"][doc.id] = doc.data();
            }
            else
            {
              if (!finalResults[doc.data()[join.rightField]][join.collection+"_"+"Table"])
              {
                finalResults[doc.data()[join.rightField]][join.collection+"_"+"Table"] =[];
              }

              finalResults[doc.data()[join.rightField]][join.collection+"_"+"Table"][doc.id] = doc.data();
              finalResultsFinal[doc.data()['leadid']]=finalResults[doc.data()['leadid']];
            }



          });
        }
      }
    }
      TotalRecords['finalresult']= Object.values(finalResultsFinal).length
    return { status: "success", data: finalResultsFinal, lastDoc: querySnapshots[0]?.docs?.slice(-1)[0] || null ,TotalRecords};
  } catch (error) {
    console.error("Error fetching documents: ", error);
    return { status: "fail", data: [] };
  }
},
async batchPromises(tasks, batchSize){
  const results = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }
  return results;
},

// 🔥 Fetch all records from join collection once and apply conditions locally

evaluateCondition(value, operator, compareValue) {
  switch (operator) {
    case "==": return value === compareValue;
    case "!=": return value !== compareValue;
    case ">": return value > compareValue;
    case "<": return value < compareValue;
    case ">=": return value >= compareValue;
    case "<=": return value <= compareValue;
    default: return false;
  }
},
async getLastDocument(databaseName, collectionName, docId) {
  const docRef = doc(db, Databasecollection, databaseName, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap;
},
applyJoinConditions(records, conditions) {
  return records.filter(record =>
    conditions.every((condition) => {
      return this.evaluateCondition(record[condition.name], condition.condition, condition.value);
    })
  );
},
async fetchJoinDataOptimized(databaseName, collectionName, leftField, mainDocIds, conditions, hasConditions) {
  if (mainDocIds.length === 0) return [];

  const results = [];
  const batchSize = 10; // Firestore IN query limit

  // Split into batches for IN query
  for (let i = 0; i < mainDocIds.length; i += batchSize) {
    const batchIds = mainDocIds.slice(i, i + batchSize);

    let queryRef = collection(db, Databasecollection, databaseName, collectionName);

    // Use IN query to fetch only related documents
    queryRef = query(queryRef, where(leftField, 'in', batchIds));

    // Apply join conditions at query level if possible (for simple equality)
    const simpleConditions = conditions.filter(cond =>
      cond.condition === '==' && typeof cond.value !== 'object'
    );

    simpleConditions.forEach(condition => {
      queryRef = query(queryRef, where(condition.name, condition.condition, condition.value));
    });

    const querySnapshot = await getDocs(queryRef);
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
  }

  // Apply complex conditions locally
  if (hasConditions) {
    const complexConditions = conditions.filter(cond =>
      cond.condition !== '==' || typeof cond.value === 'object'
    );

    if (complexConditions.length > 0) {
      return results.filter(record =>
        complexConditions.every((condition) => {
          return this.evaluateCondition(record[condition.name], condition.condition, condition.value);
        })
      );
    }
  }

  return results;
},
async fetchDocumentsByIds(databaseName, collectionName, docIds) {
  if (docIds.length === 0) return [];

  const batches = [];
  const batchSize = 10; // Firestore limit for IN queries

  for (let i = 0; i < docIds.length; i += batchSize) {
    const batchIds = docIds.slice(i, i + batchSize);
    const queryRef = collection(db, Databasecollection, databaseName, collectionName);
    const q = query(queryRef, where(documentId(), 'in', batchIds));
    batches.push(getDocs(q));
  }

  const results = await Promise.all(batches);
  const docs = [];

  results.forEach(snapshot => {
    snapshot.forEach(doc => {
      docs.push(doc);
    });
  });

  return docs;
},
async fetchMainCollectionIds(
  databaseName,
  mainCollectionName,
  conditionsArray,
  orderByField,
  orderByDirection,
  pageSize,
  lastDoc
) {
  const docIds = [];

  for (const conditions of conditionsArray) {
    let queryRef = collection(db, Databasecollection, databaseName, mainCollectionName);

    // Apply conditions
    conditions.forEach((condition) => {
      queryRef = query(queryRef, where(condition.name, condition.condition, condition.value));
    });

    if (orderByField) {
      queryRef = query(queryRef, orderBy(orderByField, orderByDirection));
    }

    if (lastDoc) {
      queryRef = query(queryRef, startAfter(lastDoc));
    }

    // Select only ID field for faster query
    queryRef = query(queryRef, limit(pageSize));
    const querySnapshot = await getDocs(query(queryRef));

    querySnapshot.forEach((doc) => {
      docIds.push(doc.id);
    });
  }

  return [...new Set(docIds)]; // Remove duplicates
},
async fetchJoinForIds(databaseName, joinCollectionName, leftField, ids) {
  if (ids.length === 0) return {};

  // split into batches of 30 for Firestore
  const chunks = [];
  while (ids.length) chunks.push(ids.splice(0, 30));

  const result = {};

  for (const batchIds of chunks) {
    const q = query(
      collection(db, Databasecollection, databaseName, joinCollectionName),
      where(leftField, "in", batchIds)
    );

    const snap = await getDocs(q);
    snap.forEach(doc => {
      result[doc.id] = doc.data();
    });
  }

  return result;
},
 async fetchAllJoinData(databaseName, joinCollectionName) {
  let joinData = {};
  const joinQuery = query(collection(db, Databasecollection, databaseName, joinCollectionName));
  const snapshot = await getDocs(joinQuery);
  snapshot.forEach((doc) => {
    joinData[doc.id] = doc.data();
  });
  return joinData;
},
// ⚡️ Main Function
async SelectSuperComplexConditionsForView(
  databaseName,
  mainCollectionName,
  conditionsArray,
  joinCollections = [],
  orderByField,
  orderByDirection,
  pageSize = 10,
  lastDoc = null
) {
  try {

    const TotalRecords = {};
    let finalResults = {};

    // STEP 1 — Build queries & fetch main docs
    const queries = conditionsArray.map(conditions => {
      let ref = collection(db, Databasecollection, databaseName, mainCollectionName);

      conditions.forEach(c => {
        ref = query(ref, where(c.name, c.condition, c.value));
      });

      if (orderByField) ref = query(ref, orderBy(orderByField, orderByDirection));
      if (lastDoc) ref = query(ref, startAfter(lastDoc));
      ref = query(ref, limit(pageSize));

      return getDocs(ref);
    });

    // Execute all in parallel
    const snapshots = await Promise.all(queries);
    snapshots.forEach(snap =>
      snap.forEach(doc => (finalResults[doc.id] = doc.data()))
    );

    TotalRecords["main"] = Object.keys(finalResults).length;

    // Pagination support
    const lastVisible = snapshots[0]?.docs?.slice(-1)[0] || null;

    // STEP 2 — JOIN OPTIMIZATION
    const mainIds = Object.keys(finalResults);

    for (const join of joinCollections) {

      // Fetch only related join rows
      const joinData = await this.fetchJoinForIds(
        databaseName,
        join.collection,
        join.leftField,
        [...mainIds]
      );

      TotalRecords[join.collection] = Object.keys(joinData).length;

      // attach join rows
      Object.entries(joinData).forEach(([id, row]) => {
        const parentId = row[join.leftField];

        if (!finalResults[parentId]) return;

        if (!finalResults[parentId][join.collection]) {
          finalResults[parentId][join.collection+"_Table"] = {};
        }

        finalResults[parentId][join.collection+"_Table"][id] = row;
      });

      // STEP 3 — Apply join conditions locally
      if (join.conditions.length > 0) {
        finalResults = Object.fromEntries(
          Object.entries(finalResults).filter(([id, record]) => {
            const items = record[join.collection+"_Table"];
            if (!items) return false;

            return Object.values(items).some(item =>
              join.conditions.every(cond => {
                switch (cond.condition) {
                  case "==": return item[cond.name] === cond.value;
                  case "!=": return item[cond.name] !== cond.value;
                  case ">": return item[cond.name] > cond.value;
                  case "<": return item[cond.name] < cond.value;
                  case ">=": return item[cond.name] >= cond.value;
                  case "<=": return item[cond.name] <= cond.value;
                  default: return false;
                }
              })
            );
          })
        );
      }
    }

    TotalRecords["finalresult"] = Object.keys(finalResults).length;

    return {
      status: "success",
      data: finalResults,
      lastDoc: lastVisible,
      TotalRecords
    };

  } catch (e) {
    console.error("Error:", e);
    return { status: "fail", error: e.message, data: [] };
  }
},
/*async SelectSuperComplexConditionsForView(
  databaseName,
  mainCollectionName,
  conditionsArray,
  joinCollections = [],
  orderByField,
  orderByDirection,
  pageSize = 10,
  lastDoc = null
) {
  try {
    const TotalRecords = { leads: 0, services: 0, followups: 0, finalresult: 0 };
    let finalResults = {};
    let SuperfinalResults = {};
    let SuperSuperfinalResults = {};

    // 🟢 Step 1: Build Main Collection Queries
    const queries = conditionsArray.map((conditions) => {
      let queryRef = collection(db, Databasecollection, databaseName, mainCollectionName);
      conditions.forEach((condition) => {
        queryRef = query(queryRef, where(condition.name, condition.condition, condition.value));
      });

      if (orderByField) queryRef = query(queryRef, orderBy(orderByField, orderByDirection));
      if (lastDoc) queryRef = query(queryRef, startAfter(lastDoc)); // Pagination
      if (pageSize) queryRef = query(queryRef, limit(pageSize)); // Limit records

      return getDocs(queryRef);
    });

    // 🔥 Step 2: Fetch Main Collection with Batch Processing
    const querySnapshots = await this.batchPromises(queries, 5); // Limit 5 concurrent requests
    querySnapshots.forEach((snapshot) => {
      snapshot.forEach((doc) => {
        finalResults[doc.id] = doc.data();
        SuperfinalResults[doc.id] = doc.data();
      });
    });

    // 🔥 Pagination: Get Last Document for Next Page
    const lastVisible = querySnapshots[0]?.docs?.slice(-1)[0] || null;
    TotalRecords["leads"] = Object.keys(finalResults).length;

    // 🟢 Step 3: Fetch Join Collections Data Once and Filter Locally
    for (const join of joinCollections) {
      const joinData = await this.fetchAllJoinData(databaseName, join.collection); // Fetch all join data once

      Object.keys(finalResults).forEach((docId) => {
        const relatedRecords = Object.values(joinData).filter((record) => record[join.leftField] === docId);

        if (relatedRecords.length > 0) {
          finalResults[docId][join.collection + "_Table"] = relatedRecords.reduce((acc, record) => {
            acc[record.id] = record;
            return acc;
          }, {});
        }

        // Apply conditions locally
        if (join.collection === "services") {
          const filteredRecords = relatedRecords.filter((record) =>
            join.conditions.every((condition) => {
              if (condition.condition === "==") {
                return record[condition.name] === condition.value;
              } else if (condition.condition === "!=") {
                return record[condition.name] !== condition.value;
              } else if (condition.condition === ">") {
                return record[condition.name] > condition.value;
              } else if (condition.condition === "<") {
                return record[condition.name] < condition.value;
              } else if (condition.condition === ">=") {
                return record[condition.name] >= condition.value;
              } else if (condition.condition === "<=") {
                return record[condition.name] <= condition.value;
              }
              return false;
            })
          );

          if (filteredRecords.length > 0) {
            SuperfinalResults[docId] = finalResults[docId];
            SuperSuperfinalResults[docId] = finalResults[docId];
          }
        }
      });

      TotalRecords[join.collection] = Object.values(joinData).length;
    }

    // 🟢 Step 4: Determine Final Results
    let sendResultOut = SuperSuperfinalResults;
    for (const join of joinCollections) {
      if (join.collection === "services" && join.conditions.length <= 0) {
        sendResultOut = SuperfinalResults;
      }
    }

    TotalRecords["finalresult"] = Object.keys(sendResultOut).length;

    // 🟢 Step 5: Return Results with Pagination Info
    return {
      status: "success",
      data: sendResultOut,
      lastDoc: lastVisible, // For Pagination
      TotalRecords,
    };
  } catch (error) {
    console.error("Error fetching documents: ", error);
    return { status: "fail", data: [], error: error.message };
  }
},*/
async  SelectSuperComplexConditionsForViewOptimized (
  databaseName,
  collectionName,
  conditionsArray = [[]],
  JoinFullArray = [],
  orderField = "createTime",
  orderDir = "desc",
  limitCount = 100,
  startAfterDoc = null
) {
  try {
    // Normalize conditions: pick first condition-group as primary AND group (your current pattern)
    const primaryGroup = Array.isArray(conditionsArray) && conditionsArray.length ? conditionsArray[0] : [];

    // Build Firestore query
    const colRef = collection(db, databaseName, collectionName);
    let q = null;

    // Compose where clauses
    const whereClauses = [];
    primaryGroup.forEach((cond) => {
      // cond: { name, condition, value } where condition is one of ==, >=, <=, >, <, in, array-contains
      // We convert to modular `where`
      // push as tuple for building query below
      whereClauses.push(cond);
    });

    // Build query stepwise
    const queryParts = [colRef];
    // Add where clauses
    whereClauses.forEach((c) => {
      queryParts.push(where(c.name, c.condition, c.value));
    });

    // Add ordering and pagination
    if (orderField) {
      queryParts.push(orderBy(orderField, orderDir));
    }
    if (limitCount && limitCount > 0) {
      queryParts.push(fsLimit(limitCount));
    }
    if (startAfterDoc) {
      // startAfterDoc expected to be a DocumentSnapshot (the lastDoc returned previously)
      queryParts.push(fsStartAfter(startAfterDoc));
    }

    q = query(...queryParts);

    // Execute main query: leads (paged)
    const qs = await getDocs(q);

    const docs = [];
    qs.forEach((d) => {
      docs.push({ id: d.id, ...d.data(), __docSnapshot: d }); // keep snapshot for pagination
    });

    // Collect ids for joins
    const leadIds = docs.map((d) => d.id).filter(Boolean);

    // Prepare return data map keyed by lead id
    const dataMap = {};
    docs.forEach((d) => {
      dataMap[d.id] = { ...d };
      // remove snapshot before final return (keep only for lastDoc)
      delete dataMap[d.id].__docSnapshot;
    });

    // If no join requested or no lead ids, return early
    if (JoinFullArray && JoinFullArray.length && leadIds.length) {
      // For each join collection, fetch rows where rightField IN leadIds (batching by 10)
      const joinPromises = JoinFullArray.map(async (joinDef) => {
        const { collection: joinCollection, rightField, conditions = [] } = joinDef;
        // Build batches of up to 10 ids per Firestore whereIn limitation
        const chunks = [];
        const chunkSize = 10;
        for (let i = 0; i < leadIds.length; i += chunkSize) {
          chunks.push(leadIds.slice(i, i + chunkSize));
        }

        const joinedDocs = [];
        for (const chunk of chunks) {
          // Build query for joinCollection
          const jColRef = collection(db, databaseName, joinCollection);
          const jQueryParts = [jColRef, where(rightField, "in", chunk)];
          // apply any additional conditions in joinDef.conditions
          conditions.forEach((c) => {
            jQueryParts.push(where(c.name, c.condition, c.value));
          });
          // limit not necessary for joins; retrieve all for these leads
          const jq = query(...jQueryParts);
          const jqs = await getDocs(jq);
          jqs.forEach((jd) => joinedDocs.push({ id: jd.id, ...jd.data() }));
        }

        // Attach joinedDocs to dataMap keyed by rightField value
        // We expect each joinedDoc has rightField equal to a lead id (string)
        joinedDocs.forEach((jd) => {
          const leadIdValue = jd[rightField];
          if (!leadIdValue) return;
          // initialize slot
          if (!dataMap[leadIdValue]) {
            // lead not in page (rare), skip
            return;
          }

          // Build property name for joined table storage: e.g. services -> services_Table
          const propName = `${joinCollection}_Table`;
          if (!dataMap[leadIdValue][propName]) {
            dataMap[leadIdValue][propName] = {};
          }
          dataMap[leadIdValue][propName][jd.id] = jd;
        });

        return true;
      });

      await Promise.all(joinPromises);
    }

    // lastDoc for pagination = last snapshot
    const lastDoc = docs.length ? docs[docs.length - 1].__docSnapshot : null;

    // totalRecordsEstimate cannot be cheaply computed without another count query; we return docs.length as page count and let caller handle totals
    return {
      status: "success",
      data: dataMap,
      lastDoc,
      totalRecordsEstimate: docs.length,
    };
  } catch (error) {
    console.error("SelectSuperComplexConditionsForViewOptimized error:", error);
    return {
      status: "error",
      message: error.message || error.toString(),
    };
  }
},
async TimestampFromDate(d){
  if (!d) return null;
  return Timestamp.fromDate(d);
},
async SelectSuperComplexConditionsForViewbk(
  databaseName,
  mainCollectionName,
  conditionsArray,
  joinCollections = [], // Array of objects { collection, leftField, rightField, conditions }
  orderByField,
  orderByDirection,
  pageSize = null,
  lastDoc = null
)
{
  try {
    const queries = conditionsArray.map((andOrConditions) => {
      let queryRef = collection(db,Databasecollection, databaseName, mainCollectionName);

      andOrConditions.forEach((condition) => {
        if (condition.condition === "contains") {
          const startPrefix = condition.value;
          const endPrefix = condition.value + "\uf8ff";
          queryRef = query(queryRef, where(condition.name, ">=", startPrefix), where(condition.name, "<=", endPrefix));
        } else {
          queryRef = query(queryRef, where(condition.name, condition.condition, condition.value));
        }
      });

      if (orderByField) queryRef = query(queryRef, orderBy(orderByField, orderByDirection));
      if (lastDoc) queryRef = query(queryRef, startAfter(lastDoc));
      if (pageSize) queryRef = query(queryRef, limit(pageSize));

      return queryRef;
    });
    const TotalRecords={"leads":0,"services":0,"followups":0,'finalresult':0};

    const querySnapshots = await Promise.all(queries.map((q) => getDocs(q)));
    let  totalDocs = querySnapshots[0].size;
    TotalRecords["leads"]=totalDocs;
    let finalResults = {};
    let finalResultsFinal = {};
    let ConditionIn = {"services":[],"followups":[]};
    querySnapshots.forEach((snapshot) => {
      snapshot.forEach((doc) => {
        finalResults[doc.id] = doc.data();
        ConditionIn['services'].push(doc.id);
        ConditionIn['followups'].push(doc.id);
      });
    });

    if (joinCollections.length > 0) {
      for (const join of joinCollections) {
        let relatedIds = ConditionIn[join.collection];
        let relatedResults = {};
        while (relatedIds.length > 0) {
          const batch = relatedIds.splice(0, 30);
          let queryConstraints = [where(join.leftField, "in", batch)];
          for (const condition of join.conditions) {
            if (condition.condition === "contains") {
              const startPrefix = condition.value;
              const endPrefix = condition.value + "\uf8ff";
              queryConstraints.push(where(condition.name, ">=", startPrefix));
              queryConstraints.push(where(condition.name, "<=", endPrefix));
            } else {
              queryConstraints.push(where(condition.name, condition.condition, condition.value));
            }
          }
          if (typeof join?.sortBy!="undefined")
          {
            if (join?.sortBy!="")
            {
              queryConstraints.push(orderBy(join.sortBy, join.sortDir));
            }
          }
          let queryRef = query(collection(db, Databasecollection, databaseName, join.collection), ...queryConstraints);

          const joinSnapshot = await getDocs(queryRef);
           TotalRecords[join.collection]=TotalRecords[join.collection]+joinSnapshot.size;
           totalDocs = joinSnapshot.size;
          joinSnapshot.forEach((doc) => {
            relatedResults[doc.id] = doc.data();

            if(join.collection==="services")
            {
              if (!finalResults[doc.data()[join.rightField]][join.collection+"_"+"Table"])
              {
                finalResults[doc.data()[join.rightField]][join.collection+"_"+"Table"] =[];
              }

              finalResults[doc.data()[join.rightField]][join.collection+"_"+"Table"][doc.id] = doc.data();
            }
            else
            {
              if (!finalResults[doc.data()[join.rightField]][join.collection+"_"+"Table"])
              {
                finalResults[doc.data()[join.rightField]][join.collection+"_"+"Table"] =[];
              }

              finalResults[doc.data()[join.rightField]][join.collection+"_"+"Table"][doc.id] = doc.data();
              //finalResultsFinal[doc.data()['leadid']]=finalResults[doc.data()['leadid']];
            }



          });
        }
      }
    }
      TotalRecords['finalresult']= Object.values(finalResultsFinal).length? Object.values(finalResultsFinal).length :Object.values(finalResults).length
    return { status: "success", data: Object.values(finalResultsFinal).length?finalResultsFinal:finalResults, lastDoc: querySnapshots[0]?.docs?.slice(-1)[0] || null ,TotalRecords};
  } catch (error) {
    console.error("Error fetching documents: ", error);
    return { status: "fail", data: [] };
  }
},
async SelectWithComplexConditionsF(
  databaseName,
  mainCollectionName,
  conditionsArray,
  joinCollections = [], // Array of objects { collection, leftField, rightField, conditions }
  orderByField,
  orderByDirection,
  pageSize = null,
  lastDoc = null
) {
  try {
    // Step 1: Create queries for each OR clause in conditionsArray



    let  queries = conditionsArray.map((andOrConditions) => {
      let queryRef = collection(db,Databasecollection, databaseName, mainCollectionName);

      andOrConditions.forEach((condition) => {
        if (condition.condition === "contains") {
          const startPrefix = condition.value;
          const endPrefix = condition.value + "\uf8ff";
          queryRef = query(
            queryRef,
            where(condition.name, ">=", startPrefix),
            where(condition.name, "<=", endPrefix)
          );
        } else {
          queryRef = query(queryRef, where(condition.name, condition.condition, condition.value));
        }
      });

      if (orderByField) {
        queryRef = query(queryRef, orderBy(orderByField, orderByDirection));
      }
      if (lastDoc) {
        queryRef = query(queryRef, startAfter(lastDoc));
      }
      if (pageSize) {
        queryRef = query(queryRef, limit(pageSize));
      }
      return queryRef;
    });

    if(queries[0]?._query?.filters?.length)
    {
      console.log("Filters Applied====>", queries[0]?._query?.filters?.length);
    }
    console.log("queries====>", queries);

    // Step 2: Execute all OR queries in parallel
     let querySnapshots = await Promise.all(queries.map((q) => getDocs(q)));
       const lastVisibleDoc =
      querySnapshots.length > 0 && querySnapshots[0].docs.length > 0
        ? querySnapshots[0].docs[querySnapshots[0].docs.length - 1]
        : null;
    // Step 3: Collect all results from each OR query
    let finalResults = [];
    let leadIds = [];
    let serviceid = [];
    querySnapshots.forEach((snapshot) => {
      snapshot.forEach((doc) => {
        finalResults[doc.id]=doc.data();
        leadIds.push(doc.id)
        if(leadIds.length===30)
        {}

      });
    });


        let loopService=1;
       queries = joinCollections[0].conditions.map((andOrConditions) => {
        let queryRef = collection(db,Databasecollection, databaseName, joinCollections[0].collection);
        console.log("First In---")
         if(loopService===1)
        {
        queryRef = query(
            queryRef,
            where('leadid', "in", leadIds)
          );
          loopService++;
      }
       if (typeof joinCollections[0]?.sortBy!="undefined")
       {
          if (joinCollections[0]?.sortBy!="")
          {
            queryRef = query(queryRef, orderBy(joinCollections[0]?.sortBy, joinCollections[0]?.sortDir));
          }
        }
      andOrConditions.forEach((condition) => {
      console.log("Second In---")
        if (condition.condition === "contains") {
          const startPrefix = condition.value;
          const endPrefix = condition.value + "\uf8ff";
          queryRef = query(
            queryRef,
            where(condition.name, ">=", startPrefix),
            where(condition.name, "<=", endPrefix)
          );
        } else {
          queryRef = query(queryRef, where(condition.name, condition.condition, condition.value));
        }
      });

      return queryRef;
    });
    // Step 4: Deduplicate results based on document ID
     querySnapshots = await Promise.all(queries.map((q) => getDocs(q)));
     querySnapshots.forEach((snapshot) => {
      snapshot.forEach((doc) => {
        console.log("doc.data()--->",doc.data())
        if(typeof finalResults[doc.data().leadid]['services']==="undefined")
        {
          finalResults[doc.data().leadid]['services']=[]
        }
        finalResults[doc.data().leadid]['services'][doc.id]=doc.data();
        serviceid.push(doc.id)
      });
    });
      let loopFollowups=1;
           queries = joinCollections[1].conditions.map((andOrConditions) => {
        let queryRef = collection(db,Databasecollection, databaseName, joinCollections[1].collection);
         if(loopFollowups===1)
        {
        queryRef = query(
            queryRef,
            where('serviceid', "in", serviceid)
          );
          loopFollowups++;
      }
      if (typeof joinCollections[1]?.sortBy!="undefined")
       {
          if (joinCollections[1]?.sortBy!="")
          {
            queryRef = query(queryRef, orderBy(joinCollections[1]?.sortBy, joinCollections[1]?.sortDir));
          }
        }
      andOrConditions.forEach((condition) => {
        if (condition.condition === "contains") {
          const startPrefix = condition.value;
          const endPrefix = condition.value + "\uf8ff";
          queryRef = query(
            queryRef,
            where(condition.name, ">=", startPrefix),
            where(condition.name, "<=", endPrefix)
          );
        } else {
          queryRef = query(queryRef, where(condition.name, condition.condition, condition.value));
        }
      });
      return queryRef;
    });
    // Step 4: Deduplicate results based on document ID
     querySnapshots = await Promise.all(queries.map((q) => getDocs(q)));
     querySnapshots.forEach((snapshot) => {
      snapshot.forEach((doc) => {
        if(typeof finalResults[doc.data().leadid]['services'][doc.data().serviceid]!=="undefined")
        {
          finalResults[doc.data().leadid]['services'][doc.data().serviceid]=doc.data();
        }
      });
    });






    return {
      status: "success",
      data: finalResults,
      lastDoc: lastVisibleDoc,
    };
  } catch (error) {
    console.error("Error fetching documents: ", error);
    return { status: "fail", data: [] };
  }
},
async  getTotalDocs(databaseName, mainCollectionName) {
  try {
    // Reference to the collection
    const collectionRef = collection(db,Databasecollection, databaseName, mainCollectionName);

    // Get all documents in the collection
    const querySnapshot = await getDocs(collectionRef);

    // Get the total count of documents
    const totalDocs = querySnapshot.size;

    return totalDocs; // Return the total document count
  } catch (error) {
    console.error("Error fetching total documents: ", error);
    return 0; // Return 0 in case of an error
  }
},
async deleteDocumentsByConditions(databaseName, collectionName, conditionsArray) {
  let resultsRet = { status: "error", message: "" };
  try {
    const collectionRef = collection(db, Databasecollection, databaseName, collectionName);
    const batch = writeBatch(db);

    for (const conditions of conditionsArray) {
      // Start with the base query for the collection
      let dynamicQuery = query(collectionRef);

      // Apply all conditions from the current sub-array
      for (const condition of conditions) {

        dynamicQuery = query(
          dynamicQuery,
          where(condition.name, condition.condition, condition.value)
        );
      }

      // Fetch documents matching the query
      const querySnapshot = await getDocs(dynamicQuery);

      // Queue deletion for each matched document in the batch
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
    }

    // Commit the batch
    await batch.commit();

    resultsRet['status'] = "success";
    resultsRet['message'] = "All Matching Documents Have Been Deleted.";
    console.log("All matching documents have been deleted.");
  } catch (error) {
    console.error("Error deleting documents:", error);
    resultsRet['status'] = "error";
    resultsRet['message'] = error;
  }
  return resultsRet;
},
  // Delete document by ID
  async deleteDocumentById(databaseName, collectionName, documentId) {
    const docRef = doc(db, Databasecollection,databaseName, collectionName, documentId);
    await deleteDoc(docRef);
  },
async deleteUser(databaseName, collectionName,emailid) {
  // Reference your collection (replace 'your-collection-name' with your actual collection name)
  const collectionRef = collection(db, Databasecollection,databaseName, collectionName);

  // Create a query to select documents where email equals "xyz"
  const q = query(collectionRef, where("email", "==", emailid));

  try {
    // Execute the query
    const querySnapshot = await getDocs(q);

    // Loop through the results
    querySnapshot.forEach(async (docSnapshot) => {
      const documentId = docSnapshot.id;

      // Check if the document ID is not "abc"
     // if (documentId !== userid)
      {
        try {
          // Delete the document
         // await deleteDoc(doc(db, Databasecollection,databaseName, collectionName, documentId));

        } catch (deleteError) {
          console.error("Error deleting document:", deleteError);
        }
      }
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
  }
},
  // Fetch data from specific collection (paginated and with filtering options)
  async FetchDataFromCollection(databaseName, collectionName, pageSize, filterField, filterCondition, filterValue)
  {
    try {
      const collectionRef = collection(db, Databasecollection,databaseName, collectionName);
      const queryConstraints = [limit(pageSize)];

      if (filterField && (filterValue || filterValue === "")) {
        queryConstraints.push(where(filterField, filterCondition, filterValue));
      }

      const q = query(collectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);

      const mainCollectionData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        documentid: doc.id,
        ...doc.data(),
      }));

      return mainCollectionData;
    } catch (error) {
      console.error('Error fetching data: ', error);
      throw error;
    }
  },

  // Fetch data with filtering and pagination
  async fetchData(databaseName, collectionName, pageSize, filterField, filterCondition, filterValue,orderByField, orderByDirection = "asc") {
    try {
    const collectionRef = collection(db, Databasecollection,databaseName, collectionName);
    const queryConstraints = [limit(pageSize)];

    if (filterField && filterValue) {
    console.log("filterField---->")
      queryConstraints.push(where(filterField, filterCondition, filterValue));
    }
    if (orderByField) {
     console.log("orderByField---->")
      queryConstraints.push(orderBy(orderByField, orderByDirection));
    }
     console.log("queryConstraints---->",queryConstraints)
    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    	return { status: "success", data: data };
    } catch (error) {
    console.error("Error fetching documents: ", error);
    return { status: "fail", data: [] };
  }
  },
};

export default firestoreQueries;
