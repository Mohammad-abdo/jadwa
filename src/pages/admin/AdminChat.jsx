import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Input,
  Button,
  Avatar,
  List,
  Empty,
  Spin,
  Typography,
  Space,
  Badge,
  Select,
  Popconfirm,
  message as antMessage,
  Tag,
  Modal,
  Upload,
  Image,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  StopOutlined,
  MessageOutlined,
  PictureOutlined,
  SoundOutlined,
  VideoCameraOutlined,
  SmileOutlined,
  CloseOutlined,
  FileOutlined,
  AudioOutlined,
  PauseOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { messageAPI, adminAPI, filesAPI } from "../../services/api";
import useVoiceRecorder from "../../hooks/useVoiceRecorder";
import WhatsAppAudioPlayer from "../../components/common/WhatsAppAudioPlayer";
import dayjs from "dayjs";
// CSS import removed - using Tailwind

const { TextArea } = Input;
const { Text } = Typography;

const AdminChat = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [impersonateUserId, setImpersonateUserId] = useState(null);
  const [impersonateModalVisible, setImpersonateModalVisible] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showUsersList, setShowUsersList] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
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

  useEffect(() => {
    if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
      fetchConversations();
      fetchAllUsers();
    }
  }, [user]);

  // If sessionId is provided in URL, select that conversation
  useEffect(() => {
    if (sessionId && conversations.length > 0) {
      const conversation = conversations.find((c) => c.sessionId === sessionId);
      if (conversation) {
        setSelectedConversation(conversation);
        fetchMessages(conversation.sessionId);
      }
    }
  }, [sessionId, conversations]);

  const fetchAllUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await adminAPI.getAllUsers();
      setAllUsers(response.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.sessionId);
      // Poll for new messages every 5 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.sessionId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getConversations();
      setConversations(response.conversations || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      antMessage.error(
        err.message ||
          (language === "ar"
            ? "فشل تحميل المحادثات"
            : "Failed to load conversations")
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId) => {
    if (!sessionId) return;

    try {
      const response = await messageAPI.getMessages(sessionId);
      setMessages(response.messages || []);
      // Mark messages as read when viewing chat
      if (response.messages && response.messages.length > 0) {
        try {
          await messageAPI.markAsRead(sessionId);
        } catch (err) {
          console.error("Error marking messages as read:", err);
        }
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      antMessage.error(
        err.message ||
          (language === "ar" ? "فشل تحميل الرسائل" : "Failed to load messages")
      );
    }
  };

  const handleStartConversation = async (targetUserId) => {
    try {
      setLoading(true);
      const response = await adminAPI.createDirectSession(targetUserId, "chat");

      // Create conversation object
      const newConversation = {
        id: response.session.id,
        sessionId: response.session.id,
        bookingId: null,
        name: allUsers.find((u) => u.id === targetUserId)?.email || "User",
        clientName: null,
        consultantName: null,
        clientId: targetUserId,
        consultantUserId: null,
        avatar: allUsers.find((u) => u.id === targetUserId)?.avatar,
        lastMessage: "",
        lastMessageTime: new Date(),
        status: "IN_PROGRESS",
        unreadCount: 0,
        isDirect: true,
      };

      setSelectedConversation(newConversation);
      setShowUsersList(false);
      fetchConversations();
      antMessage.success(
        language === "ar" ? "تم بدء المحادثة" : "Conversation started"
      );
    } catch (err) {
      console.error("Error starting conversation:", err);
      antMessage.error(
        err.message ||
          (language === "ar"
            ? "فشل بدء المحادثة"
            : "Failed to start conversation")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ownerType", "MESSAGE");
      formData.append("ownerId", selectedConversation?.sessionId || "");

      const fileResponse = await filesAPI.uploadFile(formData);
      const newAttachments = [...attachments, fileResponse.file.fileUrl];
      setAttachments(newAttachments);

      antMessage.success(language === "ar" ? "تم رفع الملف" : "File uploaded");
    } catch (err) {
      console.error("Error uploading file:", err);
      antMessage.error(
        err.message ||
          (language === "ar" ? "فشل رفع الملف" : "Failed to upload file")
      );
    }
    return false;
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleSendVoiceMessage = async () => {
    if (!audioBlob || !selectedConversation) return;

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
      formData.append("ownerId", selectedConversation.sessionId);

      const fileResponse = await filesAPI.uploadFile(formData);
      const audioUrl = fileResponse.file.fileUrl;

      // Determine receiver for direct sessions
      let receiverId = null;
      const senderId = impersonateUserId || user?.id;
      if (selectedConversation.isDirect || !selectedConversation.bookingId) {
        if (
          selectedConversation.clientId &&
          selectedConversation.clientId !== senderId
        ) {
          receiverId = selectedConversation.clientId;
        } else if (
          selectedConversation.consultantUserId &&
          selectedConversation.consultantUserId !== senderId
        ) {
          receiverId = selectedConversation.consultantUserId;
        }
      }

      // Send message with audio
      await messageAPI.sendMessageAsAdmin(selectedConversation.sessionId, {
        content: language === "ar" ? "رسالة صوتية" : "Voice message",
        messageType: "audio",
        attachments: [audioUrl],
        senderId: senderId,
        ...(receiverId && { receiverId }),
      });

      // Clean up
      cancelRecording();
      await fetchMessages(selectedConversation.sessionId);
      antMessage.success(
        language === "ar" ? "تم إرسال الرسالة الصوتية" : "Voice message sent"
      );
    } catch (err) {
      console.error("Error sending voice message:", err);
      antMessage.error(
        err.message ||
          (language === "ar"
            ? "فشل إرسال الرسالة الصوتية"
            : "Failed to send voice message")
      );
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (
      (!newMessage.trim() && attachments.length === 0) ||
      !selectedConversation
    )
      return;

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

      // If impersonating, send as that user, otherwise send as admin
      const senderId = impersonateUserId || user?.id;

      // Determine receiver for direct sessions
      let receiverId = null;
      if (selectedConversation.isDirect || !selectedConversation.bookingId) {
        // For direct sessions, find the other user
        // If sending as admin, receiver is the other user in the conversation
        // Check both clientId and consultantUserId (one will be the other user)
        if (
          selectedConversation.clientId &&
          selectedConversation.clientId !== senderId
        ) {
          receiverId = selectedConversation.clientId;
        } else if (
          selectedConversation.consultantUserId &&
          selectedConversation.consultantUserId !== senderId
        ) {
          receiverId = selectedConversation.consultantUserId;
        } else {
          // If we're sending as the client/consultant, find the other participant from messages
          // This will be handled by the backend if receiverId is not provided
        }
      }

      await messageAPI.sendMessageAsAdmin(selectedConversation.sessionId, {
        content: newMessage || (attachments.length > 0 ? "📎 ملف مرفق" : ""),
        messageType,
        attachments: attachments.length > 0 ? attachments : [],
        senderId: senderId, // Admin can send as any user
        ...(receiverId && { receiverId }), // Include receiverId for direct sessions
      });

      setNewMessage("");
      setAttachments([]);
      await fetchMessages(selectedConversation.sessionId);
      antMessage.success(
        language === "ar" ? "تم إرسال الرسالة" : "Message sent"
      );
    } catch (err) {
      console.error("Error sending message:", err);
      antMessage.error(
        err.message ||
          (language === "ar" ? "فشل إرسال الرسالة" : "Failed to send message")
      );
    } finally {
      setSending(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await adminAPI.deleteSession(sessionId);
      antMessage.success(
        language === "ar" ? "تم حذف المحادثة" : "Session deleted"
      );
      if (selectedConversation?.sessionId === sessionId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      fetchConversations();
    } catch (err) {
      console.error("Error deleting session:", err);
      antMessage.error(
        err.message ||
          (language === "ar" ? "فشل حذف المحادثة" : "Failed to delete session")
      );
    }
  };

  const handleStopSession = async (sessionId) => {
    try {
      await adminAPI.stopSession(sessionId);
      antMessage.success(
        language === "ar" ? "تم إيقاف المحادثة" : "Session stopped"
      );
      fetchConversations();
      if (selectedConversation?.sessionId === sessionId) {
        fetchMessages(sessionId);
      }
    } catch (err) {
      console.error("Error stopping session:", err);
      antMessage.error(
        err.message ||
          (language === "ar" ? "فشل إيقاف المحادثة" : "Failed to stop session")
      );
    }
  };

  const getConversationName = (conv) => {
    if (conv.clientName && conv.consultantName) {
      return `${conv.clientName} ↔ ${conv.consultantName}`;
    }
    return conv.name || (language === "ar" ? "محادثة" : "Conversation");
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden relative font-sans" style={{ margin: "-24px", width: "calc(100% + 48px)" }}>
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-olive-green-50/20 -z-20" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-olive-green-200/20 rounded-full blur-[100px] opacity-40 mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-turquoise-200/20 rounded-full blur-[100px] opacity-40 mix-blend-multiply" />
      </div>

      <div className="flex w-full h-full relative z-10 p-4 gap-4 max-w-[1920px] mx-auto">
        {/* Sidebar */}
        <div className="w-1/3 min-w-[320px] max-w-[420px] flex flex-col bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl overflow-hidden transition-all duration-300">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-olive-green-500 to-turquoise-400 flex items-center justify-center text-white shadow-lg shadow-olive-green-200">
                <MessageOutlined className="text-xl" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-lg leading-tight">
                  {language === "ar" ? "المحادثات" : "Conversations"}
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  {conversations.length} {language === "ar" ? "محادثة" : "Chats"}
                </p>
              </div>
            </div>
            <Space>
              <Button
                type="text"
                icon={<UserOutlined />}
                onClick={() => setShowUsersList(true)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-xl w-10 h-10 flex items-center justify-center transition-colors"
                title={language === "ar" ? "محادثة جديدة" : "New Chat"}
              />
              <Button
                type="text"
                icon={<MessageOutlined />}
                onClick={() => setImpersonateModalVisible(true)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-xl w-10 h-10 flex items-center justify-center transition-colors"
                title={language === "ar" ? "إرسال كـ" : "Send As"}
              />
            </Space>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
            {loading && conversations.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 opacity-50">
                 <Spin size="large" />
               </div>
            ) : conversations.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 px-6 text-center opacity-60">
                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                   <MessageOutlined className="text-2xl text-gray-400" />
                 </div>
                 <p className="text-gray-500 font-medium">
                   {language === "ar" ? "لا توجد محادثات" : "No conversations yet"}
                 </p>
               </div>
            ) : (
              <List
                dataSource={conversations}
                renderItem={(conv) => {
                  const isActive = selectedConversation?.sessionId === conv.sessionId;
                  return (
                    <div
                      key={conv.sessionId}
                      onClick={() => {
                        setSelectedConversation(conv);
                        fetchMessages(conv.sessionId);
                      }}
                      className={`
                        group relative p-3 mb-2 rounded-2xl cursor-pointer transition-all duration-200 ease-out border
                        ${isActive 
                          ? "bg-white border-olive-green-100 shadow-lg shadow-olive-green-100/40 translate-x-1" 
                          : "bg-transparent border-transparent hover:bg-white/60 hover:border-white hover:shadow-sm"
                        }
                      `}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <Avatar
                            size={52}
                            src={conv.avatar}
                            className={`
                              shadow-md border-2 transition-transform duration-300 group-hover:scale-105
                              ${isActive ? "border-olive-green-400" : "border-white"}
                            `}
                            icon={<UserOutlined />}
                          />
                          {(conv.status === "ACTIVE" || conv.status === "IN_PROGRESS") && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className={`font-bold text-[15px] truncate ${isActive ? "text-gray-900" : "text-gray-700"}`}>
                              {getConversationName(conv)}
                            </h3>
                            <span className={`text-[11px] font-medium ${isActive ? "text-olive-green-600" : "text-gray-400"}`}>
                               {conv.lastMessageTime
                                 ? dayjs(conv.lastMessageTime).format("HH:mm")
                                 : ""}
                            </span>
                          </div>
                          <div className="flex justify-between items-end">
                            <p className={`text-sm truncate max-w-[85%] ${isActive ? "text-gray-600 font-medium" : "text-gray-500"}`}>
                              {conv.lastMessage || (language === "ar" ? "لا توجد رسائل" : "No messages")}
                            </p>
                            {conv.unreadCount > 0 && (
                              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-olive-green-500 text-white text-[10px] font-bold rounded-full shadow-lg shadow-olive-green-200">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                              {conv.status && (
                                <Tag
                                    color={conv.status === "ACTIVE" ? "success" : "default"}
                                    className="text-[10px] m-0 px-1.5 py-0 rounded border-0"
                                >
                                {conv.status}
                                </Tag>
                              )}
                             <Popconfirm
                                title={language === "ar" ? "حذف المحادثة؟" : "Delete session?"}
                                onConfirm={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSession(conv.sessionId);
                                }}
                                okText={language === "ar" ? "نعم" : "Yes"}
                                cancelText={language === "ar" ? "لا" : "No"}
                                okButtonProps={{ danger: true }}
                            >
                                <Button 
                                    type="text" 
                                    size="small" 
                                    icon={<DeleteOutlined />} 
                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </Popconfirm>
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
        <div className="flex-1 flex flex-col bg-white/90 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden relative">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-20 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm z-20 sticky top-0">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative">
                    <Avatar
                      icon={<UserOutlined />}
                      size={48}
                      className="flex-shrink-0 bg-olive-green-100 text-olive-green-600 border-2 border-white shadow-md relative z-10"
                      src={selectedConversation.avatar}
                    />
                    {(selectedConversation?.status === "ACTIVE" || selectedConversation?.status === "IN_PROGRESS") && (
                       <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm z-20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 truncate leading-tight">
                      {getConversationName(selectedConversation)}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${
                             selectedConversation?.status === "ACTIVE" ||
                             selectedConversation?.status === "IN_PROGRESS" ? "bg-green-500 animate-pulse" : "bg-gray-400"
                        }`} />
                        <p className="text-xs text-gray-500 truncate font-medium">
                        {selectedConversation?.status === "ACTIVE" ||
                        selectedConversation?.status === "IN_PROGRESS"
                            ? language === "ar"
                            ? "نشط الآن"
                            : "Active now"
                            : selectedConversation?.status === "STOPPED"
                            ? language === "ar"
                            ? "متوقف"
                            : "Stopped"
                            : selectedConversation?.status === "COMPLETED"
                            ? language === "ar"
                            ? "مكتمل"
                            : "Completed"
                            : language === "ar"
                            ? "مجدول"
                            : "Scheduled"}
                        </p>
                    </div>
                  </div>
                </div>
                <Space size="middle">
                  {impersonateUserId && (
                    <Tag color="orange" className="text-xs px-3 py-1 rounded-full border-0 bg-orange-50 text-orange-600 font-medium shadow-sm">
                      {language === "ar"
                        ? "إرسال كـ مستخدم آخر"
                        : "Sending as user"}
                    </Tag>
                  )}
                   <Space>
                    <Popconfirm
                        title={
                        language === "ar"
                            ? "إيقاف المحادثة؟"
                            : "Stop session?"
                        }
                        onConfirm={() => handleStopSession(selectedConversation.sessionId)}
                        okText={language === "ar" ? "نعم" : "Yes"}
                        cancelText={language === "ar" ? "لا" : "No"}
                    >
                        <Button
                            type="text"
                            icon={<StopOutlined />}
                            danger
                            className="hover:bg-red-50 rounded-xl w-10 h-10 flex items-center justify-center transition-colors"
                            title={language === "ar" ? "إيقاف الجلسة" : "Stop Session"}
                        />
                    </Popconfirm>
                    <Button
                        type="text"
                        icon={<MessageOutlined />}
                        className="text-gray-500 hover:text-olive-green-600 hover:bg-olive-green-50 rounded-xl w-10 h-10 flex items-center justify-center transition-colors"
                        onClick={() => setImpersonateModalVisible(true)}
                        title={language === "ar" ? "إرسال كـ" : "Send As"}
                    />
                  </Space>
                </Space>
              </div>

              {/* Messages Area */}
              <div 
                className="flex-1 overflow-y-auto px-4 py-6 bg-[#f8f9fa]"
                style={{
                  backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
                  backgroundSize: "24px 24px"
                }}
              >
                <div className="max-w-4xl mx-auto space-y-6 min-h-full flex flex-col justify-end pb-32">
                  {loading && messages.length === 0 ? (
                    <div className="flex justify-center items-center py-12 opacity-60">
                      <Spin size="large" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-60">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageOutlined className="text-3xl text-gray-400" />
                        </div>
                      <p className="text-gray-500 font-medium">
                        {language === "ar"
                          ? "لا توجد رسائل بعد، ابدأ المحادثة الآن"
                          : "No messages yet, start the conversation now"}
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isOwn =
                        msg.senderId === (impersonateUserId || user?.id);
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
                        ) > 15; // More relaxed time grouping

                      return (
                        <div key={msg.id} className={`flex flex-col group animate-fadeIn ${isOwn ? "items-end" : "items-start"}`}>
                            {showTime && (
                              <div className="flex justify-center w-full mb-6">
                                <span className="text-xs font-medium text-gray-400 bg-gray-100/80 px-3 py-1 rounded-full shadow-sm">
                                  {dayjs(msg.createdAt).format("MMM DD, HH:mm")}
                                </span>
                              </div>
                            )}
                            
                            <div className={`flex ${isOwn ? "justify-end" : "justify-start"} max-w-[85%] md:max-w-[75%]`}>
                                {!isOwn && (
                                    <div className={`flex-shrink-0 w-8 mr-2 flex flex-col justify-end ${!showAvatar ? 'invisible' : ''}`}>
                                        <Avatar
                                            src={msg.sender?.avatar}
                                            icon={<UserOutlined />}
                                            size={32}
                                            className="border border-gray-200 shadow-sm bg-white text-gray-400"
                                        />
                                    </div>
                                )}

                                <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                                    {!isOwn && showAvatar && (
                                        <span className="text-xs text-gray-500 ml-1 mb-1 font-medium">
                                            {msg.sender?.email?.split('@')[0] || "User"}
                                        </span>
                                    )}
                                    
                                    <div className={`
                                        relative px-5 py-3.5 shadow-sm text-[15px] leading-relaxed break-words
                                        ${isOwn 
                                            ? "bg-gradient-to-br from-olive-green-600 to-turquoise-600 text-white rounded-2xl rounded-tr-sm" 
                                            : "bg-white text-gray-800 border border-olive-green-100 rounded-2xl rounded-tl-sm"
                                        }
                                    `}>
                                        {msgAttachments.length > 0 && (
                                            <div className="mb-3 space-y-2">
                                                {msgAttachments.map((url, idx) => {
                                                    const isImage = msg.messageType === "image" || /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                                                    const isAudio = msg.messageType === "audio" || /\.(mp3|wav|ogg|m4a|webm)$/i.test(url);
                                                    const isVideo = msg.messageType === "video" || /\.(mp4|webm)$/i.test(url);

                                                    if (isImage) {
                                                        return (
                                                            <div key={idx} className="rounded-lg overflow-hidden bg-black/10 mb-2">
                                                                <Image
                                                                    src={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://jadwa.developteam.site'}${url}`}
                                                                    className="max-w-full h-auto object-cover"
                                                                    width={250}
                                                                />
                                                            </div>
                                                        );
                                                    } else if (isAudio) {
                                                        return (
                                                            <div key={idx} className={`min-w-[200px] p-2 rounded-lg ${isOwn ? 'bg-white/20' : 'bg-olive-green-50'}`}>
                                                                <WhatsAppAudioPlayer
                                                                    src={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://jadwa.developteam.site'}${url}`}
                                                                    isOwnMessage={isOwn}
                                                                    language={language}
                                                                />
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg ${isOwn ? 'bg-white/20' : 'bg-gray-50 border border-gray-100'}`}>
                                                                <FileOutlined className={isOwn ? 'text-white/80' : 'text-gray-500'} />
                                                                <a 
                                                                    href={url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className={`text-sm underline truncate max-w-[150px] ${isOwn ? 'text-white' : 'text-blue-600'}`}
                                                                >
                                                                    {url.split('/').pop()}
                                                                </a>
                                                            </div>
                                                        );
                                                    }
                                                })}
                                            </div>
                                        )}
                                        
                                        {msg.content && (
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                        
                                        <div className={`text-[10px] mt-1 font-medium flex items-center gap-1 opacity-70 ${isOwn ? "justify-end text-white/90" : "justify-start text-gray-400"}`}>
                                            {dayjs(msg.createdAt).format("HH:mm")}
                                            {isOwn && <span>•</span>}
                                            {isOwn && (
                                                <span>{msg.isRead ? "Read" : "Sent"}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {isOwn && (
                                    <div className={`flex-shrink-0 w-8 ml-2 flex flex-col justify-end ${!showAvatar ? 'invisible' : ''}`}>
                                        <Avatar
                                            src={user?.avatar}
                                            icon={<UserOutlined />}
                                            size={32}
                                            className="bg-olive-green-200 text-olive-green-700 border border-white shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Attachments Preview - Styled */}
              {attachments.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm border-t border-gray-100 px-6 py-3">
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
                            "https://jadwa.developteam.site"
                          }${url}`
                        : url.startsWith("/")
                        ? `${
                            import.meta.env.VITE_API_URL?.replace("/api", "") ||
                            "https://jadwa.developteam.site"
                          }${url}`
                        : `${
                            import.meta.env.VITE_API_URL?.replace("/api", "") ||
                            "https://jadwa.developteam.site"
                          }/uploads/MESSAGE/${url.split("/").pop()}`;

                      return (
                        <div key={idx} className="relative group animate-fade-in-up">
                          {isImage ? (
                            <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm w-24 h-24">
                              <Image
                                src={fileUrl}
                                alt={fileName}
                                width={96}
                                height={96}
                                className="object-cover w-full h-full"
                                preview={false}
                              />
                               <Button
                                type="text"
                                size="small"
                                icon={<CloseOutlined />}
                                className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full w-5 h-5 min-w-0 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() =>
                                  setAttachments(
                                    attachments.filter((_, i) => i !== idx)
                                  )
                                }
                              />
                            </div>
                          ) : (
                            <div className="relative flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 shadow-sm min-w-[150px] max-w-[200px]">
                                {isAudio ? <AudioOutlined /> : isVideo ? <VideoCameraOutlined /> : <FileOutlined />}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-700 truncate">{fileName}</p>
                                </div>
                                <Button
                                type="text"
                                size="small"
                                icon={<CloseOutlined />}
                                className="text-gray-400 hover:text-red-500"
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
                <div className="p-4 bg-blue-50/50 border-t border-blue-100 flex items-center justify-between backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <AudioOutlined />
                    </div>
                    <audio src={audioUrl} controls className="h-8 w-64" />
                    <span className="text-sm font-mono text-gray-600">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                  <Space>
                    <Button
                      type="primary"
                      onClick={handleSendVoiceMessage}
                      loading={sending}
                      className="bg-blue-600 hover:bg-blue-700 rounded-lg px-6"
                    >
                      {language === "ar" ? "إرسال" : "Send"}
                    </Button>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={cancelRecording}
                      className="hover:text-red-500 hover:border-red-200 rounded-lg"
                    />
                  </Space>
                </div>
              )}

              {/* Recording Indicator */}
              {isRecording && (
                <div className="p-4 bg-red-50/50 border-t border-red-100 flex items-center justify-between backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute" />
                        <div className="w-3 h-3 bg-red-500 rounded-full relative" />
                    </div>
                    <span className="text-red-600 font-semibold animate-pulse">
                      {language === "ar" ? "جاري التسجيل..." : "Recording..."}{" "}
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                  <Button
                    danger
                    icon={<StopOutlined />}
                    onClick={stopRecording}
                    className="rounded-lg px-6"
                    type="primary"
                  >
                    {language === "ar" ? "إيقاف" : "Stop"}
                  </Button>
                </div>
              )}

              {/* Input Area - Fixed at bottom */}
              {/* Input Area */}
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-olive-green-900/5 border border-white p-2 pl-3 flex items-end gap-2 transition-all duration-300 focus-within:shadow-olive-green-500/10 focus-within:border-olive-green-100 focus-within:ring-4 focus-within:ring-olive-green-500/5">
                    <div className="flex pb-1 gap-1">
                        <Upload
                            showUploadList={false}
                            beforeUpload={handleFileUpload}
                            accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                            multiple
                        >
                            <Button
                            icon={<PaperClipOutlined className="text-xl" />}
                            type="text"
                            className="text-gray-400 hover:text-olive-green-600 hover:bg-olive-green-50 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                            />
                        </Upload>
                         <Button
                            type={isRecording ? "text" : "text"}
                            danger={isRecording}
                            icon={isRecording ? <PauseOutlined /> : <AudioOutlined className="text-xl"/>}
                            onClick={handleVoiceRecording}
                            disabled={
                            selectedConversation?.status === "STOPPED" ||
                            selectedConversation?.status === "COMPLETED"
                            }
                            title={language === "ar" ? "تسجيل صوتي" : "Voice recording"}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                            isRecording ? "bg-red-50 text-red-500 animate-pulse" : "text-gray-400 hover:text-olive-green-600 hover:bg-olive-green-50"
                            }`}
                        />
                         <Button
                            icon={<SmileOutlined className="text-xl" />}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            type="text"
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                            showEmojiPicker ? "text-olive-green-600 bg-olive-green-50" : "text-gray-400 hover:text-olive-green-600 hover:bg-olive-green-50"
                            }`}
                        />
                    </div>
                  
                  <div className="flex-1 relative">
                    <TextArea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={
                        language === "ar"
                          ? "اكتب رسالة..."
                          : "Type a message..."
                      }
                      rows={1}
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      variant="borderless"
                      disabled={
                        selectedConversation?.status === "STOPPED" ||
                        selectedConversation?.status === "COMPLETED" ||
                        isRecording
                      }
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="!bg-transparent !px-2 !py-3 !text-[15px] placeholder:text-gray-400 !resize-none !leading-tight text-gray-700 font-medium"
                      style={{
                        minHeight: '44px',
                        resize: "none"
                      }}
                    />
                  </div>
                  <Button
                    type="primary"
                    icon={<SendOutlined className="text-lg -ml-0.5 mt-0.5" />}
                    className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full shadow-lg shadow-olive-green-500/20 transition-all duration-300 ${
                        (!newMessage.trim() && attachments.length === 0) 
                        ? 'bg-gray-200 text-gray-400 pointer-events-none scale-90 opacity-0' 
                        : 'bg-gradient-to-r from-olive-green-600 to-turquoise-600 hover:shadow-olive-green-500/30 hover:scale-105 active:scale-95 opacity-100'
                    } border-0`}
                    onClick={handleSendMessage}
                    loading={sending}
                    disabled={
                      (!newMessage.trim() && attachments.length === 0) ||
                      selectedConversation?.status === "STOPPED" ||
                      selectedConversation?.status === "COMPLETED" ||
                      isRecording
                    }
                  />
                </div>
                {showEmojiPicker && (
                  <div className="absolute bottom-20 left-4 p-4 bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-2xl w-80 animate-fade-in-up z-30">
                    <div className="grid grid-cols-8 gap-1 h-60 overflow-y-auto custom-scrollbar p-1">
                      {[
                        "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
                        "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
                        "😋", "😛", "😝", "😜", "🤪", "🧐", "🤓", "😎", "🤩", "🥳",
                        "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖",
                        "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯",
                        "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔",
                        "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦",
                        "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴",
                        "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿",
                        "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖",
                        "🎃", "👋", "🤚", "🖐", "✋", "🖖", "👌", "🤏", "✌️", "🤞",
                        "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "🖕", "🦾", "🙏",
                        "🤝", "👍", "👎", "👊", "✊", "🤛", "🤜", "❤️", "🧡", "💛",
                        "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞",
                        "💓", "💗", "💖", "💘", "💝", "🔥", "✨", "🌟", "💫", "💥",
                        "💯", "💢", "💨", "💦", "💤", "🕳️", "💬", "👁️‍🗨️", "🗨️"
                      ].map((emoji, i) => (
                        <button
                          key={i}
                          className="hover:bg-gray-100 rounded-lg p-1.5 text-xl transition-colors flex items-center justify-center"
                          onClick={() => {
                            setNewMessage((prev) => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-md">
                <div className="w-24 h-24 bg-gradient-to-br from-olive-green-50 to-turquoise-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-white">
                    <MessageOutlined className="text-4xl text-olive-green-400" />
                </div>
              <h2 className="text-3xl font-bold mb-3 text-gray-800 tracking-tight">
                {language === "ar"
                  ? "مرحباً بك في المحادثات"
                  : "Welcome to Chat"}
              </h2>
              <p className="text-gray-500 max-w-md mx-auto text-lg text-center leading-relaxed">
                {language === "ar"
                  ? "اختر محادثة من القائمة الجانبية أو ابدأ محادثة جديدة للتواصل"
                  : "Select a conversation from the sidebar or start a new chat to connect."}
              </p>
            </div>
          )}
        </div>

        {/* Impersonate Modal */}
        <Modal
          title={<div className="font-bold text-lg">{language === "ar" ? "إرسال الرسالة كـ" : "Send Message As"}</div>}
          open={impersonateModalVisible}
          onCancel={() => setImpersonateModalVisible(false)}
          className="modern-modal"
          footer={[
            <Button
              key="cancel"
              size="large"
              className="rounded-lg hover:bg-gray-100"
              onClick={() => {
                setImpersonateModalVisible(false);
                setImpersonateUserId(null);
              }}
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>,
            <Button
              key="clear"
              size="large"
              className="rounded-lg"
              onClick={() => {
                setImpersonateUserId(null);
                antMessage.info(
                  language === "ar"
                    ? "سيتم الإرسال كمدير"
                    : "Will send as admin"
                );
              }}
            >
              {language === "ar" ? "إرسال كمدير" : "Send as Admin"}
            </Button>,
          ]}
        >
          <div className="space-y-5 py-4">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm">
                <UserOutlined className="mr-2" />
              {language === "ar"
                ? "اختر المستخدم الذي تريد الإرسال باسمه. اتركه فارغاً للإرسال كمدير."
                : "Select the user you want to send as. Leave empty to send as admin."}
            </div>
            <div>
              <Text strong className="block mb-2">
                {language === "ar" ? "اختر المستخدم:" : "Select User:"}
              </Text>
              {usersLoading ? (
                <div className="flex justify-center py-4">
                  <Spin />
                </div>
              ) : (
                <Select
                  className="w-full"
                  size="large"
                  placeholder={
                    language === "ar"
                      ? "اختر مستخدم للإرسال باسمه"
                      : "Select user to send as"
                  }
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={allUsers.map((u) => ({
                    value: u.id,
                    label: `${u.email}${
                      u.client
                        ? ` (${u.client.firstName} ${u.client.lastName})`
                        : ""
                    }${
                      u.consultant
                        ? ` (${u.consultant.firstName} ${u.consultant.lastName})`
                        : ""
                    } - ${u.role}`,
                  }))}
                  onChange={(value) => {
                    setImpersonateUserId(value);
                    const selectedUser = allUsers.find((u) => u.id === value);
                    antMessage.success(
                      language === "ar"
                        ? `سيتم الإرسال كـ ${selectedUser?.email}`
                        : `Will send as ${selectedUser?.email}`
                    );
                  }}
                  allowClear
                  onClear={() => {
                    setImpersonateUserId(null);
                    antMessage.info(
                      language === "ar"
                        ? "سيتم الإرسال كمدير"
                        : "Will send as admin"
                    );
                  }}
                />
              )}
              {selectedConversation && (
                <div className="mt-6">
                  <Text strong className="block mb-2">
                    {language === "ar"
                      ? "المشاركون في المحادثة:"
                      : "Conversation Participants:"}
                  </Text>
                  <div className="mt-2 space-y-3">
                    {selectedConversation?.clientId && (
                      <Button
                        block
                        size="large"
                        className="h-12 rounded-xl border-dashed border-gray-300 hover:border-olive-green-500 hover:text-olive-green-600"
                        onClick={() => {
                          setImpersonateUserId(selectedConversation.clientId);
                          setImpersonateModalVisible(false);
                          antMessage.success(
                            language === "ar"
                              ? "سيتم الإرسال كعميل"
                              : "Will send as client"
                          );
                        }}
                      >
                        {language === "ar" ? "إرسال كعميل" : "Send as Client"} (
                        {selectedConversation.clientName || "Client"})
                      </Button>
                    )}
                    {selectedConversation?.consultantUserId && (
                      <Button
                        block
                        size="large"
                        className="h-12 rounded-xl border-dashed border-gray-300 hover:border-olive-green-500 hover:text-olive-green-600"
                        onClick={() => {
                          setImpersonateUserId(
                            selectedConversation.consultantUserId
                          );
                          setImpersonateModalVisible(false);
                          antMessage.success(
                            language === "ar"
                              ? "سيتم الإرسال كمستشار"
                              : "Will send as consultant"
                          );
                        }}
                      >
                        {language === "ar"
                          ? "إرسال كمستشار"
                          : "Send as Consultant"}{" "}
                        ({selectedConversation.consultantName || "Consultant"})
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>

        {/* Users List Modal */}
        <Modal
          title={<div className="font-bold text-lg">{language === "ar" ? "اختر مستخدم للدردشة" : "Select User to Chat"}</div>}
          open={showUsersList}
          onCancel={() => setShowUsersList(false)}
          footer={null}
          width={600}
          className="modern-modal"
        >
          {usersLoading ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto -mx-6 px-6 custom-scrollbar">
                <List
                dataSource={allUsers.filter((u) => u.id !== user?.id)}
                renderItem={(u) => (
                    <List.Item
                    className="cursor-pointer hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0 px-2"
                    onClick={() => handleStartConversation(u.id)}
                    >
                    <List.Item.Meta
                        avatar={<Avatar src={u.avatar} icon={<UserOutlined />} size={40} className="bg-gray-200" />}
                        title={
                        <div className="flex items-center gap-2">
                            <Text strong className="text-gray-900">
                            {u.email}
                            </Text>
                            <Tag color={u.role === 'CLIENT' ? 'orange' : u.role === 'CONSULTANT' ? 'cyan' : 'blue'} className="text-[10px] uppercase border-0 rounded-sm">
                            {u.role}
                            </Tag>
                        </div>
                        }
                        description={
                            <div className="text-xs text-gray-500">
                                {u.client && `${u.client.firstName} ${u.client.lastName}`}
                                {u.consultant && `${u.consultant.firstName} ${u.consultant.lastName}`}
                                {!u.client && !u.consultant && u.role}
                            </div>
                        }
                    />
                     <Button type="text" icon={<MessageOutlined />} className="text-gray-400 hover:text-olive-green-600" />
                    </List.Item>
                )}
                />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminChat;
