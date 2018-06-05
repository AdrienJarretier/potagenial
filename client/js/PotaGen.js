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
        this.callbacks = {}
        this.durt = {'xy_map':{},'array':[]}
        this.seed = {'xy_map':{},'array':[]}
        this.tools = []
        this.curTool = null
        this.tools.push(
        {
            name:'transplantoir',
            dig:1,
            water:0
        })
    }
    // -------------------------------------------
    register(id,obj,func)
    {
        this.callbacks[id] = {obj:obj,func:func}
    }
    // -------------------------------------------
    sendEvent(event)
    {
        event['potagen'] = this
        for(var k in this.callbacks)
        {
            var caller = this.callbacks[k]
            caller.func.call(caller.obj,event)
        }
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
        {
            this.sendEvent({type:'water',x:x,y:x,
                durt:this.durt.xy_map[x][y],
                plant:this.seed.xy_map[x][y]})
            return TOO_WET
        }
        else
        {
            wat += 1
            this.durt.xy_map[x][y].water = wat
            this.sendEvent({type:'water',x:x,y:x,
                durt:this.durt.xy_map[x][y],
                plant:this.seed.xy_map[x][y]})
            return OK
        }
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
        this.sendEvent(
            {type:amount>0?'dig':'bury',x:x,y:x,
                durt:this.durt.xy_map[x][y],
                plant:this.seed.xy_map[x][y]})
        return ret
    }
    // -------------------------------------------
    dig(x,y)
    {
        var ret = moveDurt(x,y,1)
        return ret
    }
    // -------------------------------------------
    bury(x,y)
    {
        var ret = moveDurt(x,y,-1)
        return ret
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
        
        this.sendEvent({type:'plant',x:x,y:x,
                durt:this.durt.xy_map[x][y],
                plant:this.seed.xy_map[x][y]})
        return OK
    }
    // -------------------------------------------
    getContent(x,y)
    {
        var cont = {durt:this.durt.xy_map[x][y],plant:this.seed.xy_map[x][y]}
        return cont
    }
}