module.exports = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://call-a-bowl-fullstack-project-a6kp-client.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  };
  