import React, { useState, useEffect } from 'react';
import AgoraUIKit, { layout } from 'agora-react-uikit';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Card, Button, Input } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import api from '../../services/api';

const VideoCall = () => {
  const [videoCall, setVideoCall] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [token, setToken] = useState(null);
  const [uid, setUid] = useState(0);
  const [loading, setLoading] = useState(false);
  const { channelName: paramChannel } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
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
      const response = await api.getVideoToken(channelToJoin);
      if (response) {
        setToken(response.token || null);
        setUid(response.uid || 0);
        setVideoCall(true);
      } else {
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
    token: token || undefined,
    uid: uid,
    layout: layout.grid,
    enableScreensharing: true,
    role: 'host',
  };

  const callbacks = {
    EndCall: () => {
      setVideoCall(false);
      setToken(null);
      navigate('/client/video-call');
    },
  };



  // Safe styles to mimic Google Meet without breaking layout
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
        <div className="relative w-full h-full overflow-hidden"> 
            <AgoraUIKit 
                rtcProps={rtcProps} 
                callbacks={callbacks} 
                styleProps={styleProps}
            />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
            <Card title="Start Video Call" className="max-w-md w-full shadow-lg">
            <div className="flex flex-col gap-4">
                <div className="text-center mb-4">
                <VideoCameraOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                <p className="mt-2 text-gray-500">Enter a channel name to start or join a call</p>
                </div>
                
                {!paramChannel && (
                <Input 
                    placeholder="Enter Channel Name (e.g., Session-123)" 
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    size="large"
                />
                )}
                
                <Button 
                type="primary" 
                size="large" 
                onClick={() => handleJoin()} 
                loading={loading}
                block
                >
                Join Call
                </Button>
            </div>
            </Card>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
