const MIDI_CONTENT_TYPE = 'audio/midi';
const XM_CONTENT_TYPE = 'audio/xm';
const SID_CONTENT_TYPE = 'audio/prs.sid';
const MUSIC_TRACK_PATH_PREFIX = 'music-track-';
const MUSIC_TRACK_PATH_REGEXP = new RegExp(MUSIC_TRACK_PATH_PREFIX + '.*');
const MUSIC_TRACK_INDEX_REGEXP = /\d+$/;
const MUSIC_TRACKS_PATH = './assets/music/tracks.zip';
const MIDI_FILE_EXTENSION = '.mid';
const XM_FILE_EXTENSION = '.xm';
const SID_FILE_EXTENSION = '.sid';
const MUSIC_FILE_CONTENT_TYPES = [
  { extension: MIDI_FILE_EXTENSION, type: MIDI_CONTENT_TYPE },
  { extension: XM_FILE_EXTENSION, type: XM_CONTENT_TYPE },
  { extension: SID_FILE_EXTENSION, type: SID_CONTENT_TYPE },
];

export {
  MIDI_CONTENT_TYPE,
  XM_CONTENT_TYPE,
  SID_CONTENT_TYPE,
  MUSIC_TRACK_PATH_PREFIX,
  MUSIC_TRACK_PATH_REGEXP,
  MUSIC_TRACK_INDEX_REGEXP,
  MUSIC_TRACKS_PATH,
  MUSIC_FILE_CONTENT_TYPES,
};
