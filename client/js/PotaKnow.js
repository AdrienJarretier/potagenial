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
                info:'La graine se seme, la racine se plante. On seme prêt du sol, on plante loin du soleil'
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
                        tip:'Creuser un petit trou, et insérez une graine de tomate',
                        init:function(potaGen,done)
                        {
                            this.say('COUCOU')
                            done()
                        },
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
                                    return "Voilà, c'est la bonne profondeur"
                            }
                        }
                    }
                    knowledges['planter'] =
                    {
                        name:'planter des racines',
                        tip:'Creusez un gros trou et placer une patate dedans',
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
                                return 'Que fais-tu ?'
                            if(event.plant.name=='NO PLANT')
                                return "Ah, il n'y a rien à enterer ici..."
                            if(event.plant.seed!='seed')
                                return "Attention ! Pour l'instant On s'occupe des graines !"
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
                pred:['maintenir_graine','maintenir_patate']
            }
                // -----------
                knowledges['maintenir_graine'] =
                {
                    name:'maintenir vos graines',
                    doneFunc:function(event)
                    {
                        if(event.type != 'water')
                            return "Il faut arroser la plante je pense.."
                        if(event.plant.seed != 'seed')
                            return "On va d'abord s'occuper de la graine"
                        if(event.plant.water > event.durt.water)
                            return "Je crois que cette plante a besoin d'un peu plus d'eau"
                        return true
                    }
                }
                knowledges['maintenir_patate'] =
                {
                    name:'maintenir une racine',
                    doneFunc:function(event)
                    {
                        if(event.type != 'water')
                            return "Il faut arroser la plante je pense.."
                        if(event.plant.name == 'NO PLANT')
                            return "Rien à maintenir ici !"
                        if(event.plant.seed == 'seed')
                            return "La racine j'ai dit !"
                        if(event.plant.water > event.durt.water)
                            return "Je crois que cette plante a besoin d'un peu plus d'eau"
                        return true
                    }
                }
            knowledges['recolter'] =
            {
                name:'récolter vos plantations',
                init:function(potaGen,done)
                {
                    this.say('Regarder vos plantations pousser !!')
                    var potagen = potaGen
                    var int = setInterval(function(){
                        if(potagen.allPlantGrown.call(potagen))
                        {
                            clearInterval(int)
                            done()
                        }
                        else
                            potagen.newCycle.call(potagen)
                    },500)
                },
                doneFunc:function(event)
                {
                    if(event.type == 'dig' && event.plant.name!='NO PLANT')
                        return "Vous y êtes presque !"
                    if(event.type == "pickedPlant")
                        return true
                    if(event.plant.name == 'NO PLANT')
                        return "Pas de plante ici !"
                    return "Essaie encore"
                }
                /// TODO
            }
        // -----------
        knowledges['gerer_espace'] =
        {
            name:'gérer l\'espace de votre potager',
            //pred:['accessible','organiser'],
            pred:['organiser'],
        }/*
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
                            if(event.plant.name!='chemin')
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
                }*/
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
                            if(event.type!='cordeau')
                                return "Que faites vous ?"
                            if(event.cordeau == null)
                                return "Il faut 'mettre' du cordeau, pas l'enlever"
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
                        if(event.type!='plant')
                            return "Il faut planter ! Que faites vous ?"
                        if(event.cordeau == null)
                            return "SUR le cordage !!"
                        console.log( event.potagen.cordeau.array)
                        console.log( event.potagen.seed.array)
                        for(let k in event.potagen.cordeau.array)
                        {
                            let cordeau = event.potagen.cordeau.array[k]
                            console.log(cordeau)
                            if(cordeau != null)
                            {
                                let plant = event.potagen.seed.array[k]
                                console.log(k)
                                if(plant.name == 'NO PLANT')
                                    return "C'est bien, il faut maintenant remplir le cordage"
                            }
                        }
                        return true
                    }
                }

    return knowledges
}

class PotaKnow
{
    constructor(potagen,potatool,speekFunc,doneSpeackFunc,taskFunc)
    {
        this.profil = []
        this.potagen = potagen
        this.potatool = potatool

        this.speekFunc = speekFunc
        this.taskFunc = taskFunc

        this.knowledges = getKnowledgeGraph()
        for(var k in this.knowledges)
            this.knowledges[k]['id'] = k

        this.loadProfil()

        this.potagen.register('knower',this,this.callback)

        this.actTask = null

        this.callbacks = []

        this.tipTimeout = 0;

        this.doneSpeackFunc = doneSpeackFunc

        this.taskInTesting = false
    }

