window.onload = function()
{
    
// -----------------------------------------------------------------------
// --------------------------------------------------------- INIT --------
    
    const TARGET_WIDTH = Math.floor(1920 / 2 * 0.9);
    const CELL_SIZE = 64;
    const HUD_CELL_SIZE = 64;
    
    // -- info potager
    const POTAGER_COLS = 7;
    const POTAGER_ROWS = 5;

    // -- game size
    const width = (POTAGER_COLS + 2) * CELL_SIZE;
    const height = (POTAGER_ROWS + 3) * CELL_SIZE;

    // -- models
    var potaGen = new PotaGen(POTAGER_COLS, POTAGER_ROWS);
    var potaTool = new PotaTool(potaGen);
    var potaKnow = new PotaKnow(potaGen,potaTool,(str) => {
        console.log('say : ' + str);
    },(str) => {
        console.log('task changed : ' + str);
    });
    potaGen.register('phaser',null,potager_update)

    // -----------------------------------------------------------------------
    // --------------------------------------------------- POTAUPDATE --------
    function potager_update(event)
    {
        var seedMap =
        {
            potato:racines_patate_0,
            seed:racines_seed_0,
        }
        let x = event.x;
        let y = event.y;
        let type = event.type;
        let durt = event.durt;
        let plant = event.plant;
        
        if(type=='dig' || type=='bury')
        {
            let ret = createHoles(potaGen,x,y,[])
            
            if(plant.name!='NO PLANT')
            {
                let seePlant = durt.level>=plant.level
                if(seePlant)
                    setRacine(seedMap[plant.seed],x,y)
                else
                    setRacine(-1,x,y)
            }
        }
        
        if(type=='plant')
        {
            let seed = seedMap[plant.seed];
            setRacine(seed,x,y)
        }
    }
    // -----------------------------------------------------------------------
    // ------------------------------------------------------ SETTILE --------
    function createHoles(potaGen,x,y,forget)
    {
        if(x<0 || y<0 || x>POTAGER_COLS-1 || y>POTAGER_ROWS-1)
            return false;
        
        let myIndex = x+y*POTAGER_COLS;
        if(forget.indexOf(myIndex)>-1)
            return potaGen.durt.xy_map[x][y].level==DEEP_LEVEL;
        
        forget.push(myIndex);
        let left = createHoles(potaGen,x-1,y,forget);
        let right = createHoles(potaGen,x+1,y,forget);
        let up = createHoles(potaGen,x,y-1,forget);
        let down = createHoles(potaGen,x,y+1,forget);
        
        if(potaGen.durt.xy_map[x][y].level!=DEEP_LEVEL)
        {
            setTranche(-1,x,y)
            setTrou(potaGen.durt.xy_map[x][y].level+1,x,y)
            return false
        }
        else
        {
            setTrou(-1,x,y)
        }
        
        if(!(left||right||up||down))
        {
            setTrou(trous_deep,x,y)
        }
        else if(left&&right&&up&&down)
        {
            setTranche(tranche_x,x,y)
        }
        else if(left&&right&&up)
        {
            setTranche(tranche_t_up,x,y)
        }
        else if(left&&right&&down)
        {
            setTranche(tranche_t_down,x,y)
        }
        else if(left&&up&&down)
        {
            setTranche(tranche_t_left,x,y)
        }
        else if(right&&up&&down)
        {
            setTranche(tranche_t_right,x,y)
        }
        else if(down&&right)
        {
            setTranche(tranche_l_down,x,y)
        }
        else if(left&&down)
        {
            setTranche(tranche_l_left,x,y)
        }
        else if(up&&right)
        {
            setTranche(tranche_l_right,x,y)
        }
        else if(up&&left)
        {
            setTranche(tranche_l_up,x,y)
        }
        else if(up&&down)
        {
            setTranche(tranche_h_up,x,y)
        }
        else if(left&&right)
        {
            setTranche(tranche_h_left,x,y)
        }
        else if(left)
        {
            setTranche(tranche_left,x,y)
        }
        else if(right)
        {
            setTranche(tranche_right,x,y)
        }
        else if(up)
        {
            setTranche(tranche_up,x,y)
        }
        else if(down)
        {
            setTranche(tranche_down,x,y)
        }
        return true;
    }
    function setTile(map,tileId,x,y,layer)
    {
        if(tileId==-1)
        {
            map.removeTile(x,y,layer)
            return
        }
        map.putTile(tileId,x,y,layer)
    }
    function setTranche(tileId,x,y)
    {
        setTile(tranchesMap,tileId,x+1,y+1,tranchesLayer)
    }
    function setTrou(tileId,x,y)
    {
        setTile(trousMap,tileId,x+1,y+1,trousLayer)
    }
    function setRacine(tileId,x,y)
    {
        setTile(racinesMap,tileId,x+1,y+1,racinesLayer)
    }
    function setPlante(tileId,x,y)
    {
        setTile(plantesMap,tileId,x+1,y+1,plantesLayer)
    }
    function setFruit(tileId,x,y)
    {
        setTile(fruitsMap,tileId,x+1,y+1,fruitsLayer)
    }
    
    // -----------------------------------------------------------------------
    // --------------------------------------------------------- GAME --------

    var game = new Phaser.Game(width, height, Phaser.AUTO, '',
                    { preload: preload, create: create, update: update });

    // -----------------------------------------------------------------------
    // ----------------------------------------------------- PRE-LOAD --------
    // -------------------
    function preload()
    {
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
    }
    
    // -----------------------------------------------------------------------
    // ------------------------------------------------------- CREATE --------
    
    var outilsMap;
    var potagerMap;
    var tranchesMap;
    var trousMap;
    var racinesMap;
    var eauMap;
    var plantesMap;
    var fruitsMap;
    
    var outilsLayer;
    var potagerLayer;
    var tranchesLayer;
    var trousLayer;
    var racinesLayer;
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
    
    var marker;
    // -------------------
    function create()
    {
        // -- MAPS
        potagerMap =  game.add.tilemap(null, CELL_SIZE, CELL_SIZE);
        potagerMap.addTilesetImage('fences');
        potagerLayer = potagerMap.create(
            'potager', POTAGER_COLS+2, POTAGER_ROWS+3, CELL_SIZE, CELL_SIZE);
        
        tranchesMap =  game.add.tilemap(null, CELL_SIZE, CELL_SIZE);
        tranchesMap.addTilesetImage('tranches');
        tranchesLayer = tranchesMap.create(
            'tranches', POTAGER_COLS+2, POTAGER_ROWS+3, CELL_SIZE, CELL_SIZE);
        
        trousMap =  game.add.tilemap(null, CELL_SIZE, CELL_SIZE);
        trousMap.addTilesetImage('trous');
        trousLayer = trousMap.create(
            'trous', POTAGER_COLS+2, POTAGER_ROWS+2, CELL_SIZE, CELL_SIZE);
        
        racinesMap =  game.add.tilemap(null, CELL_SIZE, CELL_SIZE);
        racinesMap.addTilesetImage('racines');
        racinesLayer = racinesMap.create(
            'racines', POTAGER_COLS+2, POTAGER_ROWS+2, CELL_SIZE, CELL_SIZE);
        
        plantesMap =  game.add.tilemap(null, CELL_SIZE, CELL_SIZE);
        plantesMap.addTilesetImage('plantes');
        plantesLayer = plantesMap.create(
            'plantes', POTAGER_COLS+2, POTAGER_ROWS+2, CELL_SIZE, CELL_SIZE);
        
        fruitsMap =  game.add.tilemap(null, CELL_SIZE, CELL_SIZE);
        fruitsMap.addTilesetImage('fruits');
        fruitsLayer = fruitsMap.create(
            'fruits', POTAGER_COLS+2, POTAGER_ROWS+2, CELL_SIZE, CELL_SIZE);
        
        outilsMap =  game.add.tilemap(null, CELL_SIZE, CELL_SIZE);
        outilsMap.addTilesetImage('outils');
        outilsLayer = outilsMap.create(
            'outils', POTAGER_COLS+2, POTAGER_ROWS+3, CELL_SIZE, CELL_SIZE);
        
        // -- Setup tools
        for(let k in potaTool.tool)
            outilsMap.putTile(k,parseInt(k)+1,POTAGER_ROWS+2,outilsLayer)
        
        // -- Setup potager
        for(let i=0;i<POTAGER_COLS+2;++i)
        {
            for(let j=0;j<POTAGER_ROWS+2;++j)
            {
                let tileId = fences_terre;
                if(i==0)
                    if(j==0)
                        tileId = fences_up_left;
                    else if(j==POTAGER_ROWS+1)
                        tileId = fences_down_left;
                    else
                        tileId = fences_left;
                else if(i==POTAGER_COLS+1)
                    if(j==0)
                        tileId = fences_up_right;
                    else if(j==POTAGER_ROWS+1)
                        tileId = fences_down_right;
                    else
                        tileId = fences_right;
                else if(j==0)
                    tileId = fences_up;
                else if(j==POTAGER_ROWS+1)
                    tileId = fences_down;
                potagerMap.putTile(tileId,i,j,potagerLayer)
            }
        }
        for(let i=0;i<POTAGER_COLS+2;++i)
        {
            potagerMap.putTile(fences_herbe,i,POTAGER_ROWS+2,potagerLayer)
        }
        
        marker = game.add.graphics();
        marker.lineStyle(2, 0x000000, 1);
        marker.drawRect(0, 0, 64, 64);
        
        game.input.addMoveCallback(updateMarker, this);
    }

    // -----------------------------------------------------------------------
    // ------------------------------------------------------- UPDATE --------
    function updateMarker(pointer,x,y,isClick)
    {
        let tileX = potagerLayer.getTileX(game.input.activePointer.worldX);
        let tileY = potagerLayer.getTileY(game.input.activePointer.worldY);

        marker.x = tileX * 64;
        marker.y = tileY * 64;

        if(isClick)
        {
            let click = 0;
            if(pointer.leftButton.isDown)
            click = 1;
            if(pointer.rightButton.isDown)
            click = 2;

            var toolSelection = outilsMap.getTile(
            outilsLayer.getTileX(tileX * 64),
            outilsLayer.getTileY(tileY * 64),outilsLayer)
            
            if(toolSelection != null)
            {
                let id = toolSelection.index
                let tool = potaTool.setTool(id)
            }
            else if(tileX>0 && tileY>0
                    && tileX<POTAGER_COLS+1 && tileY<POTAGER_ROWS+1)
            {
                let act = potaTool.use(tileX-1,tileY-1,click);
            }
        }
    }

    // -----------------------------------------------------------------------
    // ------------------------------------------------------- UPDATE --------
    
    function update()
    {
        
    }
}