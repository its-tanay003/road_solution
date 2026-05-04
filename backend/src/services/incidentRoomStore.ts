import { redisClient } from './cacheService';

// Types
export interface RoomUser {
  id: string; // Socket ID
  userId: string;
  name: string;
  role: 'DISPATCHER' | 'DOCTOR' | 'FIELD_UNIT';
  color: string;
}

export interface RoomNote {
  id: string;
  author: string;
  text: string;
  type: 'MEDICAL' | 'LOGISTICS' | 'AI_INSIGHT' | 'FIELD_OBSERVATION';
  timestamp: string;
}

export interface RoomState {
  users: RoomUser[];
  notes: RoomNote[];
  aiConsensus: string | null;
  status: 'active' | 'resolved';
}

const ROOM_PREFIX = 'incident_room:';

// Helper to handle the fact that Redis might not be available
const getRoomKey = (roomId: string) => `${ROOM_PREFIX}${roomId}`;

export const getIncidentRoomState = async (roomId: string): Promise<RoomState> => {
  if (redisClient.isOpen) {
    const data = await redisClient.get(getRoomKey(roomId));
    if (data) {
      return JSON.parse(data);
    }
  }
  // Default state
  return {
    users: [],
    notes: [],
    aiConsensus: null,
    status: 'active'
  };
};

export const setIncidentRoomState = async (roomId: string, state: RoomState): Promise<void> => {
  if (redisClient.isOpen) {
    await redisClient.set(getRoomKey(roomId), JSON.stringify(state), {
      EX: 86400 // Expire after 24 hours
    });
  }
};

export const addUserToRoom = async (roomId: string, user: RoomUser): Promise<RoomState> => {
  const state = await getIncidentRoomState(roomId);
  const existingUserIdx = state.users.findIndex(u => u.id === user.id);
  if (existingUserIdx >= 0) {
    state.users[existingUserIdx] = user;
  } else {
    state.users.push(user);
  }
  await setIncidentRoomState(roomId, state);
  return state;
};

export const removeUserFromRoom = async (roomId: string, socketId: string): Promise<RoomState> => {
  const state = await getIncidentRoomState(roomId);
  state.users = state.users.filter(u => u.id !== socketId);
  await setIncidentRoomState(roomId, state);
  return state;
};

export const addNoteToRoom = async (roomId: string, note: RoomNote): Promise<RoomState> => {
  const state = await getIncidentRoomState(roomId);
  state.notes.push(note);
  await setIncidentRoomState(roomId, state);
  return state;
};

export const setRoomConsensus = async (roomId: string, consensus: string): Promise<RoomState> => {
  const state = await getIncidentRoomState(roomId);
  state.aiConsensus = consensus;
  await setIncidentRoomState(roomId, state);
  return state;
};
