import React, { useState, useEffect } from 'react';
import { TabType, SensorData, TimelineSession, Exercise } from './types';
import { initialSensorData, initialTimelineSessions, initialExercises } from './data';
import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { TimelineScreen } from './components/TimelineScreen';
import { ExercisesScreen } from './components/ExercisesScreen';
import { WellnessScreen } from './components/WellnessScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { Spine3DScreen } from './components/Spine3DScreen';
import { DebugPanelScreen } from './components/DebugPanelScreen';
import { CalibrationModal } from './components/CalibrationModal';
import { HumanTestScreen } from './components/HumanTestScreen';
import { AIAnalystScreen } from './components/AIAnalystScreen';
import { VoiceAssistantFAB } from './components/VoiceAssistant';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Persistent State
  const [sensorData, setSensorData] = useState<SensorData>(() => {
    const saved = localStorage.getItem('rizer_sensor_data');
    return saved ? JSON.parse(saved) : initialSensorData;
  });

  const [timelineSessions, setTimelineSessions] = useState<TimelineSession[]>(() => {
    const saved = localStorage.getItem('rizer_sessions');
    return saved ? JSON.parse(saved) : initialTimelineSessions;
  });

  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem('rizer_exercises');
    return saved ? JSON.parse(saved) : initialExercises;
  });

  useEffect(() => {
    localStorage.setItem('rizer_sensor_data', JSON.stringify(sensorData));
  }, [sensorData]);

  useEffect(() => {
    localStorage.setItem('rizer_sessions', JSON.stringify(timelineSessions));
  }, [timelineSessions]);

  useEffect(() => {
    const handleSessionsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        handleAddSession(customEvent.detail);
      }
    };
    window.addEventListener('rizer_sessions_updated', handleSessionsUpdated);
    return () => window.removeEventListener('rizer_sessions_updated', handleSessionsUpdated);
  }, []);

  useEffect(() => {
    localStorage.setItem('rizer_exercises', JSON.stringify(exercises));
  }, [exercises]);

  const handleUpdateSensorData = (updated: Partial<SensorData>) => {
    setSensorData((prev) => ({ ...prev, ...updated }));
  };

  const handleAddSession = (newSession: TimelineSession) => {
    setTimelineSessions((prev) => [newSession, ...prev]);
  };

  const handleCompleteExercise = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, completedCount: ex.completedCount + 1 }
          : ex
      )
    );
    setSensorData((prev) => ({
      ...prev,
      postureCoins: prev.postureCoins + 15,
    }));
  };

  const getPageTitle = (): string => {
    switch (activeTab) {
      case 'home':
        return 'Rizer';
      case 'today':
        return 'Today';
      case 'exercises':
        return 'Exercises';
      case 'wellness':
        return 'Wellness';
      case 'settings':
        return 'Settings';
      case 'spine3d':
        return '3D Spine View';
      case 'debug':
        return 'Debug Panel';
      case 'human_test':
        return 'Human Test';
      case 'ai-analyst':
        return 'Vision AI';
      default:
        return 'Rizer';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-light)] font-sans flex flex-col selection:bg-[var(--accent-cyan)] selection:text-black">
      {/* Hide default top header on Spine3D and Debug screens to allow full immersive experience */}
      {activeTab !== 'spine3d' && activeTab !== 'debug' && activeTab !== 'ai-analyst' && (
        <TopHeader
          title={getPageTitle()}
          activeTab={activeTab}
          onNavigate={(tab) => setActiveTab(tab)}
          onNotificationClick={() => setShowNotifications(true)}
        />
      )}

      {/* Main Tab Content Routing */}
      <div className="flex-1">
        {activeTab === 'home' && (
          <HomeScreen
            sensorData={sensorData}
            onUpdateSensorData={handleUpdateSensorData}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'today' && (
          <TimelineScreen
            sessions={timelineSessions}
            onAddSession={handleAddSession}
          />
        )}

        {activeTab === 'exercises' && (
          <ExercisesScreen
            exercises={exercises}
            onCompleteExercise={handleCompleteExercise}
          />
        )}

        {activeTab === 'wellness' && (
          <WellnessScreen
            sensorData={sensorData}
            onUpdateSensorData={handleUpdateSensorData}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            sensorData={sensorData}
            onUpdateSensorData={handleUpdateSensorData}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenCalibration={() => setIsCalibrating(true)}
          />
        )}

        {activeTab === 'spine3d' && (
          <Spine3DScreen
            sensorData={sensorData}
            onNavigate={(tab) => setActiveTab(tab)}
            onUpdateSensorData={handleUpdateSensorData}
          />
        )}

        {activeTab === 'debug' && (
          <DebugPanelScreen
            sensorData={sensorData}
            onUpdateSensorData={handleUpdateSensorData}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'human_test' && (
          <HumanTestScreen
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'ai-analyst' && (
          <AIAnalystScreen 
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
      </div>

      {/* Global Voice Assistant Floating Button */}
      {activeTab !== 'ai-analyst' && activeTab !== 'spine3d' && (
        <VoiceAssistantFAB />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs">
          <div className="bg-[#f8faf6] w-full max-w-md rounded-t-3xl p-6 space-y-4 shadow-2xl border-t border-[#bfc9c1]/30">
            <div className="flex justify-between items-center border-b border-[#bfc9c1]/20 pb-3">
              <div className="flex items-center gap-2 text-[#0f5238]">
                <span className="material-symbols-outlined text-[24px]">notifications</span>
                <h3 className="font-bold text-lg">Notifications</h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="w-8 h-8 rounded-full bg-[#eceeea] text-[#404943] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-white p-3.5 rounded-xl border border-[#bfc9c1]/20 shadow-xs flex items-start gap-3">
                <span className="material-symbols-outlined text-[#0f5238] text-[20px] mt-0.5">
                  emoji_events
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#191c1a]">12-Day Streak Achieved!</h4>
                  <p className="text-[11px] text-[#404943] mt-0.5">
                    You've maintained posture goals for 12 straight days. Keep it up!
                  </p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#bfc9c1]/20 shadow-xs flex items-start gap-3">
                <span className="material-symbols-outlined text-[#775b06] text-[20px] mt-0.5">
                  battery_charging_80
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#191c1a]">Rizer Device Battery</h4>
                  <p className="text-[11px] text-[#404943] mt-0.5">
                    Battery at 85%. Bluetooth BLE connection stable.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowNotifications(false)}
              className="w-full h-12 bg-[#0f5238] text-white font-bold rounded-xl mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Global Calibration Modal */}
      <CalibrationModal
        isOpen={isCalibrating}
        onClose={() => setIsCalibrating(false)}
        onCalibrateComplete={handleUpdateSensorData}
      />
    </div>
  );
}
