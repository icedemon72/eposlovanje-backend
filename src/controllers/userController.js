import { registerUser, getUser, loginUser, refreshAccessToken, logout, checkAccessToken, setSessionFalse, decodeAccess, countUsers, changeRole } from "../services/userService.js";
import 'dotenv';

export const handleUserRegister = async (req, res) => {
  try {
    const user = {
      ...req.body
    };

    const done = await registerUser(user);
    res.status(200).json(done);

  } catch (err) {
    return res.status(err.status || 500).send(err.message);
  }
}

export const handleLoginUser = async (req, res) => {
  try {
    const user = {
      ...req.body
    };

    const userAgent = req.headers['user-agent'];

    if (userAgent) {
      const session = await loginUser(user, userAgent);
      return res.status(200).json(session);
    }

    return res.status(401).send("User agent is required");

  } catch (err) {
    return res.status(err.status || 500).send(err.message);
  }
}

export const handleRefresh = async (req, res) => {
  try {
    const refreshToken = req.body.refresh_token;
    const userAgent = req.headers['user-agent'];

    if (!refreshToken) {
      return res.status(401).send("Refresh token is required");
    }

    if (userAgent) {
      const done = await refreshAccessToken(refreshToken, userAgent);
      return res.status(200).json(done);
    }

    return res.status(401).send("User agent is required");

  } catch (err) {
    return res.status(err.status || 500).send(err.message);
  }
}

export const handleLogout = async (req, res) => {
  try {
    const refreshToken = req.body.refresh_token;
    const userAgent = req.headers['user-agent'];

    if (!refreshToken) {
      return res.status(401).send("Niste ulogovani!");
    }

    if (userAgent) {
      const done = await logout(refreshToken, userAgent);
      return res.status(200).json(done);
    }

    return res.status(401).send("User agent is required");

  } catch (err) {
    return res.status(err.status || 500).send({ "message": err.message });
  }
}

export const handleGetUser = async (req, res) => {
  try {    
    if (!req.query.id) {
      req.query.id = 'all';
    }

    // if(req.userTokenData._id !== req.query.id && req.userTokenData !== 'Admin') {
    //   return res.status(401).send({message: 'Access not allowed!'});
    // }
    
    if (!req.query.limit) {
      req.query.limit = 25;
    }

    if(!req.query.page) {
      req.query.page = 1;
    }

    const done = await getUser(req.query.id, req.query.limit, req.query.page);
    return res.status(200).json(done);
  } catch (err) {
    return res.status(err.status || 500).send({ "message": err.message });
  }
}


/* Authentication and Authorization */
export const authenticateUser = async (req, res, next) => {
  try {
    /* TODO  FIX ERROR STATUS CODES, FINISH JWT SHIT PLSSSSS*/
    const bearerHeader = req.headers['authorization'];
    const method = req.method;
    const refreshToken = (method === 'POST') ? req.body.refresh_token : req.query.refresh_token;

    if (!bearerHeader) {
      return res.status(403).send({message: 'No access token!'});
    }

    let accessToken = bearerHeader.split(' ')[1];

    if (!accessToken) {
      return res.status(403).send({message: 'No access token!'});
    }
    /* CHANGE AND TEST THIS SHITEEE */
    const userAgent = req.headers['user-agent'];
    if (checkAccessToken(accessToken) === 0) {
      throw { 
        status: 403,
        message: 'Invalid access token...' 
      };
    }

    if (checkAccessToken(accessToken) === 2) {
      if (!refreshToken && method === 'POST') {
        return res.status(403).send({ message: 'Invalid refresh token!' });
      } else if(!refreshToken && method === 'GET') {
        return res.status(401).send({ message: 'Provide refresh token...' });
      }

      const resp = await refreshAccessToken(refreshToken, userAgent);
      if (!resp) {
        return res.status(500).send({ message: 'Internal server error' })
      }

      return res.status(401).send({ message: 'Correct refresh token provided, refreshing the access token...', access_token: resp.access_token });
    }

    req.userTokenData = decodeAccess(accessToken);
    next();
  } catch (err) {
    const refreshToken = req.body.refresh_token;
    const userAgent = req.headers['user-agent'];
    setSessionFalse(refreshToken, userAgent);
    return res.status(err.status || 500).send({ 'message': err.message });
  }

}

export const checkValidAccess = async (req, res) => {
  const bearerHeader = req.headers['authorization'];

  if (!req.userTokenData) {
    return res.status(403);
  }

  if (!bearerHeader) {
    return res.status(403);
  }

  let accessToken = bearerHeader.split(' ')[1];

  if (!accessToken) {
    return res.status(403);
  }

  if (checkAccessToken(accessToken) === 1) {
    return res.status(200).send({ message: 'All good!' });
  }

  return res.status(401).send({ message: 'Not authenticated...' });
}

export const authorizeUser = async (req, res, next) => {
  try {
    let data = req.userTokenData;

    if (data.role === 'Admin' || data.role === 'Moderator') {
      next();
    } else {
      res.status(403).send({ 'message': 'Access not allowed!' });
    }
  } catch (err) {
    return res.status(403).send({ 'message': 'Access not allowed!' });
  }
}

export const checkRole = async (req, res) => {
  try {
    const data = req.userTokenData;

    if(!req.userTokenData) {
      return res.status(403).send({ message: 'Niste ulogovani!' });
    }

    return res.status(200).send({ role: data.role });
  } catch (err) {
    return res.status(500).send({ message: 'Iternal server error!' });
  }
}

export const handleGetId = async (req, res) => {
  try {
    const data = req.userTokenData;

    if(!req.userTokenData) {
      return res.status(403).send({ message: 'Niste ulogovani!' });
    }
    
    return res.status(200).send({ user: data._id })

  } catch (err) {
    return res.status(500).send({ message: 'Iternal server error!' });
  }
}

export const handleCountUsers = async (req, res) => {
  try {
    const count = await countUsers();
    return res.status(200).json({count: count});
  } catch (err) {
    return res.status(500).send({message: 'Internal server error!'});
  }
}

export const handleRoleChange = async (req, res) => {
  try {
    const admin = req.userTokenData;
    if (admin.role !== 'Admin') {
      return res.status(401).send({message: 'Insufficient permissions!'});
    }

    const { user, role } = req.body;
    const done = await changeRole(user, role);
    return res.status(200).json(done);
    
  } catch (err) {
    return res.status(err.status || 500).send({message: err.message});
  }
}