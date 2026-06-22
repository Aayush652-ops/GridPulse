import React, { useEffect, useRef } from 'react';

export default function BackgroundLayer() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let intervalId;

    const syncVideoToTime = () => {
      if (Number.isNaN(video.duration) || video.duration === 0) return;

      const now = new Date();
      const secondsSinceMidnight = 
        now.getHours() * 3600 + 
        now.getMinutes() * 60 + 
        now.getSeconds() + 
        now.getMilliseconds() / 1000;
      
      // Calculate how far we are into the 24-hour day (0.0 to 1.0)
      const fractionOfDay = secondsSinceMidnight / 86400;
      
      // Explicitly set the video frame to match the time of day
      video.currentTime = fractionOfDay * video.duration;
    };

    const onLoadedMetadata = () => {
      // Pause the video because we will manually control the frames like a clock
      video.pause(); 
      syncVideoToTime();
      
      // Update the frame every second to keep it strictly synced
      intervalId = setInterval(syncVideoToTime, 1000);
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);

    // If metadata is already loaded when the effect runs, initialize immediately
    if (video.readyState >= 1) {
      onLoadedMetadata();
    }

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: '#050b18'
      }}
    >
      <video
        ref={videoRef}
        src="/city_skyline.mp4"
        muted
        playsInline
        loop
        preload="auto"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  );
}
