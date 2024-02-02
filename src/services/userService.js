import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import 'dotenv';

/* Models */
import User from "../models/userModel.js";
import Session from "../models/sessionModel.js";

export const registerUser = async (user) => {
  try {
    user.role = "User";
    if (!validateEmail(user.email)) {
      throw {
        status: 401,
        message: 'Unet je nevalidan e-mail!'
      };
    }

    if (user.password.length <= 3) {
      throw {
        status: 401,
        message: 'Lozinka mora sadržati bar 3 karaktera!',
      };
    }

    const userExists = await User.findOne({ $or: [{ "email": user.email }, { "username": user.username }] });

    if (userExists) {
      throw {
        status: 401,
        message: 'Korisničko ime ili e-mail adresa već postoje!'
      };
    }

    user.password = await bcrypt.hash(user.password, 10);
    
    await User.create(user);
    return { "message": "Uspešna registracija!" };
  } catch (err) {
    throw err;
  }
}

export const loginUser = async (user, userAgent) => {
  try {
    const userObj = await User.findOne({ "email": user.email });

    if (!userObj) {
      throw {
        status: 401,
        message: 'Pogrešan unos e-adrese i/ili lozinke!'
      };
    }

    const isPasswordCorrect = await bcrypt.compare(user.password, userObj.password);

    if (!isPasswordCorrect) {
      throw {
        status: 401,
        message: 'Pogrešan unos e-adrese i/ili lozinke!'
      };
    }

    const sessionObj = await Session.findOne({ user: userObj._id, active: true, userAgent });

    if (sessionObj && user?.refreshToken) {
      throw {
        status: 400,
        message: 'Već ste ulogovani!'
      };
    }

    const dataInToken = {
      username: userObj.username,
      _id: userObj._id,
      role: userObj.role
    };

    const accessToken = jwt.sign(
      dataInToken,
      process.env.AUTH_ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { _id: userObj._id },
      process.env.AUTH_REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY });


    const session = {
      user: userObj._id,
      refreshToken: refreshToken,
      active: true,
      userAgent: userAgent
    }

    let newSession = new Session(session);
    await newSession.save();

    return {
      'access_token': accessToken,
      'refresh_token': refreshToken
    }

  } catch (err) {
    throw err;
  }
}

export const refreshAccessToken = async (refreshToken, userAgent) => {
  try {
    const session = await Session.findOne({ refreshToken, active: true, userAgent });

    if (!session) {
      throw {
        status: 401,
        message: 'Session has expired!'
      };
    }

    let id;

    jwt.verify(refreshToken, process.env.AUTH_REFRESH_TOKEN_SECRET, (err, userInfo) => {
      if (err) {
        throw {
          status: 403,
          message: 'Refresh token is invalid!'
        };
      }
      id = userInfo._id;
    });

    const user = await User.findById({ _id: id });

    if (!user) {
      throw {
        status: 403,
        message: 'Korisnik ne postoji!'
      };
    }

    const accessToken = jwt.sign(
      { username: user.username, _id: user._id, role: user.role },
      process.env.AUTH_ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY }
    );

    return { "access_token": accessToken };
  } catch (err) {
    throw err;
  }
}

export const getUser = async (id, limit = 0, page = 0) => {
  try {
    if (id !== 'all' && !mongoose.Types.ObjectId.isValid(id)) {
      throw {
        status: 400,
        message: `'${id}' nije ObjectID!`
      };
    }

    if (id === 'all' && limit === 0) {
      return await User.find().select('-password');
    } 
    
    if(id === 'all' && limit !== 0) {
      const toSkip = (Number(page) - 1) * limit;
      return await User.find().select('-password').limit(limit).skip(toSkip);
    }


    const user = await User.findById(id).select('-password');

    if (!user) {
      throw {
        status: 400,
        message: `Korisnik sa ID-em '${id}' ne postoji!`      
      };
    }

    return user;
  } catch (err) {
    throw err;
  }
}

/* Tokens */
export const checkRefreshToken = (refreshToken) => {
  return jwt.verify(refreshToken, process.env.AUTH_REFRESH_TOKEN_SECRET, (err) => {
    return err === null;
  });
}

export const checkAccessToken = (accessToken) => {
  return jwt.verify(accessToken, process.env.AUTH_ACCESS_TOKEN_SECRET, (err, info) => {
    if (err) {
      return (err.message === 'jwt expired') ? 2 : 0;
    }

    return 1; // 0 -> invalid; 1 -> 100% valid; 2 -> valid and expired
  });
}

export const setSessionFalse = async (refreshToken, userAgent) => {
  const session = await Session.findOne({ refreshToken, userAgent, active: true });

  if (session) {
    session.active = false;
    await session.save();
    return true;
  }

  return false;
}

export const logout = async (refreshToken, userAgent) => {
  try {
    if (!userAgent) {
      throw ('User agent is required!');
    }

    const session = await Session.findOne({ refreshToken, active: true, userAgent });

    if (!session) {
      throw {
        status: 401,
        message: 'Pogrešan refreshToken!'
      };
    }

    session.active = false;
    await session.save();

    return { 'message': 'Uspešno ste se izlogovali!' };
  } catch (err) {
    throw err;
  }
}

export const decodeAccess = (accessToken) => jwt.decode(accessToken, process.env.AUTH_ACCESS_TOKEN_SECRET);

export const countUsers = async () => {
  try {
    const numberOfUsers = await User.countDocuments({});
    return numberOfUsers;
  } catch (err) {
    throw new Error(err);
  }
}

export const changeRole = async (user, role) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(user)) {
      throw {
        status: 400,
        message: `'${user}' nije ObjectID!`
      };
    }

    if(role !== 'Moderator' && role !== 'User') {
      throw {
        status: 403,
        message: 'Nevalidna permisija!'
      };
    }
    const userObj = await User.updateOne({ _id: user }, { $set: { role: role } });

    return { message: `Permisija promenjena u ${role}`};
  } catch (err) {
    throw err;
  }
}

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
}