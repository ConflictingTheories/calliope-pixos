# Pixospritz - Events Specification

## Introduction
Events are very similar to actions except that they are run outside of the core action queue and have their own queue. These tend to be functions which sometimes need to run during other actions or outside of the main flow.

The currently support Events are:

- `camera`
- `menu`
- `chat`

The purpose of the events is typically to control the scene outside of the direct players vicinity. This may occur during a cutscene for example, or it may be used to pause controls in order to ensure a particular series of events can play out, and it is also used to run async logic which could take some time or may be indefinite in nature. 

There are lots of areas which events will play a role, and while the above is limited, the future will likely include addiitonal support such as the following:
- network: Networking will be asynchronous in nature and will require that it occurs in its own loop. It will be necessary to have control over the game loop at times and will need to correlate state betwen the local events and those coming from the network. In order to ensure smooth order and that events are not mixed up, this cannot be part of the main loop.

- error: Error handling will likely need to be handled at a higher level and additional operations are best elevated up when they cannot be handled through the expected means. In order to recover from error events without catestrophic failure, a fault-tolerant system will need to reside outside the main game loop and will be needed to help catch exceptions and handle critical failures.

- storage: Anytime that storage is needed such as through saving, or other such events, we do not want to have that in the main game loop. These types of events will need to be setup in their own loop away from the core logic.

- Notifications: Both push, and local internal notifications should be handled through a separate thread from the main loop. THis will ensure that if it fails that it does not slow down the main game, and that it can be severed if necessary. Typically we want to move failures into their own isolated modules.

## Format & Template

## Tips