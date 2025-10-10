-- Setup script for 'explore' mode.
-- Registers 'explore' handlers and optionally sets as current mode if requested.

pixos.register_mode('explore', {
	setup = function(params)
		pixos.log('explore: setup called')
		-- default behaviour: focus camera on avatar if available
		local world = pixos.get_world()
		local avatar = world.spriteDict and world.spriteDict['avatar']
		if avatar and avatar.pos then
			pixos.set_camera()
		end
	end,

	update = function(time, params)
		-- No-op default update. Explore mode generally lets zone sprites and
		-- the world's input system handle movement/interactions. This stub can
		-- be expanded in game-specific scripts to add autopilot, hints, etc.
	end,

	teardown = function(params)
		pixos.log('explore: teardown')
	end,
})

-- Optionally make this the active mode when this setup is run
pixos.set_mode('explore')