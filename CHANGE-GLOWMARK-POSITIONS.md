# How to Change Glowmark Positions

## 🎯 Quick Answer

Glowmark positions are stored in `position_3d` in the database. You can change them by:

### Method 1: Update the Seed Script (Recommended for bulk changes)

Edit `scripts/seed-all-landmarks.ts` and change the `position_3d` values:

```typescript
{
    title: 'Sigale-gale',
    // ... other fields
    position_3d: { 
        x: -1.5,  // ⬅️ Change these values
        y: 1.6,   // Y = height (1.4 to 1.9 works best)
        z: 1.0    // X/Z = horizontal position (-2 to 2)
    }
}
```

Then re-run: `npx tsx scripts/seed-all-landmarks.ts`

⚠️ **Note:** This will INSERT new landmarks, not update existing ones. To update, use Method 2.

---

### Method 2: Update Database Directly (For individual landmarks)

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Update a specific landmark's position
UPDATE landmarks 
SET position_3d = '{"x": -1.5, "y": 1.6, "z": 1.0}'::jsonb
WHERE title = 'Sigale-gale';

-- Find a landmark's current position
SELECT id, title, position_3d 
FROM landmarks 
WHERE title = 'Sigale-gale';
```

---

### Method 3: Create a Position Update Script

Create `scripts/update-positions.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function updatePositions() {
    // Update Sigale-gale position
    const { error } = await supabase
        .from('landmarks')
        .update({ 
            position_3d: { x: -2.0, y: 1.7, z: 0.8 } 
        })
        .eq('title', 'Sigale-gale');

    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.log('✅ Position updated!');
    }
}

updatePositions();
```

Run: `npx tsx scripts/update-positions.ts`

---

## 📐 Understanding the Coordinate System

```
        Y (up)
        |
        |
        |_____ X (right)
       /
      /
     Z (forward)
```

- **Origin (0, 0, 0)**: Center of the island
- **X-axis**: Left (-) to Right (+)
- **Y-axis**: Down (-) to Up (+)  
- **Z-axis**: Back (-) to Front (+)

### Recommended Ranges:
- **X**: -2.0 to 2.0 (horizontal left/right)
- **Y**: 1.4 to 1.9 (height above island - don't go below 1.3 or they'll be inside the mesh)
- **Z**: -2.0 to 2.0 (horizontal back/forward)

### Examples:
```typescript
{ x: 0, y: 2.0, z: 0 }      // Dead center, highest point
{ x: -2, y: 1.5, z: 1 }     // Far left, slightly forward
{ x: 1.5, y: 1.4, z: -1.8 } // Right side, toward back
```

---

## 🧪 How to Test Positions Visually

1. **Update a position** (using any method above)
2. **Refresh your browser** (Ctrl+F5 or Cmd+Shift+R)
3. **Look at the 3D island** - the glowmark should have moved
4. **Repeat** until you're happy with the position

### Pro Tip: Circular Distribution

For a nice spread of 25 landmarks around the island:

```typescript
// Distribute landmarks in a circle
const angle = (index / totalLandmarks) * Math.PI * 2;
const radius = 1.5; // Distance from center

position_3d: {
    x: Math.cos(angle) * radius,
    y: 1.6, // Fixed height
    z: Math.sin(angle) * radius
}
```

---

## 🎨 Current Sigale-gale Position

Your Sigale-gale is currently at:
```typescript
{ x: -1.5, y: 1.6, z: 1.0 }
```

**In plain English:**
- Left side of the island (`x: -1.5`)
- Above the surface (`y: 1.6`)
- Slightly toward the front (`z: 1.0`)

If you want to move it to the **top center**, change to:
```typescript
{ x: 0, y: 1.9, z: 0 }
```

---

## 🔄 After Making Changes

1. If you edited the **seed script**: Re-run it (may create duplicates - better to use UPDATE)
2. If you used **SQL/TypeScript update**: Just refresh the browser
3. The 3D view will automatically fetch the new positions from the database

**Note:** The `LandmarkManager3D` component fetches landmarks on mount, so a refresh is needed to see position changes.
