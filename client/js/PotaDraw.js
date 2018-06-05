class PotaDraw
{
    constructor(potagen,potatool)
    {
        this.potagen = potagen
        this.potatool = potatool
        
        $(document).bind('mousemove',function(e)
        {
            $('.cursor').css('top',e.pageY-25).css('left',e.pageX-25)
        });
    }
    
    getJQ(x,y)
    {
        var durt = this.potagen.durt.xy_map[x][y]
        var durtjQ = $('<div>').addClass('durt')

        var dImg = $('<img>').attr('src','test_asset/level_'+durt.level+'.png')
        var wImg = $('<img>').attr('src','test_asset/water_'+durt.water+'.png')

        durtjQ.append(dImg)
        durtjQ.append(wImg)
        if(this.potagen.seed.xy_map[x][y].hasOwnProperty('seed'))
        {
            var plant = this.potagen.seed.xy_map[x][y]
            var type = plant.type
            var level = plant.level
            var seed = plant.seed
            var img = 'seed_hidden'
            if(durt.level >= level)
                img = seed
            var sImg = $('<img>').attr('src','test_asset/'+img+'.png').addClass('seed '+type)
            durtjQ.append(sImg)
        }
        
        var obj = this
        durtjQ.mousedown(function(event)
        {
            var button = event.which
            if(button==3)
                button = 2
            else if(button==2)
                button = 3
            var ret = obj.potatool.use(x,y,button)
            var newJQ = obj.getJQ(x,y)
            durtjQ.replaceWith(newJQ);
            return true;// to allow the browser to know that we handled it.
        })
        return durtjQ
    }
    
    createEvent(type,obj)
    {
        var event = obj
        event['type'] = type
        return event
    }
    
    draw(jQ)
    {
        this.jQ = jQ
        jQ.html('')
        for(let j=0;j<this.potagen.height;++j)
        {
            for(let i=0;i<this.potagen.width;++i)
            {
                let dJQ = this.getJQ(i,j)
                jQ.append(dJQ)
            }
            jQ.append('<br>')
        }
        
        var setupTool = function(obj,jq,id)
        {
            jq.click(function()
            {
                var ret = obj.potatool.setTool(id)
                $('.cursor').css('background-image','url(test_asset/'+obj.potatool.curTool.name+'.png)')
            })
        }
        
        for(var k in this.potatool.tool)
        {
            var tool = this.potatool.tool[k]
            var toolJQ = $('<div>').addClass('tool')
            var tImg = $('<img>').attr('src','test_asset/'+tool.name+'.png')
            toolJQ.append(tImg)
            setupTool(this,toolJQ,k)
            $('.tools').append(toolJQ)
            
        }
    }
}