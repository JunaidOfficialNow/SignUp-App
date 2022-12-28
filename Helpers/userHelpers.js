var db = require("../config/connection")
var collections = require("../config/collections")
var objectId = require('mongodb').ObjectID
const bcrypt = require('bcrypt')
const { resolve } = require("path")
const { rejects } = require("assert")
const { resolveObjectURL } = require("buffer")


module.exports = {
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: userData.username })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((response) => {


                    if (response) {
                        
                        resolve({ user: true, status: true , userDetails:user })
                        

                    }
                    else {
                        resolve({
                            user: true,
                            status: false
                        })
                    }
                })
            } else {
                resolve({ user: false, status: false })
            }

        })
    },
    doSignup: async (userData) => {
        user = {
            _id: userData.username,
            email: userData.email,
            password: await bcrypt.hash(userData.password, 10)

        }
        return new Promise(async (resolve,reject) => {
            let userCheck = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: userData.username })
            

            if(userCheck){
                resolve({ status: false, message: 'username already in use' })
            }else{
                db.get().collection(collections.USER_COLLECTION).insertOne(user).then((result) => {
                    db.get().collection(collections.USER_COLLECTION).findOne({_id:result.insertedId}).then((response)=>{
                        resolve({status: true ,user:response})
                    })
                        
                    
                })
            }

          
        })
    }
}