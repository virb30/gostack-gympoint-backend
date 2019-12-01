import * as Yup from 'yup';
import { format } from 'date-fns';

import Mail from '../../lib/Mail';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class AnswerController {
  async index(req, res) {
    const { page = 1, per_page = 5 } = req.query;
    const total = await HelpOrder.count({
      where: {
        answer: null,
      },
    });

    const helpOrders = await HelpOrder.findAll({
      where: {
        answer: null,
      },
      attributes: ['id', 'question', 'answer', 'answer_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
      limit: Number(per_page) === 0 ? total : per_page,
      offset: (page - 1) * per_page,
    });

    const num_pages = Number(per_page) === 0 ? 1 : Math.ceil(total / per_page);

    return res.json({ helpOrders, num_pages });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { helpOrderId } = req.params;
    const { answer } = req.body;

    const helpOrder = await HelpOrder.findByPk(helpOrderId, {
      attributes: ['id', 'question', 'answer', 'answer_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
    if (!helpOrder) {
      return res.status(401).json({ error: 'Help Order does not exists' });
    }

    await helpOrder.update({
      answer,
      answer_at: new Date(),
    });

    await Mail.sendMail({
      to: `${helpOrder.student.name} <${helpOrder.student.email}>`,
      subject: 'Seu pedido de ajuda foi respondido',
      template: 'answer',
      context: {
        student: helpOrder.student.name,
        question: helpOrder.question,
        answer: helpOrder.answer,
        answer_at: format(helpOrder.answer_at, 'dd/MM/yyyy HH:mm:ss'),
      },
    });

    return res.json(helpOrder);
  }

  async show(req, res) {
    const { helpOrderId } = req.params;

    const helpOrder = await HelpOrder.findByPk(helpOrderId, {
      attributes: ['id', 'question', 'answer', 'answer_at'],
    });

    if (!helpOrder) {
      return res.status(401).json({ error: 'Help Order does not exists' });
    }

    return res.status(200).json(helpOrder);
  }
}

export default new AnswerController();
