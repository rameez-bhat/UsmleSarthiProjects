import React, { useEffect, useRef, useState } from 'react';
import {useParams,useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { IdleTimerProvider, useIdleTimer } from 'react-idle-timer';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CButton,
  CListGroup,
  CListGroupItem,
  CFormSelect,
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CFormTextarea
} from '@coreui/react';
import dayjs from 'dayjs';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
  setDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp } from 'firebase/firestore';
  import { useLoading } from '../../layout/LoadingContext';
const ChatWindow = (ActualAuthUser) => {
	const ActualUser=ActualAuthUser.ActualUser;
	let { id } = useParams();
	let idWithoutChange=id;
	if(typeof id==="undefined")
	{
		id=ActualUser.id;
	}

  const { showLoading, hideLoading,TooltipsPopovers } = useLoading();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userData, setUserData] = useState(null);
  const [regarding, setRegarding] = useState('Rotation');
  const [expandedSeenBy, setExpandedSeenBy] = useState({});
	const [seenByNames, setSeenByNames] = useState({});
	const [openDropdown, setOpenDropdown] = useState(null);
	const [isTabActive, setIsTabActive] = useState(true);

  const onActive = () => setIsTabActive(true);
  const onIdle = () => setIsTabActive(false);
  const messagesEndRef = useRef(null);


  const services = ['Rotation', 'Match', 'Research'];
useEffect(() => {
const qq = query(
    collection(db, 'Users'),
    where('uid', '==', id)
  );
  const unsubscribeUser = onSnapshot(qq, (snapshot) => {
    if (!snapshot.empty) {
    	const GetData=snapshot.docs[0].data();
    	if(typeof GetData.followback==="undefined")
        {
        	GetData.followback="yes";
        }
      setUserData(GetData);
    }
  });

  return () => unsubscribeUser();
}, []);
useEffect(() => {
  console.log("Tab focused:", isTabActive);
}, [isTabActive]);
  useEffect( () => {
    const q = query(
    collection(db, 'UserCommonServiceNotes'),
    where('uid', '==', id),
    where('NoteType', '==', "Questions"),
    orderBy('NotesDate',"asc")
  );


    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      if(msgs.length)
      {
      	setRegarding(msgs[msgs.length-1]?.NoteRegarding)
      }

      setMessages(msgs);
      if (isTabActive)
      {
      	markMessagesAsRead(msgs);
    	}
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [isTabActive]);
const fetchSeenByNames = async (msgId, readByUids) => {
  if (seenByNames[msgId]) return; // already fetched

  const usersRef = collection(db, 'Users');
  const q = query(usersRef, where('uid', 'in', readByUids));
  const snapshot = await getDocs(q);
  const names = snapshot.docs.map(doc => doc.data().displayName || doc.data().email || doc.id);
  setSeenByNames(prev => ({ ...prev, [msgId]: names }));
};
  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || regarding.trim()==='') return;
    showLoading();
	const DataToBeAdded={
      NotesDate: Timestamp.fromDate(new Date()),
        NoteType: 'Questions',
        TeamMember: '',
        MessageSource: "Website",
        Notes: input,
        CrossSell: '',
        NoteRegarding: regarding,
        ActionItem: 'For Both',
        AddedBy: {
          displayName: ActualUser.displayName,
          email: ActualUser.email,
          id: ActualUser.id,
          UserType: 'Student',
        },
    	uid : id,
       email : userData.email,
      createdAt: serverTimestamp(),
      readBy: [], // sender has read their own message
    };
    await setDoc(doc(db, 'UserCommonServiceNotesRecent', id), DataToBeAdded, { merge: true });
    await addDoc(collection(db, 'UserCommonServiceNotes'), DataToBeAdded);
    setInput('');
    hideLoading();
  };

  const markMessagesAsRead = async (msgs) => {
    msgs.forEach(async (msg) => {
      if (!msg.readBy?.includes(id) && msg?.AddedBy?.id!=id) {
        const msgRef = doc(db, 'UserCommonServiceNotes', msg.id);
        await updateDoc(msgRef, {
          readBy: [...(msg.readBy || []), id],
        });
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
   <IdleTimerProvider onActive={onActive} onIdle={onIdle} timeout={3000}>
    <CCard className="w-100" style={{ maxWidth: '100%', margin: 'auto', height: '85vh', display: 'flex', flexDirection: 'column' }}>
      <CCardHeader><strong>Chat Room</strong></CCardHeader>

      <div className="px-3 py-2">
        <CFormSelect
          value={regarding}
          onChange={(e) => setRegarding(e.target.value)}
          label="Messaging Regarding"
        >
          {services.map(service => (
            <option key={service} value={service}>{service}</option>
          ))}
        </CFormSelect>
      </div>

      <CCardBody className="overflow-auto" style={{ flex: 1 }}>
        <CListGroup flush>
          {messages.map((msg) => (
            <CListGroupItem key={msg.id} className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{msg?.AddedBy?.displayName}({msg?.AddedBy.id===id? "You": msg?.AddedBy?.UserType || "N/A"})</strong>:
                <span className="ms-2" style={{ whiteSpace: 'pre-wrap' }}>{msg.Notes}</span>
                <div className="text-muted small">Time: {msg?.NotesDate ? dayjs(msg.NotesDate.seconds * 1000).format('MMM D, YYYY h:mm A') : ''}</div>
                <div className="text-muted small">Regarding: {msg.NoteRegarding}</div>

              </div>
               <div className="d-flex flex-column align-items-end ms-3">
               {msg?.AddedBy?.id === id && (
               <>

                  <CBadge color={msg.readBy?.length > 0 ? 'success' : 'secondary'} className="me-2">
                    {msg.readBy?.length > 0 ? 'Seen' : 'Sent'}
                  </CBadge>
                   {msg.readBy?.length > 0 && (
      <CDropdown
        alignment="end"
        visible={openDropdown === msg.id}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <CDropdownToggle
          color="light"
          size="sm"
          onClick={async () => {
            if (openDropdown === msg.id) {
              setOpenDropdown(null);
            } else {
              setOpenDropdown(msg.id);
              await fetchSeenByNames(msg.id, msg.readBy);
            }
          }}
        >
          Seen by ({msg.readBy.length})
        </CDropdownToggle>
        <CDropdownMenu className="p-2">
          {seenByNames[msg.id]?.length > 0 ? (
            seenByNames[msg.id].map((name, i) => (
              <CDropdownItem key={i} className="text-dark">{name}</CDropdownItem>
            ))
          ) : (
            <CDropdownItem disabled>Loading...</CDropdownItem>
          )}
        </CDropdownMenu>
      </CDropdown>
    )}
    </>
                )}
             </div>
            </CListGroupItem>
          ))}
          <div ref={messagesEndRef} />
        </CListGroup>
      </CCardBody>
{userData?.followback==="yes" && (
      <CForm onSubmit={handleSend} className="d-flex p-2">
        <CFormTextarea
  rows={2}
  value={input}
  valueKey={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Type your message"
  className="bg-light border border-primary rounded px-3 py-2 shadow-sm"
  style={{ fontSize: '1rem', resize: 'none' }}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  }}
/>
        <CButton type="submit" color="primary" className="ms-2">Send</CButton>
      </CForm>
    )}
    </CCard>
    </IdleTimerProvider>
  );
};

export default ChatWindow;
