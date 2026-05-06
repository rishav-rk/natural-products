import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { formatUser } from "../../utils/formatResponse.js";
import { catchAsync } from "../../utils/universalFunctions.js";
import * as profileService from "../../services/user/profile.service.js";

export const getProfile = catchAsync(async (req, res) => {
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    formatUser(req.token.user),
  );
});

export const updateProfile = catchAsync(async (req, res) => {
  const user = await profileService.updateProfile(req.body, req.token);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    formatUser(user),
  );
});

export const changePassword = catchAsync(async (req, res) => {
  await profileService.changePassword(req.body, req.token);
  return successResponse(
    res,
    res,
    STATUS_CODES.ACTION_COMPLETE,
    SUCCESS_MESSAGES.SUCCESS,
  );
});

export const deleteAccount = catchAsync(async (req, res) => {
  await profileService.deleteAccount(req.token);
  return successResponse(
    res,
    res,
    STATUS_CODES.ACTION_COMPLETE,
    SUCCESS_MESSAGES.SUCCESS,
  );
});

// implement this
export const updateAddress = catchAsync(async (req, res) => {
  const addresses = await profileService.updateAddress(
    req.body,
    req.params.addressId,
    req.token,
  );
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { addresses },
  );
});

export const addAddress = catchAsync(async (req, res) => {
  const addressData = req.body;
  addressData.location = {
    type: "Point",
    coordinates: [addressData.longitude, addressData.latitude],
  };
  delete addressData.latitude;
  delete addressData.longitude;

  const address = await profileService.addAddress(addressData, req.token);
  return successResponse(
    res,
    res,
    STATUS_CODES.CREATED,
    SUCCESS_MESSAGES.SUCCESS,
    { address },
  );
});

export const deleteAddress = catchAsync(async (req, res) => {
  await profileService.deleteAddress(req.body.addressId, req.token);
  return successResponse(
    res,
    res,
    STATUS_CODES.ACTION_COMPLETE,
    SUCCESS_MESSAGES.SUCCESS,
  );
});


export const addToCart = catchAsync(async (req, res) => {
  const cart = await profileService.addToCart(req.body, req.token);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    cart,
  );
});

export const getCart = catchAsync(async (req, res) => {
  const cart = await profileService.getCart(req.token);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    cart,
  );
});

export const updateCart = catchAsync(async (req, res) => {
  await profileService.updateCart(req.body, req.token);
  return successResponse(
    req,
    res,
    STATUS_CODES.ACTION_COMPLETE,
    SUCCESS_MESSAGES.SUCCESS,
  );
});

export const deleteFromCart = catchAsync(async (req, res) => {
  const cart = await profileService.deleteFromCart(
    req.params.productId,
    req.token,
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    cart,
  );
});

export const  clearCart = catchAsync(async (req, res) => {
  const result = await profileService.clearCart(req.token);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    result,
  );
});
