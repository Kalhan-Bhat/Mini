import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { ROLE_COLORS, getVideoConfig } from '../config';
import EngagementAnalytics from './EngagementAnalytics';
import useAgoraClient from '../hooks/useAgoraClient';

const TeacherDashboard = () => {
  const [participants, setParticipants] = useState(new Map());
  const [localUid, setLocalUid] = useState(null);
  const wsRef = useRef(null);

  const {
    client,
    localTracks,
    joinChannel
  } = useAgoraClient(getVideoConfig());

  // Handle remote user events
  useEffect(() => {
    if (!client) return;

    const handleUserPublished = async (user, mediaType) => {
      try {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          const container = document.getElementById(`video-${user.uid}`);
          if (container) {
            user.videoTrack?.play(container);
          }
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      } catch (error) {
        console.error('Error subscribing to user:', error);
      }
    };

    const handleUserLeft = (user) => {
      setParticipants(prev => {
        const next = new Map(prev);
        next.delete(user.uid);
        return next;
      });
    };

    client.on('user-published', handleUserPublished);
    client.on('user-left', handleUserLeft);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-left', handleUserLeft);
    };
  }, [client]);

  useEffect(() => {
    const init = async () => {
      try {
        const teacherName = sessionStorage.getItem('teacherName') || 'Teacher';
        const channel = 'default';
        
        console.log('Initializing TeacherDashboard:', { teacherName, channel });
        
        // Fetch token with fallback
        let tokenData;
        try {
          const response = await fetch(`http://localhost:8081/token?channel=${channel}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          if (response.ok) {
            tokenData = await response.json();
          } else {
            console.warn('Token endpoint failed:', response.status);
            tokenData = { uid: Math.floor(Math.random() * 100000), token: null };
          }
        } catch (fetchErr) {
          console.warn('Token fetch error:', fetchErr.message);
          tokenData = { uid: Math.floor(Math.random() * 100000), token: null };
        }
        
        const uid = tokenData.uid;
        setLocalUid(uid);
        
        // Try to join Agora
        try {
          const { videoTrack } = await joinChannel(channel, null, uid);
          if (videoTrack) {
            const container = document.getElementById(`video-${uid}`);
            if (container) {
              videoTrack.play(container);
            }
          }
        } catch (agoraErr) {
          console.warn('Agora join error (non-critical):', agoraErr.message);
        }
        
        // Connect WebSocket
        try {
          wsRef.current = new WebSocket(`ws://localhost:8081?channel=${channel}&uid=${uid}`);
          wsRef.current.onopen = () => {
            console.log('WebSocket connected');
            wsRef.current.send(JSON.stringify({
              type: 'user-info',
              channel,
              uid,
              name: teacherName,
              role: 'teacher'
            }));
          };
          wsRef.current.onmessage = handleWSMessage;
          wsRef.current.onerror = (err) => console.warn('WebSocket error:', err);
        } catch (wsErr) {
          console.warn('WebSocket error (non-critical):', wsErr.message);
        }
        
        // Add self to participants
        setParticipants(new Map([[uid, { name: teacherName, role: 'teacher' }]]));
      } catch (error) {
        console.error('TeacherDashboard init error:', error);
      }
    };

    init();

    return () => {
      wsRef.current?.close();
      localTracks?.forEach(track => track?.close?.());
      client?.leave?.();
    };
  }, [joinChannel, client, localTracks]);

  const handleWSMessage = async (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'user-info' && data.channel === window.AGORA_STATE?.channel) {
      setParticipants(prev => new Map(prev).set(Number(data.uid), {
        name: data.name,
        role: data.role
      }));
    }
  };

  const VideoTile = ({ uid, name, isLocal }) => (
    <Paper
      elevation={0}
      sx={{
        p: 1,
        borderRadius: 2,
        background: '#fff',
        height: '100%'
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          mb: 1,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <span style={{ 
          color: isLocal ? ROLE_COLORS.self : ROLE_COLORS.student,
          fontSize: '1.2em' 
        }}>●</span>
        {name || `User ${uid}`}
      </Typography>
      <Box
        id={`video-${uid}`}
        sx={{
          width: '100%',
          paddingBottom: '56.25%',
          position: 'relative',
          background: '#1f2937',
          borderRadius: 1,
          overflow: 'hidden',
          border: `2px solid ${isLocal ? ROLE_COLORS.self : ROLE_COLORS.student}`
        }}
      >
        <Box
          className="video-player"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            '& > *': { // Target video element
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }
          }}
        />
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Video Grid */}
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.paper'
              }}
            >
              {Array.from(participants.entries()).map(([uid, info]) => (
                <VideoTile
                  key={uid}
                  uid={uid}
                  name={info.name}
                  isLocal={uid === localUid}
                />
              ))}
            </Box>
          </Grid>

          {/* Analytics Panel */}
          <Grid item xs={12} md={4}>
            <EngagementAnalytics participants={participants} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default TeacherDashboard;