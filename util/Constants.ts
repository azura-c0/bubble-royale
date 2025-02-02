// PLAYER SETTINGS
export const PLAYER_FRICTION = 0.9997;
export const PLAYER_ACCELERATION = 0.008;
export const PLAYER_RADIUS = 14;
export const PLAYER_MAX_VELOCITY = 0.3;
export const PLAYER_OXYGEN_RATE = 1;

// PLAYER BOOST SETTINGS
export const BOOST_FRICTION = 0.9997;
export const BOOST_ACCELERATION = 0.009;
export const BOOST_MAX_VELOCITY = 0.4;
export const BOOST_MAX = 300;
export const BOOST_INCREASE = 50;

// TILES AND STRUCTURES
export const TILE_SIZE = 32;
export const STRUCTURE_QTY = 30;
export const STRUCTURES: string[][] = [
  ["aa   aa",
   "ax    a",
   "a     a",
   "a   x a",
   "ax    a",
   "aa   aa"],

  ["aaa aaa",
   "ax    a",
   "a     a",
   "a   x a",
   "a     a",
   "aa   aa"],

  ["ax  a",
   "a   a",
   "aaa a"],


  [" a ",
   "aaa",
   " a "],

  ["a  a",
   "a  a",
   "ax a"],

  ["a aaa",
   "axxxa",
   "aaa a"],

  ["x"]
]

// BUBBLE SETTINGS
export const MAX_BUBBLE_RADIUS = 800;
export const BUBBLE_SHRINK_RATE = 0.9997;
export const BUBBLE_SPEED = 1.8;
export const BUBBLE_STATE_CHANGE_INTERVAL = 10000;

export const SCREEN_WIDTH = 1024;
export const SCREEN_HEIGHT = 768;

// WORLD SETTINGS
export const WORLD_WIDTH = SCREEN_WIDTH * 3;
export const WORLD_HEIGHT = SCREEN_HEIGHT * 3;
