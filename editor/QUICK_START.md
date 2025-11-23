# Quick Start Guide - Enhanced Pixospritz Editors

## Opening a Map in 3D

1. Load a Pixospritz package (`.zip`) using the Zip Manager sidebar
2. Navigate to `maps/` folder and select a `map.json` file
3. If the map references a tileset, the 3D editor will automatically load
4. You'll see a full 3D visualization of your map

## Using the 3D Map Editor

### Camera Controls
- **Rotate**: Left-click and drag
- **Pan**: Shift + left-click and drag
- **Zoom**: Scroll wheel
- **Reset**: Click "📷 Reset Camera" button

### Editing Tools

**Paint Tool (🖌️)**
- Select a tile from the dropdown
- Set the height value (default: 0)
- Click on cells in the 3D view to place tiles

**Erase Tool (🗑️)**
- Click on cells to remove tiles

**Pick Tool (🔍)**
- Click on existing tiles to select them for painting

### Saving
- Click "💾 Save Changes" to save your edits back to the package
- Use Undo (↶) and Redo (↷) to navigate edit history

## Using the 3D Geometry Editor

1. Navigate to a geometry file (usually in `tilesets/{name}/` folder)
2. If it contains triangle-based geometry, the 3D editor loads automatically
3. Select a geometry from the dropdown to view it in 3D

### Editing Geometry
- **Select Geometry**: Choose from the dropdown
- **Select Triangle**: Click on a triangle in the list to select it
- **Edit Vertices**: Use the X/Y/Z input fields to adjust vertex positions
- **Add Triangle**: Click "+ Add Triangle" to create new geometry
- **Remove**: Click "Remove" on a triangle to delete it
- **Wireframe**: Toggle to see edge outlines

### Camera Controls (same as Map Editor)
- Rotate, pan, zoom work identically
- View updates in real-time as you edit

## Data Structure Quick Reference

### Map Cell Data
- Each cell contains a tile name (e.g., "FLOOR", "N_WALL")
- Each cell has an optional height offset
- Special tile "EMPTY" means no tile rendered

### Tile Definitions
Format: `[geometry, texture, height, geometry, texture, height, ...]`

Example:
```json
"FLOOR": ["FLAT_ALL", "FLOOR", 0]
"N_WALL": ["WALL_T", "WALL", 2, "FLAT_ALL", "EMPTY_B", 2]
```

Each tile can have multiple geometry components stacked.

### Geometry Definitions
Format:
```json
{
  "GEOMETRY_NAME": {
    "vertices": [
      [[x1,y1,z1], [x2,y2,z2], [x3,y3,z3]],  // Triangle 1
      [[x1,y1,z1], [x2,y2,z2], [x3,y3,z3]]   // Triangle 2
    ],
    "surfaces": [
      [[u1,v1], [u2,v2], [u3,v3]],  // UV coords tri 1
      [[u1,v1], [u2,v2], [u3,v3]]   // UV coords tri 2
    ],
    "type": 15  // Collision bitmask (15 = all sides solid)
  }
}
```

### Texture Atlas Coordinates
Format: `[column, row]` in tiles (not pixels)

Example: `"FLOOR": [1, 1]` means the tile at column 1, row 1 in the atlas.

With 16px tiles and 512px atlas: position = [1*16, 1*16] = [16px, 16px]

## Tips & Tricks

### Map Editing
1. Use Pick tool to quickly select tiles from the map
2. Adjust height to create multi-level environments
3. Hold camera at an angle to better see 3D structure
4. Grid toggle helps align vision with cells

### Geometry Editing
1. Start with simple shapes (2 triangles for a quad)
2. Use wireframe mode to see triangle structure clearly
3. Keep normals pointing outward (counter-clockwise winding)
4. Use height offset in tiles (not geometry) for elevation

### Performance
- Large maps (>50x50) may render slower
- Complex geometry (>100 triangles) impacts preview speed
- Texture atlas loading happens once per map session

## Troubleshooting

### Map doesn't render in 3D
- Check that the map has a `tileset` property
- Verify the tileset file exists in `tilesets/{name}/tileset.json`
- Check console for loading errors

### Tiles appear as solid colors
- Texture atlas may not be loading
- Check `src` property in tileset.json
- Verify texture file exists in tileset folder

### Camera is too far/close
- Use Reset Camera button
- Scroll to zoom to comfortable distance

### Edits not saving
- Check that you clicked Save Changes button
- Verify you have write permissions to the package
- Check console for save errors

## Keyboard Shortcuts (via buttons)

- **Ctrl/Cmd + Z**: Undo (via Undo button)
- **Ctrl/Cmd + Shift + Z**: Redo (via Redo button)
- **Ctrl/Cmd + S**: Should trigger Save (if browser allows)

## Support

For issues or questions:
1. Check the console (F12) for error messages
2. Verify package structure matches expected format
3. See INTEGRATION_SUMMARY.md for detailed technical documentation
4. Check the example package at `/example/spritz` for reference

## Example Workflow

### Creating a New Map Area

1. Open existing map in 3D editor
2. Use Pick tool on existing floor tiles
3. Switch to Paint tool
4. Click cells to extend the floor
5. Select wall tiles from dropdown
6. Paint walls around the perimeter
7. Adjust heights for stairs or elevation
8. Save changes
9. Test in game engine

### Editing Geometry

1. Open tileset's geometry file
2. Select geometry to edit (e.g., "FLAT_ALL")
3. Click on triangle to select
4. Adjust vertex positions using number inputs
5. Observe real-time preview
6. Toggle wireframe to verify structure
7. Save changes
8. Reload map to see updated geometry

Happy editing! 🎮
