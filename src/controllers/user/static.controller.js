export const getContactUs = (req, res) => {
  res.render('contact-us', {
    title: 'Contact Us',
    activePage: 'Contact'
  });
};

export const getAboutUs = (req, res) => {
  res.render('about-us', {
    title: 'About Us',
    activePage: 'About'
  });
};

export const getPrivacyPolicy = (req, res) => {
  res.render('privacy-policy', {
    title: 'Privacy Policy',
    activePage: 'Privacy'
  });
};

export const getTermsAndConditions = (req, res) => {
  res.render('terms-and-conditions', {
    title: 'Term & Conditions',
    activePage: 'Terms & Conditions'
  });
};
