import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

type Food = {
  id: number;
  name: string;
  detail: string;
  calories: number;
  protein: number;
  icon: string;
  category: string;
};

type Meal = Food & { meal: string; time: string; servings: number; portionUnit: string };
type Profile = { displayName: string; gender: string; age: string; weight: string; weightUnit: string; height: string; heightUnit: string; goal: string };

const defaultProfile: Profile = { displayName: 'Your Name', gender: '', age: '', weight: '', weightUnit: 'kg', height: '', heightUnit: 'cm', goal: '' };
const storageKey = 'homepal-local-state-v2';

const foods: Food[] = [
  { id: 1, name: 'Masala dosa', detail: '1 medium, South Indian', calories: 312, protein: 7, icon: 'MD', category: 'Breakfast' },
  { id: 2, name: 'Dal tadka', detail: '1 bowl, homemade', calories: 188, protein: 10, icon: 'DT', category: 'Main meal' },
  { id: 3, name: 'Paneer tikka', detail: '6 pieces, grilled', calories: 265, protein: 18, icon: 'PT', category: 'High protein' },
  { id: 4, name: 'Roti', detail: '1 medium, whole wheat', calories: 104, protein: 3, icon: 'RT', category: 'Main meal' },
  { id: 5, name: 'Chole rice', detail: '1 serving', calories: 420, protein: 14, icon: 'CR', category: 'Main meal' },
  { id: 6, name: 'Ghee', detail: '1 teaspoon', calories: 45, protein: 0, icon: 'GH', category: 'Cooking' },
  { id: 7, name: 'Idli sambar', detail: '2 idli with 1 bowl sambar', calories: 240, protein: 9, icon: 'IS', category: 'Breakfast' },
  { id: 8, name: 'Rajma chawal', detail: '1 bowl, homemade', calories: 365, protein: 13, icon: 'RC', category: 'Main meal' },
  { id: 9, name: 'Chicken curry', detail: '1 bowl, homemade', calories: 290, protein: 25, icon: 'CC', category: 'High protein' },
  { id: 10, name: 'Curd', detail: '1 cup, plain', calories: 98, protein: 5, icon: 'CD', category: 'Snack' },
  { id: 11, name: 'Banana', detail: '1 medium', calories: 105, protein: 1, icon: 'BN', category: 'Fruit' },
  { id: 12, name: 'Poha', detail: '1 bowl with vegetables', calories: 250, protein: 6, icon: 'PH', category: 'Breakfast' },
  { id: 13, name: 'Chai with milk', detail: '1 cup, lightly sweetened', calories: 90, protein: 3, icon: 'CH', category: 'Drink' },
  { id: 14, name: 'Almonds', detail: '10 pieces', calories: 70, protein: 3, icon: 'AL', category: 'Snack' },
];

const initialMeals: Meal[] = [
  { ...foods[0], meal: 'Breakfast', time: '8:30 AM', servings: 1, portionUnit: 'serving' },
  { ...foods[1], meal: 'Lunch', time: '1:10 PM', servings: 1, portionUnit: 'serving' },
];

function getSavedState() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(window.localStorage.getItem(storageKey) || 'null'); } catch { return null; }
}

