'use client';

import React, { useState } from 'react';

interface NutritionTabProps {
  nutritionData: any;
  onLogMeal: (mealData: any) => Promise<void>;
  onDeleteMeal: (id: string) => Promise<void>;
  onRefresh: () => void;
}

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function NutritionTab({
  nutritionData,
  onLogMeal,
  onDeleteMeal,
  onRefresh,
}: NutritionTabProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [selectedType, setSelectedType] = useState('Lunch');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [proteinGrams, setProteinGrams] = useState('');
  const [carbsGrams, setCarbsGrams] = useState('');
  const [fatGrams, setFatGrams] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totals = nutritionData?.totals || { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0, mealsCount: 0 };
  const calorieGoal = nutritionData?.calorieGoal || 2200;
  const grouped = nutritionData?.grouped || { Breakfast: [], Lunch: [], Dinner: [], Snack: [] };

  const handleOpenWithType = (type: string) => {
    setSelectedType(type);
    setIsLogging(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onLogMeal({
        mealType: selectedType,
        name: name.trim(),
        calories: calories ? parseInt(calories) : undefined,
        proteinGrams: proteinGrams ? parseFloat(proteinGrams) : undefined,
        carbsGrams: carbsGrams ? parseFloat(carbsGrams) : undefined,
        fatGrams: fatGrams ? parseFloat(fatGrams) : undefined,
        notes: notes.trim() || undefined,
      });
      setIsLogging(false);
      setName('');
      setCalories('');
      setProteinGrams('');
      setCarbsGrams('');
      setFatGrams('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── TOP NUTRITION SUMMARY BENTO ── */}
      <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-label-tag text-label-tag uppercase tracking-wider text-primary font-semibold">
              Daily Fuel &amp; Nutrition
            </span>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface">
              Today&apos;s Nutrient Overview
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsLogging(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-button-text text-xs hover:bg-primary-fixed transition-all font-bold shadow-sm self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Log Meal</span>
          </button>
        </div>

        {/* Macros & Calorie Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20">
            <span className="text-[11px] font-label-tag text-on-surface-variant uppercase font-semibold">
              Energy
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-bold text-primary">
                {totals.calories}
              </span>
              <span className="text-xs text-on-surface-variant font-mono">/ {calorieGoal} kcal</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((totals.calories / calorieGoal) * 100))}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20">
            <span className="text-[11px] font-label-tag text-on-surface-variant uppercase font-semibold">
              Protein
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-bold text-on-surface">
                {totals.proteinGrams}g
              </span>
            </div>
            <span className="text-[10px] text-on-surface-variant mt-1 block">Muscle repair &amp; recovery</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20">
            <span className="text-[11px] font-label-tag text-on-surface-variant uppercase font-semibold">
              Carbohydrates
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-bold text-on-surface">
                {totals.carbsGrams}g
              </span>
            </div>
            <span className="text-[10px] text-on-surface-variant mt-1 block">Brain &amp; workout energy</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20">
            <span className="text-[11px] font-label-tag text-on-surface-variant uppercase font-semibold">
              Healthy Fats
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-bold text-on-surface">
                {totals.fatGrams}g
              </span>
            </div>
            <span className="text-[10px] text-on-surface-variant mt-1 block">Hormone &amp; joint support</span>
          </div>
        </div>

        {/* General Wellness Disclaimer (No Medical Claims) */}
        <div className="p-3 rounded-xl bg-surface-container/40 border border-outline-variant/20 flex items-center gap-2 text-[11px] text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-secondary shrink-0">
            info
          </span>
          <span>
            <strong>General Wellness Notice:</strong> Tracking meals provides general nutritional awareness. Nivora does not provide medical diagnoses or prescribed dietary regimens.
          </span>
        </div>
      </div>

      {/* ── MEALS GROUPED BY CATEGORY ── */}
      <div className="space-y-4">
        {MEAL_TYPES.map((type) => {
          const meals = grouped[type] || [];
          return (
            <div
              key={type}
              className="p-5 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    {type === 'Breakfast'
                      ? 'bakery_dining'
                      : type === 'Lunch'
                      ? 'lunch_dining'
                      : type === 'Dinner'
                      ? 'dinner_dining'
                      : 'nutrition'}
                  </span>
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface">{type}</h4>
                  <span className="px-2 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-mono text-[10px]">
                    {meals.length} {meals.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenWithType(type)}
                  className="flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                  <span>Add {type}</span>
                </button>
              </div>

              {meals.length > 0 ? (
                <div className="space-y-2">
                  {meals.map((meal: any) => (
                    <div
                      key={meal.id}
                      className="p-3 rounded-2xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors"
                    >
                      <div>
                        <div className="font-headline-sm text-xs font-bold text-on-surface">
                          {meal.name}
                        </div>
                        {meal.notes && (
                          <p className="text-[11px] text-on-surface-variant mt-0.5 italic">
                            &ldquo;{meal.notes}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                          {meal.calories && (
                            <span className="font-bold text-primary">{meal.calories} kcal</span>
                          )}
                          {meal.proteinGrams && <span>{meal.proteinGrams}g P</span>}
                          {meal.carbsGrams && <span>{meal.carbsGrams}g C</span>}
                          {meal.fatGrams && <span>{meal.fatGrams}g F</span>}
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteMeal(meal.id)}
                          className="p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                          title="Delete meal"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant py-2">
                  No {type.toLowerCase()} logged yet.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── LOG MEAL MODAL ── */}
      {isLogging && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsLogging(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">restaurant</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Log Meal / Food Item
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLogging(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
                  Meal Category
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {MEAL_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedType(t)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedType === t
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
                  Meal / Food Description
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Oatmeal with peanut butter & banana"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase mb-1">
                    Calories (kcal) - Optional
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="e.g. 450"
                    className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase mb-1">
                    Protein (g) - Optional
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={proteinGrams}
                    onChange={(e) => setProteinGrams(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase mb-1">
                    Carbs (g) - Optional
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={carbsGrams}
                    onChange={(e) => setCarbsGrams(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase mb-1">
                    Fat (g) - Optional
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={fatGrams}
                    onChange={(e) => setFatGrams(e.target.value)}
                    placeholder="e.g. 12"
                    className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Campus cafeteria lunch"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsLogging(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs hover:bg-primary-fixed transition-all font-bold disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? 'Logging...' : 'Save Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
