import { ClampLength, Vec2dLen } from "./Collision";
import { BOOST_FRICTION, BOOST_MAX_VELOCITY, PLAYER_FRICTION, PLAYER_MAX_VELOCITY } from "./Constants";

const FRICTION_PER_SECOND = PLAYER_FRICTION;

export function MovePlayer(player: { x: number, y: number, velocityX: number, velocityY: number }, dt: number, boosted: boolean): void {
  const maxVelocity = boosted ? BOOST_MAX_VELOCITY : PLAYER_MAX_VELOCITY;
  const playerFriction = boosted ? BOOST_FRICTION : PLAYER_FRICTION;
  const frictionRate = -Math.log(playerFriction);
  const clampVec = ClampLength([player.velocityX, player.velocityY], maxVelocity);

  const speed = Vec2dLen(clampVec);
  player.x += clampVec[0] * dt;
  player.y += clampVec[1] * dt;
  const friction = Math.exp(-frictionRate * dt);
  clampVec[0] *= friction;
  clampVec[1] *= friction;
  player.velocityX = clampVec[0];
  player.velocityY = clampVec[1];

}
