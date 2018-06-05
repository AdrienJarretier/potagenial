//knowledge per seed

/* -- SAVEZ VOUS PLANTER...
    -- semer/planter
    -- 
    
*/

TACHE_FINALE = 0
TACHE_REWARD = 1
TACHE_ALTERNIVE = 2
TACHE_SIMPLE = 3

function getKnowledgeGraph(plantations)
{
    // ----------------------------------------------- Use the tools
    // Nous allons apprendre à <name>
    // Votre but est de <name>
    // Vous savez <name>
    // niv
    var knowledges = {}
    // -----------
    knowledges['gerer_potager'] =
    {
        name:'gérer votre potager',
        pred:['gerer_plante','gerer_espace'],
    }
        // -----------
        knowledges['gerer_plante'] =
        {
            name:'gérer une plantation',
            pred:['savoir_planter','maintenir','recolter'],
        }
            // -----------
            knowledges['savoir_planter'] =
            {
                name:'planter dans votre potager',
                pred:['semer_planter','recouvrir'],
            }
                // -----------
                knowledges['semer_planter'] =
                {
                    name:'faire la différence entre semer et planter',
                    pred:['semer','planter'],
                }
                    // -----------
                    knowledges['semer'] =
                    {
                        name:'semer des graines',
                        doneFunc:function(event)
                        {
                            if(event.type=='plant')
                            {
                                if(event.plant.seed=='seed')
                                {
                                    if(event.plant.level==MIDD_LEVEL)
                                        return true
                                    else if(event.plant.level>MIDD_LEVEL)
                                        return 'Attention pas trop profond !'
                                    else if(event.plant.level<MIDD_LEVEL)
                                        return 'Plus profond !'
                                }
                                else
                                    return 'Une graine j\'ai dit !'
                                
                            }
                            else if(event.type=='dig')
                            {
                                if(event.durt.level>MIDD_LEVEL)
                                    return 'Attention pas trop profond !'
                            }
                            else if(event.type=='bury')
                            {
                                if(event.durt.level==MIDD_LEVEL)
                                    return "Voila, c'est la bonne profondeure"
                            }
                        }
                    }
                    knowledges['planter'] =
                    {
                        name:'planter des racines',
                        doneFunc:function(event)
                        {
                            if(event.type=='plant')
                            {
                                if(event.plant.seed==event.plant.name)
                                {
                                    if(event.plant.level==DEEP_LEVEL)
                                        return true
                                    else if(event.plant.level<DEEP_LEVEL)
                                        return 'Plus profond !'
                                }
                                else
                                    return 'Une racine j\'ai dit !'
                                
                            }
                        }
                    }
                // -----------
                knowledges['recouvrir'] =
                {
                    name:'recouvrir vos plantes',
                    pred:['proteger_graine','cacher_soleil'],
                }
                    // -----------
                    knowledges['proteger_graine'] =
                    {
                        name:'protéger les graines',
                        doneFunc:function(event)
                        {
                            if(event.type!='bury')
                                'Que fais-tu ?'
                            if(event.plant.name=='NO PLANT')
                                return "Ah, il n'y a rien à enterer ici..."
                            if(event.plant.seed!='seed')
                                return 'On vas commencer par les graines...'
                            if(event.plant.level!=MIDD_LEVEL)
                                return 'Hum, cette graine a été mal plantée...'
                            if(event.durt.level<ZERO_LEVEL)
                                return 'Pas si haut, la graine a besoin de soleil !'
                            return true;
                        }
                    }
                    knowledges['cacher_soleil'] =
                    {
                        name:'cacher les racines du soleil',
                        doneFunc:function(event)
                        {
                            if(event.type!='bury')
                                'Que fais-tu ?'
                            if(event.plant.name=='NO PLANT')
                                return "Ah, il n'y a rien à enterer ici..."
                            if(event.plant.seed!=event.plant.name)
                                return "Cette fois on s'occupe des racines..."
                            if(event.plant.level!=DEEP_LEVEL)
                                return 'Hum, cette racine a été mal plantée...'
                            if(event.durt.level>PILE_LEVEL)
                                return 'Plus haut !'
                            return true;
                        }
                    }
            // -----------
            knowledges['maintenir'] =
            {
                name:'maintenir vos plantations',
                doneFunc:function(event)
                {
                    return true
                }
                /// TODO
            }
            knowledges['recolter'] =
            {
                name:'récolter vos plantations',
                doneFunc:function(event)
                {
                    return true
                }
                /// TODO
            }
        // -----------
        knowledges['gerer_espace'] =
        {
            name:'gérer l\'espace de votre potager',
            pred:['accessible','organiser'],
        }
            // -----------
            knowledges['accessible'] =
            {
                name:'rendre le potager accessible',
                pred:['placer_chemin','chemin_utile'],
            }
                // -----------
                knowledges['placer_chemin'] =
                {
                    name:'placer un chemin dans votre potager',
                    doneFunc:function(event)
                    {
                        if(event.type=='plant')
                            if(event.plant.name!='gravier')
                                return 'Pas le bon outil peut-être ?'
                            return true
                    }
                }
                knowledges['chemin_utile'] =
                {
                    name:'créer des allées dans votre potager',
                    doneFunc:function(event)
                    {
                        return true
                    }
                }
            // -----------
            knowledges['organiser'] =
            {
                name:'organiser les plantations',
                pred:['preparer_terrain','planter_preparation'],
            }
                // -----------
                knowledges['preparer_terrain'] =
                {
                    name:'préparer la plantation',
                    pred:['placer_cordeau','cordeau_optimise'],
                }
                    // -----------
                    knowledges['placer_cordeau'] =
                    {
                        name:'placer le cordeau',
                        doneFunc:function(event)
                        {
                            if(event.type=='plant')
                                if(event.plant.name!='cordeau')
                                    return 'Pas le bon outil peut-être ?'
                                return true
                        }
                    }
                    knowledges['cordeau_optimise'] =
                    {
                        name:'optimiser le cordeau',
                        doneFunc:function(event)
                        {
                            return true
                        }
                    }
                knowledges['planter_preparation'] =
                {
                    name:'planter sur les cordages',
                    doneFunc:function(event)
                    {
                        return true
                    }
                }
    
    return knowledges
}

