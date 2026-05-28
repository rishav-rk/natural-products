import {Router} from "express"
import {validate} from "../../middlewares/validate.js"
import auth from "../../middlewares/auth.js"
import { USER_TYPE } from "../../config/appConstants.js"
import { updateConstants, getConstants } from "../../validators/admin/aCAndVideo.validator.js"
import * as constantsController from "../../controllers/admin/aCAndVideo.controller.js"

const router = Router()

router.put('/', auth(USER_TYPE.ADMIN), validate(updateConstants), constantsController.updateConstants)

export default router