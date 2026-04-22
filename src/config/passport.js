import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import config from "./config.js";
import { TOKEN_TYPE, USER_TYPE } from "./appConstants.js";
import { AuthFailedError } from "../utils/error.js";
import { Token } from "../models/index.js";

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    let token = {};
    if (payload.role === USER_TYPE.USER) {
      token = await Token.findOne({ _id: payload.id, isDeleted: false })
        .populate("user")
        .lean();
    } else {
      token = await Token.findOne({ _id: payload.id, isDeleted: false })
        .populate("admin")
        .lean();
    }
    done(null, token);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

export { jwtStrategy };