    loadProfil()
    {
        let loaded = localStorage.getItem('profil')
        if(loaded != null && loaded != '')
            this.profil = JSON.parse(loaded)
        for(let t of this.profil)
            this.knowledges[t].done = true
    }

    saveProfil()
    {
        //localStorage.setItem('profil',JSON.stringify(this.profil))
    }

    register(fun) {

        this.callbacks.push(fun)

    }

    sendCallback(event) {

        for(let cal of this.callbacks) {
            cal(event);
        }

    }

    randPhrase(phraseArray)
    {
        var randId = Math.floor(Math.random()*phraseArray.length);
        return phraseArray[randId];
    }

    // -------------------------------------
    callback(event)
    {
        if(!this.taskInTesting)
            return
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
        this.speekFunc(str)
    }
    newTask(str)
    {
        this.taskFunc(str)
    }
    // -------------------------------------
    // -------------------------------------
    nextKnowledge()
    {
        if(this.actTask != null)
        {
            this.terminateTask(this.actTask)
        }
        var next = this.threeLastNotDone(this.knowledges['gerer_potager'])
        /// terminée
        this.doneSpeackFunc(function(){
            this.startTask(next)
        });

        this.saveProfil()
    }

    //-------------
    startTask(task)
    {
        if(task == null)
        {
            this.say('Bravo vous avez terminé le jeu !')
            return
        }

        var executeTask = function()
        {
            this.taskInTesting = true
            this.actTask = task
            console.log('START',task.name)
            this.newTask(task.name)
            if(task.hasOwnProperty('tip'))
            {
                this.tipTimeout = setTimeout(()=>{
                    this.say('Astuce : '+task.tip)
                },10000)
            }
            let phrase = this.randPhrase(
                [
                'Vous pouvez essayer de',
                'Tentons de',
                'Essayez de',
                'Allons',
                ])
            this.say(phrase+' '+task.name)
            if(task.hasOwnProperty('story'))
            {
                this.say(task.story)
            }
        }
        var tthis = this
        if(task.hasOwnProperty('init'))
        {
            this.taskInTesting = false
            task.init.call(tthis,tthis.potagen,function(){
                executeTask.call(tthis)
            })
        }
        else
            executeTask.call(tthis)
    }
    //-------------
    terminateTask(task)
    {
        this.taskInTesting = false
        clearTimeout(this.tipTimeout)
        task.done = true
        this.profil.push(task.id)
        this.sendCallback(task)
        let phrase = this.randPhrase(
            [
            'Bravo vous savez',
            'Vous comprenez maintenant comment',
            'Vous savez maintenant comment',
            'Félicitation vous avez appris à',
            'Très bien, vous comprenez à présent comment',
            ])
        this.say(phrase+' '+task.name)
        if(task.hasOwnProperty('info'))
            this.say('Souvenez vous, '+task.info)
        var wasLastOfParent = this.taskWasLast(task.id)
        var isFirstOf = this.isFirst(task.id)
        if(wasLastOfParent!=null)
        {
            this.terminateTask(wasLastOfParent)
        }
        else if(isFirstOf!=null)
        {
            this.say("J'ai une idée, apprenons à "+isFirstOf.name)
        }
    }
    //-------------
    isFirst(taskName)
    {
        for(var k in this.knowledges)
        {
            var par = this.knowledges[k]
            if(par.hasOwnProperty('pred'))
            {
                if(taskName==par.pred[0])
                    return par
            }
        }
        return null
    }
    //-------------
    taskWasLast(taskName)
    {
        for(var k in this.knowledges)
        {
            var par = this.knowledges[k]
            if(par.hasOwnProperty('pred'))
            {
                if(taskName==par.pred[par.pred.length-1])
                    return par
            }
        }
        return null
    }
    //-------------
    threeLastNotDone(three)
    {
        three['parents'] = []

        if(!three.hasOwnProperty('pred'))
            if(!three.done)
            {
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
    getParents(task)
    {

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