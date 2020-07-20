const mongoose = require("mongoose");
const Team = require("../models/team");
const User = require("../models/user");

exports.getTeams = (req, res, next) => {
  Team.find()

    .exec()
    .then((result) => res.status(201).json(result))
    .catch((err) =>
      res.status(500).json({
        error: err,
      })
    );
};

exports.createTeam = async (req, res, next) => {
  try {
    let id = Math.floor(Math.random() * 100000000);
    let teams = await Team.find({ teamId: id });
    while (teams.length > 0) {
      id = Math.floor(Math.random() * 1000000000);
      teams = await Team.find({ teamId: id });
    }
    const team = {
      _id: mongoose.Types.ObjectId(),
      teamName: req.body.name,
      teamId: id.toString(),
      secret: Math.floor(Math.random() * 1000000).toString(),
      users: [req.body.userid],
      transactions: {
        from: [],
        to: [],
        amount: [],
      },
    };
    const newTeam = new Team(team);
    await newTeam.save();
    res.send(team);
  } catch (e) {
    console.log(e);
    res.send({ message: "Error!" });
  }
};

exports.addUser = (req, res, next) => {
  const teamId = req.body.teamid;
  const email = req.body.email;
  User.findOne({ email: email })
    .exec()
    .then((user) => {
      let teams = [];
      teams = user.teams;
      let userId = user._id;
      teams.push(teamId);
      User.findOneAndUpdate({ _id: userId }, { teams: teams })
        .exec()
        .then((resp) => {
          Team.findById({ _id: teamId })
            .exec()
            .then((team) => {
              let arr = [];
              arr = team.users;
              arr.push(userId);
              Team.findOneAndUpdate({ _id: teamId }, { users: arr })
                .exec()
                .then((result) => {
                  res.status(201).json(result);
                });
            });
        });
    });
};

exports.joinTeam = (req, res, next) => {
  const teamId = req.body.teamid;
  const secret = req.body.secret;
  const userId = req.body.userid;
  Team.findOne({ teamId: teamId })
    .exec()
    .then((team) => {
      if (team == null) return res.send("Team not found");
      if (team.secret != secret) return res.send("Incorrect password");
      let users = [];
      users = team.users;
      let teamUid = team._id;
      users.push(userId);
      Team.findOneAndUpdate({ _id: team._id }, { users: users })
        .exec()
        .then((result) => {
          User.findById({ _id: userId })
            .exec()
            .then((user) => {
              let teams = [];
              teams = user.teams;
              teams.push(teamUid);
              User.findOneAndUpdate({ _id: userId }, { teams: teams })
                .exec()
                .then((resp) => {
                  res.json(resp);
                });
            });
        });
    });
};