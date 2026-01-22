# Frontend Integration Guide - MSWASTH

**NEW BACKEND ROUTES ADDED:**
- `/api/workouts` - Workout tracking
- `/api/vaccinations` - Vaccination records
- `/api/reminders` - Reminder management

All API functions are now available in `src/config/api.js`. Below is how to integrate each screen.

---

## 1. WorkoutsScreen Integration

**Current Status:** Uses AsyncStorage (local only)
**Target:** Connect to `/api/workouts`

### API Functions Available:
```javascript
import {
  getWorkouts,
  getWorkoutsByDate,
  addWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutStats
} from '../../config/api';
```

### Integration Steps:

**Step 1: Replace AsyncStorage with API calls**

**Current (AsyncStorage):**
```javascript
// Old code - Remove this
const loadWorkouts = async () => {
  const stored = await AsyncStorage.getItem('workouts');
  const workouts = stored ? JSON.parse(stored) : [];
  setWorkouts(workouts);
};
```

**New (Backend API):**
```javascript
import { getWorkouts, addWorkout, deleteWorkout } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';

const { user } = useAuth();

const loadWorkouts = async () => {
  try {
    setLoading(true);
    const data = await getWorkouts(user.email);
    setWorkouts(data);
  } catch (error) {
    console.error('Error loading workouts:', error);
    Alert.alert('Error', 'Failed to load workouts');
  } finally {
    setLoading(false);
  }
};
```

**Step 2: Add Workout**
```javascript
const handleAddWorkout = async (workoutData) => {
  try {
    setSaving(true);
    const newWorkout = await addWorkout({
      userEmail: user.email,
      workoutType: workoutData.type, // 'Cardio', 'Strength', etc.
      title: workoutData.title,
      duration: workoutData.duration, // in minutes
      calories: workoutData.calories,
      intensity: workoutData.intensity, // 'Low', 'Moderate', 'High'
      notes: workoutData.notes,
      date: new Date(),
    });

    Alert.alert('Success', 'Workout logged successfully');
    loadWorkouts(); // Refresh list
  } catch (error) {
    Alert.alert('Error', 'Failed to add workout');
  } finally {
    setSaving(false);
  }
};
```

**Step 3: Delete Workout**
```javascript
const handleDeleteWorkout = async (workoutId) => {
  try {
    await deleteWorkout(workoutId);
    loadWorkouts(); // Refresh list
  } catch (error) {
    Alert.alert('Error', 'Failed to delete workout');
  }
};
```

**Step 4: Get Workout Stats**
```javascript
const [stats, setStats] = useState(null);

const loadStats = async () => {
  try {
    const data = await getWorkoutStats(user.email);
    // data contains: totalWorkouts, totalMinutes, totalCalories, avgMinutesPerWorkout, typeBreakdown
    setStats(data);
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};
```

---

## 2. VaccinationScreen Integration

**Current Status:** Uses AsyncStorage (local only)
**Target:** Connect to `/api/vaccinations`

### API Functions Available:
```javascript
import {
  getVaccinations,
  getVaccinationsByMember,
  addVaccination,
  updateVaccination,
  deleteVaccination,
  getUpcomingVaccinations
} from '../../config/api';
```

### Integration Steps:

**Step 1: Load Vaccinations**
```javascript
import { getVaccinations, getFamilyMembers } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';

const { user } = useAuth();
const [vaccinations, setVaccinations] = useState([]);
const [members, setMembers] = useState([]);

const loadData = async () => {
  try {
    setLoading(true);
    // Load family members for dropdown
    const familyData = await getFamilyMembers(user.email);
    setMembers([{ _id: 'self', name: user.name || 'You' }, ...familyData]);

    // Load all vaccinations
    const vacData = await getVaccinations(user.email);
    setVaccinations(vacData);
  } catch (error) {
    console.error('Error loading data:', error);
    Alert.alert('Error', 'Failed to load vaccinations');
  } finally {
    setLoading(false);
  }
};
```

