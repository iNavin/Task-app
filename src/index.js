const express = require('express');
require('./db/mongoose');
const userRouter = require('./router/user')
const taskRouter = require('./router/tasks')

const app = express();
const port = process.env.PORT;

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () =>{
    console.log('Server is running in port '+port);
})

const User = require('./model/users')
const Task = require('./model/tasks')

// const main = async () =>{
//     // const task = await Task.findById('5f16fb42e5c7da3934b3d319')
//     // await task.populate('owner').execPopulate()
//     // console.log(task)

//     try{
//         const user = await User.findById('5f16fabacb9d43227838db28')
//         await user.populate('tasks').execPopulate()
//         console.log(user.tasks)
//     }catch(e){
//         console.log('error',e)
//     }
  
// }

// main()

