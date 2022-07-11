const express = require("express")
const app = express()

// CALL MODEL
const models = require("../models/index")
const transaksi = models.transaksi
const detail_transaksi = models.detail_transaksi

// middleware to allow request from body
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// *** call auth ***
// panggil fungsi auth -> validasi token
const { auth } = require("./login")

// fungsi auth dijadikan middleware
app.use(auth)
    // ---------------------------------

// Endpoint GET ALL DATA 
app.get("/", async(req, res) => {
    let dataTrans = await transaksi.findAll({
        include: [
            { model: models.member, as: 'member' },
            { model: models.user, as: 'user' },
            {
                model: models.detail_transaksi,
                as: 'detail_transaksi',
                include: [
                    { model: models.paket, as: 'paket' }
                ]
            }
        ]
    })
    res.json(dataTrans)
})

// GET DATA BY ID TRANSAKSI
app.get("/:id_transaksi", (req, res) => {
    let id_transaksi = {
        id_transaksi: req.params.id_transaksi
    }

    transaksi.findOne({
            where: id_transaksi,
            include: [{ all: true, nested: true }]
        })
        .then(result => {
            if (result) {
                res.json({
                    message: "Data found",
                    data_transaksi: result,
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

// ADD DATA
app.post("/", async(req, res) => {
    let tanggal = req.body.tgl

    let newTransaksi = {
        id_member: req.body.id_member,
        tgl: req.body.tgl,
        batas_waktu: req.body.batas_waktu,
        tgl_bayar: tanggal,
        status: 1,
        dibayar: req.body.dibayar,
        id_user: req.body.id_user
    }

    transaksi.create(newTransaksi)
        .then(result => {
            // jika insert transaksi berhasil, lanjut
            // insert data detail transaksinya
            let newIDTransaksi = result.id_transaksi

            // detail = req.body.detail_transaksi // INI APAAAA
            // for (let i = 0; i < detail.length; i++) {  // ERROR DI SINI
            //     // sebelumnya
            //     // nilai detail[i] hanya punya key id_paket
            //     // dan qty saja
            //     detail[i].id_transaksi = newIDTransaksi
            // }

            detail = req.body.detail_transaksi
            detail.forEach(element => {
                element.id_transaksi = newIDTransaksi
            });
            console.log(detail);

            // PROSES INSERT detail_transaksi
            detail_transaksi.bulkCreate(detail)
                .then(result => {
                    return res.json({
                        message: "Data transaksi berhasil ditambahkan"
                    })
                })
                .catch(err => {
                    return res.json({
                        message: err.message
                    })
                })
        })
        .catch(err => {
            return res.json({
                message: err.message
            })
        })
})

// endpoint untuk mengubah data dengan method PUT
app.put("/:id_transaksi", async(req, res) => {
    let current = new Date().toISOString().split('T')[0]

    // tampung data untuk update transaksi
    let dataTransaksi = {
        id_member: req.body.id_member,
        tgl: req.body.tgl,
        batas_waktu: req.body.batas_waktu,
        tgl_bayar: current,
        status: req.body.status,
        dibayar: req.body.dibayar,
        id_user: req.body.id_user
    }

    // tampung parameter id_transaksi
    let parameter = {
        id_transaksi: req.params.id_transaksi
    }

    transaksi.update(dataTransaksi, { where: parameter })
        .then(async(result) => {
            // hapus data detail transaksi yang lama
            await detail_transaksi.destroy({ where: parameter })

            // masukkan data detail yang baru
            let detail = req.body.detail_transaksi
            for (let i = 0; i < detail.length; i++) { //perulangan ini gimana caranya????
                // sebelumnya
                // nilai detail[i] hanya punya key id_paket
                // dan qty saja
                detail[i].id_transaksi = req.params.id_transaksi
            }

            // proses insert detail_transaksi
            detail_transaksi.bulkCreate(detail)
                .then(result => {
                    return res.json({
                        message: "data transaksi berhasil diubah"
                    })
                })
                .catch(error => {
                    return res.json({
                        message: error.message
                    })
                })
        })
        .catch(error => {
            return res.json({
                message: error.message
            })
        })
})

app.delete("/:id_transaksi", async(req, res) => {
    // tammpung parameter id_transaksi
    let param = {
        id_transaksi: req.params.id_transaksi
    }

    try {
        // hapus data detail transaksi
        await detail_transaksi.destroy({ where: param })
            // hapus data transaksi
        await transaksi.destroy({ where: param })
        res.json({
            message: "Data telah dihapus"
        })
    } catch (error) {
        res.json({
            message: error
        })
    }
})

// endpoint untuk mengubah status transaksi
app.post("/status/:id_transaksi", (request, response) => {
    // tampung nilai status
    // const dibayar = request.body.dibayar
    // let parameter = {
    //     id_transaksi: request.params.id_transaksi
    // }

    // if (dibayar === 0) {
    //     let data = {
    //         status: request.body.status,
    //         dibayar: request.body.dibayar
    //     }
    //     transaksi.update(data, { where: parameter })
    //         .then(result => {
    //             return response.json({
    //                 message: `Data `,
    //                 data: result

    //             })
    //         })
    //         .catch(error => {
    //             return response.json({
    //                 message: error.message
    //             })
    //         })
    // } else {
    //     let data1 = {
    //         status: request.body.status,
    //         dibayar: request.body.dibayar,
    //         tgl_bayar: new Date().toISOString().split("T")[0]
    //     }
    //     transaksi.update(data1, { where: parameter })
    //         .then(result => {
    //             return response.json({
    //                 message: `Data1 `,
    //                 data: result

    //             })
    //         })
    //         .catch(error => {
    //             return response.json({
    //                 message: error.message
    //             })
    //         })
    // }

    let data = {
            status: request.body.status
        }
        //tampung parameter
    let parameter = {
        id_transaksi: request.params.id_transaksi
    }
    transaksi.update(data, { where: parameter })
        .then(result => {
            return response.json({
                message: `Data status berhasil diubah`
            })
        })
        .catch(error => {
            return response.json({
                message: error.message
            })
        })

})

// end point untuk mengubah status pembayaran
app.get("/bayar/:id_transaksi", (req, res) => {
    let parameter = {
        id_transaksi: req.params.id_transaksi
    }

    let data = {
        // mendapatkan tgl saat ini berjalan
        tgl_bayar: new Date().toISOString().split("T")[0],
        dibayar: false
    }

    // proses ubah transaksi
    transaksi.update(data, { where: parameter })
        .then(result => {
            return response.json({
                message: "Transaksi berhasil diiubah"
            })
        })
        .catch(error => {
            return res.json({
                message: error.message
            })
        })
})

module.exports = app