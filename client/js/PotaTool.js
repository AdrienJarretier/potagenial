"use strict";

class PotaTool {

  constructor(potagen, playerPosition) {

    this.PLAYER_SPEED = 0.1;

    this.playerPosition = {

      x: playerPosition.x,
      y: playerPosition.y

    };

    this.potagen = potagen
    this.tool = []

    this.tool.push({
      name: 'transplantoir',
      options: {
        1: { durt: 1 },
        2: { durt: -1 }
      }
    })

    this.tool.push({
      name: 'arrosoir',
      options: {
        1: { water: 1 },
      }
    })

    this.tool.push({
      name: 'tomato',
      plant: {
        seed: 'seed',
        name: 'tomato'
      }
    })

    this.tool.push({
      name: 'potato',
      plant: {
        seed: 'potato',
        type: 'multiply',
        name: 'potato'
      }
    })

    this.tool.push({
      name: 'carrote',
      plant: {
        seed: 'carrote',
        type: 'multiply',
        name: 'carotte'
      }
    })
    this.curTool = null

  }

  setTool(id) {
    this.curTool = this.tool[id]
    return OK
  }

  use(x, y, option) {

    if (this.curTool == null)
      return BAD_TOOL

    var tool = this.curTool

    if (tool.hasOwnProperty('plant'))
      return this.potagen.plant(x, y, tool.plant)

    else if (tool.hasOwnProperty('options')) {

      if (!tool.options.hasOwnProperty(option))
        return NO_ACTION

      var option = tool.options[option]
      let durt = this.potagen.durt.xy_map[x][y]

      if (option.hasOwnProperty('durt'))
        return this.potagen.moveDurt(x, y, option.durt)

      if (option.hasOwnProperty('water'))
        return this.potagen.water(x, y)

    }

  }

  movePlayer(direction) {

    switch (direction) {
      case 'up':
        this.playerPosition.y -= this.PLAYER_SPEED;
        break;
      case 'down':
        this.playerPosition.y += this.PLAYER_SPEED;

        break;
      case 'left':
        this.playerPosition.x -= this.PLAYER_SPEED;

        break;

      case 'right':
        this.playerPosition.x += this.PLAYER_SPEED;

        break;
      default:
        break;
    }

  }

}
