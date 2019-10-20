import * as Yup from 'yup';
import { format } from 'date-fns';

import Mail from '../../lib/Mail';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class AnswerController {
  async index(req, res) {
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
    });

    return res.json(helpOrders);
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
}

export default new AnswerController();