export default function App() {
  const { width } = useWindowDimensions();
  const saved = getSavedState();
  const [onboardingStep, setOnboardingStep] = useState(saved?.onboardingComplete ? 7 : 0);
  const [profile, setProfile] = useState<Profile>(saved?.profile || defaultProfile);
  const [dailyTarget, setDailyTarget] = useState(saved?.dailyTarget || 2000);
  const [activeTab, setActiveTab] = useState('Today');
  const [query, setQuery] = useState('');
  const [meals, setMeals] = useState<Meal[]>(saved?.meals || initialMeals);
  const [waterMl, setWaterMl] = useState(saved?.waterMl || 0);
  const [steps, setSteps] = useState(saved?.steps || 0);
  const [exerciseMinutes, setExerciseMinutes] = useState(saved?.exerciseMinutes || 0);
  const [sleepHours, setSleepHours] = useState(saved?.sleepHours || 0);
  const [mood, setMood] = useState(saved?.mood || '');
  const [notice, setNotice] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('Snack');
  const [servings, setServings] = useState('');
  const [portionUnit, setPortionUnit] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [targetDraft, setTargetDraft] = useState(String(saved?.dailyTarget || 2000));
  const [aiFood, setAiFood] = useState<Food | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const isCompact = width < 760;
  const calories = meals.reduce((total, meal) => total + meal.calories, 0);
  const protein = meals.reduce((total, meal) => total + meal.protein, 0);
  const proteinTarget = Math.max(50, Math.round(dailyTarget * 0.045));
  const weightKg = profile.weightUnit === 'kg' ? Number(profile.weight) : Number(profile.weight) * 0.453592;
  const waterTarget = Math.max(1500, Math.round(((weightKg || 60) * 35) / 250) * 250);
  const filteredFoods = useMemo(
    () => foods.filter((food) => `${food.name} ${food.detail}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  useEffect(() => {
    if (onboardingStep === 7 && typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify({ onboardingComplete: true, profile, dailyTarget, meals, waterMl, steps, exerciseMinutes, sleepHours, mood }));
    }
  }, [dailyTarget, meals, onboardingStep, profile, waterMl, steps, exerciseMinutes, sleepHours, mood]);

  if (onboardingStep < 7) {
    return <Onboarding width={width} step={onboardingStep} profile={profile} setProfile={setProfile} onNext={() => setOnboardingStep((step) => step + 1)} onComplete={(target) => { setDailyTarget(target); setTargetDraft(String(target)); setOnboardingStep(7); }} />;
  }

  function addMeal(food: Food, mealType = selectedMealType) {
    const count = Number(servings);
    if (!Number.isFinite(count) || count <= 0 || !portionUnit) {
      setNotice('Enter an amount and choose its portion unit before logging this food');
      return;
    }
    setMeals((current) => [...current, { ...food, calories: Math.round(food.calories * count), protein: Math.round(food.protein * count * 10) / 10, meal: mealType, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), servings: count, portionUnit }]);
    setNotice(`${food.name} added to ${mealType.toLowerCase()}`);
    setQuery('');
    setServings('');
    setPortionUnit('');
    setSelectedFood(null);
  }

  async function askSarvam() {
    if (!query.trim()) return;
    setAiLoading(true);
    setAiError('');
    setAiFood(null);
    try {
      const response = await fetch('http://localhost:8080/api/v1/ai/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Sarvam request failed');
      setAiFood(result);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Sarvam could not identify that food.');
    } finally {
      setAiLoading(false);
    }
  }

  function removeMeal(index: number) {
    setMeals((current) => current.filter((_, mealIndex) => mealIndex !== index));
    setNotice('Meal removed from today');
  }

  function saveTarget() {
    const nextTarget = Math.max(1200, Math.min(6000, Number(targetDraft) || dailyTarget));
    setDailyTarget(nextTarget);
    setTargetDraft(String(nextTarget));
    setNotice('Daily calorie target updated');
  }

  function resetLocalData() {
    if (typeof window !== 'undefined') window.localStorage.removeItem(storageKey);
    setMeals(initialMeals);
    setWaterMl(0);
    setSteps(0);
    setExerciseMinutes(0);
    setSleepHours(0);
    setMood('');
    setProfile(defaultProfile);
    setDailyTarget(2000);
    setTargetDraft('2000');
    setOnboardingStep(0);
    setNotice('Local data reset. Your next session will start with onboarding.');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <View style={styles.sidebar}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Text style={styles.brandMarkText}>H</Text></View>
            <Text style={styles.brand}>HomePal</Text>
          </View>
          <Text style={styles.brandCaption}>Your everyday food companion</Text>
          <View style={styles.navList}>
            {['Today', 'Food library', 'Progress', 'Profile'].map((tab) => (
              <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[styles.navItem, activeTab === tab && styles.navItemActive]}>
                <Text style={[styles.navIcon, activeTab === tab && styles.navTextActive]}>{tab === 'Today' ? 'O' : tab === 'Food library' ? 'F' : tab === 'Progress' ? 'P' : 'A'}</Text>
                <Text style={[styles.navText, activeTab === tab && styles.navTextActive]}>{tab}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.sidebarBottom}>
            <Pressable onPress={() => setActiveTab('Settings')} style={[styles.navItem, activeTab === 'Settings' && styles.navItemActive]}>
              <Text style={[styles.navIcon, activeTab === 'Settings' && styles.navTextActive]}>S</Text>
              <Text style={[styles.navText, activeTab === 'Settings' && styles.navTextActive]}>Settings</Text>
            </Pressable>
              <View style={styles.userRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{profile.displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</Text></View>
              <View><Text style={styles.userName}>{profile.displayName}</Text><Text style={styles.userEmail}>Local account</Text></View>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.header, isCompact && styles.headerCompact]}>
            <View><Text style={styles.eyebrow}>{new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</Text><Text style={styles.pageTitle}>{activeTab === 'Today' ? `Good morning, ${profile.displayName.split(' ')[0]}` : activeTab}</Text></View>
            <Pressable style={styles.primaryButton} onPress={() => setActiveTab('Today')}><Text style={styles.primaryButtonText}>+ Log food</Text></Pressable>
          </View>

          {activeTab === 'Settings' ? (
            <SettingsPanel targetDraft={targetDraft} setTargetDraft={setTargetDraft} saveTarget={saveTarget} resetLocalData={resetLocalData} />
          ) : activeTab === 'Profile' ? (
            <ProfilePanel profile={profile} setProfile={setProfile} dailyTarget={dailyTarget} setNotice={setNotice} />
          ) : activeTab === 'Progress' ? (
            <ProgressPanel calories={calories} dailyTarget={dailyTarget} protein={protein} proteinTarget={proteinTarget} waterMl={waterMl} waterTarget={waterTarget} steps={steps} exerciseMinutes={exerciseMinutes} sleepHours={sleepHours} />
          ) : activeTab === 'Food library' ? (
            <View style={styles.libraryPanel}><Text style={styles.sectionTitle}>Food library</Text><Text style={styles.sectionSubtitle}>{foods.length} common foods ready to log, plus AI lookup</Text><FoodControls selectedMealType={selectedMealType} setSelectedMealType={setSelectedMealType} servings={servings} setServings={setServings} portionUnit={portionUnit} setPortionUnit={setPortionUnit} /><FoodSearch query={query} setQuery={setQuery} filteredFoods={filteredFoods} selectedFood={selectedFood} selectFood={setSelectedFood} addMeal={addMeal} askSarvam={askSarvam} aiFood={aiFood} aiLoading={aiLoading} aiError={aiError} /></View>
          ) : (
            <>
              <View style={[styles.statsGrid, isCompact && styles.statsGridCompact]}>
                <View style={styles.statCard}><Text style={styles.statLabel}>CALORIES</Text><Text style={styles.statValue}>{calories}<Text style={styles.statUnit}> / {dailyTarget.toLocaleString()}</Text></Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min((calories / dailyTarget) * 100, 100)}%` }]} /></View><Text style={styles.statHint}>{Math.max(dailyTarget - calories, 0)} kcal remaining</Text></View>
                <View style={styles.statCard}><Text style={styles.statLabel}>PROTEIN</Text><Text style={styles.statValue}>{protein}<Text style={styles.statUnit}> g</Text></Text><Text style={styles.statHint}>Target {proteinTarget} g</Text></View>
                <View style={styles.statCard}><Text style={styles.statLabel}>STREAK</Text><Text style={styles.statValue}>4<Text style={styles.statUnit}> days</Text></Text><Text style={styles.statHint}>Best: 12 days</Text></View>
                <View style={styles.statCard}><Text style={styles.statLabel}>WATER</Text><Text style={styles.statValue}>{(waterMl / 1000).toFixed(1)}<Text style={styles.statUnit}> / {(waterTarget / 1000).toFixed(1)} L</Text></Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min((waterMl / waterTarget) * 100, 100)}%`, backgroundColor: '#5d9fa4' }]} /></View><Text style={styles.statHint}>{Math.max(waterTarget - waterMl, 0)} ml to go</Text></View>
              </View>

              <WellnessPanel waterMl={waterMl} waterTarget={waterTarget} setWaterMl={setWaterMl} steps={steps} setSteps={setSteps} exerciseMinutes={exerciseMinutes} setExerciseMinutes={setExerciseMinutes} sleepHours={sleepHours} setSleepHours={setSleepHours} mood={mood} setMood={setMood} />

              <View style={[styles.mainGrid, isCompact && styles.mainGridCompact]}>
                <View style={styles.logPanel}><View style={styles.panelHeader}><View><Text style={styles.sectionTitle}>Today's log</Text><Text style={styles.sectionSubtitle}>{meals.length} items logged</Text></View><Pressable onPress={() => setMeals([])}><Text style={styles.clearText}>Clear all</Text></Pressable></View>{notice ? <Text style={styles.notice}>{notice}</Text> : null}{meals.length === 0 ? <Text style={styles.emptyText}>Nothing logged yet. Search for a meal to get started.</Text> : meals.map((meal, index) => <View style={styles.mealRow} key={`${meal.id}-${index}`}><View style={styles.foodIcon}><Text style={styles.foodIconText}>{meal.icon}</Text></View><View style={styles.mealInfo}><Text style={styles.mealName}>{meal.name}</Text><Text style={styles.mealMeta}>{meal.meal}  ·  {meal.time}  ·  {meal.servings} {meal.portionUnit || 'serving'}</Text></View><Text style={styles.mealCalories}>{meal.calories} kcal</Text><Pressable onPress={() => removeMeal(index)}><Text style={styles.removeText}>x</Text></Pressable></View>)}</View>
                <View style={styles.searchPanel}><Text style={styles.sectionTitle}>Add a meal</Text><Text style={styles.sectionSubtitle}>Select a food, customise it, then log it</Text><FoodControls selectedMealType={selectedMealType} setSelectedMealType={setSelectedMealType} servings={servings} setServings={setServings} portionUnit={portionUnit} setPortionUnit={setPortionUnit} /><FoodSearch query={query} setQuery={setQuery} filteredFoods={filteredFoods.slice(0, 5)} selectedFood={selectedFood} selectFood={setSelectedFood} addMeal={addMeal} askSarvam={askSarvam} aiFood={aiFood} aiLoading={aiLoading} aiError={aiError} /></View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Onboarding({ width, step, profile, setProfile, onNext, onComplete }: { width: number; step: number; profile: Profile; setProfile: (profile: Profile) => void; onNext: () => void; onComplete: (target: number) => void }) {
  const compact = width < 640;
  const update = (field: keyof Profile, value: string) => setProfile({ ...profile, [field]: value });
  const age = Number(profile.age);
  const weightKg = profile.weightUnit === 'kg' ? Number(profile.weight) : Number(profile.weight) * 0.453592;
  const heightCm = profile.heightUnit === 'cm' ? Number(profile.height) : profile.heightUnit === 'ft' ? Number(profile.height) * 30.48 : Number(profile.height) * 2.54;
  const canContinue = step === 0 || step === 1 || step === 2 ? age > 0 || step !== 2 : step === 3 ? weightKg > 0 : step === 4 ? heightCm > 0 : Boolean(profile.goal);
  const goalLabels: Record<string, string> = { loss: 'Weight loss', recomposition: 'Recomposition', gain: 'Weight gain', muscle: 'Muscle gain', maintain: 'Maintain weight', balance: 'Balanced fit & health' };
  const estimatedCalories = Math.round(((profile.gender === 'female' ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161 : 10 * weightKg + 6.25 * heightCm - 5 * age + 5) * 1.35) + (profile.goal === 'loss' ? -350 : profile.goal === 'gain' || profile.goal === 'muscle' ? 300 : profile.goal === 'recomposition' ? 100 : 0));

  return <SafeAreaView style={styles.onboardingSafe}><StatusBar style="dark" /><ScrollView contentContainerStyle={[styles.onboarding, compact && styles.onboardingCompact]}>
    <View style={styles.onboardingTop}><View style={styles.brandRow}><View style={styles.brandMark}><Text style={styles.brandMarkText}>H</Text></View><Text style={styles.onboardingBrand}>HomePal</Text></View>{step > 0 ? <Text style={styles.stepText}>{Math.min(step, 5)} of 5</Text> : null}</View>
    {step === 0 && <View style={styles.welcomeBlock}><Text style={styles.welcomeKicker}>A calmer way to eat well</Text><Text style={styles.welcomeTitle}>Build a food routine that fits your life.</Text><Text style={styles.welcomeCopy}>HomePal helps you understand your meals, set a realistic target, and make progress without the guesswork.</Text><Pressable style={styles.startButton} onPress={onNext}><Text style={styles.startButtonText}>Start your profile  →</Text></Pressable><Text style={styles.privacyNote}>Takes less than a minute. You can update these details later.</Text></View>}
    {step === 1 && <StepFrame title="Let's get to know you" subtitle="This helps us make your plan more personal."><Text style={styles.fieldLabel}>How do you identify?</Text><View style={[styles.choiceGrid, compact && styles.choiceGridCompact]}>{[{ value: 'male', label: 'Male', visual: '♂' }, { value: 'female', label: 'Female', visual: '♀' }, { value: 'other', label: 'Other', visual: '◌' }].map((choice) => <Pressable key={choice.value} onPress={() => update('gender', choice.value)} style={[styles.visualChoice, profile.gender === choice.value && styles.visualChoiceSelected]}><Text style={styles.visualChoiceIcon}>{choice.visual}</Text><Text style={[styles.visualChoiceLabel, profile.gender === choice.value && styles.selectedText]}>{choice.label}</Text></Pressable>)}</View><ContinueButton disabled={!profile.gender} onPress={onNext} /></StepFrame>}
    {step === 2 && <StepFrame title="How old are you?" subtitle="Age helps us estimate your everyday energy needs."><Text style={styles.fieldLabel}>Your age</Text><TextInput autoFocus keyboardType="numeric" value={profile.age} onChangeText={(value) => update('age', value)} placeholder="e.g. 24" placeholderTextColor="#9aa9a2" style={styles.bigInput} /><Text style={styles.inputSuffix}>years old</Text><ContinueButton disabled={!age || age < 13 || age > 100} onPress={onNext} /></StepFrame>}
    {step === 3 && <StepFrame title="What is your weight?" subtitle="Choose the unit you use most comfortably."><UnitInput value={profile.weight} unit={profile.weightUnit} onValue={(value) => update('weight', value)} onUnit={(unit) => update('weightUnit', unit)} units={['kg', 'lb']} placeholder="e.g. 68" /><ContinueButton disabled={!weightKg || weightKg < 25 || weightKg > 300} onPress={onNext} /></StepFrame>}
    {step === 4 && <StepFrame title="How tall are you?" subtitle="We use this with your age and weight to estimate calories."><UnitInput value={profile.height} unit={profile.heightUnit} onValue={(value) => update('height', value)} onUnit={(unit) => update('heightUnit', unit)} units={['cm', 'ft', 'in']} placeholder="e.g. 172" /><ContinueButton disabled={!heightCm || heightCm < 100 || heightCm > 240} onPress={onNext} /></StepFrame>}
    {step === 5 && <StepFrame title="What are you working toward?" subtitle="You can change this any time as your routine evolves."><View style={styles.goalList}>{Object.entries(goalLabels).map(([value, label]) => <Pressable key={value} onPress={() => update('goal', value)} style={[styles.goalChoice, profile.goal === value && styles.goalChoiceSelected]}><View><Text style={[styles.goalTitle, profile.goal === value && styles.selectedText]}>{label}</Text><Text style={styles.goalDescription}>{value === 'loss' ? 'A gentle calorie deficit' : value === 'gain' || value === 'muscle' ? 'Fuel strength and growth' : value === 'maintain' ? 'Stay steady and consistent' : 'A flexible, balanced approach'}</Text></View><Text style={styles.goalArrow}>{profile.goal === value ? '✓' : '›'}</Text></Pressable>)}</View><ContinueButton disabled={!profile.goal} onPress={onNext} /></StepFrame>}
    {step === 6 && <View style={styles.resultBlock}><Text style={styles.welcomeKicker}>Your starting point</Text><Text style={styles.welcomeTitle}>A plan made for you.</Text><View style={styles.calorieResult}><Text style={styles.resultLabel}>RECOMMENDED DAILY TARGET</Text><Text style={styles.resultNumber}>{Math.max(1200, estimatedCalories).toLocaleString()}</Text><Text style={styles.resultUnit}>calories per day</Text></View><Text style={styles.resultExplanation}>Based on your details and your goal of {goalLabels[profile.goal].toLowerCase()}. This is a starting estimate, not a medical recommendation. Adjust it as you learn what works for you.</Text><Pressable style={styles.startButton} onPress={() => onComplete(Math.max(1200, estimatedCalories))}><Text style={styles.startButtonText}>Enter HomePal  →</Text></Pressable></View>}
  </ScrollView></SafeAreaView>;
}

function StepFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <View style={styles.stepFrame}><Text style={styles.stepTitle}>{title}</Text><Text style={styles.stepSubtitle}>{subtitle}</Text>{children}</View>;
}

function ContinueButton({ disabled, onPress }: { disabled: boolean; onPress: () => void }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.continueButton, disabled && styles.continueButtonDisabled]}><Text style={styles.continueButtonText}>Continue  →</Text></Pressable>;
}

function UnitInput({ value, unit, onValue, onUnit, units, placeholder }: { value: string; unit: string; onValue: (value: string) => void; onUnit: (unit: string) => void; units: string[]; placeholder: string }) {
  return <View><View style={styles.unitInputRow}><TextInput autoFocus keyboardType="numeric" value={value} onChangeText={onValue} placeholder={placeholder} placeholderTextColor="#9aa9a2" style={styles.unitTextInput} /><View style={styles.unitChoices}>{units.map((option) => <Pressable key={option} onPress={() => onUnit(option)} style={[styles.unitChoice, unit === option && styles.unitChoiceSelected]}><Text style={[styles.unitChoiceText, unit === option && styles.selectedText]}>{option}</Text></Pressable>)}</View></View><Text style={styles.unitHint}>You can switch units whenever you like.</Text></View>;
}

function FoodControls({ selectedMealType, setSelectedMealType, servings, setServings, portionUnit, setPortionUnit }: { selectedMealType: string; setSelectedMealType: (value: string) => void; servings: string; setServings: (value: string) => void; portionUnit: string; setPortionUnit: (value: string) => void }) {
  const [unitMenuOpen, setUnitMenuOpen] = useState(false);
  const portionUnits = ['g', 'oz', 'cup', 'ml', 'piece', 'serving'];
  return <View style={styles.foodControls}><View style={styles.mealTypeRow}>{['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => <Pressable key={type} onPress={() => setSelectedMealType(type)} style={[styles.mealTypeChoice, selectedMealType === type && styles.mealTypeSelected]}><Text style={[styles.mealTypeText, selectedMealType === type && styles.selectedText]}>{type}</Text></Pressable>)}</View><View style={styles.servingsRow}><Text style={styles.servingsLabel}>Portion size</Text><Pressable onPress={() => setServings(String(Math.max(0.25, (Number(servings) || 1) - 0.25)))} style={styles.stepperButton}><Text style={styles.stepperText}>-</Text></Pressable><TextInput placeholder="Amount" placeholderTextColor="#98a09b" value={servings} onChangeText={setServings} keyboardType="decimal-pad" style={styles.servingsInput} /><Pressable onPress={() => setServings(String((Number(servings) || 0) + 0.25))} style={styles.stepperButton}><Text style={styles.stepperText}>+</Text></Pressable><View style={styles.unitDropdown}><Pressable onPress={() => setUnitMenuOpen((open) => !open)} style={styles.unitDropdownButton}><Text style={[styles.unitDropdownText, !portionUnit && styles.unitDropdownPlaceholder]}>{portionUnit || 'Unit'}</Text><Text style={styles.unitDropdownArrow}>{unitMenuOpen ? '^' : 'v'}</Text></Pressable>{unitMenuOpen ? <View style={styles.unitDropdownMenu}>{portionUnits.map((unit) => <Pressable key={unit} onPress={() => { setPortionUnit(unit); setUnitMenuOpen(false); }} style={styles.unitDropdownOption}><Text style={styles.unitDropdownOptionText}>{unit}</Text></Pressable>)}</View> : null}</View></View></View>;
}

function SettingsPanel({ targetDraft, setTargetDraft, saveTarget, resetLocalData }: { targetDraft: string; setTargetDraft: (value: string) => void; saveTarget: () => void; resetLocalData: () => void }) {
  const [language, setLanguage] = useState('English');
  return <View style={styles.settingsPanel}><Text style={styles.sectionTitle}>Your preferences</Text><Text style={styles.sectionSubtitle}>These settings control your daily dashboard.</Text><Text style={styles.settingsLabel}>Daily calorie target</Text><View style={styles.inlineForm}><TextInput style={styles.targetInput} value={targetDraft} onChangeText={setTargetDraft} keyboardType="numeric" /><Text style={styles.inputUnit}>kcal</Text><Pressable style={styles.smallButton} onPress={saveTarget}><Text style={styles.smallButtonText}>Save</Text></Pressable></View><Text style={styles.settingsLabel}>Preferred language</Text><View style={styles.languageRow}>{['English', 'Hindi', 'Hinglish'].map((option) => <Pressable key={option} onPress={() => setLanguage(option)} style={[styles.languageChoice, language === option && styles.languageChoiceActive]}><Text style={language === option ? styles.selectedText : styles.languageText}>{option}</Text></Pressable>)}</View><Text style={styles.settingsLabel}>Data</Text><Pressable onPress={resetLocalData} style={styles.dangerButton}><Text style={styles.dangerText}>Reset local profile and meals</Text></Pressable><Text style={styles.helper}>Your profile, target, and meal log are saved in this browser only.</Text></View>;
}

function ProfilePanel({ profile, setProfile, dailyTarget, setNotice }: { profile: Profile; setProfile: (profile: Profile) => void; dailyTarget: number; setNotice: (value: string) => void }) {
  const update = (field: keyof Profile, value: string) => setProfile({ ...profile, [field]: value });
  return <View style={styles.settingsPanel}><Text style={styles.sectionTitle}>Your profile</Text><Text style={styles.sectionSubtitle}>Update your details whenever your routine changes.</Text><Text style={styles.settingsLabel}>Display name</Text><TextInput style={styles.targetInput} value={profile.displayName} onChangeText={(value) => update('displayName', value)} /><View style={styles.profileGrid}><View style={styles.profileField}><Text style={styles.settingsLabel}>Age</Text><TextInput style={styles.targetInput} value={profile.age} onChangeText={(value) => update('age', value)} keyboardType="numeric" /></View><View style={styles.profileField}><Text style={styles.settingsLabel}>Gender</Text><TextInput style={styles.targetInput} value={profile.gender} onChangeText={(value) => update('gender', value)} /></View></View><View style={styles.profileGrid}><View style={styles.profileField}><Text style={styles.settingsLabel}>Weight ({profile.weightUnit})</Text><TextInput style={styles.targetInput} value={profile.weight} onChangeText={(value) => update('weight', value)} keyboardType="decimal-pad" /></View><View style={styles.profileField}><Text style={styles.settingsLabel}>Height ({profile.heightUnit})</Text><TextInput style={styles.targetInput} value={profile.height} onChangeText={(value) => update('height', value)} keyboardType="decimal-pad" /></View></View><Text style={styles.settingsLabel}>Current goal</Text><TextInput style={styles.targetInput} value={profile.goal || 'Not set'} onChangeText={(value) => update('goal', value)} /><Text style={styles.helper}>Current daily target: {dailyTarget.toLocaleString()} kcal. Changes save automatically.</Text><Pressable style={styles.smallButton} onPress={() => setNotice('Profile updated')}><Text style={styles.smallButtonText}>Confirm profile</Text></Pressable></View>;
}

function WellnessPanel({ waterMl, waterTarget, setWaterMl, steps, setSteps, exerciseMinutes, setExerciseMinutes, sleepHours, setSleepHours, mood, setMood }: { waterMl: number; waterTarget: number; setWaterMl: (value: number) => void; steps: number; setSteps: (value: number) => void; exerciseMinutes: number; setExerciseMinutes: (value: number) => void; sleepHours: number; setSleepHours: (value: number) => void; mood: string; setMood: (value: string) => void }) {
  return <View style={styles.wellnessPanel}><View style={styles.panelHeader}><View><Text style={styles.sectionTitle}>Daily wellness</Text><Text style={styles.sectionSubtitle}>Small check-ins make your health picture more complete.</Text></View><Text style={styles.todayBadge}>TODAY</Text></View><View style={styles.wellnessGrid}><View style={styles.wellnessItem}><Text style={styles.wellnessIcon}>W</Text><View style={styles.wellnessCopy}><Text style={styles.wellnessTitle}>Water</Text><Text style={styles.wellnessValue}>{(waterMl / 1000).toFixed(1)} L of {(waterTarget / 1000).toFixed(1)} L</Text></View><View style={styles.quickActions}><Pressable onPress={() => setWaterMl(Math.min(waterTarget, waterMl + 250))} style={styles.quickButton}><Text style={styles.quickButtonText}>+250 ml</Text></Pressable><Pressable onPress={() => setWaterMl(Math.min(waterTarget, waterMl + 500))} style={styles.quickButton}><Text style={styles.quickButtonText}>+500 ml</Text></Pressable></View></View><View style={styles.wellnessItem}><Text style={styles.wellnessIcon}>S</Text><View style={styles.wellnessCopy}><Text style={styles.wellnessTitle}>Steps</Text><Text style={styles.wellnessValue}>{steps.toLocaleString()} steps</Text></View><View style={styles.quickActions}><Pressable onPress={() => setSteps(steps + 1000)} style={styles.quickButton}><Text style={styles.quickButtonText}>+1,000</Text></Pressable></View></View><View style={styles.wellnessItem}><Text style={styles.wellnessIcon}>E</Text><View style={styles.wellnessCopy}><Text style={styles.wellnessTitle}>Exercise</Text><Text style={styles.wellnessValue}>{exerciseMinutes} minutes</Text></View><View style={styles.quickActions}><Pressable onPress={() => setExerciseMinutes(exerciseMinutes + 10)} style={styles.quickButton}><Text style={styles.quickButtonText}>+10 min</Text></Pressable></View></View><View style={styles.wellnessItem}><Text style={styles.wellnessIcon}>Z</Text><View style={styles.wellnessCopy}><Text style={styles.wellnessTitle}>Sleep</Text><Text style={styles.wellnessValue}>{sleepHours ? `${sleepHours} hours` : 'Not logged'}</Text></View><TextInput value={sleepHours ? String(sleepHours) : ''} onChangeText={(value) => setSleepHours(Number(value) || 0)} keyboardType="decimal-pad" placeholder="Hours" placeholderTextColor="#98a09b" style={styles.wellnessInput} /></View></View><View style={styles.moodRow}><Text style={styles.moodLabel}>How are you feeling?</Text>{['Great', 'Good', 'Okay', 'Low'].map((option) => <Pressable key={option} onPress={() => setMood(option)} style={[styles.moodChoice, mood === option && styles.moodChoiceActive]}><Text style={[styles.moodChoiceText, mood === option && styles.selectedText]}>{option}</Text></Pressable>)}</View></View>;
}

function ProgressPanel({ calories, dailyTarget, protein, proteinTarget, waterMl, waterTarget, steps, exerciseMinutes, sleepHours }: { calories: number; dailyTarget: number; protein: number; proteinTarget: number; waterMl: number; waterTarget: number; steps: number; exerciseMinutes: number; sleepHours: number }) {
  const caloriePercent = Math.min((calories / dailyTarget) * 100, 100);
  const proteinPercent = Math.min((protein / proteinTarget) * 100, 100);
  const waterPercent = Math.min((waterMl / waterTarget) * 100, 100);
  return <View style={styles.progressPage}><View style={styles.progressHero}><View><Text style={styles.sectionTitle}>Your progress</Text><Text style={styles.sectionSubtitle}>A clear snapshot of today's habits.</Text></View><Text style={styles.progressHeroScore}>{Math.round((caloriePercent + proteinPercent + waterPercent) / 3)}%</Text></View><View style={styles.progressSummary}><View style={styles.progressSummaryItem}><Text style={styles.progressSummaryLabel}>CALORIES</Text><Text style={styles.progressSummaryValue}>{calories.toLocaleString()}</Text><Text style={styles.progressSummaryHint}>of {dailyTarget.toLocaleString()} kcal</Text></View><View style={styles.progressSummaryItem}><Text style={styles.progressSummaryLabel}>PROTEIN</Text><Text style={styles.progressSummaryValue}>{protein} g</Text><Text style={styles.progressSummaryHint}>of {proteinTarget} g target</Text></View><View style={styles.progressSummaryItem}><Text style={styles.progressSummaryLabel}>HYDRATION</Text><Text style={styles.progressSummaryValue}>{(waterMl / 1000).toFixed(1)} L</Text><Text style={styles.progressSummaryHint}>of {(waterTarget / 1000).toFixed(1)} L target</Text></View></View><View style={styles.progressBreakdown}><Text style={styles.sectionTitle}>Today's balance</Text><ProgressLine label="Calories" value={caloriePercent} color="#d8b84c" /><ProgressLine label="Protein" value={proteinPercent} color="#39785e" /><ProgressLine label="Water" value={waterPercent} color="#5d9fa4" /></View><View style={styles.insightPanel}><Text style={styles.insightLabel}>HEALTH SNAPSHOT</Text><Text style={styles.insightText}>{steps.toLocaleString()} steps, {exerciseMinutes} minutes of exercise, and {sleepHours || 'no'} hours of sleep logged today.</Text><Text style={styles.helper}>Keep the check-ins simple and consistent. Trends become more useful after a full week.</Text></View></View>;
}

function ProgressLine({ label, value, color }: { label: string; value: number; color: string }) {
  return <View style={styles.progressLine}><View style={styles.progressLineHeader}><Text style={styles.macroLabel}>{label}</Text><Text style={styles.macroValue}>{Math.round(value)}%</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${value}%`, backgroundColor: color }]} /></View></View>;
}

