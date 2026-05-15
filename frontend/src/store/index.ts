/**
 * Zustand Store Export Hub
 * 
 * This file serves as a clean barrel export for all modular stores.
 * Direct use of monolithic index.ts is deprecated; favor importing from specific store files.
 */

// 1. Re-exports from existing standalone files
export * from './hospitalStore';
export type { Hospital } from './hospitalStore';
export * from './blockchainStore';
export * from './notificationStore';
export * from './trainingStore';
export * from './wearableStore';
export * from './ambulanceStore';
export * from './notificationStatusStore';
export * from './aiAssistantStore';
export * from './mapDataStore';
export * from './routeStore';
export * from './volunteerStore';
export * from './weatherStore';
export * from './pushNotificationStore';
export { useSettingsStore } from './settingsStore';
export type { SettingsState, Theme as SettingsTheme, Language as SettingsLanguage } from './settingsStore';
export * from './authStore';
export * from './awarenessStore';
export * from './analyticsStore';

// 2. Exports from new modularized stores
export * from './userStore';
export * from './sosStore';
export * from './uiStore';
export * from './networkStore';
export * from './servicesStore';
export * from './judgeStore';
export * from './chaosStore';
export * from './demoStore';
export * from './leaderboardStore';
export * from './debriefStore';
export { useAccessibilityStore } from './accessibilityStore';
export type { AccessibilityState, Theme as AccessibilityTheme, Language as AccessibilityLanguage } from './accessibilityStore';
export * from './droneRegistryStore';
export * from './droneStore'; // Single drone status store

// Note: emergencyStore, medicalProfileStore, distressStore, and alertStore are deprecated and merged into sosStore and userStore.
export { useSosStore as useEmergencyStore } from './sosStore';
