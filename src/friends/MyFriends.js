// MyFriends.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Badge,
  Box,
  Stack,
  AppBar,
  Tabs,
  Tab,
  Toolbar,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  Divider,
  Snackbar
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoIcon from '@mui/icons-material/Info';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from "./MyFriends.module.css";
import Navbar from '../profilepage/Navbar';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import CodeIcon from '@mui/icons-material/Code';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { motion, AnimatePresence } from 'framer-motion';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { styled } from "@mui/material/styles";
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SendIcon from '@mui/icons-material/Send';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';

// Custom styled Alert component
const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.primary.main}`,
  '& .MuiAlert-icon': {
    color: theme.palette.primary.main,
  },
  '& .MuiAlert-message': {
    color: theme.palette.text.primary,
    fontWeight: 500,
  },
  boxShadow: theme.shadows[2],
  padding: theme.spacing(2),
}));

const MyFriends = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [friendSuggestions, setFriendSuggestions] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [codeforcesRatings, setCodeforcesRatings] = useState({});
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.id) {
        fetchFriendRequests(parsedUser.id);
        fetchSentRequests(parsedUser.id);
        fetchFriends(parsedUser.id);
      } else {
        console.error('User ID is missing');
        fetchUserData(parsedUser.email);
      }
    }
  }, []);

  useEffect(() => {
    if (user && user.id && activeTab === 3) {
      fetchFriendSuggestions();
    }
  }, [user, activeTab, friends, friendRequests, sentRequests]);

  useEffect(() => {
    const fetchAllRatings = async () => {
      const allUsers = [...friends, ...friendRequests, ...sentRequests, ...friendSuggestions];
      const uniqueUsers = Array.from(new Set(allUsers.map(u => u.codeforcesId)))
        .map(codeforcesId => allUsers.find(u => u.codeforcesId === codeforcesId));
      
      const ratings = await fetchRatingsForUsers(uniqueUsers);
      setCodeforcesRatings(ratings);
    };

    fetchAllRatings();
  }, [friends, friendRequests, sentRequests, friendSuggestions]);

  const fetchFriendSuggestions = async () => {
    if (!user || !user.id) {
      console.error('User ID is missing in fetchFriendSuggestions');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://codecraft-contest1.onrender.com/api/friends/suggestions/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch friend suggestions');
      }
      const data = await response.json();
      console.log('Received friend suggestions:', data);

      // Filter out users who are already friends, have pending requests, or are in sent requests
      const filteredSuggestions = data.filter(suggestion => 
        !friends.some(friend => friend._id === suggestion._id) &&
        !friendRequests.some(request => request._id === suggestion._id) &&
        !sentRequests.some(sent => sent._id === suggestion._id)
      );

      setFriendSuggestions(filteredSuggestions);
    } catch (error) {
      console.error('Error fetching friend suggestions:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFriendRequests = async (userId) => {
    console.log(`Fetching friend requests for user ID: ${userId}`);
    try {
      const response = await fetch(`https://codecraft-contest1.onrender.com/api/friends/requests/${userId}`);
      if (response.ok) {
        const requests = await response.json();
        setFriendRequests(requests);
      } else {
        throw new Error('Failed to fetch friend requests');
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const fetchSentRequests = async (userId) => {
    console.log(`Fetching sent requests for user ID: ${userId}`);
    try {
      const response = await fetch(`https://codecraft-contest1.onrender.com/api/friends/sent-requests/${userId}`);
      if (response.ok) {
        const requests = await response.json();
        setSentRequests(requests);
      } else {
        throw new Error('Failed to fetch sent requests');
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const fetchFriends = async (userId) => {
    try {
      const response = await fetch(`https://codecraft-contest1.onrender.com/api/friends/${userId}`);
      if (response.ok) {
        const friendsList = await response.json();
        setFriends(friendsList);
        
        // Fetch Codeforces ratings for each friend
        const ratings = {};
        for (const friend of friendsList) {
          if (friend.codeforcesId) {
            const rating = await fetchCodeforcesRating(friend.codeforcesId);
            if (rating) {
              ratings[friend.codeforcesId] = rating;
            }
          }
        }
        setCodeforcesRatings(ratings);
      } else {
        throw new Error('Failed to fetch friends');
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchUserData = async (email) => {
    try {
      const response = await fetch(`https://codecraft-contest1.onrender.com/api/user/${email}`);
      if (response.ok) {
        const userData = await response.json();
        const updatedUser = { ...userData, id: userData._id };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        fetchFriendRequests(updatedUser.id);
        fetchSentRequests(updatedUser.id);
        fetchFriends(updatedUser.id);
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      navigate('/login');
    }
  };

  const fetchCodeforcesRating = async (codeforcesId) => {
    try {
      const response = await fetch(`https://codeforces.com/api/user.info?handles=${codeforcesId}`);
      const data = await response.json();
      if (data.status === 'OK' && data.result.length > 0) {
        return data.result[0].rating;
      }
    } catch (error) {
      console.error('Error fetching Codeforces rating:', error);
    }
    return null;
  };

  const fetchRatingsForUsers = async (users) => {
    const ratings = {};
    for (const user of users) {
      if (user.codeforcesId) {
        try {
          const rating = await fetchCodeforcesRating(user.codeforcesId);
          if (rating) {
            ratings[user.codeforcesId] = rating;
          }
        } catch (error) {
          console.error(`Error fetching rating for ${user.codeforcesId}:`, error);
        }
      }
    }
    return ratings;
  };

  // Replace all alert() calls with toast notifications
  const showNotification = (message, type = 'info') => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleAddFriend = async (friendId) => {
    try {
      const response = await fetch(`https://codecraft-contest1.onrender.com/api/friends/request/${user.id}/${friendId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to send friend request');
      }
      
      // Find the friend in the suggestions list
      const addedFriend = friendSuggestions.find(s => s._id === friendId);
      
      // Remove the added friend from suggestions
      setFriendSuggestions(prev => prev.filter(s => s._id !== friendId));
      
      // Add the friend to sent requests
      setSentRequests(prev => [...prev, addedFriend]);
      
      showNotification('Friend request sent successfully', 'success');
    } catch (error) {
      console.error('Error sending friend request:', error);
      showNotification('Failed to send friend request', 'error');
    }
  };

  const handleAcceptRequest = async (friendId) => {
    try {
      const response = await fetch('https://codecraft-contest1.onrender.com/api/friends/accept-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendId })
      });
      if (response.ok) {
        showNotification('Friend request accepted', 'success');
        fetchFriendRequests(user.id);
        fetchFriends(user.id);
        fetchSentRequests(user.id);
        fetchFriendSuggestions();
      } else {
        throw new Error('Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      showNotification('Failed to accept friend request', 'error');
    }
  };

  const handleRejectRequest = async (friendId) => {
    try {
      const response = await fetch('https://codecraft-contest1.onrender.com/api/friends/reject-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendId })
      });
      if (response.ok) {
        showNotification('Friend request rejected', 'info');
        fetchFriendRequests(user.id);
        fetchFriendSuggestions();
      } else {
        throw new Error('Failed to reject friend request');
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      showNotification('Failed to reject friend request', 'error');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderAvatar = (friend) => {
    if (friend.profile_pic) {
      return (
        <Avatar
          src={`http://localhost:5000${friend.profile_pic}`}
          alt={friend.name}
          className={styles.avatar}
        />
      );
    } else {
      return (
        <Avatar
          src={`https://api.dicebear.com/6.x/initials/svg?seed=${friend.name}`}
          alt={friend.name}
          className={styles.avatar}
        />
      );
    }
  };

  const handleCancelRequest = async (friendId) => {
    try {
      const response = await fetch('https://codecraft-contest1.onrender.com/api/friends/cancel-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: user.id, receiverId: friendId })
      });
      if (response.ok) {
        showNotification('Friend request canceled successfully', 'info');
        // Remove the user from sent requests and add back to suggestions
        setSentRequests(prev => prev.filter(request => request._id !== friendId));
        fetchFriendSuggestions();
      } else {
        throw new Error('Failed to cancel friend request');
      }
    } catch (error) {
      console.error('Error canceling friend request:', error);
      showNotification('Failed to cancel friend request', 'error');
    }
  };

  const handleRemoveFriend = (friend) => {
    setFriendToRemove(friend);
    setConfirmDialogOpen(true);
  };

  const confirmRemoveFriend = async () => {
    try {
      const response = await fetch('https://codecraft-contest1.onrender.com/api/friends/remove-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendId: friendToRemove._id })
      });
      const data = await response.json();
      console.log('Remove friend response:', data);

      if (response.ok) {
        showNotification('Friend removed successfully', 'success');
        // Remove the friend from the friends list
        setFriends(prev => prev.filter(friend => friend._id !== friendToRemove._id));
        // Fetch updated friend suggestions
        fetchFriendSuggestions();
      } else {
        throw new Error(data.message || 'Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      showNotification('Failed to remove friend', 'error');
    } finally {
      setConfirmDialogOpen(false);
      setFriendToRemove(null);
    }
  };

  const cancelRemoveFriend = () => {
    setConfirmDialogOpen(false);
    setFriendToRemove(null);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filterUsers = (users) => {
    if (!searchTerm) return users;
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.codeforcesId && user.codeforcesId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const renderNoResultsMessage = () => {
    if (searchTerm) {
      switch (activeTab) {
        case 0: return "No friends found matching your search.";
        case 1: return "No friend requests found matching your search.";
        case 2: return "No sent requests found matching your search.";
        case 3: return "No friend suggestions found matching your search.";
        default: return "No results found.";
      }
    } else {
      switch (activeTab) {
        case 0: return "You don't have any friends yet. Start connecting!";
        case 1: return "You don't have any friend requests at the moment.";
        case 2: return "You haven't sent any friend requests. Why not reach out?";
        case 3: return "No friend suggestions available right now. Check back later!";
        default: return "No results found.";
      }
    }
  };

  const handleSocialClick = (platform, value) => {
    if (!value) {
      showNotification(`No ${platform} profile available`, 'info');
      return;
    }
    
    let url;
    switch (platform) {
      case 'linkedin':
        url = value.startsWith('http') ? value : `https://www.linkedin.com/in/${value}`;
        break;
      case 'whatsapp':
        const cleanNumber = value.replace(/\D/g, '');
        url = `https://wa.me/${cleanNumber}`;
        break;
      case 'codeforces':
        // Remove any existing 'https://codeforces.com/profile/' from the value
        const cleanValue = value.replace('https://codeforces.com/profile/', '');
        url = `https://codeforces.com/profile/${cleanValue}`;
        break;
      default:
        showNotification(`Unsupported platform: ${platform}`, 'error');
        return;
    }
    
    window.open(url, '_blank');
  };

  const renderFriendCard = (user, cardType) => (
    <Grid item xs={12} sm={6} md={4} key={user._id}>
      <Card className={styles.friendCard} variant="outlined">
        <CardContent>
          <Box className={styles.cardHeader}>
            {renderAvatar(user)}
            <Typography variant="h6" className={styles.name}>
              {user.name}
            </Typography>
            <Chip
              icon={<EmojiEventsIcon />}
              label={`Rating: ${codeforcesRatings[user.codeforcesId] || 'N/A'}`}
              className={styles.ratingChip}
              color="primary"
              variant="outlined"
            />
          </Box>
          <Divider className={styles.divider} />
          <Box className={styles.cardBody}>
            {user.codeforcesId && (
              <Tooltip title="Codeforces ID" arrow placement="top">
                <Chip
                  icon={<CodeIcon />}
                  label={user.codeforcesId}
                  className={styles.codeforcesChip}
                  variant="outlined"
                  onClick={() => handleSocialClick('codeforces', user.codeforcesId)}
                />
              </Tooltip>
            )}
            <Box className={styles.socialLinks}>
              <Tooltip title="LinkedIn" arrow>
                <IconButton 
                  className={styles.socialIcon}
                  onClick={() => handleSocialClick('linkedin', user.linkedinUrl)}
                >
                  <LinkedInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={cardType === 'friend' ? "WhatsApp" : "WhatsApp (Only for friends)"} arrow>
                <span>
                  <IconButton 
                    className={styles.socialIcon}
                    onClick={() => cardType === 'friend' && handleSocialClick('whatsapp', user.whatsappNumber)}
                    disabled={cardType !== 'friend'}
                  >
                    <WhatsAppIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Codeforces Profile" arrow>
                <IconButton 
                  className={styles.socialIcon}
                  onClick={() => handleSocialClick('codeforces', user.codeforcesId)}
                >
                  <img src="/codeforces.png" alt="Codeforces" width="24" height="24" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Divider className={styles.divider} />
          <Box className={styles.cardFooter}>
            {cardType === 'friend' && (
              <>
                <Typography variant="caption" className={styles.friendsSince}>
                  Friends since {new Date().toLocaleDateString()}
                </Typography>
                <Button 
                  color="error" 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<PersonRemoveIcon />}
                  onClick={() => handleRemoveFriend(user)}
                  className={styles.buttonOutlined}
                >
                  Remove Friend
                </Button>
              </>
            )}
            {cardType === 'request' && (
              <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                <Button color="primary" variant="contained" onClick={() => handleAcceptRequest(user._id)}>
                  Accept
                </Button>
                <Button color="error" variant="outlined" onClick={() => handleRejectRequest(user._id)}>
                  Reject
                </Button>
              </Stack>
            )}
            {cardType === 'sent' && (
              <Button 
                color="error" 
                variant="outlined" 
                fullWidth 
                onClick={() => handleCancelRequest(user._id)}
                className={styles.buttonOutlined}
              >
                Cancel Request
              </Button>
            )}
            {cardType === 'suggestion' && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleAddFriend(user._id)}
                fullWidth
              >
                Add Friend
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <div className={styles.myFriendsPage}>
      <Navbar/>
      <AppBar position="sticky" elevation={0} className={styles.appBar}>
        <Toolbar className={styles.toolbar}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="secondary"
            textColor="inherit"
            variant="fullWidth"
            className={styles.tabs}
          >
            <Tab 
              label="My Friends" 
              icon={<PeopleIcon />} 
              className={styles.tab}
            />
            <Tab 
              label={
                <Badge badgeContent={friendRequests.length} color="error" className={styles.badge}>
                  Friend Requests
                </Badge>
              } 
              icon={<PersonAddIcon />}
              className={styles.tab}
            />
            <Tab 
              label={
                <Badge badgeContent={sentRequests.length} color="primary" className={styles.badge}>
                  Sent Requests
                </Badge>
              } 
              icon={<SendIcon />}
              className={styles.tab}
            />
            <Tab 
              label="Friend Suggestions" 
              icon={<EmojiPeopleIcon />} 
              className={styles.tab}
            />
          </Tabs>
          {/* <Tooltip title="Logout" arrow>
            <IconButton onClick={handleLogout} edge="end" className={styles.logoutButton}>
              <LogoutIcon />
            </IconButton>
          </Tooltip> */}
        </Toolbar>
      </AppBar>
      <Container maxWidth={false}>
        <Box sx={{ mt: 3, mb: 3 }}> {/* Increased top and bottom margin */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search friends..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        {/* <Typography variant="h6" style={{ marginTop: '20px', marginBottom: '20px' }}>
          Welcome, {user?.name}!
        </Typography> */}
        {activeTab === 0 && (
          <Grid container spacing={3} mt={3}>
            {filterUsers(friends).map(friend => renderFriendCard(friend, 'friend'))}
            {filterUsers(friends).length === 0 && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<InfoIcon fontSize="inherit" />}>
                  {renderNoResultsMessage()}
                </Alert>
              </Grid>
            )}
          </Grid>
        )}
        {activeTab === 1 && (
          <Grid container spacing={3} mt={3}>
            {filterUsers(friendRequests).map(request => renderFriendCard(request, 'request'))}
            {filterUsers(friendRequests).length === 0 && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<InfoIcon fontSize="inherit" />}>
                  {renderNoResultsMessage()}
                </Alert>
              </Grid>
            )}
          </Grid>
        )}
        {activeTab === 2 && (
          <Grid container spacing={3} mt={3}>
            {filterUsers(sentRequests).map(request => renderFriendCard(request, 'sent'))}
            {filterUsers(sentRequests).length === 0 && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<InfoIcon fontSize="inherit" />}>
                  {renderNoResultsMessage()}
                </Alert>
              </Grid>
            )}
          </Grid>
        )}
        {activeTab === 3 && (
          <Grid container spacing={3} mt={3}>
            {filterUsers(friendSuggestions).map(suggestion => renderFriendCard(suggestion, 'suggestion'))}
            {filterUsers(friendSuggestions).length === 0 && (
              <Grid item xs={12}>
                <Typography>No friend suggestions available at the moment.</Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
      <Dialog
        open={confirmDialogOpen}
        onClose={cancelRemoveFriend}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Remove Friend"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove {friendToRemove?.name} from your friends list?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelRemoveFriend} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmRemoveFriend} color="error" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      <AnimatePresence>
        {popupOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <Snackbar
              open={popupOpen}
              autoHideDuration={3000}
              onClose={() => setPopupOpen(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert onClose={() => setPopupOpen(false)} severity="info" sx={{ width: '100%' }}>
                {popupMessage}
              </Alert>
            </Snackbar>
          </motion.div>
        )}
      </AnimatePresence>
      <ToastContainer />
    </div>
  );
};

export default MyFriends;
