// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.36
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { CircleEntity } from './CircleEntity'

export class Player extends CircleEntity {
    @type("string") public name!: string;
    @type("string") public color!: string;
    @type("number") public velocityX!: number;
    @type("number") public velocityY!: number;
    @type("number") public score!: number;
}
