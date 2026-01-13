// Configuration constants for the TurnPoint system
export const SystemConfig = {
  // Queue management limits
  MAX_DISPLAY_QUEUE_SIZE: 10,        // Maximum assignments in display queue (increased from 5 to 10)
  MAX_ACTIVE_BOXES: 50,              // Maximum number of total boxes
  MAX_CONCURRENT_DISPLAYS: 5,        // Maximum simultaneous displays
  
  // Display timing
  MESSAGE_DISPLAY_DURATION: 5000,    // Time message stays on screen (5 seconds)
  VIDEO_TRANSITION_DELAY: 3000,      // Delay before showing video after message (3 seconds)
  FADE_OUT_DURATION: 500,            // Video fade out animation duration (0.5 seconds)
  
  // Performance settings
  MAX_BOXES_PER_SERVICE: 20,         // Maximum boxes per service type
  MAX_WAITING_TICKETS: 200           // Maximum tickets in waiting state
} as const;

// Type for configuration keys
export type SystemConfigKey = keyof typeof SystemConfig;

// Helper function to get configuration values
export const getSystemConfig = <K extends SystemConfigKey>(key: K): typeof SystemConfig[K] => {
  return SystemConfig[key];
};

// Queue status interface
export interface QueueStatus {
  currentSize: number;
  maxSize: number;
  availableSlots: number;
  isAtCapacity: boolean;
}

// Queue management utility class
export class QueueManager {
  static validateQueueCapacity(currentSize: number, maxSize: number = SystemConfig.MAX_DISPLAY_QUEUE_SIZE): boolean {
    return currentSize < maxSize;
  }
  
  static getQueueStatus(currentSize: number, maxSize: number = SystemConfig.MAX_DISPLAY_QUEUE_SIZE): QueueStatus {
    return {
      currentSize,
      maxSize,
      availableSlots: maxSize - currentSize,
      isAtCapacity: currentSize >= maxSize
    };
  }
  
  static canAddToQueue(currentSize: number, maxSize: number = SystemConfig.MAX_DISPLAY_QUEUE_SIZE): boolean {
    return this.validateQueueCapacity(currentSize, maxSize);
  }
}