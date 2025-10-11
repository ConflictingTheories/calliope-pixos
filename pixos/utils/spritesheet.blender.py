import bpy
import os
import math
import time

from PIL import Image

# build sprite sheet from individual sprite frames
def buildSpriteSheet(base_folder, character_name, action_folder, size):
    max_frames_row = size
    frames = []
    tile_width = 0
    tile_height = 0

    spritesheet_width = 0
    spritesheet_height = 0

    files = os.listdir(base_folder + "/" + action_folder + "/" + character_name )
    files.sort()

    # find sprite images
    for current_file in files :
        try:
            with Image.open(base_folder + "/" + action_folder + "/" + character_name + "/" + current_file) as im :
                frames.append(im.getdata())
        except:
            print(current_file + " is not a valid image")

    tile_width = frames[0].size[0]
    tile_height = frames[0].size[1]
    
    # determine ratio
    if len(frames) > max_frames_row :
        spritesheet_width = tile_width * max_frames_row
        required_rows = math.ceil(len(frames)/max_frames_row)
        spritesheet_height = tile_height * required_rows
    else:
        spritesheet_width = tile_width*len(frames)
        spritesheet_height = tile_height
    
    spritesheet = Image.new("RGBA",(int(spritesheet_width), int(spritesheet_height)))

    # combine frames
    for current_frame in frames :
        top = tile_height * math.floor((frames.index(current_frame))/max_frames_row)
        left = tile_width * (frames.index(current_frame) % max_frames_row)
        bottom = top + tile_height
        right = left + tile_width
        box = (left,top,right,bottom)
        box = [int(i) for i in box]
        cut_frame = current_frame.crop((0,0,tile_width,tile_height))
        spritesheet.paste(cut_frame, box)
    
    # save
    spritesheet.save(base_folder + '/' + action_folder + "/" + character_name + ".png", "PNG")


# render individual sprite frames
def render8directions_selected_objects(path):
    path = os.path.abspath(path)

    # get list of selected objects
    selected_list = bpy.context.selected_objects
    bpy.ops.object.select_all(action='TOGGLE')

    s = bpy.context.scene
    s.render.resolution_x = 64
    s.render.resolution_y = 64

    # loop all initial selected objects (which will likely just be one obect.. I haven't tried setting up multiple yet)
    for o in selected_list:
        
        bpy.context.scene.objects[o.name].select_set(True)
        scn = bpy.context.scene
        
        for a in bpy.data.actions:
            bpy.context.active_object.animation_data.action = bpy.data.actions.get(a.name)
            
            scn.frame_end = int(bpy.context.active_object.animation_data.action.frame_range[1])
            
            if (
                 a.name == "Run"
#                 or a.name == "Walk"
#                 or a.name == "SitDown"
#                 or a.name == "PickUp"
#                 or a.name == "StandUp"
#                 or a.name == "Jump"
#                 or a.name == "Defeat"
                ):
                
                #create folder for animation
                action_folder = os.path.join(path, a.name)
                if not os.path.exists(action_folder):
                    os.makedirs(action_folder)
                
                #loop through all 8 directions
                for angle in range(0, 360, 45):
                    if angle == 0:
                        angleDir = "S"
                    if angle == 45:
                        angleDir = "SW"
                    if angle == 90:
                        angleDir = "W"
                    if angle == 135:
                        angleDir = "NW"
                    if angle == 180:
                        angleDir = "N"
                    if angle == 225:
                        angleDir = "NE"
                    if angle == 270:
                        angleDir = "E"
                    if angle == 315:
                        angleDir = "SE"
                        
                    #set which angles we want to render.
                    if (
                        angle == 0
                        or angle == 45
                        or angle == 90
                        or angle == 135
                        or angle == 180
                        or angle == 225
                        or angle == 270
                        or angle == 315
                        ):
                        
                        #create folder for specific angle (not currently separate**)
                        animation_folder = os.path.join(action_folder, o.name)
                        if not os.path.exists(animation_folder):
                            os.makedirs(animation_folder)
                        
                        #rotate the model for the new angle
                        bpy.context.active_object.rotation_euler[2] = math.radians(angle)
            
                        #loop through and render frames.  Can set how "often" it renders.
                        #Every frame is likely not needed.  Currently set to 2 (every other).
                        count = 0
                        for i in range(s.frame_start,s.frame_end,1):
                            s.frame_current = i
                            count = count + 1
                            s.render.filepath = animation_folder + "/" + str(a.name) + "_" + str(angle).zfill(4) + "_" + str(angleDir) + "_" + str(s.frame_current).zfill(3)
                            
                            bpy.ops.render.render( #{'dict': "override"},
                                                  #'INVOKE_DEFAULT',  
                                                  False,            # undo support
                                                  animation=False, 
                                                  write_still=True
                                                 )
                            
                # Build Sprite Sheet from Animation Tiles and save in folder
                buildSpriteSheet(path, o.name, a.name, count)


render8directions_selected_objects('~/Pictures/sprites')

#buildSpriteSheet('/Users/src/Pictures/sprites','Character', 'Run')