import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Input,
  Button,
  Avatar,
  Space,
  Upload,
  Image,
  message,
  Modal,
  Spin,
  Tag,
  List,
  Badge,
  Empty,
} from "antd";
import {
  SendOutlined,
  PaperClipOutlined,
  VideoCameraOutlined,
  PhoneOutlined,
  FileOutlined,
  DownloadOutlined,
  UserOutlined,
  MessageOutlined,
  SmileOutlined,
  CloseOutlined,
  AudioOutlined,
  PauseOutlined,
  StopOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  bookingsAPI,
  sessionsAPI,
  filesAPI,
  messageAPI,
} from "../../services/api";
import useVoiceRecorder from "../../hooks/useVoiceRecorder";
import WhatsAppAudioPlayer from "../../components/common/WhatsAppAudioPlayer";
import dayjs from "dayjs";

const { TextArea } = Input;

const ConsultantChat = () => {
  const { sessionId, bookingId } = useParams();
  // Support both /chat/:bookingId, /chat/session/:sessionId, and /sessions/:sessionId routes
  const activeId = bookingId || sessionId;
  const isDirectSession = !!sessionId && !bookingId;
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [session, setSession] = useState(null);
  const [booking, setBooking] = useState(null);
  const [videoRoom, setVideoRoom] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [showJitsiModal, setShowJitsiModal] = useState(false);
  const messagesEndRef = useRef(null);
  const isRedirectingRef = useRef(false);
  const prevActiveIdRef = useRef(null);
  const fetchingSessionRef = useRef(false);
  const currentlyFetchingIdRef = useRef(null);
  const failedIdsRef = useRef(new Set());
  const {
    isRecording,
    recordingTime,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    cancelRecording,
    formatTime,
  } = useVoiceRecorder();

  // Ensure only consultants can access this page
  useEffect(() => {
    if (user && user.role !== "CONSULTANT") {
      message.error(
        language === "ar"
          ? "غير مصرح لك بالوصول إلى هذه الصفحة"
          : "You are not authorized to access this page"
      );
      if (user.role === "CLIENT") {
        navigate("/client", { replace: true });
      } else if (["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, navigate, language]);

  useEffect(() => {
    // Only reset redirecting flag when activeId actually changes or is cleared
    if (prevActiveIdRef.current !== activeId) {
      // activeId changed - reset flags for new ID
      isRedirectingRef.current = false;
      fetchingSessionRef.current = false;
      currentlyFetchingIdRef.current = null;
      setAccessDenied(false);
      prevActiveIdRef.current = activeId;
    }

    // Reset session loaded flag when activeId changes
    setSessionLoaded(false);

    if (activeId && user) {
      // FIRST: Check if this ID has already failed - redirect immediately before anything else
      if (failedIdsRef.current.has(activeId)) {
        if (!isRedirectingRef.current) {
          isRedirectingRef.current = true;
          setAccessDenied(true);
          setLoading(false);
          fetchingSessionRef.current = false;
          currentlyFetchingIdRef.current = null;
          // Use setTimeout to ensure redirect happens after render
          setTimeout(() => {
            navigate("/consultant/chat", { replace: true });
          }, 0);
        }
        return;
      }

      // Don't fetch if:
      // 1. Already redirecting
      // 2. Access denied
      // 3. Currently fetching a DIFFERENT ID (allow if same ID - might be retry)
      const isFetchingDifferentId =
        currentlyFetchingIdRef.current &&
        currentlyFetchingIdRef.current !== activeId;

      if (isRedirectingRef.current || accessDenied || isFetchingDifferentId) {
        // If we're blocking the fetch, ensure loading is false
        setLoading(false);
        return;
      }

      // Only set flags if not already fetching this ID (prevent duplicate calls)
      if (currentlyFetchingIdRef.current !== activeId) {
        currentlyFetchingIdRef.current = activeId;
        fetchingSessionRef.current = true;
        fetchSession();
      } else {
        // Already fetching this ID - don't set loading to false yet, let fetchSession handle it
        // Loading will be set to false when fetchSession completes (in finally block)
      }
    } else if (!activeId) {
      // No bookingId provided, fetch available bookings and conversations
      setLoading(false);
      setSessionLoaded(false);
      setAccessDenied(false);
      isRedirectingRef.current = false;
      fetchingSessionRef.current = false;
      currentlyFetchingIdRef.current = null;
      fetchAvailableBookings();
      fetchConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, user]);

  // Fetch messages when session is available and loaded
  useEffect(() => {
    // Don't fetch if access was denied
    if (accessDenied) return;

    // Only fetch messages if:
    // 1. We have a session ID (for booking-based sessions)
    // 2. OR we have activeId AND it's a direct session AND session is loaded
    const shouldFetch =
      session?.id || (activeId && isDirectSession && sessionLoaded);

    if (shouldFetch) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [session?.id, activeId, isDirectSession, sessionLoaded, accessDenied]);

  useEffect(() => {
    // Refresh conversations every 10 seconds when no active chat
    if (!activeId) {
      const interval = setInterval(() => {
        fetchConversations();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [activeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSession = async () => {
    // FIRST: Check if this ID has already failed - don't even try to fetch
    if (failedIdsRef.current.has(activeId)) {
      if (!isRedirectingRef.current) {
        isRedirectingRef.current = true;
        setAccessDenied(true);
        setLoading(false);
        fetchingSessionRef.current = false;
        currentlyFetchingIdRef.current = null;
        setTimeout(() => {
          navigate("/consultant/chat", { replace: true });
        }, 0);
      }
      return;
    }

    // Guard: Don't fetch if already redirecting or access denied
    // Allow fetch if currently fetching the SAME ID (might be retry or React Strict Mode)
    if (isRedirectingRef.current || accessDenied) {
      // If redirecting/denied, loading will be handled by redirect/error handlers
      fetchingSessionRef.current = false;
      currentlyFetchingIdRef.current = null;
      return;
    }

    if (!activeId || !user) {
      setLoading(false);
      fetchingSessionRef.current = false;
      currentlyFetchingIdRef.current = null;
      return;
    }

    // Only block if fetching a DIFFERENT ID
    if (
      currentlyFetchingIdRef.current &&
      currentlyFetchingIdRef.current !== activeId
    ) {
      // Blocking because different ID is being fetched - loading will be handled when that fetch completes
      return;
    }

    // Mark as fetching THIS activeId to prevent concurrent calls
    fetchingSessionRef.current = true;
    currentlyFetchingIdRef.current = activeId;

    // Mark as fetching to prevent concurrent calls (React Strict Mode)
    fetchingSessionRef.current = true;
    try {
      // First, check if this ID is a direct session by checking conversations
      // This prevents trying to fetch bookings for sessionIds or deleted bookings
      let isActuallyDirectSession = isDirectSession;

      if (!isDirectSession) {
        // Check conversations to see if this ID is actually a sessionId
        try {
          const conversationsResponse = await messageAPI.getConversations();
          const conversation = conversationsResponse.conversations?.find(
            (c) => c.sessionId === activeId || (c.isDirect && c.id === activeId)
          );

          if (
            conversation &&
            (conversation.isDirect || conversation.sessionId === activeId)
          ) {
            // This is actually a direct session, not a booking
            isActuallyDirectSession = true;
          }
        } catch (convErr) {
          // If we can't fetch conversations, continue with original logic
          console.warn(
            "Could not fetch conversations to verify session type:",
            convErr
          );
        }
      }

      // If this is a direct session (sessionId provided or found in conversations), fetch session directly
      if (isActuallyDirectSession) {
        try {
          // Get session from conversations
          const conversationsResponse = await messageAPI.getConversations();
          const conversation = conversationsResponse.conversations?.find(
            (c) => c.sessionId === activeId
          );

          if (conversation) {
            // Create a mock session object for direct sessions
            setSession({
              id: activeId,
              status: conversation.status || "IN_PROGRESS",
              sessionType: "chat",
            });
            setBooking(null); // No booking for direct sessions
            setCurrentConversation(conversation); // Store conversation data for receiverId
            setSessionLoaded(true);
          } else {
            // Try to fetch messages directly to verify session exists
            try {
              await messageAPI.getMessages(activeId);
              setSession({
                id: activeId,
                status: "IN_PROGRESS",
                sessionType: "chat",
              });
              setBooking(null);
              setSessionLoaded(true);
            } catch (msgErr) {
              // Check if it's a 404 or 403 error
              if (
                msgErr.message?.includes("not found") ||
                msgErr.message?.includes("404") ||
                msgErr.message?.includes("Access denied") ||
                msgErr.message?.includes("403")
              ) {
                // Don't set sessionLoaded - user doesn't have access
                setSessionLoaded(false);
                setAccessDenied(true);
                message.error(
                  language === "ar"
                    ? "الجلسة غير موجودة أو غير مصرح لك بالوصول"
                    : "Session not found or access denied"
                );
                navigate("/consultant/chat", { replace: true });
                return;
              } else {
                throw msgErr;
              }
            }
          }
        } catch (sessionErr) {
          console.error("Error fetching direct session:", sessionErr);
          // Only show error if it's not a 404/403 (which we already handled)
          if (
            !sessionErr.message?.includes("not found") &&
            !sessionErr.message?.includes("404") &&
            !sessionErr.message?.includes("Access denied") &&
            !sessionErr.message?.includes("403")
          ) {
            message.error(
              language === "ar" ? "فشل تحميل الجلسة" : "Failed to load session"
            );
          }
          navigate("/consultant/chat", { replace: true });
        } finally {
          setLoading(false);
          fetchingSessionRef.current = false;
        }
        return;
      }

      // Otherwise, this is a booking-based session
      // But first, double-check if this ID is actually a sessionId in conversations
      // This prevents trying to fetch deleted bookings when clicking on conversations
      let isSessionId = false;
      try {
        const conversationsResponse = await messageAPI.getConversations();
        const conversation = conversationsResponse.conversations?.find(
          (c) => c.sessionId === activeId || (c.isDirect && c.id === activeId)
        );
        if (
          conversation &&
          (conversation.isDirect || conversation.sessionId === activeId)
        ) {
          // This is actually a sessionId, not a bookingId - treat as direct session
          isSessionId = true;
          setSession({
            id: activeId,
            status: conversation.status || "IN_PROGRESS",
            sessionType: "chat",
          });
          setBooking(null);
          setCurrentConversation(conversation);
          setSessionLoaded(true);
          setLoading(false);
          fetchingSessionRef.current = false;
          currentlyFetchingIdRef.current = null;
          return;
        }
      } catch (convErr) {
        // If we can't check conversations, continue with booking fetch
        if (import.meta.env.DEV) {
          console.warn("Could not verify if ID is sessionId:", convErr);
        }
      }

      // If we determined it's not a sessionId, proceed with booking fetch
      // First try to get booking to ensure it exists and user has access
      // Backend will return 403 if user doesn't have access
      let booking;
      try {
        const bookingResponse = await bookingsAPI.getBookingById(activeId);
        booking = bookingResponse.booking;
      } catch (bookingErr) {
        // Check if booking not found (404) - redirect immediately
        const isNotFound =
          bookingErr.status === 404 ||
          bookingErr.response?.status === 404 ||
          bookingErr.message?.toLowerCase().includes("not found") ||
          bookingErr.message?.includes("404");

        if (isNotFound) {
          // Mark this ID as failed to prevent retries
          failedIdsRef.current.add(activeId);

          if (isRedirectingRef.current) {
            setLoading(false);
            fetchingSessionRef.current = false;
            currentlyFetchingIdRef.current = null;
            return; // Already redirecting
          }

          // Set flags immediately to prevent retries
          isRedirectingRef.current = true;
          setAccessDenied(true);
          setLoading(false);
          fetchingSessionRef.current = false;
          currentlyFetchingIdRef.current = null;

          // Only log in development - 404s are expected when bookings are deleted
          if (import.meta.env.DEV) {
            console.warn(
              `Booking ${activeId} not found (404) - redirecting to chat list`
            );
          }

          // Redirect immediately to chat list
          navigate("/consultant/chat", { replace: true });
          return;
        }
        // If not 404, re-throw to be handled by outer catch
        throw bookingErr;
      }

      // Verify this booking belongs to the current consultant
      if (
        user?.role === "CONSULTANT" &&
        booking.consultant?.userId !== user.id
      ) {
        if (isRedirectingRef.current) {
          setLoading(false);
          fetchingSessionRef.current = false;
          return;
        }
        isRedirectingRef.current = true;
        message.error(
          language === "ar"
            ? "غير مصرح لك بالوصول إلى هذا الحجز"
            : "You are not authorized to access this booking"
        );
        setAccessDenied(true);
        setLoading(false);
        fetchingSessionRef.current = false;
        navigate("/consultant/chat", { replace: true });
        return;
      }

      setBooking(booking);

      // Then try to get session (it might not exist yet)
      try {
        const response = await sessionsAPI.getSessionByBooking(activeId);
        setSession(response.session);
        setSessionLoaded(true);

        // Fetch video room if exists
        if (response.session?.roomId) {
          const roomResponse = await sessionsAPI.getVideoRoom(activeId);
          setVideoRoom(roomResponse.room);
        }
      } catch (sessionErr) {
        // Session doesn't exist yet, that's okay - mark as loaded so we can still use the booking
        console.log("Session not found yet, will be created when starting");
        setSession(null);
        setSessionLoaded(true);
      }

      // Mark fetching as complete on success
      fetchingSessionRef.current = false;
      currentlyFetchingIdRef.current = null;
      // Remove from failed IDs if it was there (retry succeeded)
      failedIdsRef.current.delete(activeId);
    } catch (err) {
      const errorMessage =
        err.message ||
        err.response?.data?.error ||
        (language === "ar" ? "فشل تحميل الجلسة" : "Failed to load session");

      // Check if booking/session not found (404)
      const isNotFound =
        err.message?.toLowerCase().includes("not found") ||
        err.message?.includes("404") ||
        err.response?.status === 404;

      // Check if access denied (403)
      const isAccessDenied =
        err.message?.includes("Access denied") ||
        err.message?.includes("403") ||
        err.response?.status === 403;

      // If booking not found, silently redirect without showing error (common case)
      if (isNotFound) {
        if (isRedirectingRef.current) {
          setLoading(false);
          fetchingSessionRef.current = false;
          return; // Already redirecting
        }
        // Set flags immediately to prevent retries
        isRedirectingRef.current = true;
        setAccessDenied(true);
        setLoading(false);
        fetchingSessionRef.current = false;
        // Only log in development
        if (import.meta.env.DEV) {
          console.log("Booking not found, redirecting to chat list:", activeId);
        }
        // Redirect immediately to chat list page
        navigate("/consultant/chat", { replace: true });
        return;
      }

      // For access denied, show error and redirect
      if (isAccessDenied) {
        if (isRedirectingRef.current) {
          setLoading(false);
          fetchingSessionRef.current = false;
          return; // Already redirecting
        }
        isRedirectingRef.current = true;
        message.error(
          language === "ar"
            ? "غير مصرح لك بالوصول إلى هذا الحجز"
            : "You are not authorized to access this booking"
        );
        setAccessDenied(true);
        setLoading(false);
        fetchingSessionRef.current = false;
        navigate("/consultant/chat", { replace: true });
        return;
      }

      // For other errors, show error message and log
      console.error("Error fetching session:", err);
      message.error(errorMessage);
      setLoading(false);
    } finally {
      // Reset fetching flag
      fetchingSessionRef.current = false;
      currentlyFetchingIdRef.current = null;
      // Only set loading to false if we haven't already handled it
      if (!accessDenied && !isRedirectingRef.current) {
        setLoading(false);
      }
    }
  };

  const fetchMessages = async () => {
    // Don't fetch if access was denied or we don't have a valid session ID
    if (
      accessDenied ||
      (!session?.id && !(activeId && isDirectSession && sessionLoaded))
    )
      return;

    try {
      const sessionIdToUse = session?.id || activeId;
      if (!sessionIdToUse) return;

      const response = await messageAPI.getMessages(sessionIdToUse);
      setMessages(response.messages || []);
      // Mark session as loaded if we successfully fetched messages
      if (!sessionLoaded && response.messages) {
        setSessionLoaded(true);
      }
      // Mark messages as read when viewing chat
      if (response.messages && response.messages.length > 0) {
        try {
          await messageAPI.markAsRead(sessionIdToUse);
        } catch (err) {
          console.error("Error marking messages as read:", err);
        }
      }
      // Scroll to bottom after messages are loaded
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      // Check if it's an access denied error
      const isAccessDenied =
        err.message?.includes("Access denied") || err.message?.includes("403");
      const isNotFound =
        err.message?.includes("not found") || err.message?.includes("404");

      if (isAccessDenied) {
        // Stop trying to fetch if access is denied
        setAccessDenied(true);
        setMessages([]);
        return;
      }

      // Suppress expected errors (404) - these are handled elsewhere
      if (isNotFound) {
        setMessages([]);
        return;
      }

      // Log unexpected errors
      console.error("Error fetching messages:", err);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    const currentSessionId = session?.id || (isDirectSession ? activeId : null);
    if ((!messageText.trim() && attachments.length === 0) || !currentSessionId)
      return;

    // If no session exists and this is not a direct session, create one first
    if (!session?.id && !isDirectSession && activeId) {
      try {
        // Start session first
        const videoRoomResponse = await sessionsAPI.generateVideoRoom(activeId);
        const startResponse = await sessionsAPI.startSession(
          activeId,
          videoRoomResponse.room?.roomId
        );
        setSession(startResponse.session);
        setVideoRoom(videoRoomResponse.room);
      } catch (err) {
        message.error(
          err.message ||
            (language === "ar" ? "فشل بدء الجلسة" : "Failed to start session")
        );
        return;
      }
    }

    try {
      setSending(true);

      // Determine message type based on attachments
      let messageType = "text";
      if (attachments.length > 0) {
        const hasImage = attachments.some((url) =>
          /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
        );
        const hasAudio = attachments.some((url) =>
          /\.(mp3|wav|ogg|m4a|webm)$/i.test(url)
        );
        const hasVideo = attachments.some((url) =>
          /\.(mp4|webm|ogg)$/i.test(url)
        );

        if (hasImage) messageType = "image";
        else if (hasAudio) messageType = "audio";
        else if (hasVideo) messageType = "video";
        else messageType = "file";
      }

      const targetSessionId = session?.id || currentSessionId;

      // For direct sessions, include receiverId if available from conversation
      const messageData = {
        content: messageText || (attachments.length > 0 ? "📎 ملف مرفق" : ""),
        messageType,
        attachments: attachments.length > 0 ? attachments : [],
      };

      // If it's a direct session and we have conversation data, include receiverId
      if (isDirectSession && currentConversation) {
        // For direct sessions, clientId contains the other user's ID
        // If current user is not the clientId, then clientId is the receiver
        // Otherwise, we need to find from messages or use consultantUserId if available
        let receiverId = null;
        if (
          currentConversation.clientId &&
          currentConversation.clientId !== user?.id
        ) {
          receiverId = currentConversation.clientId;
        } else if (
          currentConversation.consultantUserId &&
          currentConversation.consultantUserId !== user?.id
        ) {
          receiverId = currentConversation.consultantUserId;
        }
        if (receiverId) {
          messageData.receiverId = receiverId;
        }
      }

      await messageAPI.sendMessage(targetSessionId, messageData);
      setMessageText("");
      setAttachments([]);
      // Refresh session if it was a direct session
      if (isDirectSession && !session?.id) {
        setSession({
          id: targetSessionId,
          status: "IN_PROGRESS",
          sessionType: "chat",
        });
      }
      fetchMessages();
    } catch (err) {
      message.error(
        err.message ||
          (language === "ar" ? "فشل إرسال الرسالة" : "Failed to send message")
      );
    } finally {
      setSending(false);
    }
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleSendVoiceMessage = async () => {
    if (!audioBlob) return;

    const currentSessionId = session?.id || (isDirectSession ? activeId : null);
    if (!currentSessionId) {
      message.error(
        language === "ar" ? "لا توجد جلسة نشطة" : "No active session"
      );
      cancelRecording();
      return;
    }

    try {
      setSending(true);

      // Convert blob to file
      const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
        type: "audio/webm",
      });

      // Upload audio file
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("ownerType", "MESSAGE");
      formData.append("ownerId", currentSessionId);

      const fileResponse = await filesAPI.uploadFile(formData);
      if (!fileResponse || !fileResponse.file || !fileResponse.file.fileUrl) {
        throw new Error("Invalid file response from server");
      }

      const audioUrl = fileResponse.file.fileUrl;
      const targetSessionId = session?.id || currentSessionId;

      // Prepare message data
      const messageData = {
        content: language === "ar" ? "رسالة صوتية" : "Voice message",
        messageType: "audio",
        attachments: [audioUrl],
      };

      // For direct sessions, include receiverId if available from conversation
      if (isDirectSession && currentConversation) {
        let receiverId = null;
        if (
          currentConversation.clientId &&
          currentConversation.clientId !== user?.id
        ) {
          receiverId = currentConversation.clientId;
        } else if (
          currentConversation.consultantUserId &&
          currentConversation.consultantUserId !== user?.id
        ) {
          receiverId = currentConversation.consultantUserId;
        }
        if (receiverId) {
          messageData.receiverId = receiverId;
        }
      }

      await messageAPI.sendMessage(targetSessionId, messageData);

      // Clean up
      cancelRecording();
      fetchMessages();
      message.success(
        language === "ar" ? "تم إرسال الرسالة الصوتية" : "Voice message sent"
      );
    } catch (err) {
      console.error("Error sending voice message:", err);
      message.error(
        err.message ||
          (language === "ar"
            ? "فشل إرسال الرسالة الصوتية"
            : "Failed to send voice message")
      );
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (file) => {
    const currentSessionId = session?.id || (isDirectSession ? activeId : null);
    if (!currentSessionId) {
      message.error(
        language === "ar" ? "لا توجد جلسة نشطة" : "No active session"
      );
      return false;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ownerType", "MESSAGE");
      formData.append("ownerId", currentSessionId);

      const fileResponse = await filesAPI.uploadFile(formData);
      if (!fileResponse || !fileResponse.file || !fileResponse.file.fileUrl) {
        throw new Error("Invalid file response from server");
      }

      // Add to attachments for preview (don't send immediately)
      const newAttachments = [...attachments, fileResponse.file.fileUrl];
      setAttachments(newAttachments);

      message.success(language === "ar" ? "تم رفع الملف" : "File uploaded");
    } catch (err) {
      console.error("File upload error:", err);
      message.error(
        err.message ||
          (language === "ar" ? "فشل رفع الملف" : "Failed to upload file")
      );
    }
    return false;
  };

  const handleStartVideoCall = async () => {
    if (!activeId) return;
    try {
      setLoading(true);

      // Generate video room first
      let room = videoRoom;
      if (!room) {
        const response = await sessionsAPI.generateVideoRoom(activeId);
        room = response.room;
        setVideoRoom(room);
        message.success(
          language === "ar" ? "تم إنشاء غرفة الفيديو" : "Video room created"
        );
      }

      // Start session with room ID
      await sessionsAPI.startSession(activeId, room?.roomId);
      message.success(language === "ar" ? "تم بدء الجلسة" : "Session started");

      // Open video call in new window (Jitsi Meet works better in new window)
      if (room?.joinUrl) {
        // Open in new window for better compatibility
        const jitsiWindow = window.open(
          room.joinUrl,
          "JitsiMeet",
          "width=1200,height=800,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes"
        );
        if (jitsiWindow) {
          setShowJitsiModal(true); // Also show modal as backup
          message.success(
            language === "ar"
              ? "تم فتح المكالمة في نافذة جديدة"
              : "Video call opened in new window"
          );
        } else {
          // If popup blocked, show modal instead
          setShowJitsiModal(true);
          message.info(
            language === "ar"
              ? 'تم فتح المكالمة في النافذة المنبثقة. إذا لم تفتح، استخدم زر "فتح في نافذة جديدة"'
              : 'Video call opened. If popup was blocked, use "Open in New Window" button'
          );
        }
      } else {
        message.warning(
          language === "ar"
            ? "لم يتم العثور على رابط المكالمة"
            : "Video call URL not found"
        );
      }

      // Refresh session data
      fetchSession();
    } catch (err) {
      console.error("Video call error:", err);
      message.error(
        err.message ||
          (language === "ar"
            ? "فشل بدء المكالمة"
            : "Failed to start video call")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeId) return;
    try {
      await sessionsAPI.endSession(activeId);
      message.success(
        language === "ar" ? "تم إنهاء الجلسة" : "Session ended successfully"
      );
      navigate("/consultant/chat");
    } catch (err) {
      message.error(
        err.message ||
          (language === "ar" ? "فشل إنهاء الجلسة" : "Failed to end session")
      );
    }
  };

  const fetchAvailableBookings = async () => {
    try {
      setLoadingBookings(true);
      // Only query CONFIRMED bookings - IN_PROGRESS is a SessionStatus, not BookingStatus
      const response = await bookingsAPI.getBookings({
        status: "CONFIRMED",
      });
      setBookings(response.bookings || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await messageAPI.getConversations();
      setConversations(response.conversations || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  const handleSelectBooking = (bookingId) => {
    navigate(`/consultant/chat/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  // If no bookingId, show booking selection with list
  if (!activeId) {
    return (
      <div className="flex h-[calc(100vh-80px)] overflow-hidden rounded-2xl shadow-xl border border-gray-100 bg-white">
        {/* Bookings/Conversations Sidebar */}
        <div className="w-full md:w-[400px] flex flex-col border-r border-gray-100 bg-white z-10">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 m-0">
               <MessageOutlined className="text-green-600" />
               <span>
                 {language === "ar" ? "المحادثات والحجوزات" : "Messages & Bookings"}
               </span>
            </h2>
            <Badge count={conversations.length + bookings.length} showZero={false} color="#10b981" />
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
            {loadingBookings ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : conversations.length === 0 && bookings.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-gray-400">
                    {language === "ar"
                      ? "لا توجد محادثات أو حجوزات"
                      : "No conversations or bookings"}
                  </span>
                }
                className="py-12"
              />
            ) : (
              <>
                {/* Active Conversations Section */}
                {conversations.length > 0 && (
                  <div>
                    <h3 className="px-3 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {language === "ar" ? "المحادثات النشطة" : "Active Conversations"}
                    </h3>
                    <div className="space-y-2">
                       {conversations.map((conv) => (
                         <div
                           key={conv.id || conv.sessionId}
                           onClick={() => handleSelectBooking(conv.bookingId || conv.sessionId)}
                           className="group relative p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100 hover:shadow-sm"
                         >
                            <div className="flex items-center gap-3">
                               <div className="relative shrink-0">
                                 <Avatar 
                                   size={42} 
                                   icon={<UserOutlined />} 
                                   className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 border-2 border-white shadow-sm"
                                 />
                                 {conv.unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white ring-2 ring-white">
                                      {conv.unreadCount}
                                    </span>
                                 )}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center mb-0.5">
                                     <h4 className="font-bold text-gray-900 line-clamp-1 text-sm">{conv.name}</h4>
                                     <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0 ml-2 rtl:ml-0 rtl:mr-2">
                                        {dayjs(conv.lastMessageTime).fromNow(true)}
                                     </span>
                                  </div>
                                  <p className="text-xs text-gray-500 line-clamp-1 group-hover:text-green-600 transition-colors">
                                     {conv.lastMessage || (language === "ar" ? "لا توجد رسائل" : "No messages")}
                                  </p>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {/* Available Bookings Section */}
                {bookings.length > 0 && (
                  <div>
                    <h3 className="px-3 mb-3 mt-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {language === "ar" ? "الحجوزات المتاحة" : "Available Bookings"}
                    </h3>
                    <div className="space-y-2">
                       {bookings.map((booking) => {
                         const hasConversation = conversations.some(c => c.bookingId === booking.id);
                         return (
                           <div
                             key={booking.id}
                             onClick={() => handleSelectBooking(booking.id)}
                             className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-300 border border-gray-100 hover:border-green-200 hover:shadow-md ${hasConversation ? 'bg-gray-50 opacity-75' : 'bg-white'}`}
                           >
                              <div className="flex items-center gap-3">
                                 <Avatar 
                                   size={42} 
                                   icon={<UserOutlined />} 
                                   className="bg-green-50 text-green-600"
                                 />
                                 <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                       <h4 className="font-semibold text-gray-900 line-clamp-1 text-sm">
                                          {booking.client
                                            ? `${booking.client.firstName} ${booking.client.lastName}`
                                            : language === "ar" ? "عميل" : "Client"}
                                       </h4>
                                       <Tag color={booking.status === "CONFIRMED" ? "success" : "default"} className="m-0 text-[10px] rounded-full px-2 border-0 shrink-0 ml-2 rtl:ml-0 rtl:mr-2">
                                          {booking.status}
                                       </Tag>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-1">
                                      {booking.service
                                        ? language === "ar" ? booking.service.titleAr : booking.service.title
                                        : language === "ar" ? "استشارة" : "Consultation"}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                                       <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                                          {dayjs(booking.scheduledAt).format("YYYY-MM-DD")}
                                       </span>
                                       <span>
                                          {dayjs(booking.scheduledAt).format("HH:mm")}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                         );
                       })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Empty Chat Area / Placeholder */}
        <div className="hidden md:flex flex-1 relative overflow-hidden bg-gray-50/50 items-center justify-center">
             {/* Animated Background Elements */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-slow" />
             <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 animate-pulse-slow delay-700" />
             
             {/* Content Card */}
             <div className="relative z-10 text-center p-12 max-w-lg mx-auto">
                 <div className="mb-8 relative inline-block">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
                    <div className="relative bg-white p-6 rounded-full shadow-lg text-green-600">
                       <MessageOutlined className="text-5xl" />
                    </div>
                 </div>
                 
                 <h2 className="text-3xl font-extrabold text-gray-800 mb-4 tracking-tight">
                    {language === "ar" ? "مرحباً بك في المحادثات" : "Welcome to Messages"}
                 </h2>
                 <p className="text-gray-500 text-lg leading-relaxed mb-8">
                    {language === "ar" 
                      ? "اختر محادثة من القائمة لبدء التواصل مع عملائك. يمكنك تبادل الرسائل والملفات وإجراء مكالمات الفيديو." 
                      : "Select a conversation from the list to start connecting with your clients. You can exchange messages, files, and start video calls."}
                 </p>
                 
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-sm text-gray-400 border border-gray-100">
                    <span>🔒</span>
                    <span>{language === "ar" ? "جميع المحادثات مشفرة وآمنة" : "All conversations are encrypted and secure"}</span>
                 </div>
             </div>
        </div>
      </div>
    );
  }

  const client = booking?.client;

  // If booking not loaded yet but we have activeId, show loading
  if (!booking && activeId && !isDirectSession && !sessionLoaded && loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] dashboard-bg">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">
            {language === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // For direct sessions, if session is not loaded yet, show loading
  if (isDirectSession && !sessionLoaded && !accessDenied && loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] dashboard-bg">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">
            {language === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // If we have activeId but no booking/session data and not loading, show error or redirect
  if (activeId && !booking && !isDirectSession && !loading && !sessionLoaded) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] dashboard-bg">
        <div className="text-center">
          <Empty
            description={
              language === "ar"
                ? "لم يتم العثور على المحادثة"
                : "Conversation not found"
            }
          />
          <Button
            type="primary"
            onClick={() => navigate("/consultant/chat")}
            className="mt-4"
          >
            {language === "ar"
              ? "العودة إلى المحادثات"
              : "Back to Conversations"}
          </Button>
        </div>
      </div>
    );
  }

  // If direct session but no session data and not loading, show error
  if (isDirectSession && !sessionLoaded && !loading && !accessDenied) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] dashboard-bg">
        <div className="text-center">
          <Empty
            description={
              language === "ar"
                ? "لم يتم العثور على المحادثة"
                : "Conversation not found"
            }
          />
          <Button
            type="primary"
            onClick={() => navigate("/consultant/chat")}
            className="mt-4"
          >
            {language === "ar"
              ? "العودة إلى المحادثات"
              : "Back to Conversations"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#f0f2f5] relative font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-[#e8f5e9] to-[#b9f6ca] rounded-full blur-3xl opacity-40 mix-blend-multiply filter" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-tr from-[#e0f7fa] to-[#80deea] rounded-full blur-3xl opacity-40 mix-blend-multiply filter" />
      </div>

      <div className="flex w-full h-full relative z-10 p-4 gap-4 max-w-[1920px] mx-auto">
        {/* Sidebar */}
        <div className={`
          flex flex-col bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl overflow-hidden transition-all duration-300
          ${activeId && !isDirectSession ? 'hidden md:flex w-full md:w-[380px] lg:w-[420px]' : 'w-full md:w-[380px] lg:w-[420px]'}
        `}>
          {/* Sidebar Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-green-200">
                <MessageOutlined className="text-xl" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-lg leading-tight">
                  {language === "ar" ? "المحادثات" : "Messages"}
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  {conversations.length + bookings.filter(b => !conversations.some(c => c.bookingId === b.id)).length} {language === "ar" ? "محادثة نشطة" : "Active chats"}
                </p>
              </div>
            </div>
            <Button
              type="text"
              icon={<UserOutlined />}
              onClick={() => navigate("/consultant/profile")}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-xl w-10 h-10 flex items-center justify-center transition-colors"
            />
          </div>

          {/* Search/Filter (Placeholder) */}
          <div className="px-5 py-3">
            <Input
              placeholder={language === "ar" ? "بحث عن محادثة..." : "Search conversations..."}
              className="rounded-xl border-gray-200 bg-gray-50/50 hover:bg-white hover:border-green-300 focus:border-green-500 focus:shadow-sm transition-all"
              prefix={<UserOutlined className="text-gray-400" />}
              variant="filled"
            />
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
            {loadingBookings ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <Spin size="large" />
              </div>
            ) : (
              <List
                dataSource={[
                  ...conversations.map((c) => ({ ...c, type: "conversation" })),
                  ...bookings
                    .filter(
                      (b) => !conversations.some((c) => c.bookingId === b.id)
                    )
                    .map((b) => ({ ...b, type: "booking" })),
                ]}
                renderItem={(item) => {
                  const isActive =
                    item.id === activeId ||
                    item.bookingId === activeId ||
                    item.id === booking?.id;
                  const unreadCount = item.unreadCount || 0;
                  const clientName =
                    item.type === "conversation"
                      ? item.name
                      : item.client
                      ? `${item.client.firstName} ${item.client.lastName}`
                      : language === "ar"
                      ? "عميل"
                      : "Client";

                  return (
                    <div
                      key={item.id || item.bookingId}
                      onClick={() => handleSelectBooking(item.bookingId || item.id)}
                      className={`
                        group relative p-3 mb-2 rounded-2xl cursor-pointer transition-all duration-200 ease-out border
                        ${isActive 
                          ? "bg-white border-green-100 shadow-lg shadow-green-100/40 translate-x-1" 
                          : "bg-transparent border-transparent hover:bg-white/60 hover:border-white hover:shadow-sm"
                        }
                      `}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <Avatar
                            size={52}
                            src={item.avatar || (item.client ? item.client.profilePicture : null)}
                            className={`
                              shadow-md border-2 transition-transform duration-300 group-hover:scale-105
                              ${isActive ? "border-green-400" : "border-white"}
                            `}
                            icon={<UserOutlined />}
                          >
                            {clientName?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          {item.status === "CONFIRMED" && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className={`font-bold text-[15px] truncate ${isActive ? "text-gray-900" : "text-gray-700"}`}>
                              {clientName}
                            </h3>
                            <span className={`text-[11px] font-medium ${isActive ? "text-green-600" : "text-gray-400"}`}>
                              {item.lastMessageTime
                                ? dayjs(item.lastMessageTime).format("HH:mm")
                                : item.scheduledAt
                                ? dayjs(item.scheduledAt).format("MMM DD")
                                : ""}
                            </span>
                          </div>
                          <div className="flex justify-between items-end">
                            <p className={`text-sm truncate max-w-[85%] ${isActive ? "text-gray-600 font-medium" : "text-gray-500"}`}>
                              {item.lastMessage || (
                                <span className="italic opacity-70">
                                  {item.service 
                                    ? (language === "ar" ? item.service.titleAr : item.service.title) 
                                    : (language === "ar" ? "ابدأ المحادثة" : "Start conversation")}
                                </span>
                              )}
                            </p>
                            {unreadCount > 0 && (
                              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-green-500 text-white text-[10px] font-bold rounded-full shadow-lg shadow-green-200">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`
          flex-1 flex flex-col bg-white/90 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden relative
          ${!activeId ? 'hidden md:flex' : 'flex'}
        `}>
          {!activeId ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-white/50 to-gray-50/50">
              <div className="w-32 h-32 bg-gradient-to-tr from-green-100 to-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse-slow">
                <MessageOutlined className="text-6xl text-green-500/80" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                {language === "ar" ? "أهلاً بك 👋" : "Welcome Back 👋"}
              </h2>
              <p className="text-gray-500 max-w-md text-lg leading-relaxed">
                {language === "ar" 
                  ? "اختر محادثة من القائمة لبدء التواصل مع عملائك وتنمية أعمالك."
                  : "Select a conversation from the list to start connecting with your clients and growing your business."}
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-20 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm z-20 sticky top-0">
                <div className="flex items-center gap-4">
                  <Button 
                    className="md:hidden -ml-2 mr-2 text-gray-500" 
                    type="text" 
                    icon={<UserOutlined className="rotate-180" />} // Using basic icon for back arrow approximation if needed, or just standard arrow
                    onClick={() => navigate("/consultant/chat")}
                  />
                  <div className="relative">
                    <Avatar
                      src={isDirectSession ? currentConversation?.avatar : client?.user?.avatar || client?.profilePicture}
                      size={48}
                      className="border-2 border-white shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                      icon={<UserOutlined />}
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {isDirectSession
                        ? currentConversation?.name || (language === "ar" ? "المستخدم" : "User")
                        : client 
                        ? `${client.firstName} ${client.lastName}` 
                        : (language === "ar" ? "العميل" : "Client")}
                    </h3>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-xs font-medium text-green-600">
                         {isDirectSession 
                           ? (language === "ar" ? "محادثة مباشرة" : "Direct Chat")
                           : booking?.service 
                             ? (language === "ar" ? booking.service.titleAr : booking.service.title)
                             : (language === "ar" ? "استشارة" : "Consultation")}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<VideoCameraOutlined />}
                    onClick={handleStartVideoCall}
                    disabled={session?.status === "COMPLETED" || isDirectSession}
                    className={`
                      flex items-center justify-center shadow-lg shadow-green-200 border-0
                      ${(session?.status === "COMPLETED" || isDirectSession) ? 'bg-gray-200 text-gray-400' : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'}
                    `}
                    title={language === "ar" ? "بدء مكالمة فيديو" : "Start Video Call"}
                  />
                  <Button
                    type="default"
                    shape="circle"
                    size="large"
                    icon={<PhoneOutlined />}
                    className="border-gray-200 text-gray-600 hover:text-green-600 hover:border-green-200 hover:bg-green-50"
                  />
                  {/* More options dropdown could go here */}
                </div>
              </div>

              {/* Messages List - The Critical Scrollable Area */}
              <div 
                className="flex-1 overflow-y-auto px-4 py-6 bg-[#f8f9fa]"
                style={{
                  backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
                  backgroundSize: "24px 24px"
                }}
              >
                <div className="max-w-4xl mx-auto space-y-6 min-h-full flex flex-col justify-end pb-4">
                  {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-60">
                       <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                         <MessageOutlined className="text-3xl text-gray-400" />
                       </div>
                       <p className="text-gray-500">{language === "ar" ? "ابدأ المحادثة الآن" : "Start the conversation now"}</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isOwnMessage = msg.senderId === user?.id;
                      const msgAttachments = msg.attachments ? (typeof msg.attachments === "string" ? JSON.parse(msg.attachments) : msg.attachments) : [];
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} group animate-fadeIn`}
                        >
                          <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                            <div className={`
                              relative px-5 py-3.5 shadow-sm text-[15px] leading-relaxed break-words
                              ${isOwnMessage 
                                ? "bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-2xl rounded-tr-sm" 
                                : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm"
                              }
                            `}>
                              {/* Attachments rendering logic remains similar but styled */}
                              {msgAttachments.length > 0 && (
                                <div className="mb-3 space-y-2">
                                  {msgAttachments.map((url, idx) => (
                                    <div key={idx} className="rounded-lg overflow-hidden bg-black/10">
                                      {/\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? (
                                        <Image src={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`} className="max-w-full object-cover" />
                                      ) : /\.(mp3|wav|ogg|m4a|webm)$/i.test(url) ? (
                                        <div className="min-w-[200px] p-2 bg-white/20 backdrop-blur-md rounded-lg">
                                           <WhatsAppAudioPlayer 
                                              audioUrl={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`}
                                              currentUserId={user?.id}
                                              senderId={msg.senderId}
                                           />
                                        </div>
                                      ) : (
                                        <div className="p-3 flex items-center gap-2 bg-white/10 backdrop-blur-sm">
                                          <FileOutlined className="text-lg opacity-80" />
                                          <span className="text-xs underline opacity-80 truncate">{url.split('/').pop()}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              
                              <div className={`
                                text-[10px] mt-1 font-medium flex items-center gap-1 opacity-70
                                ${isOwnMessage ? "justify-end text-white/90" : "justify-start text-gray-400"}
                              `}>
                                {dayjs(msg.createdAt).format("HH:mm")}
                                {isOwnMessage && <span>•</span>}
                                {isOwnMessage && (msg.isRead ? "Read" : "Sent")} 
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Attachments Preview Bar */}
              {attachments.length > 0 && (
                 <div className="px-6 py-3 bg-white/90 border-t border-gray-100 flex gap-3 overflow-x-auto">
                    {attachments.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden group">
                         <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center z-10">
                            <Button 
                              type="text" 
                              icon={<CloseOutlined className="text-white" />} 
                              onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} 
                              size="small"
                            />
                         </div>
                         {/* Thumbnail logic would go here, simplified for now */}
                         <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                            <FileOutlined />
                         </div>
                      </div>
                    ))}
                 </div>
              )}

              {/* Input Area - Floats above bottom */}
              <div className="p-5 bg-white backdrop-blur-md z-20">
                <div className="flex items-end gap-3 bg-gray-50 p-2 pr-3 rounded-[28px] border border-gray-200 transition-all focus-within:ring-2 focus-within:ring-green-100 focus-within:border-green-300 focus-within:bg-white shadow-sm">
{/* Input Field or Voice Review - Swaps based on state */}
                  {audioBlob ? (
                    <div className="flex-1 flex items-center gap-2 p-2 min-h-[44px]">
                       <Button 
                         type="text" 
                         danger
                         shape="circle" 
                         icon={<DeleteOutlined />} 
                         onClick={cancelRecording}
                         title={language === "ar" ? "إلغاء" : "Cancel"}
                       />
                       <div className="flex-1 px-2">
                          <audio src={audioUrl} controls className="w-full h-8" />
                       </div>
                       <Button
                         type="primary"
                         shape="circle"
                         icon={<SendOutlined />}
                         onClick={handleSendVoiceMessage}
                         loading={sending}
                         className="bg-green-600 hover:bg-green-700"
                         title={language === "ar" ? "إرسال" : "Send"}
                       />
                    </div>
                  ) : (
                    <>
                      {/* Tools Group */}
                      <div className="flex items-center gap-1 pl-1">
                         <Button 
                           type="text" 
                           shape="circle" 
                           icon={<SmileOutlined className="text-xl text-gray-500" />} 
                           className="hover:bg-gray-200/50 hover:text-gray-700"
                           onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                         />
                         <Upload showUploadList={false} beforeUpload={handleFileUpload} multiple>
                            <Button 
                              type="text" 
                              shape="circle" 
                              icon={<PaperClipOutlined className="text-xl text-gray-500" />} 
                              className="hover:bg-gray-200/50 hover:text-gray-700"
                            />
                         </Upload>
                      </div>

                      {/* Input Field */}
                      <div className="flex-1 py-1.5 min-h-[44px]">
                        <TextArea
                           value={messageText}
                           onChange={(e) => setMessageText(e.target.value)}
                           placeholder={isRecording ? (language === "ar" ? "جاري التسجيل..." : "Recording audio...") : (language === "ar" ? "اكتب رسالتك..." : "Type a message...")}
                           autoSize={{ minRows: 1, maxRows: 4 }}
                           variant="borderless"
                           disabled={isRecording}
                           onPressEnter={(e) => {
                              if(!e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                              }
                           }}
                           style={{ 
                             padding: 0, 
                             resize: 'none', 
                             minHeight: '24px',
                             fontSize: '15px',
                             lineHeight: '1.5'
                           }}
                           className="bg-transparent focus:shadow-none !shadow-none"
                        />
                      </div>

                      {/* Voice/Send Actions */}
                      <div className="flex items-center gap-2 pb-0.5">
                         {!messageText.trim() && attachments.length === 0 ? (
                           <Button 
                             type={isRecording ? "primary" : "text"}
                             danger={isRecording}
                             shape="circle" 
                             size="large"
                             icon={isRecording ? <StopOutlined /> : <AudioOutlined className="text-xl" />} 
                             onClick={handleVoiceRecording}
                             className={`transition-all duration-300 ${isRecording ? "scale-110 shadow-md shadow-red-200 animate-pulse" : "text-gray-500 hover:bg-gray-200/50 hover:text-gray-700"}`}
                             title={isRecording ? (language === "ar" ? "إيقاف التسجيل" : "Stop Recording") : (language === "ar" ? "تسجيل صوتي" : "Record Audio")}
                           />
                         ) : (
                           <Button
                             type="primary"
                             shape="circle"
                             size="large"
                             icon={<SendOutlined className="-ml-0.5 mt-0.5" />}
                             onClick={handleSend}
                             loading={sending}
                             className="bg-green-600 hover:bg-green-700 shadow-md shadow-green-200 border-0 scale-100 transition-transform active:scale-95"
                           />
                         )}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Emoji Picker Drawer/Popover would ideally be floating */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-4 left-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-w-xs grid grid-cols-6 gap-2">
                     {["😀", "😂", "🥰", "😎", "🤔", "👍"].map(emoji => (
                       <button 
                         key={emoji}
                         onClick={() => { setMessageText(p => p + emoji); setShowEmojiPicker(false); }}
                         className="text-2xl hover:bg-gray-100 p-2 rounded-lg transition-colors"
                       >
                         {emoji}
                       </button>
                     ))}
                     {/* Full picker omitted for brevity */}
                  </div>
                )}
                
                {/* Recording Status Bar (Overlay) */}
                {isRecording && (
                   <div className="absolute inset-x-4 bottom-24 bg-red-50 text-red-600 rounded-xl p-4 flex items-center justify-between shadow-lg border border-red-100 animate-slideUp">
                      <div className="flex items-center gap-3">
                         <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                         <span className="font-mono font-bold">{formatTime(recordingTime)}</span>
                      </div>
                      <span className="text-sm font-medium">{language === "ar" ? "جاري التسجيل..." : "Recording audio..."}</span>
                   </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        title={language === "ar" ? "مكالمة فيديو - Jitsi Meet" : "Video Call - Jitsi Meet"}
        open={showJitsiModal}
        onCancel={() => setShowJitsiModal(false)}
        footer={null} // Cleaner footer
        centered
        width={1000}
        destroyOnHidden
        className="rounded-2xl overflow-hidden"
      >
         {/* Modal content similar to before but cleaned up */}
          <div className="h-[70vh] w-full bg-gray-900 rounded-xl overflow-hidden flex flex-col relative">
             {videoRoom?.joinUrl ? (
                <>
                  <iframe 
                    src={videoRoom.joinUrl} 
                    className="w-full h-full border-0" 
                    allow="camera; microphone; fullscreen; display-capture; autoplay" 
                  />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                     <Button 
                       type="primary" 
                       size="large"
                       onClick={() => window.open(videoRoom.joinUrl, "_blank", "width=1200,height=800")}
                       className="shadow-lg"
                     >
                       {language === "ar" ? "فتح في نافذة خارجية" : "Open in New Window"}
                     </Button>
                  </div>
                </>
             ) : (
                <div className="text-white text-center m-auto">Loading call...</div>
             )}
          </div>
      </Modal>
    </div>
  );
};

export default ConsultantChat;
