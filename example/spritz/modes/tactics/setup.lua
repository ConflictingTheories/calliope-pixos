-- Setup for 'tactics' mode: register handlers for a simple turn-based skeleton

pixos.register_mode('tactics', {
	picker = true,

	setup = function(params)
		pixos.log('tactics: setup called')
		-- params may include an initial turn order or rules
		-- place a cursor or menu if needed (game can create HUD elements separately)
	end,

	update = function(time, params)
		-- tactics update can be used to run a turn state-machine implemented in Lua
		-- by default do nothing; game scripts should implement the actual loop
	end,

	teardown = function(params)
		pixos.log('tactics: teardown')
	end,

	on_select = function(zone, row, cell, type, params)
		-- consume selection and log for demo
		pixos.log('tactics:on_select', { zone = zone.id, row = row, cell = cell, type = type })
		-- Emit flame particles at the selected position
		local pos = {row, cell, 1}  -- Assuming tile position, adjust z as needed
		if type == 'tile' then
			pixos.emit_particles(pos, { preset = 'flame', count = 20, life = 2000 })
		elseif type == 'sprite' then
			-- For sprite, use sprite position
			pos = {row.pos.x, row.pos.y, row.pos.z}
			pixos.emit_particles(pos, { preset = 'flame', count = 20, life = 2000 })
		elseif type == 'object' then
			-- For object, use object position
			pos = {row.pos.x, row.pos.y, row.pos.z}
			pixos.emit_particles(pos, { preset = 'flame', count = 20, life = 2000 })
		end
		-- return true to indicate selection handled (prevents default behaviour)
		return true
	end,

	check_input = function(time, params)
		-- consume input and log for demo
		pixos.log('tactics:check_input', { params = params, time = time })
		-- return false to allow default input handling (pass through)
		return false
	end,
})

-- don't auto-set tactics as active unless requested by game script
