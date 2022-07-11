const express = require("express")
const app = express()
const cors = require("cors")

app.use(cors())

// Call router
const paket = require("./router/CRUD-Paket")
const member = require("./router/CRUD-Member")
const user = require("./router/CRUD-User")
const transaksi = require("./router/CRUD-Transaksi")
const { login } = require("./router/login")

app.use(express.static(__dirname))

app.use("/laundry/api/paket", paket)
app.use("/laundry/api/member", member)
app.use("/laundry/api/user", user)
app.use("/laundry/api/transaksi", transaksi)
app.use("/laundry/api/auth", login)

app.listen(8000, function(err) {
    if (!err)
        console.log("server run on port 8000");
    else console.log(err)
})