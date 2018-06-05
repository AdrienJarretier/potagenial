window.onload(function()
{
    
// -----------------------------------------------------------------------
// --------------------------------------------------------- INIT --------
    
    const TARGET_WIDTH = Math.floor(1920 / 2 * 0.9);
    const CELL_SIZE = 32;
    const HUD_CELL_SIZE = 64;
    const ASPECT_RATIO = 16 / 9;
    const COLS = Math.floor(TARGET_WIDTH / CELL_SIZE);
    const LIGS = Math.floor(COLS / ASPECT_RATIO);

    const HUD_COLS = Math.floor(TARGET_WIDTH / HUD_CELL_SIZE);
    const HUD_LIGS = Math.floor(HUD_COLS / ASPECT_RATIO);

    const width = COLS * CELL_SIZE;
    const height = LIGS * CELL_SIZE;

    var potaGen = new PotaGen(COLS, LIGS);
    var potaTool = new PotaTool(potaGen);
    var potaKnow = new PotaKnow(potaGen,potaTool,(str) => {
        console.log('say : ' + str);
    },(str) => {
        console.log('task changed : ' + str);
    });

    // -----------------------------------------------------------------------
    // --------------------------------------------------------- GAME --------

    var game = new Phaser.Game(width, height, Phaser.AUTO, '',
                    { preload: preload, create: create, update: update });

    // -----------------------------------------------------------------------
    // ----------------------------------------------------- PRE-LOAD --------
    
    var potagerMap;
    var outilsMap;
    var trousMap;
    var racinesMap;
    var plantesMap;
    var infoPlantesMap;
    // -------------------
    function preload()
    {
        /*
        game.canvas.oncontextmenu = function(e) { e.preventDefault(); }

        game.load.spritesheet('ground_32x32', 'assets/TileSet.png', 32, 32);
        game.load.spritesheet('trous_32x32', 'assets/trous.png',32,32);
        game.load.image('tools_64x64', 'assets/outils.png');

        game.load.spritesheet('pepper', 'assets/Pepper.png', 24, 32);
        game.load.spritesheet('carrot', 'assets/Carrot.png', 24, 32);
        */
        
        // SPRITE POTAGER
        // SPRITE OUTILS
        // SPRITE TROUS
        // SPRITE ROOT
        // SPRITE PLANTE
        // SPRITE INFOPLANTE
    }
    
    // -----------------------------------------------------------------------
    // ------------------------------------------------------- CREATE --------
    
    var potagerLayer;
    var outilsLayer;
    var trousLayer;
    var racinesLayer;
    var plantesLayer;
    var infoPlantesLayer;
    // -------------------
    function create()
    {
        game.world.setBounds(-width / 2, -height / 2, width * 2, height * 2);
      game.add.tileSprite(-width / 2, -height / 2, width * 2, height * 2, 'ground_32x32', 12);

      //  Creates a blank tilemap
      map = game.add.tilemap();

      toolsMap = game.add.tilemap(null, HUD_CELL_SIZE, HUD_CELL_SIZE);
        
      trouMap = game.add.tilemap(null,32,32);

      //  Add a Tileset image to the map
      map.addTilesetImage('ground_32x32');
      trouMap.addTilesetImage('trous_32x32');
        
      toolsMap.addTilesetImage('tools_64x64');
      trouMap.addTilesetImage('trous_32x32');

      //  Creates a new blank layer and sets the map dimensions.
      //  In this case the map is COLS x LIGS tiles in size and the tiles are CELL_SIZE x CELL_SIZE pixels in size.
      layer1 = map.create('level1', COLS, LIGS, CELL_SIZE, CELL_SIZE);
      trouLayer = trouMap.create('trou', COLS, LIGS, CELL_SIZE, CELL_SIZE);

      //  Our painting marker

      marker = game.add.graphics();
      marker.lineStyle(2, 0x000000, 1);
      marker.drawRect(0, 0, 32, 32);

      game.input.addMoveCallback(updateMarker, this);


      map.fill(0, 0, 0, COLS, LIGS);

      for (let i = 0; i < COLS; ++i) {

        map.putTile(60, i, LIGS - 1, layer1);
        map.putTile(60, i, 0, layer1);

      }

      for (let i = 0; i < LIGS; ++i) {

        map.putTile(61, 0, i, layer1);
        map.putTile(61, COLS - 1, i, layer1);

      }

      for (let i = 1; i < COLS - 1; ++i) {

        map.putTile(2, i, LIGS - 2, layer1);
        map.putTile(3, i, 1, layer1);

      }

      for (let i = 1; i < LIGS - 1; ++i) {

        map.putTile(4, 1, i, layer1);
        map.putTile(5, COLS - 2, i, layer1);

      }

      for (let i = 0; i < 2; ++i) {
        for (let j = 0; j < 2; ++j) {

          map.putTile(i * 2 + j + 6, (COLS - 3) * j + 1, (LIGS - 2) - (LIGS - 3) * i, layer1);

          map.putTile(i * 2 + j + 62, (COLS - 1) * j, (LIGS - 1) * i, layer1);

        }
      }

      layer2 = map.createBlankLayer('level2', COLS, LIGS, CELL_SIZE, CELL_SIZE);

      playerLayer = map.createBlankLayer('playerLayer', COLS, LIGS, CELL_SIZE, CELL_SIZE);

      hudLayer = toolsMap.create('hud', HUD_COLS, HUD_LIGS, HUD_CELL_SIZE, HUD_CELL_SIZE);
        
      for(var k in potaTool.tool)
      {
        k = parseInt(k)
        toolsMap.putTile(k, k, HUD_LIGS - 1, hudLayer);
      }

      pepper = game.add.sprite(width / 2, height / 2, 'pepper');



      carrot = game.add.sprite(-CELL_SIZE, -CELL_SIZE, 'carrot');
      carrot.smoothed = false;
      carrot.scale.set(1.5);


      carrot.animations.add('walk_up', [0, 1, 2]);
      carrot.animations.add('walk_right', [3, 4, 5]);
      carrot.animations.add('walk_left', [9, 10, 11]);
      carrot.animations.add('walk_down', [6, 7, 8]);




      game.physics.enable(pepper, Phaser.Physics.arcade);

      game.physics.arcade.setBounds(CELL_SIZE / 2, 0, width - CELL_SIZE, height - CELL_SIZE);

      pepper.body.collideWorldBounds = true;


      //game.camera.follow(pepper);

      pepper.scale.set(2);
      pepper.smoothed = false;

      pepper.animations.add('walk_up', [0, 1, 2]);
      pepper.animations.add('walk_right', [3, 4, 5]);
      pepper.animations.add('walk_left', [9, 10, 11]);
      pepper.animations.add('walk_down', [6, 7, 8]);
    }

    // -----------------------------------------------------------------------
    // ------------------------------------------------------- UPDATE --------
    
    function update()
    {
        
    }

    
})