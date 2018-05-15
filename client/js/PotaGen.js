var PILE_LEVEL = -1
var ZERO_LEVEL = 0
var MIDD_LEVEL = 1
var DEEP_LEVEL = 2

var WATER_DRY = 0
var WATER_WET = 1
var WATER_2ET = 2


class PotaGen
{
    // -------------------------------------------
    initVars()
    {
        this.durt = {'xy_map':{},'array':[]} // terre
        this.seed = {'xy_map':{},'array':[]} // plantes
        this.tools = []
        this.curTool = null
        this.tools.push(
        {
            name:'transplantoir',
            dig:1,
            water:0
        })
        this.lastAction = {}
    }
    // -------------------------------------------
    constructor(w,h)
    {
        this.width = w
        this.height = h
        this.initVars()
        
        for(let i=0;i<w;++i)
        {
            this.durt.xy_map[i] = {}
            this.seed.xy_map[i] = {}
            for(let j=0;j<h;++j)
            {
                var d =
                {
                    x:i,
                    y:j,
                    level:ZERO_LEVEL,
                    water:WATER_DRY,
                }
                var p =
                {
                    name:'NO PLANT'
                }
                this.durt.xy_map[i][j] = d
                this.seed.xy_map[i][j] = p
                this.durt.array.push(this.durt.xy_map[i][j])
                this.seed.array.push(this.seed.xy_map[i][j])
            }
        }
    }
    // -------------------------------------------
    water(x,y)
    {
        var wat = this.durt.xy_map[x][y].water
        if(wat==WATER_2ET)
            return TOO_WET
        wat += 1
        this.durt.xy_map[x][y].water = wat
        return OK
    }
    // -------------------------------------------
    moveDurt(x,y,amount)
    {
        var ret = OK
        var level = this.durt.xy_map[x][y].level
        level += amount
        if(level<PILE_LEVEL)
        {
            level = PILE_LEVEL
            ret = TOO_HEIGHT
        }
        else if(level>DEEP_LEVEL)
        {
            level = DEEP_LEVEL
            ret = TOO_DEEP
        }
        this.durt.xy_map[x][y].level = level
        this.lastAction = {'name':amount>0?'dig':'bury',x:x,y:y,amount:amount,durt:this.durt.xy_map[x][y]}
        return ret
    }
    // -------------------------------------------
    dig(x,y)
    {
        return moveDurt(x,y,1)
    }
    // -------------------------------------------
    bury(x,y)
    {
        return moveDurt(x,y,-1)
    }
    // -------------------------------------------
    plant(x,y,plantType)
    {        
        if(this.seed.xy_map[x][y].hasOwnProperty('grow'))
            return SEED_ALREADY_IN
        this.seed.xy_map[x][y]['grow'] = 0
        this.seed.xy_map[x][y]['level'] = this.durt.xy_map[x][y].level
        for(var k in plantType)
        {
            this.seed.xy_map[x][y][k] = plantType[k]
        }
        this.lastAction = {'name':'plant',x:x,y:y,'plant':this.seed.xy_map[x][y]}
        return OK
    }
    // -------------------------------------------
    lastActionIs(name)
    {
        if(!this.lastAction.hasOwnProperty('name'))
            return false
        return this.lastAction.name == name
    }

    getContent(x, y) {

        return {

            'dirt' : this.durt['xy_map'][x][y],
            'vegetable' : this.seed['xy_map'][x][y]

        };

    }
}