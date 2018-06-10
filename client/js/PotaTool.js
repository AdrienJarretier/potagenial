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
                seed:'seed',
                name:'tomato',
                fruit:'tomato',
                above:1,
                water:1,
                cycles:3,
                plant:'plante'
            }
        })
        this.tool.push(
        {
            name:'potato',
            plant:
            {
                seed:'potato',
                seedDone:'potatos',
                name:'potato',
                above:3,
                water:2,
                cycles:4,
                plant:'feuille'
            }
        })
        this.tool.push(
        {
            name:'chemin',
            plant:
            {
                seed:'chemin',
                type:'stay',
                name:'chemin'
            }
        })
        this.tool.push(
        {
            name:'cordeau'
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
        if(tool.name == 'cordeau')
        {
            return this.potagen.setCordeau(x,y,option==1)
        }
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