**Step 2: Add Vaccination**
```javascript
const handleAddVaccination = async (vacData) => {
  try {
    setSaving(true);
    const newVac = await addVaccination({
      userEmail: user.email,
      memberId: vacData.memberId === 'self' ? null : vacData.memberId,
      memberName: vacData.memberName,
      vaccineName: vacData.vaccineName,
      date: vacData.date,
      nextDueDate: vacData.nextDueDate, // optional
      provider: vacData.provider,
      batchNumber: vacData.batchNumber,
      sideEffects: vacData.sideEffects,
      notes: vacData.notes,
      status: vacData.status, // 'Completed', 'Scheduled', 'Overdue'
    });

    Alert.alert('Success', 'Vaccination record added');
    loadData(); // Refresh
  } catch (error) {
    Alert.alert('Error', 'Failed to add vaccination');
  } finally {
    setSaving(false);
  }
};
```

**Step 3: Get Upcoming Vaccinations**
```javascript
const [upcoming, setUpcoming] = useState([]);

const loadUpcoming = async () => {
  try {
    const data = await getUpcomingVaccinations(user.email);
    // Returns vaccinations due in next 30 days
    setUpcoming(data);
  } catch (error) {
    console.error('Error loading upcoming:', error);
  }
};
```

**Step 4: Filter by Family Member**
```javascript
const handleMemberSelect = async (memberId) => {
  try {
    const data = await getVaccinationsByMember(user.email, memberId);
    setVaccinations(data);
  } catch (error) {
    Alert.alert('Error', 'Failed to load vaccinations');
  }
};
```

---

## 3. RemindersScreen Integration

**Current Status:** Uses AsyncStorage + React Native notifications
**Target:** Connect to `/api/reminders` (backend sync) + keep local notifications

### API Functions Available:
```javascript
import {
  getReminders,
  getActiveReminders,
  addReminder,
  updateReminder,
  toggleReminder,
  deleteReminder,
  markReminderTriggered
} from '../../config/api';
```

### Integration Steps:

**Step 1: Load Reminders**
```javascript
import { getReminders } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';
import PushNotification from 'react-native-push-notification'; // Keep for local notifications

const { user } = useAuth();
const [reminders, setReminders] = useState([]);

const loadReminders = async () => {
  try {
    setLoading(true);
    const data = await getReminders(user.email);
    setReminders(data);

    // Schedule local notifications for active reminders
    data.filter(r => r.enabled).forEach(scheduleLocalNotification);
  } catch (error) {
    console.error('Error loading reminders:', error);
    Alert.alert('Error', 'Failed to load reminders');
  } finally {
    setLoading(false);
  }
};
```

**Step 2: Add Reminder (with local notification)**
```javascript
const handleAddReminder = async (reminderData) => {
  try {
    setSaving(true);
    const newReminder = await addReminder({
      userEmail: user.email,
      title: reminderData.title,
      description: reminderData.description,
      type: reminderData.type, // 'Medication', 'Appointment', 'Exercise', 'Water', 'Custom'
      time: reminderData.time, // "09:00"
      frequency: reminderData.frequency, // 'Once', 'Daily', 'Weekly', 'Monthly'
      daysOfWeek: reminderData.daysOfWeek, // [0,1,2,3,4,5,6] for Weekly
      enabled: true,
    });

    // Schedule local notification
    scheduleLocalNotification(newReminder);

    Alert.alert('Success', 'Reminder added');
    loadReminders();
  } catch (error) {
    Alert.alert('Error', 'Failed to add reminder');
  } finally {
    setSaving(false);
  }
};

// Helper function to schedule local notification
const scheduleLocalNotification = (reminder) => {
  if (!reminder.enabled) return;

  const [hour, minute] = reminder.time.split(':');
  const date = new Date();
  date.setHours(parseInt(hour), parseInt(minute), 0, 0);

  PushNotification.localNotificationSchedule({
    id: reminder._id,
    title: reminder.title,
    message: reminder.description || 'Time for your reminder!',
    date: date,
    repeatType: reminder.frequency.toLowerCase(), // 'day', 'week', 'month'
    allowWhileIdle: true,
  });
};
```

**Step 3: Toggle Reminder On/Off**
```javascript
const handleToggleReminder = async (reminderId) => {
  try {
    const updatedReminder = await toggleReminder(reminderId);

    // Update local notification
    if (updatedReminder.enabled) {
      scheduleLocalNotification(updatedReminder);
    } else {
      PushNotification.cancelLocalNotification(reminderId);
    }

    loadReminders();
  } catch (error) {
    Alert.alert('Error', 'Failed to toggle reminder');
  }
};
```

