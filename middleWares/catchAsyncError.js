// This middleware wraps async functions to catch errors
exports.catchAsyncErrors = (fn) => (req, res, next) => {
    
    Promise.resolve(fn(req, res, next)).catch(next);
};
