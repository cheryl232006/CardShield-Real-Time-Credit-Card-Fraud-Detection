function generateOTP() {

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    return otp.toString();
}


function isOTPExpired(expiryTime) {

    const currentTime = new Date();
    const expiry = new Date(expiryTime);

    return currentTime > expiry;
}


function isMaximumAttemptsReached(attempts) {

    return attempts >= 3;
}


module.exports = {
    generateOTP,
    isOTPExpired,
    isMaximumAttemptsReached
};