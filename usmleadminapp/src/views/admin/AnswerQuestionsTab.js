
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { IdleTimerProvider } from 'react-idle-timer';

import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CButton,
  CListGroup,
  CListGroupItem,
  CFormSelect,
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CFormTextarea,
} from '@coreui/react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

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
  updateDoc,
  getDocs,
  doc,
  Timestamp,
} from 'firebase/firestore';

import { useLoading } from '../../layout/LoadingContext';

/* =========================================================
   MEDIA PREVIEW
========================================================= */

const MessageMedia = ({ msg }) => {
  const mediaUrl =
    msg?.mediaUrl ||
    msg?.MediaUrl ||
    msg?.UploadedMediaUrl ||
    '';

  const mediaType = String(
    msg?.mediaType ||
    msg?.MediaType ||
    ''
  ).toLowerCase();

  const mimeType = String(
    msg?.mediaMimeType ||
    msg?.mimeType ||
    msg?.MediaMimeType ||
    ''
  ).toLowerCase();

  const fileName =
    msg?.mediaFileName ||
    msg?.fileName ||
    msg?.MediaFileName ||
    'Attachment';

  const [imageError, setImageError] = useState(false);

  if (!mediaUrl) {
    if (!mediaType) return null;

    return (
      <div className="mt-2 small text-muted">
        {mediaType.charAt(0).toUpperCase() +
          mediaType.slice(1)}{' '}
        is not available for preview.
      </div>
    );
  }

  const isImage =
    mediaType === 'image' ||
    mimeType.startsWith('image/');

  const isAudio =
    mediaType === 'audio' ||
    mimeType.startsWith('audio/');

  const isVideo =
    mediaType === 'video' ||
    mimeType.startsWith('video/');

  const isPdf =
    mimeType.includes('pdf') ||
    /\.pdf(?:[?#]|$)/i.test(fileName) ||
    /\.pdf(?:[?#]|$)/i.test(mediaUrl);

  const isDocument =
    mediaType === 'document' ||
    isPdf ||
    mimeType.startsWith('application/');

  const openMedia = () => {
    window.open(
      mediaUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  /* ---------------- IMAGE ---------------- */

  if (isImage) {
    return (
      <div className="mt-2">
        {!imageError ? (
          <img
            src={mediaUrl}
            alt={msg?.Notes || 'WhatsApp image'}
            loading="lazy"
            onClick={openMedia}
            onError={() => setImageError(true)}
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '320px',
              maxHeight: '320px',
              objectFit: 'contain',
              borderRadius: '10px',
              cursor: 'pointer',
              backgroundColor: '#f5f5f5',
            }}
          />
        ) : (
          <div className="small text-danger">
            Image preview could not be loaded.
          </div>
        )}

        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="d-inline-block mt-2 small"
        >
          Open image
        </a>
      </div>
    );
  }

  /* ---------------- AUDIO ---------------- */

  if (isAudio) {
    return (
      <div
        className="mt-2 p-2 border rounded"
        style={{
          width: '100%',
          maxWidth: '360px',
          backgroundColor: '#f8f9fa',
        }}
      >
        <div className="small fw-semibold mb-2">
          🎤 Voice message
        </div>

        <audio
          controls
          preload="metadata"
          src={mediaUrl}
          style={{
            display: 'block',
            width: '100%',
          }}
        >
          Your browser does not support audio playback.
        </audio>

        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="d-inline-block mt-2 small"
        >
          Open audio
        </a>
      </div>
    );
  }

  /* ---------------- VIDEO ---------------- */

  if (isVideo) {
    return (
      <div
        className="mt-2"
        style={{
          width: '100%',
          maxWidth: '360px',
        }}
      >
        <video
          controls
          preload="metadata"
          src={mediaUrl}
          style={{
            display: 'block',
            width: '100%',
            maxHeight: '320px',
            borderRadius: '10px',
            backgroundColor: '#000',
          }}
        >
          Your browser does not support video playback.
        </video>

        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="d-inline-block mt-2 small"
        >
          Open video
        </a>
      </div>
    );
  }

  /* ---------------- PDF / DOCUMENT ---------------- */

  if (isDocument) {
    return (
      <div
        className="mt-2 p-2 border rounded"
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: '#f8f9fa',
        }}
      >
        <div className="d-flex align-items-center mb-2">
          <span
            style={{
              fontSize: '26px',
              marginRight: '10px',
            }}
          >
            📄
          </span>

          <div
            className="fw-semibold"
            style={{
              overflowWrap: 'anywhere',
            }}
          >
            {fileName === 'Attachment' && isPdf
              ? 'PDF Document'
              : fileName}
          </div>
        </div>

        {isPdf && (
          <iframe
            title={`PDF preview: ${fileName}`}
            src={mediaUrl}
            style={{
              display: 'block',
              width: '100%',
              height: '300px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: '#fff',
            }}
          />
        )}

        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="d-inline-block mt-2"
        >
          Open {isPdf ? 'PDF' : 'document'}
        </a>
      </div>
    );
  }

  /* ---------------- OTHER ATTACHMENTS ---------------- */

  return (
    <div className="mt-2">
      <a
        href={mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        📎 Open attachment
      </a>
    </div>
  );
};

/* =========================================================
   CHAT WINDOW
========================================================= */

const ChatWindow = ({ ActualUser }) => {
  const { id: routeId } = useParams();

  const id = routeId || ActualUser?.id;

  const {
    showLoading,
    hideLoading,
    sendWhatsappMessage,
  } = useLoading();

  const [messages, setMessages] = useState([]);
  const [isTabActive, setIsTabActive] = useState(true);
  const [input, setInput] = useState('');
  const [userData, setUserData] = useState(null);
  const [regarding, setRegarding] = useState('');

  const [operationMessage, setOperationMessage] =
    useState('');

  const [open, setOpen] = useState(false);

  const [seenByNames, setSeenByNames] = useState({});

  const [openDropdown, setOpenDropdown] =
    useState(null);

  const messagesEndRef = useRef(null);

  const services = [
    '',
    'Rotation',
    'Match',
    'Research',
  ];

  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {
    if (!id) return;

    const userQuery = query(
      collection(db, 'Users'),
      where('uid', '==', id)
    );

    const unsubscribeUser = onSnapshot(
      userQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();

          setUserData({
            ...data,
            followback: data.followback ?? 'yes',
          });
        } else {
          setUserData(null);
        }
      },
      (error) => {
        console.error('Error loading user:', error);
      }
    );

    return () => unsubscribeUser();
  }, [id]);

  /* =====================================================
     MARK MESSAGES AS READ
  ===================================================== */

  const markMessagesAsRead = async (msgs) => {
    if (!ActualUser?.id) return;

    const unreadMessages = msgs.filter(
      (msg) =>
        !msg?.readBy?.includes(ActualUser.id) &&
        ActualUser.id !== msg?.AddedBy?.id
    );

    await Promise.allSettled(
      unreadMessages.map(async (msg) => {
        const msgRef = doc(
          db,
          'UserCommonServiceNotes',
          msg.id
        );

        await updateDoc(msgRef, {
          readBy: [
            ...new Set([
              ...(msg.readBy || []),
              ActualUser.id,
            ]),
          ],
        });
      })
    );
  };

  /* =====================================================
     LOAD MESSAGES
  ===================================================== */

  useEffect(() => {
    if (!id) return;

    const messagesQuery = query(
      collection(db, 'UserCommonServiceNotes'),
      where('uid', '==', id),
      where('NoteType', '==', 'Questions'),
      orderBy('NotesDate', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const msgs = snapshot.docs.map(
          (messageDoc) => ({
            id: messageDoc.id,
            ...messageDoc.data(),
          })
        );

        if (msgs.length) {
          setRegarding(
            msgs[msgs.length - 1]?.NoteRegarding || ''
          );
        }

        setMessages(msgs);

        if (isTabActive) {
          markMessagesAsRead(msgs);
        }
      },
      (error) => {
        console.error(
          'Error loading chat messages:',
          error
        );
      }
    );

    return () => unsubscribe();
  }, [id, isTabActive, ActualUser?.id]);

  /* =====================================================
     SCROLL TO BOTTOM
  ===================================================== */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages.length]);

  /* =====================================================
     FETCH SEEN-BY NAMES
  ===================================================== */

  const fetchSeenByNames = async (
    msgId,
    readByUids
  ) => {
    if (seenByNames[msgId]) return;

    if (!readByUids?.length) {
      setSeenByNames((prev) => ({
        ...prev,
        [msgId]: [],
      }));
      return;
    }

    try {
      const uniqueUids = [...new Set(readByUids)];

      const names = [];

      // Firestore "in" queries have a value-count limit.
      // Fetch in batches to support larger readBy arrays.
      for (
        let i = 0;
        i < uniqueUids.length;
        i += 30
      ) {
        const batch = uniqueUids.slice(i, i + 30);

        const usersQuery = query(
          collection(db, 'Users'),
          where('uid', 'in', batch)
        );

        const snapshot = await getDocs(usersQuery);

        snapshot.docs.forEach((userDoc) => {
          const data = userDoc.data();

          names.push(
            data.displayName ||
              data.email ||
              userDoc.id
          );
        });
      }

      setSeenByNames((prev) => ({
        ...prev,
        [msgId]: names,
      }));
    } catch (error) {
      console.error(
        'Error fetching seen-by names:',
        error
      );

      setSeenByNames((prev) => ({
        ...prev,
        [msgId]: [],
      }));
    }
  };

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  const handleSend = async (e) => {
    e?.preventDefault?.();

    const trimmedInput = input.trim();

    if (!trimmedInput) {
      setOperationMessage('Please Enter A Message');
      setOpen(true);
      return;
    }

    if (!regarding.trim()) {
      setOperationMessage(
        'Please Select Service Regarding Which Your Message Is?'
      );
      setOpen(true);
      return;
    }

    if (!userData) {
      setOperationMessage(
        'User information is not available.'
      );
      setOpen(true);
      return;
    }

    let whatsappNumber =
      userData?.WhatsappCountry?.phoneCode &&
      userData?.WhatsappNumber
        ? `${userData.WhatsappCountry.phoneCode}${userData.WhatsappNumber}`
        : '';

    if (
      !whatsappNumber ||
      whatsappNumber === 'undefined'
    ) {
      whatsappNumber =
        userData?.WhatAppNumberForApi || '';
    }

    if (
      !whatsappNumber ||
      whatsappNumber === 'undefined'
    ) {
      whatsappNumber =
        userData?.PhoneCountry?.phoneCode &&
        userData?.phoneNumber
          ? `${userData.PhoneCountry.phoneCode}${userData.phoneNumber}`
          : '';
    }

    showLoading();

    try {
      let whatsappResponse = null;

      if (whatsappNumber) {
        whatsappResponse = await sendWhatsappMessage(
          whatsappNumber,
          trimmedInput
        );
      }

      const dataToBeAdded = {
        NotesDate: Timestamp.fromDate(new Date()),
        NoteType: 'Questions',
        MessageSource: 'Website',
        TeamMember: '',
        Notes: trimmedInput,
        CrossSell: '',
        NoteRegarding: regarding,
        ActionItem: 'For Both',

        AddedBy: {
          displayName: ActualUser?.displayName || '',
          email: ActualUser?.email || '',
          id: ActualUser?.id || '',
          UserType: 'Admin',
        },

        uid: id,
        email: userData?.email || '',
        createdAt: serverTimestamp(),
        readBy: ActualUser?.id
          ? [ActualUser.id]
          : [],
      };

      await setDoc(
        doc(
          db,
          'UserCommonServiceNotesRecent',
          id
        ),
        dataToBeAdded,
        { merge: true }
      );

      if (
        whatsappResponse?.status === 'success' &&
        whatsappResponse?.messageid
      ) {
        dataToBeAdded.id =
          whatsappResponse.messageid;

        dataToBeAdded.documentid =
          whatsappResponse.messageid;

        await setDoc(
          doc(
            db,
            'UserCommonServiceNotes',
            whatsappResponse.messageid
          ),
          dataToBeAdded
        );
      } else {
        await addDoc(
          collection(
            db,
            'UserCommonServiceNotes'
          ),
          dataToBeAdded
        );
      }

      setInput('');
    } catch (error) {
      console.error(
        'Error sending message:',
        error
      );

      setOperationMessage(
        'Unable to send your message. Please try again.'
      );

      setOpen(true);
    } finally {
      hideLoading();
    }
  };

  /* =====================================================
     DIALOG
  ===================================================== */

  const handleCancel = () => {
    setOpen(false);
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <IdleTimerProvider
      onActive={() => setIsTabActive(true)}
      onIdle={() => setIsTabActive(false)}
      timeout={3000}
    >
      <CCard
        className="w-100"
        style={{
          maxWidth: '100%',
          margin: 'auto',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CCardHeader>
          <strong>Chat Room</strong>
        </CCardHeader>

        {/* SERVICE SELECTION */}

        <div className="px-3 py-2">
          <CFormSelect
            value={regarding}
            onChange={(e) =>
              setRegarding(e.target.value)
            }
            label="Messaging Regarding"
          >
            {services.map((service) => (
              <option
                key={service}
                value={service}
              >
                {service}
              </option>
            ))}
          </CFormSelect>
        </div>

        {/* MESSAGES */}

        <CCardBody
          className="overflow-auto"
          style={{ flex: 1 }}
        >
          <CListGroup flush>
            {messages.map((msg) => {
              const messageMediaType = String(
                msg?.mediaType ||
                  msg?.MediaType ||
                  ''
              ).toLowerCase();

              const hasMediaUrl = Boolean(
                msg?.mediaUrl ||
                  msg?.MediaUrl ||
                  msg?.UploadedMediaUrl
              );

              const isMediaPlaceholder =
                hasMediaUrl &&
                String(
                  msg?.Notes || ''
                ).toLowerCase() ===
                  messageMediaType;

              const isSender =
                msg?.AddedBy?.id === id;

              const hasBeenReadByUser =
                msg?.readBy?.includes(id);

              return (
                <CListGroupItem
                  key={msg.id}
                  className="d-flex justify-content-between align-items-start"
                  style={{
                    gap: '12px',
                  }}
                >
                  {/* MESSAGE CONTENT */}

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <strong>
                      {msg?.AddedBy?.displayName ||
                        'Unknown'}
                      {' ('}
                      {isSender
                        ? 'You'
                        : msg?.AddedBy?.UserType ||
                          'N/A'}
                      {')'}
                    </strong>

                    {/* TEXT MESSAGE / MEDIA CAPTION */}

                    {msg?.Notes &&
                      !isMediaPlaceholder && (
                        <div
                          className="mt-1"
                          style={{
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {msg.Notes}
                        </div>
                      )}

                    {/* IMAGE / AUDIO / VIDEO / PDF */}

                    <MessageMedia msg={msg} />

                    {/* MESSAGE DETAILS */}

                    <div className="text-muted small mt-2">
                      Time:{' '}
                      {msg?.NotesDate
                        ? dayjs(
                            msg.NotesDate.toDate
                              ? msg.NotesDate.toDate()
                              : msg.NotesDate.seconds *
                                  1000
                          ).format(
                            'MMM D, YYYY h:mm A'
                          )
                        : ''}
                    </div>

                    <div className="text-muted small">
                      Regarding:{' '}
                      {msg?.NoteRegarding || ''}
                    </div>
                  </div>

                  {/* MESSAGE STATUS */}

                  <div className="text-end">
                    {!isSender &&
                      !hasBeenReadByUser && (
                        <CBadge color="warning">
                          Unread
                        </CBadge>
                      )}

                    {!isSender &&
                      hasBeenReadByUser && (
                        <CBadge color="success">
                          read
                        </CBadge>
                      )}

                    <div className="d-flex flex-column align-items-end ms-3">
                      {isSender && (
                        <>
                          <CBadge
                            color={
                              msg?.readBy?.length > 0
                                ? 'success'
                                : 'secondary'
                            }
                          >
                            {msg?.readBy?.length > 0
                              ? 'Seen'
                              : 'Sent'}
                          </CBadge>

                          {msg?.readBy?.length >
                            0 && (
                            <CDropdown
                              alignment="end"
                              visible={
                                openDropdown ===
                                msg.id
                              }
                              onMouseLeave={() =>
                                setOpenDropdown(
                                  null
                                )
                              }
                            >
                              <CDropdownToggle
                                color="light"
                                size="sm"
                                onClick={async () => {
                                  if (
                                    openDropdown ===
                                    msg.id
                                  ) {
                                    setOpenDropdown(
                                      null
                                    );
                                  } else {
                                    setOpenDropdown(
                                      msg.id
                                    );

                                    await fetchSeenByNames(
                                      msg.id,
                                      msg.readBy
                                    );
                                  }
                                }}
                              >
                                Seen by (
                                {msg.readBy.length}
                                )
                              </CDropdownToggle>

                              <CDropdownMenu className="p-2">
                                {seenByNames[
                                  msg.id
                                ]?.length > 0 ? (
                                  seenByNames[
                                    msg.id
                                  ].map(
                                    (name, index) => (
                                      <CDropdownItem
                                        key={index}
                                        className="text-dark"
                                      >
                                        {name}
                                      </CDropdownItem>
                                    )
                                  )
                                ) : (
                                  <CDropdownItem
                                    disabled
                                  >
                                    No readers found
                                  </CDropdownItem>
                                )}
                              </CDropdownMenu>
                            </CDropdown>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CListGroupItem>
              );
            })}

            <div ref={messagesEndRef} />
          </CListGroup>
        </CCardBody>

        {/* MESSAGE INPUT */}

        {userData?.followback === 'yes' && (
          <CForm
            onSubmit={handleSend}
            className="d-flex p-2"
          >
            <CFormTextarea
              rows={2}
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              placeholder="Type your message"
              className="bg-light border border-primary rounded px-3 py-2 shadow-sm"
              style={{
                fontSize: '1rem',
                resize: 'none',
              }}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />

            <CButton
              type="submit"
              color="primary"
              className="ms-2"
            >
              Send
            </CButton>
          </CForm>
        )}
      </CCard>

      {/* OPERATION STATUS DIALOG */}

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
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </IdleTimerProvider>
  );
};

export default ChatWindow;