# 🧪 OCR Testing Guide - Step by Step

**Date:** 2026-01-17

---

## 🔧 FIXES APPLIED

### 1. Camera Permissions Fixed
- ✅ Added runtime camera permission request for Android
- ✅ Added PermissionsAndroid import
- ✅ Request permission before opening camera
- ✅ Show proper error message if permission denied
- ✅ Added detailed console logs for debugging

### 2. Backend Logging Enhanced
- ✅ Added more console logs in OpenAI API call
- ✅ Logs image size before sending
- ✅ Logs API success/failure
- ✅ Better error messages

---

## 📱 TESTING STEPS

### Step 1: Start Backend
```bash
cd C:\Users\shahz\MSWASTH\backend
npm start
```

**Expected Output:**
```
✅ MongoDB connected
Server running on port 3000
```

### Step 2: Check Backend Logs
Backend console mein ye logs dikhne chahiye:
- `MongoDB connected`
- `Server running on port 3000`

### Step 3: Start Metro Bundler
```bash
C:\Users\shahz\MSWASTH\swasthMobile\start-metro.bat
```

### Step 4: Reload App
```bash
adb reverse tcp:8081 tcp:8081
adb shell input text "RR"
```

### Step 5: Navigate to OCR Screen
1. Open app on device
2. Go to Dashboard
3. Click "Report Scanner" or "OCR" button
4. OCR Screen should open

### Step 6: Test Camera
1. Click "Scan Report" button
2. **Permission dialog should appear** asking for camera access
3. Click "Allow" or "OK"
4. Camera should open
5. Take a photo of ANY paper with text (medical report, prescription, or even plain text)

**If camera doesn't open, check:**
- Console logs in Metro bundler for `[OCR] Picker error:`
- Device has camera permission in Settings > Apps > MSWASTH > Permissions

### Step 7: Upload Photo
1. After taking photo, upload should start
2. You should see "Uploading Report..." screen
3. Then success alert: "Report uploaded! Processing..."

### Step 8: Check Backend Console
Backend console mein ye logs dikhne chahiye:
```
[OCR Upload] BODY: { email: 'test@swasth.com', reportType: 'Blood Test', ... }
[OCR Upload] FILE: { originalname: 'report_...jpg', size: 123456, ... }
[OCR Upload] Scan created: 507f1f77bcf86cd799439011
[OCR Background] Starting Tesseract OCR...
[OCR Background] Tesseract completed, text length: 523
[OCR Background] Starting AI analysis...
[OCR AI] Starting AI analysis for: Blood Test
[OCR AI] Calling OpenAI API with model: gpt-4o
[OCR AI] Image size: 234567 bytes
[OCR AI] OpenAI API call successful
[OCR AI] Raw response: { "summary": "...", ... }
[OCR AI] Parsed analysis: { summary, healthMetrics, ... }
[OCR Background] Creating health logs from 3 metrics
[OCR Background] Created health log: heartRate 72
[OCR Background] Scan completed successfully
```

### Step 9: View Report in Scanner
1. Navigate to "Report Scanner" screen (or it opens automatically)
2. Pull to refresh (swipe down)
3. You should see the uploaded report card
4. **Tap on the card to expand**
5. You should see:
   - ✅ AI Summary section (purple background)
   - ✅ Health Metrics section (blue background)
   - ✅ Health Concerns (if any, orange background)
   - ✅ Recommendations (green background)
   - ✅ Confidence score at bottom

### Step 10: Check HealthTracker
1. Navigate to HealthTracker screen
2. You should see newly added vitals with note: "Auto-extracted from Blood Test report scan"

---

## 🐛 DEBUGGING ISSUES

### Issue 1: Camera Not Opening

**Symptoms:**
- Button click karne pe kuch nahi hota
- Error alert dikhai deta hai

**Check:**
1. Metro bundler console mein `[OCR] Picker error:` search karo
2. Device Settings > Apps > MSWASTH > Permissions > Camera = Allowed?
3. Try gallery instead: Choose "Choose from Gallery" option

**Fix:**
```bash
# Manually grant permission via ADB
adb shell pm grant com.swasthmobile android.permission.CAMERA
```

### Issue 2: Upload Failed

**Symptoms:**
- "Upload Failed" alert dikhai deta hai
- Backend console mein error hai

**Check:**
1. Backend running hai?
2. Backend console mein error message kya hai?
3. Image size check karo (should be < 10MB)

**Backend Console:**
Look for: `[OCR Upload] Error: ...`

### Issue 3: No AI Summary

**Symptoms:**
- Report upload ho jata hai
- But expanded card mein sirf status dikhai deta hai
- No AI Summary section

**Check:**
1. Backend console check karo
2. Look for: `[OCR AI] Analysis failed:` or `[OCR Background] Processing failed:`
3. OpenAI API key valid hai? (Check `.env` file)

