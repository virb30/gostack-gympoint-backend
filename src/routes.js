import { Router } from 'express';

import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import RegistrationController from './app/controllers/RegistrationController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';
import AnswerController from './app/controllers/AnswerController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);
routes.post('/students/:studentId/checkins', CheckinController.store);
routes.get('/students/:studentId/checkins', CheckinController.index);
routes.post('/students/:studentId/help-orders', HelpOrderController.store);
routes.get('/students/:studentId/help-orders', HelpOrderController.index);

routes.use(authMiddleware);

routes.get('/students', StudentController.index);
routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);
routes.get('/students/:id', StudentController.show);
routes.delete('/students/:id', StudentController.destroy);

routes.post('/plans', PlanController.store);
routes.get('/plans', PlanController.index);
routes.put('/plans/:planId', PlanController.update);
routes.delete('/plans/:planId', PlanController.destroy);
routes.get('/plans/:planId', PlanController.show);

routes.post('/registrations', RegistrationController.store);
routes.get('/registrations', RegistrationController.index);
routes.get('/registrations/:registrationId', RegistrationController.show);
routes.put('/registrations/:registrationId', RegistrationController.update);
routes.delete('/registrations/:registrationId', RegistrationController.destroy);

routes.get('/help-orders', AnswerController.index);
routes.get('/help-orders/:helpOrderId/answer', AnswerController.show);
routes.post('/help-orders/:helpOrderId/answer', AnswerController.store);

export default routes;
