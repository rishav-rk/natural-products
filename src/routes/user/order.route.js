import {Router} from "express"
import {USER_TYPE} from "../../config/appConstants.js"
const router = Router()

router.post('/create-order', auth(USER_TYPE.USER), validate())