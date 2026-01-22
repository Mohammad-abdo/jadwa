import React, { useState, useEffect } from 'react';
import AgoraUIKit, { layout } from 'agora-react-uikit';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Card, Button, Input, Spin } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import api from '../../services/api';

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Video Call Error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-white bg-red-900/50 h-full flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold mb-4">Something went wrong with the video call</h2>
          <pre className="bg-black/50 p-4 rounded text-xs overflow-auto max-w-full">
            {this.state.error && this.state.error.toString()}
          </pre>
          <Button type="primary" onClick={() => window.location.reload()} className="mt-4">
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

const VideoCall = () => {
  const [videoCall, setVideoCall] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [token, setToken] = useState(null);
  const [uid, setUid] = useState(0);
  const [loading, setLoading] = useState(false);
  const { channelName: paramChannel } = useParams();
  const navigate = useNavigate();

  console.log("VideoCall Component Mounted");
  console.log("Params:", { paramChannel });

  useEffect(() => {
    console.log("VideoCall useEffect triggered. Channel:", paramChannel);
    if (paramChannel) {
      setChannelName(paramChannel);
      handleJoin(paramChannel);
    }
  }, [paramChannel]);

  const handleJoin = async (channel) => {
    const channelToJoin = channel || channelName;
    if (!channelToJoin) {
      message.error('Please enter a channel name');
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching token for channel:", channelToJoin);
      const response = await api.getVideoToken(channelToJoin);
      console.log("Token response:", response);
      
      if (response && response.token) {
        setToken(response.token);
        setUid(response.uid || 0);
        setVideoCall(true);
        console.log("State updated: videoCall=true, uid=", response.uid);
      } else {
        console.error("Invalid token response:", response);
        message.error('Failed to get access token');
      }
    } catch (error) {
      console.error('Error fetching token:', error);
      message.error('Error starting video call');
    } finally {
      setLoading(false);
    }
  };

  const rtcProps = {
    appId: import.meta.env.VITE_AGORA_APP_ID || '2ba694ea8ea841589afdffc6b45abb49',
    channel: channelName,
    token: token || null, // Ensure explicitly null if undefined
    uid: uid || null,     // Ensure explicitly null if 0/undefined so SDK generates one if needed
    layout: layout ? layout.grid : 0, // Fallback if layout is undefined
    enableScreensharing: true, 
    role: 'host',
  };
  
  console.log("Rendering VideoCall. videoCall state:", videoCall, "rtcProps:", rtcProps);

  // Determine role based on URL path or context (simplified for now)
  const isConsultant = window.location.pathname.startsWith('/consultant');

  const callbacks = {
    EndCall: () => {
      setVideoCall(false);
      setToken(null);
      navigate(isConsultant ? '/consultant/chat' : '/client/chat');
    },
  };

  // ... (keeping existing styleProps)
  const styleProps = {
    UIKitContainer: { height: '100%', width: '100%' },
    localBtnContainer: {
      backgroundColor: '#202124',
      borderTop: '1px solid #3c4043',
      padding: '10px 0',
    },
    localBtnStyles: {
      backgroundColor: '#3c4043',
      borderRadius: '50%',
      width: '50px',
      height: '50px',
      margin: '0 10px',
      border: 'none',
    },
    theme: '#ffffff', 
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-[#202124]"> 
      {videoCall ? (
        <div className="relative w-full h-full overflow-hidden" style={{ minHeight: '500px', flex: 1 }}> 
          <ErrorBoundary>
             {/* Log before render to verify boundary entry */}
             {console.log("Attempting to render AgoraUIKit")}
            <AgoraUIKit 
                rtcProps={rtcProps} 
                callbacks={callbacks} 
                styleProps={{
                    ...styleProps,
                    UIKitContainer: { height: '100%', width: '100%', backgroundColor: 'black' }
                }}
            />
          </ErrorBoundary>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
            <Card title="Start Video Call" className="max-w-md w-full shadow-lg">
            <div className="flex flex-col gap-4">
                <div className="text-center mb-4">
                <VideoCameraOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                <p className="mt-2 text-gray-500">Enter a channel name to start or join a call</p>
                </div>
                
                {!paramChannel ? (
                  <div className="text-center py-4">
                     <p className="text-gray-400 mb-4">Please join the call from your chat link.</p>
                     <Button 
                       type="primary" 
                       onClick={() => navigate(isConsultant ? '/consultant/chat' : '/client/chat')}
                       className="bg-blue-600"
                     >
                       Back to Chat
                     </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-400 mb-4">Joining room: {paramChannel}</p>
                    <Spin size="large" />
                  </div>
                )}
            </div>
            </Card>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
