import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEnvelope, faBell, faCog, faUser,faMapMarkerAlt, faBriefcase, faImage, faPaperclip, faFileAudio, faUserPlus, faSignOutAlt, faChevronDown, faThumbsUp, faComment, faShare } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';
import moment from 'moment';
import './Socialize.css';
import { logout } from '../../actions/authActions'; // Adjust the path if necessary

const Socialize = () => {
  const [receivedRequests, setReceivedRequests] = useState([]);
const [requestStatus, setRequestStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [post, setPost] = useState('');
  const [posts, setPosts] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [friendsdropdownopen, setfriendsdropdown]=useState(false);
  const [comment, setComment] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation
  
const handleIconClick = () => {
  navigate('/chat', { state: { currentUser: user } });
};

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/posts/all', {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/all', {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        const filteredUsers = response.data
          .filter(u => u._id !== user._id)
          .slice(0, 5);
        setUsers(filteredUsers);
        setFilteredUsers(filteredUsers);
    
        // Fetch sent friend requests
        const requestsResponse = await axios.get('http://localhost:5000/api/friendRequests/sent', {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setSentRequests(requestsResponse.data.map(req => req.receiver.toString()));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchPosts();
    fetchUsers();
    fetchReceivedRequests();
  }, [user._id]);

  const fetchReceivedRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/friendRequests/', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
  
      // Ensure that receivedRequests and sentRequests are always arrays
      if (Array.isArray(response.data.receivedRequests)) {
        setReceivedRequests(response.data.receivedRequests);
      } else {
        console.error('Received requests data is not an array:', response.data.receivedRequests);
        setReceivedRequests([]);
      }
  
      if (Array.isArray(response.data.sentRequests)) {
        setSentRequests(response.data.sentRequests.map(req => req.receiver.toString()));
      } else {
        console.error('Sent requests data is not an array:', response.data.sentRequests);
        setSentRequests([]);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      setReceivedRequests([]);
      setSentRequests([]);
    }
  };
  

  
  const acceptFriendRequest = async (requestId) => {
    try {
      await axios.patch(`http://localhost:5000/api/friendRequests/accept/${requestId}`, {}, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      fetchReceivedRequests(); // Refresh received requests
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };
  
  const rejectFriendRequest = async (requestId) => {
    try {
      await axios.patch(`http://localhost:5000/api/friendRequests/reject/${requestId}`, {}, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      fetchReceivedRequests(); // Refresh received requests
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };
  

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value.trim()) {
      setFilteredUsers(users.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(event.target.value.toLowerCase())
      ));
    } else {
      setFilteredUsers([]);
    }
  };

  const handlePostChange = (event) => {
    setPost(event.target.value);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  const Dropdown = () => {
    setfriendsdropdown(!friendsdropdownopen);
  };

  const handleSignOut = () => {
    dispatch(logout()); // Dispatch the logout action
    navigate('/signin'); // Redirect to the sign-in page
  };
  const sendFriendRequest = async (receiverId) => {
    try {
      await axios.post('http://localhost:5000/api/friendRequests/send', 
        { receiverId },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      // Optionally, update the UI to reflect the sent request
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };
  
  const handlePostSubmit = async () => {
    if (post.trim()) {
      try {
        const response = await axios.post('http://localhost:5000/api/posts/create', 
          {
            message: post,
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email,
            picturePath: user?.picturePath
          },
          { headers: { 'x-auth-token': localStorage.getItem('token') } }
        );
        setPosts([...posts, response.data]);
        setPost('');
      } catch (error) {
        console.error('Error creating post:', error);
      }
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/posts/like/${postId}`, {}, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setPosts(posts.map(post => post._id === postId ? response.data : post));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleCommentSubmit = async (postId) => {
    if (comment.trim()) {
      try {
        const response = await axios.post(`http://localhost:5000/api/posts/comment/${postId}`, 
          {
            userId: user?._id,
            text: comment
          },
          { headers: { 'x-auth-token': localStorage.getItem('token') } }
        );
        setPosts(posts.map(post => post._id === postId ? response.data : post));
        setComment('');
      } catch (error) {
        console.error('Error commenting on post:', error);
      }
    }
  };

  const handleShare = async (postId) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/posts/share/${postId}`, {}, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setPosts(posts.map(post => post._id === postId ? response.data : post));
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  return (
    <div id="outer-social">
      <div id="top-social">
        <h1>Socialize</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            id="search-bar"
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          {searchTerm && filteredUsers.length > 0 && (
            <div className="search-dropdown">
              {filteredUsers.map((user) => (
                <div key={user._id} className="search-result">
                  <img src={user.picturePath ? `http://localhost:5000/${user.picturePath}` : '/default-profile.png'} alt="Profile" className="search-image" />
                  <span>{user.firstName} {user.lastName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="icon-container">
       
        <FontAwesomeIcon
            icon={faEnvelope}
            className="top-icon"
            onClick={handleIconClick} // Handle click event
            style={{ cursor: 'pointer' }} // Make the icon look clickable
          />
                    <FontAwesomeIcon icon={faBell} className="top-icon" />
          <div className="user-dropdown">
  <span className="user-name" onClick={Dropdown}>
    <FontAwesomeIcon icon={faUser} />
  </span>
  {friendsdropdownopen && (
    <div className="dropdown-menu">
      <h3>Friend Requests</h3>
      {receivedRequests.length === 0 ? (
        <p>No new requests</p>
      ) : (
        receivedRequests.map(req => (
          <div key={req._id} className="friend-request-item">
            <img src={req.sender.picturePath ? `http://localhost:5000/${req.sender.picturePath}` : '/default-profile.png'} alt="Profile" className="friend-request-image" />
            <span>{req.sender.firstName} {req.sender.lastName}</span>
            <button onClick={() => acceptFriendRequest(req._id)} className="accept-button">Accept</button>
            <button onClick={() => rejectFriendRequest(req._id)} className="reject-button">Reject</button>
          </div>
        ))
  
      )}
    </div>
  )}
</div>


          <div className="user-dropdown">
            <span className="user-name" onClick={toggleDropdown}>
              {user?.firstName}
              <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
            </span>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={handleSignOut} className="signout-button">
                  <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
                </button>
                <button onClick={handleSignOut} className="signout-button">
                <FontAwesomeIcon icon={faCog} />Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div id="mid-social">
        <div className="profile-card">
          <img src={user?.picturePath ? `http://localhost:5000/${user.picturePath}` : '/default-profile.png'} alt="Profile" className="profile-image" />
          <h2>{user?.firstName} {user?.lastName}</h2>
          <p>{user?.friends?.length} friends</p>
          <div className="location">
            <FontAwesomeIcon icon={faMapMarkerAlt} /> {user?.location}
          </div>
          <div className="job-title">
            <FontAwesomeIcon icon={faBriefcase} /> {user?.occupation}
          </div>
          <div className="social-profiles">
            <div className="social-profile">
              <FontAwesomeIcon icon={faTwitter} /> Twitter
            </div>
            <div className="social-profile">
              <FontAwesomeIcon icon={faLinkedin} /> LinkedIn
            </div>
          </div>
        </div>
        <div className='post'>
          <div className='postMessage'>
            <div className='message'>
              <img src={user?.picturePath ? `http://localhost:5000/${user.picturePath}` : '/default-profile.png'} alt="Profile" className="post-image" />
              <input
                type="text"
                placeholder="What's on your mind..."
                value={post}
                onChange={handlePostChange}
                id="add-post"
              />
            </div>
            <div className='post-icons'>
              <div className='icon-container'>
                <FontAwesomeIcon icon={faImage} className="post-icon" />
                <FontAwesomeIcon icon={faPaperclip} className="post-icon" />
                <FontAwesomeIcon icon={faFileAudio} className="post-icon" />
              </div>
              <button className="post-button" onClick={handlePostSubmit}>Post</button>
            </div>
          </div>
          <div className='posts-list'>
            {posts.map((post, index) => (
              <div key={index} className='post-item'>
                {post.picturePath && <img src={`http://localhost:5000/${post.picturePath}`} alt="Post" className="post-image" />}
                <div className='post-content'>
                  <div className='post-header'>
                    <strong>{post.firstName} {post.lastName}</strong>
                    <span className="post-time">{moment(post.date).fromNow()}</span>
                  </div>
                  <p className='post-text'>{post.message}</p>
                  <div className='post-actions'>
                    <button onClick={() => handleLike(post._id)} className='action-button'>
                      <FontAwesomeIcon icon={faThumbsUp} /> {post.likes.length}
                    </button>
                    <button onClick={() => handleShare(post._id)} className='action-button'>
                      <FontAwesomeIcon icon={faShare} /> {post.shares}
                    </button>
                  </div>
                  <div className='comments-section'>
                    {post.comments.map((comment, index) => (
                      <div key={index} className='post-item'>
                      {comment.userId.picturePath && <img src={`http://localhost:5000/${comment.userId.picturePath}`} alt="Post" className="search-image"  />}
                      <div className='post-content'>
                      <div className='post-header'>
                        <strong>{comment.userId.firstName} {comment.userId.lastName}</strong>
                        <span className="post-time">{moment(comment.date).fromNow()}</span>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                      </div>

                    ))}
                    <input
                      type="text"
                      
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={handleCommentChange}
                      className='comment-input'
                    />
                    <button onClick={() => handleCommentSubmit(post._id)} className='comment-button'>Comment</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='add-list'>
          <h2>People you may know</h2>
          {users.map((user) => (
            <div key={user._id} className='add'>
              <img src={user.picturePath ? `http://localhost:5000/${user.picturePath}` : '/default-profile.png'} alt="Profile" className="add-image" />
              <div className="add-info">
                <h3>{user.firstName} {user.lastName}</h3>
                <p>{user.location || 'No location'}</p>
              </div>
              <FontAwesomeIcon 
  icon={faUserPlus} 
  className="add-icon" 
  onClick={() => sendFriendRequest(user._id)} 
/>            </div>
            
          ))}
        </div>
      </div>
    </div>
  );
}

export default Socialize;
