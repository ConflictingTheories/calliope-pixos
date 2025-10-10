-- Explore mode per-frame update (Lua). This can be minimal. The ModeManager will
-- call a registered update function (if any) each frame.

return function(time, params)
	-- stub: we could check player input or update simple look-at behaviour
	-- keep this lightweight to avoid blocking the engine update loop
	return
end