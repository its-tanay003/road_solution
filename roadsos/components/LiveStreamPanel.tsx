'use client';

import { useEffect, useRef, useState } from 'react';
import { useSOSStore } from '@/lib/store/sosStore';
import { getBrowserClient } from '@/lib/supabase/browser';
import { Video, Mic, MapPin, Radio, Circle, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface LiveStreamPanelProps {
  stream: MediaStream | null;
  peers: Record<string, any>;
  onStop?: () => void;
}

export function LiveStreamPanel({ stream, peers, onStop }: LiveStreamPanelProps) {
  const { incidentId, location, telemetryData } = useSOSStore();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [hasVideo, setHasVideo] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [peerStates, setPeerStates] = useState<Record<string, 'connecting' | 'connected' | 'failed'>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<string>('');
  const [expanded, setExpanded] = useState(false);

  // 1. Detect media availability
  useEffect(() => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      setHasVideo(videoTracks.length > 0 && videoTracks[0].enabled);
      setHasAudio(audioTracks.length > 0 && audioTracks[0].enabled);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } else {
      setHasVideo(false);
      setHasAudio(false);
    }
  }, [stream]);

  // 2. Peer connection state tracking
  useEffect(() => {
    const initialStates: Record<string, 'connecting' | 'connected' | 'failed'> = {};
    const contacts = telemetryData?.emergencyContacts || [];
    
    contacts.forEach((contact) => {
      const contactKey = contact.phone;
      initialStates[contactKey] = 'connecting';
      
      const peer = peers[contactKey];
      if (peer) {
        if (peer.connected) {
          initialStates[contactKey] = 'connected';
        }
        
        peer.on('connect', () => {
          setPeerStates(prev => ({ ...prev, [contactKey]: 'connected' }));
        });
        peer.on('error', () => {
          setPeerStates(prev => ({ ...prev, [contactKey]: 'failed' }));
        });
        peer.on('close', () => {
          setPeerStates(prev => ({ ...prev, [contactKey]: 'failed' }));
        });
      }
    });
    
    setPeerStates(initialStates);
  }, [peers, telemetryData]);

  // 3. Location Ping Fallback Loop (If both video & audio are missing/blocked)
  useEffect(() => {
    const bothFailed = !hasVideo && !hasAudio;
    
    if (bothFailed && incidentId) {
      console.log('[LiveStreamPanel] Both video & audio unavailable. Starting location ping fallback...');
      
      const sendLocationPing = async () => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) return;
        
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const supabase = getBrowserClient();
            if (!supabase) return;
            
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            console.log(`[LiveStreamPanel] Dispatching GPS Ping: ${lat}, ${lng}`);
            
            await supabase
              .from('incidents')
              .update({
                lat,
                lng,
                updated_at: new Date().toISOString()
              })
              .eq('id', incidentId);
          },
          (err) => {
            console.warn('[LiveStreamPanel] Location fallback failed:', err);
          },
          { enableHighAccuracy: true }
        );
      };
      
      // Ping immediately and then every 30s
      void sendLocationPing();
      pingIntervalRef.current = setInterval(sendLocationPing, 30000);
    } else {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    }
    
    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [hasVideo, hasAudio, incidentId]);

  // 4. MediaRecorder 30-Second Segment Upload Loop
  useEffect(() => {
    if (!stream || !incidentId || !hasVideo) return;
    
    const supabase = getBrowserClient();
    if (!supabase) return;

    const startRecordingSegment = () => {
      try {
        const options = { mimeType: 'video/webm;codecs=vp8,opus' };
        let recorder: MediaRecorder;
        
        if (MediaRecorder.isTypeSupported(options.mimeType)) {
          recorder = new MediaRecorder(stream, options);
        } else {
          recorder = new MediaRecorder(stream);
        }
        
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];
        setIsRecording(true);
        setRecordingStatus('active');
        
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };
        
        recorder.onstop = async () => {
          if (chunksRef.current.length === 0) return;
          
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const filename = `sos-recordings/${incidentId}/${Date.now()}.webm`;
          
          setRecordingStatus('saving');
          console.log(`[MediaRecorder] Segment upload started: ${filename}`);
          
          try {
            const { data, error } = await supabase.storage
              .from('distress_recordings')
              .upload(filename, blob, {
                contentType: 'video/webm',
                cacheControl: '3600',
                upsert: true
              });
              
            if (error) throw error;
            
            const { data: { publicUrl } } = supabase.storage
              .from('distress_recordings')
              .getPublicUrl(filename);
              
            console.log(`[MediaRecorder] Segment uploaded successfully: ${publicUrl}`);
            
            // Save last public URL to incidents
            await supabase
              .from('incidents')
              .update({
                video_recording_url: publicUrl,
                updated_at: new Date().toISOString()
              })
              .eq('id', incidentId);
              
            setRecordingStatus('saved');
          } catch (uploadErr) {
            console.warn('[MediaRecorder] Segment upload failed:', uploadErr);
            setRecordingStatus('error');
          }
        };
        
        recorder.start();
      } catch (err) {
        console.error('[MediaRecorder] Failed to start recorder:', err);
      }
    };

    const stopAndRestartRecorder = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      // Re-trigger segment recording
      startRecordingSegment();
    };

    // Begin first segment
    startRecordingSegment();
    
    // Cycle segments every 30 seconds
    recordIntervalRef.current = setInterval(stopAndRestartRecorder, 30000);

    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    };
  }, [stream, incidentId, hasVideo]);

  return (
    <div
      className={cn(
        "fixed z-[9999] bg-gray-950/90 border border-gray-800 backdrop-blur-md rounded-2xl shadow-2xl transition-all duration-300 flex flex-col overflow-hidden",
        isRtl ? "left-4" : "right-4",
        expanded ? "bottom-4 w-[280px] h-[340px]" : "bottom-4 w-[160px] h-[120px]"
      )}
    >
      {/* Video stream container */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="w-full h-[120px] bg-black relative cursor-pointer group flex items-center justify-center select-none shrink-0"
      >
        {hasVideo ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-red-500">
            {hasAudio ? (
              <>
                <Mic size={24} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider">{t('sos.audioOnly', 'Audio Only')}</span>
              </>
            ) : (
              <>
                <MapPin size={24} className="animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-wider">{t('sos.pingsOnly', 'Location pings')}</span>
              </>
            )}
          </div>
        )}

        {/* Live overlay badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-650/80 border border-red-500/20 text-white rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest pointer-events-none select-none">
          <Circle size={6} className="fill-white animate-ping" />
          <span>LIVE</span>
        </div>

        {isRecording && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider pointer-events-none">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              recordingStatus === 'active' && "bg-red-500 animate-pulse",
              recordingStatus === 'saving' && "bg-amber-500 animate-spin",
              recordingStatus === 'saved' && "bg-green-500"
            )} />
            <span>REC</span>
          </div>
        )}
      </div>

      {/* Fallback & Peer Status Panel - appears on expanded */}
      <div className="flex-1 flex flex-col p-3 gap-2 overflow-y-auto no-scrollbar">
        {/* Banner Alert if Fallbacks Active */}
        {!hasVideo && (
          <div className="flex items-start gap-1.5 bg-red-950/20 border border-red-900/30 text-red-400 p-2 rounded-lg text-[10px] leading-tight font-semibold">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>
              {!hasAudio 
                ? t('sos.audioUnavailableBanner', 'Audio unavailable — sending location pings')
                : t('sos.videoUnavailableBanner', 'Video unavailable — sending audio only')}
            </span>
          </div>
        )}

        {/* Dynamic emergency contacts status panel */}
        <div className="space-y-2 mt-1">
          <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-900 pb-1.5">
            <span>{t('sos.contactsLinked', 'Emergency Links')}</span>
            <span className="flex items-center gap-1 text-gray-400 font-bold">
              <Radio size={10} className="animate-pulse" />
              {Object.values(peerStates).filter(s => s === 'connected').length}/{Object.keys(peerStates).length}
            </span>
          </div>

          <div className="space-y-1.5">
            {(telemetryData?.emergencyContacts || []).map((contact) => {
              const state = peerStates[contact.phone] || 'connecting';
              return (
                <div key={contact.phone} className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-300 font-bold truncate max-w-[130px]">{contact.name}</span>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md",
                    state === 'connected' && "text-green-400 bg-green-950/20 border border-green-800/30",
                    state === 'connecting' && "text-amber-400 bg-amber-950/20 border border-amber-800/30 animate-pulse",
                    state === 'failed' && "text-red-400 bg-red-950/20 border border-red-800/30"
                  )}>
                    {state === 'connected' && t('sos.peerConnected', 'Connected')}
                    {state === 'connecting' && t('sos.peerConnecting', 'Connecting')}
                    {state === 'failed' && t('sos.peerFailed', 'Failed')}
                  </span>
                </div>
              );
            })}

            {(telemetryData?.emergencyContacts || []).length === 0 && (
              <div className="text-[10px] text-gray-600 italic text-center py-2">
                {t('sos.noContactsRegistered', 'No contact lines loaded')}
              </div>
            )}
          </div>
        </div>

        {/* Action controllers */}
        <div className="mt-auto pt-3 border-t border-gray-900 flex gap-2 shrink-0">
          <button
            onClick={() => setExpanded(false)}
            className="flex-1 bg-gray-900 hover:bg-gray-850 text-gray-300 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-gray-800"
          >
            {t('buttons.minimize', 'Minimize')}
          </button>
          {onStop && (
            <button
              onClick={onStop}
              className="flex-1 bg-red-650 hover:bg-red-750 text-white py-1.5 rounded-lg text-[10px] font-black transition-all border border-red-500/20"
            >
              {t('buttons.stop', 'Stop Feed')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
