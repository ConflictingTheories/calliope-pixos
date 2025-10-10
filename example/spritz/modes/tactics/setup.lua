-- Setup for 'tactics' mode: register handlers for a simple turn-based skeleton

pixos.register_mode('tactics', {
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
})

-- don't auto-set tactics as active unless requested by game script