class PotaKnow
{
    constructor(potagen,potatool,speekFunc,taskFunc)
    {
        this.potagen = potagen
        this.potatool = potatool
        
        this.speekFunc = speekFunc
        this.taskFunc = taskFunc
        
        this.knowledges = getKnowledgeGraph()
        this.potagen.register('knower',this,this.callback)
        
        this.actTask = null
    }
    // -------------------------------------
    callback(event)
    {
        if(this.actTask==null)
            return
            
        var ret = this.actTask.doneFunc(event)
        if(ret===true)
            this.nextKnowledge()
        else
        {
            if(typeof(ret) == 'string')
                this.say(ret)
        }
    }
    // -------------------------------------
    say(str)
    {
        console.log(str)
        this.speekFunc(str)
    }
    newTask(str)
    {
        console.log('big task - '+str)
        this.taskFunc(str)
    }
    // -------------------------------------
    // -------------------------------------
    nextKnowledge()
    {
        if(this.actTask != null)
        {
            this.actTask.done = true
            this.say('Bravo vous savez '+this.actTask.name)
            var parent = this.actTask.parents[0]
            var lastBrother = parent.pred[parent.pred.length-1]
            if(lastBrother==this.actTask.id)
            {
                this.say("Ce qui veux dire que vous avez compris comment "+parent.name)
                this.newTask('')
            }
        }
        var next = this.threeLastNotDone(this.knowledges['gerer_potager'])
        if(next == null)
        {
            this.say('Bravo vous avez terminé le jeu !')
            return
        }
        if(next.parents[0].pred[1]==next.id)
        {
            this.say("J'ai une idée, apprenons à "+next.parents[0].name)
            this.newTask(next.parents[0].name)
        }
        this.actTask = next
        this.say('Apprenons à '+next.name)
    }
    //-------------
    threeLastNotDone(three)
    {
        if(!three.hasOwnProperty('pred'))
            if(!three.done)
            {
                three['parents'] = []
                return three
            }
            else
                return null
        
        for(var k in three.pred)
        {
            var t = this.knowledges[three.pred[k]]
            var sub = this.threeLastNotDone(t)
            if(sub!=null)
            {
                sub['parents'].push(three)
                if(!sub.hasOwnProperty('id'))
                    sub['id'] = three.pred[k]
                return sub;
            }
        }
        return null
    }
    // -------------------------------------
    // -------------------------------------
    learn(task)
    {        
        if(!task.hasOwnProperty('pred'))
            task['done'] = true
        
        if(task.hasOwnProperty('done') && task.done)
        {
            let phrases = ['Allons ','Allez, voyons comment ','Apprenons à ']
            this.say(this.randomPhrase(phrases)+task.name)
            this.say('Bravo, vous avez compris comment '+task.name)
            return
        }
        
        for(var k in task.pred)
        {
            var subTask = this.knowledges[task.pred[k]]
            this.learn(subTask)
            if(k==0)
            {
                this.newTask(task.name)
                this.say('Tiens, j\'ai une idée, si on apprenait à '+task.name)
            }
        }
        this.say('Super on sais maintenant '+task.name)
    }
}