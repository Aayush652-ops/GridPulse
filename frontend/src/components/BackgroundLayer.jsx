import React, { useEffect, useRef } from 'react';

export default function BackgroundLayer() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let intervalId;

    const syncVideoToTime = () => {
      // Use isFinite to perfectly guard against NaN or Infinity
      if (!video || !isFinite(video.duration) || video.duration === 0) return;

      const now = new Date();
      const secondsSinceMidnight = 
        now.getHours() * 3600 + 
        now.getMinutes() * 60 + 
        now.getSeconds() + 
        now.getMilliseconds() / 1000;
      
      const fractionOfDay = secondsSinceMidnight / 86400;
      video.currentTime = fractionOfDay * video.duration;
    };

    const initializeClock = () => {
      // Browsers will often render a black frame if a video is paused before it ever plays.
      // We force it to play for a microsecond, then pause it, to guarantee the frame paints.
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          video.pause();
          syncVideoToTime();
          intervalId = setInterval(syncVideoToTime, 1000);
        }).catch(() => {
          // Fallback if auto-play is strictly blocked
          syncVideoToTime();
          intervalId = setInterval(syncVideoToTime, 1000);
        });
      } else {
        video.pause();
        syncVideoToTime();
        intervalId = setInterval(syncVideoToTime, 1000);
      }
    };

    const onLoadedMetadata = () => {
      initializeClock();
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);

    if (video.readyState >= 1) {
      initializeClock();
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
        preload="metadata"
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
