var db = require("../config/connection")
var collections = require("../config/collections")
var objectId = require('mongodb').ObjectID
const bcrypt = require('bcrypt')
const { resolve } = require("path")


module.exports = {
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ username: adminData.username })
            if (admin) {
                bcrypt.compare(adminData.password, admin.password).then((response) => {


                    if (response) {
                        
                        resolve({ admin: true, status: true , adminDetails:admin })
                        

                    }
                    else {
                        resolve({
                            admin: true,
                            status: false
                        })
                    }
                })
            } else {
                resolve({ admin: false, status: false })
            }

        })
    },
    doSignup: async (adminData) => {
        admin = {
            username: adminData.username,
            email: adminData.email,
            password: await bcrypt.hash(adminData.password, 10)

        }
        return new Promise(async (resolve,reject) => {
            let adminCheck = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ username: adminData.username })
            

            if(adminCheck){
                resolve({ status: false, message: 'username already in use' })
            }else{
                db.get().collection(collections.ADMIN_COLLECTION).insertOne(admin).then((result) => {
                    db.get().collection(collections.ADMIN_COLLECTION).findOne({_id:result.insertedId}).then((response)=>{
                        resolve({status: true ,admin:response})
                    })
                        
                    
                })
            }

          
        })
    },
    getUsers: ()=>{
        return new Promise (async(resolve,reject)=>{
            let users = await db.get().collection(collections.USER_COLLECTION).find({}).toArray();
            resolve(users)

        })
    },
    deleteUser: (userId)=>{
        return new Promise (async (resolve,reject)=>{
            await db.get().collection(collections.USER_COLLECTION).deleteOne({_id:objectId(userId)});
            resolve();
        })
    },
    getUserDetails: (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user  = await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(userId)})
            resolve(user)
        })
    },
    editUserDetails: (userId, data)=>{
        return new Promise(async (resolve,reject)=>{
            await db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},
                {$set:{
                email:data.email,
                username:data.username,

            }});
            resolve();
        })
    },

    createUser: async (userData) => {
        user = {
            username: userData.username,
            email: userData.email,
            password: await bcrypt.hash(userData.password, 10)

        }
        return new Promise(async (resolve,reject) => {
            let userCheck = await db.get().collection(collections.USER_COLLECTION).findOne({ username: userData.username })
            

            if(userCheck){
                resolve({ status: false, message: 'username already in use' })
            }else{
                db.get().collection(collections.USER_COLLECTION).insertOne(user).then((result) => {
                   
                        resolve({status:true});
                    
                })
            }

          
        })
    },
    checkUserExist: (username)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).findOne({username:username}).then((result)=>{
                if(result){
                    resolve({status:false})
                }
                else{
                    resolve({status:true})
                }
            })
        })
    },
    searchUser: (searchData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).find({$or:
                [
                    {username:{$regex:searchData}},
                    {email:{$regex:searchData}}
                ]
            }).toArray().then((users)=>{
               resolve(users);
            })
        })
    }
    

}