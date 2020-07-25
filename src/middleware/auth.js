const jwt = require('jsonwebtoken')
const User = require('../model/users')

const auth = async (req,res,next)=>{

    try{
        const token = req.header('authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})
    
        if(!user){
            throw new Error()
        }

        

        req.user = user
        req.token = token
        next()
    
    }catch(e){
        res.status(400).send({'error':'pls authenticate'})
    }
   

}

module.exports = auth