"use strict";
var potaKnow;

function gameLoaded() {}; // function called when the game is created
function updateCycle() {};
var backSound;

window.onload = function() {

  // -----------------------------------------------------------------------
  // --------------------------------------------------------- INIT --------

  const TARGET_WIDTH = Math.floor(1920 / 2 * 0.9);
  const CELL_SIZE = 64;
  const HUD_CELL_SIZE = 64;

  // -- info potager
  const POTAGER_COLS = 7;
  const POTAGER_ROWS = 5;

  const tCOLS = POTAGER_COLS + 2 + 3
  const tROWS = POTAGER_ROWS + 2 + 2

  // -- game size
  const width = (tCOLS) * CELL_SIZE;
  const height = (tROWS) * CELL_SIZE;

  // -- models
  var potaGen = new PotaGen(POTAGER_COLS, POTAGER_ROWS);
  var potaTool = new PotaTool(potaGen);

  var queue = async.queue(function(str, func) {
    if(queue.length()>0)
        str += '...'
    talkerInfos.context = str
    if (talker != null)
      talker.destroy()
    talker = new Phasetips(game, talkerInfos)
    talker.showTooltip()
    let lRate = Math.min(Math.floor((str.length/110)*9),8)+1
    console.log('0'+lRate+'-Old man speaking about life')
    oldTractorSpeacker.play('0'+lRate+'-Old man speaking about life');
    tractorSpeak()

    setTimeout(func, str.length * 60);

  }, 1);

  var lastStr = '';
  function speak(str) {
    if(queue.length()==0)
        lastStr = ''
    if(lastStr != str)
        queue.push(str)
    lastStr = str
  }

  function doneSpeaking(func) {
    if (queue.length() == 0)
      func.call(potaKnow)
    else
      queue.drain = function() {
        func.call(potaKnow)
        queue.drain = function() {}
      }
  }

  function newTask(str)
  {
    currentTaskInfos.context = str
    if (currentTask != null)
      currentTask.destroy()
    currentTask = new Phasetips(game, currentTaskInfos)
    currentTask.showTooltip()
  }

  potaKnow = new PotaKnow(potaGen, potaTool, speak, doneSpeaking, newTask);
  potaGen.register('phaser', null, potager_update)

  updateCycle = function(){potaGen.newCycle.call(potaGen)}

  potaKnow.register(function(){
    taskDoneSpeacker.play()
  });

  // -----------------------------------------------------------------------
  // --------------------------------------------------- POTAUPDATE --------
  function potager_update(event) {

    let audioMap = {
        'dig':'dig',
        'bury':'bury',
        'water':'water',
        'plant':'pickedPlant',
        'pickedPlant':'pickedPlant',
    }

    console.log(event)
    let x = event.x;
    let y = event.y;
    let type = event.type;
    let durt = event.durt;
    let plant = event.plant;
    let water = durt.water

    if(audioMap.hasOwnProperty(type))
    {
        game.sound.play(audioMap[type])
    }

    if (type == 'dig' || type == 'bury') {
      let ret = createHoles(potaGen, x, y, [])

      if (plant.name != 'NO PLANT') {
        drawPlant(plant,durt,x,y)
      }
    }
    else if (type == 'plant' || type=='grow' || type=='pickedPlant') {
        drawPlant(plant,durt,x,y)
    }
    else if(type=='cordeau')
        createCordeau(potaGen, x, y, [])
    /*
    else if(type == 'water')
    {
        let mouille = game.add.graphics()
        mouille.beginFill(0x000000,water/4)
        mouille.drawCircle(0,0,CELL_SIZE)
        let tex = mouille.generateTexture()
        game.add.sprite((x+1)*CELL_SIZE,(y+1)*CELL_SIZE,tex)
    }*/
  }
  // -----------------------------------------------------------------------
  // ------------------------------------------------------ SETTILE --------
  function drawPlant(plant,durt,x,y)
  {
    if(plant.name == 'NO PLANT')
    {
        setRacine(-1, x, y)
        setFruit(-1,x,y)
        setPlante(-1, x, y)
        return
    }
    var seedMap = {
      potato: racines_patate_0,
      seed: racines_seed_0,
    }

    var doneSeedMap = {
        potato:1,
        seed:3,
    }

    var planteMap = {
        plante:[0,1,2],
        feuille:[0,4],
        tige:[0,3],
    }

    let fruitMap = {
        tomato:0
    }

    let grow = plant.grow
    let plantName = plant.plant

    let seed = seedMap[plant.seed];
    let seedDone = doneSeedMap[plant.seed];
    let seeSeed = durt.level >= plant.level
    if (seeSeed)
        if(plant.grow == 1)
            setRacine(seedDone, x, y)
        else
            setRacine(seed, x, y)
    else
      setRacine(-1, x, y)

    let plante = planteMap[plantName]
    let mapId = Math.floor(grow*(plante.length-1))
    let planteId = plante[mapId]
    setPlante(planteId, x, y)

    if(plant.hasOwnProperty('fruit') && plant.grow == 1)
    {
        let fruit = plant.fruit
        let fruitId = fruitMap[fruit]
        setFruit(fruitId,x,y)
    }
  }
  // ---------------------------------
  function createHoles(potaGen, x, y, forget) {
    if (x < 0 || y < 0 || x > POTAGER_COLS - 1 || y > POTAGER_ROWS - 1)
      return false;

    let myIndex = x + y * POTAGER_COLS;

    if (forget.indexOf(myIndex) > -1)
      return potaGen.durt.xy_map[x][y].level == DEEP_LEVEL;

    setTranche(-1, x, y)

    forget.push(myIndex);
    let left = createHoles(potaGen, x - 1, y, forget);
    let right = createHoles(potaGen, x + 1, y, forget);
    let up = createHoles(potaGen, x, y - 1, forget);
    let down = createHoles(potaGen, x, y + 1, forget);

    if (potaGen.durt.xy_map[x][y].level != DEEP_LEVEL) {
      setTranche(-1, x, y)
      setTrou(potaGen.durt.xy_map[x][y].level + 1, x, y)
      return false
    } else {
      setTrou(-1, x, y)
    }

    if (!(left || right || up || down)) {
      setTrou(trous_deep, x, y)
    } else if (left && right && up && down) {
      setTranche(tranche_x, x, y)
    } else if (left && right && up) {
      setTranche(tranche_t_up, x, y)
    } else if (left && right && down) {
      setTranche(tranche_t_down, x, y)
    } else if (left && up && down) {
      setTranche(tranche_t_left, x, y)
    } else if (right && up && down) {
      setTranche(tranche_t_right, x, y)
    } else if (down && right) {
      setTranche(tranche_l_down, x, y)
    } else if (left && down) {
      setTranche(tranche_l_left, x, y)
    } else if (up && right) {
      setTranche(tranche_l_right, x, y)
    } else if (up && left) {
      setTranche(tranche_l_up, x, y)
    } else if (up && down) {
      setTranche(tranche_h_up, x, y)
    } else if (left && right) {
      setTranche(tranche_h_left, x, y)
    } else if (left) {
      setTranche(tranche_left, x, y)
    } else if (right) {
      setTranche(tranche_right, x, y)
    } else if (up) {
      setTranche(tranche_up, x, y)
    } else if (down) {
      setTranche(tranche_down, x, y)
    }
    return true;
  }

  function createCordeau(potaGen, x, y, forget) {
    if (x < 0 || y < 0 || x > POTAGER_COLS - 1 || y > POTAGER_ROWS - 1)
      return false;

    let myIndex = x + y * POTAGER_COLS;

    if (forget.indexOf(myIndex) > -1)
      return potaGen.cordeau.xy_map[x][y] == 'cordeau';

    setCordeau(-1, x, y)

    forget.push(myIndex);
    let left = createCordeau(potaGen, x - 1, y, forget);
    let right = createCordeau(potaGen, x + 1, y, forget);
    let up = createCordeau(potaGen, x, y - 1, forget);
    let down = createCordeau(potaGen, x, y + 1, forget);

    if (potaGen.cordeau.xy_map[x][y] != 'cordeau') {
      setCordeau(-1, x, y)
      return false
    }

    if (!(left || right || up || down)) {
      setCordeau(tranche_x, x, y)
    } else if (left && right && up && down) {
      setCordeau(tranche_x, x, y)
    } else if (left && right && up) {
      setCordeau(tranche_t_up, x, y)
    } else if (left && right && down) {
      setCordeau(tranche_t_down, x, y)
    } else if (left && up && down) {
      setCordeau(tranche_t_left, x, y)
    } else if (right && up && down) {
      setCordeau(tranche_t_right, x, y)
    } else if (down && right) {
      setCordeau(tranche_l_down, x, y)
    } else if (left && down) {
      setCordeau(tranche_l_left, x, y)
    } else if (up && right) {
      setCordeau(tranche_l_right, x, y)
    } else if (up && left) {
      setCordeau(tranche_l_up, x, y)
    } else if (up && down) {
      setCordeau(tranche_h_up, x, y)
    } else if (left && right) {
      setCordeau(tranche_h_left, x, y)
    } else if (left) {
      setCordeau(tranche_left, x, y)
    } else if (right) {
      setCordeau(tranche_right, x, y)
    } else if (up) {
      setCordeau(tranche_up, x, y)
    } else if (down) {
      setCordeau(tranche_down, x, y)
    }
    return true;
  }

  function setTile(map, tileId, x, y, layer) {
    if (tileId == -1) {
      map.removeTile(x, y, layer)
      return
    }
    map.putTile(tileId, x, y, layer)
  }

  function setTranche(tileId, x, y) {
    setTile(tranchesMap, tileId, x + 1, y + 1, tranchesLayer)
  }

  function setTrou(tileId, x, y) {
    setTile(trousMap, tileId, x + 1, y + 1, trousLayer)
  }

  function setRacine(tileId, x, y) {
    setTile(racinesMap, tileId, x + 1, y + 1, racinesLayer)
  }

  function setPlante(tileId, x, y) {
    setTile(plantesMap, tileId, x + 1, y + 1, plantesLayer)
  }

  function setCordeau(tileId, x, y) {
    setTile(cordeauMap, tileId, x + 1, y + 1, cordeauLayer)
  }

  function setFruit(tileId, x, y) {
    setTile(fruitsMap, tileId, x + 1, y + 1, fruitsLayer)
  }

  function tractorBreath() {
    tractorBreathAnim.play(15, true);
    speakCount = 0;
  }

  var speakCount = 0
  function tractorSpeak() {
    if (speakCount < 5) {
      speakCount++;
      tractorSpeakAnim.play();
      tractorSpeakAnim.onComplete.add(tractorSpeak)
    } else
      tractorBreath()
  }

  // -----------------------------------------------------------------------
  // --------------------------------------------------------- GAME --------

  var game = new Phaser.Game(width, height, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

  // -----------------------------------------------------------------------
  // ----------------------------------------------------- PRE-LOAD --------
  // -------------------
  function preload() {
    /*
    game.canvas.oncontextmenu = function(e) { e.preventDefault(); }

    game.load.spritesheet('trous_32x32', 'assets/trous.png',32,32);
    game.load.image('tools_64x64', 'assets/outils.png');

    game.load.spritesheet('pepper', 'assets/Pepper.png', 24, 32);
    game.load.spritesheet('carrot', 'assets/Carrot.png', 24, 32);
    */

    game.canvas.oncontextmenu = function(e) { e.preventDefault(); }
    // SPRITE OUTILS
    game.load.spritesheet('outils', 'assets/outils.png', CELL_SIZE, CELL_SIZE);
    // SPRITE POTAGER
    game.load.spritesheet('fences', 'assets/fences.png', CELL_SIZE, CELL_SIZE);
    game.load.spritesheet('tranches', 'assets/tranches.png', CELL_SIZE, CELL_SIZE);
    // SPRITE TROUS
    game.load.spritesheet('trous', 'assets/trous.png', CELL_SIZE, CELL_SIZE);
    // SPRITE ROOT
    game.load.spritesheet('racines', 'assets/racines.png', CELL_SIZE, CELL_SIZE);
    // SPRITE PLANTE
    game.load.spritesheet('plantes', 'assets/plantes.png', CELL_SIZE, CELL_SIZE);
    // SPRITE INFOPLANTE
    game.load.spritesheet('fruits', 'assets/fruits.png', CELL_SIZE, CELL_SIZE);
    // SPRITE EAU
    game.load.spritesheet('tractorAnim', 'assets/tractorAnim.png', CELL_SIZE, CELL_SIZE);

    game.load.spritesheet('cordeau', 'assets/cordeau.png', CELL_SIZE, CELL_SIZE);

    game.load.audio('dig','assets/sound/dig.mp3')
    game.load.audio('bury','assets/sound/bury.mp3')
    game.load.audio('water','assets/sound/water.mp3')
    game.load.audio('pickedPlant','assets/sound/pickedPlant.mp3')
    game.load.audio('taskDone','assets/sound/taskDone.mp3')

    // IMPORT OLD MAN SOUND
    game.load.audioSprite('old_tractor', 'assets/sound/oldMan/old_tractor.mp3', 'assets/sound/oldMan/old_tractor.json');

    game.load.audio('background','assets/sound/background.wav')


  }

  // -----------------------------------------------------------------------
  // ------------------------------------------------------- CREATE --------

  var outilsMap;
  var potagerMap;
  var tranchesMap;
  var trousMap;
  var racinesMap;
  var eauMap;
  var cordeauMap;
  var plantesMap;
  var fruitsMap;
  var tractorAnim;

  var outilsLayer;
  var monOutilLayer;
  var potagerLayer;
  var tranchesLayer;
  var trousLayer;
  var racinesLayer;
  var cordeauLayer;
  var plantesLayer;
  var fruitsLayer;

  var fences_up = 0;
  var fences_down = 1;
  var fences_left = 2;
  var fences_right = 3;
  var fences_up_left = 4;
  var fences_up_right = 5;
  var fences_down_left = 6;
  var fences_down_right = 7;
  var fences_terre = 8;
  var fences_herbe = 9;

  var tranche_left = 0;
  var tranche_right = 1;
  var tranche_up = 2;
  var tranche_down = 3;
  var tranche_t_left = 4;
  var tranche_t_right = 5;
  var tranche_t_up = 6;
  var tranche_t_down = 7;
  var tranche_l_left = 8;
  var tranche_l_right = 9;
  var tranche_l_up = 10;
  var tranche_l_down = 11;
  var tranche_h_left = 12;
  var tranche_h_up = 13;
  var tranche_x = 14;

  var trous_pile = 0;
  var trous_zero = 1;
  var trous_medium = 2;
  var trous_deep = 3;

  var racines_patate_0 = 0;
  var racines_patate_1 = 1;
  var racines_seed_0 = 2;
  var racines_seed_1 = 3;

  var plantes_grow_0 = 0;
  var plantes_grow_1 = 1;
  var plantes_grow_2 = 2;
  var plantes_tiges = 3;
  var plantes_feuilles = 4;

  var fruits_tomate = 0;

  var tractorBreathAnim;
  var tractorSpeakAnim;

  var talker;
  var talkerInfos;
  var currentTask;
  var currentTaskInfos;

  var oldTractorSpeacker;
  var taskDoneSpeacker;

  var marker;
  // -------------------
  function create() {

    backSound = game.add.audio('background',0.1,true)
    backSound.play()

    oldTractorSpeacker = game.add.audioSprite('old_tractor');
    oldTractorSpeacker.allowMultiple = true;

    taskDoneSpeacker = game.add.sound('taskDone');
    taskDoneSpeacker.allowMultiple = false;
    taskDoneSpeacker.volume = 0.3;
    // -- MAPS
    potagerMap = game.add.tilemap(null, CELL_SIZE, CELL_SIZE);
    potagerMap.addTilesetImage('fences');
    potagerLayer = potagerMap.create(
      'potager', tCOLS, tROWS, CELL_SIZE, CELL_SIZE);

    tranchesMap = game.add.tilemap(null, CELL_SIZE, CELL_SIZE);
    tranchesMap.addTilesetImage('tranches');
    tranchesLayer = tranchesMap.create(
      'tranches', POTAGER_COLS + 2, POTAGER_ROWS + 3, CELL_SIZE, CELL_SIZE);

    trousMap = game.add.tilemap(null, CELL_SIZE, CELL_SIZE);
    trousMap.addTilesetImage('trous');
    trousLayer = trousMap.create(
      'trous', POTAGER_COLS + 2, POTAGER_ROWS + 2, CELL_SIZE, CELL_SIZE);

    racinesMap = game.add.tilemap(null, CELL_SIZE, CELL_SIZE);
    racinesMap.addTilesetImage('racines');
    racinesLayer = racinesMap.create(
      'racines', POTAGER_COLS + 2, POTAGER_ROWS + 2, CELL_SIZE, CELL_SIZE);

    cordeauMap = game.add.tilemap(null, CELL_SIZE, CELL_SIZE);
    cordeauMap.addTilesetImage('cordeau');
    cordeauLayer = cordeauMap.create(
      'cordeau', POTAGER_COLS + 2, POTAGER_ROWS + 2, CELL_SIZE, CELL_SIZE);

    plantesMap = game.add.tilemap(null, CELL_SIZE, CELL_SIZE);
    plantesMap.addTilesetImage('plantes');
    plantesLayer = plantesMap.create(
      'plantes', POTAGER_COLS + 2, POTAGER_ROWS + 2, CELL_SIZE, CELL_SIZE);

    fruitsMap = game.add.tilemap(null, CELL_SIZE, CELL_SIZE);
    fruitsMap.addTilesetImage('fruits');
    fruitsLayer = fruitsMap.create(
      'fruits', POTAGER_COLS + 2, POTAGER_ROWS + 2, CELL_SIZE, CELL_SIZE);

    outilsMap = game.add.tilemap(null, CELL_SIZE, CELL_SIZE);
    outilsMap.addTilesetImage('outils');
    outilsLayer = outilsMap.create(
      'outils', tCOLS, tROWS, CELL_SIZE, CELL_SIZE);

    tractorAnim = game.add.sprite(CELL_SIZE * (POTAGER_COLS + 2.5), CELL_SIZE * POTAGER_ROWS, 'tractorAnim');
    tractorAnim.smoothed = false
    tractorAnim.scale.setTo(1.5);
    tractorBreathAnim = tractorAnim.animations.add('breath', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 15);
    tractorSpeakAnim = tractorAnim.animations.add('speak', [14, 15, 16, 17], 10);

    marker = game.add.graphics();
    marker.lineStyle(2, 0x000000, 1);
    marker.drawRect(0, 0, 64, 64);

    // -- Setup tools
    for (let k in potaTool.tool) 
      if(parseInt(k)!=4)
        outilsMap.putTile(k, parseInt(k) + 1, POTAGER_ROWS + 2, outilsLayer)

    // -- Setup potager
    for (let i = 0; i < POTAGER_COLS + 2; ++i) {
      for (let j = 0; j < POTAGER_ROWS + 2; ++j) {
        let tileId = fences_terre;
        if (i == 0)
          if (j == 0)
            tileId = fences_up_left;
          else if (j == POTAGER_ROWS + 1)
          tileId = fences_down_left;
        else
          tileId = fences_left;
        else if (i == POTAGER_COLS + 1)
          if (j == 0)
            tileId = fences_up_right;
          else if (j == POTAGER_ROWS + 1)
          tileId = fences_down_right;
        else
          tileId = fences_right;
        else if (j == 0)
          tileId = fences_up;
        else if (j == POTAGER_ROWS + 1)
          tileId = fences_down;
        potagerMap.putTile(tileId, i, j, potagerLayer)
      }
    }
    for (let j = POTAGER_ROWS + 2; j < tROWS; ++j) {
      for (let i = 0; i < tCOLS; ++i) {
        potagerMap.putTile(fences_herbe, i, j, potagerLayer)
      }
    }
    for (let i = POTAGER_COLS + 2; i < tCOLS; ++i) {
      for (let j = 0; j < tROWS; ++j) {
        potagerMap.putTile(fences_herbe, i, j, potagerLayer)
      }
    }

    tractorBreath();

    game.input.addMoveCallback(updateMarker, this);

    talkerInfos = {
      context: "BANDE DE CONS",
      font: "Comic sans ms",
      fontSize: 24,
      width: 180,
      fontStroke: "#cec3a4",
      fontFill: "#cec3a4",
      backgroundColor: 0x8a3c32,
      strokeColor: 0x8a3c32,
      strokeWeight: 5,
      roundedCornersRadius: 10,
      targetObject: tractorAnim,
      disableInputEvents: true,
      alwaysOn: true
    }

    currentTaskInfos = {
      context: "BANDE DE CONS",
      font: "Comic sans ms",
      fontSize: 15,
      width: 180,
      fontStroke: "#cec3a4",
      fontFill: "#cec3a4",
      backgroundColor: 0x005511,
      strokeColor: 0x005511,
      strokeWeight: 5,
      roundedCornersRadius: 0,
      y: CELL_SIZE*(tROWS-2),
      x: CELL_SIZE*(POTAGER_COLS+1),
      disableInputEvents: true,
      alwaysOn: true
    }

    gameLoaded();
  }

  // -----------------------------------------------------------------------
  // ------------------------------------------------------- UPDATE --------
  function updateMarker(pointer, x, y, isClick) {
    let tileX = potagerLayer.getTileX(game.input.activePointer.worldX);
    let tileY = potagerLayer.getTileY(game.input.activePointer.worldY);

    if (monOutilLayer != null) {
      monOutilLayer.x = x + CELL_SIZE / 5
      monOutilLayer.y = y - CELL_SIZE / 2
    }

    marker.x = tileX * CELL_SIZE;
    marker.y = tileY * CELL_SIZE;

    if (isClick) {
      let click = 0;
      if (pointer.leftButton.isDown)
        click = 1;
      if (pointer.rightButton.isDown)
        click = 2;

      var toolSelection = outilsMap.getTile(
        outilsLayer.getTileX(tileX * 64),
        outilsLayer.getTileY(tileY * 64), outilsLayer)

      if (toolSelection != null) {
        let id = parseInt(toolSelection.index)
        if (monOutilLayer == null) {
          monOutilLayer = game.add.sprite(0, 0, 'outils');
          monOutilLayer.scale.setTo(0.7);
          monOutilLayer.smoothed = false
        }
        monOutilLayer.frame = id
        let tool = potaTool.setTool(id)
      } else if (tileX > 0 && tileY > 0 &&
        tileX < POTAGER_COLS + 1 && tileY < POTAGER_ROWS + 1) {
        let act = potaTool.use(tileX - 1, tileY - 1, click);
      }
    }
  }

  // -----------------------------------------------------------------------
  // ------------------------------------------------------- UPDATE --------

  function update() {

  }
}
