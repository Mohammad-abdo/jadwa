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
      <div className="flex h-[calc(100vh-200px)] gap-4">
        {/* Bookings/Conversations Sidebar */}
        <div className="w-1/3 min-w-[300px]">
          <Card
            title={
              <div className="flex items-center gap-2">
                <MessageOutlined />
                <span>
                  {language === "ar"
                    ? "المحادثات والحجوزات"
                    : "Conversations & Bookings"}
                </span>
              </div>
            }
            className="h-full"
            styles={{
              body: {
                padding: 0,
                height: "calc(100% - 57px)",
                overflow: "auto",
              },
            }}
          >
            {loadingBookings ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="large" />
              </div>
            ) : conversations.length === 0 && bookings.length === 0 ? (
              <Empty
                description={
                  language === "ar"
                    ? "لا توجد محادثات أو حجوزات"
                    : "No conversations or bookings"
                }
                className="py-12"
              />
            ) : (
              <div>
                {/* Active Conversations */}
                {conversations.length > 0 && (
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-sm text-gray-600 mb-2">
                      {language === "ar"
                        ? "المحادثات النشطة"
                        : "Active Conversations"}
                    </h3>
                    <List
                      dataSource={conversations}
                      renderItem={(conv) => {
                        const unreadCount = conv.unreadCount || 0;
                        return (
                          <List.Item
                            className="cursor-pointer hover:bg-gray-50 px-4 py-3 border-b"
                            onClick={() =>
                              handleSelectBooking(
                                conv.bookingId || conv.sessionId
                              )
                            }
                          >
                            <List.Item.Meta
                              avatar={
                                <Badge count={unreadCount} size="small">
                                  <Avatar icon={<UserOutlined />} />
                                </Badge>
                              }
                              title={
                                <span className="font-medium">{conv.name}</span>
                              }
                              description={
                                <div>
                                  <p className="text-xs text-gray-500 truncate">
                                    {conv.lastMessage ||
                                      (language === "ar"
                                        ? "لا توجد رسائل"
                                        : "No messages")}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {dayjs(conv.lastMessageTime).fromNow()}
                                  </p>
                                </div>
                              }
                            />
                          </List.Item>
                        );
                      }}
                    />
                  </div>
                )}

                {/* Available Bookings */}
                {bookings.length > 0 && (
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-gray-600 mb-2">
                      {language === "ar"
                        ? "الحجوزات المتاحة"
                        : "Available Bookings"}
                    </h3>
                    <List
                      dataSource={bookings}
                      renderItem={(booking) => {
                        const hasConversation = conversations.some(
                          (c) => c.bookingId === booking.id
                        );
                        return (
                          <List.Item
                            className={`cursor-pointer hover:bg-gray-50 px-4 py-3 border-b ${
                              hasConversation ? "opacity-75" : ""
                            }`}
                            onClick={() => handleSelectBooking(booking.id)}
                          >
                            <List.Item.Meta
                              avatar={<Avatar icon={<UserOutlined />} />}
                              title={
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {booking.client
                                      ? `${booking.client.firstName} ${booking.client.lastName}`
                                      : language === "ar"
                                      ? "عميل"
                                      : "Client"}
                                  </span>
                                  <Tag
                                    color={
                                      booking.status === "CONFIRMED"
                                        ? "green"
                                        : "blue"
                                    }
                                    size="small"
                                  >
                                    {booking.status}
                                  </Tag>
                                </div>
                              }
                              description={
                                <div>
                                  <p className="text-xs text-gray-500">
                                    {booking.service
                                      ? language === "ar"
                                        ? booking.service.titleAr
                                        : booking.service.title
                                      : language === "ar"
                                      ? "استشارة"
                                      : "Consultation"}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {dayjs(booking.scheduledAt).format(
                                      "YYYY-MM-DD HH:mm"
                                    )}
                                  </p>
                                </div>
                              }
                            />
                          </List.Item>
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Empty Chat Area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12 px-6">
            <div className="mb-6">
              <MessageOutlined className="text-7xl text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-700">
              {language === "ar"
                ? "اختر محادثة للبدء"
                : "Select a Conversation to Start"}
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-base">
              {language === "ar"
                ? "اختر محادثة من القائمة الجانبية للبدء في الدردشة مع العميل"
                : "Select a conversation from the sidebar to start chatting with the client"}
            </p>
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
    <div
      className="flex h-[calc(100vh-64px)] gap-4 dashboard-bg relative"
      style={{ margin: "-12px -12px 0 -12px", width: "calc(100% + 24px)" }}
    >
      {/* Modern Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-br from-olive-green-100/20 to-turquoise-100/20 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-tr from-teal-100/20 to-olive-green-100/20 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Bookings/Conversations Sidebar */}
      <div className="w-1/3 min-w-[300px] max-w-[400px] glass-card border-r border-gray-200/50 flex flex-col shadow-professional-lg relative z-10">
        {/* Sidebar Header */}
        <div className="px-4 py-3 border-b border-gray-200/50 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageOutlined className="text-olive-green-600" />
            <span className="font-semibold text-gray-900">
              {language === "ar" ? "المحادثات" : "Conversations"}
            </span>
          </div>
          <Button
            type="text"
            size="small"
            onClick={() => navigate("/consultant/chat")}
            className="text-gray-500 hover:text-gray-700"
          >
            {language === "ar" ? "عرض الكل" : "View All"}
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loadingBookings ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="small" />
            </div>
          ) : (
            <List
              className="px-0"
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
                  <List.Item
                    className={`cursor-pointer px-4 py-3 border-b border-gray-100  ${
                      isActive
                        ? "bg-olive-green-50 border-l-4 border-l-olive-green-600"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      handleSelectBooking(item.bookingId || item.id)
                    }
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge
                          count={unreadCount > 0 ? unreadCount : 0}
                          size="small"
                          offset={[-5, 5]}
                          showZero={false}
                        >
                          <Avatar
                            icon={<UserOutlined />}
                            size={48}
                            className="shadow-sm"
                          />
                        </Badge>
                      }
                      title={
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-semibold text-sm ${
                              isActive
                                ? "text-olive-green-700"
                                : "text-gray-900"
                            }`}
                          >
                            {clientName}
                          </span>
                          {item.status && (
                            <Tag
                              color={
                                item.status === "CONFIRMED"
                                  ? "green"
                                  : item.status === "IN_PROGRESS"
                                  ? "blue"
                                  : "default"
                              }
                              size="small"
                              className="text-xs"
                            >
                              {item.status}
                            </Tag>
                          )}
                        </div>
                      }
                      description={
                        <div className="mt-1">
                          <p className="text-xs text-gray-600 truncate mb-1">
                            {item.lastMessage ||
                              (item.service
                                ? language === "ar"
                                  ? item.service.titleAr
                                  : item.service.title
                                : language === "ar"
                                ? "استشارة"
                                : "Consultation")}
                          </p>
                          <p className="text-xs text-gray-400">
                            {item.lastMessageTime
                              ? dayjs(item.lastMessageTime).fromNow()
                              : item.scheduledAt
                              ? dayjs(item.scheduledAt).format("MMM DD, HH:mm")
                              : ""}
                          </p>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col glass-card overflow-hidden shadow-professional-lg relative z-10">
        {/* Show loading if data is not ready */}
        {((activeId && !isDirectSession && !booking && !sessionLoaded) ||
          (isDirectSession && !sessionLoaded && !accessDenied)) &&
        loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Spin size="large" />
              <p className="mt-4 text-gray-500">
                {language === "ar"
                  ? "جاري تحميل المحادثة..."
                  : "Loading conversation..."}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header Bar - WhatsApp/Facebook Style - Fixed */}
            <div className="border-b border-gray-200/50 px-4 py-3 flex items-center justify-between shadow-professional z-10 sticky top-0 flex-shrink-0 backdrop-blur-sm">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar
                  src={
                    isDirectSession
                      ? currentConversation?.avatar
                      : client?.user?.avatar || client?.profilePicture
                  }
                  size={40}
                  icon={<UserOutlined />}
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-gray-900 truncate">
                    {isDirectSession
                      ? currentConversation?.name ||
                        currentConversation?.clientName ||
                        currentConversation?.consultantName ||
                        (language === "ar" ? "المستخدم" : "User")
                      : client
                      ? `${client.firstName} ${client.lastName}`
                      : language === "ar"
                      ? "العميل"
                      : "Client"}
                  </h2>
                  <p className="text-xs text-gray-500 truncate">
                    {isDirectSession
                      ? language === "ar"
                        ? "محادثة مباشرة"
                        : "Direct Message"
                      : booking?.service
                      ? language === "ar"
                        ? booking.service.titleAr
                        : booking.service.title
                      : language === "ar"
                      ? "استشارة"
                      : "Consultation"}
                  </p>
                </div>
              </div>
              <Space className="flex-shrink-0">
                <Button
                  type="text"
                  icon={<VideoCameraOutlined />}
                  className="text-gray-600 hover:text-gray-900"
                  onClick={handleStartVideoCall}
                  disabled={session?.status === "COMPLETED" || isDirectSession}
                  title={language === "ar" ? "مكالمة فيديو" : "Video Call"}
                />
                {session?.status === "IN_PROGRESS" && !isDirectSession && (
                  <Button
                    type="text"
                    danger
                    onClick={handleEndSession}
                    title={language === "ar" ? "إنهاء الجلسة" : "End Session"}
                  >
                    {language === "ar" ? "إنهاء" : "End"}
                  </Button>
                )}
              </Space>
            </div>

            {/* Messages Area - Takes remaining space - Only this scrolls */}
            <div
              className="flex-1 overflow-y-auto px-4 py-6 min-h-0"
              style={{
                scrollBehavior: "smooth",
                backgroundImage:
                  "radial-gradient(circle, rgba(122, 140, 102, 0.1) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              <div className="max-w-4xl mx-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <div className="text-4xl mb-2">💬</div>
                    <p>
                      {language === "ar"
                        ? "لا توجد رسائل بعد"
                        : "No messages yet"}
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isOwnMessage = msg.senderId === user?.id;
                    const msgAttachments = msg.attachments
                      ? typeof msg.attachments === "string"
                        ? JSON.parse(msg.attachments)
                        : msg.attachments
                      : [];
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const showAvatar =
                      !prevMsg || prevMsg.senderId !== msg.senderId;
                    const showTime =
                      !prevMsg ||
                      dayjs(msg.createdAt).diff(
                        dayjs(prevMsg.createdAt),
                        "minute"
                      ) > 5;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        } items-end gap-2 ${showTime ? "mt-4" : ""}`}
                      >
                        {!isOwnMessage && (
                          <Avatar
                            src={
                              isDirectSession
                                ? currentConversation?.avatar
                                : client?.user?.avatar || client?.profilePicture
                            }
                            size={32}
                            icon={<UserOutlined />}
                            className="flex-shrink-0"
                          />
                        )}
                        <div
                          className={`flex flex-col ${
                            isOwnMessage ? "items-end" : "items-start"
                          } max-w-[70%] md:max-w-[60%]`}
                        >
                          {showTime && (
                            <div className="text-center w-full mb-2">
                              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                                {dayjs(msg.createdAt).format(
                                  "MMM DD, YYYY HH:mm"
                                )}
                              </span>
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwnMessage
                                ? "bg-[#dcf8c6] text-gray-900 rounded-tr-sm"
                                : "bg-white text-gray-900 rounded-tl-sm shadow-sm"
                            }`}
                          >
                            {msgAttachments.length > 0 && (
                              <div className="mb-2 space-y-2">
                                {msgAttachments.map((url, idx) => {
                                  // Check if URL is a base64 data URI
                                  const isBase64 =
                                    url.startsWith("data:image/") ||
                                    url.startsWith("data:video/") ||
                                    url.startsWith("data:audio/");
                                  const isImage =
                                    msg.messageType === "image" ||
                                    /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ||
                                    (isBase64 && url.startsWith("data:image/"));
                                  const isAudio =
                                    msg.messageType === "audio" ||
                                    /\.(mp3|wav|ogg|m4a|webm)$/i.test(url) ||
                                    (isBase64 && url.startsWith("data:audio/"));
                                  const isVideo =
                                    msg.messageType === "video" ||
                                    (/\.(mp4|webm)$/i.test(url) &&
                                      msg.messageType !== "audio") ||
                                    (isBase64 && url.startsWith("data:video/"));

                                  if (isImage) {
                                    return (
                                      <div
                                        key={idx}
                                        className="image-attachment mb-2 -mx-2"
                                      >
                                        {isBase64 ? (
                                          <img
                                            src={url}
                                            alt="Image attachment"
                                            style={{
                                              maxWidth: "100%",
                                              maxHeight: "300px",
                                              borderRadius: "8px",
                                              display: "block",
                                              objectFit: "cover",
                                              width: "100%",
                                            }}
                                            onError={(e) => {
                                              const imgElement = e.target;
                                              if (imgElement) {
                                                imgElement.style.display =
                                                  "none";
                                                const parent =
                                                  imgElement.closest(
                                                    ".image-attachment"
                                                  );
                                                if (
                                                  parent &&
                                                  !parent.querySelector(
                                                    ".image-error-fallback"
                                                  )
                                                ) {
                                                  const fallback =
                                                    document.createElement(
                                                      "div"
                                                    );
                                                  fallback.className =
                                                    "image-error-fallback text-center p-4 bg-gray-100 rounded text-gray-500 text-sm";
                                                  fallback.textContent =
                                                    language === "ar"
                                                      ? "تعذر تحميل الصورة"
                                                      : "Image unavailable";
                                                  parent.appendChild(fallback);
                                                }
                                              }
                                            }}
                                          />
                                        ) : (
                                          <Image
                                            key={idx}
                                            src={
                                              url.startsWith("http")
                                                ? url
                                                : url.startsWith("/uploads")
                                                ? `${
                                                    import.meta.env.VITE_API_URL?.replace(
                                                      "/api",
                                                      ""
                                                    ) || "http://localhost:5000"
                                                  }${url}`
                                                : url.startsWith("/")
                                                ? `${
                                                    import.meta.env.VITE_API_URL?.replace(
                                                      "/api",
                                                      ""
                                                    ) || "http://localhost:5000"
                                                  }${url}`
                                                : `${
                                                    import.meta.env.VITE_API_URL?.replace(
                                                      "/api",
                                                      ""
                                                    ) || "http://localhost:5000"
                                                  }/uploads/MESSAGE/${url
                                                    .split("/")
                                                    .pop()}`
                                            }
                                            alt="Image attachment"
                                            style={{
                                              maxWidth: "100%",
                                              maxHeight: "300px",
                                              borderRadius: "8px",
                                              display: "block",
                                              objectFit: "cover",
                                              width: "100%",
                                            }}
                                            preview={{
                                              mask:
                                                language === "ar"
                                                  ? "معاينة"
                                                  : "Preview",
                                            }}
                                            onError={(e) => {
                                              // Only log in development to reduce console noise
                                              if (import.meta.env.DEV) {
                                                console.warn(
                                                  "Image failed to load:",
                                                  url
                                                );
                                              }
                                              // Hide the broken image and show fallback
                                              const imgElement = e.target;
                                              if (imgElement) {
                                                imgElement.style.display =
                                                  "none";
                                                // Show a fallback message
                                                const parent =
                                                  imgElement.closest(
                                                    ".image-attachment"
                                                  );
                                                if (
                                                  parent &&
                                                  !parent.querySelector(
                                                    ".image-error-fallback"
                                                  )
                                                ) {
                                                  const fallback =
                                                    document.createElement(
                                                      "div"
                                                    );
                                                  fallback.className =
                                                    "image-error-fallback text-center p-4 bg-gray-100 rounded text-gray-500 text-sm";
                                                  fallback.textContent =
                                                    language === "ar"
                                                      ? "تعذر تحميل الصورة"
                                                      : "Image unavailable";
                                                  parent.appendChild(fallback);
                                                }
                                              }
                                            }}
                                          />
                                        )}
                                      </div>
                                    );
                                  } else if (isAudio) {
                                    const audioSrc = url.startsWith("http")
                                      ? url
                                      : url.startsWith("/uploads")
                                      ? `${
                                          import.meta.env.VITE_API_URL?.replace(
                                            "/api",
                                            ""
                                          ) || "http://localhost:5000"
                                        }${url}`
                                      : url.startsWith("/")
                                      ? `${
                                          import.meta.env.VITE_API_URL?.replace(
                                            "/api",
                                            ""
                                          ) || "http://localhost:5000"
                                        }${url}`
                                      : `${
                                          import.meta.env.VITE_API_URL?.replace(
                                            "/api",
                                            ""
                                          ) || "http://localhost:5000"
                                        }/uploads/MESSAGE/${url
                                          .split("/")
                                          .pop()}`;
                                    return (
                                      <div
                                        key={idx}
                                        className="audio-attachment"
                                      >
                                        <WhatsAppAudioPlayer
                                          src={audioSrc}
                                          isOwnMessage={isOwnMessage}
                                          language={language}
                                        />
                                      </div>
                                    );
                                  } else if (isVideo) {
                                    const videoSrc = url.startsWith("http")
                                      ? url
                                      : url.startsWith("/uploads")
                                      ? `${
                                          import.meta.env.VITE_API_URL?.replace(
                                            "/api",
                                            ""
                                          ) || "http://localhost:5000"
                                        }${url}`
                                      : url.startsWith("/")
                                      ? `${
                                          import.meta.env.VITE_API_URL?.replace(
                                            "/api",
                                            ""
                                          ) || "http://localhost:5000"
                                        }${url}`
                                      : `${
                                          import.meta.env.VITE_API_URL?.replace(
                                            "/api",
                                            ""
                                          ) || "http://localhost:5000"
                                        }/uploads/MESSAGE/${url
                                          .split("/")
                                          .pop()}`;
                                    return (
                                      <div
                                        key={idx}
                                        className="video-attachment"
                                      >
                                        <video
                                          controls
                                          src={videoSrc}
                                          className="w-full max-w-md rounded"
                                          onError={(e) => {
                                            if (import.meta.env.DEV) {
                                              console.warn(
                                                "Video failed to load:",
                                                videoSrc
                                              );
                                            }
                                            const videoElement = e.target;
                                            if (videoElement) {
                                              videoElement.style.display =
                                                "none";
                                              const parent =
                                                videoElement.closest(
                                                  ".video-attachment"
                                                );
                                              if (
                                                parent &&
                                                !parent.querySelector(
                                                  ".video-error-fallback"
                                                )
                                              ) {
                                                const fallback =
                                                  document.createElement("div");
                                                fallback.className =
                                                  "video-error-fallback text-center p-4 bg-gray-100 rounded text-gray-500 text-sm";
                                                fallback.textContent =
                                                  language === "ar"
                                                    ? "تعذر تحميل الفيديو"
                                                    : "Video unavailable";
                                                parent.appendChild(fallback);
                                              }
                                            }
                                          }}
                                        />
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div
                                        key={idx}
                                        className={`file-attachment flex items-center gap-2 p-2 rounded ${
                                          isOwnMessage
                                            ? "bg-white/50"
                                            : "bg-gray-100"
                                        }`}
                                      >
                                        <FileOutlined
                                          className={
                                            isOwnMessage
                                              ? "text-gray-700"
                                              : "text-blue-600"
                                          }
                                        />
                                        <a
                                          href={url}
                                          download
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`text-sm ${
                                            isOwnMessage
                                              ? "text-gray-700 hover:text-gray-900"
                                              : "text-blue-600 hover:text-blue-800"
                                          }`}
                                        >
                                          {url.split("/").pop()}
                                        </a>
                                      </div>
                                    );
                                  }
                                })}
                              </div>
                            )}
                            {msg.content &&
                              msg.content.trim() &&
                              !(
                                msg.messageType === "image" &&
                                msgAttachments.length > 0 &&
                                !msg.content.includes("📎")
                              ) && (
                                <p
                                  className={`text-sm ${
                                    msgAttachments.length > 0 ? "mt-2" : ""
                                  } whitespace-pre-wrap break-words`}
                                >
                                  {msg.content}
                                </p>
                              )}
                            <span
                              className={`text-xs mt-1 ${
                                isOwnMessage ? "text-gray-600" : "text-gray-500"
                              } self-end`}
                            >
                              {dayjs(msg.createdAt).format("HH:mm")}
                            </span>
                          </div>
                        </div>
                        {isOwnMessage && (
                          <Avatar
                            src={user?.avatar}
                            size={32}
                            icon={<UserOutlined />}
                            className="flex-shrink-0"
                          />
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mb-3 pb-3 border-b border-gray-200 px-4">
                <div className="flex flex-wrap gap-3">
                  {attachments.map((url, idx) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                    const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
                    const isAudio = /\.(mp3|wav|ogg|m4a|webm)$/i.test(url);
                    const fileName = url.split("/").pop();
                    const fileUrl = url.startsWith("http")
                      ? url
                      : url.startsWith("/uploads")
                      ? `${
                          import.meta.env.VITE_API_URL?.replace("/api", "") ||
                          "http://localhost:5000"
                        }${url}`
                      : url.startsWith("/")
                      ? `${
                          import.meta.env.VITE_API_URL?.replace("/api", "") ||
                          "http://localhost:5000"
                        }${url}`
                      : `${
                          import.meta.env.VITE_API_URL?.replace("/api", "") ||
                          "http://localhost:5000"
                        }/uploads/MESSAGE/${url.split("/").pop()}`;

                    return (
                      <div key={idx} className="relative group">
                        {isImage ? (
                          <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <Image
                              src={fileUrl}
                              alt={fileName}
                              width={200}
                              height={200}
                              className="object-cover"
                              preview={false}
                              onError={(e) => {
                                console.error("Image failed to load:", fileUrl);
                                e.target.style.display = "none";
                              }}
                            />
                            <Button
                              type="text"
                              size="small"
                              icon={<CloseOutlined />}
                              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 "
                              onClick={() =>
                                setAttachments(
                                  attachments.filter((_, i) => i !== idx)
                                )
                              }
                            />
                          </div>
                        ) : isVideo ? (
                          <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm w-[200px]">
                            <video
                              src={fileUrl}
                              className="w-full h-[150px] object-cover"
                              controls={false}
                              muted
                              onError={(e) => {
                                console.error("Video failed to load:", fileUrl);
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <VideoCameraOutlined className="text-white text-2xl" />
                            </div>
                            <Button
                              type="text"
                              size="small"
                              icon={<CloseOutlined />}
                              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 "
                              onClick={() =>
                                setAttachments(
                                  attachments.filter((_, i) => i !== idx)
                                )
                              }
                            />
                          </div>
                        ) : isAudio ? (
                          <div className="relative rounded-lg border border-gray-200 shadow-sm bg-gray-50 p-3 min-w-[200px]">
                            <div className="flex items-center gap-2">
                              <AudioOutlined className="text-gray-600 text-lg" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 truncate">
                                  {fileName}
                                </p>
                                <audio
                                  src={fileUrl}
                                  controls
                                  className="w-full mt-1"
                                  preload="metadata"
                                />
                              </div>
                            </div>
                            <Button
                              type="text"
                              size="small"
                              icon={<CloseOutlined />}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 p-0 flex items-center justify-center"
                              onClick={() =>
                                setAttachments(
                                  attachments.filter((_, i) => i !== idx)
                                )
                              }
                            />
                          </div>
                        ) : (
                          <div className="relative flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm min-w-[200px]">
                            <FileOutlined className="text-gray-600 text-xl" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 truncate font-medium">
                                {fileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {language === "ar" ? "ملف" : "File"}
                              </p>
                            </div>
                            <Button
                              type="text"
                              size="small"
                              icon={<CloseOutlined />}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 p-0 flex items-center justify-center flex-shrink-0"
                              onClick={() =>
                                setAttachments(
                                  attachments.filter((_, i) => i !== idx)
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Voice Recording Preview */}
            {audioUrl && !isRecording && (
              <div className="p-3 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <audio src={audioUrl} controls className="max-w-xs" />
                  <span className="text-sm text-gray-600">
                    {formatTime(recordingTime)}
                  </span>
                </div>
                <Space>
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleSendVoiceMessage}
                    loading={sending}
                  >
                    {language === "ar" ? "إرسال" : "Send"}
                  </Button>
                  <Button
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={cancelRecording}
                  />
                </Space>
              </div>
            )}

            {/* Recording Indicator */}
            {isRecording && (
              <div className="p-3 bg-red-50 border-t border-red-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-red-600 font-semibold">
                    {language === "ar" ? "جاري التسجيل..." : "Recording..."}{" "}
                    {formatTime(recordingTime)}
                  </span>
                </div>
                <Button
                  danger
                  size="small"
                  icon={<StopOutlined />}
                  onClick={stopRecording}
                >
                  {language === "ar" ? "إيقاف" : "Stop"}
                </Button>
              </div>
            )}
            {/* Input Area - Fixed at bottom */}
            <div className="border-t border-gray-200/50 px-4 py-3 shadow-professional backdrop-blur-sm flex-shrink-0 bg-white/80">
              <div className="flex items-end gap-2">
                <Upload
                  showUploadList={false}
                  beforeUpload={handleFileUpload}
                  accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                  multiple
                >
                  <Button
                    icon={<PaperClipOutlined />}
                    type="text"
                    className="text-gray-600 hover:text-gray-900"
                    size="large"
                  />
                </Upload>
                <Button
                  type={isRecording ? "primary" : "text"}
                  danger={isRecording}
                  icon={isRecording ? <PauseOutlined /> : <AudioOutlined />}
                  onClick={handleVoiceRecording}
                  disabled={session?.status === "COMPLETED"}
                  title={language === "ar" ? "تسجيل صوتي" : "Voice recording"}
                  className={
                    isRecording ? "" : "text-gray-600 hover:text-gray-900"
                  }
                  size="large"
                />
                <Button
                  icon={<SmileOutlined />}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  type="text"
                  className={`text-gray-600 hover:text-gray-900 ${
                    showEmojiPicker ? "bg-gray-100" : ""
                  }`}
                  size="large"
                />
                <div className="flex-1 relative">
                  <TextArea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={
                      language === "ar"
                        ? "اكتب رسالتك..."
                        : "Type your message..."
                    }
                    rows={1}
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    variant="borderless"
                    disabled={session?.status === "COMPLETED" || isRecording}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    style={{
                      resize: "none",
                      borderRadius: "24px",
                      padding: "10px 16px",
                      backgroundColor: "#f0f0f0",
                      border: "none",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  className="bg-olive-green-600 hover:bg-olive-green-700 border-0 rounded-full"
                  onClick={handleSend}
                  loading={sending}
                  disabled={
                    (!messageText.trim() && attachments.length === 0) ||
                    session?.status === "COMPLETED"
                  }
                  size="large"
                  shape="circle"
                />
              </div>
              {showEmojiPicker && (
                <div className="p-3 bg-white border-t border-gray-200 max-h-48 overflow-y-auto shadow-inner">
                  <div className="grid grid-cols-8 gap-1">
                    {[
                      "😀",
                      "😃",
                      "😄",
                      "😁",
                      "😆",
                      "😅",
                      "😂",
                      "🤣",
                      "😊",
                      "😇",
                      "🙂",
                      "🙃",
                      "😉",
                      "😌",
                      "😍",
                      "🥰",
                      "😘",
                      "😗",
                      "😙",
                      "😚",
                      "😋",
                      "😛",
                      "😝",
                      "😜",
                      "🤪",
                      "🤨",
                      "🧐",
                      "🤓",
                      "😎",
                      "🤩",
                      "🥳",
                      "😏",
                      "😒",
                      "😞",
                      "😔",
                      "😟",
                      "😕",
                      "🙁",
                      "☹️",
                      "😣",
                      "😖",
                      "😫",
                      "😩",
                      "🥺",
                      "😢",
                      "😭",
                      "😤",
                      "😠",
                      "😡",
                      "🤬",
                      "🤯",
                      "😳",
                      "🥵",
                      "🥶",
                      "😱",
                      "😨",
                      "😰",
                      "😥",
                      "😓",
                      "🤗",
                      "🤔",
                      "🤭",
                      "🤫",
                      "🤥",
                      "😶",
                      "😐",
                      "😑",
                      "😬",
                      "🙄",
                      "😯",
                      "😦",
                      "😧",
                      "😮",
                      "😲",
                      "🥱",
                      "😴",
                      "🤤",
                      "😪",
                      "😵",
                      "🤐",
                      "🥴",
                      "🤢",
                      "🤮",
                      "🤧",
                      "😷",
                      "🤒",
                      "🤕",
                      "🤑",
                      "🤠",
                      "😈",
                      "👿",
                      "👹",
                      "👺",
                      "🤡",
                      "💩",
                      "👻",
                      "💀",
                      "☠️",
                      "👽",
                      "👾",
                      "🤖",
                      "🎃",
                    ].map((emoji) => (
                      <Button
                        key={emoji}
                        type="text"
                        className="text-xl p-1"
                        onClick={() => {
                          setMessageText((prev) => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Modal
        title={
          language === "ar"
            ? "مكالمة فيديو - Jitsi Meet"
            : "Video Call - Jitsi Meet"
        }
        open={showJitsiModal}
        onCancel={() => setShowJitsiModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowJitsiModal(false)}>
            {language === "ar" ? "إغلاق" : "Close"}
          </Button>,
          <Button
            key="openNew"
            type="primary"
            onClick={() => {
              if (videoRoom?.joinUrl) {
                window.open(
                  videoRoom.joinUrl,
                  "_blank",
                  "width=1200,height=800"
                );
              }
            }}
          >
            {language === "ar" ? "فتح في نافذة جديدة" : "Open in New Window"}
          </Button>,
        ]}
        width="90%"
        style={{ top: 20 }}
        styles={{ body: { height: "80vh", padding: 0 } }}
        destroyOnHidden
      >
        {videoRoom?.joinUrl ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              padding: "20px",
            }}
          >
            <p style={{ fontSize: "16px", color: "#666", textAlign: "center" }}>
              {language === "ar"
                ? 'لأفضل تجربة، يرجى استخدام زر "فتح في نافذة جديدة" لفتح المكالمة'
                : 'For the best experience, please use the "Open in New Window" button to open the call'}
            </p>
            <Button
              type="primary"
              size="large"
              onClick={() => {
                if (videoRoom?.joinUrl) {
                  window.open(
                    videoRoom.joinUrl,
                    "_blank",
                    "width=1200,height=800"
                  );
                }
              }}
            >
              {language === "ar"
                ? "فتح المكالمة في نافذة جديدة"
                : "Open Call in New Window"}
            </Button>
            <div
              style={{
                width: "100%",
                height: "70%",
                border: "1px solid #ddd",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <iframe
                src={videoRoom.joinUrl}
                allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                title="Jitsi Meet Video Call"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <p>
              {language === "ar"
                ? "لا يوجد رابط للمكالمة"
                : "No call URL available"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConsultantChat;
