GAMEPLAN.md — SpritzCut Integration and IDE Adaptation

Objective

Integrate the SpritzCut DSL Player into the Pixospritz Cutscene Manager and the editor, ensuring full compatibility with the existing engine and React-based IDE. The goal is to provide seamless cutscene scripting, typewriter effects, cutins, and speed controls while preserving engine modularity.

⸻

1. Core Engine Updates (ADD SUPPORT FOR PARSING THE SPRITZ CUTSCENES FROM THE CUSTOM FORMAT (Pixocut .pxc) - AND ALLOW THEM TO BE REFERENCED AND LOADED EASILY VIA Pixoscript .pxs)

1.1 Refactor CutscenePlayer
	•	Convert CutscenePlayer to a modular class suitable for React context.
	•	Add getSpeed() hook to dynamically read speed from state.
	•	Separate resource management (_resourceMap) from UI updates.
	•	Integrate with engine’s event queue to support parallel/sequential execution.
	•	Replace direct DOM manipulations with virtualized updates to allow React bindings.

1.2 Event System Enhancement
	•	Ensure all event types (dialogue, cutin, backdrop, action, hook, transition, wait, waitInput) are fully typed.
	•	Add support for asynchronous and parallel events with Promise.all in parallel groups.
	•	Add proper cancelation handling to abort cutscene mid-play (stop() logic).

1.3 Typewriter and Speed Control
	•	Refactor _typewriter to accept speed from external state (hook into React slider).
	•	Add punctuation-based delays dynamically.
	•	Implement smooth acceleration/deceleration of text rendering.

1.4 Cutin and Portrait Handling
	•	Ensure cutins overlay properly without breaking layout.
	•	Transition and animation should be CSS-driven, with configurable easing.
	•	Portrait and cutin images should use engine’s texture loader instead of inline data: URLs.
	•	Support multi-character simultaneous dialogue via parallel event groups.

1.5 Resource Preloading
	•	Replace demo SVG/audio mapping with engine asset pipeline.
	•	Add lazy loading for large assets.
	•	Ensure assets are reused across scenes to avoid memory spikes.

1.6 Transitions
	•	Standardize fadeOutBackdrop, wipe, and future transitions using engine-wide animation utilities.
	•	Ensure non-blocking vs blocking behavior is respected.

⸻

2. Editor Integration (React IDE)

2.1 Component Structure
	•	SpritzCutEditor
	•	Props: initialScript, onPlay, onStop, speed
	•	State: scriptText, speed
	•	Contains textarea, speed slider, and Play/Stop buttons.
	•	CutscenePreview
	•	Props: sceneData, speed
	•	Renders preview via virtualized DOM or canvas.
	•	CutsceneControls
	•	Reusable speed slider, play/skip, and timeline scrubber (future).

2.2 Wiring Player
	•	Connect SpritzCutEditor to CutscenePlayer via React ref or context.
	•	Speed slider updates CutscenePlayer.getSpeed() dynamically.
	•	Play button triggers player.playScript(scriptText).
	•	Stop button triggers player.stop() and resets preview visuals.

2.3 Visual Layout and Styling
	•	Prevent overlaps by defining fixed HUD regions:
	•	Stage: center, fixed 16:9 ratio
	•	Portrait: bottom-left, always above stage
	•	Cutin: top overlay, scaled to avoid obscuring HUD
	•	DialogueBox: bottom-right, above stage and below cutin
	•	CSS transitions for opacity and transform.
	•	Make editor dockable or collapsible in IDE.

2.4 Script Parsing Feedback
	•	Highlight parsing errors inline.
	•	Optional: integrate live preview of parsed events.

⸻

3. Integration Steps
	1.	Refactor CutscenePlayer to remove inline DOM manipulations.
	2.	Connect player instance to React components via context or props.
	3.	Replace demo resource URLs with engine asset paths.
	4.	Wire speed slider to player via getSpeed().
	5.	Test all event types (dialogue, cutin, action, hook, transition, wait) in editor and runtime.
	6.	Ensure proper parallel event handling.
	7.	Implement cancelation and reset logic for Play/Stop.
	8.	Adjust CSS/layout to prevent overlap issues.
	9.	Add optional timeline scrubber and input wait overrides.
	10.	Document SpritzCut DSL conventions for team and IDE users.

⸻

4. Testing
	•	Unit tests for parser correctness.
	•	Snapshot tests for cutscene rendering.
	•	Performance tests for large scripts.
	•	Cross-browser rendering verification.
	•	React state and unmount cleanup tests.

⸻

5. Future Improvements
	•	Timeline view in editor.
	•	Drag-and-drop character/cutin placement.
	•	Audio integration with SFX cues.
	•	Export/import SpritzCut scripts.
	•	Multi-language localization support.
	•	Advanced cutin animations (slide, scale, opacity).

⸻

End of GAMEPLAN.md