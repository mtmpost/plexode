/**
 * @constructor
 */
function ExitPrefab(x, y, url) {
  this.x = x;
  this.y = y;
  this.url = url;
}

ExitPrefab.prototype.createSprites = function(vorp) {
  var r = Prefab.WALL_RADIUS * 1.5;
  var a = new ExitSprite(vorp.phy, new RectPainter("#0f0"),
      this.x, this.y, 0, 0, r, r, Infinity, Vorp.WALL_GROUP);
  a.setVorp(vorp);
  a.setUrl(this.url);
  return [a];
};
