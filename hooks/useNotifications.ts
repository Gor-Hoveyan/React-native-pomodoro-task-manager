import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/usePomodoroStore';

// Note: Sound integration is currently disabled to prevent bundling errors 
// until assets/sounds/success.mp3 is provided by the user.

export const useNotifications = () => {
  const { soundEnabled, hapticsEnabled } = useAppStore();

  const playSuccessSound = async () => {
    if (!soundEnabled) return;
    console.log('Sound effect requested: success');
    // To enable sounds:
    // 1. Add your sound file to assets/sounds/success.mp3
    // 2. Uncomment the expo-av code below
    /*
    try {
      const { Audio } = require('expo-av');
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/success.mp3')
      );
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
    */
  };

  const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') => {
    if (!hapticsEnabled) return;
    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
       console.log('Error triggering haptics:', error);
    }
  };

  return { playSuccessSound, triggerHaptic };
};
