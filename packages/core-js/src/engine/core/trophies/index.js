/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine            **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis   **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

/**
 * @fileoverview Trophy/achievement system public surface.
 */

export { default as TrophyManager, TROPHY_STORAGE_PREFIX, TROPHY_RARITIES } from './TrophyManager.js';
export {
  TrophySyncProvider,
  LocalTrophySyncProvider,
  SvrnHubTrophySyncProvider,
  SvrnHubTrophySyncNotAvailableError,
} from './sync.js';
