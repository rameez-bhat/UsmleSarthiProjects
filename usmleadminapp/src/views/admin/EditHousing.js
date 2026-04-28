import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
Box,
Grid,
TextField,
Button,
Typography,
IconButton,
Tooltip,
Select,
MenuItem,
InputLabel,
Paper
} from "@mui/material";
import Select1 from "react-select";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

import { Country, State, City } from "country-state-city";

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject  } from "firebase/storage";

import {
collection,
getDocs,
setDoc,
doc,
query,
updateDoc,
addDoc,
where
} from "firebase/firestore";

import { db } from "../../firebase";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import JoditEditor from "jodit-react";

import dayjs from "dayjs";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import "../../components/css/style.css";
import { useLoading } from "../../layout/LoadingContext";

export default function EditRotation() {

const { match_id } = useParams();
const navigate = useNavigate();

const { TooltipsPopovers, showLoading, hideLoading, Timestamp, SelectWithWhereAnd } = useLoading();

const [loading, setLoading] = useState(true);

const [formdata, setformdata] = useState({
country:"US",
FeaturesArray:[],
images:[]
});

const [errors,setErrors] = useState({});
const [docId,setDocId] = useState(null);
const [countryList] = useState(Country.getAllCountries());
const [stateList,setStateList] = useState([]);
const [cityList,setCityList] = useState([]);
const [RotationList, setRotationList] = useState({});

useEffect(()=>{

const states = State.getStatesOfCountry("US");
setStateList(states);

loadRotation();

},[]);

const loadRotation = async () => {
try {
if(match_id)
{
	const q = query(collection(db,"Housings"),where("housingId","==",match_id));
	const snapshot = await getDocs(q);
	let WhereOrObject=[{"name":"DoctorAssigned","condition":"!=","value":"they"}];
    const results = await SelectWithWhereAnd("Rotations", WhereOrObject);	
   	if(results.status=="success")
    {
    		const options = results.data.map(item => ({
  label: item.location_code,
  value: item.location_code
}));
    		setRotationList(options)
    }
	if(!snapshot.empty)
	{
		const docSnap = snapshot.docs[0];
		setDocId(docSnap.id);
		const docData = docSnap.data();
		let AlllocationCodes = [];

if (docData?.LocationCodes) {
  AlllocationCodes = Object.keys(docData.LocationCodes).map(code => ({
    value: code,
    label: code
  }));
}
//docData.LocationCodes=AlllocationCodes
		setformdata(prev=>({
			...prev,
			...docData,
			LocationCodes: AlllocationCodes
			}));
		if(docData.country)
		{
			const states = State.getStatesOfCountry("US");
			setStateList(states);
		}
		
		if(docData.state)
		{
			const stateObj = State.getStatesOfCountry("US").find(s => s.name === docData.state || s.isoCode === docData.state);
			if(stateObj)
			{
				const cities = City.getCitiesOfState("US", stateObj.isoCode);
				setCityList(cities);
			}
		}

	}
}
else
{
	const newDocRef = doc(collection(db,"Housings"));
	setDocId(newDocRef.id);
}

}catch(err){

console.error(err);

}

setLoading(false);

};

const onchangeForm=(event,name)=>{


let value; 
  if(typeof event.target!="undefined")
  { 
    value=event.target.value; 
  } 
  else if(typeof event.$d!="undefined") 
  { 
    if(name=="discountFrom")
    {
      let dt = new Date(event);
      dt.setHours(0, 0, 0, 0); 
      value=Timestamp.fromDate(dt);
    }
    else if(name=="discountTo")
    {
      let dt = new Date(event);
      dt.setHours(23, 59, 59, 999); 
      value=Timestamp.fromDate(dt);
    }
    
  }
  else if(typeof event.label!="undefined") 
  { 
    value=event; 
  } 
  else if(typeof event[0]!="undefined") 
  { 
    value=event; 
  } 
  if(name=="rank")
  {
  	value=Number(event.target.value); 
  }
 

setformdata(prev=>({
...prev,
[name]:value
}));

};

const handleCountryChange=(e)=>{

const countryCode=e.target.value;

setformdata(prev=>({
...prev,
country:countryCode,
state:"",
city:""
}));

const states=State.getStatesOfCountry(countryCode);

setStateList(states);

setCityList([]);

};

const handleStateChange=(e)=>{

const stateCode=e.target.value;

setformdata(prev=>({
...prev,
state:stateCode,
city:""
}));

const cities=City.getCitiesOfState(formdata.country,stateCode);

setCityList(cities);

};

const handleCityChange=(e)=>{

setformdata(prev=>({
...prev,
city:e.target.value
}));

};

const addFeature=()=>{

setformdata(prev=>({

...prev,

FeaturesArray:[...(prev.FeaturesArray||[]),{title:"",contentHtml:""}]

}));

};

const updateFeature=(index,field,value)=>{

setformdata(prev=>{

const updated=[...prev.FeaturesArray];

updated[index][field]=value;

return {...prev,FeaturesArray:updated};

});

};

const deleteFeature=(index)=>{

setformdata(prev=>({

...prev,

Features:prev.FeaturesArray.filter((_,i)=>i!==index)

}));

};

const onDragEnd=(result)=>{

if(!result.destination) return;

setformdata(prev=>{

const updated=[...prev.FeaturesArray];

const [moved]=updated.splice(result.source.index,1);

updated.splice(result.destination.index,0,moved);

return {...prev,FeaturesArray:updated};

});

};

const handleMultipleImagesUpload = async (e)=>{

const files=Array.from(e.target.files);

if(!files.length) return;

const storage=getStorage();

showLoading();

try{

const urls=[];

for(const file of files){

const storageRef=ref(storage,`housingaccomodations/${docId}/rentals/${Date.now()}_${file.name}`);

await uploadBytes(storageRef,file);

const url=await getDownloadURL(storageRef);

urls.push(url);

}

setformdata(prev=>({

...prev,

images:[...(prev.images||[]),...urls]

}));

}catch(err){

console.error(err);

}finally{

hideLoading();

}

};
const validateForm = () => {

let newErrors = {};

if(!formdata.title || formdata.title.trim()==="")
newErrors.title="Housing name is required";

if(!formdata.ActiveInActive)
newErrors.ActiveInActive="Status is required";

if(!formdata.rank && formdata.rank!==0)
newErrors.rank="Rank is required";

if(!formdata.landlordName)
newErrors.landlordName="Landlord name is required";

if(!formdata.email)
newErrors.email="Email is required";

if(formdata.email && !/^\S+@\S+\.\S+$/.test(formdata.email))
newErrors.email="Invalid email format";

if(!formdata.phone)
newErrors.phone="Phone is required";

if(!formdata.country)
newErrors.country="Country required";

if(!formdata.state)
newErrors.state="State required";

if(!formdata.city)
newErrors.city="City required";

if(!formdata.zipCode)
newErrors.zipCode="ZIP code required";

if(!formdata.rent)
newErrors.rent="Rent required";

if(!formdata.minStay)
newErrors.minStay="Minimum stay required";

if(!formdata.guests)
newErrors.guests="Guests required";

if(!formdata.bedrooms)
newErrors.bedrooms="Bedrooms required";

if(formdata.hasDiscount==="yes")
{

if(!formdata.discountType)
newErrors.discountType="Discount type required";

if(!formdata.discountValue)
newErrors.discountValue="Discount value required";

if(!formdata.discountFrom)
newErrors.discountFrom="Discount start date required";

if(!formdata.discountTo)
newErrors.discountTo="Discount end date required";

if(formdata.discountFrom && formdata.discountTo)
{
if(dayjs(formdata.discountTo).isBefore(dayjs(formdata.discountFrom)))
newErrors.discountTo="End date must be after start date";
}

}

if(!formdata.images || formdata.images.length===0)
newErrors.images="Please upload at least one image";

if(formdata.FeaturesArray && formdata.FeaturesArray.length>0)
{
formdata.FeaturesArray.forEach((feat,index)=>{

if(!feat.title || feat.title.trim()==="")
newErrors[`feature_title_${index}`]="Feature title required";

if(!feat.contentHtml || feat.contentHtml.trim()==="")
newErrors[`feature_content_${index}`]="Feature description required";

});
}
console.log("newErrors----->",newErrors)
setErrors(newErrors);

return Object.keys(newErrors).length===0;

};
/*const deleteImage=(index)=>{

const updated=[...(formdata.images||[])];

updated.splice(index,1);

setformdata(prev=>({

...prev,

images:updated

}));

};*/
const migrateHousingFeatures = async () => {

try {

showLoading();

const snapshot = await getDocs(collection(db, "Housings"));

const excludedFields = [
"title","ActiveInActive","rank","landlordName","email","phone",
"country","state","city","zipCode","rent","minStay",
"guests","bedrooms","images","FeaturesArray","housingId",
"hasDiscount","discountType","discountValue",
"discountFrom","discountTo","createdAt","updatedAt"
];

for (const document of snapshot.docs) {

const docData = document.data();
const docRef = doc(db, "Housings", document.id);

let features = [];

Object.keys(docData).forEach(key => {

if (!excludedFields.includes(key) && docData[key] !== "" && docData[key] !== null) {

features.push({
title: key.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase()),
contentHtml: String(docData[key])
});

}

});

await updateDoc(docRef, {
FeaturesArray: features
});

console.log("Updated:", document.id);

}

alert("Migration completed successfully");

} catch (err) {

console.error("Migration error:", err);

} finally {

hideLoading();

}

};
const deleteImage = async (index) => {

try{

const storage = getStorage();

const imageUrl = formdata.images[index];

// Convert URL to storage path
const imageRef = ref(storage, imageUrl);

await deleteObject(imageRef);

const updated = [...(formdata.images || [])];
updated.splice(index,1);

setformdata(prev => ({
...prev,
images: updated
}));

}catch(err){

console.error("Error deleting image:",err);

}

};

