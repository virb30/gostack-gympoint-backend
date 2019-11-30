import * as Yup from 'yup';

import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const { page = 1, per_page = 20 } = req.query;

    const total = await Plan.count();

    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'price', 'duration'],
      limit: Number(per_page) === 0 ? total : per_page,
      offset: (page - 1) * per_page,
    });

    const num_pages = Number(per_page) === 0 ? 1 : Math.ceil(total / per_page);

    return res.json({ plans, num_pages });
  }

  async destroy(req, res) {
    const plan = await Plan.findByPk(req.params.planId);

    if (!plan) {
      return res.status(401).json({ error: 'Plan does not exists' });
    }

    await plan.destroy();

    return res.status(204).json();
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const plan = await Plan.findByPk(req.params.planId);

    if (!plan) {
      return res.status(401).json({ error: 'Plan does not exists' });
    }

    const { id, title, duration, price } = await plan.update(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const plan = await Plan.create(req.body);

    return res.json(plan);
  }

  async show(req, res) {
    const plan = await Plan.findByPk(req.params.planId);

    if (!plan) {
      return res.status(401).json({ error: 'Plan does not exists' });
    }

    return res.status(200).json(plan);
  }
}

export default new PlanController();
