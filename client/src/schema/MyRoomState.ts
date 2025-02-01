// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.36
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { Player } from './Player'
import { CircleEntity } from './CircleEntity'
import { Tile } from './Tile'

export class MyRoomState extends Schema {
    @type({ map: Player }) public players: MapSchema<Player> = new MapSchema<Player>();
    @type(CircleEntity) public bubble: CircleEntity = new CircleEntity();
    @type([ Tile ]) public tiles: ArraySchema<Tile> = new ArraySchema<Tile>();
    @type(CircleEntity) public collectible: CircleEntity = new CircleEntity();
}
