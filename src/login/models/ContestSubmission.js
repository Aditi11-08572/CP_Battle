const mongoose = require('mongoose');

const contestSubmissionSchema = new mongoose.Schema({
  contestId: String,
  contestName: String,
  participants: Number,
  questions: Array,
  duration: String,
  userHandle: String,
  totalPoints: Number,
  solvedProblems: Array,
  problemStatuses: Object,
  finishTime: Date,
  submittedAt: { type: Date, default: Date.now }
});

const ContestSubmission = mongoose.model('ContestSubmission', contestSubmissionSchema);

module.exports = ContestSubmission;
