const express = require("express")
const app = express()

// call model for paket
const paket = require("../models/index").paket

// *** call auth ***
// panggil fungsi auth -> validasi token
const { auth } = require("./login")

// fungsi auth dijadikan middleware
app.use(auth)
    // ---------------------------------

// ---LIBRARY u/ upload file---
// Multer digunakan u/ membaca request dari form-data
const multer = require("multer")

// path digunakan u/ manage direkotori file
const path = require("path")

// fs digunakan u/ mengatur file
const fs = require("fs")

// menentukan di mana file akan disimpan
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./image")
    },
    filename: (req, file, cb) => {
        cb(null, "img-" + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

// end point menampilkan data paket dengan method GET
app.get("/", (req, res) => {
    paket.findAll()
        .then(paket => {
            res.json(paket)
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

// GET data BY ID
app.get("/:id_paket", (req, res) => {
    paket.findOne({
            where: {
                id_paket: req.params.id_paket
            }
        })
        .then(paket => {
            res.json(paket)
        })
        .catch(err => {
            res.json({
                message: err.message
            })
        })
})

//INSERT DATA
app.post("/", upload.single("image"), (req, res) => {
    if (!req.file) {
        res.json({
            message: "no uploaded image"
        })
    } else {
        // menampung data request yang akan dimasukkan
        let newPaket = {
            jenis: req.body.jenis,
            harga: req.body.harga,
            image: req.file.filename
        }

        // execute insert data
        paket.create(newPaket)
            .then(result => {
                res.json({
                    message: "data has been inserted",
                    data: result
                })
            })
            .catch(err => {
                res.json({
                    message: err.message
                })
            })
    }
})

// Endpoint untuk EDIT DATA
app.put("/", upload.single("image"), async(req, res) => {
    // menampung id yang menunjukkan data yang akan diubah
    let param = {
        id_paket: req.body.id_paket
    }

    // tampung data request yang akan diubah
    let data = {
        jenis: req.body.jenis,
        harga: req.body.harga
    }

    if (req.file) {
        // get data by id in parameter
        const row = await paket.findOne({ where: param })
        let oldFileName = row.image

        // delete file lama
        let dir = path.join(__dirname, "../image", oldFileName)
        fs.unlink(dir, err => console.log(err))

        // set file baru
        data.image = req.file.filename
    } else(
        res.json({
            message: "no uploded image"
        })
    )

    // execute update data
    paket.update(data, { where: param })
        .then(result => {
            res.json({
                message: "data has been updated",
                data: result
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

// Endpoint untuk DELETE DATA
app.delete("/:id_paket", async(req, res) => {
    try {
        // tampung data yang akan dihapus berdasarkan id
        let param = {
            id_paket: req.params.id_paket
        }
        let result = await paket.findOne({ where: param })
        let oldFileName = result.image

        // delete old image
        let dir = path.join(__dirname, "../image", oldFileName)
        fs.unlink(dir, err => console.log(err))

        // execute delete data
        paket.destroy({ where: param })
            .then(result => {
                res.json({
                    message: "data has been deleted"
                })
            })
            .catch(error => {
                res.json({
                    message: error.message
                })
            })
    } catch (err) {
        res.json({
            message: err.message
        })
    }
})

module.exports = app