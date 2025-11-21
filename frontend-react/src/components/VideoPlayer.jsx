/**
 * Video Player Component
 * Displays video stream for local or remote user
 */

import { useEffect, useRef } from 'react'

function VideoPlayer({ videoTrack, audioTrack, uid, label, isLocal = false }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoTrack && videoRef.current) {
      videoTrack.play(videoRef.current)
    }

    return () => {
      if (videoTrack) {
        videoTrack.stop()
      }
    }
  }, [videoTrack])

  useEffect(() => {
    if (audioTrack && !isLocal) {
      audioTrack.play()
    }

    return () => {
      if (audioTrack && !isLocal) {
        audioTrack.stop()
      }
    }
  }, [audioTrack, isLocal])

  return (
    <div className={`video-player ${isLocal ? 'local-video' : ''}`}>
      {videoTrack ? (
        <div ref={videoRef} style={{ width: '100%', height: '100%' }} />
      ) : (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#1f2937',
          color: '#fff'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎤</div>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Audio Only</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Camera unavailable</div>
        </div>
      )}
      <div className="video-label">{label}</div>
    </div>
  )
}

export default VideoPlayer
