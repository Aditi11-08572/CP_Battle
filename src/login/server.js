const bcryptjs = require('bcryptjs');
const { hash, compare } = bcryptjs;
const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const ContestSubmission = require('./models/ContestSubmission');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/auth', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Update the user schema to include codeforcesId
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    photo: String, // Add this line
    otp: String,
    otpExpires: Date,
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    codeforcesId: String, // Add this line
    rating: { type: Number, default: 0 }, // Add this line
    location: { type: String, default: '' },
    profile_pic: { type: String, default: '' },
    college: { type: String, default: '' },
    whatsappNumber: String,
    linkedinUrl: String,
});

const User = mongoose.model('User', userSchema);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'laxmikant.mahindrakar@walchandsangli.ac.in',
        pass: 'umko baqo wjah pyjo'
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Update the Contest schema to include a unique contestCode
const contestSchema = new mongoose.Schema({
  contestName: { type: String, required: true },
  participants: { type: Number, required: true },
  questions: { type: Number, required: true },
  minRating: { type: Number, required: true },
  maxRating: { type: Number, required: true },
  duration: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }, // Add this line
  selectedTags: [String],
  contestCode: { type: String, unique: true, required: true },
  userEmail: { type: String, required: true },
  registeredUsers: [String], // Add this line
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true }
});

const Contest = mongoose.model('Contest', contestSchema);

// Function to generate a unique contest code
const generateUniqueContestCode = async () => {
  while (true) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existingContest = await Contest.findOne({ contestCode: code });
    if (!existingContest) {
      return code;
    }
  }
};

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userEmail: String,
  senderEmail: String, // Make sure this is included
  message: String,
  contestCode: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

