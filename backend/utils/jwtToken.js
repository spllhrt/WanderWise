
const sendToken = (user, statusCode, res) => {
  
    const token = user.getJwtToken();

    const options = {
        httpOnly: true,  
        secure: process.env.NODE_ENV === 'production',  
        sameSite: 'None', 
        maxAge: 1000 * 60 * 60 * 24 * 100  
    };

  
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user
    });
};

module.exports = sendToken;
