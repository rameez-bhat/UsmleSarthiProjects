// src/firestore.js
import { updateDoc,writeBatch,doc,arrayRemove,setDoc,collection, getDocs,addDoc, query, where, startAfter,orderBy, limit ,deleteDoc,getDoc,Timestamp,deleteField} from 'firebase/firestore';
import { db } from './firebase';
const LastData=[];
const handleUpdateOrCreateByField = async (CollectionName, fieldName, fieldValue, data) => {
  try {
    // Step 1: Query Firestore to find the document with the matching field
    const querySnapshot = await getDocs(
      query(collection(db, CollectionName), where(fieldName, "==", fieldValue))
    );

    if (!querySnapshot.empty) {
      // Step 2: If document(s) found, update them
      querySnapshot.forEach(async (docSnapshot) => {
        const docRef = doc(db, CollectionName, docSnapshot.id);
        //await setDoc(docRef, data, { merge: true });
         await setDoc(docRef, {...data,id: docSnapshot.id }, { merge: true });
      });

      return {
        status: 'success',
        message: 'Updated Successfully'
      };
    } else {
      const dataToSave = { ...data }; // Clone the data object

      // Conditionally set the queried field and value
      if (!(fieldName in data)) {
        dataToSave[fieldName] = fieldValue;
      }
      const newDocRef = await addDoc(collection(db, CollectionName), dataToSave);

	await setDoc(newDocRef, { id: newDocRef.id }, { merge: true });
      return {
        status: 'success',
        message: 'Created new document successfully',
        docId: newDocRef.id,
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
};
const handleUpdateOrCreateByConditions = async (collectionName,conditions,data) => {
  try {
    // ✅ Normalize to array
    const whereConditions = Array.isArray(conditions)
      ? conditions
      : [conditions];

    // ✅ Build Firestore query dynamically
    const whereClauses = whereConditions.map(c =>
      where(c.field, c.operator || "==", c.value)
    );

    const q = query(collection(db, collectionName), ...whereClauses);
    const querySnapshot = await getDocs(q);

    // ✅ UPDATE
    if (!querySnapshot.empty) {
      const updatePromises = [];

      querySnapshot.forEach(docSnapshot => {
        const docRef = doc(db, collectionName, docSnapshot.id);

        updatePromises.push(
          setDoc(
            docRef,
            { ...data, id: docSnapshot.id },
            { merge: true }
          )
        );
      });

      await Promise.all(updatePromises);

      return {
        status: "success",
        message: "Updated Successfully",
        updatedCount: querySnapshot.size
      };
    }

    // ✅ CREATE
    const dataToSave = { ...data };

    // Auto add missing where fields into document
    whereConditions.forEach(c => {
      if (!(c.field in dataToSave)) {
        dataToSave[c.field] = c.value;
      }
    });

    const newDocRef = await addDoc(
      collection(db, collectionName),
      dataToSave
    );

    await setDoc(
      newDocRef,
      { id: newDocRef.id },
      { merge: true }
    );

    return {
      status: "success",
      message: "Created new document successfully",
      docId: newDocRef.id
    };

  } catch (error) {
    console.error("Insert/Update Error:", error);
    return {
      status: "error",
      message: error.message
    };
  }
};
const handleUpdate = async (CollectionName,docId,data) => {
    try {
      console.log("CollectionName===>",CollectionName)
       console.log("docId===>",docId)
       console.log("data===>",data)
      //await collection(db,CollectionName).doc(docId).update(data);
       const docRef = doc(db, CollectionName, docId);
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
  };
  const updateAllHospitalProgramInfoDocs = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "HospitalProgramInfo"));

    const updatePromises = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (data.Frieda !== undefined && typeof data.Frieda !== "string") {
        // Convert Frieda to string and prepare update
        const updatedFields = {
          Frieda: String(data.Frieda),
        };

        const docRef = doc(db, "HospitalProgramInfo", docSnap.id);
        updatePromises.push(updateDoc(docRef, updatedFields));
      }
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    console.log("All applicable documents updated successfully.");
  } catch (error) {
    console.error("Error updating documents:", error);
  }
};
 /* const updateAllHospitalProgramInfoDocs = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Users"));

    const updatePromises = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      let WhatAppNumberForApi="";
      if(data?.WhatsappCountry?.phoneCode && data?.WhatsappNumber)
      {
        WhatAppNumberForApi=data?.WhatsappCountry?.phoneCode+data?.WhatsappNumber;
      }
      else if(data?.PhoneCountry?.phoneCode && data?.phoneNumber)
      {
        WhatAppNumberForApi=data?.PhoneCountry?.phoneCode+data?.phoneNumber;
      }
      const updatedFields = {
          WhatAppNumberForApi: String(WhatAppNumberForApi),
        };
      const docRef = doc(db, "Users", docSnap.id);
      updatePromises.push(updateDoc(docRef, updatedFields));
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    console.log("All applicable documents updated successfully.");
  } catch (error) {
    console.error("Error updating documents:", error);
  }
};*/
  const updateWhereFieldEquals = async (CollectionName, fieldName, fieldCondition,fieldValue, newData) => {
  try {
    const q = query(collection(db, CollectionName), where(fieldName, fieldCondition, fieldValue));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { status: "error", message: "No matching document found." };
    }

    // Loop through all matching docs (can limit to first match if needed)
    for (const docSnap of querySnapshot.docs) {
      const docRef = doc(db, CollectionName, docSnap.id);
      await setDoc(docRef, newData, { merge: true });
    }

    return { status: "success", message: "Updated successfully." };
  } catch (error) {
    return { status: "error", message: error.message || error };
  }
};
  const handleAdd = async (CollectionName, data, docId = null) => {
  try {
    let docRef;

    if (docId) {
      docRef1 = doc(db, CollectionName, docId);
      docRef=await setDoc(docRef1, data); // creates or overwrites the doc with specified ID
    } else {
      docRef = await addDoc(collection(db, CollectionName), data); // auto-generates doc ID
    }
    return {
      status: 'success',
      message: 'Document added successfully',
      id: docRef.id || docId,
    };
  } catch (error) {
  console.log("error----->",error)
    return {
      status: 'error',
      message: error.message,
    };
  }
};
  const handleUpdateEx = async (CollectionName, docId, data) => {
  try {
    // Reference the Firestore document
    const docRef = doc(db, CollectionName, docId);

    // Use updateDoc for partial updates
    await updateDoc(docRef, data);

    // Success response
    return {
      status: 'success',
      message: 'Updated Successfully',
    };
  } catch (error) {
    // Error response with stringified error message
    return {
      status: 'error',
      message: error.message || 'An error occurred',
    };
  }
};
const copyDocument = async (sourceCollection, sourceDocId, targetCollection, targetDocId) => {
  try {
    // Step 1: Get the document from the source collection
    const sourceDocRef = doc(db, sourceCollection, sourceDocId);
    const sourceDocSnapshot = await getDoc(sourceDocRef);

    // Step 2: Check if the source document exists
    if (sourceDocSnapshot.exists()) {
      // Step 3: Get the data from the source document
      const sourceData = sourceDocSnapshot.data();

      // Step 4: Write the data to the target document in the target collection
      const targetDocRef = doc(db, targetCollection, targetDocId);
      await setDoc(targetDocRef, sourceData);

      console.log("Document copied successfully!");
    } else {
      console.log("Source document does not exist.");
    }
  } catch (error) {
    console.error("Error copying document: ", error);
  }
};
const addOrUpdateDocIds = async  (CollectionName,WhereAndObject) =>{
  //const colRef = collection(db, CollectionName);

   let myQuery = collection(db, CollectionName);
    WhereAndObject.forEach(condition => {
  myQuery = query(myQuery, where(condition.name, condition.condition, condition.value));
});
	const snapshot = await getDocs(myQuery);
  //const snapshot = await getDocs(colRef);

  for (const document of snapshot.docs) {
    const docId = document.id;
    const docRef = doc(db, CollectionName, docId);

    await updateDoc(docRef, {
      documentid: docId,
      id: docId
    });

    console.log(`Updated document ${docId} with documentid & id`);
  }
};
const copyCollection = async (sourceCollection, targetCollection,AlreadyData={}) => {
  try {
    // Step 1: Fetch all documents from the source collection
    const querySnapshot = await getDocs(collection(db, sourceCollection));
      let KeyD="";
    // Step 2: Iterate over each document in the source collection
    querySnapshot.forEach(async (document) => {
      const docData = document.data(); // Get document data
      if(typeof docData.Frieda=="undefined")
      {
         KeyD=docData.HId+"_"+docData.PId;
         console.log("docData=====>",docData)
        docData.Frieda=AlreadyData[KeyD].Frieda;
        // Step 3: Prepare the document for saving in the target collection
        //const convertedDataForSaving = convertRotationsArrayToMap(docData);

        // Step 4: Set the document in the target collection (same doc id)

        const targetDocRef = doc(db, targetCollection, document.id);
        await setDoc(targetDocRef, docData, { merge: true });

        console.log(`Document ${document.id} copied successfully.`);
      }

    });

    console.log("All documents copied successfully.");
  } catch (error) {
    console.error("Error copying collection: ", error);
  }
};
const batchPromises= async(tasks, batchSize)=>{
  const results = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }
  return results;
};
 const  fetchAllJoinData = async(joinCollectionName)=> {
  let joinData = {};
  const joinQuery = query(collection(db, joinCollectionName));
  const snapshot = await getDocs(joinQuery);
  snapshot.forEach((doc) => {
    joinData[doc.id] = doc.data();
  });
  return joinData;
};
const  SelectSuperComplexConditionsForView= async(
  mainCollectionName,
  conditionsArray,
  joinCollections = [],
  orderByField,
  orderByDirection,
  pageSize = 10000,
  lastDoc = null
)=> {
  try {
    const TotalRecords = { leads: 0, services: 0, followups: 0, finalresult: 0 };
    let finalResults = {};
    let SuperfinalResults = {};
    let SuperSuperfinalResults = {};

    // 🟢 Step 1: Build Main Collection Queries
    const queries = conditionsArray.map((conditions) => {
      let queryRef = collection(db,  mainCollectionName);
      conditions.forEach((condition) => {
        queryRef = query(queryRef, where(condition.name, condition.condition, condition.value));
      });

      if (orderByField) queryRef = query(queryRef, orderBy(orderByField, orderByDirection));
      if (lastDoc) queryRef = query(queryRef, startAfter(lastDoc)); // Pagination
      if (pageSize) queryRef = query(queryRef, limit(pageSize)); // Limit records

      return getDocs(queryRef);
    });
    console.log("queries=====>",queries)
console.log("lastDoc=====>",lastDoc)
    // 🔥 Step 2: Fetch Main Collection with Batch Processing
    const querySnapshots = await batchPromises(queries, 5); // Limit 5 concurrent requests
    querySnapshots.forEach((snapshot) => {

      snapshot.forEach((doc) => {
      console.log("doc=====>",doc)
      if(typeof finalResults[doc.data().uid]==="undefined")
      {
        finalResults[doc.data().uid] = doc.data();
        SuperfinalResults[doc.data().uid] = doc.data();
      }

      });
    });
console.log("finalResults=====>",finalResults)
console.log("SuperfinalResults=====>",SuperfinalResults)
    // 🔥 Pagination: Get Last Document for Next Page
    const lastVisible = querySnapshots[0]?.docs?.slice(-1)[0] || null;
    TotalRecords["leads"] = Object.keys(finalResults).length;

    // 🟢 Step 3: Fetch Join Collections Data Once and Filter Locally
    for (const join of joinCollections) {
      const joinData = await fetchAllJoinData( join.collection); // Fetch all join data once
console.log("joinData=====>",joinData)
      Object.keys(finalResults).forEach((docId) => {
    console.log("docId=====>",docId)
    console.log("join=====>",join)
        const relatedRecords = Object.values(joinData).filter((record) => record[join.leftField] === docId);
        console.log("relatedRecords--->",relatedRecords)
        if (relatedRecords.length > 0) {
          finalResults[docId][join.collection + "_Table"] = relatedRecords.reduce((acc, record) => {
            acc[record.id] = record;
            return acc;
          }, {});
        }

        // Apply conditions locally
        //if (join.collection === "services")
        {
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
    for (const join of joinCollections)
    {
      if (join.conditions.length <= 0)
      {
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
};

const copyFieldToAnotherCollection = async (sourceCollection, targetCollection, fieldName) => {
  try {
    const querySnapshot = await getDocs(collection(db, sourceCollection));

    if (querySnapshot.empty) {
      console.log(`No documents found in "${sourceCollection}" collection.`);
      return;
    }

    const batchSize = 500; // Firestore batch write limit
    let batchCount = 0;
    let batch = writeBatch(db);

    for (const docSnapshot of querySnapshot.docs) {
      const sourceData = docSnapshot.data();

      if (!(fieldName in sourceData)) {
        console.warn(`⚠️ Field "${fieldName}" missing in document "${docSnapshot.id}". Skipping.`);
        continue;
      }

      const targetDocRef = doc(db, targetCollection, docSnapshot.id);
      const updateData = { [fieldName]: sourceData[fieldName] };

      batch.set(targetDocRef, updateData, { merge: true }); // 🔹 Merge to avoid overwriting existing fields
      batchCount++;

      if (batchCount === batchSize) {
        await batch.commit(); // Commit batch
        console.log(`✅ Batch of ${batchSize} committed.`);
        batch = writeBatch(db); // Start a new batch
        batchCount = 0;
        await new Promise((res) => setTimeout(res, 500)); // 🔹 Avoid rate limits
      }
    }

    if (batchCount > 0) {
      await batch.commit(); // Commit remaining updates
      console.log(`✅ Final batch of ${batchCount} committed.`);
    }

    console.log(`🎉 Successfully copied "${fieldName}" to "${targetCollection}" collection!`);
  } catch (error) {
    console.error("❌ Error copying field:", error);
  }
};
const updateOrAddFieldInCollection = async (collectionName, fieldName, fieldValue) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
let LoopId=1;
    if (querySnapshot.empty) {
      console.log(`No documents found in "${collectionName}" collection.`);
      return;
    }

    const docs = querySnapshot.docs;
    const batchSize = 500; // Firestore batch write limit
    let batchCount = 0;
    let batch = writeBatch(db);

    for (const doc of docs) {
      const data = doc.data();
      let updateData = data;
      if (!updateData?.DoctorAssigned && updateData?.location_code)
      {
        const Lcode = updateData.location_code;
        const findQuery = query(
          collection(db, "RotationDoctors"),
          where(`DoctorInfo.locationCodes.${Lcode}`, "==", updateData.location_code)
        );
        const querySnapshotFind = await getDocs(findQuery);
        updateData.DoctorAssigned="no";
        if (!querySnapshotFind.empty)
        {
          const firstDoc = querySnapshotFind.docs[0];
          const doctorData = firstDoc.data();
          updateData.DoctorDetails={'id':doctorData.id,"representingEmail":doctorData.representingEmail};
          updateData.DoctorAssigned="yes";
        }
      }

      LoopId++;


      batch.update(doc.ref, updateData);
      batchCount++;
      console.log("updateData----->",updateData);
      if (batchCount === batchSize) {
        await batch.commit(); // 🔹 Wait for batch to finish before starting a new one
        console.log(`✅ Batch of ${batchSize} committed.`);
        batch = writeBatch(db); // Start a new batch
        batchCount = 0;
        await new Promise((res) => setTimeout(res, 500)); // 🔹 Small delay to avoid Firestore rate limits
      }
    }

    if (batchCount > 0) {
      await batch.commit(); // Commit any remaining updates
      console.log(`✅ Final batch of ${batchCount} committed.`);
    }

    console.log(`🎉 All documents updated successfully in "${collectionName}" collection!`);
  } catch (error) {
    console.error("❌ Error updating documents:", error);
  }
};
/*const updateOrAddFieldInCollection = async (collectionName, fieldName, fieldValue) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
let LoopId=1;
    if (querySnapshot.empty) {
      console.log(`No documents found in "${collectionName}" collection.`);
      return;
    }

    const docs = querySnapshot.docs;
    const batchSize = 500; // Firestore batch write limit
    let batchCount = 0;
    let batch = writeBatch(db);

    for (const doc of docs) {
      const data = doc.data();
      let updateData = {};

      if (fieldName === "updatedAt") {
        updateData[fieldName] = data.updatedAt && typeof data.updatedAt === "string"
          ? Timestamp.fromDate(new Date(data.updatedAt))
          : Timestamp.now();
      } else {
        //updateData[fieldName] = fieldValue;
         updateData[fieldName] = LoopId;
        LoopId++;
      }

      batch.update(doc.ref, updateData);
      batchCount++;

      if (batchCount === batchSize) {
        await batch.commit(); // 🔹 Wait for batch to finish before starting a new one
        console.log(`✅ Batch of ${batchSize} committed.`);
        batch = writeBatch(db); // Start a new batch
        batchCount = 0;
        await new Promise((res) => setTimeout(res, 500)); // 🔹 Small delay to avoid Firestore rate limits
      }
    }

    if (batchCount > 0) {
      await batch.commit(); // Commit any remaining updates
      console.log(`✅ Final batch of ${batchCount} committed.`);
    }

    console.log(`🎉 All documents updated successfully in "${collectionName}" collection!`);
  } catch (error) {
    console.error("❌ Error updating documents:", error);
  }
};
/*const updateOrAddFieldInCollection = async (collectionName, fieldName, fieldValue) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));

    if (querySnapshot.empty) {
      console.log(`No documents found in "${collectionName}" collection.`);
      return;
    }

    const docs = querySnapshot.docs;
    const batchSize = 500; // Firestore's batch limit
    let batch = writeBatch(db);
    let batchCount = 0;
    let batchPromises = [];
let LoopId=1;
    for (const doc of docs) {
      const data = doc.data();
      let updateData = {};

      if (fieldName === "updatedAt") {
        updateData[fieldName] = data.updatedAt && typeof data.updatedAt === "string"
          ? Timestamp.fromDate(new Date(data.updatedAt))
          : Timestamp.now();
      } else {
        //updateData[fieldName] = fieldValue;
        updateData[fieldName] = LoopId;
        LoopId++;
      }

      batch.update(doc.ref, updateData);
      batchCount++;

      if (batchCount === batchSize) {
        batchPromises.push(batch.commit()); // Execute batch
        batch = writeBatch(db); // Start a new batch
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      batchPromises.push(batch.commit()); // Commit the last batch
    }

    await Promise.all(batchPromises);
    console.log(`All documents updated successfully in "${collectionName}" collection!`);
  } catch (error) {
    console.error("Error updating documents:", error);
  }
};
const updateOrAddFieldInCollection = async (collectionName, fieldName, fieldValue) => {
  try {
    // Step 1: Fetch all documents from the specified collection
    const querySnapshot = await getDocs(collection(db, collectionName));

    if (querySnapshot.empty) {
      console.log(`No documents found in the "${collectionName}" collection.`);
      return;
    }

    // Step 2: Initialize a batch for updating documents
    const batch = writeBatch(db);
    let LoopId=1;
    // Step 3: Iterate over each document
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let updateData = {};

      // Step 4: Handle different cases for the `updatedAt` field
      if (fieldName === "updatedAt") {
        if (data.updatedAt && typeof data.updatedAt === "string") {
          updateData[fieldName] = Timestamp.fromDate(new Date(data.updatedAt));
        } else {
          updateData[fieldName] = Timestamp.now(); // Default to the current timestamp
        }
      } else {
        //updateData[fieldName] = fieldValue;
        updateData[fieldName] = LoopId;
        LoopId++;
      }

      // Step 5: Add the update to the batch
      batch.update(doc.ref, updateData);
      console.log(`Queued update for document ${doc.id}`);
    });

    // Step 6: Commit the batch updates
    await batch.commit();
    console.log(`All documents updated successfully in "${collectionName}" collection!`);
  } catch (error) {
    console.error("Error updating documents:", error);
  }
};*/
const updateTimestampsInCollection = async (collectionName) => {
  try {
    // Step 1: Fetch all documents from the specified collection
    const querySnapshot = await getDocs(collection(db, collectionName));

    if (querySnapshot.empty) {
      console.log("No documents found in the collection.");
      return;
    }

    // Step 2: Initialize a batch for updating documents
    const batch = writeBatch(db);

    // Step 3: Iterate over each document
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Step 4: Check if the `updatedAt` field exists and is a string
      if (data.updatedAt && typeof data.updatedAt === "string") {
        const timestamp = Timestamp.fromDate(new Date(data.updatedAt));

        // Step 5: Add the update to the batch
        batch.update(doc.ref, { updatedAt: timestamp });

        console.log(`Queued update for document ${doc.id}`);
      }
    });

    // Step 6: Commit the batch updates
    await batch.commit();
    console.log("All documents updated successfully!");
  } catch (error) {
    console.error("Error updating documents:", error);
  }
};
const updateTimestampsAndAddCreatedAt = async (collectionName) => {
  try {
    // Step 1: Fetch all documents from the specified collection
    const querySnapshot = await getDocs(collection(db, collectionName));

    if (querySnapshot.empty) {
      console.log("No documents found in the collection.");
      return;
    }

    // Step 2: Initialize a batch for updating documents
    const batch = writeBatch(db);

    // Step 3: Define the fixed `createdAt` date
    const fixedCreatedAtDate = new Date('2024-01-01T00:00:00Z'); // January 1, 2024, UTC
    const fixedTimestamp = Timestamp.fromDate(fixedCreatedAtDate);

    // Step 4: Iterate over each document
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const updates = {};

      // Step 5: Update `updatedAt` field to Firestore Timestamp if it is a string
     if (data.updatedAt && typeof data.updatedAt === "string") {
        updates.updatedAt = Timestamp.fromDate(new Date(data.updatedAt));
      }
      if (data.createdAt && typeof data.createdAt === "string") {
        updates.createdAt = Timestamp.fromDate(new Date(data.createdAt));
      }

      // Step 6: Add `createdAt` field with fixed Timestamp if not already present
      /*if (!data.createdAt) {
        updates.createdAt = fixedTimestamp;
        updates.updatedAt = fixedTimestamp;
      }*/

      // Add updates to the batch if there are any
      if (Object.keys(updates).length > 0) {
        batch.update(doc.ref, updates);
        console.log(`Queued update for document ${doc.id}:`, updates);
      }
    });

    // Step 7: Commit the batch updates
    await batch.commit();
    console.log("All documents updated successfully!");
  } catch (error) {
    console.error("Error updating documents:", error);
  }
};
const restructureRotationData = async (sourceCollection, targetCollection) => {
  try {
    // Step 1: Fetch all documents from the source collection
    const querySnapshot = await getDocs(collection(db, sourceCollection));

    // Use for...of to handle async operations properly
    for (const document of querySnapshot.docs) {
      const docData = document.data();
      // Check if the document contains RotationData and Rotations array
      if (docData.RotationData && Array.isArray(docData.RotationData.Rotations)) {
        const rotationsArray = docData.RotationData.Rotations;
        const newRotations = {};

        // Process each rotation in the array
        for (const [index, rotation] of rotationsArray.entries()) {
          const rotationKey = `Rotation${index}`;
          let newRotation = { ...rotation };
			if (typeof newRotation.EnrollmentDate !== "undefined" && newRotation.EnrollmentDate !== null)
			{
            	newRotation.EnrollmentDate = Timestamp.fromDate(new Date(newRotation['EnrollmentDate']));
          	}
          if (typeof newRotation.StartDate !== "undefined" && newRotation.StartDate !== null)
          {
            	newRotation.StartDate = Timestamp.fromDate(new Date(newRotation['StartDate']));
          }
          if (typeof newRotation.RefundRequestDate !== "undefined" && newRotation.RefundRequestDate !== null)
          {
            newRotation.RefundRequestDate = Timestamp.fromDate(new Date(newRotation['RefundRequestDate']));
          }
          if (typeof newRotation.RefundDate !== "undefined" && newRotation.RefundDate !== null)
          {
            newRotation.RefundDate = Timestamp.fromDate(new Date(newRotation['RefundDate']));
          }
          // Check if RotationPayment exists and is an array
          if (newRotation.RotationPayment && Array.isArray(newRotation.RotationPayment)) {
            const paymentsArray = newRotation.RotationPayment;
            const newPayments = {};

            // Convert RotationPayment array into a map
            paymentsArray.forEach((payment, paymentIndex) => {
              const paymentKey = `Payment${paymentIndex}`;
             // const paymentKey = paymentIndex;
             if (typeof payment.PaymentDate !== "undefined" && payment.PaymentDate !== null)
          	{
            	payment.PaymentDate = Timestamp.fromDate(new Date(payment.PaymentDate));
          	}

              newPayments[paymentKey] = payment;
            });

            // Add the converted payments map back to the rotation
            newRotation = {
              ...newRotation,
              RotationPayment: newPayments,
            };
          }

          // Add the converted rotation to the new rotations map
          newRotations[rotationKey] = newRotation;
        }

        // Prepare updated data with the new map structure
        const updatedData = {
          ...docData,
          RotationData: {
            ...docData.RotationData,
            Rotations: newRotations, // Replace the array with the new map
          },
        };
        // Save the updated document back to the target collection
        const docRef = doc(db, targetCollection, document.id);
        try {
          await setDoc(docRef, updatedData, { merge: true });
          console.log(`Document ${document.id} updated successfully.`);
        } catch (error) {
          console.error(`Error updating document ${document.id}: `, error);
        }
      }
    }

    console.log("All documents updated successfully.");
  } catch (error) {
    console.error("Error fetching documents: ", error);
  }
};
const restructureRotationData2 = async (sourceCollection, targetCollection) => {
  try {
    // Step 1: Fetch all documents from the source collection
    const querySnapshot = await getDocs(collection(db, sourceCollection));

    // Use for...of to handle async operations properly
    for (const document of querySnapshot.docs) {
      const docData = document.data();


      // Check if the document contains RotationData and Rotations object
      if (docData.RotationData && typeof docData.RotationData.Rotations === 'object') {
        const rotationsObject = docData.RotationData.Rotations;
        const newRotations = {};

        // Process each rotation in the object (key-value pairs)
        for (const [rotationKey, rotation] of Object.entries(rotationsObject)) {

          let newRotation = { ...rotation };

          // Convert date strings to timestamps
          if (typeof newRotation.EnrollmentDate !== "undefined" && newRotation.EnrollmentDate !== null) {
          	if (!(newRotation.EnrollmentDate instanceof Timestamp))
          	{
          		if(newRotation.EnrollmentDate!=="")
          		newRotation.EnrollmentDate = Timestamp.fromDate(new Date(newRotation['EnrollmentDate']));
          	}

          }
          if (typeof newRotation.StartDate !== "undefined" && newRotation.StartDate !== null)
          {
          	if (!(newRotation.StartDate instanceof Timestamp))
          	{
          		if(newRotation.StartDate!=="")
          		newRotation.StartDate = Timestamp.fromDate(new Date(newRotation['StartDate']));
          	}

          }
          if (typeof newRotation.RefundRequestDate !== "undefined" && newRotation.RefundRequestDate !== null)
          {
          	if (!(newRotation.RefundRequestDate instanceof Timestamp))
          	{
          		newRotation.RefundRequestDate = Timestamp.fromDate(new Date(newRotation.RefundRequestDate));
          	}
          }
          if (typeof newRotation.RefundDate !== "undefined" && newRotation.RefundDate !== null)
          {
          	if (!(newRotation.RefundDate instanceof Timestamp))
          	{
          		newRotation.RefundDate = Timestamp.fromDate(new Date(newRotation['RefundDate']));
          	}

          }



          // Check if RotationPayment exists and is an object (map)
          if (newRotation.RotationPayment && typeof newRotation.RotationPayment === 'object') {
            const paymentsObject = newRotation.RotationPayment;
            const newPayments = {};

            // Convert RotationPayment object into a new object with formatted dates
            for (const [paymentKey, payment] of Object.entries(paymentsObject)) {
              if (typeof payment.PaymentDate !== "undefined" && payment.PaymentDate !== null)
              {
              	if (!(newRotation.RefundDate instanceof Timestamp))
          		{
          			payment.PaymentDate = Timestamp.fromDate(new Date(payment['PaymentDate']));
          		}

              }

              newPayments[paymentKey] = payment;
            }

            // Add the converted payments map back to the rotation
            newRotation = {
              ...newRotation,
              RotationPayment: newPayments,
            };
          }

          // Add the converted rotation to the new rotations map
          newRotations[rotationKey] = newRotation;
        }

        // Prepare updated data with the new map structure
        const updatedData = {
          ...docData,
          RotationData: {
            ...docData.RotationData,
            Rotations: newRotations, // Replace the object with the updated one
          },
        };

        // Save the updated document back to the target collection
        const docRef = doc(db, targetCollection, document.id);
        try {
          await setDoc(docRef, updatedData, { merge: true });
          console.log(`Document ${document.id} updated successfully.`);
        } catch (error) {
          console.error(`Error updating document ${document.id}: `, error);
        }
      }
    }

    console.log("All documents updated successfully.");
  } catch (error) {
    console.error("Error fetching documents: ", error);
  }
};
const restructureRotationDataMatch = async (sourceCollection, targetCollection) => {
  try {
    // Step 1: Fetch all documents from the source collection
    const querySnapshot = await getDocs(collection(db, sourceCollection));

    // Use for...of to handle async operations properly
    for (const document of querySnapshot.docs) {
      const docData = document.data();

      // Check if the document contains Match object
      if (docData.Match && typeof docData.Match === 'object') {
        const matchData = { ...docData.Match }; // Copy the Match object

        // Convert EnrollmentDate to Timestamp if it exists
        if (matchData.EnrollmentDate) {
        	if (!(matchData.EnrollmentDate instanceof Timestamp))
          	{
          		matchData.EnrollmentDate = Timestamp.fromDate(new Date(matchData.EnrollmentDate));
          	}

        }

        // Handle Refund object

        if (matchData.OnBoarding && typeof matchData.OnBoarding === 'object')
        {
        	if (matchData?.OnBoarding?.OrientationMeetWithAdminTeam && typeof matchData?.OnBoarding?.OrientationMeetWithAdminTeam === 'object')
        	{
        		if (matchData?.OnBoarding?.OrientationMeetWithAdminTeam?.Relation && typeof matchData?.OnBoarding?.OrientationMeetWithAdminTeam?.Relation === 'object')
        		{

        			if (matchData?.OnBoarding?.OrientationMeetWithAdminTeam?.Relation.Date)
        			{
        				 if (!(matchData.OnBoarding.OrientationMeetWithAdminTeam.Relation.Date instanceof Timestamp))
          				{
          					matchData.OnBoarding.OrientationMeetWithAdminTeam.Relation.Date = Timestamp.fromDate(new Date(matchData.OnBoarding.OrientationMeetWithAdminTeam.Relation.Date));
          				}

        			}
        		}
        	}
        	if (matchData?.OnBoarding?.OrientationMeetWithPawan && typeof matchData?.OnBoarding?.OrientationMeetWithPawan === 'object')
        	{
        		if (matchData?.OnBoarding?.OrientationMeetWithPawan?.Relation && typeof matchData?.OnBoarding?.OrientationMeetWithPawan?.Relation === 'object')
        		{
        			if (matchData?.OnBoarding?.OrientationMeetWithPawan?.Relation.Date)
        			{
        				if (!(matchData.OnBoarding.OrientationMeetWithAdminTeam.Relation.Date instanceof Timestamp))
          				{
          					matchData.OnBoarding.OrientationMeetWithAdminTeam.Relation.Date = Timestamp.fromDate(new Date(matchData.OnBoarding.OrientationMeetWithAdminTeam.Relation.Date));
          				}

        			}
        		}
        	}
        }
        if (matchData.Refund && typeof matchData.Refund === 'object') {
          if (matchData.Refund.ProcessedDate)
          {
          	if (!(matchData.Refund.ProcessedDate instanceof Timestamp))
          	{
          		matchData.Refund.ProcessedDate = Timestamp.fromDate(new Date(matchData.Refund.ProcessedDate));
          	}
          }
          if (matchData.Refund.RequestedDate)
          {
          	if (!(matchData.Refund.RequestedDate instanceof Timestamp))
          	{
          		matchData.Refund.RequestedDate = Timestamp.fromDate(new Date(matchData.Refund.RequestedDate));
          	}

          }
        }

        // Handle Payments
        if (matchData.Payments && Array.isArray(matchData.Payments)) {
          const newPayments = {};
          matchData.Payments.forEach((payment, paymentIndex) => {
            const paymentKey = `Payment${paymentIndex}`;
            if (payment.PaymentDate) {
            	if (!(payment.PaymentDate instanceof Timestamp))
          		{
          			payment.PaymentDate = Timestamp.fromDate(new Date(payment.PaymentDate));
          		}

            }
            newPayments[paymentKey] = payment; // Map payment to new key
          });
          matchData.Payments = newPayments; // Replace Payments array with new object
        }

        // Prepare updated data with the new structure
        const updatedData = {
          ...docData,
          Match: matchData, // Use the updated matchData
        };


        // Save the updated document back to the target collection
        const docRef = doc(db, targetCollection, document.id);
        try {
          await setDoc(docRef, updatedData, { merge: true });
          console.log(`Document ${document.id} updated successfully.`);
        } catch (error) {
          console.error(`Error updating document ${document.id}: `, error);
        }
      }
    }

    console.log("All documents updated successfully.");
  } catch (error) {
    console.error("Error fetching documents: ", error);
  }
};
const restructureRotationDataResearch = async (sourceCollection, targetCollection) => {
  try {
    // Step 1: Fetch all documents from the source collection
    const querySnapshot = await getDocs(collection(db, sourceCollection));

    // Use for...of to handle async operations properly
    for (const document of querySnapshot.docs) {
      const docData = document.data();

      // Check if the document contains Research and is an array
      if (docData.Research && Array.isArray(docData.Research)) {
        const rotationsArray = docData.Research;
        const newRotations = {};

        // Process each rotation in the array
        for (const [index, rotation] of rotationsArray.entries()) {
          const rotationKey = `Research${index}`;
          let newRotation = { ...rotation };

          // Convert EnrollmentDate and StartDate to Timestamp if they exist
          if (newRotation.EnrollmentDate) {
            newRotation.EnrollmentDate = Timestamp.fromDate(new Date(newRotation.EnrollmentDate));
          }
          if (newRotation.StartDate) {
            newRotation.StartDate = Timestamp.fromDate(new Date(newRotation.StartDate));
          }

          // Check if Payments exists and is an array
          if (newRotation.Payments && Array.isArray(newRotation.Payments)) {
            const paymentsArray = newRotation.Payments;
            const newPayments = {};

            // Convert Payments array into a map
            paymentsArray.forEach((payment, paymentIndex) => {
              const paymentKey = `Payment${paymentIndex}`;
              if (payment.PaymentDate) {
                payment.PaymentDate = Timestamp.fromDate(new Date(payment.PaymentDate));
              }

              newPayments[paymentKey] = payment; // Map payment to new key
            });

            // Add the converted payments map back to the rotation
            newRotation = {
              ...newRotation,
              Payments: newPayments, // Corrected key from RotationPayment to Payments
            };
          }

          // Add the converted rotation to the new rotations map
          newRotations[rotationKey] = newRotation;
        }

        // Prepare updated data with the new map structure
        const updatedData = {
          ...docData,
          Research: newRotations, // Use the new rotations object
        };

        // Save the updated document back to the target collection
        const docRef = doc(db, targetCollection, document.id);
        try {
          await setDoc(docRef, updatedData, { merge: true });
          console.log(`Document ${document.id} updated successfully.`);
        } catch (error) {
          console.error(`Error updating document ${document.id}: `, error);
        }
      }
    }

    console.log("All documents updated successfully.");
  } catch (error) {
    console.error("Error fetching documents: ", error);
  }
};
const FetchUniqueData = async (mainCollectionName,uniquecolumn) => {
  let uniqueStates=[];
      try {
        const mainCollectionRef = collection(db, mainCollectionName); // replace 'mainCollectionName' with your collection name
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
    };
const SelectWithWhereOr = async (mainCollectionName, WhereOrObject) => {
  try {
    // Create an array to hold all the queries
    const queries = WhereOrObject.map((condition) => {
      return query(
        collection(db, mainCollectionName),
        where(condition.name, condition.condition, condition.value)
      );
    });

    // Execute all queries in parallel using Promise.all
    const querySnapshots = await Promise.all(queries.map((q) => getDocs(q)));

    // Collect results from all query snapshots in an array
    const results = [];

    querySnapshots.forEach((snapshot) => {
      snapshot.forEach((doc) => {
        // Add each document's data along with its ID to the results array
        results.push({ id: doc.id, ...doc.data() });
      });
    });
    // Deduplicate results based on document ID
    const finalResults = results.reduce((acc, current) => {
      if (!acc.some(doc => doc.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, []);

    return {status:"success","data":finalResults};

  } catch (error) {
    console.error("Error fetching documents: ", error);
    return {status:"fail","data":{}};
  }
};
const SelectWithWhereAnd = async (mainCollectionName, WhereAndObject) => {
  try {
    // Create an array to hold all the queries
    let myQuery = collection(db, mainCollectionName);
    WhereAndObject.forEach(condition => {
  myQuery = query(myQuery, where(condition.name, condition.condition, condition.value));
});
	const querySnapshot = await getDocs(myQuery);
    const results = [];
	querySnapshot.forEach((doc) => {
  results.push({ id: doc.id, ...doc.data() });
});



    return {status:"success","data":results};

  } catch (error) {
    console.error("Error fetching documents: ", error);
    return {status:"fail","data":{}};
  }
};
const SelectWithWhereOrAndFetchProfiles = async (mainCollectionName, WhereOrObject, profileCollection) => {
  try {
    // Step 1: Fetch all documents that match the OR conditions
    const results = await SelectWithWhereOr(mainCollectionName, WhereOrObject);

    // If no results found or error in query, return empty
    if (results.status !== "success" || results.data.length === 0) {
      return { status: "fail", data: [] };
    }

    // Step 2: Fetch associated profile data based on the 'uid' field
    const enrichedResults = await Promise.all(
      results.data.map(async (result) => {
        if (result.uid) {
          // Fetch profile data from the profile collection using the uid
          const profileData = await FetchDataFromCollection(profileCollection, 10, "__name__", "==", result.uid, null);
          // If profile data is found, attach it to the result
          if (profileData.length > 0) {
            return { ...result, profile: profileData[0] };
          }
        }
        return result; // Return the result even if no profile data is found
      })
    );

    return { status: "success", data: enrichedResults };

  } catch (error) {
    console.error("Error fetching documents or profiles: ", error);
    return { status: "fail", data: [] };
  }
};
const SelectWithComplexConditions = async (
  mainCollectionName,
  conditionsArray,
  profileCollection,
  orderByField = null, // field to order by
  orderDirection = 'asc', // direction can be 'asc' or 'desc'
  limitResults = null, // limit the number of results
  lastDoc =null
) => {
  try {
    // Step 1: Create queries for each OR clause in conditionsArray
    const queries = conditionsArray.map(orClause => {
      // Build a query for each OR clause using its AND conditions
      let orQuery;
      if (typeof mainCollectionName === "string") {
    orQuery = collection(db, mainCollectionName);
  } else if (Array.isArray(mainCollectionName)) {
    if (mainCollectionName.length >= 1 && mainCollectionName.length <= 5) {
      orQuery = collection(db, ...mainCollectionName);
    } else {
      throw new Error("Invalid Firestore collection path array");
    }
  } else {
    throw new Error("mainCollectionName must be a string or array");
  }
       
      orClause.forEach(andCondition => {
        orQuery = query(orQuery, where(andCondition.name, andCondition.condition, andCondition.value));
      });

      // Apply ordering if specified
      if (orderByField) {
        orQuery = query(orQuery, orderBy(orderByField, orderDirection));
      }
      if (lastDoc) {
        orQuery = query(orQuery, startAfter(lastDoc));
      }
      // Apply limit if specified
      if (limitResults) {
        orQuery = query(orQuery, limit(limitResults));
      }

      return orQuery;
    });
    // Step 2: Execute all OR queries in parallel
    const querySnapshots = await Promise.all(queries.map(q => getDocs(q)));

    // Step 3: Collect all results from each OR query
    let allResults = [];
    let lastVisibleDocs = [];
    let finalResults = [];
    querySnapshots.forEach(snapshot => {
      snapshot.forEach(doc => {
        finalResults.push({ id: doc.id, ...doc.data() });
      });
      if (!lastDoc && snapshot.docs.length > 0) {
        lastVisibleDocs.push(snapshot.docs[snapshot.docs.length - 1]);
      }
    });
    // Step 4: Deduplicate results based on document ID
    const uniqueResults = finalResults.reduce((acc, current) => {
      if (!acc.some(doc => doc.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, []);
    let ListOfProfiles={};
    let userId="";
    // Step 5: Enrich results with profile data if available
    if (typeof profileCollection !== "undefined" && profileCollection !== "") {
      const enrichedResults = await Promise.all(
        uniqueResults.map(async (result) => {

          if (result.uid) {
          userId=result.uid
          }
          else if(result.UId)
          {
            userId=result.UId
          }
          if (userId!="")
          {
            // Fetch profile data from the profile collection using the uid
            if(typeof ListOfProfiles[userId]=="undefined")
            {
              const profileData = await FetchDataFromCollection(profileCollection, 10, "__name__", "==", userId, null);
              // If profile data is found, attach it to the result
              if (profileData.length > 0)
              {
                ListOfProfiles[userId]=profileData[0];
                return { ...result, profile: profileData[0] };
              }
            }
            else
            {
              return { ...result, profile: ListOfProfiles[userId] };
            }

          }
          return result; // Return the result even if no profile data is found
        })
      );
      return { status: "success", data: enrichedResults,lastDoc: lastVisibleDocs.length > 0 ? lastVisibleDocs[lastVisibleDocs.length - 1] : null };
    } else {
      return { status: "success", data: uniqueResults,lastDoc: lastVisibleDocs.length > 0 ? lastVisibleDocs[lastVisibleDocs.length - 1] : null };
    }
  } catch (error) {
    console.log("Error fetching documents: ", error);
    return { status: "fail", data: [] };
  }
};
const getMaxStudentUniqueId = async (collectionName,FieldName) => {
  try {
    const q = query(
      collection(db, collectionName),
      orderBy(FieldName, "desc"), // 🔹 Order by descending to get max value first
      limit(1) // 🔹 Only fetch the top record
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No records found.");
      return null;
    }

    //const maxStudentUniqueId = querySnapshot.docs[0].data().StudentUniqueId;
    const maxStudentUniqueId = querySnapshot.docs[0].data()?.[FieldName];
    console.log(`🎉 Max ${FieldName}: ${maxStudentUniqueId}`);
    return maxStudentUniqueId;
  } catch (error) {
    console.error("❌ Error fetching max ${FieldName}:", error);
    return 0;
  }
};
const getjointabledata = async (mainCollection,
  filterField,
  filterCondition,
  filterValue,
  joinCollection,
  joinOnLeft,
  joinOnRight = "__id") => {
const mainRef = collection(db, mainCollection);

  // Step 1: Build query only if filterField is provided
  let q;
  if (filterField) {
    q = query(mainRef, where(filterField, filterCondition, filterValue));
  } else {
    q = query(mainRef); // no filter, get all docs
  }

  const snapshot = await getDocs(q);
  let results = [];

  // Step 2: Loop and join
  for (let docSnap of snapshot.docs) {
    const mainData = docSnap.data();
    const joinKey = mainData[joinOnLeft];

    if (joinKey) {
      let joinedData = null;

      if (joinOnRight === "__id") {
        // Join on document ID
        const joinRef = doc(db, joinCollection, joinKey);
        const joinSnap = await getDoc(joinRef);
        if (joinSnap.exists()) {
          joinedData = joinSnap.data();
        }
      } else {
        // Join on a field inside joinCollection
        const joinRef = collection(db, joinCollection);
        const joinQuery = query(joinRef, where(joinOnRight, "==", joinKey));
        const joinSnap = await getDocs(joinQuery);
        if (!joinSnap.empty) {
          joinedData = joinSnap.docs[0].data();
        }
      }

      results.push({
        id: docSnap.id,
        ...mainData,
        [joinCollection]: joinedData,
      });
    }
  }

  return results;
};
const SelectWithComplexConditionsJoin = async (
  mainCollectionName,
  conditionsArray,
  orderByField = null,
  orderDirection = 'asc',
  limitResults = null,
  profileCollection,
  LeftTableField,
  RightTableField
) => {
  try {
    // Step 1: Create queries for each OR clause in conditionsArray
    const queries = conditionsArray.map(orClause => {
      // Build a query for each OR clause using its AND conditions
      let orQuery = collection(db, mainCollectionName);
      orClause.forEach(andCondition => {
        orQuery = query(orQuery, where(andCondition.name, andCondition.condition, andCondition.value));
      });

      // Apply ordering if specified
      if (orderByField) {
        orQuery = query(orQuery, orderBy(orderByField, orderDirection));
      }

      // Apply limit if specified
      if (limitResults) {
        orQuery = query(orQuery, limit(limitResults));
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

    // Step 5: Enrich results with profile data if available
    if (typeof profileCollection !== "undefined" && profileCollection !== "") {
      const enrichedResults = await Promise.all(
        uniqueResults.map(async (result) => {
          if (result.uid) {
            // Fetch profile data from the profile collection using the uid
            const profileData = await FetchDataFromCollection(profileCollection, 10, LeftTableField, "==", result[RightTableField], null);
            // If profile data is found, attach it to the result
            if (profileData.length > 0) {
              return { ...result, profile: profileData[0] };
            }
          }
          return result; // Return the result even if no profile data is found
        })
      );
      return { status: "success", data: enrichedResults };
    } else {
      return { status: "success", data: uniqueResults };
    }
  } catch (error) {
    console.log("Error fetching documents: ", error);
    return { status: "fail", data: [] };
  }
};
const FetchUniqueDataFull = async (mainCollectionName,uniquecolumn,pageSize,lastDoc,filterField,filterCondition,filterValue,LoggedInuser) => {
  let uniqueStates=[];
      try {
        const mainCollectionRef = collection(db, mainCollectionName); // replace 'mainCollectionName' with your collection name
        let queryConstraints;
        if(pageSize)
        {
        	queryConstraints = [limit(pageSize)];
        }
    	if (lastDoc)
    	{
      		queryConstraints.push(startAfter(lastDoc));
    	}
    	if (filterField && filterValue)
    	{
    		if(filterField==="DoctorInfo.locationCodes")
    		{
    			filterField="DoctorInfo.locationCodes."+filterValue
    			queryConstraints.push(where(filterField, filterCondition, filterValue));
    		}
    		if(filterCondition===">=")
    		{
    			const startPrefix = filterValue;
  				const endPrefix = filterValue + '\uf8ff';
    			queryConstraints.push(where(filterField, filterCondition, startPrefix),where(filterField, '<=', endPrefix));
    		}
    		else
    		{
    			queryConstraints.push(where(filterField, filterCondition, filterValue));
    		}

    	}
    	let q
    	if(queryConstraints)
    	{
    		 q = query(mainCollectionRef, ...queryConstraints);
    	}
    	else
    	{
    		q=mainCollectionRef;
    	}

    	const querySnapshot = await getDocs(q);
        //const querySnapshot = await getDocs(mainCollectionRef);

        const states = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data[uniquecolumn]) {
            states.push(data);
          }
        });
		uniqueStates = [...new Set(states)];
        // Get unique states
        if(queryConstraints)
    	{
    		 return {
      data: uniqueStates,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    };
    	}
    	else
    	{
    		return uniqueStates;
    	}



        //return uniqueStates;
      } catch (error) {
        return uniqueStates;
      }
    };
const fetchPaginatedDataWithJoinRoleData = async (mainCollectionName, joinCollectionName, pageSize, lastDoc, filterField,filterCondition, filterValue,LoggedInuser,orderByField,orderDirection) => {
  try {
    const mainCollectionRef = collection(db, mainCollectionName);
    const queryConstraints = [limit(pageSize)];
	if (orderByField) {
      queryConstraints.push(orderBy(orderByField, orderDirection));
    }
    if (lastDoc) {
      queryConstraints.push(startAfter(lastDoc));
    }

    if (filterField && filterValue) {

    	if(filterCondition===">=")
    	{
    		const startPrefix = filterValue;
  			const endPrefix = filterValue + '\uf8ff';
    		queryConstraints.push(where(filterField, filterCondition, startPrefix),where(filterField, '<=', endPrefix));
    	}
    	else
    	{
    		queryConstraints.push(where(filterField, filterCondition, filterValue));
    	}

      //queryConstraints.push(where(filterField, filterCondition, filterValue));
    }

    const q = query(mainCollectionRef, ...queryConstraints);

    const querySnapshot = await getDocs(q);
    let mainCollectionData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (!filterField && !filterValue)
    {
    	if(mainCollectionData.length===0)
    	{
    		lastDoc=querySnapshot.docs[querySnapshot.docs.length - 1];
    		let Res= await fetchPaginatedDataWithJoinRoleData(mainCollectionName, joinCollectionName, pageSize, lastDoc, filterField,filterCondition, filterValue,LoggedInuser,orderByField,orderDirection);;
    		LastData.push(Res);
    		return {data:[...mainCollectionData, ...Res.data],querySnapshot:querySnapshot};
   		}
    	else if(mainCollectionData.length<pageSize)
    	{

    		lastDoc=querySnapshot.docs[querySnapshot.docs.length - 1];
    		let Res= await fetchPaginatedDataWithJoinRoleData(mainCollectionName, joinCollectionName, pageSize, lastDoc, filterField,filterCondition, filterValue,LoggedInuser,orderByField,orderDirection);
    		//LastData.push(Res);
    		return {data:[...mainCollectionData, ...Res.data],querySnapshot:querySnapshot};
    	}
    }

    return {data:mainCollectionData,querySnapshot:querySnapshot};
    }
    catch (error) {
    console.error('Error fetching data: ', error);
    throw error;
  }
}
const fetchPaginatedDataWithJoinRoleDataBK = async (
  mainCollectionName,
  joinCollectionName,
  pageSize,
  lastDoc,
  filterField,
  filterCondition,
  filterValue,
  orderByField,
  orderDirection = "asc", // Default ordering direction
  LoggedInuser
) => {
  try {
    const mainCollectionRef = collection(db, mainCollectionName);
    const queryConstraints = [limit(pageSize)];

    // Add orderBy constraint if specified
    if (orderByField) {
      queryConstraints.push(orderBy(orderByField, orderDirection));
    }

    // Handle pagination
    if (lastDoc) {
      queryConstraints.push(startAfter(lastDoc));
    }

    // Handle filtering
    if (filterField && filterValue) {
      if (filterCondition === ">=") {
        const startPrefix = filterValue;
        const endPrefix = filterValue + "\uf8ff";
        queryConstraints.push(
          where(filterField, filterCondition, startPrefix),
          where(filterField, "<=", endPrefix)
        );
      } else {
        queryConstraints.push(where(filterField, filterCondition, filterValue));
      }
    }

    // Fetch data
    const q = query(mainCollectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    let mainCollectionData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Handle recursive pagination if no filter is applied
    if (!filterField && !filterValue) {
      if (mainCollectionData.length === 0 && querySnapshot.size > 0) {
        lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        const nextPage = await fetchPaginatedDataWithJoinRoleData(
          mainCollectionName,
          joinCollectionName,
          pageSize,
          lastDoc,
          filterField,
          filterCondition,
          filterValue,
          orderByField,
          orderDirection,
          LoggedInuser
        );
        return {
          data: [...mainCollectionData, ...nextPage.data],
          querySnapshot: nextPage.querySnapshot,
        };
      } else if (mainCollectionData.length < pageSize && querySnapshot.size > 0) {
        lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        const nextPage = await fetchPaginatedDataWithJoinRoleData(
          mainCollectionName,
          joinCollectionName,
          pageSize,
          lastDoc,
          filterField,
          filterCondition,
          filterValue,
          orderByField,
          orderDirection,
          LoggedInuser
        );
        return {
          data: [...mainCollectionData, ...nextPage.data],
          querySnapshot: nextPage.querySnapshot,
        };
      }
    }

    return { data: mainCollectionData, querySnapshot };
  } catch (error) {
    console.error("Error fetching data: ", error);
    throw error;
  }
};

const FetchDataFromCollection = async (CollectionNameSelected, pageSize, filterField,filterCondition, filterValue,LoggedInuser,orderByField,orderDirection) => {
  try {
    	 	const mainCollectionRef = collection(db, CollectionNameSelected);
    		const queryConstraints = [limit(pageSize)];
    		if (filterField && (filterValue || filterValue===""))
    		{
      			queryConstraints.push(where(filterField, filterCondition, filterValue));
   			}
   			if (orderByField)
   			{
          queryConstraints.push(orderBy(orderByField, orderDirection));
        }
    		const q = query(mainCollectionRef, ...queryConstraints);
    		const querySnapshot = await getDocs(q);
    		let mainCollectionData = querySnapshot.docs.map(doc => ({
      			id: doc.id,
      			documentid: doc.id,
      			...doc.data()
    		}));
    		return mainCollectionData;
  } catch (error) {
    console.error('Error fetching data: ', error);
    throw error;
  }
};
const deletedocumentfromid = async (collectionName,documentId) =>
{
	 const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
};
const deleteUser=async function deleteDocuments(userid,Tablename,emailid) {
  // Reference your collection (replace 'your-collection-name' with your actual collection name)
  const collectionRef = collection(db, Tablename);

  // Create a query to select documents where email equals "xyz"
  const q = query(collectionRef, where("email", "==", emailid));

  try {
    // Execute the query
    const querySnapshot = await getDocs(q);

    // Loop through the results
    querySnapshot.forEach(async (docSnapshot) => {
      const documentId = docSnapshot.id;

      // Check if the document ID is not "abc"
      if (documentId !== userid) {
        try {
          // Delete the document
          await deleteDoc(doc(db, Tablename, documentId));

        } catch (deleteError) {
          console.error("Error deleting document:", deleteError);
        }
      }
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
  }
}
const DeleteDocumentWhere=async function DeleteDocumentWhere(Tablename,fieldName,FieldCondition,FieldValue) {
  // Reference your collection (replace 'your-collection-name' with your actual collection name)
  const collectionRef = collection(db, Tablename);

  // Create a query to select documents where email equals "xyz"
  const q = query(collectionRef, where(fieldName, FieldCondition, FieldValue));

  try {
    // Execute the query
    const querySnapshot = await getDocs(q);

    // Loop through the results
    querySnapshot.forEach(async (docSnapshot) => {
      const documentId = docSnapshot.id;

      // Check if the document ID is not "abc"
      //if (documentId !== userid) {
        try {
          // Delete the document
          await deleteDoc(doc(db, Tablename, documentId));

        } catch (deleteError) {
          console.error("Error deleting document:", deleteError);
        }
      //}
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
  }
}
const DeleteDocumentWhereMultiple = async function (Tablename, conditionsArray) {
  try {
    let q = collection(db, Tablename);

    // Apply each where condition
    for (const cond of conditionsArray) {
      q = query(q, where(cond.name, cond.condition, cond.value));
    }

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No matching documents found.");
      return;
    }

    for (const docSnapshot of querySnapshot.docs) {
      const documentId = docSnapshot.id;
      try {
        await deleteDoc(doc(db, Tablename, documentId));
        console.log("Deleted:", documentId);
      } catch (deleteError) {
        console.error("Error deleting document:", documentId, deleteError);
      }
    }
  } catch (error) {
    console.error("Error fetching or deleting documents:", error);
  }
}
const fetchPaginatedDataWithJoin = async (
  mainCollectionName,
  joinCollectionName,
  pageSize,
  lastDoc,
  filterField,
  filterCondition,
  filterValue,
  LoggedInuser,
  orderByField,
  orderDirection = "asc"
) => {
  try {
    // Fetch main collection data
    const mainCollectionDataObj = await fetchPaginatedDataWithJoinRoleData(
      mainCollectionName,
      joinCollectionName,
      pageSize,
      lastDoc,
      filterField,
      filterCondition,
      filterValue,
      LoggedInuser,
      orderByField,
      orderDirection
    );
    const mainCollectionData = mainCollectionDataObj.data;
    const querySnapshot = mainCollectionDataObj.querySnapshot;

    // Process join data for each item
    const joinDataPromises = mainCollectionData.map(async (item) => {
      try {
        // Fetch related collections
        const AgentAsign = await FetchDataFromCollection(
          "AgentUserConnection",
          pageSize,
          "uid",
          "==",
          item.uid,
          LoggedInuser
        );

        const ServicesOpted = await FetchDataFromCollection(
          "UserServices",
          pageSize,
          "uid",
          "==",
          item.uid,
          LoggedInuser
        );

        // Attach Agent Assign and Services Opted data
        if (AgentAsign.length > 0) {
          item.AsignedToAgentId = AgentAsign[0].AsignedToAgentId;
          item.AsignedToAgentName = AgentAsign[0].AsignedToAgentName;
        }

        if (ServicesOpted.length > 0) {
          item.ServicesOpted = ServicesOpted[0];
        }

        // Fetch join collection data
        const joinQuery = query(
          collection(db, joinCollectionName),
          where("uid", "==", item.uid)
        );
        const joinSnapshot = await getDocs(joinQuery);

        const joinData = joinSnapshot.docs.map((doc) => doc.data());
        return { ...item, joinData: joinData.length > 0 ? joinData[0] : null };
      } catch (error) {
        console.error(`Error processing join data for item ${item.uid}:`, error);
        return { ...item, joinData: null };
      }
    });

    // Await all join data processing
    const joinedData = await Promise.all(joinDataPromises);

    return {
      data: joinedData.flat(),
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
const deleteDuplicateNotes = async () => {
  const notesRef = collection(db, "UserCommonServiceNotes"); // Collection name
  const snapshot = await getDocs(notesRef);

  if (snapshot.empty) {
    console.log("No documents found.");
    return;
  }

  // Map to store unique combinations of NoteDate and Message
  const uniqueNotes = new Map();
  const batchDeletePromises = [];

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const noteDate = data.NotesDate;
    const message = data.Notes;
    const uid = data.uid;
    const timestampKey = `${noteDate.seconds}_${noteDate.nanoseconds}`;
    // Generate a unique key using NoteDate and Message
    const key = `${uid}_${timestampKey}_${message}`;
console.log("key---->",key)
    // Check if the key already exists in the map
    if (uniqueNotes.has(key)) {
      // Duplicate found -> add to delete list
      console.log(`Duplicate found: Deleting doc with ID: ${docSnap.id}`);
      batchDeletePromises.push(deleteDoc(doc(db, "UserCommonServiceNotes", docSnap.id)));
    } else {
      // First occurrence -> keep it
      uniqueNotes.set(key, docSnap.id);
    }
  });

  // Execute batch delete for duplicates
  if (batchDeletePromises.length > 0) {
    await Promise.all(batchDeletePromises);
    console.log(`${batchDeletePromises.length} duplicate(s) deleted successfully!`);
  } else {
    console.log("No duplicates found.");
  }
};
const deleteFieldFromDocument = async (collectionName, docId, fieldName)=> {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            [fieldName]: deleteField()
        });
        console.log(`Field '${fieldName}' deleted successfully.`);
    } catch (error) {
        console.error("Error deleting field:", error);
    }
}
const removePidFromHospital = async (hospitalDocId, pidToRemove) => {
  try {
    const docRef = doc(db, "Hospital", hospitalDocId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const pids = data.PIds || [];

      if (pids.length === 1 && pids[0] === pidToRemove) {
        // Delete entire document
        await deleteDoc(docRef);
        console.log(`Deleted document ${hospitalDocId} as it had only PId "${pidToRemove}"`);
      } else if (pids.includes(pidToRemove)) {
        // Just remove "1" from the array
        await updateDoc(docRef, {
          PIds: arrayRemove(pidToRemove)
        });
        console.log(`Removed PId "${pidToRemove}" from document ${hospitalDocId}`);
      } else {
        console.log(`PId "${pidToRemove}" not found in document ${hospitalDocId}`);
      }
    } else {
      console.log(`Document ${hospitalDocId} not found`);
    }
  } catch (error) {
    console.error("Error processing document:", error);
  }
}
const deleteFieldFromDocumentWhere = async (
  collectionName,
  fieldToMatch,
  fieldCondition,
  valueToMatch,
  fieldToDeletePath,
  updateField,
  updateFieldValue
) => {
  try {
    const q = query(collection(db, collectionName), where(fieldToMatch, fieldCondition, valueToMatch));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No matching document found.");
      return;
    }

    for (const document of querySnapshot.docs) {
      const docRef = doc(db, collectionName, document.id);

      // Prepare the update object
      const updateData = {
        [fieldToDeletePath]: deleteField()
      };

      // Only add update field if provided
      if (updateField && updateFieldValue !== undefined) {
        updateData[updateField] = updateFieldValue;
      }

      await updateDoc(docRef, updateData);

      console.log(`Deleted field '${fieldToDeletePath}' and updated document '${document.id}'`);
    }

  } catch (error) {
    console.error("Error deleting or updating field:", error);
  }
}
const fetchAdminDataWithJoin = async (mainCollectionName, joinCollectionName, pageSize, lastDoc, filterField,filterCondition, filterValue,LoggedInuser) => {
  try {
    const mainCollectionRef = collection(db, mainCollectionName);
    const queryConstraints = [limit(pageSize)];

    if (lastDoc) {
      queryConstraints.push(startAfter(lastDoc));
    }
    /*if (filterField && filterValue) {
      queryConstraints.push(where(filterField, filterCondition, filterValue));
    }*/
    if (filterField && filterCondition && filterValue !== undefined) {
      if (
        ["in", "array-contains-any", "not-in"].includes(filterCondition)
      ) {
        if (!Array.isArray(filterValue)) {
          throw new Error(
            `"${filterCondition}" requires filterValue to be an array`
          );
        }

        if (filterValue.length === 0) {
          // Firestore crashes on empty array
          return { data: [], lastDoc: null };
        }

        if (filterValue.length > 10) {
          throw new Error(
            `"${filterCondition}" supports maximum 10 values`
          );
        }

        queryConstraints.push(
          where(filterField, filterCondition, filterValue)
        );
      } else {
        queryConstraints.push(
          where(filterField, filterCondition, filterValue)
        );
      }
    }
    
    const q = query(mainCollectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const mainCollectionData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    const joinDataPromises = mainCollectionData.map(async item => {
      const joinQuery = query(collection(db, joinCollectionName), where('uid', '==', item.uid));
      const joinSnapshot = await getDocs(joinQuery);
      return joinSnapshot.docs.map(doc => ({ ...item, joinData: doc.data() }));
    });

    const joinedData = await Promise.all(joinDataPromises);
    return {
      data: joinedData.flat(),
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    };
  } catch (error) {
    console.error('Error fetching data: ', error);
    throw error;
  }
};
const fetchTotalRecordsCount = async (mainCollectionName, filterField, filterValue) => {
  try {
    const mainCollectionRef = collection(db, mainCollectionName);
    const queryConstraints = [];

    if (filterField && filterValue) {
      queryConstraints.push(where(filterField, '==', filterValue));
    }

    const q = query(mainCollectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.size; // Total number of records
  } catch (error) {
    console.error('Error fetching total count: ', error);
    throw error;
  }
};
const getRecordsWithEnrollmentDateAfter = async (sourceCollection,FieldName,FieldCondition,FieldValue) => {
  try {
    // Convert the comparisonDate to Firebase Timestamp
    const timestamp = Timestamp.fromDate(new Date(FieldValue));
	//"RotationData.Rotations.Rotation0.EnrollmentDate"
    // Create a query to get records where EnrollmentDate > the given timestamp

    const recordsQuery = query(
      collection(db, sourceCollection),
      where(FieldName, FieldCondition, timestamp)
    );
 console.log("recordsQuery-->",recordsQuery)
    // Execute the query and fetch the results
    const querySnapshot = await getDocs(recordsQuery);

    // Process the results
    querySnapshot.forEach((doc) => {
      console.log(`Document ID: ${doc.id}`, doc.data());
    });

  } catch (error) {
    console.error("Error fetching records:", error);
  }
};
export {handleUpdateOrCreateByConditions, getjointabledata,updateAllHospitalProgramInfoDocs,addOrUpdateDocIds,handleAdd,updateWhereFieldEquals,removePidFromHospital,DeleteDocumentWhere,DeleteDocumentWhereMultiple,deleteFieldFromDocumentWhere,fetchAllJoinData,SelectSuperComplexConditionsForView,deleteDuplicateNotes,deleteFieldFromDocument,getMaxStudentUniqueId,copyFieldToAnotherCollection,updateOrAddFieldInCollection,SelectWithComplexConditionsJoin,updateTimestampsAndAddCreatedAt,updateTimestampsInCollection,deletedocumentfromid,handleUpdateEx,SelectWithComplexConditions,SelectWithWhereAnd,restructureRotationDataResearch,restructureRotationDataMatch,getRecordsWithEnrollmentDateAfter,Timestamp,restructureRotationData2,SelectWithWhereOrAndFetchProfiles,copyCollection,restructureRotationData,SelectWithWhereOr,handleUpdateOrCreateByField, copyDocument,FetchUniqueData,fetchPaginatedDataWithJoin,fetchTotalRecordsCount,fetchAdminDataWithJoin,handleUpdate,FetchDataFromCollection,FetchUniqueDataFull,deleteUser };

