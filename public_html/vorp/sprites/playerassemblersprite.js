/**
 * @constructor
 * @extends {Sprite}
 */
function PlayerAssemblerSprite(phy, painter, px, py, vx, vy, rx, ry, mass, group) {
  Sprite.call(this, phy, painter, px, py, vx, vy, rx, ry, mass, group, Infinity);
  
  /**
   * Spot where the player will be assembled
   */
  this.targetPos = new Vec2d(px, py);
}

PlayerAssemblerSprite.prototype = new Sprite();
PlayerAssemblerSprite.prototype.constructor = PlayerAssemblerSprite;
