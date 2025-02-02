// PLAYER SETTINGS
export const PLAYER_FRICTION = 0.9997;
export const PLAYER_ACCELERATION = 0.008;
export const PLAYER_RADIUS = 14;
export const PLAYER_MAX_VELOCITY = 0.15;

// PLAYER BOOST SETTINGS
export const BOOST_FRICTION = 0.9997;
export const BOOST_ACCELERATION = 0.005;
export const BOOST_MAX_VELOCITY = 0.3;
export const BOOST_MAX = 300;
export const BOOST_INCREASE = 10;

// TILES AND STRUCTURES
export const TILE_SIZE = 32;
export const STRUCTURE_QTY = 30;
export const STRUCTURES: string[][] = [
  ["aa  a",
   "a   a",
   "a   a",
   "ax  a",
   "a   a",
   "aa  a"],

  ["a  a",
   "a  a",
   "ax a"],
]

// BUBBLE SETTINGS
export const MAX_BUBBLE_RADIUS = 800;
export const BUBBLE_SHRINK_RATE = 0.9999;
export const BUBBLE_SPEED = 1;
export const BUBBLE_STATE_CHANGE_INTERVAL = 10000;

export const SCREEN_WIDTH = 1024;
export const SCREEN_HEIGHT = 768;

// WORLD SETTINGS
export const WORLD_WIDTH = SCREEN_WIDTH * 3;
export const WORLD_HEIGHT = SCREEN_HEIGHT * 3;
