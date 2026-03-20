// src/views/Whatsapp/ConversationPage.js

import React, { useEffect, useState } from "react";
import { db } from "../../firebase"; // adjust path
import CIcon from '@coreui/icons-react'
import {
  cibInstagram,
  cibWhatsapp,
} from '@coreui/icons'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CListGroup,
  CListGroupItem,
  CSpinner,
} from "@coreui/react";
import {
  Typography,
  CircularProgress,
  Box,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Grid,
  Button,
  Select,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,IconButton
} from '@mui/material';
import { useLoading } from '../../layout/LoadingContext';

const ConversationPage = (ActualAuthUser) => {
  const ActualUser = ActualAuthUser.ActualUser;
  const { showLoading, hideLoading,sendWhatsappMessage,sendInstagramMessage } = useLoading();
  const [conversations, setConversations] = useState([]);
  const [OperationMessage, setOperationMessage] = useState({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");

  // Load conversation list (unread or recent)
  useEffect(() => {
    const conversationsRef = collection(db, "WhatsappConversationsUnread");
    const q = query(conversationsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConversations(convs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (!selectedChat) return;
console.log("selectedChat---->",selectedChat)
let messagesRef
    if(selectedChat.MessageSourceActual=="Instagram")
    {
        messagesRef = collection(
      db,
      "WhatsappConversations",
     selectedChat.instagramsenderid,
      "Messages"
    );
    }
    else
    {
       messagesRef = collection(
      db,
      "WhatsappConversations",
     selectedChat.from,
      "Messages"
    );
    }

    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedChat]);
const handleSendMessage = async () => {
console.log("ActualUser---->",ActualUser)
  if (!replyText.trim() || !selectedChat) return;

  const newMessage = {
    message: replyText,
    from: "Admin", // or your logged-in user
    MessageSource: "Admin",
    createdAt: serverTimestamp(),
  };
  const whatsappNumber=selectedChat.from;
   const IncommingMessageData={};
      if(selectedChat.MessageSourceActual=="Instagram")
      {
          IncommingMessageData["from"]="Usmle Sarthi";
          IncommingMessageData["message"]=replyText;
          IncommingMessageData["createdAt"]=serverTimestamp();
          IncommingMessageData["MessageSource"]="Admin";
          IncommingMessageData["MessageSourceActual"]=selectedChat.MessageSourceActual?selectedChat.MessageSourceActual:'';
          IncommingMessageData["MessageTransactionStatus"]="";
          IncommingMessageData["AdminDetails"]=ActualUser;
          IncommingMessageData["instagramsenderid"]=selectedChat.instagramsenderid;
          IncommingMessageData["updatedAt"]=serverTimestamp();
          IncommingMessageData["displayName"]=ActualUser.displayName;
          IncommingMessageData["readBy"]=[];
      }
      else
      {
          IncommingMessageData["from"]=selectedChat.from;
          IncommingMessageData["message"]=replyText;
          IncommingMessageData["createdAt"]=serverTimestamp();
          IncommingMessageData["MessageSource"]="Admin";
          IncommingMessageData["MessageSourceActual"]=selectedChat.MessageSourceActual?selectedChat.MessageSourceActual:'';
          IncommingMessageData["MessageTransactionStatus"]="";
          IncommingMessageData["AdminDetails"]=ActualUser;
          IncommingMessageData["updatedAt"]=serverTimestamp();
          IncommingMessageData["displayName"]=ActualUser.displayName;
          IncommingMessageData["readBy"]=[];
      }

          showLoading();
      let WhatsAppResponse;
      console.log("selectedChat----->",selectedChat)
      if(selectedChat.instagramsenderid)
      {
        WhatsAppResponse=await sendInstagramMessage(selectedChat.instagramsenderid,replyText)
      }
      else
      {
        WhatsAppResponse=await sendWhatsappMessage(whatsappNumber,replyText)
      }

    	console.log("WhatsAppResponse--->",WhatsAppResponse)
    	if(WhatsAppResponse.status=="success")
      {
        IncommingMessageData['id']=WhatsAppResponse.messageid;
    	  IncommingMessageData['documentid']=WhatsAppResponse.messageid;
    	  if(selectedChat.MessageSourceActual=="Instagram")
        {
          await setDoc(
            doc(db, "WhatsappConversations", selectedChat.instagramsenderid, "Messages", IncommingMessageData['id']),
            IncommingMessageData
            );
          await setDoc(
              doc(db, "WhatsappConversationsUnread", selectedChat.instagramsenderid),
              IncommingMessageData
          );
        }
        else
        {
          await setDoc(
            doc(db, "WhatsappConversations", selectedChat.from, "Messages", IncommingMessageData['id']),
            IncommingMessageData
            );
          await setDoc(
              doc(db, "WhatsappConversationsUnread", selectedChat.from),
              IncommingMessageData
          );
        }
  setReplyText(""); // clear input
  }
  else
  {
      setOperationMessage(WhatsAppResponse.messageid);
    	setOpen(true);
  }
hideLoading();

};
const handleCancel = () => {
    setOpen(false);
  };
  return (
    <CRow>
      {/* Left Side: Conversation List */}
      <CCol md={4}>
        <CCard className="h-100">
          <CCardHeader>
            <strong>Conversations</strong>
          </CCardHeader>
          <CCardBody className="p-0" style={{
    maxHeight: "calc(100vh - 200px)", // ✅ Adjusts with screen size
    overflowY: "auto",               // ✅ Enables scrolling
  }}>
            {loading ? (
              <div className="d-flex justify-content-center p-3">
                <CSpinner color="primary" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="p-3">No conversations found.</p>
            ) : (
              <CListGroup flush>
                {conversations.map((conv) => (
                  <CListGroupItem
                    key={conv.id}
                    action
                    active={selectedChat?.id === conv.id}
                    onClick={() => setSelectedChat(conv)}
                  >
                    <div>
                      <b>{conv.MessageSourceActual=="Instagram"? conv.instagramsenderid:conv.from || conv.displayName || conv.id}</b>
                    </div>
                    <div className="small text-muted text-truncate">
                      <div class="nav-item" style={{ width: "17px", height: "20px", display:"inline-table",marginRight:"10px"}}><CIcon
    icon={conv.MessageSourceActual === "Instagram" ? cibInstagram : cibWhatsapp}
    customClassName="nav-icon"
  /></div>From  :{ conv.MessageSourceActual=="Instagram"? conv.from: conv.displayName || conv.from}

                    </div>
                    <div className="small text-muted text-truncate">
                      {conv.message || conv.Notes || "New message..."}
                    </div>
                  </CListGroupItem>
                ))}
              </CListGroup>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Right Side: Chat Screen */}
<CCol md={8}>
  <CCard className="h-100 d-flex flex-column">
    <CCardHeader>
      <strong>
        {selectedChat
          ? `Chat with ${selectedChat.from || selectedChat.instagramsenderid || selectedChat.displayName || selectedChat.id}`
          : "Select a conversation"}
      </strong>
    </CCardHeader>

    {/* Chat Body */}
    <CCardBody
      className="chat-body flex-grow-1 d-flex flex-column"
      style={{ maxHeight: "60vh", overflowY: "auto" }}
    >
      {!selectedChat ? (
        <p className="text-center mt-3">Select a conversation to start chatting</p>
      ) : messages.length === 0 ? (
        <p className="text-center mt-3">No messages found.</p>
      ) : (
        <CListGroup flush>
  {messages.map((msg) => (
    <CListGroupItem
      key={msg.id}
      className={`border-0 d-flex ${
        msg.MessageSource === "Whatsapp" || msg.MessageSource === "Instagram" ? "justify-content-start" : "justify-content-end"
      }`}
    >
     <div
  className={`p-2 rounded-3 ${
    msg.MessageSource === "Whatsapp"  || msg.MessageSource === "Instagram"
      ? "bg-secondary text-white"
      : "bg-primary text-white"
  }`}
  style={{ maxWidth: "70%", whiteSpace: "pre-line" }} // ✅ Preserve line breaks
>
  {/* Message Text */}
  {/*<div>{msg.message || msg.Notes}</div>*/}
  {(msg.message || msg.Notes) && (
  <div className="mb-1">{msg.message || msg.Notes}</div>
)}

{/* Media Preview */}
{msg.mediaUrl && msg.mediaType === "image" && (
  <img
    src={msg.mediaUrl}
    alt="media"
    style={{
      maxWidth: "220px",
      borderRadius: "8px",
      marginTop: "6px",
    }}
  />
)}

{msg.mediaUrl && msg.mediaType === "video" && (
  <video
    controls
    style={{
      maxWidth: "240px",
      marginTop: "6px",
      borderRadius: "8px",
    }}
  >
    <source src={msg.mediaUrl} />
    Your browser does not support video.
  </video>
)}

{msg.mediaUrl && msg.mediaType === "audio" && (
  <audio controls style={{ marginTop: "6px", width: "100%" }}>
    <source src={msg.mediaUrl} />
    Your browser does not support audio.
  </audio>
)}

{msg.mediaUrl && msg.mediaType === "document" && (
  <a
    href={msg.mediaUrl}
    target="_blank"
    rel="noreferrer"
    className="btn btn-sm btn-outline-light mt-2"
  >
    📄 View Document
  </a>
)}
  
  
  

  {/* Timestamp */}
  <div className="small text-light text-end mt-1">
    {msg.createdAt?.toDate
      ? msg.createdAt.toDate().toLocaleString()
      : ""}
  </div>

  {/* Status badge for Admin-sent messages */}
  {msg.MessageSource !== "Whatsapp" && msg.MessageTransactionStatus && (
    <div className="small text-end mt-1">
      <span
        className={`badge ${
          msg.MessageTransactionStatus === "sent"
            ? "bg-info"
            : msg.MessageTransactionStatus === "delivered"
            ? "bg-warning text-dark"
            : msg.MessageTransactionStatus === "read"
            ? "bg-success"
            : msg.MessageTransactionStatus === "failed"
            ? "bg-danger"
            : "bg-secondary"
        }`}
      >
        {msg.MessageTransactionStatus}
      </span>
    </div>
  )}
</div>
    </CListGroupItem>
  ))}
</CListGroup>

      )}
    </CCardBody>

    {/* Reply Input */}
  {selectedChat && (
  <div className="p-3 border-top d-flex align-items-center">
    <textarea
  className="form-control me-2"
  placeholder="Type your reply..."
  rows={2}
  value={replyText}
  onChange={(e) => setReplyText(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }}
/>
    <button
      className="btn btn-primary"
      onClick={handleSendMessage}
      disabled={!replyText.trim()}
    >
      Send
    </button>
  </div>
)}
  </CCard>
</CCol>

 <Dialog
        open={open}
        onClose={handleCancel}

      >
        <DialogTitle>Operation Status</DialogTitle>
        <DialogContent>
          <DialogContentText>

           {OperationMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Ok
          </Button>

        </DialogActions>
      </Dialog>
    </CRow>
  );
};

export default ConversationPage;