function FoodSearch({ query, setQuery, filteredFoods, selectedFood, selectFood, addMeal, askSarvam, aiFood, aiLoading, aiError }: { query: string; setQuery: (value: string) => void; filteredFoods: Food[]; selectedFood: Food | null; selectFood: (food: Food | null) => void; addMeal: (food: Food) => void; askSarvam: () => void; aiFood: Food | null; aiLoading: boolean; aiError: string }) {
  return <><View style={styles.searchRow}><TextInput value={query} onChangeText={setQuery} placeholder="Search dosa, dal, ghee..." placeholderTextColor="#98a09b" style={styles.searchInput} /><Pressable disabled={!query.trim() || aiLoading} onPress={askSarvam} style={[styles.aiButton, (!query.trim() || aiLoading) && styles.aiButtonDisabled]}><Text style={styles.aiButtonText}>{aiLoading ? 'Asking...' : 'Ask Sarvam'}</Text></Pressable></View>{aiError ? <Text style={styles.aiError}>{aiError}</Text> : null}{aiFood ? <Pressable onPress={() => selectFood(aiFood)} style={[styles.aiResult, selectedFood?.id === aiFood.id && styles.resultRowSelected]}><View style={styles.resultIcon}><Text style={styles.resultIconText}>AI</Text></View><View style={styles.resultInfo}><Text style={styles.resultName}>{aiFood.name}</Text><Text style={styles.resultDetail}>{aiFood.detail} · AI estimate</Text></View><Text style={styles.resultCalories}>{aiFood.calories}</Text><Text style={styles.selectText}>{selectedFood?.id === aiFood.id ? 'Selected' : 'Edit'}</Text></Pressable> : null}{selectedFood ? <View style={styles.selectedFoodPanel}><View style={styles.selectedFoodHeader}><View><Text style={styles.selectedFoodLabel}>SELECTED FOOD</Text><Text style={styles.selectedFoodName}>{selectedFood.name}</Text><Text style={styles.resultDetail}>{selectedFood.detail}</Text></View><Pressable onPress={() => selectFood(null)}><Text style={styles.clearText}>Change</Text></Pressable></View><Pressable onPress={() => addMeal(selectedFood)} style={styles.logSelectedButton}><Text style={styles.logSelectedButtonText}>Log this portion</Text></Pressable></View> : null}{query.length > 0 && filteredFoods.length === 0 && !aiFood ? <Text style={styles.emptySearch}>No local match. Ask Sarvam to identify it.</Text> : filteredFoods.map((food) => <Pressable key={food.id} onPress={() => selectFood(food)} style={[styles.resultRow, selectedFood?.id === food.id && styles.resultRowSelected]}><View style={styles.resultIcon}><Text style={styles.resultIconText}>{food.icon}</Text></View><View style={styles.resultInfo}><Text style={styles.resultName}>{food.name}</Text><Text style={styles.resultDetail}>{food.detail}</Text></View><Text style={styles.resultCalories}>{food.calories}</Text><Text style={styles.selectText}>{selectedFood?.id === food.id ? 'Selected' : 'Edit'}</Text></Pressable>)}</>;
}

