/**
 * Student Page Component - Modern Google Meet Style UI
 * Student view with video call and engagement detection
 */

import { useState, useEffect, useRef } from 'react'
import { useAgora } from '../hooks/useAgora'
import { useSocket } from '../hooks/useSocket'
import VideoPlayer from '../components/VideoPlayer'
import EmotionDisplay from '../components/EmotionDisplay'
import Whiteboard from '../components/Whiteboard'
import ScreenShare from '../components/ScreenShare'

function StudentPageNew() {
  // Form state
  const [channelName, setChannelName] = useState('')
  const [studentName, setStudentName] = useState('')
  
  // Engagement state
  const [currentEngagement, setCurrentEngagement] = useState(null)
  const [confidence, setConfidence] = useState(0)
  
  // UI state
  const [activePanel, setActivePanel] = useState(null) // 'whiteboard', 'screenshare', null
  const [panelMinimized, setPanelMinimized] = useState(false)
  const [showEngagement, setShowEngagement] = useState(true)
  
  // Store remote user names
  const [remoteUserNames, setRemoteUserNames] = useState({})
  
  // Video state
  const { localTracks, remoteUsers, isJoined, isLoading, error, join, leave, toggleAudio, toggleVideo, currentUid, client } = useAgora()
  const { socket, emit, on, off } = useSocket()
  
  // Refs
  const frameIntervalRef = useRef(null)
  const canvasRef = useRef(null)

  /**
   * Handle joining channel
   */
  const handleJoin = async () => {
    if (!channelName.trim()) {
      alert('Please enter a channel name')
      return
    }

    try {
      console.log('🎥 Joining channel as student...')
      const { uid } = await join(channelName, 'student')
      console.log('✅ Joined successfully, UID:', uid)
      
      // Notify backend that student joined
      emit('student:join', {
        studentId: uid,
        studentName: studentName || `Student ${uid}`,
        channelName
      })
      console.log('📡 Notified backend of join')
    } catch (err) {
      console.error('❌ Failed to join:', err)
    }
  }

  /**
   * Handle leaving channel
   */
  const handleLeave = async () => {
    stopFrameCapture()
    
    if (currentUid) {
      emit('student:leave', {
        studentId: currentUid,
        channelName
      })
    }
    
    await leave()
    setCurrentEngagement(null)
    setConfidence(0)
  }

  /**
   * Start capturing and sending video frames
   */
  const startFrameCapture = (uid, channel) => {
    if (!localTracks.video) {
      console.warn('⚠️ No video track available')
      return
    }

    console.log('📸 Starting frame capture...')

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
      canvasRef.current.width = 224
      canvasRef.current.height = 224
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    frameIntervalRef.current = setInterval(() => {
      try {
        let videoElement = document.querySelector('.local-video video')
        
        if (!videoElement) {
          videoElement = document.querySelector('.video-player.local-video video')
        }
        if (!videoElement) {
          videoElement = document.querySelector('[class*="local-video"] video')
        }
        
        if (!videoElement || videoElement.readyState < 2) {
          return
        }

        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
        const frameData = canvas.toDataURL('image/jpeg', 0.8)

        emit('frame:send', {
          studentId: uid,
          frame: frameData,
          channelName: channel,
          timestamp: Date.now()
        })

        console.log('📤 Sent frame to backend')
      } catch (err) {
        console.error('❌ Error capturing frame:', err)
      }
    }, 2000)
  }

  /**
   * Stop frame capture
   */
  const stopFrameCapture = () => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current)
      frameIntervalRef.current = null
      console.log('⏹️ Stopped frame capture')
    }
  }

  /**
   * Start frame capture when video track becomes available
   */
  useEffect(() => {
    if (isJoined && localTracks.video && currentUid && channelName) {
      console.log('🎬 Video track is ready, starting frame capture in 3 seconds...')
      const timer = setTimeout(() => {
        startFrameCapture(currentUid, channelName)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [isJoined, localTracks.video, currentUid, channelName])

  /**
   * Listen for engagement results from backend
   */
  useEffect(() => {
    const handleEngagementResult = (data) => {
      console.log('🎯 Received engagement:', data)
      setCurrentEngagement(data.engagement)
      setConfidence(data.confidence)
    }

    const handleEngagementError = (data) => {
      console.error('❌ Engagement error:', data)
    }

    const handleStudentJoined = (data) => {
      console.log('👨‍🎓 Student joined:', data)
      if (data.studentId && data.studentName) {
        setRemoteUserNames(prev => ({
          ...prev,
          [data.studentId]: data.studentName
        }))
      }
    }
    
    const handleTeacherJoined = (data) => {
      console.log('👨‍🏫 Teacher joined:', data)
      if (data.teacherId && data.teacherName) {
        setRemoteUserNames(prev => ({
          ...prev,
          [data.teacherId]: data.teacherName
        }))
      }
    }

    const handleUserLeft = (data) => {
      console.log('👋 User left:', data)
      const userId = data.studentId || data.teacherId
      if (userId) {
        setRemoteUserNames(prev => {
          const newNames = { ...prev }
          delete newNames[userId]
          return newNames
        })
      }
    }

    on('engagement:result', handleEngagementResult)
    on('engagement:error', handleEngagementError)
    on('student:joined', handleStudentJoined)
    on('teacher:joined', handleTeacherJoined)
    on('student:left', handleUserLeft)
    on('teacher:left', handleUserLeft)

    return () => {
      off('engagement:result', handleEngagementResult)
      off('engagement:error', handleEngagementError)
      off('student:joined', handleStudentJoined)
      off('teacher:joined', handleTeacherJoined)
      off('student:left', handleUserLeft)
      off('teacher:left', handleUserLeft)
    }
  }, [on, off])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopFrameCapture()
      if (isJoined) {
        handleLeave()
      }
    }
  }, [])

  // Not joined - Show join form
  if (!isJoined) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">
            <span>👨‍🎓</span> Student Portal
          </h1>
        </div>
        
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '2rem',
          padding: '2rem'
        }}>
          <div style={{ 
            background: '#3c4043', 
            padding: '2rem', 
            borderRadius: '12px', 
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ color: '#e8eaed', marginBottom: '1.5rem', textAlign: 'center' }}>
              Join Your Class
            </h2>
            
            <div className="join-form" style={{ flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                className="join-input"
                placeholder="Your Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                style={{
                  width: '100%',
                  background: '#5f6368',
                  color: '#e8eaed',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <input
                type="text"
                className="join-input"
                placeholder="Channel Name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                style={{
                  width: '100%',
                  background: '#5f6368',
                  color: '#e8eaed',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <button
                className="join-button"
                onClick={handleJoin}
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: '#1a73e8',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? 'Joining...' : 'Join Class'}
              </button>
            </div>

            {error && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '12px', 
                background: '#5f2120', 
                color: '#f28b82',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Joined - Show video call interface
  return (
    <div className="page-container">
      {/* Top Bar */}
      <div className="page-header">
        <div className="page-title">
          <span>👨‍🎓</span>
          <span>{channelName}</span>
          <span style={{ fontSize: '0.875rem', color: '#9aa0a6', fontWeight: '400' }}>
            • {Object.keys(remoteUsers).length + 1} participants
          </span>
        </div>
        
        <button
          onClick={handleLeave}
          style={{
            background: '#ea4335',
            color: '#fff',
            border: 'none',
            padding: '8px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.9rem'
          }}
        >
          Leave
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Video Grid */}
        <div className="video-main-container">
          <div className="video-section">
            <div className="video-grid">
              {/* Local Video */}
              {localTracks.video && (
                <VideoPlayer
                  videoTrack={localTracks.video}
                  audioTrack={localTracks.audio}
                  uid={currentUid}
                  label={`You (${studentName || currentUid})`}
                  isLocal={true}
                />
              )}

              {/* Remote Videos */}
              {Object.keys(remoteUsers).map((uid) => {
                const displayName = remoteUserNames[uid] || `User ${uid}`;
                
                return (
                  <VideoPlayer
                    key={uid}
                    videoTrack={remoteUsers[uid].videoTrack}
                    audioTrack={remoteUsers[uid].audioTrack}
                    uid={uid}
                    label={displayName}
                    isLocal={false}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Engagement Display */}
          {showEngagement && currentEngagement && (
            <div className="engagement-card" style={{ margin: '16px 0 0 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div className="engagement-title">Your Engagement</div>
                  <div className="engagement-value">{currentEngagement}</div>
                  <div className="engagement-confidence">
                    <span className="confidence-label">Confidence:</span>
                    <div className="confidence-bar-container">
                      <div 
                        className="confidence-bar-fill" 
                        style={{ width: `${confidence * 100}%` }}
                      />
                    </div>
                    <span className="confidence-label">{(confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowEngagement(false)}
                  className="panel-control-btn"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="control-bar">
        <button 
          className="control-button"
          onClick={toggleAudio}
          title="Toggle Microphone"
        >
          🎤
        </button>
        <button 
          className="control-button"
          onClick={toggleVideo}
          title="Toggle Camera"
        >
          📹
        </button>
        <button 
          className={`control-button ${activePanel === 'whiteboard' ? 'active' : ''}`}
          onClick={() => setActivePanel(activePanel === 'whiteboard' ? null : 'whiteboard')}
          title="Whiteboard"
        >
          📝
        </button>
        <button 
          className={`control-button ${activePanel === 'screenshare' ? 'active' : ''}`}
          onClick={() => setActivePanel(activePanel === 'screenshare' ? null : 'screenshare')}
          title="Screen Share"
        >
          🖥️
        </button>
        {!showEngagement && (
          <button 
            className="control-button"
            onClick={() => setShowEngagement(true)}
            title="Show Engagement"
          >
            📊
          </button>
        )}
      </div>

      {/* Floating Panels */}
      {activePanel === 'whiteboard' && (
        <div className={`floating-panel ${panelMinimized ? 'minimized' : ''}`}>
          <div className="panel-header">
            <div className="panel-title">
              <span>📝</span> Whiteboard
            </div>
            <div className="panel-controls">
              <button 
                className="panel-control-btn"
                onClick={() => setPanelMinimized(!panelMinimized)}
                title={panelMinimized ? 'Maximize' : 'Minimize'}
              >
                {panelMinimized ? '🗖' : '−'}
              </button>
              <button 
                className="panel-control-btn"
                onClick={() => setActivePanel(null)}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>
          <div className={`panel-content ${panelMinimized ? 'minimized' : ''}`}>
            <Whiteboard socket={socket} channelName={channelName} isTeacher={false} />
          </div>
        </div>
      )}

      {activePanel === 'screenshare' && (
        <div className={`floating-panel ${panelMinimized ? 'minimized' : ''}`}>
          <div className="panel-header">
            <div className="panel-title">
              <span>🖥️</span> Screen Share
            </div>
            <div className="panel-controls">
              <button 
                className="panel-control-btn"
                onClick={() => setPanelMinimized(!panelMinimized)}
                title={panelMinimized ? 'Maximize' : 'Minimize'}
              >
                {panelMinimized ? '🗖' : '−'}
              </button>
              <button 
                className="panel-control-btn"
                onClick={() => setActivePanel(null)}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>
          <div className={`panel-content ${panelMinimized ? 'minimized' : ''}`}>
            <ScreenShare client={client} channelName={channelName} isTeacher={false} />
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentPageNew
