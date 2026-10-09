const express = require('express');
const router = express.Router();
const authenticate = require('./middleware/auth');

const CustomerController = require('./controllers/CustomerController');
const ProcedureController = require('./controllers/ProcedureController');
const AppointmentController = require('./controllers/AppointmentController');
const FinanceController = require('./controllers/FinanceController');
const NotificationController = require('./controllers/NotificationController');
const AuthController = require('./controllers/AuthController');

// Rota pública
router.post('/login', AuthController.login);
router.post('/auth/logout', AuthController.logout);

// Protege todas as rotas abaixo com JWT
router.use(authenticate);

router.get('/auth/me', AuthController.me);

router.get('/notifications', NotificationController.getNotifications);

router.get('/customers', CustomerController.getAll);
router.post('/customers', CustomerController.create);
router.put('/customers/:id', CustomerController.update);
router.delete('/customers/:id', CustomerController.delete);
router.get('/customers/:id/history', CustomerController.getHistory);

router.get('/procedures', ProcedureController.getAll);
router.post('/procedures', ProcedureController.create);
router.put('/procedures/:id', ProcedureController.update);
router.delete('/procedures/:id', ProcedureController.delete);

router.get('/appointments', AppointmentController.getAll);
router.post('/appointments', AppointmentController.create);
router.patch('/appointments/:id/status', AppointmentController.updateStatus);
router.patch('/appointments/:id/dismiss-notification', AppointmentController.dismissNotification);
router.put('/appointments/:id', AppointmentController.update);
router.delete('/appointments/:id', AppointmentController.delete);

router.get('/finance/summary', FinanceController.getSummary);
router.get('/reports/birthdays', CustomerController.getBirthdaysReport);

module.exports = router;
