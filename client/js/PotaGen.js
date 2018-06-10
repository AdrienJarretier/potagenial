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
        this.cordeau = {'xy_map':{},'array':[]}
        this.pickedPlant = []
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
    loadPotager()
    {
        var ret = localStorage.getItem('potager')
        if(ret!=null && ret!='')
        {
            ret = JSON.parse(ret)
            return ret
        }
        return null
    }
    // -------------------------------------------
    savePotager()
    {
        let obj = {durt:this.durt,seed:this.seed,cordeau:this.cordeau}
        localStorage.setItem('potager',JSON.stringify(obj))
    }
    // -------------------------------------------
    register(id,obj,func)
    {
        this.callbacks[id] = {obj:obj,func:func}
    }
    // -------------------------------------------
    sendEvent(eventType,x,y,adder)
    {
        this.savePotager()
        adder = adder==undefined?{}:adder;
        adder['type'] = eventType
        adder['potagen'] = this
        adder['durt'] = this.durt.xy_map[x][y]
        adder['plant'] = this.seed.xy_map[x][y]
        adder['cordeau'] = this.cordeau.xy_map[x][y]
        adder['x'] = x
        adder['y'] = y
        for(var k in this.callbacks)
        {
            var caller = this.callbacks[k]
            caller.func.call(caller.obj,adder)
        }
    }
    // -------------------------------------------
    constructor(w,h)
    {
        this.width = w
        this.height = h
        this.initVars()

        let loaded = this.loadPotager()

        for(let i=0;i<w;++i)
        {
            this.durt.xy_map[i] = {}
            this.seed.xy_map[i] = {}
            this.cordeau.xy_map[i] = {}
            for(let j=0;j<h;++j)
            {
                if(loaded!=null)
                {
                    this.durt.xy_map[i][j] = loaded.durt.xy_map[i][j]
                    this.seed.xy_map[i][j] = loaded.seed.xy_map[i][j]
                    this.cordeau.xy_map[i][j] = loaded.cordeau.xy_map[i][j]
                }
                else
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
                    this.cordeau.xy_map[i][j] = null
                }
                this.durt.array.push(this.durt.xy_map[i][j])
                this.seed.array.push(this.seed.xy_map[i][j])
                this.cordeau.array.push(this.cordeau.xy_map[i][j])
            }
        }
    }
    // -------------------------------------------
    newCycle()
    {
        var growDurtPlant = function(plant,durt,tim)
        {
            var tthis = this
            setTimeout(function(){
                let waterRatio = 1/plant.water
                durt.water -= 1
                tthis.sendEvent('water',plant.x,plant.y)
                let adder = 1/plant.cycles
                plant.grow += adder*waterRatio
                tthis.sendEvent('grow',plant.x,plant.y)
            },tim)
        }
        for(let x=0;x<this.width;++x)
        {
            for(let y=0;y<this.height;++y)
            {
                let plant = this.seed.xy_map[x][y]
                let durt = this.durt.xy_map[x][y]

                let water = durt.water
                if(plant.name != 'NO PLANT' && plant.grow<1)
                {
                    let level = plant.level
                    let dLevel = durt.level
                    let needWater = plant.water
                    let above = level - dLevel
                    let needAbove = plant.above
                    let missingAbove = above - needAbove
                    if(missingAbove == 0)
                    {
                        if(water >= 1)
                        {
                            let tim = Math.random()*3*1000
                            growDurtPlant.call(this,plant,durt,tim)
                        }
                    }
                }
            }
        }
    }
    // -------------------------------------------
    allPlantGrown()
    {
        for(var plant of this.seed.array)
            if(plant.grow<1)
                return false
        return true
    }
    // -------------------------------------------
    water(x,y)
    {
        var wat = this.durt.xy_map[x][y].water
        if(wat==WATER_2ET)
        {
            this.sendEvent('water',x,y)
            return TOO_WET
        }
        else
        {
            wat += 1
            this.durt.xy_map[x][y].water = wat
            this.sendEvent('water',x,y)
            return OK
        }
    }
    // -------------------------------------------
    pickUpPlant(x,y)
    {
        var plant = this.seed.xy_map[x][y]
        this.pickedPlant.push(plant)
        this.seed.xy_map[x][y] = {name:'NO PLANT'}
        this.sendEvent('pickedPlant',x,y,{picked:plant})
    }
    // -------------------------------------------
    moveDurt(x,y,amount)
    {
        var ret = OK
        var level = this.durt.xy_map[x][y].level
        var plant = this.seed.xy_map[x][y]
        if(amount>0 && plant.name != 'NO PLANT' && level==plant.level)
        {
            this.pickUpPlant(x,y)
        }
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
        this.sendEvent(amount>0?'dig':'bury',x,y)
        if(this.durt.xy_map[x][y].water>0)
        {
            this.durt.xy_map[x][y].water = 0
            this.sendEvent('water',x,y)
        }
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
        this.seed.xy_map[x][y]['x'] = x
        this.seed.xy_map[x][y]['y'] = y
        this.seed.xy_map[x][y]['level'] = this.durt.xy_map[x][y].level
        for(var k in plantType)
        {
            this.seed.xy_map[x][y][k] = plantType[k]
        }

        this.sendEvent('plant',x,y)
        return OK
    }
    setCordeau(x,y,add)
    {
        if(add)
        {
            this.cordeau.xy_map[x][y] = 'cordeau'
            this.cordeau.array[y+x*this.height] = 'cordeau'
        }
        else
        {
            this.cordeau.xy_map[x][y] = null
            this.cordeau.array[y+x*this.height] = null
        }
        this.sendEvent('cordeau',x,y)
    }
    // -------------------------------------------
    getContent(x,y)
    {
        var cont = {durt:this.durt.xy_map[x][y],plant:this.seed.xy_map[x][y]}
        return cont
    }
}