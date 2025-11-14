import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import { ROLE_COLORS, getVideoConfig } from '../config';
import useAgoraClient from '../hooks/useAgoraClient';

const StudentPortal = () => {
  const theme = useTheme();
  const [localUid, setLocalUid] = useState(null);
  const wsRef = useRef(null);
  const [userName, setUserName] = useState('');

  const {
    client,
    localTracks,
    joinChannel,
    handleUserPublished,
    handleUserUnpublished,
    handleUserLeft
  } = useAgoraClient(getVideoConfig());

  useEffect(() => {
    const init = async () => {
      try {
        const studentName = sessionStorage.getItem('studentName') || 'Student';
        setUserName(studentName);
        const channel = 'default';
        
        console.log('Initializing StudentPortal:', { studentName, channel });
        
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
        
        setLocalUid(tokenData.uid);
        
        // Try to join Agora
        try {
          const { videoTrack } = await joinChannel(channel, null, tokenData.uid);
          if (videoTrack) {
            videoTrack.play('local-video');
          }
        } catch (agoraErr) {
          console.warn('Agora join error (non-critical):', agoraErr.message);
        }
        
        // Connect WebSocket
        try {
          wsRef.current = new WebSocket(`ws://localhost:8081?channel=${channel}&uid=${tokenData.uid}`);
          wsRef.current.onopen = () => {
            console.log('WebSocket connected');
            wsRef.current.send(JSON.stringify({
              type: 'user-info',
              channel,
              uid: tokenData.uid,
              name: studentName,
              role: 'student'
            }));
          };
          wsRef.current.onerror = (err) => console.warn('WebSocket error:', err);
        } catch (wsErr) {
          console.warn('WebSocket error (non-critical):', wsErr.message);
        }
      } catch (error) {
        console.error('StudentPortal init error:', error);
      }
    };

    init();

    return () => {
      wsRef.current?.close();
      localTracks?.forEach(track => track?.close?.());
      client?.leave?.();
    };
  }, [joinChannel, client, localTracks]);

  return (
    <Box sx={{ height: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            background: '#fff',
            height: '100%'
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <span style={{ color: ROLE_COLORS.student, fontSize: '1.2em' }}>●</span>
            {userName || 'Student View'}
          </Typography>
          
          {/* Local Video Container */}
          <Box
            sx={{
              width: '100%',
              paddingBottom: '56.25%',
              position: 'relative',
              background: '#1f2937',
              borderRadius: 1,
              overflow: 'hidden'
            }}
            id="local-video"
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default StudentPortal;