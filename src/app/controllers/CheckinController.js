import { Op } from 'sequelize';
import { subDays } from 'date-fns';

import Checkin from '../models/Checkin';
import Student from '../models/Student';
import Registration from '../models/Registration';

class CheckinController {
  async index(req, res) {
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(401).json({ error: 'Student does not exists' });
    }

    const checkins = await Checkin.findAll({
      where: {
        student_id: studentId,
      },
      attributes: ['id', 'createdAt'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
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
      return res
        .status(401)
        .json({ error: 'Student registration is not active' });
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
      return res
        .status(401)
        .json({ error: 'Maximum checkins on past 7 days reached' });
    }

    const checkin = await Checkin.create({
      student_id: studentId,
    });

    return res.json(checkin);
  }
}

export default new CheckinController();
