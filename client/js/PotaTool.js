class PotaTool
{
    constructor(potagen)
    {
        this.potagen = potagen
        this.tool = []
        this.tool.push(
        {
            name:'transplantoir',
            options:
            {
                1:{durt:1},
                2:{durt:-1}
            }
        })
        this.tool.push(
        {
            name:'arrosoir',
            options:
            {
                1:{water:1},
            }
        })
        this.tool.push(
        {
            name:'tomato',
            plant:
            {
                name:'tomato',
                seed:'seed',
                above:2,
                plante:['grow_0','grow_1','grow_2'],
                fruit:'tomate',
                grown:
                {
                    seed:'potato_1,'
                }
            }
        })
        this.tool.push(
        {
            name:'potato',
            plant:
            {
                seed:'potato',
                plante:'grow_0',
                name:'potato',
                grown:
                {
                    plante:'feuilles',
                    seed:'potato_1,'
                }
            }
        })
        this.tool.push(
        {
            name:'cordeau',
            plant:
            {
                seed:'cordeauCorde',
                type:'stay',
                name:'cordeau'
            }
        })
        this.tool.push(
        {
            name:'gravier',
            plant:
            {
                seed:'gravier',
                type:'stay',
                name:'gravier'
            }
        })
        this.curTool = null
    }
    
    setTool(id)
    {
        this.curTool = this.tool[id]
        return {type:'tool',tool:this.curTool}
    }
    
    use(x,y,option)
    {
        if(this.curTool == null)
            return {type:'use',result:'fail'}
        var tool = this.curTool
        if(tool.hasOwnProperty('plant'))
            return this.potagen.plant(x,y,tool.plant)
        else if(tool.hasOwnProperty('options'))
        {
            if(!tool.options.hasOwnProperty(option))
                return NO_ACTION
            var option = tool.options[option]
            let durt = this.potagen.durt.xy_map[x][y]
            if(option.hasOwnProperty('durt'))
                return this.potagen.moveDurt(x,y,option.durt)
            if(option.hasOwnProperty('water'))
                return this.potagen.water(x,y)
        }
    }
}