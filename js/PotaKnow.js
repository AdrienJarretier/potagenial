//knowledge per seed

/* -- SAVEZ VOUS PLANTER...
    -- semer/planter
    -- 
    
*/

function getKnowledgeGraph()
{
    // ----------------------------------------------- Use the tools
    var knowledges = {}
    knowledges['use_tool'] =
    {
        done:false,
        name:'Utiliser les outils',
        reward:'Bravo, vous savez maintenant utiliser votre potager !',
        pred:['add_durt'],
        context:
        {
            potager:[3,3],
            tool:['transplantoir'],
            seed:[]
        }
    }
    // -----------
    knowledges['pickup_tool'] =
    {
        done:false,
        name:'Récupérer les outils',
        help:'Récupère une outil dans la ceinture',
        reward:'Bravo tu sais récupérer un outil !',
        pred:[],
        context:
        {
            potager:[3,3],
            tool:['transplantoir'],
            seed:[]
        },
        func:function(potagen,potatool)
        {
            return potatool.curTool!=null
        }
    }
    knowledges['dig_hole'] =
    {
        done:false,
        name:'Utiliser les outils',
        help:'Essai à présent de creuser un trou ! (MOUSE1)',
        pred:['pickup_tool'],
        context:
        {
            potager:[3,3],
            tool:['transplantoir'],
            seed:[]
        },
        announces:function(potagen,potatool,sayMethod)
        {
            console.log(potagen.lastActionIs('dig'))
            if(potagen.lastActionIs('dig'))
                if(potagen.lastAction.durt.level < DEEP_LEVEL)
                {
                    var durt = potagen.lastAction.durt
                    return setTimeout(function()
                    {
                        if(durt.level<DEEP_LEVEL)
                            sayMethod('Plus profond')
                    },2000)
                }
        },
        func:function(potagen,potatool)
        {
            for(var k in potagen.durt.array)
            {
                if(potagen.durt.array[k].level == DEEP_LEVEL)
                    return true
            }
            return false
        }
    }
    knowledges['add_durt'] =
    {
        done:false,
        name:'Remblayer',
        help:'A présent, remblai les trous que tu as fait ! (MOUSE2)',
        pred:['dig_hole'],
        context:
        {
            potager:[3,3],
            tool:['transplantoir'],
            seed:[]
        },
        func:function(potagen,potatool)
        {
            var allGood = true
            for(var k in potagen.durt.array)
            {
                if(potagen.durt.array[k].level > ZERO_LEVEL)
                    allGood = false
            }
            return allGood
        }
    }
    // ----------------------------------------------- Plant a seed
    knowledges['plant_seed'] =
    {
        done:false,
        name:'Planter',
        help:'Essai de déposer une pomme-de-terre ... dans la terre',
        reward:'Bravo, tu as compris le principe de planter',
        pred:['use_tool'],
        context:
        {
            potager:[3,3],
            tool:['transplantoir'],
            seed:['patate']
        },
        announces:function(potagen,potatool)
        {
            if(potagen.lastActionIs('plant'))
                if(potagen.lastAction.plant.name != 'potato')
                    return 'Attention, j\'ai demandé une patate'
            else if(potagen.lastActionIs('dig'))
                if(potagen.lastAction.durt.level < DEEP_LEVEL)
                    return '"Planter" c\'est plus profond que ça'
                else if(potagen.lastAction.durt.level == DEEP_LEVEL)
                    return 'Voila là c\'est assez profond'
        },
        func:function(potagen,potatool)
        {
            for(var k in potagen.seed.array)
            {
                var plant = potagen.seed.array[k]
                if(plant.name == 'potato' && plant.level>ZERO_LEVEL)
                    return true
            }
            return false
        }
    }
    
    return knowledges
}

class PotaKnow
{
    constructor(potagen,potatool,potadraw,talkJQ)
    {
        this.potagen = potagen
        this.potatool = potatool
        this.potadraw = potadraw
        
        this.talkJQ = talkJQ
        
        this.knowledges = getKnowledgeGraph()
        this.potadraw.addClickEvent('knower',this,this.callback)
        
        this.curKnowledge = null
        this.timout = null
        
        this.queue = []
    }
    
    callback(act)
    {
        if(act == TOO_DEEP)
            this.say('Attention tu ne peux pas creuser plus')
        else if(act == TOO_HEIGHT)
            this.say('Tu ne peux plus rajouter de terre !')
        
        var knowledge = this.knowledges[this.curKnowledge]
        if(knowledge.done)
            return
        if(knowledge.hasOwnProperty('announces'))
        {
            var obj = this
            var sayMethod = function(str)
            {
                obj.say(str)
            }
            var announce = knowledge.announces.call(knowledge,this.potagen,this.potatool,sayMethod)
            if(announce != undefined)
                if(!isNaN(announce))
                {
                    if(!knowledge.hasOwnProperty('timeouts'))
                        knowledge['timeouts'] = []
                    knowledge['timeouts'].push(announce)
                }
                else
                    this.say(announce)
        }
        var isDone = knowledge.func.call(knowledge,this.potagen,this.potatool)
        if(isDone)
        {
            knowledge.done = true
            if(knowledge.hasOwnProperty('timeouts'))
            {
                for(var k in knowledge.timeouts)
                    clearTimeout(knowledge.timeouts[k])
            }
            if(knowledge.hasOwnProperty('reward'))
            {
                this.drawDoneTask(knowledge)
                return
            }
            this.nextKnowledge()
        }
    }
    
    say(str)
    {
        console.log('say',str)
        var lastHtml = this.talkJQ.html()
        var newHtml = $('<div>').css('opacity',0.5).html(lastHtml)
        this.talkJQ.html('')
        this.talkJQ.append(str).append(newHtml)
    }
    
    evaluateQueue()
    {
        var workingKnowledge = null
        var keys = Object.keys(this.knowledges)
        var keyId = 0
        while(workingKnowledge==null && keyId<keys.length)
        {
            var key = keys[keyId]
            if(!this.knowledges[key].done)
                workingKnowledge = key
            keyId++
        }
        if(workingKnowledge == null)
            return
        this.queue = this.generateQueue(workingKnowledge)
        this.queue.reverse()
    }
    
    generateQueue(knowledgeKey)
    {
        var queue = [knowledgeKey]
        var knowledge = this.knowledges[knowledgeKey]
        for(var k in knowledge.pred)
        {
            var pred = knowledge.pred[k]
            if(!this.knowledges[pred].done)
                queue = queue.concat(this.generateQueue(pred))
        }
        return queue
    }
    
    drawDoneTask(knowledge)
    {
        this.say(knowledge.reward)
        var obj = this
        setTimeout(function()
        {
            obj.nextKnowledge()
        },3000)
    }
    
    nextKnowledge()
    {
        if(this.queue.length == 0)
        {
            this.evaluateQueue()
            if(this.queue.length == 0)
            {
                this.say('VOUS AVEZ TERMINE LE JEU !!!')
                return
            }
        }
        this.curKnowledge = this.queue.shift()
        console.log(this.curKnowledge,this.queue)
        var knowledge = this.knowledges[this.curKnowledge]
        
        if(knowledge.hasOwnProperty('func'))
        {
            // pré-évaluation
            knowledge.done = knowledge.func.call(knowledge,this.potagen,this.potatool)
            if(knowledge.done)
            {
                this.nextKnowledge()
                return;
            }
            this.say(knowledge.help)
        }
        else
        {
            knowledge.done = true
            this.drawDoneTask(knowledge)
        }
    }
}