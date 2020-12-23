const express = require('express');
const app = require('../server');
const apiRouter = express.Router();

const employeesRouter = require('./employees');
const menusRouter = require('./menus');

apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menus', menusRouter);

module.exports = apiRouter;