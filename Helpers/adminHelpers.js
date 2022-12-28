var db = require("../config/connection")
var collections = require("../config/collections")
var objectId = require('mongodb').ObjectID
const bcrypt = require('bcrypt')
const { resolve } = require("path")


module.exports = {
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ _id: adminData.username })
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
            _id: adminData.username,
            email: adminData.email,
            password: await bcrypt.hash(adminData.password, 10)

        }
        return new Promise(async (resolve,reject) => {
            let adminCheck = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ _id: adminData.username })
            

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
            await db.get().collection(collections.USER_COLLECTION).deleteOne({_id:userId});
            resolve();
        })
    },
    getUserDetails: (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user  = await db.get().collection(collections.USER_COLLECTION).findOne({_id:userId})
            resolve(user)
        })
    },
    editUserDetails: (userId, emailId)=>{
        return new Promise(async (resolve,reject)=>{
            await db.get().collection(collections.USER_COLLECTION).updateOne({_id:userId},{$set:{email:emailId}});
            resolve();
        })
    },

    createUser: async (userData) => {
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
                   
                        resolve({status:true});
                    
                })
            }

          
        })
    }
    

}