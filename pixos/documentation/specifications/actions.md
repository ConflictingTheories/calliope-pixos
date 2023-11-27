# Pixospritz - Actions Specification

## Introduction
Actions represent the core interactions which happen within the games or scenes. These are effectively the logical things which can be done in standard way.

There are a core set of supported actions which form the main set of logic for the Pixospritz experiences, however, there is the possibility for extended functionality in unofficial players which could support extra actions.

Actions are different from triggers and callbacks in that they are pretermined functionality of the game engine.

The currently supported actions are as follows:

- `animate`
- `changezone`
- `chat`
- `dance`
- `face`
- `greeting`
- `interact`
- `move`
- `patrol`
- `prompt`
- `script`

## Planning Notes

There are a number of ways which the actions can be extended. One such idea is to provide additional hooks which can be used for a variety of control mechanisms as well as ways of linking, chaining, and cleaning up more complex actions.

Currently there are two basic hooks:
- init(): runs once during the life-cycle of the action - establishes setup configuration

- tick(): runs once every frame and performs the necessary logic to update and perform the desired action. It is necessary to track state within the flow of this function and it is run an indefinite number of times within the lifecycle of an action making it imperative that it can handle the various situations itself.

Some potential future hooks could look like:

- end(): Runs at the end of an action's lifecycle. This hook would provide a standard place to add cleanup code and handle state transfer. This would be run in all cases where the action completed.

- pause(): Runs during a pause event - triggering a potential cleanup, save situation, or graceful shutdown depending on the situation at hand

- resume(): During the resumption from a paused event, it can be used to restore state, reestablish variables, and restore memory.

- success(): Runs at the end of the action assuming a successful completion. Many actions may have nothing to perform, but in some complex actions or nested actions, there may be additional logic run such as broadcasting to its parent task, or cleaning up temporary changes.

- error(): Runs during an error event - triggering a potential exception handler, a fallback, or cleanup process

- cancel(): During long running, or more involved actions such as dialogue or situations involving nested menus, it may be desirable to cancel the parent or child actions and to gracefully handle all necessary cleanup logic associated with it.

By having standard hooks as opposed to purely custom internal methods and state management, some of the control logic can be moved to a higher level and abstracted out of the implementation, additionally, cross-channel communication will be more consistent, and errors should in theory be easier to address.

## Format & Template

## Tips