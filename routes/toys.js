const express = require("express");
const { auth } = require("../middlewares/auth");
const { ToyModel, toyValid } = require("../models/toyModel")
const router = express.Router();



//get all
router.get("/", async (req, res) => {
    let perPage = Math.min(req.query.perPage, 10) || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? -1 : 1;
    try {
        let data = await ToyModel
            .find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })
        res.json(data);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }

})

//get by id
router.get("/single/:id", async (req, res) => {
    let id = req.params.id;
    let perPage = Math.min(req.query.perPage, 10) || 10;
    let page = req.query.page || 1;

    try {
        let data = await ToyModel.find({ _id: id })
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

//get by category name
router.get("category/:catName", async (req, res) => {
    let catName = req.params.catName;
    let perPage = Math.min(req.query.perPage, 10) || 10;
    let page = req.query.page || 1;

    try {
        let data = await ToyModel.find({ category: catName })
            .limit(perPage)
            .skip((page - 1) * perPage);
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

//get by min and max price(you can send min and max or min or max or nothing)
router.get("/prices", async (req, res) => {
    const minPrice = req.query.min;
    const maxPrice = req.query.max;
    try {
        let data;
        if (minPrice && maxPrice) {
            data = await ToyModel.find({ price: { $gte: minPrice, $lte: maxPrice } });
            res.json([{
                status: "200",
                data
            }]);
        }
        else if (minPrice) {
            data = await ToyModel.find({ price: { $gte: minPrice } });
            res.json([{
                status: "200",
                data
            }]);
        }
        else if (maxPrice) {
            data = await ToyModel.find({ price: { $lte: maxPrice } });
            res.json([{
                status: "200",
                data
            }]);
        }
        else {
            data = await ToyModel.find({});
            res.json([{
                status: "200",
                data
            }]);
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

//search by name or info 
router.get("/search", async (req, res) => {
    let perPage = Math.min(req.query.perPage, 10) || 10;
    let page = req.query.page || 1;

    try {
        let queryS = req.query.s;
        let searchReg = new RegExp(queryS, "i")
        let data = await ToyModel.find({ $or: [{ name: searchReg }, { info: searchReg }] })
            .limit(perPage)
            .skip((page - 1) * perPage);
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

//add toy by token
router.post("/", auth, async (req, res) => {
    let validateBody = toyValid(req.body);
    if (validateBody.error) {
        return res.status(400).json(validateBody.error.details)
    }
    try {
        let toy = new ToyModel(req.body);
        toy.user_id = req.tokenData.user_id;
        await toy.save();
        res.status(201).json(toy)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

//update toy by token
router.put("/:idEdit", auth, async (req, res) => {
    let validateBody = toyValid(req.body);
    if (validateBody.error) {
        return res.status(400).json(validateBody.error.details)
    }
    let idEdit = req.params.idEdit;
    try {
        let data, status;
        if (req.tokenData._role == "admin") {
            data = await ToyModel.updateOne({ _id: idEdit }, req.body);
            status = [{
                status: "200 success",
                msg: "an admin operation"
            }];
        }
        else //if (idEdit == req.tokenData.user_id) {
        {
            data = await ToyModel.updateOne({ _id: idEdit, user_id: req.tokenData.user_id }, req.body);
            status = [{
                status: "200 success",
                msg: "an user operation"
            }];
        }
        if (data.modifiedCount == 0) {
            // console.log("Error updating, You are trying to do an operation that is not enabled!");
            // res.status(555).json({ msg: "Error updating, You are trying to do an operation that is not enabled!" })
            data = [{ msg: "Error updating, You are trying to do an operation that is not enabled! or you don't change nothing..." }];
            status = [{
                status: "failed",
                msg: "an enable operation"
            }];
        }
        res.json([{
            status,
            data
        }]);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

//delete toy by token
router.delete("/:idDel", auth, async (req, res) => {
    let idDel = req.params.idDel
    try {
        let data, status;
        if (req.tokenData._role == "admin") {
            data = await ToyModel.updateOne({ _id: idDel }, req.body);
            status = [{
                status: "200 success",
                msg: "an admin operation"
            }];
        }
        else //if (idEdit == req.tokenData.user_id) {
        {
            data = await ToyModel.updateOne({ _id: idDel, user_id: req.tokenData.user_id }, req.body);
            status = [{
                status: "200 success",
                msg: "an user operation"
            }];
        }
        if (data.modifiedCount == 0) {
            // console.log("Error updating, You are trying to do an operation that is not enabled!");
            // res.status(555).json({ msg: "Error updating, You are trying to do an operation that is not enabled!" })
            data = [{ msg: "Error updating, You are trying to do an operation that is not enabled! or you don't change nothing..." }];
            status = [{
                status: "failed",
                msg: "an enable operation"
            }];
        }
        res.json([{
            status,
            data
        }]);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})


module.exports = router;