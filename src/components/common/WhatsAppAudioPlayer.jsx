import React, { useState, useRef, useEffect } from "react";
import { Button } from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SoundOutlined,
} from "@ant-design/icons";

const WhatsAppAudioPlayer = ({
  src,
  isOwnMessage = false,
  language = "en",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset error state when src changes
    setHasError(false);
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = (e) => {
      setIsLoading(false);
      setHasError(true);
      setIsPlaying(false);
      // Only log in development - audio file might not exist yet which is normal
      if (import.meta.env.DEV) {
        const error = audio.error;
        const errorMessage = error
          ? `Code: ${error.code}, Message: ${error.message || "Unknown error"}`
          : "Unknown error";
        console.error("Audio failed to load:", src, errorMessage);
      }
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // Load metadata
    audio.load();

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [src]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    // Check if audio has an error before trying to play
    if (audio.error) {
      setHasError(true);
      setIsPlaying(false);
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        // Only log in development - suppress errors in production
        if (import.meta.env.DEV) {
          console.error("Error playing audio:", err);
        }
        setIsPlaying(false);
        setHasError(true);
        // If format not supported or file missing, mark as error
        if (
          err.name === "NotSupportedError" ||
          err.message?.includes("no supported sources")
        ) {
          setHasError(true);
        }
      });
    }
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;

    if (audio && duration) {
      audio.currentTime = percentage * duration;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // If there's an error, show a fallback UI
  if (hasError) {
    return (
      <div
        className={`whatsapp-audio-player flex items-center gap-3 ${
          isOwnMessage ? "flex-row-reverse" : ""
        } opacity-60`}
      >
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            isOwnMessage
              ? "bg-gray-400 text-white"
              : "bg-gray-300 text-gray-600"
          }`}
        >
          <SoundOutlined className="text-lg" />
        </div>
        <div className="flex-1">
          <span
            className={`text-xs ${
              isOwnMessage ? "text-gray-700" : "text-gray-500"
            }`}
          >
            {language === "ar"
              ? "تعذر تحميل الملف الصوتي"
              : "Audio unavailable"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`whatsapp-audio-player flex items-center gap-3 ${
        isOwnMessage ? "flex-row-reverse" : ""
      }`}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Play/Pause Button */}
      <Button
        type="text"
        icon={
          isLoading ? (
            <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <PauseCircleOutlined className="text-2xl" />
          ) : (
            <PlayCircleOutlined className="text-2xl" />
          )
        }
        onClick={togglePlayPause}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
          isOwnMessage
            ? "bg-[#25D366] hover:bg-[#20BD5A] text-white"
            : "bg-[#e5e7eb] hover:bg-[#d1d5db] text-gray-700"
        }`}
        disabled={isLoading}
        style={{ minWidth: "40px", padding: 0 }}
      />

      {/* Progress Bar and Time */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        {/* Progress Bar */}
        <div
          className={`flex-1 h-2 rounded-full cursor-pointer relative overflow-hidden ${
            isOwnMessage ? "bg-white/40" : "bg-gray-300"
          }`}
          onClick={handleProgressClick}
        >
          <div
            className={`h-full transition-all duration-100 ${
              isOwnMessage ? "bg-white" : "bg-[#25D366]"
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
          {/* Animated waveform effect when playing */}
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-white/50 rounded-full animate-pulse"
                  style={{
                    height: `${20 + Math.sin(Date.now() / 200 + i) * 10}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Time Display */}
        <span
          className={`text-xs font-medium whitespace-nowrap ${
            isOwnMessage ? "text-gray-800" : "text-gray-600"
          }`}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default WhatsAppAudioPlayer;
