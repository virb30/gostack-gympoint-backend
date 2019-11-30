import { Op } from 'sequelize';
import { subDays } from 'date-fns';

import Checkin from '../models/Checkin';
import Student from '../models/Student';
import Registration from '../models/Registration';

class CheckinController {
  async index(req, res) {
    const { studentId } = req.params;
    const { page = 1, per_page = 20 } = req.query;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(401).json({ error: 'Estudante não encontrado' });
    }

    const checkins = await Checkin.findAll({
      where: {
        student_id: studentId,
      },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'createdAt'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
      limit: per_page,
      offset: (page - 1) * per_page,
    });

    return res.json(checkins);
  }

  async store(req, res) {
    const { studentId } = req.params;

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
      return res.status(401).json({ error: 'Sua Matrícula não está ativa' });
    }

    const checkinCount = await Checkin.count({
      where: {
        student_id: studentId,
        created_at: {
          [Op.gte]: subDays(new Date(), 7),
        },
      },
    });

    if (checkinCount >= 5) {
      return res.status(401).json({ error: 'Limite de checkins atingido' });
    }

    const checkin = await Checkin.create({
      student_id: studentId,
    });

    return res.json({
      id: checkin.id,
      createdAt: checkin.createdAt,
      student: {
        id: student.id,
        name: student.name,
      },
    });
  }
}

export default new CheckinController();
