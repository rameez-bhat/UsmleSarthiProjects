
 // src/views/Whatsapp/ConversationPage.js

import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import { db } from "../../firebase";

import CIcon from "@coreui/icons-react";

import {
  cibInstagram,
  cibWhatsapp,
} from "@coreui/icons";

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  serverTimestamp,
  Timestamp,
  writeBatch,
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
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import { useLoading } from "../../layout/LoadingContext";

// Calculate the date three calendar months ago.
const getThreeMonthsAgo = () => {
  const now = new Date();

  const date = new Date(now);

  date.setDate(1);

  date.setMonth(date.getMonth() - 3);

  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  date.setDate(
    Math.min(now.getDate(), lastDay)
  );

  return Timestamp.fromDate(date);
};

const ConversationPage = ({ ActualUser }) => {
  const {
    showLoading,
    hideLoading,
    sendWhatsappMessage,
    sendInstagramMessage,
  } = useLoading();

  const [conversations, setConversations] =
    useState([]);

  const [operationMessage, setOperationMessage] =
    useState("");

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const [messagesLoading, setMessagesLoading] =
    useState(false);

  const [selectedChat, setSelectedChat] =
    useState(null);

  const [messages, setMessages] = useState([]);

  const [replyText, setReplyText] = useState("");

  const [isSending, setIsSending] = useState(false);

  // Prevent duplicate message submissions.
  const sendingRef = useRef(false);

  // Keep the latest draft available to async callbacks.
  const replyTextRef = useRef("");

  // Reference to the bottom of the chat.
  const messagesEndRef = useRef(null);

  // --------------------------------------------------
  // LOAD CONVERSATIONS FROM THE LAST THREE MONTHS
  // --------------------------------------------------

  useEffect(() => {
    setLoading(true);

    const cutoffDate = getThreeMonthsAgo();

    const conversationsRef = collection(
      db,
      "WhatsappConversationsUnread"
    );

    const conversationsQuery = query(
      conversationsRef,

      where(
        "updatedAt",
        ">=",
        cutoffDate
      ),

      orderBy(
        "updatedAt",
        "desc"
      )
    );

    const unsubscribe = onSnapshot(
      conversationsQuery,

      (snapshot) => {
        const convs = snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          })
        );

        setConversations(convs);

        setLoading(false);
      },

      (error) => {
        console.error(
          "Error loading conversations:",
          error
        );

        setLoading(false);

        setOperationMessage(
          error?.message ||
          "Unable to load conversations."
        );

        setOpen(true);
      }
    );

    return () => unsubscribe();
  }, []);

  // --------------------------------------------------
  // GET CONVERSATION ID
  // --------------------------------------------------

  const getConversationId = (chat) => {
    if (!chat) return null;

    if (
      chat.MessageSourceActual === "Instagram"
    ) {
      return chat.instagramsenderid || null;
    }

    return chat.from || null;
  };

  // --------------------------------------------------
  // LOAD MESSAGES FOR SELECTED CONVERSATION
  // --------------------------------------------------

  const selectedConversationId =
    getConversationId(selectedChat);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }

    setMessages([]);

    setMessagesLoading(true);

    const messagesRef = collection(
      db,
      "WhatsappConversations",
      selectedConversationId,
      "Messages"
    );

    // Load the latest 100 messages.
    const messagesQuery = query(
      messagesRef,
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      messagesQuery,

      (snapshot) => {
        const msgs = snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          })
        );

        // Display messages in chronological order.
        setMessages(msgs.reverse());

        setMessagesLoading(false);
      },

      (error) => {
        console.error(
          "Error loading messages:",
          error
        );

        setMessagesLoading(false);

        setOperationMessage(
          error?.message ||
          "Unable to load messages."
        );

        setOpen(true);
      }
    );

    return () => unsubscribe();
  }, [selectedConversationId]);

  // --------------------------------------------------
  // SCROLL TO LATEST MESSAGE
  // --------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  // --------------------------------------------------
  // HANDLE CHAT SELECTION
  // --------------------------------------------------

  const handleSelectChat = (chat) => {
    if (sendingRef.current) return;

    setSelectedChat(chat);

    replyTextRef.current = "";

    setReplyText("");
  };

  // --------------------------------------------------
  // HANDLE REPLY TEXT
  // --------------------------------------------------

  const handleReplyChange = (event) => {
    const value = event.target.value;

    replyTextRef.current = value;

    setReplyText(value);
  };

  // --------------------------------------------------
  // SEND MESSAGE
  // --------------------------------------------------

  const handleSendMessage = async () => {
    // Prevent duplicate submissions.
    if (sendingRef.current) return;

    const messageText =
      replyTextRef.current.trim();

    if (!messageText || !selectedChat) return;

    const chat = selectedChat;

    const isInstagram =
      chat.MessageSourceActual === "Instagram";

    const conversationId =
      getConversationId(chat);

    if (!conversationId) {
      setOperationMessage(
        "Conversation ID is missing."
      );

      setOpen(true);

      return;
    }

    // Lock immediately before starting the request.
    sendingRef.current = true;

    setIsSending(true);

    try {
      showLoading();

      let response;

      // ----------------------------------------------
      // SEND THROUGH WHATSAPP OR INSTAGRAM
      // ----------------------------------------------

      if (isInstagram) {
        response = await sendInstagramMessage(
          conversationId,
          messageText
        );
      } else {
        response = await sendWhatsappMessage(
          conversationId,
          messageText
        );
      }

      if (response?.status !== "success") {
        setOperationMessage(
          response?.message ||
          "Unable to send message."
        );

        setOpen(true);

        return;
      }

      if (!response.messageid) {
        throw new Error(
          "Message was sent, but no message ID was returned. Verify the conversation before retrying."
        );
      }

      // ----------------------------------------------
      // PREPARE MESSAGE DATA
      // ----------------------------------------------

      const messageData = {
        id: response.messageid,

        documentid: response.messageid,

        from: isInstagram
          ? "Usmle Sarthi"
          : chat.from,

        message: messageText,

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),

        MessageSource: "Admin",

        MessageSourceActual:
          chat.MessageSourceActual || "",

        MessageTransactionStatus: "",

        AdminDetails: ActualUser,

        displayName:
          ActualUser?.displayName || "",

        readBy: [],

        ...(isInstagram
          ? {
              instagramsenderid:
                chat.instagramsenderid,
            }
          : {}),
      };

      // ----------------------------------------------
      // FIRESTORE DOCUMENT REFERENCES
      // ----------------------------------------------

      const messageRef = doc(
        db,
        "WhatsappConversations",
        conversationId,
        "Messages",
        response.messageid
      );

      const conversationRef = doc(
        db,
        "WhatsappConversationsUnread",
        conversationId
      );

      // ----------------------------------------------
      // SAVE MESSAGE AND CONVERSATION SUMMARY
      // ----------------------------------------------

      const batch = writeBatch(db);

      batch.set(
        messageRef,
        messageData
      );

      batch.set(
        conversationRef,
        messageData
      );

      await batch.commit();

      // ----------------------------------------------
      // CLEAR INPUT AFTER SUCCESS
      // ----------------------------------------------

      // Do not clear a newer draft typed while sending.
      if (
        replyTextRef.current.trim() ===
        messageText
      ) {
        replyTextRef.current = "";

        setReplyText("");
      }

    } catch (error) {
      console.error(
        "Error sending message:",
        error
      );

      if (
        error?.code === "resource-exhausted"
      ) {
        setOperationMessage(
          "Firestore write capacity has been exceeded. " +
          "Your message may already have been sent. " +
          "Please verify the conversation before retrying."
        );
      } else {
        setOperationMessage(
          error?.message ||
          "An error occurred while sending the message. " +
          "Please verify whether it was delivered before retrying."
        );
      }

      setOpen(true);

    } finally {
      sendingRef.current = false;

      setIsSending(false);

      hideLoading();
    }
  };

  // --------------------------------------------------
  // HANDLE ENTER KEY
  // --------------------------------------------------

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();

      if (!sendingRef.current) {
        handleSendMessage();
      }
    }
  };

  // --------------------------------------------------
  // CLOSE OPERATION DIALOG
  // --------------------------------------------------

  const handleCancel = () => {
    setOpen(false);
  };

  // --------------------------------------------------
  // RENDER MESSAGE MEDIA
  // --------------------------------------------------

  const renderMessageMedia = (msg) => {
    if (!msg.mediaUrl) return null;

    if (msg.mediaType === "image") {
      return (
        <img
          src={msg.mediaUrl}
          alt="Message attachment"
          style={{
            maxWidth: "220px",
            maxHeight: "300px",
            borderRadius: "8px",
            marginTop: "6px",
            objectFit: "contain",
          }}
        />
      );
    }

    if (msg.mediaType === "video") {
      return (
        <video
          controls
          style={{
            maxWidth: "240px",
            borderRadius: "8px",
            marginTop: "6px",
          }}
        >
          <source src={msg.mediaUrl} />

          Your browser does not support video.
        </video>
      );
    }

    if (msg.mediaType === "audio") {
      return (
        <audio
          controls
          style={{
            marginTop: "6px",
            width: "100%",
          }}
        >
          <source src={msg.mediaUrl} />
        </audio>
      );
    }

    if (msg.mediaType === "document") {
      return (
        <a
          href={msg.mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm btn-outline-light mt-2"
        >
          View Document
        </a>
      );
    }

    return null;
  };

  // --------------------------------------------------
  // RENDER MESSAGE STATUS
  // --------------------------------------------------

  const renderMessageStatus = (msg) => {
    if (
      msg.MessageSource === "Whatsapp" ||
      msg.MessageSource === "Instagram" ||
      !msg.MessageTransactionStatus
    ) {
      return null;
    }

    const statusColors = {
      sent: "bg-info",
      delivered: "bg-warning text-dark",
      read: "bg-success",
      failed: "bg-danger",
    };

    const statusClass =
      statusColors[msg.MessageTransactionStatus] ||
      "bg-secondary";

    return (
      <div className="small text-end mt-1">
        <span
          className={`badge ${statusClass}`}
        >
          {msg.MessageTransactionStatus}
        </span>
      </div>
    );
  };

  // --------------------------------------------------
  // RENDER COMPONENT
  // --------------------------------------------------

  return (
    <CRow>

      {/* ------------------------------------------ */}
      {/* LEFT SIDE: CONVERSATION LIST               */}
      {/* ------------------------------------------ */}

      <CCol md={4}>
        <CCard className="h-100">

          <CCardHeader>
            <strong>
              Conversations
            </strong>

            <div className="small text-muted">
              Active within the last 3 months
            </div>
          </CCardHeader>

          <CCardBody
            className="p-0"
            style={{
              maxHeight:
                "calc(100vh - 200px)",

              overflowY: "auto",
            }}
          >

            {loading ? (

              <div className="d-flex justify-content-center p-3">
                <CSpinner color="primary" />
              </div>

            ) : conversations.length === 0 ? (

              <p className="p-3">
                No recent conversations found.
              </p>

            ) : (

              <CListGroup flush>

                {conversations.map((conv) => {

                  const isInstagram =
                    conv.MessageSourceActual ===
                    "Instagram";

                  const isSelected =
                    selectedChat?.id === conv.id;

                  return (

                    <CListGroupItem
                      key={conv.id}
                      action
                      active={isSelected}
                      onClick={() =>
                        handleSelectChat(conv)
                      }
                    >

                      {/* Conversation name */}

                      <div>
                        <b>
                          {isInstagram
                            ? conv.instagramsenderid
                            : conv.from ||
                              conv.displayName ||
                              conv.id}
                        </b>
                      </div>

                      {/* Message source */}

                      <div className="small text-muted text-truncate">

                        <span
                          className="nav-item"
                          style={{
                            width: "17px",
                            height: "20px",
                            display: "inline-table",
                            marginRight: "10px",
                          }}
                        >

                          <CIcon
                            icon={
                              isInstagram
                                ? cibInstagram
                                : cibWhatsapp
                            }
                            customClassName="nav-icon"
                          />

                        </span>

                        From:{" "}

                        {isInstagram
                          ? conv.from
                          : conv.displayName ||
                            conv.from}

                      </div>

                      {/* Last message */}

                      <div className="small text-muted text-truncate">
                        {conv.message ||
                          conv.Notes ||
                          "New message..."}
                      </div>

                      {/* Last activity */}

                      {conv.updatedAt?.toDate && (

                        <div className="small text-muted mt-1">

                          {conv.updatedAt
                            .toDate()
                            .toLocaleString()}

                        </div>

                      )}

                    </CListGroupItem>

                  );
                })}

              </CListGroup>

            )}

          </CCardBody>

        </CCard>
      </CCol>

      {/* ------------------------------------------ */}
      {/* RIGHT SIDE: CHAT SCREEN                    */}
      {/* ------------------------------------------ */}

      <CCol md={8}>

        <CCard className="h-100 d-flex flex-column">

          <CCardHeader>

            <strong>

              {selectedChat
                ? `Chat with ${
                    selectedChat.from ||
                    selectedChat.instagramsenderid ||
                    selectedChat.displayName ||
                    selectedChat.id
                  }`
                : "Select a conversation"}

            </strong>

          </CCardHeader>

          {/* -------------------------------------- */}
          {/* CHAT MESSAGES                          */}
          {/* -------------------------------------- */}

          <CCardBody
            className="chat-body flex-grow-1 d-flex flex-column"
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >

            {!selectedChat ? (

              <p className="text-center mt-3">
                Select a conversation to start chatting.
              </p>

            ) : messagesLoading ? (

              <div className="d-flex justify-content-center p-3">
                <CSpinner color="primary" />
              </div>

            ) : messages.length === 0 ? (

              <p className="text-center mt-3">
                No messages found.
              </p>

            ) : (

              <CListGroup flush>

                {messages.map((msg) => {

                  const isIncoming =
                    msg.MessageSource ===
                      "Whatsapp" ||
                    msg.MessageSource ===
                      "Instagram";

                  return (

                    <CListGroupItem
                      key={msg.id}
                      className={`border-0 d-flex ${
                        isIncoming
                          ? "justify-content-start"
                          : "justify-content-end"
                      }`}
                    >

                      <div
                        className={`p-2 rounded-3 ${
                          isIncoming
                            ? "bg-secondary text-white"
                            : "bg-primary text-white"
                        }`}
                        style={{
                          maxWidth: "70%",
                          whiteSpace: "pre-line",
                          overflowWrap: "anywhere",
                        }}
                      >

                        {/* Message text */}

                        {(msg.message ||
                          msg.Notes) && (

                          <div className="mb-1">
                            {msg.message ||
                              msg.Notes}
                          </div>

                        )}

                        {/* Media */}

                        {renderMessageMedia(msg)}

                        {/* Timestamp */}

                        <div className="small text-light text-end mt-1">

                          {msg.createdAt?.toDate
                            ? msg.createdAt
                                .toDate()
                                .toLocaleString()
                            : ""}

                        </div>

                        {/* Message status */}

                        {renderMessageStatus(msg)}

                      </div>

                    </CListGroupItem>

                  );
                })}

                <div ref={messagesEndRef} />

              </CListGroup>

            )}

          </CCardBody>

          {/* -------------------------------------- */}
          {/* REPLY INPUT                            */}
          {/* -------------------------------------- */}

          {selectedChat && (

            <div className="p-3 border-top d-flex align-items-center">

              <textarea
                className="form-control me-2"
                placeholder="Type your reply..."
                rows={2}
                value={replyText}
                onChange={handleReplyChange}
                onKeyDown={handleKeyDown}
                disabled={isSending}
              />

              <button
                className="btn btn-primary"
                onClick={handleSendMessage}
                disabled={
                  !replyText.trim() ||
                  isSending
                }
              >

                {isSending
                  ? "Sending..."
                  : "Send"}

              </button>

            </div>

          )}

        </CCard>

      </CCol>

      {/* ------------------------------------------ */}
      {/* OPERATION STATUS DIALOG                    */}
      {/* ------------------------------------------ */}

      <Dialog
        open={open}
        onClose={handleCancel}
      >

        <DialogTitle>
          Operation Status
        </DialogTitle>

        <DialogContent>

          <DialogContentText>
            {operationMessage}
          </DialogContentText>

        </DialogContent>

        <DialogActions>

          <Button
            onClick={handleCancel}
            color="primary"
          >
            OK
          </Button>

        </DialogActions>

      </Dialog>

    </CRow>
  );
};

export default ConversationPage;