import * as Yup from 'yup';
import { Op } from 'sequelize';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Registration from '../models/Registration';

class HelpOrderController {
  async index(req, res) {
    const { studentId } = req.params;
    const { page = 1, per_page = 5 } = req.query;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(401).json({ error: 'Student does not exists' });
    }

    const registration = await Registration.findOne({
      where: {
        end_date: {
          [Op.gte]: new Date(),
        },
        student_id: studentId,
      },
    });

    if (!registration) {
      return res
        .status(401)
        .json({ error: 'Student registration is not active' });
    }

    const total = await HelpOrder.count({
      where: {
        student_id: studentId,
      },
    });

    const helpOrders = await HelpOrder.findAll({
      where: {
        student_id: studentId,
      },
      attributes: ['id', 'question', 'answer', 'answer_at'],
      order: [['created_at', 'DESC']],
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
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { studentId } = req.params;
    const { question } = req.body;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(401).json({ error: 'Student does not exists' });
    }

    const registration = await Registration.findOne({
      where: {
        end_date: {
          [Op.gte]: new Date(),
        },
        student_id: studentId,
      },
    });

    if (!registration) {
      return res
        .status(401)
        .json({ error: 'Student registration is not active' });
    }

    const helpOrder = await HelpOrder.create({
      student_id: studentId,
      question,
    });

    return res.json(helpOrder);
  }
}

export default new HelpOrderController();
