'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HealthHeader, { HealthTab } from '@/components/health/HealthHeader';
import OverviewTab from '@/components/health/OverviewTab';
import GymTab from '@/components/health/GymTab';
import WaterTab from '@/components/health/WaterTab';
import SleepTab from '@/components/health/SleepTab';
import NutritionTab from '@/components/health/NutritionTab';
import GoalsTab from '@/components/health/GoalsTab';
import ProgressTab from '@/components/health/ProgressTab';
import WorkoutTab from '@/components/health/WorkoutTab';
import ActiveWorkoutModal from '@/components/health/ActiveWorkoutModal';
import PlanEditorModal from '@/components/health/PlanEditorModal';
import DailyCheckInModal from '@/components/health/DailyCheckInModal';
import HealthProfileModal from '@/components/health/HealthProfileModal';

function HealthManagerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active tab state
  const tabParam = (searchParams.get('tab') as HealthTab) || 'overview';
  const [activeTab, setActiveTab] = useState<HealthTab>(
    ['overview', 'gym', 'workout', 'nutrition', 'water', 'sleep', 'goals', 'progress'].includes(tabParam)
      ? tabParam
      : 'overview'
  );

  // Sync tab with URL
  useEffect(() => {
    const currentParam = searchParams.get('tab') as HealthTab;
    if (currentParam && currentParam !== activeTab) {
      setActiveTab(currentParam);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (newTab: HealthTab) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.replace(`/health?${params.toString()}`);
  };

  // Main overview & sections data
  const [overviewData, setOverviewData] = useState<any>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  // Specific domain states
  const [plans, setPlans] = useState<any[]>([]);
  const [waterData, setWaterData] = useState<any>(null);
  const [sleepData, setSleepData] = useState<any>(null);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [goalsData, setGoalsData] = useState<any>(null);
  const [userMeta, setUserMeta] = useState<any>(null);

  // Modals state
  const [isActiveWorkoutOpen, setIsActiveWorkoutOpen] = useState(false);
  const [activeWorkoutConfig, setActiveWorkoutConfig] = useState<{
    dayName?: string;
    exercises?: any[];
    planId?: string;
    planName?: string;
  }>({});

  const [isPlanEditorOpen, setIsPlanEditorOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<any>(null);

  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Fetch Overview Data
  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setOverviewData(data);
      }
    } catch (err) {
      console.error('Failed to fetch health overview:', err);
    } finally {
      setIsLoadingOverview(false);
    }
  }, []);

  // Fetch Plans
  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/health/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    }
  }, []);

  // Fetch Water
  const fetchWater = useCallback(async () => {
    try {
      const res = await fetch('/api/health/water');
      if (res.ok) {
        const data = await res.json();
        setWaterData(data);
      }
    } catch (err) {
      console.error('Failed to fetch water:', err);
    }
  }, []);

  // Fetch Sleep
  const fetchSleep = useCallback(async () => {
    try {
      const res = await fetch('/api/health/sleep');
      if (res.ok) {
        const data = await res.json();
        setSleepData(data);
      }
    } catch (err) {
      console.error('Failed to fetch sleep:', err);
    }
  }, []);

  // Fetch Nutrition
  const fetchNutrition = useCallback(async () => {
    try {
      const res = await fetch('/api/health/nutrition');
      if (res.ok) {
        const data = await res.json();
        setNutritionData(data);
      }
    } catch (err) {
      console.error('Failed to fetch nutrition:', err);
    }
  }, []);

  // Fetch Goals
  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/health/goals');
      if (res.ok) {
        const data = await res.json();
        setGoalsData(data);
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    }
  }, []);

  // Fetch Profile & Student Meta
  const fetchProfileMeta = useCallback(async () => {
    try {
      const res = await fetch('/api/health/profile');
      if (res.ok) {
        const data = await res.json();
        setUserMeta(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch profile meta:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchOverview();
    fetchPlans();
    fetchWater();
    fetchSleep();
    fetchNutrition();
    fetchGoals();
    fetchProfileMeta();
  }, [fetchOverview, fetchPlans, fetchWater, fetchSleep, fetchNutrition, fetchGoals, fetchProfileMeta]);

  // If user navigated directly to tab=workout, automatically launch workout modal
  useEffect(() => {
    if (tabParam === 'workout') {
      const todayDay = overviewData?.workout?.todayDay;
      const activePlan = overviewData?.workout?.activePlan;
      setActiveWorkoutConfig({
        dayName: todayDay?.name || 'Workout Session',
        exercises: todayDay?.exercises || [],
        planId: activePlan?.id,
        planName: activePlan?.name,
      });
      setIsActiveWorkoutOpen(true);
    }
  }, [tabParam, overviewData]);

  // ── WORKOUT HANDLERS ──
  const handleStartWorkout = () => {
    const todayDay = overviewData?.workout?.todayDay;
    const activePlan = overviewData?.workout?.activePlan;
    setActiveWorkoutConfig({
      dayName: todayDay?.name || 'Workout Session',
      exercises: todayDay?.exercises || [],
      planId: activePlan?.id,
      planName: activePlan?.name,
    });
    setIsActiveWorkoutOpen(true);
  };

  const handleStartWorkoutWithDay = (
    dayName: string,
    exercises: any[],
    planId?: string,
    planName?: string
  ) => {
    setActiveWorkoutConfig({
      dayName,
      exercises,
      planId,
      planName,
    });
    setIsActiveWorkoutOpen(true);
  };

  const handleFinishWorkout = async (sessionData: any) => {
    const res = await fetch('/api/health/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData),
    });

    if (res.ok) {
      fetchOverview();
      fetchPlans();
    }
  };

  // ── PLAN HANDLERS ──
  const handleSavePlan = async (planData: any) => {
    const method = planData.id ? 'PUT' : 'POST';
    const url = planData.id ? `/api/health/plans/${planData.id}` : '/api/health/plans';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData),
    });

    if (res.ok) {
      fetchPlans();
      fetchOverview();
    }
  };

  // ── WATER HANDLERS ──
  const handleQuickAddWater = async (amountMl: number) => {
    const res = await fetch('/api/health/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountMl }),
    });

    if (res.ok) {
      fetchWater();
      fetchOverview();
    }
  };

  const handleDeleteWaterLog = async (id: string) => {
    const res = await fetch(`/api/health/water?id=${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchWater();
      fetchOverview();
    }
  };

  // ── SLEEP HANDLERS ──
  const handleLogSleep = async (logData: any) => {
    const res = await fetch('/api/health/sleep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });

    if (res.ok) {
      fetchSleep();
      fetchOverview();
    }
  };

  const handleDeleteSleep = async (id: string) => {
    const res = await fetch(`/api/health/sleep?id=${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchSleep();
      fetchOverview();
    }
  };

  // ── NUTRITION HANDLERS ──
  const handleLogMeal = async (mealData: any) => {
    const res = await fetch('/api/health/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mealData),
    });

    if (res.ok) {
      fetchNutrition();
      fetchOverview();
    }
  };

  const handleDeleteMeal = async (id: string) => {
    const res = await fetch(`/api/health/nutrition?id=${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchNutrition();
      fetchOverview();
    }
  };

  // ── GOALS HANDLERS ──
  const handleCreateGoal = async (goalData: any) => {
    const res = await fetch('/api/health/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalData),
    });

    if (res.ok) {
      fetchGoals();
      fetchOverview();
    }
  };

  const handleUpdateGoalProgress = async (
    id: string,
    currentProgress: number,
    isCompleted?: boolean
  ) => {
    const res = await fetch('/api/health/goals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, currentProgress, isCompleted }),
    });

    if (res.ok) {
      fetchGoals();
      fetchOverview();
    }
  };

  const handleDeleteGoal = async (id: string) => {
    const res = await fetch(`/api/health/goals?id=${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchGoals();
      fetchOverview();
    }
  };

  // ── DAILY CHECK-IN HANDLERS ──
  const handleSubmitCheckIn = async (checkInData: any) => {
    const res = await fetch('/api/health/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkInData),
    });

    if (res.ok) {
      fetchOverview();
    }
  };

  // ── PROFILE PREFERENCES HANDLERS ──
  const handleSaveProfile = async (profileData: any) => {
    const res = await fetch('/api/health/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });

    if (res.ok) {
      fetchOverview();
      fetchWater();
      fetchSleep();
      fetchNutrition();
    }
  };

  const activePlan = plans.find((p) => p.isActive) || plans[0] || null;

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Health Navigation & Top Ribbon */}
      <HealthHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenCheckIn={() => setIsCheckInOpen(true)}
        onOpenSettings={() => setIsProfileModalOpen(true)}
        hasCheckInToday={!!overviewData?.checkIn}
      />

      {/* ── TAB CONTENT RENDERER ── */}
      {activeTab === 'overview' && (
        <OverviewTab
          data={overviewData}
          isLoading={isLoadingOverview}
          onNavigateTab={handleTabChange}
          onStartWorkout={handleStartWorkout}
          onQuickAddWater={handleQuickAddWater}
          onOpenWaterModal={() => handleTabChange('water')}
          onOpenSleepModal={() => handleTabChange('sleep')}
          onOpenMealModal={() => handleTabChange('nutrition')}
          onOpenGoalModal={() => handleTabChange('goals')}
          onOpenCheckIn={() => setIsCheckInOpen(true)}
        />
      )}

      {activeTab === 'gym' && (
        <GymTab
          plans={plans}
          activePlan={activePlan}
          onOpenCreatePlan={() => {
            setPlanToEdit(null);
            setIsPlanEditorOpen(true);
          }}
          onOpenEditPlan={(p) => {
            setPlanToEdit(p);
            setIsPlanEditorOpen(true);
          }}
          onStartWorkoutWithDay={handleStartWorkoutWithDay}
          onRefreshData={() => {
            fetchPlans();
            fetchOverview();
          }}
        />
      )}

      {activeTab === 'workout' && (
        <WorkoutTab
          plans={plans}
          activePlan={activePlan}
          onStartWorkout={handleStartWorkout}
          onStartWorkoutWithDay={handleStartWorkoutWithDay}
          onOpenCreatePlan={() => {
            setPlanToEdit(null);
            setIsPlanEditorOpen(true);
          }}
          onNavigateTab={handleTabChange}
        />
      )}

      {activeTab === 'water' && (
        <WaterTab
          waterData={waterData || overviewData?.water}
          onQuickAdd={handleQuickAddWater}
          onDeleteLog={handleDeleteWaterLog}
          onRefresh={fetchWater}
        />
      )}

      {activeTab === 'sleep' && (
        <SleepTab
          sleepData={sleepData}
          onLogSleep={handleLogSleep}
          onDeleteSleep={handleDeleteSleep}
          onRefresh={fetchSleep}
        />
      )}

      {activeTab === 'nutrition' && (
        <NutritionTab
          nutritionData={nutritionData || overviewData?.nutrition}
          onLogMeal={handleLogMeal}
          onDeleteMeal={handleDeleteMeal}
          onRefresh={fetchNutrition}
        />
      )}

      {activeTab === 'goals' && (
        <GoalsTab
          goalsData={goalsData || overviewData?.goals}
          onCreateGoal={handleCreateGoal}
          onUpdateGoalProgress={handleUpdateGoalProgress}
          onDeleteGoal={handleDeleteGoal}
          onRefresh={fetchGoals}
        />
      )}

      {activeTab === 'progress' && (
        <ProgressTab onNavigateTab={handleTabChange} />
      )}

      {/* ── MODALS ── */}
      {isActiveWorkoutOpen && (
        <ActiveWorkoutModal
          initialDayName={activeWorkoutConfig.dayName}
          initialExercises={activeWorkoutConfig.exercises}
          planId={activeWorkoutConfig.planId}
          planName={activeWorkoutConfig.planName}
          onClose={() => setIsActiveWorkoutOpen(false)}
          onFinishWorkout={handleFinishWorkout}
        />
      )}

      {isPlanEditorOpen && (
        <PlanEditorModal
          planToEdit={planToEdit}
          onClose={() => setIsPlanEditorOpen(false)}
          onSavePlan={handleSavePlan}
        />
      )}

      {isCheckInOpen && (
        <DailyCheckInModal
          initialCheckIn={overviewData?.checkIn}
          currentWaterMl={overviewData?.water?.currentMl}
          isWorkoutCompletedToday={overviewData?.workout?.isCompletedToday}
          onClose={() => setIsCheckInOpen(false)}
          onSubmitCheckIn={handleSubmitCheckIn}
        />
      )}

      {isProfileModalOpen && (
        <HealthProfileModal
          profile={overviewData?.profile}
          userMeta={userMeta}
          onClose={() => setIsProfileModalOpen(false)}
          onSaveProfile={handleSaveProfile}
        />
      )}
    </div>
  );
}

export default function HealthPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-on-surface-variant font-mono text-sm flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-[20px] text-primary">
            progress_activity
          </span>
          <span>Loading Nivora Health Manager...</span>
        </div>
      }
    >
      <HealthManagerContent />
    </Suspense>
  );
}
