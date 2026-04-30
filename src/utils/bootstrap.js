import bcrypt from "bcrypt";
import { Admin, ADC } from "../models/index.js";

const Run = async () => {
  /*-------------------------------------------------------------------------------
   * add admin
   * -----------------------------------------------------------------------------*/
  let adminDetails = {
    name: "Primary Admin",
    email: "nature@admin.com",
    password: await bcrypt.hash("Nature@123", 10),
  };

  let adminDetails2 = {
    name: "Secondary Admin",
    email: "se.admin.468@gmail.com",
    password: await bcrypt.hash("SeAdmin@046", 10),
  };

  let adminDetails3 = {
    name: "Super Admin", 
    email: "pr.admin.234@gmail.com",
    password: await bcrypt.hash("Nature@123", 10)
  }

  CreateAdmin(adminDetails);
  CreateAdmin(adminDetails2);
  CreateAdmin(adminDetails3)
};

const CreateAdmin = async (adminDetails) => {
  try {
    let adminData = await Admin.findOneAndUpdate(
      { email: adminDetails.email },
      adminDetails,
      { lean: true, upsert: true, returnDocument: "after" },
    );

    let constants = await ADC.findOne();

    if (!constants) {
      constants = await ADC.create({});
    }

    console.log("=================");

    return adminData;
  } catch (err) {
    console.log(
      "**********************************************************************",
      err,
    );
  }
};

export default Run;
