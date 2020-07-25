const express = require('express')
const Task = require('../model/tasks')
const auth = require('../middleware/auth')
const router = express.Router()


//Raeding all the tasks created by the loggedin user
router.get('/tasks',auth,async (req,res)=>{
    
    const match={}
    const sort={}


    if(req.query.completed){
        match.completed = req.query.completed === 'true'
        
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc'? -1 : 1 //-1 for desending and 1 for ascending
    }
    
    try{
        //const task = await Task.find({owner : req.user._id}) //alternative 
        await req.user.populate({
            path : 'tasks',
            match,//for matching the query, here the query conatins the completed value
            options : { 
                limit : parseInt(req.query.limit),  //done for pagination
                skip: parseInt(req.query.skip),   //done for pagination
                sort
            
            }
        }).execPopulate()

        res.send(req.user.tasks)

    }catch(e){
        res.status(500).send(e)
    }

   
})

//Reading a task by ID
router.get('/tasks/:id',auth,async (req,res)=>{
    const _id = req.params.id
    try{
      // const task = await Task.findById(_id)
      const task = await Task.findOne({_id, owner : req.user._id})
       
      if(!task){
         return res.status(404).send()
       }

       res.send(task)
    }catch(e){
       res.send(e)
    }
  
})


//creating a task 
router.post('/tasks',auth, async (req,res)=>{

    try{
       const task = await new Task({
           ...req.body,
           owner : req.user._id
       }).save()

       res.send(task)

    }catch(e){
       res.status(400).send(e)
    }

})



router.patch('/tasks/:id',auth, async (req, res) =>{
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidUpdates = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidUpdates){
        return res.status(500).send({error : 'invalid properties to update'})
    }

    try{
        const task = await Task.findOne({_id, owner: req.user._id})
        
        //const task = await Task.findByIdAndUpdate(_id,req.body,{ new: true,runValidators: true})
        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update)=> task[update] = req.body[update])
        await task.save()

        res.send(task)
    }catch(e){
        res.status(500).send(e)

    }

})



router.delete('/tasks/:id', auth, async (req,res)=>{
    const _id = req.params.id

    try{
       const task = await Task.findOneAndDelete({_id, owner : req.user._id})
       if(!task){
           return res.status(404).send()
       }
       res.send(task)
    }catch(e){
       res.status(500).send(e)
    }
})

module.exports = router