const saveHousing = async () => {
if(!validateForm())
{
window.scrollTo(0,0);
return;
}
showLoading();
const locationMap = {};

(formdata?.LocationCodes || []).forEach(item => {
  if (item?.value) {
    locationMap[item.value] = item.value;
  }
});
try{
console.log("formdata----->",formdata)
if(docId){
console.log("formdata----->",formdata)
// UPDATE EXISTING
await updateDoc(
doc(db,"Housings",docId),
{
...formdata,
LocationCodes: locationMap,
updatedAt:new Date()
}
);

alert("Housing updated successfully");

}else{

// CREATE NEW
const newDoc = await addDoc(
collection(db,"Housings"),
{
...formdata,
LocationCodes: locationMap,
createdAt:new Date()
}
);
await updateDoc(newDoc,{
housingId:newDoc.id
});

setDocId(newDoc.id);

alert("Housing created successfully");

}

}catch(err){

console.error(err);

alert("Error saving housing");

}

hideLoading();

};

if(loading) return <h3>Loading...</h3>;

return(

<Box p={3}>

<Typography variant="h5" gutterBottom>

Edit/Add Housing ({match_id})

</Typography>

<Box mt={5}>

<Typography variant="h6">Accommodation Details</Typography>

<Grid container spacing={2} mt={1}>
<Grid item xs={12} sm={6}>
<TextField

label="Housing Name"

fullWidth

value={formdata.title ||""}

onChange={(e)=>onchangeForm(e,"title")}
error={!!errors.title}
helperText={errors.title}

/>

</Grid>
<Grid item xs={12} sm={6}>
                <Select1
                fullWidth
        value={formdata?.LocationCodes}
        variant="outlined"
        options={RotationList}
        placeholder="Linked Rotation"
        label="Linked Rotation"
        onChange={(event) => onchangeForm(event, 'LocationCodes')}
        isSearchable
        isMulti
      />
      	{errors?.locationCode  && <span className="validationerror">{errors?.locationCode }</span>}
               </Grid>
<Grid item xs={12} sm={6}>

            <Select
              fullWidth
              label="Status Active/Inactive"
              value={formdata?.ActiveInActive || ''}
              onChange={(event) => onchangeForm(event, 'ActiveInActive')}
              error={!!errors.ActiveInActive}
			helperText={errors.ActiveInActive}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
            {errors[`ActiveInActive`]  && <span className="validationerror">{errors[`ActiveInActive`] }</span>}
  
          </Grid>
<Grid item xs={12} sm={6}>
            <InputLabel>View(Frontend) Order Number</InputLabel>
            <TextField
        type="number"
        fullWidth
        value={formdata.rank}
        onChange={(event) => onchangeForm(event, "rank")}
        error={!!errors.rank}
		helperText={errors.rank}
      />
       {errors.rank  && <span className="validationerror">{errors.rank }</span>}
          </Grid>
<Grid item xs={12} sm={6}>
            <InputLabel>Land Lord Name</InputLabel>
            <TextField
        type="text"
        fullWidth
        value={formdata.landlordName}
        onChange={(event) => onchangeForm(event, "landlordName")}
        error={!!errors.landlordName}
		helperText={errors.landlordName}
      />
       {errors.landlordName  && <span className="validationerror">{errors.landlordName }</span>}
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputLabel>LandLord Email</InputLabel>
            <TextField
        type="email"
        fullWidth
        value={formdata.email}
        onChange={(event) => onchangeForm(event, "email")}
        error={!!errors.email}
		helperText={errors.email}
      />
       {errors.email  && <span className="validationerror">{errors.email }</span>}
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputLabel>LandLord Phone</InputLabel>
            <TextField
        type="email"
        fullWidth
        value={formdata.phone}
        onChange={(event) => onchangeForm(event, "phone")}
        error={!!errors.phone}
		helperText={errors.phone}
      />
       {errors.phone  && <span className="validationerror">{errors.phone }</span>}
          </Grid>
<Grid item xs={12} sm={4}>

<InputLabel>Country</InputLabel>

<Select

fullWidth

value={formdata.country||""}

onChange={handleCountryChange}
error={!!errors.country}
helperText={errors.country}

>

{countryList.map(c=>(

<MenuItem key={c.isoCode} value={c.isoCode}>{c.name}</MenuItem>

))}

</Select>

</Grid>

<Grid item xs={12} sm={4}>

<InputLabel>State</InputLabel>

<Select

fullWidth

value={formdata.state||""}

onChange={handleStateChange}
error={!!errors.state}
helperText={errors.state}

>

{stateList.map(s=>(

<MenuItem key={s.isoCode} value={s.name}>{s.name}</MenuItem>

))}

</Select>

</Grid>

<Grid item xs={12} sm={4}>

<InputLabel>City</InputLabel>

<Select

fullWidth

value={formdata.city ||""}

onChange={handleCityChange}
error={!!errors.city}
helperText={errors.city}

>

{cityList.map(c=>(

<MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>

))}

</Select>

</Grid>

<Grid item xs={12} sm={6}>

<TextField

label="ZIP Code"

fullWidth

value={formdata.zipCode||""}

onChange={(e)=>onchangeForm(e,"zipCode")}
error={!!errors.zipCode}
helperText={errors.zipCode}

/>

</Grid>

<Grid item xs={12} sm={6}>

<TextField

label="Rent / Month"

fullWidth

value={formdata.rent||""}

onChange={(e)=>onchangeForm(e,"rent")}
error={!!errors.rent}
helperText={errors.rent}

/>

</Grid>
<Grid item xs={12} sm={6}>

<TextField
type="number"

label="Minimum Length Of Stay(in Days)"

fullWidth

value={formdata.minStay || ""}

onChange={(e)=>onchangeForm(e,"minStay")}

/>

</Grid>
<Grid item xs={12} sm={6}>

<TextField
type="number"
label="Max # Of Guests Allowed."

fullWidth

value={formdata.guests || ""}

onChange={(e)=>onchangeForm(e,"guests")}

/>

</Grid>
<Grid item xs={12} sm={6}>

<TextField
type="number"
label="# Of Bed Rooms."

fullWidth

value={formdata.bedrooms || ""}

onChange={(e)=>onchangeForm(e,"bedrooms")}

/>

</Grid>
{/* ------------- DISCOUNT SECTION ----------------- */}
<Grid item xs={12} sm={6}>
  <InputLabel>Add Discount?</InputLabel>
  <Select
    fullWidth
    value={formdata.hasDiscount}
    id="hasDiscount"
    onChange={(event) => onchangeForm(event, "hasDiscount" )}
  >
    <MenuItem value="no">No</MenuItem>
    <MenuItem value="yes">Yes</MenuItem>
  </Select>
</Grid>

{formdata.hasDiscount === "yes" && (
  <>
    <Grid item xs={12} sm={6}>
      <InputLabel>Discount Type</InputLabel>
      <Select
        fullWidth
        id="discountType"
        value={formdata.discountType}
        onChange={(event) => onchangeForm(event, "discountType" )}
      >
        <MenuItem value="amount">Amount</MenuItem>
        <MenuItem value="percentage">Percentage</MenuItem>
      </Select>
      {errors.discountType  && <span className="validationerror">{errors.discountType }</span>}
    </Grid>

    <Grid item xs={12} sm={6}>
      <InputLabel>Discount Value</InputLabel>
      <TextField
        type="number"
        fullWidth
        id="discountValue"
        value={formdata.discountValue}
        onChange={(event) => onchangeForm(event, "discountValue")}
      />
      {errors.discountValue  && <span className="validationerror">{errors.discountValue }</span>}
    </Grid>

    <Grid item xs={12} sm={6}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <InputLabel>Discount From</InputLabel>
        <DatePicker
        id="discountFrom"
          value={formdata.discountFrom ? dayjs(formdata.discountFrom.toDate?.() || formdata.discountFrom) : null}
          onChange={(event) => onchangeForm(event, "discountFrom")}
          slotProps={{ textField: { fullWidth: true } }}
        />
      </LocalizationProvider>
      {errors.discountFrom  && <span className="validationerror">{errors.discountFrom }</span>}
    </Grid>

    <Grid item xs={12} sm={6}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <InputLabel>Discount To</InputLabel>
        <DatePicker
        	id="discountTo"
          value={formdata.discountTo ? dayjs(formdata.discountTo.toDate?.() || formdata.discountTo) : null}
          onChange={(event) => onchangeForm(event, "discountTo")}
          slotProps={{ textField: { fullWidth: true } }}
        />
      </LocalizationProvider>
      {errors.discountTo  && <span className="validationerror">{errors.discountTo }</span>}
    </Grid>
  </>
)}
<Grid item xs={12}>

<InputLabel>Rental Images</InputLabel>

<Button variant="outlined" component="label" fullWidth>

Upload Images

<input

type="file"

hidden

multiple

accept="image/*"

onChange={handleMultipleImagesUpload}

/>

</Button>

<Box mt={2} display="flex" gap={2} flexWrap="wrap">

{formdata.images?.map((img,index)=>(

<Box key={index} position="relative">

<img

src={img}

style={{width:"120px",borderRadius:"8px"}}

/>

<IconButton

size="small"

color="error"

onClick={()=>deleteImage(index)}

style={{position:"absolute",top:-10,right:-10}}

>

<DeleteIcon fontSize="small"/>

</IconButton>

</Box>

))}

</Box>

</Grid>

</Grid>

</Box>

<Box mt={4} display="flex" justifyContent="flex-end">

<IconButton color="primary" onClick={addFeature}>

<AddIcon/> Add Feature

</IconButton>

</Box>

<DragDropContext onDragEnd={onDragEnd}>

<Droppable droppableId="features">

{provided=>(

<Box ref={provided.innerRef} {...provided.droppableProps}>

{formdata.FeaturesArray.map((feat,index)=>(

<Draggable key={index} draggableId={`feat-${index}`} index={index}>

{provided=>(

<Paper

ref={provided.innerRef}

{...provided.draggableProps}

sx={{p:2,my:2}}

>

<Box display="flex" alignItems="center">

<Box {...provided.dragHandleProps} mr={1}>

<DragIndicatorIcon/>

</Box>

<Typography>Feature {index+1}</Typography>

<Box flexGrow={1}/>

<IconButton color="error" onClick={()=>deleteFeature(index)}>

<DeleteIcon/>

</IconButton>

</Box>

<TextField

label="Title"

fullWidth

sx={{my:2}}

value={feat.title}

onChange={(e)=>updateFeature(index,"title",e.target.value)}

/>

<JoditEditor

value={feat.contentHtml}

onBlur={(newContent)=>updateFeature(index,"contentHtml",newContent)}

/>

</Paper>

)}

</Draggable>

))}

{provided.placeholder}

</Box>

)}

</Droppable>

</DragDropContext>

<Button

variant="contained"

fullWidth

sx={{mt:4}}

onClick={saveHousing}

>

Save Changes

</Button>

</Box>

);

}