// Fetch notifications for a user
app.get('/api/notifications/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;
    console.log('Fetching notifications for:', userEmail);
    const notifications = await Notification.find({ userEmail }).sort({ createdAt: -1 }).limit(20);
    console.log('Found notifications:', notifications);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark all notifications as read
app.post('/api/notifications/:userEmail/mark-read', async (req, res) => {
  try {
    const { userEmail } = req.params;
    await Notification.updateMany({ userEmail, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Error marking notifications as read' });
  }
});

const lockMap = new Map();

app.post('/api/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    console.log('Received request to send OTP to:', email);

    if (lockMap.get(email)) {
        console.log('OTP generation in progress for:', email);
        return res.status(429).json({ message: 'OTP generation in progress. Please wait.' });
    }

    lockMap.set(email, true);

    try {
        // Delete any existing OTP for this email
        await TempOTP.deleteOne({ email });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        console.log('Generated OTP:', otp);

        const newOTP = new TempOTP({ email, otp, otpExpires });
        await newOTP.save();
        console.log('OTP stored in TempOTP collection:', newOTP);

        await transporter.sendMail({
            from: 'laxmikant.mahindrakar@walchandsangli.ac.in',
            to: email,
            subject: 'Email Verification OTP',
            text: `Your OTP for email verification is: ${otp}`
        });
        console.log('Email sent successfully with OTP:', otp);

        res.json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error('Error in send-otp:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    } finally {
        lockMap.delete(email);
    }
});

app.post('/api/auth/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    console.log('Received OTP verification request for:', email, 'OTP:', otp);

    try {
        const tempOTP = await TempOTP.findOne({ email }).sort({ _id: -1 });
        console.log('Found TempOTP record:', tempOTP);

        if (!tempOTP) {
            return res.status(400).json({ message: 'No OTP found for this email' });
        }

        if (tempOTP.otp !== otp) {
            console.log('OTP mismatch. Received:', otp, 'Stored:', tempOTP.otp);
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (tempOTP.otpExpires < new Date()) {
            console.log('OTP expired. Expiry:', tempOTP.otpExpires, 'Current time:', new Date());
            return res.status(400).json({ message: 'OTP has expired' });
        }

        await TempOTP.deleteOne({ _id: tempOTP._id });
        console.log('OTP verified successfully and removed from TempOTP');

        res.json({ message: 'OTP verified successfully' });
    } catch (err) {
        console.error('Error in verify-otp:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Add this new route to check if a user exists
app.post('/api/auth/check-user', async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Account with this Email Already Exists' });
        }
        res.json({ message: 'Email is available' });
    } catch (err) {
        console.error('Error checking user:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Modify the existing signup route to include this check as well
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password, codeforcesId } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Account with this Email Already Exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully');

        const newUser = new User({ name, email, password: hashedPassword, codeforcesId });
        console.log('New user object created:', newUser);

        await newUser.save();
        console.log('New user saved to database');

        const token = jwt.sign({ userId: newUser._id }, 'your_jwt_secret', { expiresIn: '1h' });
        console.log('JWT token generated');

        res.json({ message: 'User registered successfully', token });
    } catch (err) {
        console.error('Error in signup:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ 
      token, 
      user: { 
        _id: user._id.toString(), // Ensure we're sending the ID
        name: user.name, 
        email: user.email 
      }
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const hashedPassword = await hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update the friend suggestions endpoint
app.get('/api/friends/suggestions/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log(`Fetching friend suggestions for user ID: ${userId}`);

  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find all users except the current user and their friends
    const suggestions = await User.find({
      _id: { $ne: userId, $nin: currentUser.friends },
    }).select('name email codeforcesId rating');

    console.log(`Found ${suggestions.length} friend suggestions`);
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching friend suggestions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update the sent requests endpoint
app.get('/api/friends/sent-requests/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const sentRequests = await User.find({
            _id: { $nin: user.friends },
            friendRequests: req.params.userId
        }).select('name email photo');

        res.status(200).json(sentRequests);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update the friend requests endpoint
app.get('/api/friends/requests/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const friendRequests = await User.find({
            _id: { $in: user.friendRequests, $nin: user.friends }
        }).select('name email photo');

        res.status(200).json(friendRequests);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send friend request
app.post('/api/friends/send-request', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (receiver.friendRequests.includes(senderId)) {
            return res.status(400).json({ message: 'Friend request already sent' });
        }
        receiver.friendRequests.push(senderId);
        await receiver.save();
        res.status(200).json({ message: 'Friend request sent successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get friend requests
app.get('/api/friends/requests/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('friendRequests', 'name email photo');
        res.status(200).json(user.friendRequests);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Accept friend request
app.post('/api/friends/accept-request', async (req, res) => {
    try {
        const { userId, friendId } = req.body;
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId);
        user.friends.push(friendId);
        friend.friends.push(userId);

        await user.save();
        await friend.save();

        res.status(200).json({ message: 'Friend request accepted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Reject friend request
app.post('/api/friends/reject-request', async (req, res) => {
    try {
        const { userId, friendId } = req.body;
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId);
        await user.save();

        // Remove the sent request from the other user
        friend.friendRequests = friend.friendRequests.filter(id => id.toString() !== userId);
        await friend.save();

        res.status(200).json({ message: 'Friend request rejected' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get friends list
app.get('/api/friends/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const friends = await User.find({
      _id: { $in: user.friends }
    }).select('name codeforcesId profile_pic whatsappNumber linkedinUrl');

    res.status(200).json(friends);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this new endpoint for canceling friend requests
app.post('/api/friends/cancel-request', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        console.log('Canceling request:', { senderId, receiverId });

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            console.log('User not found:', { sender: !!sender, receiver: !!receiver });
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Before cancellation:', {
            receiverFriendRequests: receiver.friendRequests
        });

        // Remove the request from the receiver's friendRequests
        receiver.friendRequests = receiver.friendRequests.filter(id => id.toString() !== senderId);
        await receiver.save();

        console.log('After cancellation:', {
            receiverFriendRequests: receiver.friendRequests
        });

        res.status(200).json({ message: 'Friend request canceled successfully' });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Add this new endpoint for removing friends
app.post('/api/friends/remove-friend', async (req, res) => {
    try {
        const { userId, friendId } = req.body;
        console.log('Removing friend:', { userId, friendId });

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            console.log('User or friend not found:', { user: !!user, friend: !!friend });
            return res.status(404).json({ message: 'User or friend not found' });
        }

        console.log('Before removal:', {
            userFriends: user.friends,
            friendFriends: friend.friends
        });

        // Remove friend from user's friends list
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        await user.save();

        // Remove user from friend's friends list
        friend.friends = friend.friends.filter(id => id.toString() !== userId);
        await friend.save();

        console.log('After removal:', {
            userFriends: user.friends,
            friendFriends: friend.friends
        });

        res.status(200).json({ message: 'Friend removed successfully' });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Add this function to determine difficulty
function getDifficultyLevel(minRating, maxRating) {
  const averageRating = (minRating + maxRating) / 2;
  if (averageRating < 1200) return 'Easy';
  if (averageRating < 1800) return 'Medium';
  return 'Hard';
}

// Update the contest creation route
app.post('/api/contests', async (req, res) => {
  try {
    const { 
      userEmail, 
      contestName, 
      participants, 
      questions, 
      minRating, 
      maxRating, 
      duration, 
      startDate, 
      selectedTags 
    } = req.body;

    if (!userEmail || !contestName || !participants || !questions || !duration || !startDate) {
      return res.status(400).json({ message: 'Missing required contest fields' });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000);

    const difficulty = getDifficultyLevel(minRating, maxRating);

    const newContest = new Contest({
      contestName,
      participants,
      questions,
      minRating,
      maxRating,
      duration,
      startDate: startDateTime,
      endDate: endDateTime,
      selectedTags,
      userEmail,
      registeredUsers: [userEmail],
      difficulty // Add this line
    });

    const contestCode = await generateUniqueContestCode();
    newContest.contestCode = contestCode;

    await newContest.save();

    res.status(201).json(newContest);
  } catch (error) {
    console.error('Error creating contest:', error);
    res.status(500).json({ message: 'Error creating contest', error: error.message });
  }
});

// Add a route to fetch contest details by contest code
app.get('/api/contests/:contestCode', async (req, res) => {
  try {
    const { contestCode } = req.params;
    const { userEmail } = req.query;

    const contest = await Contest.findOne({ contestCode });
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    const isUserRegistered = contest.registeredUsers.includes(userEmail);
    const isUserInvited = await checkIfUserInvited(userEmail, contestCode);

    res.json({
      ...contest.toObject(),
      isUserRegistered,
      isUserInvited
    });
  } catch (error) {
    console.error('Error fetching contest:', error);
    res.status(500).json({ message: 'Error fetching contest information' });
  }
});

// Helper function to check if user is invited
async function checkIfUserInvited(userEmail, contestCode) {
  const invitation = await Notification.findOne({
    userEmail,
    contestCode,
    message: { $regex: 'invited you to join the contest' }
  });
  return !!invitation;
}

// New route for adding friends to a contest
app.post('/api/contests/add-friends', async (req, res) => {
    try {
        const { contestId } = req.body;
        // Implement your logic for adding friends to the contest
        // This could involve updating the contest document or creating new associations

        res.status(200).json({ message: 'Friends added successfully' });
    } catch (error) {
        console.error('Error adding friends to contest:', error);
        res.status(500).json({ message: 'Error adding friends', error: error.message });
    }
});

app.get('/api/contests', async (req, res) => {
  try {
    const contests = await Contest.find(); // Fetch all contests
    res.status(200).json(contests);
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({ message: 'Error fetching contests', error: error.message });
  }
});

app.get('/api/users/:email/friends', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email }).populate('friends');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Error fetching friends' });
  }
});

app.post('/api/contests/invite', async (req, res) => {
  try {
    const { senderEmail, invitedFriends, contestCode, contestName } = req.body;
    
    console.log('Received invite request:', { senderEmail, invitedFriends, contestCode, contestName });

    if (!Array.isArray(invitedFriends) || invitedFriends.length === 0) {
      throw new Error('Invalid or empty invitedFriends array');
    }

    // Fetch user emails for the invited friends
    const invitedUsers = await User.find({ _id: { $in: invitedFriends } }, 'email');
    
    for (const user of invitedUsers) {
      const newNotification = new Notification({
        userEmail: user.email,
        senderEmail: senderEmail,
        message: `${senderEmail} has invited you to join the contest: ${contestName} (Code: ${contestCode})`,
        contestCode: contestCode,
        contestName: contestName,
        read: false
      });
      await newNotification.save();
      console.log(`Notification created for ${user.email}`);
    }
    
    res.status(200).json({ message: 'Friends invited successfully' });
  } catch (error) {
    console.error('Error inviting friends:', error);
    res.status(500).json({ message: 'Error inviting friends', error: error.message });
  }
});

app.get('/api/contests/:contestCode/check-invitation', async (req, res) => {
  console.log('Route hit: /api/contests/:contestCode/check-invitation');
  console.log('Params:', req.params);
  console.log('Query:', req.query);
  
  try {
    const { contestCode } = req.params;
    const { userEmail } = req.query;

    // Your logic here
    
    res.json({ success: true, isInvited: true }); // Modify this based on your actual logic
  } catch (error) {
    console.error('Error checking invitation:', error);
    res.status(500).json({ success: false, message: 'Error checking invitation', error: error.message });
  }
});

app.post('/api/register-contest', async (req, res) => {
  try {
    const { userEmail, contestId } = req.body;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    const isInvited = await checkIfUserInvited(userEmail, contest.contestCode);
    if (!isInvited) {
      return res.status(403).json({ success: false, message: 'You are not invited to this contest' });
    }

    if (contest.registeredUsers.includes(userEmail)) {
      return res.json({ success: true, alreadyRegistered: true });
    }

    contest.registeredUsers.push(userEmail);
    await contest.save();

    res.json({ success: true, alreadyRegistered: false });
  } catch (error) {
    console.error('Error registering for contest:', error);
    res.status(500).json({ success: false, message: 'Error registering for contest' });
  }
});

app.get('/api/user-contests', async (req, res) => {
  try {
    const { userEmail } = req.query;
    console.log('Fetching contests for user:', userEmail);
    const contests = await Contest.find({ registeredUsers: userEmail, startDate: { $gt: new Date() } })
      .sort({ startDate: 1 })
      .limit(10);
    console.log('Found contests:', contests);
    res.json(contests);
  } catch (error) {
    console.error('Error fetching user contests:', error);
    res.status(500).json({ message: 'Error fetching user contests' });
  }
});

app.get('/api/ongoing-contests', async (req, res) => {
  try {
    const { userEmail } = req.query;
    // Assuming you have a Contest model and a way to determine ongoing contests
    const ongoingContests = await Contest.find({
      registeredUsers: userEmail,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).sort({ startDate: 1 });

    res.json(ongoingContests);
  } catch (error) {
    console.error('Error fetching ongoing contests:', error);
    res.status(500).json({ message: 'Error fetching ongoing contests' });
  }
});

app.get('/api/past-contests', async (req, res) => {
  try {
    const { userEmail } = req.query;
    const pastContests = await Contest.find({
      registeredUsers: userEmail,
      endDate: { $lt: new Date() }
    }).sort({ startDate: -1 }).limit(10);

    res.json(pastContests);
  } catch (error) {
    console.error('Error fetching past contests:', error);
    res.status(500).json({ message: 'Error fetching past contests' });
  }
});

app.get('/api/all-past-contests', async (req, res) => {
  try {
    const { userEmail } = req.query;
    // Assuming you have a Contest model
    const allPastContests = await Contest.find({
      registeredUsers: userEmail,
      endDate: { $lt: new Date() }
    }).sort({ startDate: -1 });

    res.json(allPastContests);
  } catch (error) {
    console.error('Error fetching all past contests:', error);
    res.status(500).json({ message: 'Error fetching all past contests' });
  }
});

console.log('All registered routes:');
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
                console.log(`${Object.keys(handler.route.methods)} ${handler.route.path}`);
            }
        });
    }
});

app.post('/api/create-contest', async (req, res) => {
  try {
    const contestData = req.body;
    const newContest = new Contest(contestData);
    await newContest.save();
    res.status(201).json({ message: 'Contest created successfully', contestId: newContest._id });
  } catch (error) {
    console.error('Error creating contest:', error);
    res.status(500).json({ message: 'Error creating contest' });
  }
});

// In your Express.js backend
app.get('/api/user', async (req, res) => {
  try {
    const userEmail = req.query.email;
    if (!userEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ codeforcesId: user.codeforcesId });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put('/api/ratings', async (req, res) => {
  try {
    const { userEmail, newRating } = req.body;
    const user = await User.findOneAndUpdate(
      { email: userEmail },
      { $set: { rating: newRating } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Rating updated successfully', newRating: user.rating });
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ message: 'Error updating rating' });
  }
});

const ELO_K = 400; // Codeforces uses K=400 for their formula

function calculateNewRatings(contestants) {
  const n = contestants.length;
  
  contestants.forEach(c => {
    c.seed = 1;
    contestants.forEach(other => {
      if (other !== c) {
        c.seed += 1 / (1 + Math.pow(10, ((other.rating || 0) - (c.rating || 0)) / ELO_K));
      }
    });
  });

  // Calculate expected rank and rank
  contestants.forEach(c => {
    c.expectedRank = c.seed;
    c.rank = 0.5 + n / 2 - c.points;
  });

  // Calculate rating changes
  contestants.forEach(c => {
    const midRank = Math.sqrt(c.rank * c.expectedRank);
    const perfAsRating = (c.rating || 0) + ELO_K * Math.log((n - midRank) / midRank);
    c.newRating = Math.round(((c.rating || 0) + perfAsRating) / 2);
    c.ratingChange = c.newRating - (c.rating || 0);

    // Ensure newRating is never NaN
    if (isNaN(c.newRating)) {
      c.newRating = c.rating || 0;
      c.ratingChange = 0;
    }
  });

  return contestants;
}

app.post('/api/contests/submit', async (req, res) => {
  try {
    const {
      contestId,
      contestName,
      participants,
      questions,
      duration,
      userHandle,
      totalPoints,
      solvedProblems,
      problemStatuses,
      questionPoints, // Add this line to receive question points
      finishTime
    } = req.body;

    // Create a new contest submission document
    const contestSubmission = new ContestSubmission({
      contestId,
      contestName,
      participants,
      questions: questions.map(q => ({
        questionId: `${q.contestId}-${q.index}`,
        name: q.name,
        points: questionPoints[`${q.contestId}-${q.index}`] || 0 // Use the points from questionPoints
      })),
      duration,
      userHandle,
      totalPoints,
      solvedProblems,
      problemStatuses,
      questionPoints, // Add this line to store question points
      finishTime
    });

    // Save the contest submission to the database
    await contestSubmission.save();

    // After saving the submission, emit an update to all clients in the contest room
    io.to(contestName).emit('rankingsUpdate', { contestName });

    // After saving all submissions, calculate new ratings
    const allSubmissions = await ContestSubmission.find({ contestName: contestName });
    const contestants = await Promise.all(allSubmissions.map(async sub => {
      const user = await User.findOne({ codeforcesId: sub.userHandle });
      return {
        id: sub.userHandle,
        rating: user ? user.rating : 0, // Use the user's current rating or 0 if not found
        points: sub.totalPoints
      };
    }));

    const newRatings = calculateNewRatings(contestants);

    // Update ratings in the database
    for (let contestant of newRatings) {
      const newRating = isNaN(contestant.newRating) ? 0 : contestant.newRating;
      const ratingChange = isNaN(contestant.ratingChange) ? 0 : contestant.ratingChange;
      await User.findOneAndUpdate(
        { codeforcesId: contestant.id },
        { $set: { rating: newRating } }
      );

      await ContestSubmission.findOneAndUpdate(
        { contestName: contestName, userHandle: contestant.id },
        { 
          $set: { 
            newRating: newRating,
            ratingChange: ratingChange
          }
        }
      );
    }

    res.json({ success: true, message: 'Contest submitted and ratings updated successfully' });
  } catch (error) {
    console.error('Error submitting contest:', error);
    res.status(500).json({ success: false, message: 'Failed to submit contest' });
  }
});

app.get('/api/contests/:contestName/rankings', async (req, res) => {
  try {
    const { contestName } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1); // Ensure page is at least 1
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    console.log(`Fetching rankings for contest: ${contestName}, page: ${page}, limit: ${limit}`);
    
    const totalSubmissions = await ContestSubmission.countDocuments({ contestName: contestName });
    const submissions = await ContestSubmission.find({ contestName: contestName })
      .sort({ totalPoints: -1, finishTime: 1 })
      .skip(skip)
      .limit(Number(limit));
    
    const rankings = await Promise.all(submissions.map(async submission => {
      const user = await User.findOne({ codeforcesId: submission.userHandle });
      return {
        userHandle: submission.userHandle,
        totalPoints: submission.totalPoints,
        finishTime: submission.finishTime,
        questionPoints: submission.questions.reduce((acc, q) => {
          acc[q.questionId] = q.points;
          return acc;
        }, {}),
        rating: user ? user.rating : 0, // Use the user's current rating or 0 if not found
        newRating: submission.newRating,
        ratingChange: submission.ratingChange
      };
    }));

    res.json({
      rankings,
      currentPage: Number(page),
      totalPages: Math.ceil(totalSubmissions / limit),
      totalSubmissions
    });
  } catch (error) {
    console.error('Error fetching contest rankings:', error);
    res.status(500).json({ message: 'Error fetching rankings' });
  }
});

app.get('/api/users/:userHandle/profile', async (req, res) => {
  try {
    const { userHandle } = req.params;
    const userSubmissions = await ContestSubmission.find({ userHandle }).sort({ submittedAt: -1 }).limit(10);
    
    const profile = {
      userHandle,
      totalContests: userSubmissions.length,
      averageRanking: calculateAverageRanking(userSubmissions),
      recentContests: userSubmissions.map(submission => ({
        contestId: submission.contestId,
        contestName: submission.contestName,
        rank: submission.rank,
        points: submission.totalPoints
      }))
    };
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

function calculateAverageRanking(submissions) {
  // Implement your logic to calculate average ranking
}

// Add this new endpoint to fetch user profile data
app.get('/api/user/profile/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let codeforcesRating = null;
    if (user.codeforcesId) {
      try {
        const cfResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${user.codeforcesId}`);
        if (cfResponse.data.status === 'OK' && cfResponse.data.result.length > 0) {
          codeforcesRating = cfResponse.data.result[0].rating;
        }
      } catch (error) {
        console.error('Error fetching Codeforces data:', error);
      }
    }

    res.json({
      ...user.toObject(),
      codeforcesRating
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Appending extension
  }
});

const upload = multer({ storage: storage });

// Update the profile update endpoint
app.put('/api/user/profile/:email', upload.single('profileImage'), async (req, res) => {
  try {
    const { email } = req.params;
    const { location, college, whatsappNumber, linkedinUrl } = req.body;
    
    console.log('Updating profile for:', email);
    console.log('Request body:', req.body);
    
    let updateData = {
      location,
      college,
      whatsappNumber,
      linkedinUrl
    };

    if (req.file) {
      updateData.profile_pic = '/uploads/' + req.file.filename;
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    console.log('Update data:', updateData);

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('Updated user:', updatedUser);

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('joinContest', (contestName) => {
    socket.join(contestName);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/api/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/friends/request/:userId/:friendId', async (req, res) => {
  const { userId, friendId } = req.params;
  console.log(`Sending friend request from ${userId} to ${friendId}`);

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.friendRequests.includes(friendId) || friend.friendRequests.includes(userId)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    friend.friendRequests.push(userId);
    await friend.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const tempOTPSchema = new mongoose.Schema({
    email: String,
    otp: String,
    otpExpires: Date
});

const TempOTP = mongoose.model('TempOTP', tempOTPSchema);

// Add this new endpoint to check if a user has submitted a contest
app.get('/api/contests/:contestId/check-submission', async (req, res) => {
  try {
    const { contestId } = req.params;
    const { userHandle } = req.query;

    const submission = await ContestSubmission.findOne({ contestId, userHandle });

    res.json({ hasSubmitted: !!submission });
  } catch (error) {
    console.error('Error checking contest submission:', error);
    res.status(500).json({ message: 'Error checking contest submission' });
  }
});

app.get('/api/contests/:contestCode/questions', async (req, res) => {
  try {
    const { contestCode } = req.params;
    const contest = await Contest.findOne({ contestCode });
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    res.json(contest.questions || []);
  } catch (error) {
    console.error('Error fetching contest questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
