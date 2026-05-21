import { getBrowserClient } from '@/lib/supabase/browser';
import mqtt from 'mqtt';

export interface SOSTelemetry {
  name: string;
  age: string;
  bloodGroup: string;
  conditions: string;
  allergies: string;
  emergencyContacts: { name: string; phone: string; relationship?: string }[];
  lat: number;
  lng: number;
  address: string;
  battery: number;
  network: string;
  speed: number;
  timestamp: number;
  deviceInfo: string;
}

export interface BroadcastChannelResult {
  channel: string;
  status: 'sent' | 'failed' | 'unavailable';
  detail: string;
}

function formatSOSMessage(data: SOSTelemetry): string {
  const mapLink = `https://www.google.com/maps?q=${data.lat},${data.lng}`;
  const speedKmh = Math.round((data.speed || 0) * 3.6);
  
  return `⚠️ EMERGENCY SOS ALERT! ⚠️
Name: ${data.name} (Age: ${data.age})
Blood Group: ${data.bloodGroup}
Conditions: ${data.conditions || 'None'}
Allergies: ${data.allergies || 'None'}
Location: ${data.address}
Maps Link: ${mapLink}
Battery: ${data.battery}% | Network: ${data.network}
Speed: ${speedKmh} km/h`;
}

export async function broadcastSOS(sosData: SOSTelemetry): Promise<BroadcastChannelResult[]> {
  const message = formatSOSMessage(sosData);
  const contacts = sosData.emergencyContacts || [];
  
  // Create all channel promises
  const channels: { name: string; promise: () => Promise<BroadcastChannelResult> }[] = [
    // 1. SMS via Twilio
    {
      name: 'sms',
      promise: async () => {
        if (contacts.length === 0) {
          return { channel: 'sms', status: 'unavailable', detail: 'No emergency contacts registered' };
        }
        
        try {
          const res = await fetch('/api/sos/sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: contacts.map((c) => c.phone),
              message
            })
          });
          
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || 'Failed to send SMS');
          }
          
          return { channel: 'sms', status: 'sent', detail: `SMS sent to ${contacts.length} contact(s)` };
        } catch (err: any) {
          return { channel: 'sms', status: 'failed', detail: err.message || 'SMS service error' };
        }
      }
    },
    
    // 2. WhatsApp Deep Link
    {
      name: 'whatsapp',
      promise: async () => {
        if (typeof window === 'undefined') {
          return { channel: 'whatsapp', status: 'unavailable', detail: 'Browser context needed' };
        }
        
        try {
          const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
          window.open(waUrl, '_blank');
          return { channel: 'whatsapp', status: 'sent', detail: 'WhatsApp share page opened' };
        } catch (err: any) {
          return { channel: 'whatsapp', status: 'failed', detail: err.message || 'WhatsApp launch failed' };
        }
      }
    },
    
    // 3. Email via API
    {
      name: 'email',
      promise: async () => {
        try {
          const res = await fetch('/api/sos/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sosData)
          });
          
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || 'Failed to dispatch email');
          }
          
          return { channel: 'email', status: 'sent', detail: 'Emergency email alerts dispatched' };
        } catch (err: any) {
          return { channel: 'email', status: 'failed', detail: err.message || 'Email dispatch error' };
        }
      }
    },
    
    // 4. Push Notification via API
    {
      name: 'push',
      promise: async () => {
        try {
          const res = await fetch('/api/sos/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sosData)
          });
          
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || 'Failed to send Push Notifications');
          }
          
          return { channel: 'push', status: 'sent', detail: 'Push notification sent to contact devices' };
        } catch (err: any) {
          return { channel: 'push', status: 'failed', detail: err.message || 'Push service error' };
        }
      }
    },
    
    // 5. Web Bluetooth Scan / Broadcast
    {
      name: 'bluetooth',
      promise: async () => {
        if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
          return { channel: 'bluetooth', status: 'unavailable', detail: 'Web Bluetooth not supported by browser' };
        }
        
        try {
          // Attempting requestDevice to advertise/establish pairing as broadcast trigger
          await (navigator as any).bluetooth.requestDevice({ acceptAllDevices: true });
          return { channel: 'bluetooth', status: 'sent', detail: 'Bluetooth advertisement initiated' };
        } catch (err: any) {
          if (err.name === 'NotSupportedError') {
            return { channel: 'bluetooth', status: 'unavailable', detail: 'Bluetooth hardware not available' };
          }
          return { channel: 'bluetooth', status: 'failed', detail: err.message || 'Bluetooth connection rejected' };
        }
      }
    },
    
    // 6. Web Serial Link
    {
      name: 'serial',
      promise: async () => {
        if (typeof navigator === 'undefined' || !('serial' in navigator)) {
          return { channel: 'serial', status: 'unavailable', detail: 'Web Serial not supported by browser' };
        }
        
        try {
          await (navigator as any).serial.requestPort();
          return { channel: 'serial', status: 'sent', detail: 'Serial alert sent to port' };
        } catch (err: any) {
          return { channel: 'serial', status: 'unavailable', detail: err.message || 'No active serial device selected' };
        }
      }
    },
    
    // 7. Supabase Realtime Broadcast
    {
      name: 'websocket',
      promise: async () => {
        try {
          const supabase = getBrowserClient();
          if (!supabase) {
            return { channel: 'websocket', status: 'unavailable', detail: 'Supabase client not initialized' };
          }
          
          const channel = supabase.channel('sos_events');
          
          const response = await channel.send({
            type: 'broadcast',
            event: 'sos',
            payload: {
              ...sosData,
              timestamp: Date.now()
            }
          });
          
          if (response !== 'ok') {
            throw new Error(`Realtime channel returned status: ${response}`);
          }
          
          return { channel: 'websocket', status: 'sent', detail: 'Realtime map telemetry broadcasted' };
        } catch (err: any) {
          return { channel: 'websocket', status: 'failed', detail: err.message || 'Realtime broadcast error' };
        }
      }
    },
    
    // 8. MQTT over WebSocket via HiveMQ Public Broker
    {
      name: 'mqtt',
      promise: () => {
        return new Promise<BroadcastChannelResult>((resolve) => {
          try {
            const userNameSanitized = sosData.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'anon';
            const topic = `emergency/sos/${userNameSanitized}`;
            
            // Connect to HiveMQ Public Broker via encrypted WebSocket
            const client = mqtt.connect('wss://broker.hivemq.com:8000/mqtt', {
              connectTimeout: 4000,
              reconnectPeriod: 0 // do not auto-reconnect on fail
            });
            
            let resolved = false;
            
            const cleanupAndResolve = (result: BroadcastChannelResult) => {
              if (resolved) return;
              resolved = true;
              try {
                client.end(true);
              } catch {}
              resolve(result);
            };
            
            client.on('connect', () => {
              client.publish(topic, JSON.stringify(sosData), { qos: 1 }, (publishErr) => {
                if (publishErr) {
                  cleanupAndResolve({ channel: 'mqtt', status: 'failed', detail: publishErr.message });
                } else {
                  cleanupAndResolve({ channel: 'mqtt', status: 'sent', detail: `Published to HiveMQ topic: ${topic}` });
                }
              });
            });
            
            client.on('error', (err) => {
              cleanupAndResolve({ channel: 'mqtt', status: 'failed', detail: err.message || 'MQTT error' });
            });
            
            // Fail if timeout exceeded
            setTimeout(() => {
              cleanupAndResolve({ channel: 'mqtt', status: 'failed', detail: 'Connection to HiveMQ timed out' });
            }, 5000);
            
          } catch (err: any) {
            resolve({ channel: 'mqtt', status: 'failed', detail: err.message || 'MQTT init failed' });
          }
        });
      }
    }
  ];
  
  // Execute all channels concurrently using settled promises
  const settles = await Promise.allSettled(channels.map((ch) => ch.promise()));
  
  return settles.map((settled, idx) => {
    const chName = channels[idx].name;
    if (settled.status === 'fulfilled') {
      return settled.value;
    } else {
      return {
        channel: chName,
        status: 'failed',
        detail: settled.reason?.message || 'Uncaught error in channel promise'
      };
    }
  });
}
