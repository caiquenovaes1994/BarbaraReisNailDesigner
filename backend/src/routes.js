const express = require('express');
const router = express.Router();
const authenticate = require('./middleware/auth');
const {
  validateId,
  validateCustomer,
  validateProcedure,
  validateAppointment,
  validateAppointmentStatus,
} = require('./middleware/validator');

const CustomerController = require('./controllers/CustomerController');
const ProcedureController = require('./controllers/ProcedureController');
const AppointmentController = require('./controllers/AppointmentController');
const FinanceController = require('./controllers/FinanceController');
const NotificationController = require('./controllers/NotificationController');
const AuthController = require('./controllers/AuthController');

// Rotas públicas
router.post('/login', AuthController.login);
router.post('/auth/logout', AuthController.logout);

// Autenticação de rotas protegidas
router.use(authenticate);

router.get('/auth/me', AuthController.me);

router.get('/notifications', NotificationController.getNotifications);

router.get('/customers', CustomerController.getAll);
router.post('/customers', validateCustomer, CustomerController.create);
router.put('/customers/:id', validateId, validateCustomer, CustomerController.update);
router.delete('/customers/:id', validateId, CustomerController.delete);
router.get('/customers/:id/history', validateId, CustomerController.getHistory);

router.get('/procedures', ProcedureController.getAll);
router.post('/procedures', validateProcedure, ProcedureController.create);
router.put('/procedures/:id', validateId, validateProcedure, ProcedureController.update);
router.delete('/procedures/:id', validateId, ProcedureController.delete);

router.get('/appointments', AppointmentController.getAll);
router.post('/appointments', validateAppointment, AppointmentController.create);
router.patch('/appointments/:id/status', validateId, validateAppointmentStatus, AppointmentController.updateStatus);
router.patch('/appointments/:id/dismiss-notification', validateId, AppointmentController.dismissNotification);
router.put('/appointments/:id', validateId, validateAppointment, AppointmentController.update);
router.delete('/appointments/:id', validateId, AppointmentController.delete);

router.get('/finance/summary', FinanceController.getSummary);
router.get('/reports/birthdays', CustomerController.getBirthdaysReport);

module.exports = router;
