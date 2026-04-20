import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import config from "./config.js";
import { TOKEN_TYPE, USER_TYPE } from "./appConstants.js";
import { AuthFailedError } from "../utils/errors.js";
import { Token } from "../models/index.js";

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    let token = {};
    if (payload.role === USER_TYPE.CUSTOMER) {
      token = await Token.findOne({ _id: payload.id, isDeleted: false })
        .populate("customer", "image name email mobileNumber countryCode")
        .lean();
    } else if (payload.role === USER_TYPE.COMPANY) {
      token = await Token.findOne({ _id: payload.id, isDeleted: false })
        .populate({ path: "company", select: { faqs: 0 } })
        .lean();
    } else {
      token = await Token.findOne({ _id: payload.id, isDeleted: false })
        .populate("admin", "email")
        .lean();
    }
    done(null, token);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

export { jwtStrategy };