**Possible Reasons:**
- OpenAI API quota exceeded (free tier limit)
- API key invalid or expired
- Network issue connecting to OpenAI
- Image too large or unclear

**Fallback:**
- Tesseract OCR text should still show in "Extracted Text" section
- Status should show "completed" not "failed"

### Issue 4: Processing Takes Too Long

**Symptoms:**
- Upload succeeds
- But status stays "processing" for > 2 minutes

**Check:**
1. Backend console - is it stuck?
2. Look for error in background processing
3. Check OpenAI API response time

**Expected Time:**
- Tesseract OCR: 5-15 seconds
- OpenAI Vision: 10-30 seconds
- Total: 15-45 seconds

**If Stuck:**
- Backend restart karo
- Delete the stuck scan from MongoDB
- Try with smaller/clearer image

---

## 📊 EXPECTED RESULTS

### Successful Upload Flow:

**Frontend (App):**
```
1. User clicks "Scan Report"
2. Permission dialog (first time only)
3. Camera opens
4. User takes photo
5. "Uploading Report..." screen shows
6. Success alert appears
7. Navigate to Report Scanner
```

**Backend (Console):**
```
1. File received and saved
2. Scan entry created in MongoDB
3. Tesseract starts OCR
4. OpenAI Vision starts analysis
5. Health metrics extracted
6. Health logs created
7. Scan updated with results
8. Status = "completed"
```

**Report Display:**
```
1. Report card shows in list
2. Member name visible
3. Brain icon visible (AI analysis present)
4. Tap to expand
5. All sections visible:
   - AI Summary
   - Health Metrics (with color-coded status)
   - Concerns (if any)
   - Recommendations
   - Confidence score
```

---

## 🔍 MANUAL TESTING CHECKLIST

- [ ] Backend starts successfully
- [ ] MongoDB connected
- [ ] Metro bundler running
- [ ] App reloads on device
- [ ] OCR screen opens
- [ ] Camera permission dialog appears
- [ ] Camera opens after permission granted
- [ ] Photo captured successfully
- [ ] Upload progress shows
- [ ] Success alert appears
- [ ] Backend logs show processing
- [ ] Tesseract completes
- [ ] OpenAI API called successfully
- [ ] Health metrics extracted
- [ ] Health logs created
- [ ] Scan status = "completed"
- [ ] Report appears in scanner list
- [ ] Expand shows all sections
- [ ] AI summary visible
- [ ] Health metrics show with colors
- [ ] HealthTracker shows new vitals

---

## 💡 TIPS

### Best Images for Testing:
1. **Medical prescription** - Small, clear text
2. **Lab report** - Contains vitals like BP, sugar, etc.
3. **Blood test report** - Best for auto-fill demo
4. **Even plain text paper** - Will work, just won't have health metrics

### Quick Test Without Real Report:
1. Take photo of any text document
2. Upload with report type "General"
3. AI will analyze whatever text is visible
4. May not extract health metrics, but summary will work

### Cost Management:
- Each scan costs ~$0.01 USD
- OpenAI free tier: $5 credit for 3 months
- You can test ~500 scans before running out

---

## 🚨 COMMON ERRORS & SOLUTIONS

### Error: "Camera permission denied"
**Solution:**
```bash
adb shell pm grant com.swasthmobile android.permission.CAMERA
```
Or: Settings > Apps > MSWASTH > Permissions > Enable Camera

### Error: "OpenAI API key not found"
**Solution:** Check `backend/.env` file has valid OPENAI_API_KEY

### Error: "No JSON found in AI response"
**Solution:** OpenAI response format unexpected - backend will fallback to Tesseract text only

### Error: "File too large"
**Solution:** Image picker already compresses to 1920x1920. If still too large, reduce `maxWidth` in OCRScreen.js

---

## ✅ SUCCESS CRITERIA

Test is successful when:
1. ✅ Camera opens on button click
2. ✅ Photo uploads successfully
3. ✅ Backend processes in 15-45 seconds
4. ✅ Report appears in scanner list
5. ✅ AI summary displays when expanded
6. ✅ Health metrics show (if medical report)
7. ✅ Vitals auto-populate in HealthTracker

---

## 📞 DEBUGGING COMMANDS

```bash
# Check app logs
adb logcat | grep -i "OCR"

# Check camera permission
adb shell dumpsys package com.swasthmobile | grep -i "camera"

# Clear app data (if needed)
adb shell pm clear com.swasthmobile

# Restart app
adb shell am force-stop com.swasthmobile
adb shell am start -n com.swasthmobile/.MainActivity
```

---

**Last Updated:** 2026-01-17
**Status:** Ready for testing with camera permission fixes
