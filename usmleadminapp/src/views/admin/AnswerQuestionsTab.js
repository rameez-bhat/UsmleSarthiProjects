
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IdleTimerProvider } from 'react-idle-timer';

import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CForm,
  CFormSelect,
  CFormTextarea,
  CListGroup,
  CListGroupItem,
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
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage';

import { db, storage } from '../../firebase';
import { useLoading } from '../../layout/LoadingContext';

/* =========================================================
   HELPERS
========================================================= */

const getMediaType = (mimeType = '') => {
  const mime = String(mimeType).toLowerCase();

  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';

  return 'document';
};

const getMessageMedia = (msg) => ({
  mediaUrl:
    msg?.mediaUrl ||
    msg?.MediaUrl ||
    msg?.UploadedMediaUrl ||
    '',

  mediaType: String(
    msg?.mediaType ||
      msg?.MediaType ||
      ''
  ).toLowerCase(),

  mimeType: String(
    msg?.mediaMimeType ||
      msg?.mimeType ||
      msg?.MediaMimeType ||
      ''
  ).toLowerCase(),

  fileName:
    msg?.mediaFileName ||
    msg?.fileName ||
    msg?.MediaFileName ||
    '',
});

const getMessageDate = (value) => {
  if (!value) return null;

  if (typeof value.toDate === 'function') {
    return value.toDate();
  }

  if (typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000);
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const getWhatsappMessageId = (response) =>
  response?.messageid ||
  response?.messageId ||
  response?.messages?.[0]?.id ||
  '';

/* =========================================================
   MEDIA DISPLAY
========================================================= */

const MessageMedia = ({ msg }) => {
  const { mediaUrl, mediaType, mimeType, fileName } =
    getMessageMedia(msg);

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [mediaUrl]);

  if (!mediaUrl) {
    if (!mediaType) return null;

    return (
      <div className="mt-2 small text-muted">
        {mediaType} attachment is not available for preview.
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
    mimeType === 'application/pdf' ||
    /\.pdf$/i.test(fileName) ||
    /\.pdf(?:[?#]|$)/i.test(mediaUrl);

  if (isImage) {
    return (
      <div className="mt-2">
        {!imageError ? (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={mediaUrl}
              alt={fileName || 'Chat attachment'}
              loading="lazy"
              onError={() => setImageError(true)}
              style={{
                display: 'block',
                maxWidth: '320px',
                maxHeight: '320px',
                width: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          </a>
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

  if (isAudio) {
    return (
      <div className="mt-2" style={{ maxWidth: '360px' }}>
        <div className="small fw-semibold mb-1">
          🎤 {fileName || 'Audio message'}
        </div>

        <audio
          controls
          preload="metadata"
          src={mediaUrl}
          style={{ width: '100%' }}
        />

        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="d-inline-block mt-1 small"
        >
          Open audio
        </a>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="mt-2" style={{ maxWidth: '360px' }}>
        <video
          controls
          preload="metadata"
          src={mediaUrl}
          style={{
            display: 'block',
            width: '100%',
            maxHeight: '320px',
            borderRadius: '8px',
          }}
        />

        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="d-inline-block mt-1 small"
        >
          Open video
        </a>
      </div>
    );
  }

  return (
    <div
      className="mt-2 p-2 border rounded"
      style={{
        width: '100%',
        maxWidth: '380px',
        backgroundColor: '#f8f9fa',
      }}
    >
      <div
        className="fw-semibold mb-2"
        style={{ overflowWrap: 'anywhere' }}
      >
        📄 {fileName || 'Document'}
      </div>

      {isPdf && (
        <iframe
          title={fileName || 'PDF preview'}
          src={mediaUrl}
          style={{
            display: 'block',
            width: '100%',
            height: '280px',
            border: '1px solid #ddd',
            borderRadius: '6px',
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
};

/* =========================================================
   SELECTED ATTACHMENT PREVIEW
========================================================= */

const SelectedFilePreview = ({
  file,
  previewUrl,
  disabled,
  onRemove,
}) => {
  if (!file) return null;

  const mediaType = getMediaType(file.type);

  return (
    <div className="border rounded bg-light p-2 mb-2">
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="small fw-semibold"
            style={{ overflowWrap: 'anywhere' }}
          >
            📎 {file.name}
          </div>

          <div className="small text-muted">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </div>
        </div>

        <CButton
          type="button"
          color="danger"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={onRemove}
        >
          Remove
        </CButton>
      </div>

      {previewUrl && mediaType === 'image' && (
        <img
          src={previewUrl}
          alt="Selected attachment"
          className="mt-2"
          style={{
            display: 'block',
            maxWidth: '240px',
            maxHeight: '180px',
            width: '100%',
            objectFit: 'contain',
            borderRadius: '8px',
          }}
        />
      )}

      {previewUrl && mediaType === 'audio' && (
        <audio
          controls
          src={previewUrl}
          className="mt-2"
          style={{ width: '100%', maxWidth: '340px' }}
        />
      )}

      {previewUrl && mediaType === 'video' && (
        <video
          controls
          src={previewUrl}
          className="mt-2"
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '300px',
            maxHeight: '200px',
          }}
        />
      )}

      {previewUrl && file.type === 'application/pdf' && (
        <iframe
          title="Selected PDF preview"
          src={previewUrl}
          className="mt-2"
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '360px',
            height: '220px',
            border: '1px solid #ddd',
          }}
        />
      )}
    </div>
  );
};

/* =========================================================
   CHAT WINDOW
========================================================= */

const ChatWindow = ({ ActualUser }) => {
  const { id } = useParams();

  const {
    showLoading,
    hideLoading,
    sendWhatsappMessage,
    sendWhatsappMedia,
  } = useLoading();

  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);

  const [input, setInput] = useState('');
  const [regarding, setRegarding] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [sending, setSending] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);

  const [operationMessage, setOperationMessage] =
    useState('');

  const [open, setOpen] = useState(false);

  const [seenByNames, setSeenByNames] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sendingRef = useRef(false);

  const services = ['', 'Rotation', 'Match', 'Research'];

  const showError = (message) => {
    setOperationMessage(message);
    setOpen(true);
  };

  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {
    if (!id) return;

    const userQuery = query(
      collection(db, 'Users'),
      where('uid', '==', id)
    );

    const unsubscribe = onSnapshot(
      userQuery,
      (snapshot) => {
        if (snapshot.empty) {
          setUserData(null);
          return;
        }

        const data = snapshot.docs[0].data();

        setUserData({
          ...data,
          followback: data.followback ?? 'yes',
        });
      },
      (error) => {
        console.error('Error loading user:', error);
      }
    );

    return () => unsubscribe();
  }, [id]);

  /* =====================================================
     MARK MESSAGES AS READ
  ===================================================== */

  useEffect(() => {
    if (!id || !ActualUser?.id || !isTabActive) return;

    const messagesQuery = query(
      collection(db, 'UserCommonServiceNotes'),
      where('uid', '==', id),
      where('NoteType', '==', 'Questions'),
      orderBy('NotesDate', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const loadedMessages = snapshot.docs.map(
          (messageDoc) => ({
            ...messageDoc.data(),
            id: messageDoc.id,
          })
        );

        setMessages(loadedMessages);

        loadedMessages.forEach((message) => {
          if (
            message.AddedBy?.id === ActualUser.id ||
            message.readBy?.includes(ActualUser.id)
          ) {
            return;
          }

          updateDoc(
            doc(db, 'UserCommonServiceNotes', message.id),
            {
              readBy: arrayUnion(ActualUser.id),
            }
          ).catch((error) => {
            console.error(
              'Error marking message as read:',
              error
            );
          });
        });
      },
      (error) => {
        console.error('Error loading messages:', error);
      }
    );

    return () => unsubscribe();
  }, [id, ActualUser?.id, isTabActive]);

  /* =====================================================
     LOAD MESSAGES WHILE IDLE TOO
  ===================================================== */

  useEffect(() => {
    if (!id || (ActualUser?.id && isTabActive)) return;

    const messagesQuery = query(
      collection(db, 'UserCommonServiceNotes'),
      where('uid', '==', id),
      where('NoteType', '==', 'Questions'),
      orderBy('NotesDate', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        setMessages(
          snapshot.docs.map((messageDoc) => ({
            ...messageDoc.data(),
            id: messageDoc.id,
          }))
        );
      },
      (error) => {
        console.error('Error loading messages:', error);
      }
    );

    return () => unsubscribe();
  }, [id, ActualUser?.id, isTabActive]);

  /* =====================================================
     SCROLL TO NEW MESSAGES
  ===================================================== */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages.length]);

  /* =====================================================
     FETCH SEEN-BY NAMES
  ===================================================== */

  const fetchSeenByNames = async (messageId, readByUids) => {
    if (seenByNames[messageId]) return;

    const uniqueUids = [
      ...new Set((readByUids || []).filter(Boolean)),
    ];

    if (!uniqueUids.length) {
      setSeenByNames((previous) => ({
        ...previous,
        [messageId]: [],
      }));
      return;
    }

    try {
      const names = [];

      for (let index = 0; index < uniqueUids.length; index += 30) {
        const batch = uniqueUids.slice(index, index + 30);

        const usersQuery = query(
          collection(db, 'Users'),
          where('uid', 'in', batch)
        );

        const snapshot = await getDocs(usersQuery);

        snapshot.docs.forEach((userDoc) => {
          const user = userDoc.data();

          names.push(
            user.displayName ||
              user.email ||
              userDoc.id
          );
        });
      }

      setSeenByNames((previous) => ({
        ...previous,
        [messageId]: names,
      }));
    } catch (error) {
      console.error('Error fetching seen-by names:', error);

      showError('Unable to load the seen-by list.');
    }
  };

  /* =====================================================
     WHATSAPP NUMBER
  ===================================================== */

  const getWhatsappNumber = () => {
    if (
      userData?.WhatsappCountry?.phoneCode &&
      userData?.WhatsappNumber
    ) {
      return `${userData.WhatsappCountry.phoneCode}${userData.WhatsappNumber}`;
    }

    if (
      userData?.WhatAppNumberForApi &&
      userData.WhatAppNumberForApi !== 'undefined'
    ) {
      return userData.WhatAppNumberForApi;
    }

    if (
      userData?.PhoneCountry?.phoneCode &&
      userData?.phoneNumber
    ) {
      return `${userData.PhoneCountry.phoneCode}${userData.phoneNumber}`;
    }

    return '';
  };

  /* =====================================================
     COMMON FIRESTORE MESSAGE DATA
  ===================================================== */

  const buildMessageData = (notes) => ({
    NotesDate: Timestamp.fromDate(new Date()),
    NoteType: 'Questions',
    MessageSource: 'Website',
    TeamMember: '',
    Notes: notes,
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
    readBy: ActualUser?.id ? [ActualUser.id] : [],
  });

  /* =====================================================
     SAVE SENT MESSAGE
  ===================================================== */

  const saveMessage = async (messageData, whatsappResponse) => {
    const whatsappMessageId =
      getWhatsappMessageId(whatsappResponse);

    if (!whatsappMessageId) {
      throw new Error(
        'WhatsApp did not return a message ID. The message was not saved as sent.'
      );
    }

    const finalData = {
      ...messageData,
      id: whatsappMessageId,
      documentid: whatsappMessageId,
    };

    await setDoc(
      doc(
        db,
        'UserCommonServiceNotes',
        whatsappMessageId
      ),
      finalData
    );

    await setDoc(
      doc(db, 'UserCommonServiceNotesRecent', id),
      finalData,
      { merge: true }
    );
  };

  /* =====================================================
     FILE SELECTION
  ===================================================== */

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const supported =
      file.type.startsWith('image/') ||
      file.type.startsWith('audio/') ||
      file.type.startsWith('video/') ||
      allowedTypes.includes(file.type);

    if (!supported) {
      showError(
        'Unsupported file type. Select an image, audio, video, PDF, DOC, or DOCX file.'
      );

      event.target.value = '';
      return;
    }

    const maxSize = 16 * 1024 * 1024;

    if (file.size > maxSize) {
      showError('Please select a file smaller than 16 MB.');

      event.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  /* =====================================================
     SELECTED FILE PREVIEW URL
  ===================================================== */

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return;
    }

    const url = URL.createObjectURL(selectedFile);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  const clearSelectedFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* =====================================================
     SEND TEXT
  ===================================================== */

  const handleSendText = async () => {
    const message = input.trim();

    if (!message) return;

    const whatsappNumber = getWhatsappNumber();

    if (!whatsappNumber) {
      showError('WhatsApp number is not available for this user.');
      return;
    }

    if (typeof sendWhatsappMessage !== 'function') {
      showError('WhatsApp text sending is not configured.');
      return;
    }

    const response = await sendWhatsappMessage(
      whatsappNumber,
      message
    );

    if (
      response?.status !== 'success' ||
      !getWhatsappMessageId(response)
    ) {
      throw new Error(
        response?.message ||
          response?.messageid ||
          'WhatsApp did not confirm that the message was sent.'
      );
    }

    await saveMessage(buildMessageData(message), response);

    setInput('');
  };

  /* =====================================================
     SEND ATTACHMENT
  ===================================================== */

  const handleSendMedia = async () => {
    if (!selectedFile) return;

    const whatsappNumber = getWhatsappNumber();

    if (!whatsappNumber) {
      showError('WhatsApp number is not available for this user.');
      return;
    }
	//console.log("sendWhatsappMedia===>",sendWhatsappMedia)
    if (typeof sendWhatsappMedia !== 'function') {
      showError(
        'sendWhatsappMedia is not configured in LoadingContext.'
      );
      return;
    }

    const file = selectedFile;
    const caption = input.trim();

    /*
     * Step 1: Send attachment through your backend.
     * The backend must upload the file to Meta and
     * send the resulting media ID to the recipient.
     */

    const response = await sendWhatsappMedia({
      whatsappNumber,
      file,
      caption,
    });

    if (
      response?.status !== 'success' ||
      !getWhatsappMessageId(response)
    ) {
      throw new Error(
        response?.message ||
          'WhatsApp did not confirm that the attachment was sent.'
      );
    }

    /*
     * Step 2: Upload a persistent copy to Firebase
     * Storage so the attachment appears in this chat.
     */

    const safeFileName = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      '_'
    );

    const uniqueFileName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}-${safeFileName}`;

    const mediaPath = `chat-media/${id}/${uniqueFileName}`;

    const fileRef = storageRef(storage, mediaPath);

    await uploadBytes(fileRef, file, {
      contentType:
        file.type || 'application/octet-stream',
    });

    const mediaUrl = await getDownloadURL(fileRef);

    /*
     * Step 3: Save the outgoing message in Firestore.
     */

    const mediaType = getMediaType(file.type);

    const messageData = {
      ...buildMessageData(caption || mediaType),

      mediaType,
      mediaUrl,
      mediaMimeType:
        file.type || 'application/octet-stream',
      mediaFileName: file.name,
      mediaPath,
    };

    await saveMessage(messageData, response);

    setInput('');
    clearSelectedFile();
  };

  /* =====================================================
     SEND BUTTON / ENTER KEY
  ===================================================== */

  const handleSubmit = async (event) => {
    event?.preventDefault?.();

    if (sendingRef.current) return;

    if (!userData || !id) {
      showError('User information is not available.');
      return;
    }

    if (!regarding.trim()) {
      showError(
        'Please select the service regarding this message.'
      );
      return;
    }

    if (!selectedFile && !input.trim()) return;

    sendingRef.current = true;
    setSending(true);
    showLoading();

    try {
      if (selectedFile) {
        await handleSendMedia();
      } else {
        await handleSendText();
      }
    } catch (error) {
      console.error('Error sending chat message:', error);

      showError(
        error?.message || 'Unable to send the message.'
      );
    } finally {
      sendingRef.current = false;
      setSending(false);
      hideLoading();
    }
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
            label="Messaging Regarding"
            value={regarding}
            onChange={(event) =>
              setRegarding(event.target.value)
            }
          >
            {services.map((service) => (
              <option key={service} value={service}>
                {service || 'Select service'}
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
              const { mediaUrl, mediaType } =
                getMessageMedia(msg);

              const isMediaPlaceholder =
                Boolean(mediaUrl) &&
                String(msg?.Notes || '').toLowerCase() ===
                  mediaType;

              const isSender =
                msg?.AddedBy?.id === id;

              const isReadByUser =
                msg?.readBy?.includes(id);

              const messageDate = getMessageDate(
                msg?.NotesDate
              );

              const readers = (msg?.readBy || []).filter(
                (readerId) =>
                  readerId && readerId !== msg?.AddedBy?.id
              );

              return (
                <CListGroupItem
                  key={msg.id}
                  className="d-flex justify-content-between align-items-start"
                  style={{ gap: '12px' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong>
                      {msg?.AddedBy?.displayName || 'Unknown'}

                      {' ('}

                      {isSender
                        ? 'You'
                        : msg?.AddedBy?.UserType || 'N/A'}

                      {')'}
                    </strong>

                    {/* TEXT / CAPTION */}

                    {msg?.Notes && !isMediaPlaceholder && (
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

                    {/* MEDIA */}

                    <MessageMedia msg={msg} />

                    {/* TIME */}

                    <div className="text-muted small mt-2">
                      Time:{' '}
                      {messageDate
                        ? dayjs(messageDate).format(
                            'MMM D, YYYY h:mm A'
                          )
                        : ''}
                    </div>

                    <div className="text-muted small">
                      Regarding: {msg?.NoteRegarding || ''}
                    </div>
                  </div>

                  {/* READ STATUS */}

                  <div className="text-end">
                    {!isSender && (
                      <CBadge
                        color={
                          isReadByUser ? 'success' : 'warning'
                        }
                      >
                        {isReadByUser ? 'Read' : 'Unread'}
                      </CBadge>
                    )}

                    {isSender && (
                      <div className="d-flex flex-column align-items-end ms-3">
                        <CBadge
                          color={
                            readers.length > 0
                              ? 'success'
                              : 'secondary'
                          }
                        >
                          {readers.length > 0 ? 'Seen' : 'Sent'}
                        </CBadge>

                        {readers.length > 0 && (
                          <CDropdown
                            alignment="end"
                            visible={openDropdown === msg.id}
                            onMouseLeave={() =>
                              setOpenDropdown(null)
                            }
                          >
                            <CDropdownToggle
                              color="light"
                              size="sm"
                              onClick={async () => {
                                if (openDropdown === msg.id) {
                                  setOpenDropdown(null);
                                  return;
                                }

                                setOpenDropdown(msg.id);

                                await fetchSeenByNames(
                                  msg.id,
                                  readers
                                );
                              }}
                            >
                              Seen by ({readers.length})
                            </CDropdownToggle>

                            <CDropdownMenu className="p-2">
                              {seenByNames[msg.id]?.length ? (
                                seenByNames[msg.id].map(
                                  (name, index) => (
                                    <CDropdownItem
                                      key={`${msg.id}-${index}`}
                                      className="text-dark"
                                    >
                                      {name}
                                    </CDropdownItem>
                                  )
                                )
                              ) : (
                                <CDropdownItem disabled>
                                  No readers found
                                </CDropdownItem>
                              )}
                            </CDropdownMenu>
                          </CDropdown>
                        )}
                      </div>
                    )}
                  </div>
                </CListGroupItem>
              );
            })}

            <div ref={messagesEndRef} />
          </CListGroup>
        </CCardBody>

        {/* COMPOSER */}

        {userData?.followback === 'yes' && (
          <div className="border-top p-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            <SelectedFilePreview
              file={selectedFile}
              previewUrl={previewUrl}
              disabled={sending}
              onRemove={clearSelectedFile}
            />

            <CForm
              onSubmit={handleSubmit}
              className="d-flex align-items-end gap-2"
            >
              <CButton
                type="button"
                color="light"
                title="Attach image, audio, video, PDF or document"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
                style={{ fontSize: '20px' }}
              >
                📎
              </CButton>

              <CFormTextarea
                rows={2}
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                placeholder={
                  selectedFile
                    ? 'Add a caption (optional)'
                    : 'Type your message'
                }
                className="bg-light border border-primary rounded px-3 py-2 shadow-sm"
                style={{
                  fontSize: '1rem',
                  resize: 'none',
                  flex: 1,
                }}
                disabled={sending}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
              />

              <CButton
                type="submit"
                color="primary"
                disabled={
                  sending ||
                  (!selectedFile && !input.trim())
                }
              >
                {sending ? 'Sending...' : 'Send'}
              </CButton>
            </CForm>
          </div>
        )}
      </CCard>

      {/* ERROR DIALOG */}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
      >
        <DialogTitle>Operation Status</DialogTitle>

        <DialogContent>
          <DialogContentText>
            {operationMessage}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            color="primary"
            onClick={() => setOpen(false)}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </IdleTimerProvider>
  );
};

export default ChatWindow;