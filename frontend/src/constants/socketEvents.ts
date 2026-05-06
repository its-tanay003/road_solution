export const SOCKET_EVENTS = {
  SOS_TRIGGERED: 'sos:triggered',
  SOS_ACKNOWLEDGED: 'sos:acknowledged',
  UNIT_DISPATCHED: 'unit:dispatched',
  UNIT_POSITION: 'unit:position',
  UNIT_ON_SCENE: 'unit:on_scene',
  INCIDENT_RESOLVED: 'incident:resolved',
  TRIAGE_UPDATE: 'triage:update',
  MESH_ACTIVE: 'mesh:active',
  MESH_PEER_CONNECTED: 'mesh:peer_connected',
  JUDGE_SOS: 'judge:sos',
} as const;
