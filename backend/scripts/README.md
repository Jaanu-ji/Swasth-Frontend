# Database Cleanup Scripts

## Health Logs Cleanup

### Purpose
The `cleanup-health-logs.js` script fixes data inconsistencies in the healthlogs collection:

1. **Field Migration**: Migrates records from `email` → `userEmail`
2. **Type Validation**: Fixes invalid type values (e.g., `glucose` → `sugar`)
3. **Data Integrity**: Removes records with missing required fields
4. **Type Removal**: Deletes records with unmappable types (e.g., `oxygen`)

### Usage

```bash
# Run cleanup script
npm run cleanup:health

# OR directly with node
node backend/scripts/cleanup-health-logs.js
```

### What It Does

1. **Migrates `email` → `userEmail`**
   - Finds all records with `email` field
   - Creates `userEmail` with the same value
   - Removes `email` field

2. **Fixes Invalid Types**
   - Maps `glucose` → `sugar` (valid enum value)
   - Deletes `oxygen` records (not in enum)

3. **Removes Invalid Records**
   - Deletes records missing `userEmail`
   - Deletes records missing `type`
   - Deletes records missing `value`

### Valid Type Values

The script ensures all records use these valid enum values:
- `weight`
- `height`
- `bmi`
- `bloodPressure`
- `sugar`
- `water`
- `symptoms`
- `heartRate`
- `temperature`

### Safety

⚠️ **Important**: This script modifies/deletes data. Make sure to:
- Back up your database before running
- Test on a development environment first
- Review the script output carefully

### Output

The script provides detailed console output:
- Number of records found/migrated/deleted
- List of invalid types found
- Final summary of valid records
- Verification status


