
router.get(
  "/referral/:userId",
  auth(USER_TYPE.ADMIN),
  validate(getUserReferralsValidator),
  referralController.getUserReferrals,
);

router.get(
  "/referral/:userId/:codeId",
  auth(USER_TYPE.ADMIN),
  validate(getReferralByIdValidator),
  referralController.getReferralById
);