**Step 4: Delete Reminder**
```javascript
const handleDeleteReminder = async (reminderId) => {
  try {
    await deleteReminder(reminderId);

    // Cancel local notification
    PushNotification.cancelLocalNotification(reminderId);

    loadReminders();
  } catch (error) {
    Alert.alert('Error', 'Failed to delete reminder');
  }
};
```

---

## Quick Integration Checklist

For **each screen** (Workouts, Vaccination, Reminders):

### ✅ Step 1: Import API functions
```javascript
import { getXXX, addXXX, deleteXXX } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';
```

### ✅ Step 2: Get user email
```javascript
const { user } = useAuth();
```

### ✅ Step 3: Replace AsyncStorage calls with API calls
- `AsyncStorage.getItem()` → `getXXX(user.email)`
- `AsyncStorage.setItem()` → `addXXX(data)` or `updateXXX(id, data)`
- `AsyncStorage.removeItem()` → `deleteXXX(id)`

### ✅ Step 4: Add error handling
```javascript
try {
  setLoading(true);
  const data = await getXXX(user.email);
  setData(data);
} catch (error) {
  console.error('Error:', error);
  Alert.alert('Error', 'Failed to load data');
} finally {
  setLoading(false);
}
```

### ✅ Step 5: Test
- Add item
- View list
- Edit item
- Delete item
- Check data persists after app restart

---

## Backend Models Summary

### Workout Schema
```javascript
{
  userEmail: String (required),
  memberId: ObjectId (optional - for family member),
  memberName: String (default: 'Self'),
  workoutType: String (required) - 'Cardio', 'Strength', 'Flexibility', 'Sports',
  title: String (required),
  duration: Number (required) - minutes,
  calories: Number (default: 0),
  intensity: String - 'Low', 'Moderate', 'High',
  notes: String,
  date: Date (default: now),
  createdAt: Date,
  updatedAt: Date
}
```

### Vaccination Schema
```javascript
{
  userEmail: String (required),
  memberId: ObjectId (optional),
  memberName: String (default: 'Self'),
  vaccineName: String (required),
  date: Date (required),
  nextDueDate: Date (optional),
  provider: String,
  batchNumber: String,
  sideEffects: String,
  notes: String,
  status: String - 'Completed', 'Scheduled', 'Overdue',
  createdAt: Date,
  updatedAt: Date
}
```

### Reminder Schema
```javascript
{
  userEmail: String (required),
  title: String (required),
  description: String,
  type: String - 'Medication', 'Appointment', 'Exercise', 'Water', 'Custom',
  time: String (required) - "HH:MM" format,
  frequency: String - 'Once', 'Daily', 'Weekly', 'Monthly',
  daysOfWeek: [Number] - [0-6] for Weekly (0=Sunday),
  enabled: Boolean (default: true),
  startDate: Date,
  endDate: Date (optional),
  lastTriggered: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing the Integration

### Test Backend Routes Directly:

```bash
# Test Workouts
curl -X GET http://192.168.29.192:3000/api/workouts/test@example.com

# Test Vaccinations
curl -X GET http://192.168.29.192:3000/api/vaccinations/test@example.com

# Test Reminders
curl -X GET http://192.168.29.192:3000/api/reminders/test@example.com
```

### Test from Mobile App:

1. Login to app
2. Navigate to respective screen
3. Add a test entry
4. Close and reopen app
5. Verify data persists (should load from backend)
6. Try editing and deleting

---

## Benefits of Backend Integration

✅ **Data Persistence** - Data saved to MongoDB, survives app uninstall
✅ **Cross-Device Sync** - Access same data from multiple devices
✅ **Family Sharing** - Track health data for family members
✅ **Backup** - Data automatically backed up to cloud
✅ **Analytics** - Can generate insights from aggregated data

---

**Next Steps:**
1. Integrate WorkoutsScreen (Priority: Medium)
2. Integrate VaccinationScreen (Priority: Medium)
3. Integrate RemindersScreen (Priority: Low - works fine locally)

**Files to Modify:**
- `src/screens/main/WorkoutsScreen.js`
- `src/screens/main/VaccinationScreen.js`
- `src/screens/main/RemindersScreen.js`

All API functions are ready in `src/config/api.js` - just replace AsyncStorage calls with these functions!
