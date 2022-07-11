const express = require("express")
const app = express()

const member = require("../models/index").member

// allow request from body
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// *** call auth ***
// panggil fungsi auth -> validasi token
const {auth} = require("./login")

// fungsi auth dijadikan middleware
app.use(auth)
// ---------------------------------

// GET DATA by ID
app.get("/:id_member", (req,res) => {
    let id_member = {
        id_member: req.params.id_member
    }

    member.findOne({
        where: id_member
    })
    .then(result => {
        if(result){
            res.json({
                message: "Data found",
                data_member: result,
                found: true
            })
        } else {
            res.json({
                message: "Data not found",
                found: false
            })
        }
    })
    .catch(err => {
        res.json({
            message: err.message
        })
    })
})

// GET MEMBER ALL DATA
app.get("/", (req,res) => { 
    member.findAll()
    .then(result => {
        res.json(result)
        // res.json({
        //     message: "Data found",
        //     member: result
        // })
    })
    .catch(err => {
        res.json({
            message: err.message
        })
    })
})

// ADD DATA
app.post("/", async(req,res) => {
    let newMamber = {
        nama_member: req.body.nama_member,
        alamat: req.body.alamat,
        jenis_kelamin: req.body.jenis_kelamin,
        tlp: req.body.tlp
    }

    // execute insert new member
    member.create(newMamber)
    .then(result => {
        res.json({
            message: "Data inserted",
            data: result
        })
    })
    .catch(err => {
        res.json({
            message: err.message
        })
    })
})

// UPDATE DATA
// app.put("/:id_member", async(req,res) => {
//     let param = {
//         id_member: req.params.id_member
//     }

//     const mmbr = await member.findOne({
//         where: param
//     })

//     if(mmbr){
//         let data = {
//             nama_member: req.body.nama_member,
//             alamat: req.body.alamat,
//             jenis_kelamin: req.body.jenis_kelamin,
//             tlp: req.body.tlp
//         } 

//         member.update(data, {where: param})
//         .then(result => {
//             res.json({
//                 message: "Data updated",
//                 data: result
//             })
//         })
//         .catch(err => {
//             res.json({
//                 message: err.message
//             })
//         })
//     } else {
//         res.json({
//             message: "Member hasn't registered before"
//         })
//     }
// })

app.put("/", async(req, res) => {
    // key yg menunjukkan data yg akan diubah
    let param = {
        id_member: req.body.id_member
    }

    // tampung data request yg akan diubah
    let data = {
        nama_member: req.body.nama_member,
        alamat: req.body.alamat,
        jenis_kelamin: req.body.jenis_kelamin,
        tlp: req.body.tlp
    }

    // execute update data
    member.update(data, {where: param})
    .then(result => {
        res.json({
            message: "Data Updated",
            data: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

// DELETE DATA
app.delete("/:id_member", async(req,res) => {
    let param = {
        id_member: req.params.id_member
    }

    const mmbr = await member.findOne({
        where: param
    })

    if(mmbr) {
        member.destroy({where: param})
        .then(result => {
            res.json({
                message: "Data deleted",
                data: result
            })
        })
        .catch(err => {
            res.json({
                message: err.message
            })
        })
    } else{
        res.json({
            message: "Member hasn't registered before"
        })
    }
})

module.exports = app
