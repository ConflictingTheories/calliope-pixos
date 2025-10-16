-- Tactics mode input handler
return function(time, params)
  local consumed = false
  local inputManager = engine.inputManager

  if inputManager:isActionActive('camera_rotate_left') then
    engine.renderManager.camera:panCW(0.02)
    consumed = true
  end

  if inputManager:isActionActive('camera_rotate_right') then
    engine.renderManager.camera:panCCW(0.02)
    consumed = true
  end

  return consumed
end
