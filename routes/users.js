// 5
const express = require("express");
const bcrypt = require("bcrypt");
const { UserModel, userValid, loginValid, createToken } = require("../models/userModel");
const { auth, authAdmin } = require("../middlewares/auth");
const router = express.Router();



//get all by token admin
router.get("/usersList", authAdmin, async (req, res) => {
  try {
    let data = await UserModel.find({}, { password: 0 });
    res.json(data)
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

//sing in
router.post("/", async (req, res) => {
  let valdiateBody = userValid(req.body);
  if (valdiateBody.error) {
    return res.status(400).json(valdiateBody.error.details)
  }
  try {
    let user = new UserModel(req.body);
    user.password = await bcrypt.hash(user.password, 10)
    await user.save();
    user.password = "*********";
    res.status(201).json(user)
  }
  catch (err) {
    if (err.code == 11000) {
      return res.status(400).json({ msg: "Email already in system try login", code: 11000 })
    }
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

//login
router.post("/login", async (req, res) => {
  let valdiateBody = loginValid(req.body);
  if (valdiateBody.error) {
    return res.status(400).json(valdiateBody.error.details)
  }
  try {
    let user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
      return res.status(401).json({ msg: "User and password not match code 1 " })
    }
    let validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ msg: "User and password not match code 2" })
    }
    let newToken = createToken(user._id, user.role);
    res.json({ token: newToken });
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

//get info by token
router.get("/myInfo",auth, async (req, res) => {
  try {
    // console.log(req.tokenData);
    let user = await UserModel.findOne({ _id: req.tokenData.user_id },
      { password: 0 });
    user.password = "***********";
    res.json(user);
  }
  catch (err) {
    return res.status(401).json({ msg: err })
  }

})

//delete by token
router.delete("/:idDel", auth, async (req, res) => {
  let idDel = req.params.idDel;
  try {

    let data;
    if (req.tokenData._role == "admin") {
      data = await UserModel.deleteOne({ _id: idDel });
    }
    else if (idDel == req.tokenData.user_id) {
      data = await UserModel.deleteOne({ _id: idDel });
    }
    else {
      data = [{ status: "failed", msg: "You are trying to do an operation that is not enabled!" }]
    }
    res.json(data);

  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
})

//update by token
router.put("/:idEdit", auth, async (req, res) => {
  let idEdit = req.params.idEdit;
  let validBody = userValid(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try{

    let data;
    if (req.tokenData._role == "admin") {
      req.body.password = await bcrypt.hash(req.body.password, 10)

      data = await UserModel.updateOne({ _id: idEdit }, req.body);
    }
    else if (idEdit == req.tokenData.user_id) {
      req.body.password = await bcrypt.hash(req.body.password, 10)

      data = await UserModel.updateOne({ _id: idEdit }, req.body);
    }
    else {
      data = [{ status: "failed", msg: "You are trying to do an operation that is not enabled!" }]
    }
    res.json(data);

  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
})



module.exports = router;