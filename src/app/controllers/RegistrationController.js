import * as Yup from 'yup';
import { addMonths, parseISO, format } from 'date-fns';

import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';

import Mail from '../../lib/Mail';

class RegistrationController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const registrations = await Registration.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(registrations);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      plan_id: Yup.number(),
      student_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { registrationId } = req.params;
    const { student_id, start_date, plan_id } = req.body;

    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(401).json({ error: 'Plan does not exists' });
    }

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(401).json({ error: 'Student does not exists' });
    }

    const registration = await Registration.findByPk(registrationId);
    if (!registration) {
      return res.status(401).json({ error: 'Registration does not exists' });
    }

    const { id, end_date, price } = await registration.update({
      start_date,
      plan_id,
      student_id,
      end_date: addMonths(parseISO(start_date), plan.duration),
      price: plan.duration * plan.price,
    });

    return res.json({
      id,
      start_date,
      plan_id,
      student_id,
      end_date,
      price,
    });
  }

  async destroy(req, res) {
    const { registrationId } = req.params;

    const registration = await Registration.findByPk(registrationId);
    if (!registration) {
      return res.status(401).json({ error: 'Registration not found' });
    }

    await registration.destroy();

    return res.status(204).json();
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    /**
     * Check if plan exists
     */
    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(401).json({ error: 'Plan does not exists' });
    }

    /**
     * Check if student exists
     */

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(401).json({ error: 'Student does not exists' });
    }

    const registration = await Registration.create({
      student_id,
      plan_id,
      start_date: parseISO(start_date),
      end_date: addMonths(parseISO(start_date), plan.duration),
      price: plan.price * plan.duration,
    });

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Confirmação de matrícula',
      template: 'registration',
      context: {
        student: student.name,
        plan: plan.title,
        start_date: format(registration.start_date, 'dd/MM/yyyy'),
        end_date: format(registration.end_date, 'dd/MM/yyyy'),
        price: registration.price.toFixed(2),
        monthlyPrice: plan.price.toFixed(2),
      },
    });

    return res.json(registration);
  }

  async show(req, res) {
    const { registrationId } = req.params;

    const registration = await Registration.findByPk(registrationId, {
      attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!registration) {
      return res.status(401).json({ error: 'Registration does not exists' });
    }

    return res.status(200).json(registration);
  }
}

export default new RegistrationController();
