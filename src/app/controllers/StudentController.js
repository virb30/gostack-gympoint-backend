import * as Yup from 'yup';
import { Op } from 'sequelize';

import Student from '../models/Student';

class StudentController {
  async index(req, res) {
    const { q } = req.query;
    const { page = 1, per_page = 20 } = req.query;

    const where = q ? { name: { [Op.iLike]: `%${q}%` } } : null;

    const total = await Student.count({ where });

    const students = await Student.findAll({
      where,
      attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
      limit: Number(per_page) === 0 ? total : per_page,
      offset: (page - 1) * per_page,
    });

    const num_pages = Number(per_page) === 0 ? 1 : Math.ceil(total / per_page);

    return res.json({ students, num_pages });
  }

  async show(req, res) {
    const student = await Student.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
    });

    if (!student) {
      return res.json(400).json({ error: 'Student not found' });
    }

    return res.json(student);
  }

  async destroy(req, res) {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.json(400).json({ error: 'Student not found' });
    }

    await student.destroy();

    return res.status(204).json();
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .required()
        .moreThan(14)
        .positive(),
      weight: Yup.number()
        .required()
        .positive(),
      height: Yup.number()
        .required()
        .positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists' });
    }

    const { id, name, email, age, weight, height } = await Student.create(
      req.body
    );

    return res.json({
      id,
      name,
      email,
      age,
      weight,
      height,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number()
        .moreThan(14)
        .positive(),
      weight: Yup.number().positive(),
      height: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.json(400).json({ error: 'Student not found' });
    }

    const { id, name, email, age, weight, height } = await student.update(
      req.body
    );

    return res.json({
      id,
      name,
      email,
      age,
      weight,
      height,
    });
  }
}

export default new StudentController();