const styles = StyleSheet.create({
  onboardingSafe: { flex: 1, backgroundColor: '#f5f7f3' },
  onboarding: { flexGrow: 1, padding: 34, maxWidth: 920, width: '100%', alignSelf: 'center' },
  onboardingCompact: { padding: 20 },
  onboardingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  onboardingBrand: { color: '#183c35', fontSize: 21, fontWeight: '800' },
  stepText: { color: '#79908a', fontSize: 12, fontWeight: '700' },
  welcomeBlock: { maxWidth: 650, marginTop: 120 },
  welcomeKicker: { color: '#9b7b24', fontSize: 12, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' },
  welcomeTitle: { color: '#183c35', fontSize: 45, lineHeight: 52, fontWeight: '800', marginTop: 16 },
  welcomeCopy: { color: '#62756d', fontSize: 17, lineHeight: 27, maxWidth: 520, marginTop: 18 },
  startButton: { alignSelf: 'flex-start', backgroundColor: '#183c35', borderRadius: 8, paddingVertical: 15, paddingHorizontal: 22, marginTop: 32 },
  startButtonText: { color: '#d8f36a', fontSize: 14, fontWeight: '800' },
  privacyNote: { color: '#91a099', fontSize: 12, marginTop: 16 },
  stepFrame: { width: '100%', maxWidth: 620, alignSelf: 'center', marginTop: 80 },
  stepTitle: { color: '#183c35', fontSize: 34, lineHeight: 42, fontWeight: '800' },
  stepSubtitle: { color: '#71847c', fontSize: 15, lineHeight: 23, marginTop: 10 },
  fieldLabel: { color: '#50645c', fontSize: 12, fontWeight: '800', marginTop: 42, marginBottom: 14 },
  choiceGrid: { flexDirection: 'row', gap: 14 },
  choiceGridCompact: { flexDirection: 'column' },
  visualChoice: { flex: 1, minHeight: 145, borderRadius: 12, borderWidth: 1, borderColor: '#dce6de', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  visualChoiceSelected: { borderColor: '#39785e', backgroundColor: '#eaf4df' },
  visualChoiceIcon: { color: '#39785e', fontSize: 48, fontWeight: '300' },
  visualChoiceLabel: { color: '#50645c', fontSize: 14, fontWeight: '700', marginTop: 10 },
  selectedText: { color: '#39785e' },
  bigInput: { height: 76, borderWidth: 1, borderColor: '#dce6de', borderRadius: 9, backgroundColor: '#fff', color: '#183c35', fontSize: 30, fontWeight: '700', paddingHorizontal: 18, marginTop: 40 },
  inputSuffix: { color: '#91a099', fontSize: 12, marginTop: 9 },
  continueButton: { alignSelf: 'flex-start', backgroundColor: '#183c35', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 22, marginTop: 40 },
  continueButtonDisabled: { backgroundColor: '#b7c4bd' },
  continueButtonText: { color: '#d8f36a', fontWeight: '800', fontSize: 14 },
  unitInputRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 40 },
  unitTextInput: { flex: 1, height: 76, borderWidth: 1, borderColor: '#dce6de', borderRadius: 9, backgroundColor: '#fff', color: '#183c35', fontSize: 30, fontWeight: '700', paddingHorizontal: 18 },
  unitChoices: { flexDirection: 'row', borderWidth: 1, borderColor: '#dce6de', borderRadius: 8, overflow: 'hidden' },
  unitChoice: { paddingVertical: 13, paddingHorizontal: 13, backgroundColor: '#fff' },
  unitChoiceSelected: { backgroundColor: '#eaf4df' },
  unitChoiceText: { color: '#71847c', fontSize: 12, fontWeight: '800' },
  unitHint: { color: '#91a099', fontSize: 12, marginTop: 10 },
  goalList: { gap: 9, marginTop: 30 },
  goalChoice: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#dce6de', borderRadius: 9, backgroundColor: '#fff', padding: 15 },
  goalChoiceSelected: { borderColor: '#39785e', backgroundColor: '#eaf4df' },
  goalTitle: { color: '#183c35', fontSize: 14, fontWeight: '800' },
  goalDescription: { color: '#91a099', fontSize: 11, marginTop: 4 },
  goalArrow: { color: '#39785e', fontSize: 22, fontWeight: '600' },
  resultBlock: { maxWidth: 620, alignSelf: 'center', marginTop: 75 },
  calorieResult: { backgroundColor: '#183c35', borderRadius: 12, padding: 26, marginTop: 30 },
  resultLabel: { color: '#a8c0b5', fontSize: 10, letterSpacing: 1.1, fontWeight: '800' },
  resultNumber: { color: '#d8f36a', fontSize: 52, fontWeight: '800', marginTop: 12 },
  resultUnit: { color: '#e5ede6', fontSize: 14, marginTop: 2 },
  resultExplanation: { color: '#71847c', fontSize: 14, lineHeight: 22, marginTop: 18 },
  safeArea: { flex: 1, backgroundColor: '#f5f7f3' },
  appShell: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 238, backgroundColor: '#183c35', padding: 24, justifyContent: 'flex-start' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#d8f36a', alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: '#183c35', fontSize: 21, fontWeight: '800' },
  brand: { color: '#f5f7f3', fontSize: 21, fontWeight: '800' },
  brandCaption: { color: '#9db3aa', fontSize: 12, lineHeight: 18, marginTop: 10, width: 150 },
  navList: { gap: 8, marginTop: 54 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8 },
  navItemActive: { backgroundColor: '#2b5b4e' },
  navIcon: { color: '#9db3aa', fontSize: 13, fontWeight: '800', width: 18, textAlign: 'center' },
  navText: { color: '#b8cbc3', fontSize: 14, fontWeight: '600' },
  navTextActive: { color: '#d8f36a' },
  sidebarBottom: { marginTop: 'auto', gap: 22 },
  userRow: { borderTopWidth: 1, borderTopColor: '#356154', paddingTop: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#d8f36a', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#183c35', fontSize: 11, fontWeight: '800' },
  userName: { color: '#f5f7f3', fontSize: 12, fontWeight: '700' },
  userEmail: { color: '#9db3aa', fontSize: 11, marginTop: 3 },
  content: { padding: 34, maxWidth: 1200, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  headerCompact: { alignItems: 'flex-start', gap: 18, flexDirection: 'column' },
  eyebrow: { color: '#79908a', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  pageTitle: { color: '#183c35', fontSize: 30, fontWeight: '800', marginTop: 7 },
  primaryButton: { backgroundColor: '#183c35', borderRadius: 8, paddingVertical: 13, paddingHorizontal: 19 },
  primaryButtonText: { color: '#d8f36a', fontWeight: '800', fontSize: 14 },
  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statsGridCompact: { flexDirection: 'column' },
  statCard: { flex: 1, minHeight: 142, backgroundColor: '#ffffff', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#e1e8e1' },
  statLabel: { color: '#79908a', fontSize: 10, letterSpacing: 1.1, fontWeight: '800' },
  statValue: { color: '#183c35', fontSize: 30, fontWeight: '800', marginTop: 14 },
  statUnit: { color: '#79908a', fontSize: 14, fontWeight: '600' },
  statHint: { color: '#79908a', fontSize: 12, marginTop: 10 },
  progressTrack: { height: 7, backgroundColor: '#e5eee6', borderRadius: 5, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#d8b84c', borderRadius: 5 },
  mainGrid: { flexDirection: 'row', gap: 24, alignItems: 'flex-start' },
  mainGridCompact: { flexDirection: 'column' },
  wellnessPanel: { backgroundColor: '#f8faf8', borderRadius: 12, borderWidth: 1, borderColor: '#e1e8e1', padding: 22, marginBottom: 24 },
  todayBadge: { color: '#39785e', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  wellnessGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  wellnessItem: { flexGrow: 1, flexBasis: 220, minHeight: 70, backgroundColor: '#ffffff', borderRadius: 9, borderWidth: 1, borderColor: '#e1e8e1', padding: 12, flexDirection: 'row', alignItems: 'center' },
  wellnessIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#e5f0d8', color: '#39785e', textAlign: 'center', textAlignVertical: 'center', fontSize: 11, fontWeight: '800' },
  wellnessCopy: { flex: 1, marginLeft: 9 },
  wellnessTitle: { color: '#183c35', fontSize: 12, fontWeight: '800' },
  wellnessValue: { color: '#79908a', fontSize: 11, marginTop: 3 },
  quickActions: { flexDirection: 'row', gap: 5 },
  quickButton: { backgroundColor: '#edf8df', borderRadius: 5, paddingVertical: 7, paddingHorizontal: 8 },
  quickButtonText: { color: '#39785e', fontSize: 10, fontWeight: '800' },
  wellnessInput: { width: 55, height: 29, borderWidth: 1, borderColor: '#dce6de', borderRadius: 5, color: '#183c35', textAlign: 'center', fontSize: 11 },
  moodRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7, marginTop: 16 },
  moodLabel: { color: '#50645c', fontSize: 11, fontWeight: '700', marginRight: 4 },
  moodChoice: { borderWidth: 1, borderColor: '#dce6de', borderRadius: 5, paddingVertical: 7, paddingHorizontal: 10, backgroundColor: '#ffffff' },
  moodChoiceActive: { backgroundColor: '#e5f0d8', borderColor: '#39785e' },
  moodChoiceText: { color: '#71847c', fontSize: 10, fontWeight: '700' },
  logPanel: { flex: 1.4, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e1e8e1', padding: 22, minHeight: 270 },
  searchPanel: { flex: 1, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e1e8e1', padding: 22, minHeight: 270 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sectionTitle: { color: '#183c35', fontSize: 18, fontWeight: '800' },
  sectionSubtitle: { color: '#79908a', fontSize: 12, marginTop: 5 },
  clearText: { color: '#b66b55', fontSize: 12, fontWeight: '700' },
  notice: { color: '#39785e', backgroundColor: '#edf8df', padding: 10, borderRadius: 6, marginTop: 16, fontSize: 12 },
  mealRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#edf1ed', paddingVertical: 14, marginTop: 12 },
  foodIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#f0e7c9', alignItems: 'center', justifyContent: 'center' },
  foodIconText: { color: '#876f2b', fontSize: 11, fontWeight: '800' },
  mealInfo: { flex: 1, marginLeft: 12 },
  mealName: { color: '#183c35', fontSize: 14, fontWeight: '700' },
  mealMeta: { color: '#8b9a94', fontSize: 11, marginTop: 4 },
  mealCalories: { color: '#50645c', fontSize: 12, marginRight: 15 },
  removeText: { color: '#a4b0ab', fontSize: 16, paddingHorizontal: 4 },
  searchInput: { height: 42, borderRadius: 7, borderWidth: 1, borderColor: '#dce6de', backgroundColor: '#f8faf8', paddingHorizontal: 13, color: '#183c35', fontSize: 12, marginTop: 20, marginBottom: 8, outlineStyle: 'none' } as any,
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiButton: { backgroundColor: '#e5f0d8', borderRadius: 7, paddingVertical: 12, paddingHorizontal: 10 },
  aiButtonDisabled: { opacity: 0.5 },
  aiButtonText: { color: '#39785e', fontSize: 11, fontWeight: '800' },
  aiError: { color: '#a5523b', backgroundColor: '#fff0eb', borderRadius: 6, padding: 9, fontSize: 11, marginTop: 7 },
  aiResult: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f8e8', borderWidth: 1, borderColor: '#c7dfaf', borderRadius: 7, paddingVertical: 10, paddingHorizontal: 8, marginTop: 6 },
  resultRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#edf1ed', paddingVertical: 12 },
  resultRowSelected: { backgroundColor: '#f1f8e8', borderColor: '#39785e', borderWidth: 1, borderRadius: 7, paddingHorizontal: 8 },
  resultIcon: { width: 31, height: 31, borderRadius: 8, backgroundColor: '#e5f0d8', alignItems: 'center', justifyContent: 'center' },
  resultIconText: { color: '#39785e', fontSize: 9, fontWeight: '800' },
  resultInfo: { flex: 1, marginLeft: 9 },
  resultName: { color: '#183c35', fontSize: 12, fontWeight: '700' },
  resultDetail: { color: '#8b9a94', fontSize: 10, marginTop: 3 },
  resultCalories: { color: '#79908a', fontSize: 11, marginRight: 13 },
  selectText: { color: '#39785e', fontSize: 10, fontWeight: '800', marginLeft: 8 },
  addText: { color: '#39785e', fontSize: 21, fontWeight: '600' },
  selectedFoodPanel: { backgroundColor: '#f8faf8', borderWidth: 1, borderColor: '#c7dfaf', borderRadius: 8, padding: 12, marginTop: 12 },
  selectedFoodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  selectedFoodLabel: { color: '#39785e', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  selectedFoodName: { color: '#183c35', fontSize: 14, fontWeight: '800', marginTop: 4 },
  logSelectedButton: { backgroundColor: '#183c35', borderRadius: 6, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  logSelectedButtonText: { color: '#d8f36a', fontSize: 11, fontWeight: '800' },
  emptyText: { color: '#8b9a94', fontSize: 13, lineHeight: 20, paddingVertical: 35, textAlign: 'center' },
  emptySearch: { color: '#8b9a94', fontSize: 12, paddingVertical: 18 },
  settingsPanel: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e1e8e1', padding: 25, maxWidth: 600 },
  settingsLabel: { color: '#50645c', fontSize: 12, fontWeight: '700', marginTop: 24, marginBottom: 8 },
  targetInput: { borderWidth: 1, borderColor: '#dce6de', borderRadius: 7, padding: 12, color: '#183c35', backgroundColor: '#f8faf8' },
  helper: { color: '#8b9a94', fontSize: 12, marginTop: 24 },
  progressLarge: { borderLeftWidth: 5, borderLeftColor: '#d8b84c', paddingLeft: 18, marginTop: 28 },
  progressNumber: { color: '#183c35', fontSize: 45, fontWeight: '800' },
  progressCaption: { color: '#79908a', fontSize: 13 },
  progressPage: { maxWidth: 900 },
  progressHero: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e1e8e1', padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  progressHeroScore: { color: '#183c35', fontSize: 36, fontWeight: '800' },
  progressSummary: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  progressSummaryItem: { flex: 1, minWidth: 180, backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: '#e1e8e1', padding: 18 },
  progressSummaryLabel: { color: '#79908a', fontSize: 10, letterSpacing: 1, fontWeight: '800' },
  progressSummaryValue: { color: '#183c35', fontSize: 24, fontWeight: '800', marginTop: 10 },
  progressSummaryHint: { color: '#8b9a94', fontSize: 11, marginTop: 4 },
  progressBreakdown: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e1e8e1', padding: 22, marginTop: 16 },
  progressLine: { marginTop: 20 },
  progressLineHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  insightPanel: { backgroundColor: '#183c35', borderRadius: 12, padding: 22, marginTop: 16 },
  insightLabel: { color: '#d8f36a', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  insightText: { color: '#ffffff', fontSize: 17, lineHeight: 24, fontWeight: '700', marginTop: 10 },
  libraryPanel: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e1e8e1', padding: 25, maxWidth: 700 },
  foodControls: { marginTop: 18, marginBottom: 7 },
  mealTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  mealTypeChoice: { paddingVertical: 7, paddingHorizontal: 9, borderRadius: 6, backgroundColor: '#f1f5f1' },
  mealTypeSelected: { backgroundColor: '#e5f0d8' },
  mealTypeText: { color: '#71847c', fontSize: 10, fontWeight: '800' },
  servingsRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  servingsLabel: { color: '#79908a', fontSize: 11, fontWeight: '700', marginRight: 4 },
  stepperButton: { width: 25, height: 25, borderRadius: 5, backgroundColor: '#eaf4df', alignItems: 'center', justifyContent: 'center' },
  stepperText: { color: '#39785e', fontSize: 16, fontWeight: '800' },
  servingsInput: { width: 42, height: 25, borderWidth: 1, borderColor: '#dce6de', borderRadius: 5, textAlign: 'center', color: '#183c35', fontSize: 11, paddingVertical: 0 },
  unitDropdown: { position: 'relative', zIndex: 5 },
  unitDropdownButton: { minWidth: 72, height: 25, borderWidth: 1, borderColor: '#dce6de', borderRadius: 5, backgroundColor: '#f8faf8', paddingHorizontal: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  unitDropdownText: { color: '#183c35', fontSize: 11, fontWeight: '700' },
  unitDropdownPlaceholder: { color: '#98a09b', fontWeight: '400' },
  unitDropdownArrow: { color: '#39785e', fontSize: 10, marginLeft: 6 },
  unitDropdownMenu: { position: 'absolute', top: 29, right: 0, minWidth: 72, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#dce6de', borderRadius: 5, shadowColor: '#183c35', shadowOpacity: 0.12, shadowRadius: 5, elevation: 4, zIndex: 10 },
  unitDropdownOption: { paddingVertical: 8, paddingHorizontal: 9, borderBottomWidth: 1, borderBottomColor: '#edf1ed' },
  unitDropdownOptionText: { color: '#183c35', fontSize: 11 },
  inlineForm: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputUnit: { color: '#79908a', fontSize: 12, marginLeft: -45, width: 35 },
  smallButton: { alignSelf: 'flex-start', backgroundColor: '#183c35', borderRadius: 7, paddingVertical: 10, paddingHorizontal: 14, marginTop: 13 },
  smallButtonText: { color: '#d8f36a', fontSize: 12, fontWeight: '800' },
  languageRow: { flexDirection: 'row', gap: 8 },
  languageChoice: { borderWidth: 1, borderColor: '#dce6de', borderRadius: 6, paddingVertical: 9, paddingHorizontal: 12 },
  languageChoiceActive: { backgroundColor: '#eaf4df', borderColor: '#39785e' },
  languageText: { color: '#71847c', fontSize: 12 },
  dangerButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#e2b7aa', borderRadius: 7, paddingVertical: 10, paddingHorizontal: 14 },
  dangerText: { color: '#a5523b', fontSize: 12, fontWeight: '700' },
  profileGrid: { flexDirection: 'row', gap: 14 },
  profileField: { flex: 1 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 28, marginBottom: 8 },
  macroLabel: { color: '#50645c', fontSize: 12, fontWeight: '700' },
  macroValue: { color: '#79908a', fontSize: 12 },
});
