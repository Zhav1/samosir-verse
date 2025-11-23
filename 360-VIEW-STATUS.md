# 360 View - Current Status & Fixes

## ✅ What I Just Fixed:

1. **FilterSidebar visibility** - Made sure it appears on top with `z-50`
2. **Layout improvements** - Used absolute positioning to prevent overlap
3. **Debug info** - Added node status display (top-right corner)

## 🔍 Why You're Seeing a White/Black Screen:

Your database nodes are using **placeholder panorama URLs**:
```
https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg
```

This is a demo 360° image, so when you click a landmark and enter 360 view:
1. ✅ Transition fades to white (working as intended)
2. ✅ PanoramaViewer loads 
3. ⚠️ Shows placeholder 360° sphere or loading spinner
4. ✅ FilterSidebar should NOW be visible on the left

## 📸 About the Sigale-gale Picture:

You mentioned you added `sigale-gale.jpg` to `public/models/`. To use it:

### For Product Cards (Marketplace):
The food landmarks need images at these paths:
- `/images/arsik.jpg`
- `/images/naniura.jpg` 
- etc.

### For 360 Panoramas:
You need **equirectangular 360° photos** (2:1 ratio), not regular photos.
Place them in `/public/panoramas/` and update your database:

```sql
UPDATE nodes 
SET panorama_url = '/panoramas/tomok-harbor.jpg',
    thumbnail_url = '/panoramas/tomok-harbor-thumb.jpg'
WHERE id = 'tomok-harbor';
```

## 🧪 How to Test Right Now:

1. **Refresh your browser** (the code changes should hot-reload)
2. **Click on a glowing landmark** in the 3D view
3. **Wait for camera animation** (3 seconds)
4. **Click "Enter 360° View"** button
5. **You should now see**:
   - FilterSidebar on the LEFT (purple/blue/orange/red/green categories)
   - Placeholder 360° sphere in the center
   - "Return to Sky View" button (top-left)
   - Debug info (top-right showing node name)

## 🎯 To Get Real 360 Views:

You need to either:
1. **Take 360° photos** with a 360 camera or phone app
2  **Download free 360° images** from:
   - https://www.flickr.com/groups/equirectangular/
   - https://polyhaven.com/hdris (HDRIs work too)
3. **Use AI to generate** 360° panoramas

Then upload to Supabase Storage or put in `/public/panoramas/`

## 📋 Current Flow (Working):

```
3D Sky View 
  ↓ (click landmark)
3D Focused View (camera zooms in)
  ↓ (click "Enter 360° View")
White Fade Transition
  ↓
360 Panorama View + FilterSidebar ← YOU ARE HERE
```

The flow is correct according to Agents.md!
