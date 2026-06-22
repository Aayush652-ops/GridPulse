import React, { useEffect, useRef } from 'react';

export default function BackgroundLayer() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      // Ensure we have a valid duration before calculating
      if (Number.isNaN(video.duration) || video.duration === 0) return;
      
      const now = new Date();
      const secondsSinceMidnight = 
        now.getHours() * 3600 + 
        now.getMinutes() * 60 + 
        now.getSeconds() + 
        now.getMilliseconds() / 1000;
      
      // Calculate how far we are into the 24-hour day (0.0 to 1.0)
      const fractionOfDay = secondsSinceMidnight / 86400;
      
      // Map the time of day directly to the video's timeline
      video.currentTime = fractionOfDay * video.duration;
    };

    // Pause the video since we are manually scrubbing the timeline to sync with real-world time
    video.pause();

    const onLoadedMetadata = () => {
      updateTime();
    };
    
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    
    // Update the frame periodically to stay in sync with the current time
    // An interval of 1000ms is sufficient because the video plays extremely slowly 
    // (a 10s video stretched over 24 hours only changes by ~0.0001s per real-time second)
    const interval = setInterval(updateTime, 1000);

    // Initial call in case metadata is already loaded
    if (video.readyState >= 1) {
      updateTime();
    }

    return () => {
      clearInterval(interval);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
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
