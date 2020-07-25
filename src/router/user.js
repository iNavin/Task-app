const express = require('express')
const User = require('../model/users')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
//const {sendWelcomeEmail} = require('../emails/account')
const router = express.Router()



router.post('/login', async (req,res)=>{
    try{
     const user = await User.findByCredentials(req.body.email, req.body.password)
     const token =await user.generateAuthToken()
     res.send({user, token : token})
     
    }catch(e){
       res.status(400).send()
    }
})

router.post('/users/logout',auth, async (req,res) =>{
    try{
         req.user.tokens = req.user.tokens.filter((token)=>{
             return token.token !== req.token
         })

         await req.user.save()
         res.send()

    }catch(e){

        res.status(500).send()

    }
})

router.post('/users/logoutAll',auth, async (req,res)=>{
    try{
        req.user.tokens = [];
        await req.user.save();

        res.send()

    }catch(e){
        res.status(500).send();
    }
})

router.get('/users/me',auth,async (req,res)=>{

    res.send(req.user)
})





//Signup route
router.post('/users',async (req, res)=>{

    try{
        const user = await new User(req.body).save()
        const token =await user.generateAuthToken()
        //await sendWelcomeEmail()
        res.send({user, token : token})
     
    }catch(e){
         res.status(400).send(e)
    }
    
 
})


router.patch('/users/me',auth, async (req,res)=>{
    
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','age','email','password']
    const isValidUpdates = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidUpdates){
        return res.status(400).send({ error : 'invalid properties to update'})
    }

    try{
        const user = req.user

        updates.forEach((update)=>{
            user[update] = req.body[update]
        })

        await user.save()

         res.send(user)

    }catch(e){
        return res.status(500).send(e)
    }
    
})

router.delete('/users/me',auth, async (req,res) =>{
    
    try{
        

        await req.user.remove()
        res.send(req.user)

    }catch(e){
        
        res.status(500).send(e)
    }
})

const upload = multer({

    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file,cb){

        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
          return cb(new Error("please upload a jpg/jpeg/png file"))
        }

        cb(undefined,true)
          
    }
})

router.post('/users/me/avatar',auth, upload.single('avatar'),async (req,res)=> {
    
    const buffer = await sharp(req.file.buffer).resize({width:250 , height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()

},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar',auth, async (req,res)=> {
   try{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
   }catch(e){
       res.status(500).send()
   }
    

})

router.get('/users/:id/avatar', async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        
        if(!user || !user.avatar){
            throw new Error()
        }
      
        res.set('Content-Type','image/png')
        res.send(user.avatar)

    }catch(e){
       res.status(500).send()
    }
})
module.exports = router

